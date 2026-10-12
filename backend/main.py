import sys

# Windows console uses cp1252 by default, which can't encode emoji
# used in print statements (✅). Force UTF-8 for stdout/stderr.
for _stream_name in ("stdout", "stderr"):
    _stream = getattr(sys, _stream_name, None)
    if _stream is not None and hasattr(_stream, "reconfigure"):
        try:
            _stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import connect_db, close_db, AsyncSessionLocal
from routers import auth, courses, assessment, roadmap, gap_analysis, achievements, progress, user
from routers import practice, mentor, leaderboard
from routers import studybuddy
from models import Course
from sqlalchemy import select


# Seed courses if none exist
async def _seed_courses():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Course).limit(1))
        existing = result.scalar_one_or_none()
        if existing:
            return

        seed_data = [
            {"title": "Python for Beginners", "description": "Learn Python from scratch: syntax, data types, loops, functions, and OOP.",
             "level": "Beginner", "domain": "Programming", "duration": "3 weeks",
             "topics": ["Variables", "Loops", "Functions", "OOP", "File I/O"],
             "prerequisites": [], "skills_gained": [{"skill": "Python", "boostAmount": 40}],
             "xp_reward": 200, "tags": ["python", "beginner"], "rating": 4.8},
            {"title": "Python Advanced", "description": "Deep dive into Python: decorators, generators, async/await, and design patterns.",
             "level": "Advanced", "domain": "Programming", "duration": "4 weeks",
             "topics": ["Decorators", "Generators", "Asyncio", "Design Patterns"],
             "prerequisites": [{"skill": "Python", "minimumScore": 50}],
             "skills_gained": [{"skill": "Python", "boostAmount": 30}],
             "xp_reward": 300, "tags": ["python", "advanced"], "rating": 4.7},
            {"title": "SQL for Data Science", "description": "Master SQL queries, joins, aggregations, and window functions.",
             "level": "Intermediate", "domain": "Database", "duration": "3 weeks",
             "topics": ["SELECT", "JOINs", "GROUP BY", "Window Functions", "Subqueries"],
             "prerequisites": [], "skills_gained": [{"skill": "SQL", "boostAmount": 45}],
             "xp_reward": 200, "tags": ["sql", "data"], "rating": 4.6},
            {"title": "Machine Learning Fundamentals",
             "description": "Supervised & unsupervised learning, model evaluation and feature engineering.",
             "level": "Intermediate", "domain": "Artificial Intelligence", "duration": "6 weeks",
             "topics": ["Linear Regression", "Logistic Regression", "Decision Trees", "K-Means", "Model Evaluation"],
             "prerequisites": [{"skill": "Python", "minimumScore": 60}, {"skill": "Statistics", "minimumScore": 50}],
             "skills_gained": [{"skill": "Machine Learning", "boostAmount": 50}],
             "xp_reward": 400, "tags": ["ml", "ai"], "rating": 4.9},
            {"title": "Statistics for Data Science",
             "description": "Probability, distributions, hypothesis testing, and Bayesian statistics.",
             "level": "Intermediate", "domain": "Mathematics", "duration": "4 weeks",
             "topics": ["Probability", "Distributions", "Hypothesis Testing", "Bayesian Inference"],
             "prerequisites": [], "skills_gained": [{"skill": "Statistics", "boostAmount": 50}],
             "xp_reward": 250, "tags": ["statistics", "math"], "rating": 4.5},
            {"title": "Deep Learning with Neural Networks",
             "description": "Build and train deep neural networks using PyTorch. Covers CNNs, RNNs, and Transformers.",
             "level": "Advanced", "domain": "Artificial Intelligence", "duration": "8 weeks",
             "topics": ["Backpropagation", "CNNs", "RNNs", "Transformers", "Model Tuning"],
             "prerequisites": [{"skill": "Python", "minimumScore": 70}, {"skill": "Machine Learning", "minimumScore": 60},
                                {"skill": "Statistics", "minimumScore": 55}],
             "skills_gained": [{"skill": "Deep Learning", "boostAmount": 55}],
             "xp_reward": 500, "tags": ["deep-learning", "neural-networks"], "rating": 4.8},
            {"title": "Natural Language Processing",
             "description": "Text processing, sentiment analysis, and large language models with Transformers.",
             "level": "Advanced", "domain": "Artificial Intelligence", "duration": "6 weeks",
             "topics": ["Tokenisation", "TF-IDF", "Word Embeddings", "BERT", "Fine-tuning LLMs"],
             "prerequisites": [{"skill": "Python", "minimumScore": 70}, {"skill": "Deep Learning", "minimumScore": 55}],
             "skills_gained": [{"skill": "NLP", "boostAmount": 60}],
             "xp_reward": 500, "tags": ["nlp", "bert"], "rating": 4.7},
            {"title": "Data Structures & Algorithms",
             "description": "Arrays, trees, graphs, sorting, searching, and dynamic programming.",
             "level": "Intermediate", "domain": "Computer Science", "duration": "5 weeks",
             "topics": ["Arrays", "Linked Lists", "Trees", "Graphs", "Dynamic Programming"],
             "prerequisites": [{"skill": "Python", "minimumScore": 40}],
             "skills_gained": [{"skill": "Data Structures", "boostAmount": 50}],
             "xp_reward": 350, "tags": ["dsa", "algorithms"], "rating": 4.6},
        ]
        for data in seed_data:
            course = Course(**data)
            session.add(course)
        await session.commit()
        print("✅ Courses seeded")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    await _seed_courses()
    from llm import status_info
    import llm as llm_gateway
    print(f"🤖 AI engine: {status_info()}")
    yield
    await llm_gateway.aclose()
    await close_db()


app = FastAPI(
    title="Skill Navigator API",
    description="AI-powered student education platform backend",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────
app.include_router(auth.router,         prefix="/api")
app.include_router(courses.router,      prefix="/api")
app.include_router(assessment.router,   prefix="/api")
app.include_router(roadmap.router,      prefix="/api")
app.include_router(gap_analysis.router, prefix="/api")
app.include_router(achievements.router, prefix="/api")
app.include_router(progress.router,     prefix="/api")
app.include_router(user.router,         prefix="/api")
app.include_router(practice.router,     prefix="/api")
app.include_router(mentor.router,       prefix="/api")
app.include_router(studybuddy.router,   prefix="/api")
app.include_router(leaderboard.router,  prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok", "message": "Skill Navigator FastAPI running 🚀"}
