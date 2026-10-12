"""
brain.py — high-level AI orchestration.

Combines rich user context (profile, skills, gaps, history) with LLM
reasoning from llm.py, while keeping the deterministic engines in
ai_service.py / practice_engine.py as automatic fallbacks.

Every public function is async, fail-open, and returns (value, engine)
where engine is "llm" (frontier model answered) or "local" (built-in
heuristic answered) — routers surface `engine` so the UI can badge it.
"""
import json
from typing import List, Optional, Tuple

from ai_service import (
    CAREER_REQUIREMENTS,
    compute_roadmap_metrics,
    generate_gap_analysis,
)
from llm import chat, chat_json, llm_available
from practice_engine import mentor_reply as local_mentor_reply

# ---------------------------------------------------------------------------
# Shared context builder — everything the model should know about the learner
# ---------------------------------------------------------------------------
def build_user_context(profile: dict) -> str:
    """Serialise the learner's real data for an LLM system prompt."""
    name = profile.get("name") or "Student"
    career = profile.get("targetCareer") or "AI / ML Engineer"
    domain = profile.get("learningDomain") or "General"
    skills: dict = profile.get("skills") or {}
    level = profile.get("level", 1)
    xp = profile.get("xp", 0)
    streak = profile.get("streak", 0)

    lines = [
        f"Learner: {name}",
        f"Target career: {career}",
        f"Learning domain: {domain}",
        f"Level {level}, {xp} XP, {streak}-day streak",
    ]

    if skills:
        ranked = sorted(skills.items(), key=lambda kv: kv[1], reverse=True)
        lines.append(
            "Skills: "
            + ", ".join(f"{s} {v}%" for s, v in ranked)
            + f" | Strongest: {ranked[0][0]} ({ranked[0][1]}%)"
            + (f" | Weakest: {ranked[-1][0]} ({ranked[-1][1]}%)" if ranked[-1][1] < ranked[0][1] else "")
        )
        analysis = generate_gap_analysis(career, skills)
        lines.append(f"Career readiness for {career}: {analysis['overallReadiness']}%")
        top_gaps = analysis["gaps"][:3]
        if top_gaps:
            lines.append(
                "Priority gaps: "
                + "; ".join(f"{g['skill']} (-{g['gap']}pts, {g['level']})" for g in top_gaps)
            )
        requirements = CAREER_REQUIREMENTS.get(career)
        if requirements:
            lines.append(
                "Career requirements: "
                + ", ".join(f"{s} {r}%" for s, r in requirements.items())
            )
    else:
        lines.append("Skills: none assessed yet (new learner)")

    enrolled = profile.get("enrolledCourses") or []
    if enrolled:
        parts = []
        for e in enrolled[-5:]:
            if isinstance(e, dict):
                parts.append(f"{e.get('title', e.get('courseId', 'course'))} ({e.get('status', 'in progress')})")
        if parts:
            lines.append("Courses: " + "; ".join(parts))

    history = profile.get("assessmentHistory") or []
    if history:
        recent = history[-3:]
        lines.append(
            "Recent assessments: "
            + "; ".join(
                f"{a.get('topic', '?')} {a.get('score', 0)}/{a.get('totalQuestions', 0)}"
                for a in recent
            )
            + f" (total {len(history)} taken)"
        )

    return "\n".join(lines)


def _to_openai_history(history: Optional[list]) -> List[dict]:
    """Map the app's {role, text} turns (mentor==assistant) to chat roles."""
    out: List[dict] = []
    for turn in (history or [])[-12:]:
        text = (turn.get("text") or turn.get("content") or "").strip()
        if not text:
            continue
        role = turn.get("role")
        if role == "user":
            out.append({"role": "user", "content": text})
        elif role in ("mentor", "assistant", "ai"):
            out.append({"role": "assistant", "content": text})
    return out


