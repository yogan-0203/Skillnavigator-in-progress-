"""
Leaderboard — ranks students by XP, level and streak so learners can see
where they stand and stay motivated.
"""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_session
from auth import get_current_user
from models import User

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("")
@router.get("/")
async def leaderboard(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(
        select(User).order_by(User.xp.desc()).limit(50)
    )
    users = result.scalars().all()

    entries = []
    for rank, u in enumerate(users, start=1):
        skills = u.skills or {}
        values = list(skills.values())
        avg = round(sum(values) / len(values)) if values else 0
        entries.append({
            "rank": rank,
            "id": u.id,
            "name": u.name or "Student",
            "avatar": u.avatar or "",
            "level": u.level or 1,
            "xp": u.xp or 0,
            "streak": u.streak or 0,
            "targetCareer": u.target_career or "",
            "overallSkill": avg,
            "isMe": u.id == current_user.id,
        })

    # Medal colouring for the top three
    for e in entries:
        if e["rank"] == 1:
            e["tier"] = "gold"
        elif e["rank"] == 2:
            e["tier"] = "silver"
        elif e["rank"] == 3:
            e["tier"] = "bronze"
        else:
            e["tier"] = "standard"

    my_rank = next((e["rank"] for e in entries if e["isMe"]), None)

    return {
        "leaderboard": entries,
        "myRank": my_rank,
        "totalStudents": len(entries),
        "metric": "xp",
    }
