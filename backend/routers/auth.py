"""
Auth router — email/password + Google OAuth.

Google OAuth flow:
  1. Frontend calls GET /api/auth/google/url  → gets Google consent URL
  2. User logs in on Google
  3. Google redirects to GET /api/auth/google/callback?code=...
  4. Backend exchanges code → gets user info → upserts User → returns JWT
  5. Frontend receives token in URL hash: /login#token=<jwt>
"""
import os, uuid
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import httpx
from dotenv import load_dotenv

from database import get_session
from models import User
from auth import (
    hash_password, verify_password,
    create_access_token, get_current_user,
)

load_dotenv()

GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI  = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:5000/api/auth/google/callback")
FRONTEND_URL         = os.getenv("FRONTEND_URL", "http://localhost:5173")

router = APIRouter(prefix="/auth", tags=["auth"])


# ── Helpers ──────────────────────────────────────────────────────────────
def user_out(u: User) -> dict:
    return {
        "_id":             u.id,
        "name":            u.name,
        "email":           u.email,
        "avatar":          u.avatar or "",
        "level":           u.level,
        "xp":              u.xp,
        "streak":          u.streak,
        "longestStreak":   u.longest_streak,
        "targetCareer":    u.target_career,
        "learningDomain":  u.learning_domain,
        "skills":          u.skills or {},
        "achievements":    u.achievements or [],
        "enrolledCourses": u.enrolled_courses or [],
        "assessmentHistory": u.assessment_history or [],
        "createdAt":       u.created_at.isoformat() if u.created_at else "",
        "oauthProvider":   u.oauth_provider,
    }


def _update_streak(user: User):
    today = date.today()
    last  = user.last_active_date

    if last is None:
        user.streak = 1
    else:
        try:
            last_date = date.fromisoformat(last)
        except Exception:
            last_date = today
        diff = (today - last_date).days
        if diff == 0:
            return          # already active today
        elif diff == 1:
            user.streak += 1
        else:
            user.streak = 1

    if user.streak > (user.longest_streak or 0):
        user.longest_streak = user.streak
    user.last_active_date = today.isoformat()


