import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("sn_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Global error handler — log 401s out
API.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem("sn_token");
            localStorage.removeItem("sn_user");
            window.location.href = "/";
        }
        return Promise.reject(err);
    }
);

// ── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
    register: (data) => API.post("/auth/register", data),
    login: (data) => API.post("/auth/login", data),
    demoLogin: () => API.get("/auth/demo"),
    me: () => API.get("/auth/me"),
    updateProfile: (data) => API.put("/auth/update-profile", data),
    googleUrl: () => API.get("/auth/google/url"),
    googleCallback: (code) => API.get("/auth/google/callback", { params: { code } }),
    resendVerification: () => API.post("/auth/resend-verification"),
    verifyEmail: (token) => API.post("/auth/verify-email", { token }),
};

// ── Courses ───────────────────────────────────────────────────────────────
export const coursesAPI = {
    getAll: (params) => API.get("/courses", { params }),
    getById: (id) => API.get(`/courses/${id}`),
    enroll: (id) => API.post(`/courses/${id}/enroll`),
    updateProgress: (id, progress) =>
        API.put(`/courses/${id}/progress`, { progress }),
};

// ── Assessment ────────────────────────────────────────────────────────────
export const assessmentAPI = {
    topics: () => API.get("/assessment/topics"),
    generate: (topic, questionCount = 5) =>
        API.post("/assessment/generate", { topic, questionCount }),
    submit: (id, answers) =>
        API.post(`/assessment/${id}/submit`, { answers }),
    history: () => API.get("/assessment/history"),
};

// ── Roadmap ───────────────────────────────────────────────────────────────
export const roadmapAPI = {
    get: () => API.get("/roadmap"),
    getPublic: (target) =>
        API.get("/roadmap/public", { params: { target } }),
};

// ── Gap Analysis ──────────────────────────────────────────────────────────
export const gapAPI = {
    get: () => API.get("/gap-analysis"),
};

// ── Achievements ──────────────────────────────────────────────────────────
export const achievementsAPI = {
    get: () => API.get("/achievements"),
};

// ── Progress ──────────────────────────────────────────────────────────────
export const progressAPI = {
    get: () => API.get("/progress"),
    logActivity: (minutes) =>
        API.post("/progress/log-activity", { minutes }),
};

// ── User ──────────────────────────────────────────────────────────────────
export const userAPI = {
    dashboard: () => API.get("/user/dashboard"),
    updateSkills: (skills) => API.put("/user/skills", { skills }),
};

// ── Adaptive Practice (spaced repetition) ─────────────────────────────────
export const practiceAPI = {
    session: () => API.get("/practice/session"),
    submit: (sessionId, answers, minutes = 0) =>
        API.post("/practice/session/submit", { sessionId, answers, minutes }),
    schedule: () => API.get("/practice/schedule"),
};

// ── AI Mentor (context-aware chat) ────────────────────────────────────────
export const mentorAPI = {
    chat: (message, history = []) => API.post("/mentor/chat", { message, history }),
    history: () => API.get("/mentor/history"),
};

// ── StudyBuddy (streaming AI tutor: explain / guide / quiz / simplify) ────
export const studyAPI = {
    // Streams SSE (data: {"token"|"done"|"error"}) via fetch + ReadableStream.
    // onToken(text, done, info) is called for every chunk and once at the end.
    streamChat: async (messages, mode = "explain", level = "beginner", onToken, signal) => {
        const token = localStorage.getItem("sn_token");
        const res = await fetch("http://localhost:5000/api/study", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ messages, mode, level }),
            signal,
        });
        if (!res.ok || !res.body) {
            throw new Error(res.status === 429 ? "RATE_LIMIT" : `HTTP_${res.status}`);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let info = { engine: "local", followups: [] };
        for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            let idx;
            while ((idx = buf.indexOf("\n\n")) !== -1) {
                const raw = buf.slice(0, idx).trim();
                buf = buf.slice(idx + 2);
                if (!raw.startsWith("data:")) continue;
                let evt;
                try { evt = JSON.parse(raw.slice(5).trim()); } catch { continue; }
                if (evt.token) onToken(evt.token, false, info);
                else if (evt.error) throw new Error(evt.error === "RATE_LIMIT" ? "RATE_LIMIT" : evt.message || "STREAM_ERROR");
                else if (evt.done) { info = { engine: evt.engine || "local", followups: evt.followups || [] }; onToken("", true, info); }
            }
        }
        return info;
    },
};

// ── Leaderboard ───────────────────────────────────────────────────────────
export const leaderboardAPI = {
    get: () => API.get("/leaderboard"),
};

export default API;
