import { useState, useEffect } from "react";
import { Box, Typography, Chip, CircularProgress, ToggleButtonGroup, ToggleButton } from "@mui/material";

import LeaderboardRoundedIcon from "@mui/icons-material/LeaderboardRounded";
import { leaderboardAPI } from "./api";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { getTokens, ACCENTS } from "./theme/tokens";
import { ClayCard, GlassPanel, ClayButton, PageHeader, StatTile, SegmentTabs, EmptyState, LoadingState, ChartTooltip } from "./theme/Clay";


const TIER = {
    gold:     { color: "#ffd166", bg: "rgba(255,209,102,0.14)", border: "rgba(255,209,102,0.4)",  medal: "1" },
    silver:   { color: "#cfd8e3", bg: "rgba(207,216,227,0.12)", border: "rgba(207,216,227,0.32)", medal: "2" },
    bronze:   { color: "#f7934c", bg: "rgba(247,147,76,0.14)",  border: "rgba(247,147,76,0.36)",  medal: "3" },
    standard: { color: "#8a92a6", bg: "rgba(138,146,166,0.12)", border: "rgba(138,146,166,0.28)", medal: "" },
};

const Leaderboard = () => {
    const { darkMode } = useTheme();
    const t = getTokens(darkMode);
    const tx = t.text;
    const card = { border: `1px solid ${t.border.subtle}`, borderRadius: "20px", background: t.glass.face };
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [metric, setMetric] = useState("xp");

    useEffect(() => {
        const load = async () => {
            try {
                const { data: d } = await leaderboardAPI.get();
                setData(d);
            } catch {
                setData({ leaderboard: [], myRank: null, totalStudents: 0 });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
            <CircularProgress sx={{ color: t.text.secondary }} />
        </Box>
    );

    const entries = [...(data?.leaderboard || [])];
    // Local re-sort so the toggle feels instant (server returns XP order)
    if (metric === "skill") entries.sort((a, b) => b.overallSkill - a.overallSkill);
    else if (metric === "streak") entries.sort((a, b) => b.streak - a.streak);
    else entries.sort((a, b) => b.xp - a.xp);

    const rest = entries.slice(3);

    return (
        <Box className="stagger" sx={{ width: "100%", minHeight: "100%", color: t.text.primary, pb: 6, animation: "fadeIn 0.4s ease" }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                mb: 4, flexWrap: "wrap", gap: 2 }}>
                <Box>
                    <Typography sx={{ fontSize: 10, letterSpacing: 2.5, color: t.text.muted, mb: 1 }}>
                        COMPETE & STAY MOTIVATED
                    </Typography>
                    <Typography sx={{ fontSize: 32, fontWeight: 800,
                        background: t.dark ? "linear-gradient(135deg, #fff, rgba(255,209,102,0.9))" : `linear-gradient(135deg, ${t.text.primary}, #f59e0b)`,
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        Leaderboard
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: t.text.muted, mt: 1 }}>
                        Where you stand among {data?.totalStudents || 0} learners. Consistency beats intensity.
                    </Typography>
                </Box>

                <ToggleButtonGroup exclusive size="small" value={metric}
                    onChange={(_, v) => v && setMetric(v)}
                    sx={{ "& .MuiToggleButton-root": {
                        color: t.text.secondary, textTransform: "none", fontSize: 12,
                        fontWeight: 600, border: `1px solid ${t.border.subtle}`, px: 2,
                        "&.Mui-selected": { color: t.text.primary,
                            background: "linear-gradient(135deg, rgba(155,109,255,0.3), rgba(79,142,247,0.25))",
                            borderColor: "rgba(155,109,255,0.5)" } } }}>
                    <ToggleButton value="xp">XP</ToggleButton>
                    <ToggleButton value="skill">Skill</ToggleButton>
                    <ToggleButton value="streak">Streak</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Your rank strip */}
            <Box sx={{ ...card, p: 3, mb: 3, display: "flex", alignItems: "center", gap: 3,
                flexWrap: "wrap", border: "1px solid rgba(155,109,255,0.3)" }}>
                <Box sx={{ width: 52, height: 52, borderRadius: "16px", display: "flex", alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, rgba(155,109,255,0.25), rgba(79,142,247,0.2))",
                    border: "1px solid rgba(155,109,255,0.35)" }}>
                    <LeaderboardRoundedIcon sx={{ color: "#9b6dff", fontSize: 26 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 160 }}>
                    <Typography sx={{ fontSize: 11, color: t.text.muted }}>YOUR RANK</Typography>
                    <Typography sx={{ fontSize: 26, fontWeight: 800 }}>
                        #{data?.myRank || "—"}
                        <span style={{ fontSize: 13, fontWeight: 500, color: t.text.secondary }}>
                            {" "}of {data?.totalStudents || 0}
                        </span>
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 3 }}>
                    {[
                        { v: user?.xp || 0,   l: "XP",     c: "#9b6dff" },
                        { v: user?.level || 1, l: "LEVEL", c: "#4f8ef7" },
                        { v: user?.streak || 0, l: "STREAK", c: "#f7934c" },
                    ].map((s) => (
                        <Box key={s.l} sx={{ textAlign: "center" }}>
                            <Typography sx={{ fontSize: 18, fontWeight: 800, color: s.c }}>{s.v}</Typography>
                            <Typography sx={{ fontSize: 10, color: t.text.muted }}>{s.l}</Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Podium — top 3 */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                gap: 2, mb: 3, alignItems: "end" }}>
                {entries.slice(0, 3).map((e, i) => {
                    const tier = TIER[e.tier] || TIER.standard;
                    const order = [1, 0, 2].indexOf(i);   // visual: 2nd, 1st, 3rd
                    return (
                        <Box key={e.id} sx={{ ...card, p: 3, textAlign: "center",
                            order: { sm: order },
                            border: `1px solid ${tier.border}`,
                            background: `linear-gradient(145deg, ${tier.bg}, rgba(255,255,255,0.012))`,
                            animation: `clayPop 0.5s ease both`,
                            animationDelay: `${0.1 + order * 0.12}s`,
                            transform: i === 0 ? { sm: "translateY(-8px)" } : "none" }}>
                            <Typography sx={{ fontSize: 30, fontWeight: 800, color: tier.color, lineHeight: 1 }}>
                                {tier.medal}
                            </Typography>
                            <Typography sx={{ fontSize: 16, fontWeight: 700, mt: 1.5 }}>
                                {e.isMe ? "You" : e.name}
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: t.text.muted, mt: 0.5 }}>
                                {e.targetCareer || "Student"}
                            </Typography>
                            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
                                <Box>
                                    <Typography sx={{ fontSize: 15, fontWeight: 800, color: tier.color }}>{e.xp}</Typography>
                                    <Typography sx={{ fontSize: 9, color: t.text.secondary }}>XP</Typography>
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#4f8ef7" }}>{e.level}</Typography>
                                    <Typography sx={{ fontSize: 9, color: t.text.secondary }}>LVL</Typography>
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#f7934c" }}>{e.streak}</Typography>
                                    <Typography sx={{ fontSize: 9, color: t.text.secondary }}>DAY</Typography>
                                </Box>
                            </Box>
                        </Box>
                    );
                })}
            </Box>

            {/* Remaining ranks */}
            <Box sx={{ ...card, overflow: "hidden" }}>
                {rest.map((e, i) => {
                    return (
                        <Box key={e.id} sx={{ display: "flex", alignItems: "center", gap: 2,
                            px: 3, py: 2,
                            animation: "fadeIn 0.4s ease both",
                            animationDelay: `${i * 0.04}s`,
                            borderBottom: `1px solid ${t.border.subtle}`,
                            background: e.isMe ? "rgba(155,109,255,0.08)" : "transparent" }}>
                            <Typography sx={{ width: 32, fontSize: 14, fontWeight: 700,
                                color: t.text.secondary, textAlign: "center" }}>
                                {i + 4}
                            </Typography>
                            <Box sx={{ width: 36, height: 36, borderRadius: "12px", flexShrink: 0,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 14, fontWeight: 700,
                                background: e.isMe ? "rgba(155,109,255,0.25)" : (darkMode ? "rgba(255,255,255,0.06)" : "rgba(22,22,42,0.05)"),
                                border: `1px solid ${e.isMe ? "rgba(155,109,255,0.4)" : (darkMode ? "rgba(255,255,255,0.09)" : "rgba(22,22,42,0.08)")}` }}>
                                {(e.name || "S")[0].toUpperCase()}
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontSize: 14, fontWeight: 650,
                                    color: e.isMe ? (darkMode ? "#c9b6ff" : "#7c3aed") : t.text.primary }}>
                                    {e.isMe ? "You" : e.name}
                                </Typography>
                                <Typography sx={{ fontSize: 11, color: t.text.muted }}>
                                    Lvl {e.level} · {e.overallSkill}% overall skill
                                </Typography>
                            </Box>
                            <Chip label={`${e.streak}d`} size="small"
                                sx={{ fontSize: 10, height: 20, color: "#f7934c",
                                    backgroundColor: "rgba(247,147,76,0.12)",
                                    border: "1px solid rgba(247,147,76,0.25)" }} />
                            <Typography sx={{ fontSize: 14, fontWeight: 800, color: t.text.primary,
                                minWidth: 60, textAlign: "right" }}>
                                {metric === "skill" ? `${e.overallSkill}%`
                                    : metric === "streak" ? `${e.streak}d`
                                    : e.xp}
                            </Typography>
                        </Box>
                    );
                })}

                {entries.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 8, color: t.text.secondary }}>
                        <LeaderboardRoundedIcon sx={{ fontSize: 48, mb: 2, opacity: 0.4 }} />
                        <Typography>No students on the board yet.</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default Leaderboard;

