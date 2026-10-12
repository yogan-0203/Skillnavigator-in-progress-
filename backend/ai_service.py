"""
AI Service — question bank, gap analysis, roadmap generation, AI insights.
All pure Python. In production swap generation logic with OpenAI/Gemini calls
while keeping the same return shapes.
"""
import random
from typing import Dict, List, Optional

# ---------------------------------------------------------------------------
# Question bank
# ---------------------------------------------------------------------------
QUESTION_BANK = {
    "Python": [
        {"question": "What is the output of: print(type([]))",
         "options": ["<class 'list'>", "<class 'array'>", "<class 'tuple'>", "None"],
         "correctAnswer": 0, "explanation": "Square brackets create a list.", "difficulty": "easy"},
        {"question": "Which keyword defines a function in Python?",
         "options": ["function", "def", "func", "define"],
         "correctAnswer": 1, "explanation": "'def' defines a function.", "difficulty": "easy"},
        {"question": "What does 'self' represent in a Python class method?",
         "options": ["Static class ref", "The instance", "A global var", "Parent class"],
         "correctAnswer": 1, "explanation": "'self' refers to the current instance.", "difficulty": "medium"},
        {"question": "What is a list comprehension?",
         "options": ["Copy a list", "Concise way to create lists in one line", "Sort a list", "A loop type"],
         "correctAnswer": 1, "explanation": "List comprehensions provide a compact syntax.", "difficulty": "medium"},
        {"question": "Difference between 'is' and '==' in Python?",
         "options": ["They are identical", "'is' checks identity; '==' checks value", "'==' checks identity", "Neither compares"],
         "correctAnswer": 1, "explanation": "'is' checks memory identity; '==' checks value equality.", "difficulty": "hard"},
    ],
    "Machine Learning": [
        {"question": "Which algorithm is used for classification?",
         "options": ["Linear Regression", "Logistic Regression", "K-Means", "PCA"],
         "correctAnswer": 1, "explanation": "Logistic Regression is a classification algorithm.", "difficulty": "easy"},
        {"question": "What does 'overfitting' mean?",
         "options": ["Works on all data", "Memorises training data, fails on new data", "Too simple", "No parameters"],
         "correctAnswer": 1, "explanation": "Overfitting learns the noise in training data.", "difficulty": "medium"},
        {"question": "What is cross-validation used for?",
         "options": ["Speed up training", "Estimate generalisation", "Reduce dataset size", "Increase train accuracy"],
         "correctAnswer": 1, "explanation": "Cross-validation assesses generalisation.", "difficulty": "medium"},
        {"question": "Purpose of regularisation in ML?",
         "options": ["Speed up computation", "Prevent overfitting by penalising complexity", "Increase complexity", "Reduce data"],
         "correctAnswer": 1, "explanation": "Regularisation adds a penalty to reduce overfitting.", "difficulty": "hard"},
        {"question": "Best metric for imbalanced classification?",
         "options": ["Accuracy", "F1-Score", "MSE", "R²"],
         "correctAnswer": 1, "explanation": "F1-Score balances precision and recall.", "difficulty": "hard"},
    ],
    "Deep Learning": [
        {"question": "What is a neural network?",
         "options": ["A database", "A brain-inspired computational model", "A sorting algorithm", "A language"],
         "correctAnswer": 1, "explanation": "Neural networks mimic neurons to learn.", "difficulty": "easy"},
        {"question": "What is backpropagation?",
         "options": ["Forward pass", "Algorithm to compute gradients backward", "An activation function", "Data augmentation"],
         "correctAnswer": 1, "explanation": "Backpropagation computes gradients to update weights.", "difficulty": "medium"},
        {"question": "What does a convolutional layer do?",
         "options": ["Flattens input", "Applies filters to detect local features", "Normalises data", "Pools features"],
         "correctAnswer": 1, "explanation": "Conv layers extract spatial features via filters.", "difficulty": "medium"},
        {"question": "What is the vanishing gradient problem?",
         "options": ["Gradients too large", "Gradients shrink, slowing early layer learning", "Loss diverges", "Weights zero"],
         "correctAnswer": 1, "explanation": "Gradients shrink exponentially in deep networks.", "difficulty": "hard"},
        {"question": "Which optimiser adaptively adjusts learning rates?",
         "options": ["SGD", "Momentum", "Adam", "Batch GD"],
         "correctAnswer": 2, "explanation": "Adam combines RMSprop and momentum.", "difficulty": "hard"},
    ],
    "SQL": [
        {"question": "What does SELECT * FROM users do?",
         "options": ["Deletes all users", "Retrieves all columns from users", "Creates a table", "Updates all rows"],
         "correctAnswer": 1, "explanation": "SELECT * retrieves all columns.", "difficulty": "easy"},
        {"question": "What is a PRIMARY KEY?",
         "options": ["Encryption key", "Unique row identifier", "Foreign reference", "Multi-column index"],
         "correctAnswer": 1, "explanation": "Primary key uniquely identifies each record.", "difficulty": "easy"},
        {"question": "Difference between INNER JOIN and LEFT JOIN?",
         "options": ["Same", "INNER matches only; LEFT keeps all left rows", "LEFT only left data", "INNER all rows"],
         "correctAnswer": 1, "explanation": "LEFT JOIN keeps unmatched left rows as NULL.", "difficulty": "medium"},
        {"question": "What does GROUP BY do?",
         "options": ["Sorts data", "Groups rows by value for aggregation", "Removes duplicates", "Joins tables"],
         "correctAnswer": 1, "explanation": "GROUP BY aggregates rows with the same value.", "difficulty": "medium"},
        {"question": "What is a subquery?",
         "options": ["Stored procedure", "Query nested inside another query", "A view", "An index type"],
         "correctAnswer": 1, "explanation": "Subquery is embedded within another SQL statement.", "difficulty": "hard"},
    ],
    "Statistics": [
        {"question": "Mean of [2, 4, 6, 8, 10]?",
         "options": ["5", "6", "7", "4"],
         "correctAnswer": 1, "explanation": "Sum=30, count=5, mean=6.", "difficulty": "easy"},
        {"question": "What is standard deviation?",
         "options": ["Middle value", "Spread around the mean", "Most frequent value", "Value range"],
         "correctAnswer": 1, "explanation": "Std deviation quantifies spread from the mean.", "difficulty": "medium"},
        {"question": "p-value of 0.03 at α=0.05?",
         "options": ["Fail to reject null", "Reject null hypothesis", "Accept null", "Insufficient data"],
         "correctAnswer": 1, "explanation": "p(0.03) < α(0.05) → reject null.", "difficulty": "medium"},
        {"question": "What is the Central Limit Theorem?",
         "options": ["Sample mean = pop mean", "Sample means approach normal as n grows", "Variance decreases", "Large samples always accurate"],
         "correctAnswer": 1, "explanation": "CLT: distribution of sample means → normal as n→∞.", "difficulty": "hard"},
        {"question": "Bayes' Theorem is used for?",
         "options": ["Sorting data", "Updating probability given new evidence", "Computing std dev", "Testing normality"],
         "correctAnswer": 1, "explanation": "Bayes updates probability estimates with evidence.", "difficulty": "hard"},
    ],
    "NLP": [
        {"question": "What does NLP stand for?",
         "options": ["Neural Language Programming", "Natural Language Processing", "Numerical Linear Programming", "Network Layer Protocol"],
         "correctAnswer": 1, "explanation": "NLP = Natural Language Processing.", "difficulty": "easy"},
        {"question": "What is tokenisation?",
         "options": ["Encrypt text", "Split text into words/sub-words", "Translate text", "Classify sentences"],
         "correctAnswer": 1, "explanation": "Tokenisation breaks text into tokens.", "difficulty": "easy"},
        {"question": "What is TF-IDF used for?",
         "options": ["Image classification", "Measure word importance in a document vs corpus", "Audio processing", "Sequence modelling"],
         "correctAnswer": 1, "explanation": "TF-IDF scores word relevance across documents.", "difficulty": "medium"},
        {"question": "What is a transformer model?",
         "options": ["Electric device", "Attention-based deep learning for sequences", "Recurrent network", "Decision tree"],
         "correctAnswer": 1, "explanation": "Transformers use self-attention for sequences.", "difficulty": "hard"},
        {"question": "What is word embedding?",
         "options": ["Store words in DB", "Dense vector representation of words", "Count frequencies", "Stem words"],
         "correctAnswer": 1, "explanation": "Word embeddings map words to semantic vectors.", "difficulty": "medium"},
    ],
}

