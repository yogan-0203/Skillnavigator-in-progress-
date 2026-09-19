import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material";

const ThemeContext = createContext(null);

const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: { main: "#4f8ef7" },
        secondary: { main: "#9b6dff" },
        background: {
            default: "#030306",
            paper: "#08080c",
        },
        text: {
            primary: "#f0f0f8",
            secondary: "rgba(255,255,255,0.55)",
            disabled: "rgba(255,255,255,0.3)",
        },
        divider: "rgba(255,255,255,0.06)",
    },
    typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    },
    shape: { borderRadius: 12 },
    components: {
        MuiButton: {
            styleOverrides: {
                root: { textTransform: "none", fontWeight: 600 },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: { backgroundImage: "none" },
            },
        },
    },
});

const lightTheme = createTheme({
    palette: {
        mode: "light",
        primary: { main: "#4f8ef7" },
        secondary: { main: "#9b6dff" },
        background: {
            default: "#f5f5f8",
            paper: "#ffffff",
        },
        text: {
            primary: "#1a1a2e",
            secondary: "rgba(0,0,0,0.6)",
            disabled: "rgba(0,0,0,0.3)",
        },
        divider: "rgba(0,0,0,0.08)",
    },
    typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    },
    shape: { borderRadius: 12 },
    components: {
        MuiButton: {
            styleOverrides: {
                root: { textTransform: "none", fontWeight: 600 },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: { backgroundImage: "none" },
            },
        },
    },
});

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem("sn_theme");
        return saved ? saved === "dark" : true;
    });

    useEffect(() => {
        localStorage.setItem("sn_theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    const toggleTheme = () => setDarkMode((p) => !p);

    const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

    return (
        <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
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