# ---------------------------------------------------------------------------
# 1. AI Mentor — multi-turn, context-aware chat
# ---------------------------------------------------------------------------
MENTOR_SYSTEM = """<task=mentor>
You are the built-in AI Career Mentor inside SkillNavigator, a learning platform.
You coach one specific learner — the context below is their REAL data; use exact
numbers and skill names from it, never invent different ones.

Style:
- Warm, direct, coaching tone. Reply in at most ~140 words unless asked for depth.
- Use short lines and markdown bullets with the → arrow, like the app's UI.
- Always ground advice in their readiness %, gaps, courses and streak.
- You may reference app pages by name (Practice, Gap Analysis, Roadmap, Courses,
  Progress, Leaderboard) when they are genuinely the next step.
- Never claim to be a human, never fabricate scores, prices, or job offers.
- If asked something outside learning/career coaching, answer briefly and steer
  back to what you can genuinely help with.

LEARNER CONTEXT:
"""


async def mentor_reply(
    message: str,
    history: Optional[list],
    profile: dict,
) -> Tuple[str, str]:
    """LLM mentor with conversation memory; falls back to the local engine."""
    if llm_available():
        system = MENTOR_SYSTEM + build_user_context(profile)
        turns = _to_openai_history(history)
        current = (message or "").strip()
        if turns and turns[-1]["role"] == "user" and turns[-1]["content"] == current:
            messages = [{"role": "system", "content": system}] + turns
        else:
            messages = (
                [{"role": "system", "content": system}]
                + turns
                + [{"role": "user", "content": current}]
            )
        reply = await chat(
            messages, temperature=0.75, max_tokens=500, cache=False
        )
        if reply:
            return reply, "llm"

    return local_mentor_reply(message, profile, history), "local"


# ---------------------------------------------------------------------------
# 2. Gap analysis — LLM-written prioritised recommendation
# ---------------------------------------------------------------------------
GAP_SYSTEM = """<task=gap>
You are the career-readiness analyst inside SkillNavigator. Given computed
readiness data for one learner, write ONE prioritised recommendation that
tells them the single best place to focus next.

Rules:
- Plain text only: no markdown headers, no lists, no line breaks.
- 30-45 words. Start with an action verb.
- Name the exact skills and numbers from the data (e.g. "-45pts").
- Mention their target career once.
"""


async def gap_recommendation(
    gap_result: dict,
    profile: dict,
    fallback: str,
) -> Tuple[str, str]:
    """LLM-personalised recommendation sentence for the Gap Analysis page."""
    if llm_available():
        payload = json.dumps(
            {
                "learner": build_user_context(profile),
                "overallReadiness": gap_result.get("overallReadiness", 0),
                "targetCareer": gap_result.get("targetCareer", ""),
                "priorityGaps": [
                    {"skill": g.get("skill"), "gap": g.get("gap"), "level": g.get("level")}
                    for g in (gap_result.get("gaps") or [])[:6]
                ],
            },
            ensure_ascii=False,
        )
        text = await chat(
            [
                {"role": "system", "content": GAP_SYSTEM},
                {"role": "user", "content": payload},
            ],
            temperature=0.6,
            max_tokens=160,
            cache=True,
        )
        if text and 10 <= len(text) <= 600 and "\n" not in text.strip():
            return text.strip(), "llm"

    return fallback, "local"


# ---------------------------------------------------------------------------
# 3. Roadmap — LLM-personalised step sequence (validated JSON)
# ---------------------------------------------------------------------------
ROADMAP_SYSTEM = """<task=roadmap>
You are a learning-path designer inside SkillNavigator. Design a personalised,
ordered study roadmap (4-6 steps) for the learner described below, sequenced
from foundations to job-readiness for their target career.

Return ONLY a JSON object, no prose, exactly this shape:
{"steps": [{"title": "max 80 chars", "description": "1-2 sentences, max 240 chars",
"skills": ["Skill name"], "estimatedWeeks": 2, "resources": ["Free resource name"]}]}

Constraints: skills must come from the learner's career requirements or profile;
realistic week counts (1-8 per step); resources must be genuine free learning
sources (official docs, Khan Academy, freeCodeCamp, Kaggle, etc.).
"""


