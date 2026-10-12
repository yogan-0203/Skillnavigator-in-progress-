"""
StudyBuddy — patient AI tutor chatbot for students.

POST /api/study  accepts { messages, mode, level } and streams the reply
back token-by-token (SSE). The system prompt is composed from
studybuddy_prompts.py (base + mode + level pieces).
Provider: Anthropic when LLM_PROVIDER=anthropic, otherwise any
OpenAI-compatible endpoint. Falls back to the offline mentor engine when
no LLM is configured or the provider fails, so students are never stuck.
"""
import json
import logging
import time
from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_session
from auth import get_current_user
from models import User
from studybuddy_prompts import (
    VALID_LEVELS,
    VALID_MODES,
    build_system_prompt,
    suggest_followups,
    trim_messages,
)
from llm import llm_available, stream_chat
from practice_engine import mentor_reply as local_mentor_reply

logger = logging.getLogger("studybuddy")

router = APIRouter(prefix="/study", tags=["studybuddy"])

# ── Validation limits ─────────────────────────────────────────────────────
MAX_MESSAGE_CHARS = 4000
MAX_HISTORY_TURNS = 40
MAX_FOLLOWUP_CHARS = 200

# ── Rate limiting (in-process, per IP) ─────────────────────────────────────
_RATE: dict = {}
RATE_LIMIT = 30            # requests
RATE_WINDOW_SECONDS = 60   # per minute


def _rate_limited(ip: str) -> bool:
    now = time.monotonic()
    window_start = now - RATE_WINDOW_SECONDS
    hits = [t for t in _RATE.get(ip, []) if t > window_start]
    if len(hits) >= RATE_LIMIT:
        _RATE[ip] = hits
        return True
    hits.append(now)
    if len(_RATE) > 2000:
        _RATE.clear()
    _RATE[ip] = hits
    return False


class ChatTurn(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str = Field(..., max_length=MAX_MESSAGE_CHARS)


class StudyRequest(BaseModel):
    messages: List[ChatTurn] = Field(..., min_length=1, max_length=MAX_HISTORY_TURNS)
    mode: str = "explain"
    level: str = "beginner"


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    return (fwd.split(",")[0].strip() or (request.client.host if request.client else "unknown"))


def _study_context(profile: dict) -> str:
    """One compact paragraph grounding the tutor in the learner's reality."""
    skills = profile.get("skills") or {}
    ranked = sorted(skills.items(), key=lambda kv: kv[1], reverse=True)
    strong = ", ".join(f"{s} {v}%" for s, v in ranked[:3]) if ranked else "none assessed yet"
    weak = ", ".join(f"{s} {v}%" for s, v in ranked[-2:]) if ranked else "none assessed yet"
    return (
        f"STUDENT CONTEXT (use sparingly, only when relevant): "
        f"{profile.get('name') or 'Student'} is targeting {profile.get('targetCareer') or 'AI / ML Engineer'}, "
        f"Level {profile.get('level', 1)}, {profile.get('xp', 0)} XP, {profile.get('streak', 0)}-day streak. "
        f"Strongest: {strong}. Weakest: {weak}."
    )


@router.post("")
@router.post("/")
async def study_chat(
    body: StudyRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if _rate_limited(_client_ip(request)):
        async def limited():
            yield "data: " + json.dumps({"error": "RATE_LIMIT", "message": "Too many requests — please wait a minute and try again."}) + "\n\n"
        return StreamingResponse(limited(), media_type="text/event-stream")

    mode = (body.mode or "explain").lower()[:20]
    level = (body.level or "beginner").lower()[:20]
    if mode not in VALID_MODES:
        mode = "explain"
    if level not in VALID_LEVELS:
        level = "beginner"

    profile = {
        "name": current_user.name,
        "skills": current_user.skills or {},
        "targetCareer": current_user.target_career,
        "level": current_user.level or 1,
        "xp": current_user.xp or 0,
        "streak": current_user.streak or 0,
    }

    turns = [{"role": t.role, "content": t.content.strip()} for t in body.messages if t.content.strip()]
    if not turns or turns[-1]["role"] != "user":
        async def empty():
            yield "data: " + json.dumps({"error": "EMPTY", "message": "Please type a question first."}) + "\n\n"
        return StreamingResponse(empty(), media_type="text/event-stream")
    turns = trim_messages(turns)
    last_user_text = turns[-1]["content"]

    system = (
        build_system_prompt(mode, level)
        + "\n"
        + _study_context(profile)
    )
    llm_messages = [{"role": "system", "content": system}] + turns
    use_llm = llm_available()

    async def event_stream():
        full_text = ""
        produced = False
        if use_llm:
            try:
                async for piece in stream_chat(
                    llm_messages, temperature=0.7, max_tokens=900
                ):
                    full_text += piece
                    produced = True
                    yield "data: " + json.dumps({"token": piece}) + "\n\n"
            except Exception as exc:  # noqa: BLE001 — fall back to offline tutor
                logger.warning("StudyBuddy LLM stream failed, using offline engine: %s", exc)
                produced = False
        if not produced:
            # Offline mentor engine, chunked so the UI streams it the same way.
            offline = local_mentor_reply(
                last_user_text,
                {
                    "name": profile["name"],
                    "skills": profile["skills"],
                    "targetCareer": profile["targetCareer"],
                    "level": profile["level"],
                    "xp": profile["xp"],
                    "streak": profile["streak"],
                },
                [{"role": ("mentor" if t["role"] == "assistant" else "user"), "text": t["content"]} for t in turns[-8:-1]],
            )
            full_text = offline
            for i in range(0, len(offline), 24):
                yield "data: " + json.dumps({"token": offline[i:i + 24]}) + "\n\n"
        followups = suggest_followups(last_user_text, full_text)[:3]
        followups = [f[:MAX_FOLLOWUP_CHARS] for f in followups]
        yield "data: " + json.dumps({"done": True, "engine": ("llm" if produced else "local"), "followups": followups}) + "\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
