"""
Adaptive Practice Engine — spaced-repetition scheduling (SM-2 lite),
weak-skill targeting, and the context-aware AI Mentor.

Pure Python, no external API dependency. In production, swap
`mentor_reply` for an OpenAI/Gemini call while keeping the same shape.
"""
import random
from datetime import date, timedelta
from typing import Dict, List, Optional

from ai_service import QUESTION_BANK, CAREER_REQUIREMENTS, generate_gap_analysis

# Skills that exist in the question bank (safe to schedule for practice)
PRACTICE_SKILLS = list(QUESTION_BANK.keys())


def topic_for_skill(skill: str) -> Optional[str]:
    """Return the question-bank topic that covers `skill`, or None."""
    return skill if skill in QUESTION_BANK else None


# ---------------------------------------------------------------------------
# Scheduling (SM-2 lite)
# ---------------------------------------------------------------------------
def sm2_schedule(ease: float, interval_days: int, reps: int, quality: int):
    """
    SM-2 lite scheduling.
    quality: 0-5 (>=3 counts as a pass, <3 counts as a lapse).
    Returns (ease, interval_days, reps, due_date_iso).
    """
    ease = max(1.3, ease)
    today = date.today()

    if quality < 3:                      # lapse — review again soon
        reps = 0
        interval_days = 1
        ease = max(1.3, ease - 0.2)
    else:                                # pass
        reps += 1
        if reps == 1:
            interval_days = 1
        elif reps == 2:
            interval_days = 3
        else:
            interval_days = round(interval_days * ease)
        ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

    due = today + timedelta(days=interval_days)
    return round(ease, 2), interval_days, reps, due.isoformat()


def quality_from_score(pct: int) -> int:
    """Map a 0-100 score onto the SM-2 0-5 quality scale."""
    if pct >= 90:
        return 5
    if pct >= 75:
        return 4
    if pct >= 60:
        return 3
    if pct >= 40:
        return 2
    if pct >= 20:
        return 1
    return 0


# ---------------------------------------------------------------------------
# Weak-skill selection
# ---------------------------------------------------------------------------
def prioritise_skills(
    user_skills: Dict[str, int],
    reviews: List[dict],
    target_career: str,
    limit: int = 3,
) -> List[dict]:
    """
    Rank the user's skills for practice by combining:
      • Weakness            (lower score → higher priority)
      • Career importance   (bigger gap vs. target career → higher priority)
      • Overdue-ness        (due today/overdue or never reviewed → higher priority)
    Returns a list of {skill, topic, score, priority, reason, dueDate, overdue}.
    """
    today = date.today()
    requirements = CAREER_REQUIREMENTS.get(target_career, {})
    review_by_skill = {r.get("skill"): r for r in reviews}

    # Only consider skills we can actually generate questions for
    candidates = [s for s in user_skills if topic_for_skill(s)]
    if not candidates:
        candidates = list(PRACTICE_SKILLS)

    scored = []
    for skill in candidates:
        score = user_skills.get(skill, 0)
        requirement = requirements.get(skill, 60)
        gap = max(0, requirement - score)

        review = review_by_skill.get(skill, {})
        due_date = review.get("dueDate") or review.get("due_date")
        never_reviewed = not due_date
        overdue = False
        if due_date:
            try:
                overdue = date.fromisoformat(due_date) <= today
            except (ValueError, TypeError):
                overdue = True

        # 0-100 weakness + 0-60 career-gap urgency + 0-40 review urgency
        priority = (
            (100 - score) * 0.5
            + min(gap, 60) * 0.6
            + (40 if never_reviewed or overdue else 0)
        )

        if never_reviewed:
            reason = "New skill — start building recall"
        elif overdue:
            reason = "Review due — spaced repetition"
        elif score < 40:
            reason = "Weak area — high impact on your goal"
        elif gap >= 20:
            reason = f"Key gap for {target_career}"
        else:
            reason = "Maintenance review"

        scored.append({
            "skill": skill,
            "topic": topic_for_skill(skill),
            "score": score,
            "priority": round(priority, 1),
            "reason": reason,
            "dueDate": due_date,
            "overdue": overdue,
            "neverReviewed": never_reviewed,
        })

    scored.sort(key=lambda x: x["priority"], reverse=True)
    return scored[:limit]