VALID_TOPICS = list(QUESTION_BANK.keys())


# ---------------------------------------------------------------------------
# Generate questions
# ---------------------------------------------------------------------------
def generate_questions(topic: str, count: int = 5) -> List[dict]:
    bank = QUESTION_BANK.get(topic, QUESTION_BANK["Python"])
    shuffled = bank.copy()
    random.shuffle(shuffled)
    return shuffled[:min(count, len(shuffled))]


# ---------------------------------------------------------------------------
# Analyse results
# ---------------------------------------------------------------------------
def analyse_results(questions: List[dict], answers: List[int]) -> dict:
    correct = 0
    breakdown: Dict[str, dict] = {}

    for i, q in enumerate(questions):
        is_correct = i < len(answers) and answers[i] == q["correctAnswer"]
        if is_correct:
            correct += 1
        diff = q.get("difficulty", "medium")
        if diff not in breakdown:
            breakdown[diff] = {"correct": 0, "total": 0}
        breakdown[diff]["total"] += 1
        if is_correct:
            breakdown[diff]["correct"] += 1

    total = len(questions)
    percentage = round((correct / total) * 100) if total > 0 else 0
    xp_earned = round(percentage * 0.5 + correct * 10)

    return {
        "correct": correct,
        "total": total,
        "percentage": percentage,
        "breakdown": breakdown,
        "xpEarned": xp_earned,
    }


