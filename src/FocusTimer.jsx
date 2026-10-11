import { useState, useEffect, useRef, useCallback } from "react";
import { Fab, Box, Typography, IconButton, Tooltip, Fade, Zoom } from "@mui/material";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SelfImprovementRoundedIcon from "@mui/icons-material/SelfImprovementRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { progressAPI } from "./api";
import { useTheme } from "./ThemeContext";

// Pomodoro presets. Focus sessions are the ones that count toward study stats.
const MODES = {
    focus: { label: "Focus", minutes: 25, color: "#9b6dff" },
    short: { label: "Short Break", minutes: 5, color: "#3ecf8e" },
    long: { label: "Long Break", minutes: 15, color: "#4f8ef7" },
};

const todayKey = () => new Date().toISOString().slice(0, 10);

// Subtle completion chime (best-effort; never throws).
const playChime = () => {
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        [880, 1174.7].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.value = freq;
            const t = ctx.currentTime + i * 0.18;
            gain.gain.setValueAtTime(0.0001, t);
            gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
            osc.connect(gain).connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.55);
        });
        setTimeout(() => ctx.close && ctx.close(), 1500);
    } catch {}
};

const FocusTimer = () => {
    const { darkMode } = useTheme();
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState("focus");
    const [running, setRunning] = useState(false);
    const [remaining, setRemaining] = useState(MODES.focus.minutes * 60);
    const [stats, setStats] = useState({ sessions: 0, minutes: 0, date: todayKey() });
    const [toast, setToast] = useState(null);
    const completedRef = useRef(false);
    const toastTimer = useRef(null);

    // Load today's stats (reset if a new day).
    useEffect(() => {
        try {
            const raw = localStorage.getItem("sn_focus_stats");
            if (raw) {
                const s = JSON.parse(raw);
                setStats(s.date === todayKey() ? s : { sessions: 0, minutes: 0, date: todayKey() });
            }
        } catch {}
    }, []);

    // Reset the clock whenever the mode changes.
    useEffect(() => {
        setRemaining(MODES[mode].minutes * 60);
        setRunning(false);
        completedRef.current = false;
    }, [mode]);

    // Tick every second while running.
    useEffect(() => {
        if (!running) return undefined;
        const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
        return () => clearInterval(id);
    }, [running]);

    const handleComplete = useCallback(() => {
        setRunning(false);
        playChime();
        if (mode === "focus") {
            const mins = MODES.focus.minutes;
            setStats((s) => {
                const ns = { sessions: s.sessions + 1, minutes: s.minutes + mins, date: todayKey() };
                try { localStorage.setItem("sn_focus_stats", JSON.stringify(ns)); } catch {}
                return ns;
            });
            progressAPI.logActivity(mins).catch(() => {}); // best-effort backend sync
            setToast({ icon: <CheckCircleRoundedIcon />, text: `Focus session done! +${mins} min logged. Time for a break.` });
        } else {
            setToast({ icon: <SelfImprovementRoundedIcon />, text: "Break over — ready for another focus round?" });
        }
    }, [mode]);

    // Fire completion exactly once when the timer reaches zero.
    useEffect(() => {
        if (remaining === 0) handleComplete();
        else completedRef.current = false;
    }, [remaining, handleComplete]);

    // Reflect the countdown in the tab title while running.
    useEffect(() => {
        if (running) {
            const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
            const ss = String(remaining % 60).padStart(2, "0");
            document.title = `${mm}:${ss} · ${MODES[mode].label} — Skill Navigator`;
        } else {
            document.title = "Skill Navigator";
        }
        return () => { document.title = "Skill Navigator"; };
    }, [remaining, running, mode]);

    // Auto-dismiss the toast.
    useEffect(() => {
        if (!toast) return undefined;
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 4500);
        return () => clearTimeout(toastTimer.current);
    }, [toast]);

    const total = MODES[mode].minutes * 60;
    const pct = total ? ((total - remaining) / total) * 100 : 0;
    const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
    const ss = String(remaining % 60).padStart(2, "0");
    const activeColor = MODES[mode].color;
    const RADIUS = 66;
    const CIRC = 2 * Math.PI * RADIUS;

    const accent = darkMode ? "#f0f0f8" : "#1a1a2e";
    const sub = darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.5)";
    const panelBg = darkMode
        ? "linear-gradient(180deg, rgba(14,14,22,0.98), rgba(6,6,12,0.98))"
        : "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,248,252,0.98))";
    const borderColor = darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
    const trackColor = darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

    const reset = () => { setRunning(false); setRemaining(total); completedRef.current = false; };

    return (
        <>
            {/* Toast */}
            <Zoom in={Boolean(toast)} unmountOnExit>
                <Box sx={{
                    position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 2000,
                    display: "flex", alignItems: "center", gap: 1.25, px: 2.5, py: 1.5, borderRadius: "14px",
                    background: darkMode ? "rgba(20,20,30,0.96)" : "rgba(255,255,255,0.98)",
                    border: `1px solid ${borderColor}`,
                    boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
                }}>
                    <Box sx={{ color: activeColor, display: "flex" }}>{toast?.icon}</Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: accent }}>{toast?.text}</Typography>
                </Box>
            </Zoom>

            {/* Floating panel + launcher — stacked ABOVE the AI chat button on the right so they never overlap */}
            <Box sx={{ position: "fixed", bottom: 96, right: 28, zIndex: 1500, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1.5 }}>
                <Zoom in={open} unmountOnExit>
                    <Box sx={{
                        width: 300, mb: 0.5, p: 3, borderRadius: "22px", background: panelBg,
                        border: `1px solid ${borderColor}`,
                        boxShadow: darkMode ? "0 24px 60px rgba(0,0,0,0.6)" : "0 24px 60px rgba(0,0,0,0.18)",
                        animation: "fadeInScale 0.3s ease both",
                    }}>
                        {/* Header */}
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
                                <TimerOutlinedIcon sx={{ fontSize: 18, color: activeColor }} />
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: accent }}>Focus Timer</Typography>
                            </Box>
                            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: sub }}>
                                <CloseRoundedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Box>

                        {/* Mode tabs */}
                        <Box sx={{ display: "flex", gap: 0.75, mb: 2.5 }}>
                            {Object.entries(MODES).map(([key, m]) => (
                                <Box key={key} onClick={() => setMode(key)} sx={{
                                    flex: 1, textAlign: "center", py: 0.75, borderRadius: "10px", cursor: "pointer",
                                    fontSize: 10.5, fontWeight: 600, transition: "all 0.2s ease",
                                    color: mode === key ? "#fff" : sub,
                                    background: mode === key ? m.color : "transparent",
                                    border: `1px solid ${mode === key ? m.color : borderColor}`,
                                    "&:hover": { borderColor: m.color },
                                }}>
                                    {m.label}
                                </Box>
                            ))}
                        </Box>

                        {/* Circular countdown */}
                        <Box sx={{ position: "relative", width: 156, height: 156, mx: "auto", mb: 2.5 }}>
                            <svg width="156" height="156" style={{ transform: "rotate(-90deg)" }}>
                                <circle cx="78" cy="78" r={RADIUS} fill="none" stroke={trackColor} strokeWidth="8" />
                                <circle cx="78" cy="78" r={RADIUS} fill="none" stroke={activeColor} strokeWidth="8"
                                    strokeLinecap="round" strokeDasharray={CIRC}
                                    strokeDashoffset={CIRC - (pct / 100) * CIRC}
                                    style={{ transition: "stroke-dashoffset 1s linear" }} />
                            </svg>
                            <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                <Typography sx={{ fontSize: 34, fontWeight: 800, color: accent, fontVariantNumeric: "tabular-nums", letterSpacing: "-1px" }}>
                                    {mm}:{ss}
                                </Typography>
                                <Typography sx={{ fontSize: 10, color: sub, textTransform: "uppercase", letterSpacing: "1px" }}>
                                    {running ? "In progress" : MODES[mode].label}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Controls */}
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, mb: 2.5 }}>
                            <Tooltip title="Reset">
                                <IconButton onClick={reset} sx={{ color: sub, border: `1px solid ${borderColor}`, width: 40, height: 40 }}>
                                    <StopRoundedIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                            </Tooltip>
                            <Fab onClick={() => setRunning((r) => !r)} sx={{
                                width: 58, height: 58, background: `linear-gradient(135deg, ${activeColor}, #4f8ef7)`,
                                color: "#fff", boxShadow: `0 10px 28px ${activeColor}55`,
                                "&:hover": { background: `linear-gradient(135deg, ${activeColor}, #4f8ef7)`, filter: "brightness(1.1)" },
                            }}>
                                {running ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon sx={{ fontSize: 30 }} />}
                            </Fab>
                            <Box sx={{ width: 40 }} />
                        </Box>

                        {/* Daily stats */}
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Box sx={{ flex: 1, p: 1.25, borderRadius: "12px", background: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", textAlign: "center" }}>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mb: 0.25 }}>
                                    <LocalFireDepartmentRoundedIcon sx={{ fontSize: 14, color: "#f7934c" }} />
                                    <Typography sx={{ fontSize: 16, fontWeight: 800, color: accent }}>{stats.sessions}</Typography>
                                </Box>
                                <Typography sx={{ fontSize: 9, color: sub }}>Sessions today</Typography>
                            </Box>
                            <Box sx={{ flex: 1, p: 1.25, borderRadius: "12px", background: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", textAlign: "center" }}>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mb: 0.25 }}>
                                    <TimerOutlinedIcon sx={{ fontSize: 14, color: "#3ecf8e" }} />
                                    <Typography sx={{ fontSize: 16, fontWeight: 800, color: accent }}>{stats.minutes}</Typography>
                                </Box>
                                <Typography sx={{ fontSize: 9, color: sub }}>Minutes focused</Typography>
                            </Box>
                        </Box>
                    </Box>
                </Zoom>

                {/* Launcher button */}
                <Tooltip title="Focus Timer (Pomodoro)" placement="left">
                    <Fab onClick={() => setOpen((o) => !o)} sx={{
                        background: running ? `linear-gradient(135deg, ${activeColor}, #4f8ef7)` : (darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"),
                        color: running ? "#fff" : accent,
                        border: `1px solid ${running ? activeColor : borderColor}`,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                        animation: running ? "pulseGlow 2s ease infinite" : "float 3s ease-in-out infinite",
                        "&:hover": { background: running ? `linear-gradient(135deg, ${activeColor}, #4f8ef7)` : (darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)") },
                    }}>
                        {running ? (
                            <Typography sx={{ fontSize: 13, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{mm}:{ss}</Typography>
                        ) : (
                            <TimerOutlinedIcon />
                        )}
                    </Fab>
                </Tooltip>
            </Box>
        </>
    );
};

export default FocusTimer;