# ---------------------------------------------------------------------------
# Question selection for a session
# ---------------------------------------------------------------------------
def build_practice_set(
    skills: List[dict],
    per_skill: int = 3,
) -> List[dict]:
    """
    Pick questions for the chosen skills, biased toward difficulties the
    user is weakest at. Each question is tagged with its skill/topic so the
    client can attribute results correctly.
    """
    selected: List[dict] = []
    for entry in skills:
        topic = entry.get("topic")
        bank = QUESTION_BANK.get(topic, [])
        if not bank:
            continue

        # Bias: low scorers see easy/medium first (confidence + foundations),
        # high scorers get pushed toward hard questions.
        score = entry.get("score", 0)
        if score < 40:
            preferred = ["easy", "medium", "hard"]
        elif score < 70:
            preferred = ["medium", "hard", "easy"]
        else:
            preferred = ["hard", "medium", "easy"]

        def rank(q):
            try:
                return preferred.index(q.get("difficulty", "medium"))
            except ValueError:
                return len(preferred)

        ordered = sorted(bank, key=rank)
        for q in ordered[:per_skill]:
            selected.append({**q, "skill": entry["skill"], "topic": topic})

    random.shuffle(selected)
    return selected


# ---------------------------------------------------------------------------
# AI Mentor — context-aware reply generator
# ---------------------------------------------------------------------------
PROMPTS = {
    "greeting": ("hello", "hi ", "hey", "good morning", "good evening", "yo"),
    "roadmap": ("roadmap", "study plan", "learning path", "plan", "schedule", "what should i learn"),
    "weak": ("weak", "improve", "better", "struggle", "gap", "which skill", "focus"),
    "career": ("job", "career", "interview", "resume", "hire", "salary", "placement", "role"),
    "practice": ("practice", "quiz", "test", "revision", "recall", "spaced"),
    "progress": ("progress", "level", "xp", "streak", "how am i", "stats"),
    "course": ("course", "enrol", "enroll", "which course", "resource"),
}


def _match(msg: str, keys: tuple) -> bool:
    return any(k in msg for k in keys)