# ---------------------------------------------------------------------------
# Career requirements
# ---------------------------------------------------------------------------
CAREER_REQUIREMENTS: Dict[str, Dict[str, int]] = {
    "AI / ML Engineer": {
        "Python": 85, "Machine Learning": 90, "Deep Learning": 85,
        "SQL": 80, "Statistics": 82, "NLP": 75, "Data Structures": 78,
    },
    "Data Scientist": {
        "Python": 80, "Statistics": 88, "Machine Learning": 80,
        "SQL": 85, "Deep Learning": 65,
    },
    "Data Analyst": {
        "SQL": 90, "Python": 70, "Statistics": 80,
    },
    "NLP Engineer": {
        "Python": 85, "Deep Learning": 80, "NLP": 90, "Statistics": 75,
    },
}


# ---------------------------------------------------------------------------
# Gap analysis
# ---------------------------------------------------------------------------
def generate_gap_analysis(target_career: str, user_skills: Dict[str, int]) -> dict:
    requirements = CAREER_REQUIREMENTS.get(
        target_career, CAREER_REQUIREMENTS["AI / ML Engineer"]
    )

    skill_data = []
    for skill, required in requirements.items():
        current = user_skills.get(skill, 0)
        skill_data.append({
            "skill": skill,
            "current": current,
            "required": required,
            "gap": max(0, required - current),
        })

    # Overall readiness
    if skill_data:
        readiness_scores = [
            min(100, (item["current"] / item["required"]) * 100)
            for item in skill_data
        ]
        overall_readiness = round(sum(readiness_scores) / len(readiness_scores))
    else:
        overall_readiness = 0

    # Categorise gaps
    gaps = []
    for item in skill_data:
        gap = item["gap"]
        if gap >= 30:
            level = "Critical"
        elif gap >= 15:
            level = "High"
        elif gap > 0:
            level = "Medium"
        else:
            continue
        gaps.append({**item, "level": level, "name": item["skill"]})

    gaps.sort(key=lambda x: x["gap"], reverse=True)

    # AI recommendation
    critical = [g for g in gaps if g["level"] == "Critical"]
    high = [g for g in gaps if g["level"] == "High"]
    if critical:
        names = " and ".join(g["skill"] for g in critical[:2])
        recommendation = f"Focus on {names} to significantly boost your career readiness."
    elif high:
        names = " and ".join(g["skill"] for g in high[:2])
        recommendation = f"Work on {names} to strengthen your profile."
    else:
        recommendation = "Great work! Fine-tune your skills to reach full readiness."

    return {
        "skillData": skill_data,
        "gaps": gaps[:6],
        "overallReadiness": overall_readiness,
        "totalGaps": len([g for g in skill_data if g["gap"] > 0]),
        "targetCareer": target_career,
        "aiRecommendation": recommendation,
    }


