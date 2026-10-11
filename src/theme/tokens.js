// ── Skill Navigator design tokens ──────────────────────────────────────────
// GLASSMORPHISM-ONLY system. Every surface is frosted glass with blur;
// no solid/clay fills. Text tokens guarantee readability in BOTH themes.

export const RADIUS = { xl: 26, lg: 22, md: 18, sm: 14, xs: 10, pill: 999 };

export const ACCENTS = {
    blue: "#4f8ef7",
    purple: "#9b6dff",
    green: "#3ecf8e",
    orange: "#f7934c",
    red: "#f76060",
    cyan: "#38c9d8",
    pink: "#f77eb8",
    gold: "#ffd166",
};

export const withAlpha = (hex, a) => `${hex}${a}`;

export const getTokens = (darkMode) => {
    const t = {
        dark: darkMode,
        text: {
            // Light theme: deep ink (#16162a) on frosted white = always visible.
            primary: darkMode ? "#f0f0f8" : "#16162a",
            secondary: darkMode ? "rgba(240,240,248,0.62)" : "rgba(22,22,42,0.68)",
            muted: darkMode ? "rgba(240,240,248,0.42)" : "rgba(22,22,42,0.52)",
            faint: darkMode ? "rgba(240,240,248,0.22)" : "rgba(22,22,42,0.32)",
            onAccent: "#ffffff",
        },
        bg: {
            page: darkMode ? "#08080d" : "#e9edf6",
            sidebar: darkMode
                ? "rgba(14,14,22,0.55)"
                : "rgba(255,255,255,0.55)",
        },
        border: {
            subtle: darkMode ? "rgba(255,255,255,0.12)" : "rgba(22,22,42,0.12)",
            medium: darkMode ? "rgba(255,255,255,0.2)" : "rgba(22,22,42,0.18)",
            strong: darkMode ? "rgba(255,255,255,0.3)" : "rgba(22,22,42,0.26)",
        },
        glass: {
            // Frosted face — translucent in BOTH themes so the mesh shows through.
            face: darkMode
                ? "linear-gradient(145deg, rgba(28,28,42,0.55), rgba(16,16,26,0.45))"
                : "linear-gradient(145deg, rgba(255,255,255,0.65), rgba(255,255,255,0.4))",
            panel: darkMode
                ? "rgba(20,20,32,0.5)"
                : "rgba(255,255,255,0.55)",
            inset: darkMode
                ? "rgba(0,0,0,0.3)"
                : "rgba(22,22,42,0.06)",
            chip: darkMode
                ? "rgba(255,255,255,0.07)"
                : "rgba(22,22,42,0.05)",
        },
        shadow: {
            glass: darkMode
                ? "0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.14)"
                : "0 12px 32px rgba(90,110,170,0.18), inset 0 1px 0 rgba(255,255,255,0.9)",
            glassSm: darkMode
                ? "0 6px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)"
                : "0 6px 18px rgba(90,110,170,0.14), inset 0 1px 0 rgba(255,255,255,0.85)",
            floating: darkMode
                ? "0 24px 60px rgba(0,0,0,0.6)"
                : "0 24px 60px rgba(90,110,170,0.3)",
        },
        blur: { card: 20, panel: 16, fab: 12 },
        chart: {
            grid: darkMode ? "rgba(255,255,255,0.08)" : "rgba(22,22,42,0.1)",
            tick: darkMode ? "rgba(240,240,248,0.5)" : "rgba(22,22,42,0.6)",
            tickFaint: darkMode ? "rgba(240,240,248,0.32)" : "rgba(22,22,42,0.42)",
        },
    };
    return t;
};
