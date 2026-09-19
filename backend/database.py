from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from typing import AsyncGenerator
import os

# Use SQLite for zero-config setup (no separate DB server needed)
# For production, switch to PostgreSQL by changing DATABASE_URL
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite+aiosqlite:///./skill_navigator.db",
)

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(
    bind=engine, expire_on_commit=False, class_=AsyncSession
)


class Base(DeclarativeBase):
    pass


async def connect_db():
    """Connect to database and create tables on startup."""
    import models  # noqa: F401  — ensures all models are registered
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database tables ready")


async def close_db():
    """Close database connection on shutdown."""
    await engine.dispose()
    print("✅ Database connection closed")


async def init_db():
    """Create all tables on startup (dev convenience — use Alembic in prod)."""
    import models  # noqa: F401  — ensures all models are registered
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database tables ready")


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
