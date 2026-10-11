"""
Practice router — adaptive, spaced-repetition practice sessions.

GET  /api/practice/session      → build a session targeting the weakest skills
POST /api/practice/session/submit → score it, update skills/XP/streak, reschedule
GET  /api/practice/schedule     → which skills are due for review
"""
from datetime import date, datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_session
from auth import get_current_user
from models import User, SkillReview, ActivityLog, PracticeSession
from practice_engine import (
    prioritise_skills,
    build_practice_set,
    sm2_schedule,
    quality_from_score,
)

router = APIRouter(prefix="/practice", tags=["practice"])


class SubmitRequest(BaseModel):
    sessionId: str = ""
    answers: List[int] = []          # index of chosen option, aligned to questions
    minutes: int = 0                 # how long the student spent, for activity log


async def _load_reviews(session: AsyncSession, user_id: str) -> dict:
    result = await session.execute(
        select(SkillReview).where(SkillReview.user_id == user_id)
    )
    return {r.skill: r for r in result.scalars().all()}


def _review_out(r) -> dict:
    return {
        "skill": r.skill,
        "ease": r.ease,
        "intervalDays": r.interval_days,
        "reps": r.reps,
        "lapses": r.lapses,
        "dueDate": r.due_date,
        "lastScore": r.last_score,
        "reviewedCount": r.reviewed_count,
    }


@router.get("/session")
async def get_practice_session(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Build a fresh adaptive session targeting the student's weakest skills."""
    skills = current_user.skills or {}
    reviews = await _load_reviews(session, current_user.id)
    career = current_user.target_career or "AI / ML Engineer"

    focus = prioritise_skills(
        skills,
        [_review_out(r) for r in reviews.values()],
        career,
        limit=3,
    )
    if not focus:
        raise HTTPException(400, "No practiceable skills yet — take an assessment first.")

    questions = build_practice_set(focus, per_skill=3)
    if not questions:
        raise HTTPException(404, "No questions available for your selected skills.")

    ps = PracticeSession(
        user_id=current_user.id,
        questions=questions,
        skill_focus=focus,
        status="in_progress",
    )
    session.add(ps)
    await session.commit()
    await session.refresh(ps)

    # Strip answers before sending to the client
    client_questions = [
        {
            "question": q["question"],
            "options": q["options"],
            "difficulty": q.get("difficulty", "medium"),
            "skill": q.get("skill"),
            "topic": q.get("topic"),
        }
        for q in questions
    ]

    return {
        "sessionId": str(ps.id),
        "questions": client_questions,
        "skillFocus": focus,
        "targetCareer": career,
        "dueSkills": [f["skill"] for f in focus],
    }


@router.post("/session/submit")
async def submit_practice_session(
    body: SubmitRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Score a session, update skills + XP + streak, and reschedule reviews."""
    result = await session.execute(
        select(PracticeSession).where(
            PracticeSession.id == body.sessionId,
            PracticeSession.user_id == current_user.id,
        )
    )
    ps = result.scalar_one_or_none()
    if not ps:
        raise HTTPException(404, "Practice session not found")
    if ps.status == "completed":
        raise HTTPException(400, "Session already submitted")

    questions = ps.questions or []
    answers = body.answers

    # ---- Score per question, grouped by skill --------------------------
    per_skill: dict = {}   # skill -> {correct, total}
    detailed = []
    for i, q in enumerate(questions):
        chosen = answers[i] if i < len(answers) else -1
        correct_idx = q.get("correctAnswer", -1)
        is_correct = chosen == correct_idx
        skill = q.get("skill") or q.get("topic")
        bucket = per_skill.setdefault(skill, {"correct": 0, "total": 0})
        bucket["total"] += 1
        if is_correct:
            bucket["correct"] += 1
        detailed.append({
            "question": q.get("question", ""),
            "options": q.get("options", []),
            "userAnswer": chosen,
            "correctAnswer": correct_idx,
            "isCorrect": is_correct,
            "skill": skill,
            "explanation": q.get("explanation", ""),
            "difficulty": q.get("difficulty", "medium"),
        })

    total = len(questions)
    correct_total = sum(1 for d in detailed if d["isCorrect"])
    percentage = round((correct_total / total) * 100) if total else 0
    xp_earned = round(percentage * 0.4 + correct_total * 8)

    # ---- Update skill scores (weighted 75/25 toward practice) ---------
    skills = dict(current_user.skills or {})
    skill_changes = []
    reviews = await _load_reviews(session, current_user.id)

    for skill, bucket in per_skill.items():
        if not skill:
            continue
        pct = round((bucket["correct"] / bucket["total"]) * 100) if bucket["total"] else 0
        before = skills.get(skill, 0)
        after = min(100, round(before * 0.75 + pct * 0.25))
        skills[skill] = after

        # ---- SM-2 reschedule ------------------------------------------
        review = reviews.get(skill)
        quality = quality_from_score(pct)
        if review is None:
            review = SkillReview(user_id=current_user.id, skill=skill)
            session.add(review)
            reviews[skill] = review
        ease, interval, reps, due = sm2_schedule(
            review.ease or 2.5, review.interval_days or 0, review.reps or 0, quality
        )
        review.ease = ease
        review.interval_days = interval
        review.reps = reps
        review.due_date = due
        review.last_score = pct
        review.reviewed_count = (review.reviewed_count or 0) + 1
        if quality < 3:
            review.lapses = (review.lapses or 0) + 1

        skill_changes.append({
            "skill": skill,
            "before": before,
            "after": after,
            "sessionScore": pct,
            "correct": bucket["correct"],
            "total": bucket["total"],
            "nextReview": due,
            "intervalDays": interval,
        })

    # ---- XP / level ---------------------------------------------------
    xp = (current_user.xp or 0) + xp_earned
    level = (xp // 500) + 1
    current_user.xp = xp
    current_user.level = level
    current_user.skills = skills

    ps.status = "completed"
    ps.score = correct_total
    ps.total = total
    ps.completed_at = datetime.utcnow()

    # ---- Activity log (drives real progress charts) -------------------
    session.add(ActivityLog(
        user_id=current_user.id,
        date=date.today().isoformat(),
        minutes=max(0, body.minutes),
        xp=xp_earned,
        kind="practice",
        detail=f"{correct_total}/{total} ({percentage}%)",
    ))

    await session.commit()

    return {
        "result": {
            "score": correct_total,
            "total": total,
            "percentage": percentage,
            "xpEarned": xp_earned,
            "level": level,
        },
        "detailedResults": detailed,
        "skillChanges": skill_changes,
        "streak": current_user.streak or 0,
    }


@router.get("/schedule")
async def get_practice_schedule(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Which skills are due for review, and how the spaced-repetition queue looks."""
    reviews = await _load_reviews(session, current_user.id)
    today = date.today()
    skills = current_user.skills or {}

    queue = []
    for skill, r in reviews.items():
        due = r.due_date
        if due:
            try:
                is_due = date.fromisoformat(due) <= today
            except (ValueError, TypeError):
                is_due = True
        else:
            is_due = True
        queue.append({
            **_review_out(r),
            "due": is_due,
            "currentScore": skills.get(skill, 0),
        })

    queue.sort(key=lambda x: (not x["due"], x["dueDate"] or ""))
    due_count = sum(1 for q in queue if q["due"])

    return {
        "dueCount": due_count,
        "totalScheduled": len(queue),
        "queue": queue,
        "untestedSkills": [s for s in skills if s not in reviews],
    }




