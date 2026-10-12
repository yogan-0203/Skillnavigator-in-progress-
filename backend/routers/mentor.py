"""
AI Mentor chat — context-aware responses grounded in the student's real
profile (skills, target career, readiness, review queue), powered by the
LLM when configured (see llm.py) with the local engine as fallback.
"""
from typing import List

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_session
from auth import get_current_user
from brain import mentor_reply
from models import User, ChatMessage

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
        "learningDomain": current_user.learning_domain,
        "level": current_user.level or 1,
        "xp": current_user.xp or 0,
        "streak": current_user.streak or 0,
        "enrolledCourses": current_user.enrolled_courses or [],
        "assessmentHistory": current_user.assessment_history or [],
    }

    # Conversation memory: prefer the turns the client sends; if it's a fresh
    # chat, hydrate from the persisted history so the mentor still remembers.
    history = body.history or []
    if not history:
        try:
            result = await session.execute(
                select(ChatMessage)
                .where(ChatMessage.user_id == current_user.id)
                .order_by(ChatMessage.created_at.desc())
                .limit(12)
            )
            rows = list(reversed(result.scalars().all()))
            history = [{"role": r.role, "text": r.content} for r in rows]
        except Exception:
            history = []

    reply, engine = await mentor_reply(body.message, history, profile)

    # Persist the exchange (best-effort — never fail the request on this)
    try:
        session.add(ChatMessage(user_id=current_user.id, role="user", content=body.message))
        session.add(ChatMessage(user_id=current_user.id, role="mentor", content=reply))
        await session.commit()
    except Exception:
        await session.rollback()

    return {"reply": reply, "role": "mentor", "engine": engine}



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