# ---------------------------------------------------------------------------
# Roadmap generator
# ---------------------------------------------------------------------------
ROADMAPS = {
    "AI / ML Engineer": [
        {"step": "01", "title": "Python & Data Analysis",
         "description": "Master Python, NumPy, Pandas and Matplotlib for data manipulation.",
         "skills": ["Python", "NumPy", "Pandas"], "estimatedWeeks": 4,
         "resources": ["Python.org docs", "Kaggle Python course", "Real Python tutorials"]},
        {"step": "02", "title": "Mathematics for ML",
         "description": "Linear Algebra, Calculus, Probability & Statistics foundations.",
         "skills": ["Statistics", "Linear Algebra"], "estimatedWeeks": 4,
         "resources": ["3Blue1Brown Linear Algebra", "Khan Academy Statistics"]},
        {"step": "03", "title": "Machine Learning Fundamentals",
         "description": "Supervised & unsupervised learning, model evaluation & tuning.",
         "skills": ["Machine Learning"], "estimatedWeeks": 6,
         "resources": ["Andrew Ng ML Course", "Hands-On ML book"]},
        {"step": "04", "title": "Deep Learning",
         "description": "Neural networks, CNNs, RNNs, and modern architectures.",
         "skills": ["Deep Learning"], "estimatedWeeks": 6,
         "resources": ["Deep Learning Specialisation (Coursera)", "fast.ai", "PyTorch tutorials"]},
        {"step": "05", "title": "NLP & Computer Vision",
         "description": "Transformer models, BERT, image classification.",
         "skills": ["NLP"], "estimatedWeeks": 5,
         "resources": ["Hugging Face course", "CS231n Stanford"]},
        {"step": "06", "title": "MLOps & Deployment",
         "description": "Docker, model serving, CI/CD and cloud deployment.",
         "skills": ["Docker"], "estimatedWeeks": 4,
         "resources": ["MLOps Zoomcamp", "AWS ML Specialisation"]},
        {"step": "07", "title": "Real-World AI Projects",
         "description": "Build end-to-end portfolio projects solving real problems.",
         "skills": ["System Design"], "estimatedWeeks": 6,
         "resources": ["Kaggle competitions", "GitHub portfolio"]},
    ],
    "Data Scientist": [
        {"step": "01", "title": "Python & Statistics",
         "description": "Python fundamentals and statistical analysis.",
         "skills": ["Python", "Statistics"], "estimatedWeeks": 4,
         "resources": ["Codecademy Python", "StatQuest YouTube"]},
        {"step": "02", "title": "Data Wrangling & EDA",
         "description": "Clean, explore and visualise data.",
         "skills": ["Pandas", "Matplotlib"], "estimatedWeeks": 3,
         "resources": ["Kaggle Pandas course", "Python for Data Analysis"]},
        {"step": "03", "title": "Machine Learning",
         "description": "Apply ML algorithms to real datasets.",
         "skills": ["Machine Learning"], "estimatedWeeks": 6,
         "resources": ["Kaggle ML courses", "ML Mastery"]},
        {"step": "04", "title": "Advanced Analytics",
         "description": "A/B testing, causal inference and experiment design.",
         "skills": ["Statistics"], "estimatedWeeks": 4,
         "resources": ["Trustworthy Online Controlled Experiments"]},
        {"step": "05", "title": "SQL & Databases",
         "description": "Query large datasets effectively.",
         "skills": ["SQL"], "estimatedWeeks": 3,
         "resources": ["Mode SQL tutorial", "LeetCode SQL"]},
    ],
    "Data Analyst": [
        {"step": "01", "title": "SQL Basics",
         "description": "Fundamental SQL queries and database concepts.",
         "skills": ["SQL"], "estimatedWeeks": 3,
         "resources": ["W3Schools SQL", "Mode Analytics SQL"]},
        {"step": "02", "title": "Python for Analysis",
         "description": "Python with Pandas and data visualisation.",
         "skills": ["Python", "Pandas"], "estimatedWeeks": 4,
         "resources": ["Kaggle courses", "Real Python"]},
        {"step": "03", "title": "Data Visualisation",
         "description": "Build dashboards and reports with modern tools.",
         "skills": ["Tableau", "Matplotlib"], "estimatedWeeks": 3,
         "resources": ["Tableau Public tutorials", "Power BI docs"]},
        {"step": "04", "title": "Statistical Analysis",
         "description": "Apply statistics to draw business insights.",
         "skills": ["Statistics"], "estimatedWeeks": 3,
         "resources": ["Khan Academy Stats", "StatQuest"]},
    ],
}


