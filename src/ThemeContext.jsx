import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material";

const ThemeContext = createContext(null);

// CSS variables applied to :root so both raw CSS and MUI sx styles stay in sync.
const getCSSVariables = (darkMode) => ({
    "--bg-primary": darkMode ? "#08080d" : "#eef1f8",
    "--bg-secondary": darkMode ? "#0c0c14" : "#e7ebf5",
    "--bg-tertiary": darkMode ? "#12121c" : "#dde3f0",
    "--bg-card": darkMode ? "rgba(20, 20, 32, 0.55)" : "rgba(255, 255, 255, 0.6)",
    "--bg-card-hover": darkMode ? "rgba(30, 30, 46, 0.65)" : "rgba(255, 255, 255, 0.8)",
    "--bg-elevated": darkMode ? "rgba(16, 16, 26, 0.85)" : "rgba(255, 255, 255, 0.85)",
    "--border-subtle": darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(22, 22, 42, 0.1)",
    "--border-medium": darkMode ? "rgba(255, 255, 255, 0.16)" : "rgba(22, 22, 42, 0.16)",
    "--border-strong": darkMode ? "rgba(255, 255, 255, 0.26)" : "rgba(22, 22, 42, 0.26)",
    "--text-primary": darkMode ? "#f0f0f8" : "#16162a",
    "--text-secondary": darkMode ? "rgba(240, 240, 248, 0.62)" : "rgba(22, 22, 42, 0.68)",
    "--text-muted": darkMode ? "rgba(240, 240, 248, 0.4)" : "rgba(22, 22, 42, 0.45)",
    "--text-faint": darkMode ? "rgba(240, 240, 248, 0.18)" : "rgba(22, 22, 42, 0.25)",
    "--accent": darkMode ? "#9b6dff" : "#4f8ef7",
    "--accent-hover": darkMode ? "#b08aff" : "#3b7cd8",
    "--accent-blue": "#4f8ef7",
    "--accent-purple": "#9b6dff",
    "--accent-green": "#3ecf8e",
    "--accent-orange": "#f7934c",
    "--accent-red": "#f76060",
    "--accent-cyan": "#38c9d8",
    "--accent-pink": "#f77eb8",
    "--success": "#3ecf8e",
    "--danger": "#f76060",
});

const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: { main: "#9b6dff" },
        secondary: { main: "#4f8ef7" },
        background: { default: "#08080d", paper: "#141420" },
        text: { primary: "#f0f0f8", secondary: "rgba(240,240,248,0.62)", disabled: "rgba(255,255,255,0.3)" },
        divider: "rgba(255,255,255,0.08)",
    },
    typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        h1: { fontWeight: 800, fontSize: "2.25rem" },
        h2: { fontWeight: 700, fontSize: "1.75rem" },
        h3: { fontWeight: 600, fontSize: "1.25rem" },
        h4: { fontWeight: 600, fontSize: "1.1rem" },
        body1: { fontWeight: 400, fontSize: "0.95rem" },
        body2: { fontWeight: 400, fontSize: "0.85rem" },
    },
    shape: { borderRadius: 14 },
    components: {
        MuiButton: {
            styleOverrides: {
                root: { textTransform: "none", fontWeight: 600, borderRadius: "12px" },
                contained: {
                    background: "linear-gradient(135deg, #6366F1, #818CF8)",
                    "&:hover": { background: "linear-gradient(135deg, #4F46E5, #6366F1)" },
                },
            },
        },
        MuiCard: { styleOverrides: { root: { backgroundImage: "none", border: "1px solid var(--border-medium)", background: "var(--bg-card)" } } },
        MuiPaper: { styleOverrides: { root: { backgroundImage: "none", border: "1px solid var(--border-medium)", background: "var(--bg-card)" } } },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    color: "var(--text-primary)",
                    borderRadius: "12px",
                    "& fieldset": { borderColor: "var(--border-medium)" },
                    "&:hover fieldset": { borderColor: "var(--accent)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--accent)" },
                },
            },
        },
        MuiInputLabel: { styleOverrides: { root: { color: "var(--text-secondary)", "&.Mui-focused": { color: "var(--accent)" } } } },
        MuiSwitch: {
            styleOverrides: {
                root: { "& .Mui-checked": { color: "var(--accent)" }, "& .Mui-checked + .MuiSwitch-track": { backgroundColor: "var(--accent)" } },
            },
        },
        MuiChip: { styleOverrides: { root: { borderRadius: "10px", fontWeight: 500 } } },
        MuiTooltip: { styleOverrides: { tooltip: { backgroundColor: "rgba(20,20,30,0.95)", color: "#fff", borderRadius: "8px", fontSize: "0.8rem" } } },
    },
});

const lightTheme = createTheme({
    palette: {
        mode: "light",
        primary: { main: "#4f8ef7" },
        secondary: { main: "#9b6dff" },
        background: { default: "#eef1f8", paper: "#ffffff" },
        text: { primary: "#16162a", secondary: "rgba(22,22,42,0.68)", disabled: "rgba(0,0,0,0.3)" },
        divider: "rgba(22,22,42,0.08)",
    },
    typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        h1: { fontWeight: 800, fontSize: "2.25rem" },
        h2: { fontWeight: 700, fontSize: "1.75rem" },
        h3: { fontWeight: 600, fontSize: "1.25rem" },
        h4: { fontWeight: 600, fontSize: "1.1rem" },
        body1: { fontWeight: 400, fontSize: "0.95rem" },
        body2: { fontWeight: 400, fontSize: "0.85rem" },
    },
    shape: { borderRadius: 14 },
    components: {
        MuiButton: {
            styleOverrides: {
                root: { textTransform: "none", fontWeight: 600, borderRadius: "12px" },
                contained: {
                    background: "linear-gradient(135deg, #4F46E5, #6366F1)",
                    "&:hover": { background: "linear-gradient(135deg, #4338CA, #4F46E5)" },
                },
            },
        },
        MuiCard: { styleOverrides: { root: { backgroundImage: "none", border: "1px solid var(--border-medium)", background: "var(--bg-card)" } } },
        MuiPaper: { styleOverrides: { root: { backgroundImage: "none", border: "1px solid var(--border-medium)", background: "var(--bg-card)" } } },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    color: "var(--text-primary)",
                    borderRadius: "12px",
                    "& fieldset": { borderColor: "var(--border-medium)" },
                    "&:hover fieldset": { borderColor: "var(--accent)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--accent)" },
                },
            },
        },
        MuiInputLabel: { styleOverrides: { root: { color: "var(--text-secondary)", "&.Mui-focused": { color: "var(--accent)" } } } },
        MuiChip: { styleOverrides: { root: { borderRadius: "10px", fontWeight: 500 } } },
        MuiTooltip: { styleOverrides: { tooltip: { backgroundColor: "rgba(245,245,245,0.95)", color: "var(--text-primary)", borderRadius: "8px", fontSize: "0.8rem" } } },
    },
});

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem("sn_theme");
        return saved ? saved === "dark" : false;
    });
    const setTheme = useCallback((mode) => setDarkMode(mode === "dark"), []);

    useEffect(() => {
        const vars = getCSSVariables(darkMode);
        Object.entries(vars).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
        });
        document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
        localStorage.setItem("sn_theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    const toggleTheme = useCallback(() => setDarkMode((p) => !p), []);

    const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

    return (
        <ThemeContext.Provider value={{ darkMode, toggleTheme, setTheme }}>
            <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
    return ctx;
};

export default ThemeContext;

