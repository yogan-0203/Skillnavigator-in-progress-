import { useState, useEffect } from "react";
import { Box, Typography, LinearProgress, Chip, CircularProgress, Button } from "@mui/material";
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, BarChart, Bar,
} from "recharts";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import WhatshotRoundedIcon from "@mui/icons-material/WhatshotRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useNavigate } from "react-router-dom";
import { progressAPI } from "./api";
import { useAuth } from "./AuthContext";
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
            <Box sx={{ background: `${t.glass.panel}`, border: `1px solid ${t.border.subtle}`,
                borderRadius:"12px", p:2 }}>
                <Typography sx={{ fontSize:11, fontWeight:700, mb:0.5 }}>{label}</Typography>
                {payload.map((p) => (
                    <Typography key={p.name} sx={{ fontSize:11, color: p.color || "#4f8ef7" }}>
                        {p.name}: {Math.round(p.value)}{p.name === "Progress" ? "%" : " XP"}
                    </Typography>
                ))}
            </Box>
        );
    }
    return null;
};

const Progress = () => {
    const { darkMode } = useTheme();
    const t = getTokens(darkMode);
    const tx = t.text;
    const card = { border: `1px solid ${t.border.subtle}`, borderRadius: "20px", background: t.glass.face };
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data: d } = await progressAPI.get();
                setData(d);
            } catch {
                setData(null);
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

    const overview = data?.overview || {};
    const progressBars = data?.progressBars || [];
    const weeklyProgress = data?.weeklyProgress || [];
    const assessments = data?.assessments || {};
    const courses = data?.courses || {};
    const skills = data?.skills || {};

    const skillEntries = Object.entries(skills).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);

    return (
        <Box className="stagger" sx={{ width: "100%", minHeight: "100%", color: t.text.primary, pb:6, animation:"fadeIn 0.4s ease" }}>

            {/* Header */}
            <Box sx={{ mb:4 }}>
                <Typography sx={{ fontSize:10, letterSpacing:2.5, color: t.text.muted, mb:1 }}>
                    LEARNING ANALYTICS
                </Typography>
                <Typography sx={{ fontSize:32, fontWeight:800,
                    background: t.dark ? "linear-gradient(135deg, #fff, rgba(62,207,142,0.8))" : `linear-gradient(135deg, ${t.text.primary}, #3ecf8e)`,
                    WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                    Progress
                </Typography>
                <Typography sx={{ fontSize:13, color: t.text.muted, mt:1 }}>
                    Track your learning journey, XP, level, and skill growth.
                </Typography>
            </Box>

            {/* Level + XP card */}
            <Box sx={{ ...card, p:3, mb:2 }}>
                <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:2 }}>
                    <Box sx={{ display:"flex", alignItems:"center", gap:2 }}>
                        <Box sx={{
                            width:54, height:54, borderRadius:"16px", display:"flex",
                            alignItems:"center", justifyContent:"center",
                            background:"linear-gradient(135deg, rgba(247,147,76,0.2), rgba(247,96,96,0.2))",
                            border:"1px solid rgba(247,147,76,0.3)",
                        }}>
                            <StarRoundedIcon sx={{ color:"#f7934c", fontSize:26 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize:11, color: t.text.muted, letterSpacing:1 }}>
                                CURRENT LEVEL
                            </Typography>
                            <Typography sx={{ fontSize:28, fontWeight:800, color:"#f7934c" }}>
                                Level {overview.level || user?.level || 1}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ textAlign:"right" }}>
                        <Typography sx={{ fontSize:24, fontWeight:800 }}>{overview.xp || user?.xp || 0}</Typography>
                        <Typography sx={{ fontSize:11, color: t.text.muted }}>Total XP</Typography>
                    </Box>
                </Box>

                <Box sx={{ display:"flex", justifyContent:"space-between", mb:1 }}>
                    <Typography sx={{ fontSize:11, color: t.text.muted }}>
                        Progress to Level {(overview.level || 1) + 1}
                    </Typography>
                    <Typography sx={{ fontSize:11, color:"#f7934c" }}>
                        {overview.xpToNextLevel || 0} XP remaining
                    </Typography>
                </Box>
                <LinearProgress variant="determinate" value={overview.xpProgress || 0}
                    sx={{ height:8, borderRadius:10,
                        backgroundColor: `${t.glass.inset}`,
                        "& .MuiLinearProgress-bar": { background:"linear-gradient(90deg,#f7934c,#f76060)", borderRadius:10 } }} />
            </Box>

            {/* Stats row */}
            <Box sx={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:2, mb:2 }}>
                {[
                    { icon:<WhatshotRoundedIcon sx={{ color:"#f76060" }} />, label:"Streak", value:overview.streak || 0, suffix:" days", color:"#f76060" },
                    { icon:<SchoolRoundedIcon sx={{ color:"#3ecf8e" }} />, label:"Courses Done", value:courses.completed || 0, color:"#3ecf8e" },
                    { icon:<PsychologyRoundedIcon sx={{ color:"#9b6dff" }} />, label:"Tests Taken", value:assessments.taken || 0, color:"#9b6dff" },
                    { icon:<TrendingUpRoundedIcon sx={{ color:"#4f8ef7" }} />, label:"Avg Score", value:assessments.averageScore || 0, suffix:"%", color:"#4f8ef7" },
                ].map((s) => (
                    <Box key={s.label} sx={{ ...card, p:2.5 }}>
                        {s.icon}
                        <Typography sx={{ fontSize:11, color: t.text.secondary, mt:1.5, letterSpacing:0.5 }}>
                            {s.label.toUpperCase()}
                        </Typography>
                        <Typography sx={{ fontSize:28, fontWeight:800, mt:0.5, color:s.color }}>
                            {s.value}{s.suffix || ""}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {/* Progress bars */}
            {progressBars.length > 0 && (
                <Box sx={{ ...card, p:3, mb:2 }}>
                    <Typography sx={{ fontSize:18, fontWeight:600, mb:3 }}>Learning Progress</Typography>
                    {progressBars.map((pb) => (
                        <Box key={pb.title} sx={{ mb:2.5 }}>
                            <Box sx={{ display:"flex", justifyContent:"space-between", mb:0.8 }}>
                                <Typography sx={{ fontSize:13, color: t.text.secondary }}>{pb.title}</Typography>
                                <Typography sx={{ fontSize:12, fontWeight:700,
                                    color: pb.value >= 70 ? "#3ecf8e" : pb.value >= 40 ? "#4f8ef7" : "#f7934c" }}>
                                    {pb.value}%
                                </Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={pb.value}
                                sx={{ height:7, borderRadius:10,
                                    backgroundColor: `${t.glass.inset}`,
                                    "& .MuiLinearProgress-bar": {
                                        background: pb.value >= 70
                                            ? "linear-gradient(90deg,#3ecf8e,#38c9d8)"
                                            : pb.value >= 40
                                            ? "linear-gradient(90deg,#4f8ef7,#9b6dff)"
                                            : "linear-gradient(90deg,#f7934c,#f76060)",
                                        borderRadius:10,
                                    }}} />
                        </Box>
                    ))}
                </Box>
            )}

            {/* Charts */}
            <Box sx={{ display:"grid", gridTemplateColumns:"1.2fr 0.8fr", gap:2, mb:2 }}>

                {/* Weekly progress line */}
                <Box sx={{ ...card, p:3 }}>
                    <Typography sx={{ fontSize:18, fontWeight:600, mb:3 }}>Weekly Progress</Typography>
                    <Box sx={{ height:220 }}>
                        <ResponsiveContainer>
                            <AreaChart data={weeklyProgress} margin={{ top:5, right:10, left:-25, bottom:0 }}>
                                <defs>
                                    <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f8ef7" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#4f8ef7" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke={t.chart.grid} vertical={false} />
                                <XAxis dataKey="week" tick={{ fill: t.chart.tickFaint, fontSize:10 }}
                                    axisLine={false} tickLine={false} />
                                <YAxis domain={[0,100]} tick={{ fill: t.chart.tickFaint, fontSize:10 }}
                                    axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="progress" name="Progress"
                                    stroke="#4f8ef7" strokeWidth={2}
                                    fill="url(#progressGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Box>
                </Box>

                {/* Skills bar */}
                {skillEntries.length > 0 && (
                    <Box sx={{ ...card, p:3 }}>
                        <Typography sx={{ fontSize:18, fontWeight:600, mb:3 }}>Skill Scores</Typography>
                        <Box sx={{ height:220 }}>
                            <ResponsiveContainer>
                                <BarChart
                                    data={skillEntries.map(([name, value]) => ({ name: name.split(" ")[0], value }))}
                                    layout="vertical"
                                    margin={{ top:0, right:10, left:0, bottom:0 }}>
                                    <XAxis type="number" domain={[0,100]}
                                        tick={{ fill: t.chart.tickFaint, fontSize:9 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="name"
                                        tick={{ fill: t.chart.tick, fontSize:10 }} axisLine={false} tickLine={false} width={65} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="value" name="Score" fill="#9b6dff"
                                        radius={[0,5,5,0]} isAnimationActive={false} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Recent assessments */}
            {assessments.recent?.length > 0 && (
                <Box sx={{ ...card, p:3 }}>
                    <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:3 }}>
                        <Typography sx={{ fontSize:18, fontWeight:600 }}>Recent Assessments</Typography>
                        <Button endIcon={<ArrowForwardRoundedIcon />}
                            onClick={() => navigate("/courses")}
                            sx={{ color: t.text.secondary, textTransform:"none", fontSize:11 }}>
                            Take More
                        </Button>
                    </Box>
                    <Box sx={{ display:"flex", flexDirection:"column", gap:1.5 }}>
                        {assessments.recent.map((a, i) => (
                            <Box key={i} sx={{ display:"flex", justifyContent:"space-between",
                                alignItems:"center", p:2, borderRadius:"13px",
                                backgroundColor: t.glass.inset,
                                border: `1px solid ${t.border.subtle}` }}>
                                <Box>
                                    <Typography sx={{ fontSize:13, fontWeight:600 }}>{a.topic}</Typography>
                                    <Typography sx={{ fontSize:10, color: t.text.muted, mt:0.3 }}>
                                        {a.score}/{a.total} correct
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign:"right" }}>
                                    <Typography sx={{ fontSize:20, fontWeight:800,
                                        color: a.percentage >= 80 ? "#3ecf8e" : a.percentage >= 50 ? "#4f8ef7" : "#f76060" }}>
                                        {a.percentage}%
                                    </Typography>
                                    {a.date && (
                                        <Typography sx={{ fontSize:10, color: t.text.muted }}>
                                            {new Date(a.date).toLocaleDateString()}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default Progress;