def _validate_roadmap_steps(data) -> Optional[list]:
    """Accept LLM output only if it yields ≥3 well-formed steps."""
    if not isinstance(data, dict) or not isinstance(data.get("steps"), list):
        return None
    steps = []
    for raw in data["steps"][:8]:
        if not isinstance(raw, dict):
            continue
        title = str(raw.get("title") or "").strip()[:120]
        description = str(raw.get("description") or "").strip()[:400]
        skills = [
            str(s).strip()[:60]
            for s in (raw.get("skills") or [])
            if isinstance(s, (str, int, float)) and str(s).strip()
        ][:6]
        if not title or not description or not skills:
            continue
        try:
            weeks = int(raw.get("estimatedWeeks") or 3)
        except (TypeError, ValueError):
            weeks = 3
        weeks = max(1, min(8, weeks))
        resources = [
            str(r).strip()[:120]
            for r in (raw.get("resources") or [])
            if isinstance(r, str) and r.strip()
        ][:5]
        steps.append(
            {
                "step": f"{len(steps) + 1:02d}",
                "title": title,
                "description": description,
                "skills": skills,
                "estimatedWeeks": weeks,
                "resources": resources,
            }
        )
    return steps if len(steps) >= 3 else None


async def roadmap(
    target_career: str,
    skills: dict,
    fallback: dict,
) -> Tuple[dict, str]:
    """Personalised roadmap with the same return shape as generate_roadmap()."""
    if llm_available():
        payload = json.dumps(
            {
                "targetCareer": target_career,
                "learnerSkills": skills or {},
                "careerRequirements": CAREER_REQUIREMENTS.get(target_career, {}),
            },
            ensure_ascii=False,
        )
        data = await chat_json(
            [
                {"role": "system", "content": ROADMAP_SYSTEM},
                {"role": "user", "content": payload},
            ],
            temperature=0.5,
            max_tokens=1500,
            cache=True,
        )
        steps = _validate_roadmap_steps(data)
        if steps:
            return compute_roadmap_metrics(steps, skills or {}, target_career), "llm"

    return fallback, "local"


# ---------------------------------------------------------------------------
# 4. Assessments — fresh, difficulty-calibrated questions (validated JSON)
# ---------------------------------------------------------------------------
QUESTIONS_SYSTEM = """<task=questions>
You are an assessment author inside SkillNavigator. Write genuinely fresh
multiple-choice questions for the topic below.

Return ONLY a JSON object, no prose:
{"questions": [{"question": "clear and unambiguous",
"options": ["a", "b", "c", "d"],
"correctAnswer": 0,
"explanation": "one sentence explaining why",
"difficulty": "easy" | "medium" | "hard"}]}

Hard rules: exactly 4 distinct option strings per question; correctAnswer is
the 0-3 index of the right option; every difficulty value must be exactly one
of easy/medium/hard; no duplicate questions; facts must be verifiably true.
"""


def _validate_questions(data, count: int) -> Optional[list]:
    """Accept LLM output only if ≥count fully well-formed questions exist."""
    if not isinstance(data, dict) or not isinstance(data.get("questions"), list):
        return None
    valid: List[dict] = []
    seen = set()
    for raw in data["questions"]:
        if len(valid) >= count:
            break
        if not isinstance(raw, dict):
            continue
        question = str(raw.get("question") or "").strip()
        options = raw.get("options")
        if not question or question in seen:
            continue
        if not isinstance(options, list) or len(options) != 4:
            continue
        option_texts = [str(o).strip() for o in options]
        if any(not o for o in option_texts) or len(set(option_texts)) != 4:
            continue
        try:
            correct = int(raw.get("correctAnswer"))
        except (TypeError, ValueError):
            continue
        if correct not in (0, 1, 2, 3):
            continue
        difficulty = str(raw.get("difficulty") or "medium").lower().strip()
        if difficulty not in ("easy", "medium", "hard"):
            difficulty = "medium"
        valid.append(
            {
                "question": question[:300],
                "options": option_texts,
                "correctAnswer": correct,
                "explanation": str(raw.get("explanation") or "").strip()[:300],
                "difficulty": difficulty,
            }
        )
        seen.add(question)
    return valid if len(valid) >= count else None


