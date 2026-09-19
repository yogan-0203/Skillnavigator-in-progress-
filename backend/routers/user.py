from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_session
from auth import get_current_user
from ai_service import generate_ai_insight
from models import User

router = APIRouter(prefix="/user", tags=["user"])


class UpdateSkillsRequest(BaseModel):
    skills: Dict[str, int]


@router.get("/dashboard")
async def dashboard(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    skills = current_user.skills or {}
    target_career = current_user.target_career or "AI / ML Engineer"
    insight = generate_ai_insight(skills, target_career)

    enrolled = current_user.enrolled_courses or []
    completed = sum(1 for e in enrolled if isinstance(e, dict) and e.get("status") == "completed")
    in_progress = sum(1 for e in enrolled if isinstance(e, dict) and e.get("status") == "in_progress")

    skill_values = list(skills.values())
    overall_score = round(sum(skill_values) / len(skill_values)) if skill_values else 0

    return {
        "user": {
            "name": current_user.name or "",
            "level": current_user.level or 1,
            "xp": current_user.xp or 0,
            "streak": current_user.streak or 0,
            "targetCareer": target_career,
        },
        "stats": {
            "overallScore": overall_score,
            "completedCourses": completed,
            "inProgressCourses": in_progress,
            "totalCourses": len(enrolled),
            "assessmentsTaken": len(current_user.assessment_history or []),
        },
        "skills": skills,
        "aiInsight": insight,
    }


@router.put("/skills")
async def update_skills(
    body: UpdateSkillsRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    validated = {
        k: max(0, min(100, int(v)))
        for k, v in body.skills.items()
        if isinstance(v, (int, float))
    }
    if not validated:
        raise HTTPException(400, "No valid skills provided")

    current_skills = dict(current_user.skills or {})
    current_skills.update(validated)
    current_user.skills = current_skills

    await session.commit()
    return {"message": "Skills updated", "skills": current_skills}
