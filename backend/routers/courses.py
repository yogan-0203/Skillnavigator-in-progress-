from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_session
from auth import get_current_user
from ai_service import check_prerequisites
from models import User, Course

router = APIRouter(prefix="/courses", tags=["courses"])


def serialize_course(course: Course, user_skills: dict = None) -> dict:
    """Serialize a Course ORM object to a dict for API response."""
    prereq_check = check_prerequisites(course.prerequisites or [], user_skills or {})
    return {
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "level": course.level,
        "domain": course.domain,
        "duration": course.duration,
        "topics": course.topics or [],
        "prerequisites": course.prerequisites or [],
        "skillsGained": course.skills_gained or [],
        "xpReward": course.xp_reward,
        "instructor": course.instructor,
        "tags": course.tags or [],
        "rating": course.rating,
        "enrolledCount": course.enrolled_count,
        "isActive": course.is_active,
        "prerequisitesMet": prereq_check["allMet"],
        "prerequisiteDetails": prereq_check["details"],
    }


@router.get("")
@router.get("/")
async def get_courses(
    domain: str = None,
    level: str = None,
    search: str = None,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Course).where(Course.is_active == True)
    if domain:
        stmt = stmt.where(Course.domain == domain)
    if level:
        stmt = stmt.where(Course.level == level)
    if search:
        stmt = stmt.where(Course.title.ilike(f"%{search}%"))

    result = await session.execute(stmt)
    courses = result.scalars().all()
    user_skills = current_user.skills or {}
    return {"courses": [serialize_course(c, user_skills) for c in courses]}


@router.get("/{course_id}")
async def get_course(
    course_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(404, "Course not found")
    return {"course": serialize_course(course, current_user.skills or {})}


@router.post("/{course_id}/enroll")
async def enroll(
    course_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(404, "Course not found")

    user_skills = current_user.skills or {}
    prereq = check_prerequisites(course.prerequisites or [], user_skills)
    if not prereq["allMet"]:
        raise HTTPException(400, detail={
            "message": "Prerequisites not met",
            "details": [d for d in prereq["details"] if not d["met"]]
        })

    enrolled = current_user.enrolled_courses or []
    if any(e.get("courseId") == course_id for e in enrolled):
        raise HTTPException(400, "Already enrolled in this course")

    enrolled.append({"courseId": course_id, "progress": 0, "status": "enrolled"})
    xp = (current_user.xp or 0) + 20
    level = (xp // 500) + 1

    current_user.enrolled_courses = enrolled
    current_user.xp = xp
    current_user.level = level
    course.enrolled_count = (course.enrolled_count or 0) + 1

    await session.commit()
    return {"message": "Successfully enrolled", "course": course.title}


@router.put("/{course_id}/progress")
async def update_progress(
    course_id: str,
    body: dict,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    progress_val = body.get("progress", 0)
    if not (0 <= progress_val <= 100):
        raise HTTPException(400, "Progress must be 0-100")

    enrolled = current_user.enrolled_courses or []
    updated = False
    xp = current_user.xp or 0
    skills = dict(current_user.skills or {})

    for entry in enrolled:
        if entry.get("courseId") == course_id:
            entry["progress"] = progress_val
            if progress_val == 100:
                entry["status"] = "completed"
                result = await session.execute(select(Course).where(Course.id == course_id))
                course = result.scalar_one_or_none()
                if course:
                    xp += course.xp_reward or 100
                    for sg in (course.skills_gained or []):
                        skill_name = sg.get("skill", "")
                        boost = sg.get("boostAmount", 0)
                        skills[skill_name] = min(100, skills.get(skill_name, 0) + boost)
            else:
                entry["status"] = "in_progress"
            updated = True
            break

    if not updated:
        raise HTTPException(404, "Not enrolled in this course")

    level = (xp // 500) + 1
    current_user.enrolled_courses = enrolled
    current_user.xp = xp
    current_user.level = level
    current_user.skills = skills

    await session.commit()
    return {"message": "Progress updated", "progress": progress_val}
