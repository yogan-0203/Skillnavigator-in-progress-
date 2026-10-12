import { useState, useEffect } from "react";
import {
    Box, Typography, LinearProgress, Chip, Button, CircularProgress,
} from "@mui/material";
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, RadarChart, Radar,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import { useNavigate } from "react-router-dom";
import { gapAPI } from "./api";
import { useTheme } from "./ThemeContext";
import { getTokens, ACCENTS } from "./theme/tokens";
import { ClayCard, GlassPanel, ClayButton, PageHeader, StatTile, SegmentTabs, EmptyState, LoadingState, ChartTooltip } from "./theme/Clay";


const CustomTooltip = ({ active, payload, label }) => {
    const { darkMode } = useTheme();
    const t = getTokens(darkMode);
    const tx = t.text;
    const card = { border: `1px solid ${t.border.subtle}`, borderRadius: "20px", background: t.glass.face };
    if (active && payload && payload.length) {
        return (
            <Box sx={{
                background: `${t.glass.panel}`, border: `1px solid ${t.border.subtle}`,
                borderRadius:"12px", p:2, minWidth:160,
            }}>
                <Typography sx={{ fontSize:12, fontWeight:700, mb:1 }}>{label}</Typography>
                {payload.map((entry) => (
                    <Box key={entry.name} sx={{ display:"flex", justifyContent:"space-between", gap:3, mb:0.5 }}>
                        <Typography sx={{ fontSize:11, color: entry.name === "Current" ? "#4f8ef7" : "#9b6dff" }}>
                            {entry.name}
                        </Typography>
                        <Typography sx={{ fontSize:11, fontWeight:600, color: t.text.primary }}>
                            {entry.value}%
                        </Typography>
                    </Box>
                ))}
            </Box>
        );
    }
    return null;
};