def _add_xp(user: User, pts: int):
    user.xp   = (user.xp or 0) + pts
    user.level = (user.xp // 500) + 1


def _default_skills():
    return {
        "Python": 0, "Machine Learning": 0, "SQL": 0,
        "Data Structures": 0, "Statistics": 0, "Deep Learning": 0, "NLP": 0,
    }


# ── Schemas ───────────────────────────────────────────────────────────────
class RegisterReq(BaseModel):
    name:     str
    email:    EmailStr
    password: str


class LoginReq(BaseModel):
    email:    EmailStr
    password: str


class UpdateProfileReq(BaseModel):
    name:           str | None = None
    targetCareer:   str | None = None
    learningDomain: str | None = None


# ── Email / password register ─────────────────────────────────────────────
@router.post("/register", status_code=201)
async def register(body: RegisterReq, session: AsyncSession = Depends(get_session)):
    if len(body.name.strip()) < 2:
        raise HTTPException(400, "Name must be at least 2 characters")
    if len(body.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")

    result = await session.execute(select(User).where(User.email == body.email.lower()))
    if result.scalar_one_or_none():
        raise HTTPException(409, "An account with this email already exists")

    user = User(
        id               = str(uuid.uuid4()),
        name             = body.name.strip(),
        email            = body.email.lower(),
        password         = hash_password(body.password),
        skills           = _default_skills(),
        enrolled_courses = [],
        achievements     = [],
        assessment_history = [],
        created_at       = datetime.utcnow(),
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)

    token = create_access_token(user.id)
    return {"message": "Account created successfully", "token": token, "user": user_out(user)}


# ── Email / password login ────────────────────────────────────────────────
@router.post("/login")
async def login(body: LoginReq, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(User).where(User.email == body.email.lower()))
    user   = result.scalar_one_or_none()

    if not user or not user.password:
        raise HTTPException(401, "Invalid email or password")
    if not verify_password(body.password, user.password):
        raise HTTPException(401, "Invalid email or password")

    _update_streak(user)
    _add_xp(user, 10)   # daily login bonus
    await session.commit()
    await session.refresh(user)

    token = create_access_token(user.id)
    return {"message": "Login successful", "token": token, "user": user_out(user)}


# ── Demo auto-login (skips the login/register wall) ──────────────────────
@router.get("/demo")
async def demo_login(session: AsyncSession = Depends(get_session)):
    """
    One-click demo access: create or reuse a demo user and return a JWT.
    Used by the frontend to bypass the login/register flow for demos.
    """
    result = await session.execute(
        select(User).where(User.email == "demo@skillnavigator.app")
    )
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            id               = str(uuid.uuid4()),
            name             = "Demo Student",
            email            = "demo@skillnavigator.app",
            password         = None,
            google_id        = "demo-auto",
            oauth_provider   = "demo",
            avatar           = "https://ui-avatars.com/api/?background=4f8ef7&color=fff&name=Demo+Student",
            skills           = _default_skills(),
            enrolled_courses = [],
            achievements     = [],
            assessment_history = [],
            target_career    = "AI / ML Engineer",
            learning_domain  = "AI & Data Science",
            created_at       = datetime.utcnow(),
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

    _update_streak(user)
    _add_xp(user, 10)
    await session.commit()
    await session.refresh(user)

    token = create_access_token(user.id)
    return {"message": "Demo login successful", "token": token, "user": user_out(user)}


# ── Get current user ──────────────────────────────────────────────────────
@router.get("/me")
async def me(current_user: User = Depends(get_current_user)):
    return {"user": user_out(current_user)}


# ── Update profile ────────────────────────────────────────────────────────
@router.put("/update-profile")
async def update_profile(
    body: UpdateProfileReq,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if body.name:           current_user.name            = body.name
    if body.targetCareer:   current_user.target_career   = body.targetCareer
    if body.learningDomain: current_user.learning_domain = body.learningDomain
    await session.commit()
    return {"message": "Profile updated"}


# ── Google OAuth ─────────────────────────────────────────────────────────

# Detect placeholder/demo credentials
_IS_DEMO_OAUTH = (
    not GOOGLE_CLIENT_ID
    or GOOGLE_CLIENT_ID == "your_google_client_id_here"
    or not GOOGLE_CLIENT_SECRET
    or GOOGLE_CLIENT_SECRET == "your_google_client_secret_here"
)


def _make_google_redirect(jwt_token: str) -> RedirectResponse:
    """Redirect browser to frontend with JWT in the URL hash."""
    return RedirectResponse(f"{FRONTEND_URL}/#token={jwt_token}")


@router.get("/google/url")
async def google_auth_url():
    """Return the Google OAuth consent URL for the frontend to redirect to.

    When real Google credentials are not configured (placeholder values in .env),
    a **mock OAuth flow** is used so the Google login button works for development.
    Replace GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET with real values from
    https://console.cloud.google.com/ to switch to production OAuth.
    """
    if _IS_DEMO_OAUTH:
        # Mock flow: return a URL that points to our own mock endpoint
        mock_code = str(uuid.uuid4())
        base = os.getenv("API_BASE_URL", "http://localhost:5000")
        return {"url": f"{base}/api/auth/google/mock?code={mock_code}"}

    params = "&".join([
        "response_type=code",
        f"client_id={GOOGLE_CLIENT_ID}",
        f"redirect_uri={GOOGLE_REDIRECT_URI}",
        "scope=openid%20email%20profile",
        "access_type=offline",
        "prompt=consent",
    ])
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{params}"
    return {"url": url}


@router.get("/google/mock")
async def google_mock_callback(
    code: str,
    session: AsyncSession = Depends(get_session),
):
    """
    Mock Google OAuth callback for development.

    Creates / updates a demo Google user and redirects to the frontend
    with a JWT token in the URL hash — just like the real flow.
    """
    demo_email = f"demo_{code[:8]}@example.com"
    google_id  = f"mock_{code[:12]}"
    name       = "Demo Google User"
    avatar     = "https://ui-avatars.com/api/?background=4f8ef7&color=fff&name=Demo+User"

    # Upsert user by google_id or email
    result = await session.execute(
        select(User).where(
            (User.google_id == google_id) | (User.email == demo_email)
        )
    )
    user = result.scalar_one_or_none()

    if user:
        if not user.google_id:
            user.google_id = google_id
            user.oauth_provider = "google"
        if avatar and not user.avatar:
            user.avatar = avatar
    else:
        user = User(
            id               = str(uuid.uuid4()),
            name             = name,
            email            = demo_email,
            password         = None,
            google_id        = google_id,
            oauth_provider   = "google",
            avatar           = avatar,
            skills           = _default_skills(),
            enrolled_courses = [],
            achievements     = [],
            assessment_history = [],
            created_at       = datetime.utcnow(),
        )
        session.add(user)

    _update_streak(user)
    _add_xp(user, 10)
    await session.commit()
    await session.refresh(user)

    jwt_token = create_access_token(user.id)
    return _make_google_redirect(jwt_token)


@router.get("/google/callback")
async def google_callback(code: str, session: AsyncSession = Depends(get_session)):
    """
    Google redirects here with ?code=...
    We exchange it for tokens, fetch the user's profile, upsert in DB,
    create a JWT, then redirect the frontend with token in URL hash.
    """
    if _IS_DEMO_OAUTH:
        raise HTTPException(
            501,
            "Real Google OAuth is not configured. The mock flow is available at "
            "/api/auth/google/mock. Set real GOOGLE_CLIENT_ID and "
            "GOOGLE_CLIENT_SECRET in backend/.env to use this endpoint.",
        )

    if not GOOGLE_CLIENT_ID:
        raise HTTPException(501, "Google OAuth not configured")

    # Exchange code for access token
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code":          code,
                "client_id":     GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri":  GOOGLE_REDIRECT_URI,
                "grant_type":    "authorization_code",
            },
        )
    if token_resp.status_code != 200:
        raise HTTPException(400, "Failed to exchange Google code for token")

    tokens       = token_resp.json()
    access_token = tokens.get("access_token")

    # Fetch Google user info
    async with httpx.AsyncClient() as client:
        info_resp = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
    if info_resp.status_code != 200:
        raise HTTPException(400, "Failed to fetch Google user info")

    google_user  = info_resp.json()
    google_id    = google_user.get("id")
    email        = google_user.get("email", "").lower()
    name         = google_user.get("name", "Google User")
    avatar       = google_user.get("picture", "")

    # Upsert user — find by google_id or email
    result = await session.execute(
        select(User).where(
            (User.google_id == google_id) | (User.email == email)
        )
    )
    user = result.scalar_one_or_none()

    if user:
        # Update Google info if missing
        if not user.google_id:
            user.google_id      = google_id
            user.oauth_provider = "google"
        if avatar and not user.avatar:
            user.avatar = avatar
    else:
        user = User(
            id               = str(uuid.uuid4()),
            name             = name,
            email            = email,
            password         = None,     # no password for OAuth users
            google_id        = google_id,
            oauth_provider   = "google",
            avatar           = avatar,
            skills           = _default_skills(),
            enrolled_courses = [],
            achievements     = [],
            assessment_history = [],
            created_at       = datetime.utcnow(),
        )
        session.add(user)

    _update_streak(user)
    _add_xp(user, 10)
    await session.commit()
    await session.refresh(user)

    jwt_token = create_access_token(user.id)

    # Redirect frontend with token in URL hash
    return RedirectResponse(f"{FRONTEND_URL}/#token={jwt_token}")
