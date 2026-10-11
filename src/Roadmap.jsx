import { useState, useEffect } from "react";
import { Box, Typography, Chip, Button, CircularProgress, LinearProgress } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import { useNavigate } from "react-router-dom";
import { roadmapAPI } from "./api";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { getTokens, ACCENTS } from "./theme/tokens";
import { ClayCard, GlassPanel, ClayButton, PageHeader, StatTile, SegmentTabs, EmptyState, LoadingState, ChartTooltip } from "./theme/Clay";


const Roadmap = () => {
    const { darkMode } = useTheme();
    const t = getTokens(darkMode);
    const tx = t.text;
    const STATUS_CONFIG = {
        Completed:   { color: "#3ecf8e", icon: <CheckCircleRoundedIcon sx={{ color: "#3ecf8e", fontSize: 22 }} />, bg: "rgba(62,207,142,0.1)", border: "rgba(62,207,142,0.2)" },
        "In Progress": { color: "#4f8ef7", icon: <PlayCircleRoundedIcon sx={{ color: "#4f8ef7", fontSize: 22 }} />, bg: "rgba(79,142,247,0.1)", border: "rgba(79,142,247,0.2)" },
        Upcoming: { color: tx.muted, icon: <RadioButtonUncheckedRoundedIcon sx={{ color: tx.secondary, fontSize: 22 }} />, bg: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)", border: darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)" },
    };
    const card = { border: `1px solid ${t.border.subtle}`, borderRadius: "20px", background: t.glass.face };
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data: d } = await roadmapAPI.get();
                setData(d);
            } catch {
                const { data: d } = await roadmapAPI.getPublic();
                setData(d);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) return (
        <Box sx={{ display:"flex", alignItems:"center", justifyContent:"center", height:"80vh" }}>
            <CircularProgress sx={{ color: t.text.secondary }} />
        </Box>
    );

    const { roadmap = [], targetCareer = "AI / ML Engineer",
        overallProgress = 0, completedSteps = 0, totalSteps = 0 } = data || {};

    return (
        <Box className="stagger" sx={{ width: "100%", minHeight: "100%", color: t.text.primary, pb:6, animation:"fadeIn 0.4s ease" }}>

            {/* Header */}
            <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", mb:4 }}>
                <Box>
                    <Typography sx={{ fontSize:10, letterSpacing:2.5, color: t.text.muted, mb:1 }}>
                        AI PERSONALISED PATH
                    </Typography>
                    <Typography sx={{ fontSize:32, fontWeight:800,
                        background: t.dark ? "linear-gradient(135deg, #fff, rgba(62,207,142,0.8))" : `linear-gradient(135deg, ${t.text.primary}, #3ecf8e)`,
                        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                        Learning Roadmap
                    </Typography>
                    <Typography sx={{ fontSize:13, color: t.text.muted, mt:1 }}>
                        Your personalised career journey to become a {targetCareer}
                    </Typography>
                </Box>
                <Chip icon={<AutoAwesomeRoundedIcon />} label="AI Generated"
                    sx={{ color:"#3ecf8e", backgroundColor:"rgba(62,207,142,0.1)",
                        border:"1px solid rgba(62,207,142,0.2)",
                        "& .MuiChip-icon": { color:"#3ecf8e" } }} />
            </Box>

            {/* Progress overview */}
            <Box sx={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:2, mb:3 }}>
                <Box sx={{ ...card, p:3 }}>
                    <Typography sx={{ fontSize:10, letterSpacing:1, color: t.text.secondary }}>
                        OVERALL PROGRESS
                    </Typography>
                    <Typography sx={{ fontSize:38, fontWeight:800, mt:1, color:"#3ecf8e" }}>
                        {overallProgress}%
                    </Typography>
                    <LinearProgress variant="determinate" value={overallProgress}
                        sx={{ mt:1.5, height:5, borderRadius:10,
                            backgroundColor: `${t.glass.inset}`,
                            "& .MuiLinearProgress-bar": { background:"linear-gradient(90deg,#3ecf8e,#38c9d8)", borderRadius:10 } }} />
                </Box>
                <Box sx={{ ...card, p:3 }}>
                    <CheckCircleRoundedIcon sx={{ color:"#3ecf8e", mb:1 }} />
                    <Typography sx={{ fontSize:10, letterSpacing:1, color: t.text.secondary, mt:1 }}>STEPS COMPLETED</Typography>
                    <Typography sx={{ fontSize:38, fontWeight:800, color:"#3ecf8e" }}>
                        {completedSteps}
                    </Typography>
                    <Typography sx={{ fontSize:11, color: t.text.secondary }}>
                        out of {totalSteps} steps
                    </Typography>
                </Box>
                <Box sx={{ ...card, p:3 }}>
                    <AccessTimeRoundedIcon sx={{ color:"#4f8ef7", mb:1 }} />
                    <Typography sx={{ fontSize:10, letterSpacing:1, color: t.text.secondary, mt:1 }}>TARGET CAREER</Typography>
                    <Typography sx={{ fontSize:16, fontWeight:700, mt:1 }}>{targetCareer}</Typography>
                </Box>
            </Box>

            {/* Roadmap steps */}
            <Box sx={{ ...card, p:3 }}>
                <Typography sx={{ fontSize:18, fontWeight:600, mb:3 }}>Learning Path</Typography>

                <Box sx={{ position:"relative" }}>
                    {/* Vertical line */}
                    <Box sx={{
                        position:"absolute", left:10, top:24, bottom:24, width:2,
                        background:`linear-gradient(180deg, rgba(62,207,142,0.4), rgba(79,142,247,0.2), ${darkMode ? "rgba(255,255,255,0.05)" : "rgba(22,22,42,0.06)"})`,
                        borderRadius:2, zIndex:0,
                    }} />

                    {roadmap.map((step, idx) => {
                        const cfg = STATUS_CONFIG[step.status] || STATUS_CONFIG.Upcoming;
                        const isExpanded = expanded === idx;

                        return (
                            <Box
                                key={step.step}
                                sx={{
                                    display:"flex", gap:3, py:2.5, position:"relative", zIndex:1,
                                    borderBottom: idx < roadmap.length - 1
                                        ? (darkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(22,22,42,0.08)") : "none",
                                    cursor:"pointer",
                                    "&:hover .step-title": { color: cfg.color },
                                }}
                                onClick={() => setExpanded(isExpanded ? null : idx)}
                            >
                                {/* Status icon */}
                                <Box sx={{ flexShrink:0, pt:0.5 }}>{cfg.icon}</Box>

                                <Box sx={{ flex:1 }}>
                                    <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                                        <Box sx={{ display:"flex", alignItems:"center", gap:1.5 }}>
                                            <Typography sx={{
                                                fontSize:10, color: t.text.secondary,
                                                fontWeight:700, letterSpacing:1,
                                            }}>
                                                {step.step}
                                            </Typography>
                                            <Typography className="step-title"
                                                sx={{ fontSize:15, fontWeight:600, color: t.text.primary,
                                                    transition:"color 0.2s" }}>
                                                {step.title}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display:"flex", alignItems:"center", gap:1.5 }}>
                                            <Chip label={step.status} size="small"
                                                sx={{ fontSize:10, color: cfg.color,
                                                    backgroundColor: cfg.bg, border:`1px solid ${cfg.border}` }} />
                                            {step.estimatedWeeks && (
                                                <Typography sx={{ fontSize:10, color: t.text.muted }}>
                                                    ~{step.estimatedWeeks}w
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>

                                    <Typography sx={{ color: t.text.muted, fontSize:12, mt:0.7, lineHeight:1.6 }}>
                                        {step.description}
                                    </Typography>

                                    {/* Expanded detail */}
                                    {isExpanded && (
                                        <Box sx={{ mt:2, animation:"fadeIn 0.25s ease" }}>
                                            {step.skills?.length > 0 && (
                                                <Box sx={{ mb:1.5 }}>
                                                    <Typography sx={{ fontSize:10, color: t.text.muted, mb:1, letterSpacing:1 }}>
                                                        SKILLS COVERED
                                                    </Typography>
                                                    <Box sx={{ display:"flex", flexWrap:"wrap", gap:0.8 }}>
                                                        {step.skills.map((s) => (
                                                            <Chip key={s} label={s} size="small"
                                                                sx={{ fontSize:10, color: t.text.secondary,
                                                                    backgroundColor: `${t.glass.chip}`,
                                                                    border: `1px solid ${t.border.subtle}` }} />
                                                        ))}
                                                    </Box>
                                                </Box>
                                            )}
                                            {step.resources?.length > 0 && (
                                                <Box>
                                                    <Typography sx={{ fontSize:10, color: t.text.muted, mb:1, letterSpacing:1 }}>
                                                        RESOURCES
                                                    </Typography>
                                                    {step.resources.map((r) => (
                                                        <Typography key={r} sx={{ fontSize:11, color: t.text.secondary, mb:0.4 }}>
                                                            • {r}
                                                        </Typography>
                                                    ))}
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            <Box sx={{ mt:2, textAlign:"center" }}>
                <Button
                    onClick={() => navigate("/courses")}
                    variant="outlined"
                    endIcon={<ArrowForwardRoundedIcon />}
                    sx={{ color:"#3ecf8e", borderColor:"rgba(62,207,142,0.3)", borderRadius:"14px",
                        textTransform:"none", px:4, py:1.5,
                        "&:hover": { borderColor:"#3ecf8e", backgroundColor:"rgba(62,207,142,0.07)" } }}>
                    Start a course to progress
                </Button>
            </Box>
        </Box>
    );
};

export default Roadmap;