def compute_roadmap_metrics(steps: List[dict], user_skills: Dict[str, int], target_career: str) -> dict:
    """Derive per-step status + overall progress from real skill scores."""
    result = []
    for step in steps:
        relevant = [s for s in step["skills"] if s in user_skills]
        avg = (
            sum(user_skills[s] for s in relevant) / len(relevant)
            if relevant else 0
        )
        status = "Completed" if avg >= 80 else "In Progress" if avg >= 40 else "Upcoming"
        result.append({**step, "status": status})

    completed = sum(1 for s in result if s["status"] == "Completed")
    overall_progress = round((completed / len(result)) * 100) if result else 0

    return {
        "roadmap": result,
        "targetCareer": target_career,
        "overallProgress": overall_progress,
        "completedSteps": completed,
        "inProgressSteps": sum(1 for s in result if s["status"] == "In Progress"),
        "totalSteps": len(result),
    }


def generate_roadmap(target_career: str, user_skills: Dict[str, int]) -> dict:
    steps = ROADMAPS.get(target_career, ROADMAPS["AI / ML Engineer"])
    return compute_roadmap_metrics(steps, user_skills, target_career)


# ---------------------------------------------------------------------------
# AI insight for dashboard
# ---------------------------------------------------------------------------
def generate_ai_insight(user_skills: Dict[str, int], target_career: str) -> dict:
    if not user_skills:
        return {
            "summary": f"Complete your profile to get AI-powered insights for {target_career}.",
            "recommendation": "Start with skill assessments to unlock personalised guidance.",
            "nextSkill": "Python",
        }

    sorted_skills = sorted(user_skills.items(), key=lambda x: x[1], reverse=True)
    top = [s[0] for s in sorted_skills[:2]]
    weak = [s[0] for s in sorted_skills[-2:] if s[1] < 70]

    summary = f"Your profile shows strong {' and '.join(top)} skills on your path to {target_career}."
    recommendation = (
        f"Improve {' and '.join(weak)} to accelerate your journey."
        if weak else "Keep deepening your expertise — you are on a great trajectory."
    )

    return {
        "summary": summary,
        "recommendation": recommendation,
        "nextSkill": weak[0] if weak else (sorted_skills[-1][0] if sorted_skills else "Deep Learning"),
    }


# ---------------------------------------------------------------------------
# Prerequisite checker
# ---------------------------------------------------------------------------
def check_prerequisites(prerequisites: List[dict], user_skills: Dict[str, int]) -> dict:
    results = []
    for prereq in prerequisites:
        current = user_skills.get(prereq["skill"], 0)
        results.append({
            "skill": prereq["skill"],
            "required": prereq["minimumScore"],
            "current": current,
            "met": current >= prereq["minimumScore"],
        })
    all_met = all(r["met"] for r in results)
    return {"allMet": all_met, "details": results}