const GapAnalysis = () => {
    const { darkMode } = useTheme();
    const t = getTokens(darkMode);
    const tx = t.text;
    const card = { border: `1px solid ${t.border.subtle}`, borderRadius: "20px", background: t.glass.face };
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chartType, setChartType] = useState("bar"); // "bar" | "radar"

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data: d } = await gapAPI.get();
                setData(d);
            } catch {
                // demo fallback
                setData({
                    skillData: [
                        { skill:"Python", current:0, required:85, gap:85 },
                        { skill:"Machine Learning", current:0, required:90, gap:90 },
                        { skill:"Deep Learning", current:0, required:85, gap:85 },
                        { skill:"SQL", current:0, required:80, gap:80 },
                        { skill:"Statistics", current:0, required:82, gap:82 },
                        { skill:"NLP", current:0, required:75, gap:75 },
                    ],
                    gaps: [],
                    overallReadiness: 0,
                    totalGaps: 6,
                    targetCareer: "AI / ML Engineer",
                    aiRecommendation: "Start with assessments to see your personalised gap analysis.",
                });
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

    const { skillData = [], gaps = [], overallReadiness = 0, totalGaps = 0,
        targetCareer = "AI / ML Engineer", aiRecommendation = "" } = data || {};

    const gapLevel = (gap) => {
        if (gap >= 30) return { label:"Critical", color:"#f76060" };
        if (gap >= 15) return { label:"High", color:"#f7934c" };
        return { label:"Medium", color:"#4f8ef7" };
    };

    return (
        <Box className="stagger" sx={{ width: "100%", minHeight: "100%", color: t.text.primary, pb:5, animation:"fadeIn 0.4s ease" }}>

            {/* Header */}
            <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", mb:4 }}>
                <Box>
                    <Typography sx={{ fontSize:10, letterSpacing:2.5, color: t.text.muted, mb:1 }}>
                        AI SKILL INTELLIGENCE
                    </Typography>
                    <Typography sx={{ fontSize:32, fontWeight:800,
                        background: t.dark ? "linear-gradient(135deg, #fff, rgba(155,109,255,0.8))" : `linear-gradient(135deg, ${t.text.primary}, #9b6dff)`,
                        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                        Gap Analysis
                    </Typography>
                    <Typography sx={{ fontSize:13, color: t.text.muted, mt:1 }}>
                        Understand exactly which skills you need to improve for your target career.
                    </Typography>
                </Box>
                <Chip
                    icon={<AutoAwesomeRoundedIcon />}
                    label="AI Analysis Active"
                    sx={{ color:"#9b6dff", backgroundColor:"rgba(155,109,255,0.1)",
                        border:"1px solid rgba(155,109,255,0.2)",
                        "& .MuiChip-icon": { color:"#9b6dff" } }}
                />
            </Box>

            {/* Stat cards */}
            <Box sx={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:2, mb:2 }}>
                <Box sx={{ ...card, p:3 }}>
                    <Typography sx={{ fontSize:10, letterSpacing:1, color: t.text.secondary }}>
                        OVERALL READINESS
                    </Typography>
                    <Typography sx={{ fontSize:42, fontWeight:800, mt:1,
                        color: overallReadiness >= 70 ? "#3ecf8e" : overallReadiness >= 40 ? "#f7934c" : "#f76060" }}>
                        {overallReadiness}%
                    </Typography>
                    <LinearProgress variant="determinate" value={overallReadiness}
                        sx={{ mt:1.5, height:5, borderRadius:10,
                            backgroundColor: `${t.glass.inset}`,
                            "& .MuiLinearProgress-bar": {
                                background: overallReadiness >= 70
                                    ? "linear-gradient(90deg, #3ecf8e, #38c9d8)"
                                    : overallReadiness >= 40
                                    ? "linear-gradient(90deg, #f7934c, #f76060)"
                                    : "linear-gradient(90deg, #f76060, #9b6dff)",
                                borderRadius:10,
                            }}} />
                </Box>
                <Box sx={{ ...card, p:3 }}>
                    <Typography sx={{ fontSize:10, letterSpacing:1, color: t.text.secondary }}>
                        TOTAL SKILL GAPS
                    </Typography>
                    <Typography sx={{ fontSize:42, fontWeight:800, mt:1, color:"#f7934c" }}>
                        {totalGaps}
                    </Typography>
                    <Typography sx={{ fontSize:11, color: t.text.secondary, mt:1 }}>
                        Skills requiring improvement
                    </Typography>
                </Box>
                <Box sx={{ ...card, p:3 }}>
                    <Typography sx={{ fontSize:10, letterSpacing:1, color: t.text.secondary }}>
                        TARGET CAREER
                    </Typography>
                    <Typography sx={{ fontSize:18, fontWeight:700, mt:2, color: t.text.primary }}>
                        {targetCareer}
                    </Typography>
                    <Box sx={{ display:"flex", alignItems:"center", gap:0.8, mt:1 }}>
                        <TrendingUpRoundedIcon sx={{ fontSize:14, color:"#4f8ef7" }} />
                        <Typography sx={{ fontSize:11, color: t.text.secondary }}>
                            Current career target
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Chart toggle + chart */}
            <Box sx={{ ...card, p:3, mb:2 }}>
                <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:3 }}>
                    <Box>
                        <Typography sx={{ fontSize:18, fontWeight:600 }}>
                            Current vs Required Skills
                        </Typography>
                        <Typography sx={{ fontSize:11, color: t.text.muted, mt:0.5 }}>
                            Your proficiency vs required level for {targetCareer}
                        </Typography>
                    </Box>
                    <Box sx={{ display:"flex", gap:1 }}>
                        {["bar", "radar"].map((type) => (
                            <Button key={type} size="small"
                                onClick={() => setChartType(type)}
                                sx={{
                                    textTransform:"none", fontSize:11, borderRadius:"10px",
                                    minWidth:70, px:2,
                                    backgroundColor: chartType === type ? "rgba(79,142,247,0.15)" : "transparent",
                                    color: chartType === type ? "#4f8ef7" : t.text.secondary,
                                    border: chartType === type ? "1px solid rgba(79,142,247,0.3)" : "1px solid transparent",
                                    "&:hover": { backgroundColor:"rgba(79,142,247,0.08)" },
                                }}>
                                {type === "bar" ? "Bar" : "Radar"}
                            </Button>
                        ))}
                    </Box>
                </Box>

                <Box sx={{ width:"100%", height:340 }}>
                    <ResponsiveContainer>
                        {chartType === "bar" ? (
                            <BarChart data={skillData} margin={{ top:10, right:20, left:-20, bottom:5 }}>
                                <CartesianGrid stroke={t.chart.grid} vertical={false} />
                                <XAxis dataKey="skill" tick={{ fill: t.chart.tick, fontSize:10 }}
                                    axisLine={false} tickLine={false} />
                                <YAxis domain={[0,100]}
                                    tick={{ fill: t.chart.tickFaint, fontSize:10 }}
                                    axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    wrapperStyle={{ fontSize:11, color: t.text.secondary, paddingTop:12 }} />
                                <Bar dataKey="current" name="Current" fill="#4f8ef7"
                                    radius={[5,5,0,0]} isAnimationActive={false} />
                                <Bar dataKey="required" name="Required" fill="#9b6dff"
                                    radius={[5,5,0,0]} isAnimationActive={false} />
                            </BarChart>
                        ) : (
                            <RadarChart data={skillData}>
                                <PolarGrid stroke={t.chart.grid} />
                                <PolarAngleAxis dataKey="skill"
                                    tick={{ fill: t.chart.tick, fontSize:10 }} />
                                <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false} />
                                <Radar name="Current" dataKey="current"
                                    stroke="#4f8ef7" fill="#4f8ef7" fillOpacity={0.15} />
                                <Radar name="Required" dataKey="required"
                                    stroke="#9b6dff" fill="#9b6dff" fillOpacity={0.1} />
                                <Legend wrapperStyle={{ fontSize:11, color: t.text.secondary }} />
                                <Tooltip content={<CustomTooltip />} />
                            </RadarChart>
                        )}
                    </ResponsiveContainer>
                </Box>
            </Box>

            {/* Priority Gaps */}
            {gaps.length > 0 && (
                <Box sx={{ ...card, p:3, mb:2 }}>
                    <Box sx={{ display:"flex", alignItems:"center", gap:1.5, mb:3 }}>
                        <WarningAmberRoundedIcon sx={{ color:"#f7934c" }} />
                        <Box>
                            <Typography sx={{ fontSize:18, fontWeight:600 }}>Priority Skill Gaps</Typography>
                            <Typography sx={{ fontSize:11, color: t.text.muted, mt:0.5 }}>
                                Skills that need the most attention
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:2 }}>
                        {gaps.map((item) => {
                            const lvl = gapLevel(item.gap || (item.required - item.current));
                            return (
                                <Box key={item.name || item.skill}
                                    sx={{ p:2.5, borderRadius:"15px",
                                        border:`1px solid ${lvl.color}22`,
                                        backgroundColor:`${lvl.color}08` }}>
                                    <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                                        <Typography sx={{ fontSize:13, fontWeight:700 }}>
                                            {item.name || item.skill}
                                        </Typography>
                                        <Chip label={lvl.label} size="small"
                                            sx={{ fontSize:9, color:lvl.color,
                                                backgroundColor:`${lvl.color}18`,
                                                border:`1px solid ${lvl.color}30` }} />
                                    </Box>
                                    <Box sx={{ display:"flex", justifyContent:"space-between", mt:2, mb:0.8 }}>
                                        <Typography sx={{ fontSize:10, color: t.text.muted }}>
                                            Current {item.current}%
                                        </Typography>
                                        <Typography sx={{ fontSize:10, color: t.text.muted }}>
                                            Required {item.required}%
                                        </Typography>
                                    </Box>
                                    <Box sx={{ position:"relative", height:6, borderRadius:10,
                                        backgroundColor: `${t.glass.inset}` }}>
                                        <Box sx={{ position:"absolute", height:"100%", borderRadius:10,
                                            width:`${item.required}%`, backgroundColor:`${lvl.color}30` }} />
                                        <Box sx={{ position:"absolute", height:"100%", borderRadius:10,
                                            width:`${item.current}%`,
                                            background:`linear-gradient(90deg, ${lvl.color}, ${lvl.color}88)` }} />
                                    </Box>
                                    <Typography sx={{ fontSize:10, color: t.text.muted, mt:1 }}>
                                        Gap: {item.gap}% to close
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            )}

            {/* AI Recommendation */}
            <Box sx={{ ...card, p:3, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <Box sx={{ display:"flex", alignItems:"center", gap:2 }}>
                    <Box sx={{ width:48, height:48, borderRadius:"14px", display:"flex",
                        alignItems:"center", justifyContent:"center",
                        background:"linear-gradient(135deg, rgba(155,109,255,0.2), rgba(79,142,247,0.2))",
                        border:"1px solid rgba(155,109,255,0.25)" }}>
                        <PsychologyRoundedIcon sx={{ color:"#9b6dff" }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize:16, fontWeight:600 }}>AI Recommendation</Typography>
                        <Typography sx={{ fontSize:11, color: t.text.muted, mt:0.5, maxWidth:480 }}>
                            {aiRecommendation}
                        </Typography>
                    </Box>
                </Box>
                <Button variant="outlined" endIcon={<ArrowForwardRoundedIcon />}
                    onClick={() => navigate("/roadmap")}
                    sx={{ color:"#9b6dff", borderColor:"rgba(155,109,255,0.3)", borderRadius:"12px",
                        textTransform:"none", fontSize:11, whiteSpace:"nowrap",
                        "&:hover": { borderColor:"#9b6dff", backgroundColor:"rgba(155,109,255,0.07)" } }}>
                    View Learning Path
                </Button>
            </Box>
        </Box>
    );
};

export default GapAnalysis;