async def questions(
    topic: str,
    count: int,
    user_score: Optional[int],
    fallback: List[dict],
) -> Tuple[List[dict], str]:
    """
    Generate assessment questions calibrated to the learner's current score
    for this topic. Falls back to the static question bank.
    """
    if llm_available():
        if user_score is None:
            calibration = "No score yet — mix easy/medium to benchmark them."
        elif user_score < 40:
            calibration = "They are a beginner here — mostly easy, some medium."
        elif user_score < 70:
            calibration = f"Current score {user_score}% — mostly medium, some hard."
        else:
            calibration = f"Current score {user_score}% — challenge them with hard questions, some medium."
        payload = json.dumps(
            {"topic": topic, "count": count, "calibration": calibration},
            ensure_ascii=False,
        )
        data = await chat_json(
            [
                {"role": "system", "content": QUESTIONS_SYSTEM},
                {"role": "user", "content": payload},
            ],
            temperature=0.85,
            max_tokens=1800,
            cache=True,
        )
        validated = _validate_questions(data, count)
        if validated:
            return validated, "llm"

    return fallback, "local"


# ---------------------------------------------------------------------------
# 5. Dashboard insight — LLM synthesis of profile signals
# ---------------------------------------------------------------------------
INSIGHT_SYSTEM = """<task=insight>
You are the analytics narrator inside SkillNavigator. Using the learner data
below, return ONLY a JSON object (no prose):
{"summary": "max 150 chars, what their numbers say right now",
"recommendation": "max 150 chars, the single most valuable next action",
"nextSkill": "one exact skill name taken from their data"}

Rules: quote real numbers from the data; encouraging but honest; the
nextSkill must be one they have NOT mastered yet (or the weakest if all are
strong). Never use line breaks inside the strings.
"""


def _validate_insight(data) -> Optional[dict]:
    if not isinstance(data, dict):
        return None
    summary = str(data.get("summary") or "").strip()
    recommendation = str(data.get("recommendation") or "").strip()
    next_skill = str(data.get("nextSkill") or "").strip()
    if not summary or not recommendation or not next_skill:
        return None
    if "\n" in summary or "\n" in recommendation:
        return None
    return {
        "summary": summary[:220],
        "recommendation": recommendation[:220],
        "nextSkill": next_skill[:60],
    }


async def insight(
    skills: dict,
    target_career: str,
    stats: dict,
    fallback: dict,
) -> Tuple[dict, str]:
    """LLM dashboard insight; same shape as generate_ai_insight()."""
    if llm_available():
        payload = json.dumps(
            {
                "learner": build_user_context(
                    {
                        "skills": skills,
                        "targetCareer": target_career,
                        "assessmentHistory": stats.get("assessmentHistory") or [],
                    }
                ),
                "stats": {
                    k: v
                    for k, v in (stats or {}).items()
                    if k != "assessmentHistory"
                },
            },
            ensure_ascii=False,
        )
        data = await chat_json(
            [
                {"role": "system", "content": INSIGHT_SYSTEM},
                {"role": "user", "content": payload},
            ],
            temperature=0.6,
            max_tokens=220,
            cache=True,
        )
        validated = _validate_insight(data)
        if validated:
            return validated, "llm"

    return fallback, "local"
