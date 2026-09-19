"""
SQLAlchemy ORM models for PostgreSQL.
JSON columns store flexible data (skills map, enrolled courses list, etc.)
"""
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean,
    DateTime, Text, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from database import Base
import uuid


def gen_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id              = Column(String, primary_key=True, default=gen_uuid)
    name            = Column(String(120), nullable=False)
    email           = Column(String(255), unique=True, nullable=False, index=True)
    password        = Column(String(255), nullable=True)   # NULL for OAuth-only users
    avatar          = Column(String(500), default="")

    # OAuth
    google_id       = Column(String(255), unique=True, nullable=True)
    oauth_provider  = Column(String(50), nullable=True)    # "google" | None

    # Profile
    target_career   = Column(String(120), default="AI / ML Engineer")
    learning_domain = Column(String(120), default="AI & Data Science")

    # Gamification
    level           = Column(Integer, default=1)
    xp              = Column(Integer, default=0)
    streak          = Column(Integer, default=0)
    longest_streak  = Column(Integer, default=0)
    last_active_date= Column(String(20), nullable=True)

    # JSON columns (flexible, no extra tables needed)
    skills              = Column(JSON, default=lambda: {
        "Python": 0, "Machine Learning": 0, "SQL": 0,
        "Data Structures": 0, "Statistics": 0, "Deep Learning": 0, "NLP": 0,
    })
    enrolled_courses    = Column(JSON, default=list)   # [{courseId, progress, status}]
    achievements        = Column(JSON, default=list)   # [{achievementId, unlockedAt}]
    assessment_history  = Column(JSON, default=list)   # [{topic, score, totalQuestions, takenAt}]

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    assessments = relationship("Assessment", back_populates="user", cascade="all, delete-orphan")


class Course(Base):
    __tablename__ = "courses"

    id              = Column(String, primary_key=True, default=gen_uuid)
    title           = Column(String(200), nullable=False)
    description     = Column(Text, nullable=False)
    level           = Column(String(30), nullable=False)   # Beginner|Intermediate|Advanced
    domain          = Column(String(100), nullable=False)
    duration        = Column(String(50), default="4 weeks")
    topics          = Column(JSON, default=list)
    prerequisites   = Column(JSON, default=list)   # [{skill, minimumScore}]
    skills_gained   = Column(JSON, default=list)   # [{skill, boostAmount}]
    xp_reward       = Column(Integer, default=100)
    instructor      = Column(String(100), default="AI Curriculum")
    tags            = Column(JSON, default=list)
    rating          = Column(Float, default=4.5)
    enrolled_count  = Column(Integer, default=0)
    is_active       = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)


class Assessment(Base):
    __tablename__ = "assessments"

    id              = Column(String, primary_key=True, default=gen_uuid)
    user_id         = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    topic           = Column(String(100), nullable=False)
    questions       = Column(JSON, nullable=False)    # full question objects (with answers)
    user_answers    = Column(JSON, default=list)
    score           = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    percentage      = Column(Float, default=0)
    xp_earned       = Column(Integer, default=0)
    status          = Column(String(20), default="in_progress")  # in_progress | completed
    completed_at    = Column(DateTime, nullable=True)
    created_at      = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="assessments")
