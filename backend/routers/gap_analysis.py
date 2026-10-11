from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_session
from auth import get_current_user
from ai_service import generate_gap_analysis
from models import User

router = APIRouter(prefix="/gap-analysis", tags=["gap-analysis"])


@router.get("")
@router.get("/")
async def get_gap_analysis(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    user_skills = current_user.skills or {}
    target_career = current_user.target_career or "AI / ML Engineer"
    result = generate_gap_analysis(target_career, user_skills)
    result["userName"] = current_user.name or ""
    result["learningDomain"] = current_user.learning_domain or ""
    return result
