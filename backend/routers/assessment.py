from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_session
from auth import get_current_user
from ai_service import generate_questions, analyse_results, VALID_TOPICS
from brain import questions as brain_questions
from models import User, Assessment

router = APIRouter(prefix="/assessment", tags=["assessment"])


class GenerateRequest(BaseModel):
    topic: str
    questionCount: int = 5


class SubmitRequest(BaseModel):
    answers: List[int]


@router.get("/topics")
async def get_topics():
    return {"topics": VALID_TOPICS}


@router.post("/generate")
async def generate_assessment(
    body: GenerateRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if body.topic not in VALID_TOPICS:
        raise HTTPException(400, f"Invalid topic. Choose from: {', '.join(VALID_TOPICS)}")

    # Fresh, difficulty-calibrated questions from the LLM when configured;
    # otherwise the deterministic question bank (same shape either way).
    fallback_questions = generate_questions(body.topic, body.questionCount)
    user_score = (current_user.skills or {}).get(body.topic)
    questions, engine = await brain_questions(
        body.topic, body.questionCount, user_score, fallback_questions
    )

    # Store full questions (with answers) in DB
    assessment = Assessment(
        user_id=current_user.id,
        topic=body.topic,
        questions=questions,
        total_questions=len(questions),
        user_answers=[],
        score=0,
        percentage=0,
        status="in_progress",
    )
    session.add(assessment)
    await session.commit()
    await session.refresh(assessment)

    # Strip correct answers before sending to client
    client_questions = [
        {"question": q["question"], "options": q["options"], "difficulty": q["difficulty"]}
        for q in questions
    ]

    return {
        "assessmentId": str(assessment.id),
        "topic": assessment.topic,
        "questions": client_questions,
        "totalQuestions": len(questions),
        "engine": engine,
    }


@router.post("/{assessment_id}/submit")
async def submit_assessment(
    assessment_id: str,
    body: SubmitRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(
        select(Assessment).where(
            Assessment.id == assessment_id,
            Assessment.user_id == current_user.id,
        )
    )
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(404, "Assessment not found")
    if assessment.status == "completed":
        raise HTTPException(400, "Assessment already submitted")

    result_data = analyse_results(assessment.questions, body.answers)

    # Update assessment record
    assessment.user_answers = body.answers
    assessment.score = result_data["correct"]
    assessment.percentage = result_data["percentage"]
    assessment.xp_earned = result_data["xpEarned"]
    assessment.status = "completed"
    assessment.completed_at = datetime.utcnow()

    # Update user skills (weighted average 70/30)
    skills = dict(current_user.skills or {})
    current_skill = skills.get(assessment.topic, 0)
    new_score = min(100, round(current_skill * 0.7 + result_data["percentage"] * 0.3))
    skills[assessment.topic] = new_score

    xp = (current_user.xp or 0) + result_data["xpEarned"]
    level = (xp // 500) + 1

    assessment_history = list(current_user.assessment_history or [])
    assessment_history.append({
        "topic": assessment.topic,
        "score": result_data["correct"],
        "totalQuestions": assessment.total_questions,
        "takenAt": datetime.utcnow().isoformat(),
    })

    current_user.skills = skills
    current_user.xp = xp
    current_user.level = level
    current_user.assessment_history = assessment_history

    await session.commit()

    # Build detailed per-question results
    detailed = []
    for i, q in enumerate(assessment.questions):
        user_ans = body.answers[i] if i < len(body.answers) else -1
        detailed.append({
            "question": q["question"],
            "options": q["options"],
            "userAnswer": user_ans,
            "correctAnswer": q["correctAnswer"],
            "isCorrect": user_ans == q["correctAnswer"],
            "explanation": q.get("explanation", ""),
            "difficulty": q.get("difficulty", "medium"),
        })

    return {
        "result": {
            "score": result_data["correct"],
            "total": result_data["total"],
            "percentage": result_data["percentage"],
            "xpEarned": result_data["xpEarned"],
            "breakdown": result_data["breakdown"],
        },
        "detailedResults": detailed,
        "skillUpdate": {
            "skill": assessment.topic,
            "before": current_skill,
            "after": new_score,
        },
    }


@router.get("/history")
async def get_history(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(
        select(Assessment)
        .where(
            Assessment.user_id == current_user.id,
            Assessment.status == "completed",
        )
        .order_by(Assessment.completed_at.desc())
        .limit(20)
    )
    assessments = result.scalars().all()
    history = []
    for a in assessments:
        history.append({
            "id": str(a.id),
            "topic": a.topic,
            "score": a.score,
            "totalQuestions": a.total_questions,
            "percentage": a.percentage,
            "xpEarned": a.xp_earned,
            "completedAt": a.completed_at.isoformat() if a.completed_at else None,
        })
    return {"assessments": history}
