from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_session
from auth import get_current_user
from models import User

router = APIRouter(prefix="/progress", tags=["progress"])


class LogActivityRequest(BaseModel):
    minutes: int = 0


@router.get("/")
async def get_progress(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    skills = current_user.skills or {}
    enrolled = current_user.enrolled_courses or []
    history = current_user.assessment_history or []

    completed_courses = sum(1 for e in enrolled if isinstance(e, dict) and e.get("status") == "completed")
    in_progress_courses = sum(1 for e in enrolled if isinstance(e, dict) and e.get("status") == "in_progress")

    skill_values = list(skills.values())
    overall_skill = round(sum(skill_values) / len(skill_values)) if skill_values else 0

    avg_score = (
        round(sum(a.get("score", 0) / max(a.get("totalQuestions", 1), 1) * 100
                  for a in history) / len(history))
        if history else 0
    )

    xp = current_user.xp or 0
    level = current_user.level or 1
    xp_for_current = (level - 1) * 500
    xp_for_next = level * 500
    xp_progress = min(100, round(((xp - xp_for_current) / max(xp_for_next - xp_for_current, 1)) * 100))

    # Weekly progress (last 6 weeks, computed from skill trend)
    weekly_data = []
    for i in range(5, -1, -1):
        weekly_data.append({
            "week": f"W{6-i}",
            "progress": max(5, overall_skill - i * 4),
            "xpEarned": max(10, xp // 6 - i * 10),
        })

    progress_bars = [
        {"title": "Overall Roadmap", "value": min(100, completed_courses * 15 + round(overall_skill * 0.4))},
        {"title": "Technical Skills", "value": overall_skill},
        {"title": "Assessments", "value": min(100, len(history) * 10 + round(avg_score * 0.3))},
        {"title": "Courses", "value": min(100, completed_courses * 20 + in_progress_courses * 10)},
    ]

    recent_assessments = []
    for a in reversed(history[-5:]):
        total_q = max(a.get("totalQuestions", 1), 1)
        pct = round(a.get("score", 0) / total_q * 100)
        recent_assessments.append({
            "topic": a.get("topic", ""),
            "percentage": pct,
            "score": a.get("score", 0),
            "total": a.get("totalQuestions", 0),
            "date": a.get("takenAt", ""),
        })

    return {
        "overview": {
            "level": level,
            "xp": xp,
            "xpToNextLevel": xp_for_next - xp,
            "xpProgress": xp_progress,
            "streak": current_user.streak or 0,
            "longestStreak": current_user.longest_streak or 0,
            "overallSkillScore": overall_skill,
        },
        "courses": {
            "enrolled": len(enrolled),
            "completed": completed_courses,
            "inProgress": in_progress_courses,
            "enrolledList": enrolled,
        },
        "assessments": {
            "taken": len(history),
            "averageScore": avg_score,
            "recent": recent_assessments,
        },
        "progressBars": progress_bars,
        "weeklyProgress": weekly_data,
        "skills": skills,
    }


@router.post("/log-activity")
async def log_activity(
    body: LogActivityRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    xp_earned = body.minutes // 5  # 1 XP per 5 minutes
    xp = (current_user.xp or 0) + xp_earned
    level = (xp // 500) + 1
    current_user.xp = xp
    current_user.level = level
    await session.commit()
    return {"message": "Activity logged", "xpEarned": xp_earned}
