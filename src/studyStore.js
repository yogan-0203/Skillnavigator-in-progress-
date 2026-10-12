/**
 * studyStore.js — localStorage persistence for StudyBuddy conversations.
 * Tiny storage module so a server DB can replace it later without
 * touching components: swap the internals, keep the function names.
 */
const KEY = "sn_study_convos_v1";

const read = () => {
    try {
        const raw = localStorage.getItem(KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
    } catch {
        return [];
    }
};

const write = (convos) => {
    try { localStorage.setItem(KEY, JSON.stringify(convos.slice(0, 30))); } catch {}
};

export const studyStore = {
    list: () => read().map((c) => ({ id: c.id, title: c.title, updatedAt: c.updatedAt })),
    get: (id) => read().find((c) => c.id === id) || null,
    save: (convo) => {
        const all = read();
        const i = all.findIndex((c) => c.id === convo.id);
        const row = { ...convo, updatedAt: Date.now() };
        if (i >= 0) all[i] = row; else all.unshift(row);
        write(all);
    },
    remove: (id) => write(read().filter((c) => c.id !== id)),
    rename: (id, title) => {
        const all = read();
        const c = all.find((x) => x.id === id);
        if (c) { c.title = title.slice(0, 60); c.updatedAt = Date.now(); write(all); }
    },
    newId: () => `sb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
};
