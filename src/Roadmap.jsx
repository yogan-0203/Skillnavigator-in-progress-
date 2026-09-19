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

const card = {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    background: "linear-gradient(145deg, rgba(255,255,255,0.045), rgba(255,255,255,0.012))",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.012), 0 20px 50px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.05)",
};

const STATUS_CONFIG = {
    Completed:   { color:"#3ecf8e", icon: <CheckCircleRoundedIcon sx={{ color:"#3ecf8e", fontSize:22 }} />, bg:"rgba(62,207,142,0.1)", border:"rgba(62,207,142,0.2)" },
    "In Progress":{ color:"#4f8ef7", icon: <PlayCircleRoundedIcon sx={{ color:"#4f8ef7", fontSize:22 }} />,  bg:"rgba(79,142,247,0.1)", border:"rgba(79,142,247,0.2)" },
    Upcoming:    { color:"rgba(255,255,255,0.25)", icon: <RadioButtonUncheckedRoundedIcon sx={{ color:"rgba(255,255,255,0.2)", fontSize:22 }} />, bg:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.07)" },
};

const Roadmap = () => {
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
            <CircularProgress sx={{ color:"rgba(255,255,255,0.3)" }} />
        </Box>
    );

    const { roadmap = [], targetCareer = "AI / ML Engineer",
        overallProgress = 0, completedSteps = 0, totalSteps = 0 } = data || {};

    return (
        <Box sx={{ width:"100%", minHeight:"100%", color:"#fff", pb:6, animation:"fadeIn 0.4s ease" }}>

            {/* Header */}
            <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", mb:4 }}>
                <Box>
                    <Typography sx={{ fontSize:10, letterSpacing:2.5, color:"rgba(255,255,255,0.28)", mb:1 }}>
                        AI PERSONALISED PATH
                    </Typography>
                    <Typography sx={{ fontSize:32, fontWeight:800,
                        background:"linear-gradient(135deg, #fff, rgba(62,207,142,0.8))",
                        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                        Learning Roadmap
                    </Typography>
                    <Typography sx={{ fontSize:13, color:"rgba(255,255,255,0.35)", mt:1 }}>
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
                    <Typography sx={{ fontSize:10, letterSpacing:1, color:"rgba(255,255,255,0.3)" }}>
                        OVERALL PROGRESS
                    </Typography>
                    <Typography sx={{ fontSize:38, fontWeight:800, mt:1, color:"#3ecf8e" }}>
                        {overallProgress}%
                    </Typography>
                    <LinearProgress variant="determinate" value={overallProgress}
                        sx={{ mt:1.5, height:5, borderRadius:10,
                            backgroundColor:"rgba(255,255,255,0.06)",
                            "& .MuiLinearProgress-bar": { background:"linear-gradient(90deg,#3ecf8e,#38c9d8)", borderRadius:10 } }} />
                </Box>
                <Box sx={{ ...card, p:3 }}>
                    <CheckCircleRoundedIcon sx={{ color:"#3ecf8e", mb:1 }} />
                    <Typography sx={{ fontSize:10, letterSpacing:1, color:"rgba(255,255,255,0.3)", mt:1 }}>STEPS COMPLETED</Typography>
                    <Typography sx={{ fontSize:38, fontWeight:800, color:"#3ecf8e" }}>
                        {completedSteps}
                    </Typography>
                    <Typography sx={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>
                        out of {totalSteps} steps
                    </Typography>
                </Box>
                <Box sx={{ ...card, p:3 }}>
                    <AccessTimeRoundedIcon sx={{ color:"#4f8ef7", mb:1 }} />
                    <Typography sx={{ fontSize:10, letterSpacing:1, color:"rgba(255,255,255,0.3)", mt:1 }}>TARGET CAREER</Typography>
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
                        background:"linear-gradient(180deg, rgba(62,207,142,0.4), rgba(79,142,247,0.2), rgba(255,255,255,0.05))",
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
                                        ? "1px solid rgba(255,255,255,0.05)" : "none",
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
                                                fontSize:10, color:"rgba(255,255,255,0.3)",
                                                fontWeight:700, letterSpacing:1,
                                            }}>
                                                {step.step}
                                            </Typography>
                                            <Typography className="step-title"
                                                sx={{ fontSize:15, fontWeight:600, color:"#fff",
                                                    transition:"color 0.2s" }}>
                                                {step.title}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display:"flex", alignItems:"center", gap:1.5 }}>
                                            <Chip label={step.status} size="small"
                                                sx={{ fontSize:10, color: cfg.color,
                                                    backgroundColor: cfg.bg, border:`1px solid ${cfg.border}` }} />
                                            {step.estimatedWeeks && (
                                                <Typography sx={{ fontSize:10, color:"rgba(255,255,255,0.25)" }}>
                                                    ~{step.estimatedWeeks}w
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>

                                    <Typography sx={{ color:"rgba(255,255,255,0.38)", fontSize:12, mt:0.7, lineHeight:1.6 }}>
                                        {step.description}
                                    </Typography>

                                    {/* Expanded detail */}
                                    {isExpanded && (
                                        <Box sx={{ mt:2, animation:"fadeIn 0.25s ease" }}>
                                            {step.skills?.length > 0 && (
                                                <Box sx={{ mb:1.5 }}>
                                                    <Typography sx={{ fontSize:10, color:"rgba(255,255,255,0.28)", mb:1, letterSpacing:1 }}>
                                                        SKILLS COVERED
                                                    </Typography>
                                                    <Box sx={{ display:"flex", flexWrap:"wrap", gap:0.8 }}>
                                                        {step.skills.map((s) => (
                                                            <Chip key={s} label={s} size="small"
                                                                sx={{ fontSize:10, color:"rgba(255,255,255,0.55)",
                                                                    backgroundColor:"rgba(255,255,255,0.07)",
                                                                    border:"1px solid rgba(255,255,255,0.1)" }} />
                                                        ))}
                                                    </Box>
                                                </Box>
                                            )}
                                            {step.resources?.length > 0 && (
                                                <Box>
                                                    <Typography sx={{ fontSize:10, color:"rgba(255,255,255,0.28)", mb:1, letterSpacing:1 }}>
                                                        RESOURCES
                                                    </Typography>
                                                    {step.resources.map((r) => (
                                                        <Typography key={r} sx={{ fontSize:11, color:"rgba(255,255,255,0.4)", mb:0.4 }}>
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
