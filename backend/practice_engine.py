"""
Adaptive Practice Engine — spaced-repetition scheduling (SM-2 lite),
weak-skill targeting, and the context-aware AI Mentor.

Pure Python, no external API dependency. In production, swap
`mentor_reply` for an OpenAI/Gemini call while keeping the same shape.
"""
import random
import re
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
# AI Mentor — intent tables (offline intent engine)
# ---------------------------------------------------------------------------
# Convention: a key starting with "=" means whole-word match (safe for short
# tokens like =ai, =ml, =cv, =py). Everything else is substring match.
PROMPTS = {
    "greeting": ("hello", "=hi", "=hey", "=yo", "good morning", "good evening",
                 "good afternoon", "namaste", "hii", "heyy", "hello!", "hi!"),
    "thanks": ("thank you", "thanks", "thx", "that helps", "helpful",
               "appreciated", "great answer", "awesome", "perfect answer"),
    "bye": ("bye", "goodbye", "good night", "see you", "take care", "talk later"),
    "who": ("who are you", "your name", "what are you", "about yourself",
            "are you human", "are you ai", "are you real", "are you a bot"),
    "help": ("what can you do", "how do you work", "your abilities",
             "your features", "list of things", "what else can"),
    "roadmap": ("roadmap", "study plan", "learning path", "study schedule",
                "what should i learn", "my plan", "plan to learn", "week plan",
                "month plan", "learning plan"),
    "weak": ("weak", "improve", "better", "gap", "which skill", "focus on",
             "priorit", "catch up"),
    "emotion": ("demotivat", "unmotivat", "give up", "giving up",
                "feel like quitting", "losing hope", "hopeless", "frustrat",
                "overwhelm", "burnout", "burnt out", "bored", "boring",
                "tired of", "discourag", "anxious", "anxiety", "stressed",
                "stress", "scared", "afraid", "nervous", "imposter",
                "feel dumb", "feel stupid", "can't do", "cannot do",
                "too hard", "too difficult", "lost ", "confused", "struggl",
                "stuck with", "stuck on", "can't understand", "don't understand",
                "dont understand", "hard to understand",
                "no progress", "feel stuck", "stuck and"),
    "debug": ("error", "bug in", "exception", "traceback", "not working",
              "doesn't work", "doesnt work", "won't run", "wont run",
              "fix my", "debug", "syntax", "indentation", "module not found",
              "modulenotfound", "import error", "nameerror", "typeerror",
              "valueerror", "keyerror", "indexerror", "attributeerror",
              "zerodivision", "recursionerror", "pip install", "wrong output",
              "unexpected output", "my code", "code gives", "program crash"),
    "define_q": ("what is ", "what are ", "what does ", "define ",
                 "definition of", "meaning of", "explain ", "tell me about",
                 "describe ", "overview of", "introduction to",
                 "what do you mean by"),
    "compare": (" vs ", " versus ", "difference between", "differences between",
                "compare ", "compared ", "which is better", "which one should",
                " or "),
    "howto": ("how do i ", "how do you ", "how to ", "how can i ",
              "how should i ", "steps to ", "best way to", "best way for",
              "tips for", "tips to ", "guide me", "teach me",
              "get started with", "getting started", "where do i start",
              "where should i start", "start learning"),
    "eli5": ("eli5", "like i'm 5", "like im 5", "in simple terms",
             "simply put", "explain simply", "simple explanation", "no jargon"),
    "career": ("job", "career", "interview", "resume", "hire",
               "internship", "fresher", "lpa", "ctc", "offer letter",
               "referral", "job hunt", "job search", "apply for",
               "suits me", "fit for me", "switch career", "career switch"),
    "project": ("project", "portfolio", "side project", "build something",
                "hackathon", "kaggle", "deploy", "github repo"),
    "time": ("how long", "how much time", "how many months", "how many weeks",
             "how many days", "timeline", "duration", "when will i",
             "how fast can", "deadline", "by when"),
    "practice": ("practice", "quiz", "test", "revision", "recall", "spaced"),
    "assessment": ("assessment", "assess ", "assess my", "benchmark", "test me",
                   "test my", "quiz me", "evaluate my", "mock test",
                   "self test", "check my knowledge"),
    "progress": ("progress", "my level", "my xp", "my streak", "how am i",
                 "my stats", "streak"),
    "leaderboard": ("leaderboard", "leader board", "my rank", "ranking",
                    "top learners", "scoreboard"),
    "course": ("course", "enrol", "enroll", "which course", "resource"),
}


