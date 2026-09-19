from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_session
from auth import get_current_user
from ai_service import generate_roadmap
from models import User

router = APIRouter(prefix="/roadmap", tags=["roadmap"])


@router.get("/")
async def get_roadmap(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    user_skills = current_user.skills or {}
    target_career = current_user.target_career or "AI / ML Engineer"
    return generate_roadmap(target_career, user_skills)


@router.get("/public")
async def get_public_roadmap(target: str = "AI / ML Engineer"):
    return generate_roadmap(target, {})