# ---------------------------------------------------------------------------
# Achievement definitions
# ---------------------------------------------------------------------------
ALL_ACHIEVEMENTS = [
    {"achievementId": "first_login",    "title": "Welcome Aboard",   "icon": "👋", "category": "exploration", "xpReward": 50,  "rarity": "common",
     "description": "Logged in for the first time"},
    {"achievementId": "streak_3",       "title": "3-Day Streak",     "icon": "🔥", "category": "streak",      "xpReward": 75,  "rarity": "common",
     "description": "Logged in 3 days in a row"},
    {"achievementId": "streak_7",       "title": "Week Warrior",     "icon": "⚡", "category": "streak",      "xpReward": 150, "rarity": "rare",
     "description": "Maintained a 7-day learning streak"},
    {"achievementId": "streak_30",      "title": "Month Master",     "icon": "🌟", "category": "streak",      "xpReward": 500, "rarity": "legendary",
     "description": "Maintained a 30-day learning streak"},
    {"achievementId": "level_5",        "title": "Rising Star",      "icon": "⭐", "category": "level",       "xpReward": 200, "rarity": "rare",
     "description": "Reached Level 5"},
    {"achievementId": "level_10",       "title": "Expert Learner",   "icon": "🏆", "category": "level",       "xpReward": 500, "rarity": "epic",
     "description": "Reached Level 10"},
    {"achievementId": "first_assessment","title": "Test Taker",      "icon": "📝", "category": "assessment",  "xpReward": 100, "rarity": "common",
     "description": "Completed your first skill assessment"},
    {"achievementId": "assessment_10",  "title": "Skill Builder",    "icon": "🎯", "category": "assessment",  "xpReward": 200, "rarity": "rare",
     "description": "Completed 10 skill assessments"},
    {"achievementId": "perfect_score",  "title": "Perfect Score",    "icon": "💯", "category": "assessment",  "xpReward": 300, "rarity": "epic",
     "description": "Scored 100% on an assessment"},
    {"achievementId": "course_first",   "title": "Course Starter",   "icon": "📚", "category": "courses",     "xpReward": 75,  "rarity": "common",
     "description": "Enrolled in your first course"},
    {"achievementId": "course_complete","title": "Course Graduate",  "icon": "🎓", "category": "courses",     "xpReward": 300, "rarity": "rare",
     "description": "Completed your first course"},
    {"achievementId": "skills_master",  "title": "Skill Guru",       "icon": "🧠", "category": "skills",      "xpReward": 250, "rarity": "epic",
     "description": "Reached 80%+ in any skill"},
]


def check_achievements(user: dict) -> List[str]:
    """Return list of newly unlocked achievement IDs."""
    unlocked_ids = {a["achievementId"] for a in user.get("achievements", [])}
    skills = user.get("skills", {})
    assessment_history = user.get("assessmentHistory", [])
    enrolled_courses = user.get("enrolledCourses", [])
    newly_unlocked = []

    checks = {
        "first_login":     True,
        "streak_3":        user.get("streak", 0) >= 3,
        "streak_7":        user.get("streak", 0) >= 7,
        "streak_30":       user.get("streak", 0) >= 30,
        "level_5":         user.get("level", 1) >= 5,
        "level_10":        user.get("level", 1) >= 10,
        "first_assessment": len(assessment_history) >= 1,
        "assessment_10":   len(assessment_history) >= 10,
        "perfect_score":   any(
            a.get("score") == a.get("totalQuestions") and a.get("totalQuestions", 0) > 0
            for a in assessment_history
        ),
        "course_first":    len(enrolled_courses) >= 1,
        "course_complete": any(c.get("status") == "completed" for c in enrolled_courses),
        "skills_master":   any(v >= 80 for v in skills.values()),
    }

    for ach_id, condition in checks.items():
        if condition and ach_id not in unlocked_ids:
            newly_unlocked.append(ach_id)

    return newly_unlocked