# ---------------------------------------------------------------------------
# Knowledge base — real answers to real concept questions (offline)
# ---------------------------------------------------------------------------
# Each entry: title, triggers (substring, or =whole-word), a full answer and
# a one-line eli5. kb_lookup() fires the first matching entry.
KB = [
    {
        "title": "Python",
        "triggers": ("=python", "=py", "python language", "learn python"),
        "answer": (
            "**Python** is the world's most beginner-friendly programming language — "
            "readable like plain English, used for web apps, data science, AI, automation and more.\n\n"
            "→ **Why it matters:** nearly every AI/ML job lists Python first. Libraries like NumPy, pandas and scikit-learn do the heavy lifting.\n"
            "→ **Try this today:** `squares = [x*x for x in range(10)]` — that's a list comprehension, Python's famous one-liner.\n"
            "→ **Your next step:** take the Python assessment on the Practice page, then run a Practice session."
        ),
        "eli5": "Python is like talking to the computer in almost-plain words — you say what you want, and it does it.",
    },
    {
        "title": "Machine Learning",
        "triggers": ("=ml", "machine learning", "machinelearning"),
        "answer": (
            "**Machine learning** is teaching computers to learn patterns from examples instead of following hand-written rules. "
            "Show it 10,000 house photos with prices → it predicts the price of the next one.\n\n"
            "→ **The 3 flavours:** supervised (labelled answers — classification/regression), unsupervised (hidden groups, like K-Means), "
            "reinforcement (trial and error, like game-playing bots).\n"
            "→ **Your next step:** finish Statistics first — it's the maths underneath every algorithm — then attempt the ML assessment."
        ),
        "eli5": "Machine learning is like teaching a kid by showing lots of examples — after enough dog photos, they recognise any dog.",
    },
    {
        "title": "Deep Learning",
        "triggers": ("deep learning", "deeplearning", "neural network", "neural net"),
        "answer": (
            "**Deep learning** uses multi-layered neural networks — loosely inspired by brain neurons — to learn directly from raw data like "
            "images, audio and text.\n\n"
            "→ **Why it matters:** it powers chatbots, face unlock, voice assistants and self-driving vision.\n"
            "→ **The catch:** it needs lots of data and compute — start with classic ML first, then go deep.\n"
            "→ **Your next step:** close the Machine Learning gap first; Deep Learning is step two of the AI track."
        ),
        "eli5": "Deep learning stacks many tiny decision-makers in layers — like asking a crowd where each person votes, layer by layer.",
    },
    {
        "title": "SQL",
        "triggers": ("=sql", "structured query", "sql query", "learn sql"),
        "answer": (
            "**SQL** is how you ask questions of databases — `SELECT name FROM users WHERE age > 21` grabs exactly the rows you want.\n\n"
            "→ **Why it matters:** every data role — analyst, scientist, backend dev — touches SQL daily.\n"
            "→ **Learn in this order:** SELECT + WHERE → JOINs (combining tables) → GROUP BY + aggregations → window functions.\n"
            "→ **Your next step:** take the SQL assessment, then analyse any CSV with SQL queries as a mini-project."
        ),
        "eli5": "SQL is asking a giant spreadsheet very specific questions — and getting instant answers.",
    },
    {
        "title": "Statistics",
        "triggers": ("statistic", "=stats", "probability", "p-value", "hypothesis test"),
        "answer": (
            "**Statistics** is the maths of uncertainty — averages, spread, probability, and deciding whether a pattern is real or luck.\n\n"
            "→ **Why it matters:** every ML model is statistics in disguise — regression, scores, A/B tests, all of it.\n"
            "→ **The big 3 to master:** probability basics → distributions (the famous bell curve!) → hypothesis testing.\n"
            "→ **Your next step:** run a Statistics assessment to benchmark yourself, then the course module on distributions."
        ),
        "eli5": "Statistics is figuring out the truth from messy clues — like suspecting a coin is rigged after 9 heads in a row.",
    },
    {
        "title": "NLP",
        "triggers": ("=nlp", "natural language", "language model", "=llm", "=gpt", "=bert", "transformers", "=chatgpt"),
        "answer": (
            "**NLP** (Natural Language Processing) teaches computers to read, understand and generate human language — chatbots, translation, "
            "sentiment analysis and search all sit on it.\n\n"
            "→ **How it works today:** text becomes numbers (embeddings) → Transformer models read the sequence → they predict the next "
            "word, label, or answer.\n"
            "→ **Fast path in:** solid Python → ML basics → one sentiment-analysis project.\n"
            "→ **Your next step:** ship a tiny project — a review-sentiment classifier — and pin it on GitHub."
        ),
        "eli5": "NLP is teaching the computer to read — first letters, then words, then whole stories it can answer questions about.",
    },
    {
        "title": "Computer Vision",
        "triggers": ("computer vision", "=cv", "image recognition", "=cnn", "object detection", "image classification"),
        "answer": (
            "**Computer vision** gives computers eyes — recognising faces, objects and scenes in images and video.\n\n"
            "→ **Core tool:** CNNs learn edges → shapes → whole objects, layer by layer.\n"
            "→ **Where it's used:** face unlock, medical scans, self-driving cars, factory quality checks.\n"
            "→ **Your next step:** after ML basics, train an image classifier on a small public dataset and deploy the demo."
        ),
        "eli5": "Computer vision is teaching the computer to see — first dots and edges, then shapes, then 'that's a cat!'.",
    },
    {
        "title": "Data Structures & Algorithms",
        "triggers": ("data structure", "algorithm", "=dsa", "big-o", "big o ", "time complexity", "linked list", "binary tree", "sorting algorithm"),
        "answer": (
            "**DSA** is how you organise data (arrays, linked lists, trees, hash maps) and the recipes to process it (sorting, searching, recursion).\n\n"
            "→ **Why it matters:** it's the #1 thing technical interviews test, and it's what makes code fast at scale.\n"
            "→ **Learn in this order:** arrays/strings → hash maps → stacks/queues → trees → graphs → dynamic programming.\n"
            "→ **Your next step:** solve 2-3 easy problems a day and re-attempt the hard ones after 3 days — spaced repetition wins here too."
        ),
        "eli5": "DSA is organising your toy box so you can find any toy instantly — and knowing the fastest way to tidy it.",
    },
    {
        "title": "Web Development",
        "triggers": ("web dev", "web development", "frontend", "front-end", "backend", "back-end", "=html", "=css", "=javascript", "=js", "=react", "=api", "=rest"),
        "answer": (
            "**Web development** splits into frontend (what users see — HTML, CSS, JavaScript/React) and backend (servers, databases, APIs).\n\n"
            "→ **Fastest path:** HTML+CSS (1 week) → JavaScript (3 weeks) → React (3 weeks) → one backend (Node or Python) → deploy 3 projects.\n"
            "→ **The portfolio rule:** recruiters click live links, not certificates — deploy everything.\n"
            "→ **Your next step:** pick the Domain Selector in the app, then enrol in the matching course."
        ),
        "eli5": "Websites are like restaurants: frontend is the dining room you see, backend is the kitchen cooking your order.",
    },
    {
        "title": "Artificial Intelligence",
        "triggers": ("=ai", "artificial intelligence", "what is ai"),
        "answer": (
            "**AI** is the broad field of making machines do tasks that need intelligence — reasoning, learning, seeing, talking.\n\n"
            "→ **The family tree:** AI ⊃ Machine Learning ⊃ Deep Learning. Most 'AI' products today are ML/DL models.\n"
            "→ **Careers inside it:** ML engineer, data scientist, NLP/CV specialist, MLOps, AI product roles.\n"
            "→ **Your next step:** check your Gap Analysis for the exact skills your target AI role needs, then follow the Roadmap page in order."
        ),
        "eli5": "AI is teaching machines to be a little bit smart — like training a pet, but with maths instead of treats.",
    },
]