def mentor_reply(message: str, user: dict) -> str:
    """
    Generate a personalised mentor response grounded in the user's real
    profile: skills, target career, readiness and weakest areas.
    `user` is a plain dict: {name, skills, targetCareer, level, xp, streak}.
    """
    msg = (message or "").lower().strip()
    name = (user.get("name") or "there").split(" ")[0]
    skills = user.get("skills") or {}
    career = user.get("targetCareer") or "AI / ML Engineer"

    analysis = generate_gap_analysis(career, skills)
    readiness = analysis["overallReadiness"]
    gaps = analysis["gaps"]

    top = sorted(skills.items(), key=lambda x: x[1], reverse=True)
    strongest = top[0][0] if top else "Python"
    weakest = top[-1][0] if top else "Python"
    ctx = f"{name}, you're at {readiness}% readiness for {career}. Strongest: {strongest}. Needs work: {weakest}."

    if not skills or all(v == 0 for v in skills.values()):
        return (
            f"Welcome {name}! Your skill profile is still empty, so let's fix that first.\n\n"
            "→ Take a quick skill assessment to benchmark yourself\n"
            "→ Pick your target career in Career Explorer\n"
            "→ Run a Practice session — it targets exactly what you're weakest at\n\n"
            "Once I can see your scores I'll build you a precise week-by-week plan."
        )

    if _match(msg, PROMPTS["greeting"]):
        return (
            f"Hey {name}! 👋\n\n{ctx}\n\n"
            "I can help you with:\n"
            "→ A personalised learning roadmap\n"
            "→ Which skill to improve next\n"
            "→ Interview & career preparation\n"
            "→ Making sense of your progress\n\n"
            "What would you like to tackle?"
        )

    if _match(msg, PROMPTS["roadmap"]):
        steps = [
            f"Close the {g['skill']} gap ({g['gap']} pts, {g['level']} priority)"
            for g in gaps[:3]
        ] or ["Maintain your current skills with spaced practice"]
        step_lines = "\n".join(f"→ {s}" for s in steps)
        return (
            f"Here's your roadmap to {career}, {name}:\n\n"
            f"**Current readiness: {readiness}%**\n\n{step_lines}\n\n"
            "**Suggested cadence:**\n"
            "→ Mon/Wed/Fri: one practice session (spaced repetition)\n"
            "→ Tue/Thu: one course module + notes\n"
            "→ Weekend: project work + a skill assessment\n\n"
            "Open the **Roadmap** page for the full step-by-step version with resources."
        )

    if _match(msg, PROMPTS["weak"]) or _match(msg, PROMPTS["practice"]):
        focus = [g["skill"] for g in gaps[:3]] or [weakest]
        focus_lines = "\n".join(f"→ **{s}**" for s in focus)
        return (
            f"Focus here first, {name}:\n\n{focus_lines}\n\n"
            "These give you the biggest readiness boost per hour studied.\n\n"
            "**How to attack them:**\n"
            "1. Run a Practice session — it serves questions on exactly these skills\n"
            "2. Missed questions come back sooner (spaced repetition)\n"
            "3. Re-test in 3-4 days to lock the gain in\n\n"
            "Hit **Practice** in the sidebar to start now."
        )

    if _match(msg, PROMPTS["career"]):
        ready_line = (
            "you can start applying to internships now."
            if readiness >= 60
            else "target internships first, then roles."
        )
        return (
            f"Job-ready plan for {career}, {name}:\n\n"
            f"**You're at {readiness}% readiness** — {ready_line}\n\n"
            "→ **Portfolio:** 3 solid projects, one deployed live\n"
            "→ **GitHub:** clean READMEs, pinned repos\n"
            "→ **LinkedIn:** keywords for your target role\n"
            "→ **Interviews:** practise 5 questions/day in Practice\n\n"
            "Companies value shipped projects over certificates — build in public."
        )

    if _match(msg, PROMPTS["progress"]):
        level = user.get("level", 1)
        xp = user.get("xp", 0)
        streak = user.get("streak", 0)
        return (
            f"Your numbers, {name}:\n\n"
            f"→ **Level {level}** ({xp} XP)\n"
            f"→ **Streak:** {streak} day{'s' if streak != 1 else ''}\n"
            f"→ **Readiness:** {readiness}% for {career}\n"
            f"→ **Strongest skill:** {strongest} ({skills.get(strongest, 0)}%)\n\n"
            "Check the **Progress** page for charts, and the **Leaderboard** to see where you rank."
        )

    if _match(msg, PROMPTS["course"]):
        return (
            f"Good question. {weakest} is currently your weakest area:\n\n"
            "→ Open **Courses** and filter by your domain\n"
            "→ Courses show prerequisite ticks against your live skill scores\n"
            "→ Green tick = you're ready; red = build the prereq first\n\n"
            "Complete a course at 100% to bank its XP bonus and skill boosts."
        )

    return (
        f"Got it, {name}. {ctx}\n\n"
        f"Here's what I'd suggest next:\n"
        f"→ **Practice** — adaptive questions on your weakest skills\n"
        f"→ **Gap Analysis** — exactly what's between you and {career}\n"
        f"→ **Roadmap** — your step-by-step study plan\n\n"
        "Ask me things like \"how do I improve?\", \"what's my roadmap?\" or \"am I ready for a job?\""
    )




