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

export default API;
