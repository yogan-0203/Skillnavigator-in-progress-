"""
AI Mentor chat — context-aware responses grounded in the student's real
profile (skills, target career, readiness, review queue).
"""
from typing import List

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_session
from auth import get_current_user
from models import User, ChatMessage
from practice_engine import mentor_reply

router = APIRouter(prefix="/mentor", tags=["mentor"])


class ChatRequest(BaseModel):
    message: str
    history: List[dict] = []    # optional recent turns: [{role, text}]


@router.post("/chat")
async def chat(
    body: ChatRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    profile = {
        "name": current_user.name,
        "skills": current_user.skills or {},
        "targetCareer": current_user.target_career,
        "level": current_user.level or 1,
        "xp": current_user.xp or 0,
        "streak": current_user.streak or 0,
    }

    reply = mentor_reply(body.message, profile)

    # Persist the exchange (best-effort — never fail the request on this)
    try:
        session.add(ChatMessage(user_id=current_user.id, role="user", content=body.message))
        session.add(ChatMessage(user_id=current_user.id, role="mentor", content=reply))
        await session.commit()
    except Exception:
        await session.rollback()

    return {"reply": reply, "role": "mentor"}


@router.get("/history")
async def history(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.created_at.desc())
        .limit(20)
    )
    rows = list(reversed(result.scalars().all()))
    return {
        "messages": [
            {"role": r.role, "text": r.content, "at": r.created_at.isoformat() if r.created_at else ""}
            for r in rows
        ]
    }
