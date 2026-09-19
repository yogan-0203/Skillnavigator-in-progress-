from fastapi import APIRouter, Depends
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_session
from auth import get_current_user
from ai_service import ALL_ACHIEVEMENTS, check_achievements
from models import User

router = APIRouter(prefix="/achievements", tags=["achievements"])


@router.get("/")
async def get_achievements(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # Check for newly unlocked achievements
    user_data = {
        "skills": current_user.skills or {},
        "assessmentHistory": current_user.assessment_history or [],
        "enrolledCourses": current_user.enrolled_courses or [],
        "streak": current_user.streak or 0,
        "level": current_user.level or 1,
        "achievements": current_user.achievements or [],
    }
    newly_unlocked_ids = check_achievements(user_data)

    if newly_unlocked_ids:
        existing = list(current_user.achievements or [])
        xp_gained = 0
        for ach_id in newly_unlocked_ids:
            ach_def = next((a for a in ALL_ACHIEVEMENTS if a["achievementId"] == ach_id), None)
            if ach_def:
                existing.append({"achievementId": ach_id, "unlockedAt": datetime.utcnow().isoformat()})
                xp_gained += ach_def.get("xpReward", 0)

        xp = (current_user.xp or 0) + xp_gained
        level = (xp // 500) + 1
        current_user.achievements = existing
        current_user.xp = xp
        current_user.level = level
        await session.commit()
        await session.refresh(current_user)

    unlocked_map = {
        a.get("achievementId"): a
        for a in (current_user.achievements or [])
    }

    result = []
    for ach in ALL_ACHIEVEMENTS:
        unlocked = ach["achievementId"] in unlocked_map
        result.append({
            **{k: v for k, v in ach.items()},
            "unlocked": unlocked,
            "unlockedAt": unlocked_map.get(ach["achievementId"], {}).get("unlockedAt") if unlocked else None,
        })

    return {
        "achievements": result,
        "stats": {
            "total": len(ALL_ACHIEVEMENTS),
            "unlocked": len(unlocked_map),
            "newlyUnlocked": newly_unlocked_ids,
        },
    }