def kb_lookup(msg: str):
    """First KB entry whose triggers fire, or None."""
    words = {_norm_word(w) for w in msg.split()}
    for entry in KB:
        for trig in entry["triggers"]:
            if _key_in_msg(trig, msg, words):
                return entry
    return None


def _norm_word(word: str) -> str:
    """Lowercase alphanumeric token for whole-word matching."""
    return re.sub(r"[^a-z0-9+#./]", "", word.lower())


def _key_in_msg(key: str, msg: str, words: set) -> bool:
    """Match intent keys: '=x' = whole word, otherwise substring."""
    if key.startswith("="):
        return key[1:] in words
    return key in msg


def _match(msg: str, keys: tuple) -> bool:
    words = {_norm_word(w) for w in msg.split()}
    return any(_key_in_msg(k, msg, words) for k in keys)


def _legacy_profile_reply(message: str, user: dict) -> str:
    """
    Original data-grounded reply generator (fully personalised with the
    learner's real numbers). Kept as the trusted final fallback so the new
    intent engine can never produce a worse answer than before.
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
        f"Got it — {ctx}\n\n"
        f"Here's what I'd suggest next:\n"
        f"→ **Practice** — adaptive questions on your weakest skills\n"
        f"→ **Gap Analysis** — exactly what's between you and {career}\n"
        f"→ **Roadmap** — your step-by-step study plan\n\n"
        "Ask me things like \"how do I improve?\", \"what's my roadmap?\" or \"am I ready for a job?\""
    )


# ---------------------------------------------------------------------------
# New intent engine — follow-ups, computed answers, topic knowledge
# ---------------------------------------------------------------------------
FOLLOWUP_RE = re.compile(
    r"^\s*(tell me more|more|go on|and then\??|continue|elaborate|"
    r"what else|anything else|why\??|why is that|how come|"
    r"give (me )?(an? )?(example|more examples|details?)|"
    r"show (me )?(an? )?(example|more)|"
    r"yes( please)?|yeah|sure|ok(ay)?|please do|do it)\s*[?!.]*\s*$"
)


def _last_mentor_text(history) -> str:
    """Most recent mentor turn (offline copy uses role 'mentor' or 'assistant')."""
    for turn in reversed(history or []):
        if turn.get("role") in ("mentor", "assistant", "ai"):
            text = (turn.get("text") or turn.get("content") or "").strip()
            if text:
                return text
    return ""


def _followup_reply(history, name: str):
    """Answer bare follow-ups ('tell me more', 'why?', 'give example') by
    expanding the previous mentor answer. Returns None if not a follow-up."""
    msg_last = _last_mentor_text(history)
    if not msg_last:
        return None
    # Pull the bolded topic/skill names the last answer leaned on.
    topics = [seg for seg in re.findall(r"\*\*([^*]{2,40})\*\*", msg_last)[:4]]
    anchor = f" on {', '.join(topics[:2])}" if topics else ""
    return (
        f"Happy to go deeper{anchor}, {name}.\n\n"
        "→ **The 20-second version:** start smaller than you think — one concept, "
        "one worked example, then one tiny exercise the same day. That loop beats "
        "an hour of re-reading.\n"
        "→ **Make it stick:** write the idea in your own words, then attempt 3 "
        "related Practice questions — misses come back sooner via spaced repetition.\n"
        "→ **This week:** pick one 25-minute slot daily; consistency beats marathons.\n\n"
        "Want me to break a specific piece into steps? Name the topic — e.g. "
        "\"explain backpropagation\" or \"how do I learn SQL?\"."
    )


def _estimate_weeks(gaps) -> int:
    """Rough honest timeline from total gap points: ~8 pts ≈ 1 focused week."""
    total_gap = sum(g.get("gap", 0) for g in gaps)
    if total_gap <= 0:
        return 0
    return max(2, min(48, round(total_gap / 8)))


def _reply_thanks(name: str) -> str:
    return (
        f"Anytime, {name}! 🙌\n\n"
        "Small wins compound — keep the streak alive with one short session today. "
        "Ask me anytime: roadmaps, concepts, interview prep or just a pep talk."
    )


def _reply_bye(name: str) -> str:
    return (
        f"See you soon, {name}! 👋\n\n"
        "Your streak and XP are saved — come back tomorrow and we'll keep "
        "climbing. One session a day keeps the gaps away."
    )


def _reply_who(name: str) -> str:
    return (
        "I'm your built-in AI Career Mentor inside SkillNavigator — not human, "
        "but trained on your real profile: skills, gaps, streak and goals.\n\n"
        "→ I answer concept questions (Python, ML, SQL, DSA…)\n"
        "→ I plan roadmaps and fix study slumps\n"
        "→ I track your readiness against your target career\n\n"
        f"So {name} — what's the next thing you want to conquer?"
    )


def _reply_help(name: str) -> str:
    return (
        f"Here's my playbook, {name}:\n\n"
        "→ **Learn:** \"what is overfitting?\", \"explain transformers\", \"eli5 neural networks\"\n"
        "→ **Plan:** \"my roadmap\", \"what should I focus on\", \"how long to job-ready?\"\n"
        "→ **Build:** \"project ideas?\", \"how do I get my first job?\"\n"
        "→ **Fix:** paste the situation — \"my code throws KeyError\", \"I'm stuck on joins\"\n"
        "→ **Feel:** \"I'm demotivated\", \"too hard\" — I'll talk you through it\n\n"
        "Try me — ask anything."
    )


def _reply_emotion(name: str, skills: dict, career: str, readiness: int) -> str:
    ranked = sorted(skills.items(), key=lambda kv: kv[1], reverse=True)
    win = ranked[0][0] if ranked else "Python"
    win_score = ranked[0][1] if ranked else 0
    return (
        f"Hey {name} — that feeling is normal, and it means you care. Every learner "
        "hits this wall; the ones who make it just shrink the next step.\n\n"
        f"→ **Proof you're moving:** {win} at {win_score}% and {readiness}% readiness for {career} — that's real, banked progress.\n"
        "→ **Shrink the step:** forget the whole syllabus — do ONE 25-minute Practice session today. Momentum beats motivation.\n"
        "→ **Protect the streak:** show up tired, show up sloppy, just show up.\n\n"
        "Tell me what's weighing on you most — the topic, the time, the fear — and we'll cut it down to size together."
    )


def _reply_debug(msg: str, name: str) -> str:
    specifics = []
    if "indent" in msg:
        specifics.append("**Indentation:** Python cares about spaces — keep every block at a consistent 4 spaces, never mix tabs and spaces.")
    if "modulenotfound" in msg or "no module named" in msg or "import error" in msg:
        specifics.append("**ModuleNotFound:** the library isn't installed for the Python your editor uses — run `pip install <package>` in the same interpreter.")
    if "nameerror" in msg or "is not defined" in msg:
        specifics.append("**NameError:** a name is used before it exists — check spelling and define it above the line that uses it.")
    if "typeerror" in msg:
        specifics.append("**TypeError:** two incompatible types met — print `type(x)` for each value and convert explicitly (int(), str()).")
    if "keyerror" in msg or "indexerror" in msg:
        specifics.append("**Key/IndexError:** you're reaching for something that isn't there — print the dict keys or `len(list)` first, then guard with `.get()`.")
    if "zerodivision" in msg:
        specifics.append("**ZeroDivisionError:** a denominator became 0 — guard with `if denom != 0` before dividing.")
    if not specifics:
        specifics.append(
            "**Read the last line first:** the final error line names the exact problem and line — most debugging is reading it slowly."
        )
    specifics.append(
        "**Shrink it:** comment out half the code. Still broken? The bug is in the remaining half. Repeat."
    )
    return (
        f"Let's debug this together, {name} 🔧\n\n"
        + "\n".join(f"→ {s}" for s in specifics[:3])
        + "\n\nPaste the exact error message (the full last line) plus a few lines around it, and I'll pinpoint it."
    )


def _reply_time(name: str, career: str, skills: dict, gaps, readiness: int) -> str:
    weeks = _estimate_weeks(gaps)
    if readiness >= 80:
        return (
            f"Good news, {name} — at {readiness}% you're basically there. 🎯\n\n"
            "→ **0-2 weeks:** polish 2 portfolio projects and start applying now\n"
            "→ Don't wait for 100% — job descriptions are wish lists, and interviews take weeks anyway.\n\n"
            "Start the job-hunt track: ask me \"how do I get my first job?\"."
        )
    months = round(weeks / 4.3, 1)
    focus = gaps[0]["skill"] if gaps else (min(skills, key=skills.get) if skills else "Python")
    return (
        f"Honest estimate for {career}, {name}: **~{weeks} weeks (~{months} months)** "
        f"at ~1 focused hour a day — you're at {readiness}% now.\n\n"
        f"→ **Biggest lever:** {focus} — it alone would move your readiness the most\n"
        "→ **Pace that works:** 4 study days + 1 project day per week, never zero twice in a row\n"
        "→ **Checkpoints:** re-run assessments every 2 weeks and watch Gap Analysis climb\n\n"
        "Open the **Roadmap** page for the step-by-step version."
    )


def _reply_project(name: str, skills: dict, career: str) -> str:
    ranked = sorted(skills.items(), key=lambda kv: kv[1], reverse=True)
    s1 = ranked[0][0] if ranked else "Python"
    s2 = ranked[1][0] if len(ranked) > 1 else "SQL"
    return (
        f"Portfolio beats certificates, {name} — here's a 3-project ladder:\n\n"
        f"→ **Starter (this week):** a {s1} mini-tool that solves YOUR problem — a tracker, a bot, a dashboard.\n"
        f"→ **Mid (month 1):** a {s2}-powered analysis of a public dataset, with charts and a write-up.\n"
        f"→ **Capstone:** an end-to-end build for {career} — data in, model or app out, deployed live with a README.\n\n"
        "→ **Rules:** one GitHub repo each, README with screenshots, one deployed link.\n\n"
        "Tell me your current skills and I'll tailor the ideas — e.g. \"project ideas for SQL?\"."
    )


def _reply_assessment(name: str, skills: dict) -> str:
    pending = [s for s, v in skills.items() if v < 60] or list(skills)[:3] or ["Python"]
    return (
        f"Let's benchmark you, {name} 📝\n\n"
        f"→ Head to **Practice** and run an assessment on **{pending[0]}** first — your highest-leverage unknown.\n"
        "→ Questions adapt to your last score and explanations teach as you go.\n"
        "→ Misses resurface sooner (spaced repetition); re-test in 3-4 days to lock gains.\n\n"
        "After the test, your skill score, XP and Gap Analysis all update instantly."
    )


def _reply_leaderboard(name: str, user: dict) -> str:
    return (
        f"Here's how the arena works, {name} 🏆\n\n"
        f"→ You're **Level {user.get('level', 1)}** with **{user.get('xp', 0)} XP** and a **{user.get('streak', 0)}-day streak**.\n"
        "→ Earn XP from assessments, Practice sessions, activity logs and course completion — every 500 XP is a new level.\n"
        "→ Open the **Leaderboard** page to see where you stand, and **Progress** for your trend lines.\n\n"
        "Fastest climb: one assessment + one Practice session daily."
    )


_COMPARE_RULES = [
    (("supervised", "unsupervised"),
     "→ **Supervised** learns from labelled answers (this email IS spam) — great when you have examples of right answers.\n"
     "→ **Unsupervised** finds hidden groups with no answers given (K-Means) — great for exploration.\n"
     "→ **Rule of thumb:** labels available → supervised; exploring unknown data → unsupervised."),
    (("classification", "regression"),
     "→ **Classification** predicts a category (spam / not spam, cat / dog).\n"
     "→ **Regression** predicts a number (price, temperature).\n"
     "→ Answer is a word → classification; a number → regression."),
    (("cnn", "rnn"),
     "→ **CNNs** read space (images) — scanning for edges, shapes, objects.\n"
     "→ **RNNs/Transformers** read sequences (text, time-series) — what came before changes what comes next.\n"
     "→ Images → CNN; language/sequences → Transformer-era models."),
    (("list", "tuple"),
     "→ **Lists** are changeable (append, remove) — your everyday container.\n"
     "→ **Tuples** are frozen — safer, slightly faster, usable as dict keys.\n"
     "→ Default to lists; pick tuples for fixed records that must not change."),
    (("==", " is "),
     "→ **==** compares VALUES (are these equal?).\n"
     "→ **is** compares IDENTITY (the very same object in memory?).\n"
     "→ Use == almost everywhere; `is` is for None checks (`x is None`)."),
    (("sql", "nosql"),
     "→ **SQL** tables with strict schemas — best for structured, related data that must stay consistent.\n"
     "→ **NoSQL** flexible documents/key-values — best for fast-changing or huge-scale unstructured data.\n"
     "→ Bank/finance → SQL; social feeds/prototypes → NoSQL."),
]


def _reply_compare(msg: str, name: str):
    """Two-sided comparison for 'X vs Y' / 'difference between' questions."""
    for keys, answer in _COMPARE_RULES:
        if all(k in msg for k in keys):
            return f"Great comparison question, {name}:\n\n{answer}"
    core = msg
    if "difference between" in core:
        core = core.split("difference between", 1)[1]
    elif "differences between" in core:
        core = core.split("differences between", 1)[1]
    parts = re.split(r"\s+(?:vs\.?|versus|or)\s+", core.strip().strip("?"))
    if len(parts) == 2 and all(2 <= len(p) <= 40 for p in parts):
        a, b = (p.strip().title() for p in parts)
        return (
            f"Here's how to think about **{a} vs {b}**, {name}:\n\n"
            f"→ **{a}:** start with what problem it was built to solve — every tool shines in its home territory.\n"
            f"→ **{b}:** then ask what changes when you swap it in — speed, simplicity, or scale.\n"
            "→ **Decide by job:** match the tool to YOUR goal, not to hype. Tell me your goal and I'll pick for you.\n\n"
            f"Want the deep-dive on either? Ask \"what is {a}?\" or \"what is {b}?\"."
        )
    return None


def _reply_howto(msg: str, name: str, skills: dict, career: str, gaps) -> str:
    topic = None
    entry = kb_lookup(msg)
    if entry:
        topic = entry["title"]
    focus = gaps[0]["skill"] if gaps else (min(skills, key=skills.get) if skills else "Python")
    if topic:
        return (
            f"Here's your fastest route into **{topic}**, {name} 🚀\n\n"
            "→ **Week 1:** the absolute basics — one short lesson + one tiny exercise daily\n"
            "→ **Week 2-3:** build one small real thing with it (nothing teaches like shipping)\n"
            "→ **Week 4:** take the assessment, then let Practice's spaced repetition lock it in\n\n"
            f"Since {focus} is your biggest lever for {career}, do this there first — "
            "one hour a day beats weekend marathons."
        )
    return (
        f"Here's the learning formula that works for almost anything, {name} 🚀\n\n"
        "→ **1. Shrink it:** one sub-skill at a time (\"Python\" → \"loops\" → \"for-loops\")\n"
        "→ **2. Build tiny:** a 30-line project teaches more than 3 hours of videos\n"
        "→ **3. Test yourself:** Practice questions + assessments, then re-test in 3 days\n"
        "→ **4. Daily > marathon:** 25-45 minutes every day\n\n"
        f"Your highest-leverage topic right now is **{focus}** — start there. "
        "Name any topic and I'll map it out (\"how do I learn SQL?\")."
    )


def mentor_reply(message: str, user: dict, history=None) -> str:
    """
    New offline intent engine: ordered intent routing → computed answers →
    knowledge-base Q&A → legacy personalised reply (never worse than before).
    """
    msg = (message or "").lower().strip()
    history = history or []
    name = ((user or {}).get("name") or "there").split(" ")[0]
    skills = (user or {}).get("skills") or {}
    career = (user or {}).get("targetCareer") or "AI / ML Engineer"

    analysis = generate_gap_analysis(career, skills)
    readiness = analysis["overallReadiness"]
    gaps = analysis["gaps"]

    # 0. Bare follow-ups ("tell me more", "why?", "yes") need the last answer.
    if FOLLOWUP_RE.match(msg):
        expansion = _followup_reply(history, name)
        if expansion:
            return expansion

    # 1. Social graces.
    if _match(msg, PROMPTS["thanks"]):
        return _reply_thanks(name)
    if _match(msg, PROMPTS["bye"]):
        return _reply_bye(name)
    if _match(msg, PROMPTS["who"]):
        return _reply_who(name)
    if _match(msg, PROMPTS["help"]):
        return _reply_help(name)
    if _match(msg, PROMPTS["greeting"]) and len(msg.split()) <= 4:
        ctx = (
            f"{name}, you're at {readiness}% readiness for {career}."
            if skills else f"{name}, ready when you are"
        )
        return (
            f"Hey {name}! 👋\n\n{ctx}\n\n"
            "I can help you with:\n"
            "→ A personalised learning roadmap\n"
            "→ Which skill to improve next\n"
            "→ Concepts, debugging, interview & career prep\n"
            "→ Motivation when it gets tough\n\n"
            "What would you like to tackle?"
        )

    # 2. Emotional support first — feelings get coaching, not templates.
    if _match(msg, PROMPTS["emotion"]):
        return _reply_emotion(name, skills, career, readiness)

    # 3. Debugging and direct concept questions.
    if _match(msg, PROMPTS["debug"]):
        return _reply_debug(msg, name)
    kb_hit = kb_lookup(msg)
    if kb_hit and not _match(msg, PROMPTS["compare"]) and (
        _match(msg, PROMPTS["define_q"])
        or "?" in msg
        or _match(msg, PROMPTS["howto"])
        or len(msg.split()) <= 6
    ):
        is_eli5 = _match(msg, PROMPTS["eli5"])
        body = kb_hit["eli5"] if is_eli5 else kb_hit["answer"]
        prefix = (
            f"Super simple version, {name} 🧸\n\n" if is_eli5
            else f"Good topic, {name} — here's the {kb_hit['title']} crash course:\n\n"
        )
        return prefix + body

    # 4. Structured reasoning: comparisons, how-tos, timelines.
    if _match(msg, PROMPTS["compare"]):
        cmp_reply = _reply_compare(msg, name)
        if cmp_reply:
            return cmp_reply
    if _match(msg, PROMPTS["howto"]) and not _match(msg, PROMPTS["career"]):
        return _reply_howto(msg, name, skills, career, gaps)
    if _match(msg, PROMPTS["time"]):
        return _reply_time(name, career, skills, gaps, readiness)

    # 5. App-grounded topics.
    if _match(msg, PROMPTS["assessment"]):
        return _reply_assessment(name, skills)
    if _match(msg, PROMPTS["leaderboard"]):
        return _reply_leaderboard(name, user or {})
    if _match(msg, PROMPTS["project"]):
        return _reply_project(name, skills, career)
    if _match(msg, PROMPTS["practice"]):
        focus = [g["skill"] for g in gaps[:3]] or [min(skills, key=skills.get) if skills else "Python"]
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

    # 6. Legacy personalised reply — roadmap/weak/career/progress/course/generic.
    return _legacy_profile_reply(message, user)




