import { useState } from "react";
import {
    Box, Typography, Chip, Button, LinearProgress,
} from "@mui/material";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { getTokens, ACCENTS } from "./theme/tokens";
import { ClayCard, GlassPanel, ClayButton, PageHeader, StatTile, SegmentTabs, EmptyState, LoadingState, ChartTooltip } from "./theme/Clay";


const CAREERS = [
    {
        title: "AI / ML Engineer",
        description: "Build and deploy machine learning models, work with large datasets, and create AI-powered applications.",
        matchBase: 91,
        prerequisites: ["Python", "Machine Learning", "Deep Learning", "Statistics"],
        requiredSkills: { Python:85, "Machine Learning":90, "Deep Learning":85, SQL:80, Statistics:82, NLP:75 },
        salary: "₹18-35 LPA",
        demand: "Very High",
        color: "#9b6dff",
        icon: "🤖",
    },
    {
        title: "Data Scientist",
        description: "Analyse complex datasets, build predictive models, and drive data-driven business decisions.",
        matchBase: 87,
        prerequisites: ["Python", "Statistics", "Machine Learning"],
        requiredSkills: { Python:80, Statistics:88, "Machine Learning":80, SQL:85, "Data Visualisation":75 },
        salary: "₹15-28 LPA",
        demand: "High",
        color: "#4f8ef7",
        icon: "📊",
    },
    {
        title: "Data Analyst",
        description: "Transform raw data into actionable insights using SQL, visualisation tools, and statistical analysis.",
        matchBase: 79,
        prerequisites: ["SQL", "Excel", "Statistics"],
        requiredSkills: { SQL:90, Excel:85, Python:70, Statistics:80, "Data Visualisation":85 },
        salary: "₹8-18 LPA",
        demand: "High",
        color: "#3ecf8e",
        icon: "🔍",
    },
    {
        title: "NLP Engineer",
        description: "Specialise in natural language processing, build chatbots, language models, and text analysis systems.",
        matchBase: 82,
        prerequisites: ["Python", "Deep Learning", "NLP"],
        requiredSkills: { Python:85, "Deep Learning":80, NLP:90, Statistics:75, Transformers:70 },
        salary: "₹20-38 LPA",
        demand: "Growing",
        color: "#38c9d8",
        icon: "💬",
    },
    {
        title: "MLOps Engineer",
        description: "Bridge ML and DevOps — deploy, monitor, and scale machine learning systems in production.",
        matchBase: 74,
        prerequisites: ["Python", "Machine Learning", "Docker"],
        requiredSkills: { Python:80, "Machine Learning":75, Docker:85, "Cloud Platforms":80, CI_CD:75 },
        salary: "₹20-40 LPA",
        demand: "Rising",
        color: "#f7934c",
        icon: "⚙️",
    },
    {
        title: "Research Scientist",
        description: "Conduct cutting-edge AI research, publish papers, and push the boundaries of the field.",
        matchBase: 68,
        prerequisites: ["Machine Learning", "Deep Learning", "Statistics", "Research"],
        requiredSkills: { "Machine Learning":95, "Deep Learning":90, Statistics:92, Mathematics:88, Research:85 },
        salary: "₹25-50 LPA",
        demand: "Selective",
        color: "#f76060",
        icon: "🔬",
    },
];

const DEMAND_COLOR = {
    "Very High": "#3ecf8e",
    "High":      "#4f8ef7",
    "Growing":   "#9b6dff",
    "Rising":    "#f7934c",
    "Selective": "#f76060",
};

const CareerExplorer = () => {
    const { darkMode } = useTheme();
    const t = getTokens(darkMode);
    const tx = t.text;
    const card = { border: `1px solid ${t.border.subtle}`, borderRadius: "20px", background: t.glass.face };
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selected, setSelected] = useState(null);

    const userSkills = user?.skills || {};

    const computeMatch = (career) => {
        const reqSkills = Object.entries(career.requiredSkills);
        if (reqSkills.length === 0) return career.matchBase;
        const total = reqSkills.reduce((sum, [skill, required]) => {
            const current = userSkills[skill] || 0;
            return sum + Math.min(100, (current / required) * 100);
        }, 0);
        const raw = Math.round(total / reqSkills.length);
        return Math.min(99, Math.max(1, raw));
    };

    return (
        <Box className="stagger" sx={{ width: "100%", minHeight: "100%", color: t.text.primary, pb:6, animation:"fadeIn 0.4s ease" }}>

            {/* Header */}
            <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", mb:4 }}>
                <Box>
                    <Typography sx={{ fontSize:10, letterSpacing:2.5, color: t.text.muted, mb:1 }}>
                        AI CAREER INTELLIGENCE
                    </Typography>
                    <Typography sx={{ fontSize:32, fontWeight:800,
                        background: t.dark ? "linear-gradient(135deg, #fff, rgba(56,201,216,0.8))" : `linear-gradient(135deg, ${t.text.primary}, #38c9d8)`,
                        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                        Career Explorer
                    </Typography>
                    <Typography sx={{ fontSize:13, color: t.text.muted, mt:1 }}>
                        Discover career paths that match your skills. Click any card to see prerequisites.
                    </Typography>
                </Box>
                <Chip icon={<AutoAwesomeRoundedIcon />} label="AI Matched"
                    sx={{ color:"#38c9d8", backgroundColor:"rgba(56,201,216,0.1)",
                        border:"1px solid rgba(56,201,216,0.2)",
                        "& .MuiChip-icon": { color:"#38c9d8" } }} />
            </Box>

            {/* Career cards */}
            <Box sx={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:2, mb:3 }}>
                {CAREERS.map((career) => {
                    const match = computeMatch(career);
                    const isSelected = selected === career.title;

                    return (
                        <Box key={career.title}
                            onClick={() => setSelected(isSelected ? null : career.title)}
                            sx={{
                                ...card, p:3, cursor:"pointer",
                                border: isSelected ? `1px solid ${career.color}40` : `1px solid ${t.border.subtle}`,
                                background: isSelected
                                    ? `linear-gradient(145deg, ${career.color}10, ${t.glass.inset})`
                                    : t.glass.face,
                                transition:"all 0.2s ease",
                                "&:hover": {
                                    borderColor: `${career.color}40`,
                                    transform:"translateY(-2px)",
                                },
                            }}>
                            <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", mb:2 }}>
                                <Box sx={{ display:"flex", alignItems:"center", gap:1.5 }}>
                                    <Box sx={{ fontSize:26 }}>{career.icon}</Box>
                                    <Box>
                                        <Typography sx={{ fontSize:15, fontWeight:700 }}>{career.title}</Typography>
                                        <Box sx={{ display:"flex", gap:1, mt:0.5 }}>
                                            <Chip label={career.demand} size="small"
                                                sx={{ fontSize:9, height:18,
                                                    color: DEMAND_COLOR[career.demand] || "#fff",
                                                    backgroundColor:`${DEMAND_COLOR[career.demand]}15`,
                                                    border:`1px solid ${DEMAND_COLOR[career.demand]}30` }} />
                                            <Typography sx={{ fontSize:10, color: t.text.muted, pt:0.3 }}>
                                                {career.salary}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box sx={{ textAlign:"right" }}>
                                    <Typography sx={{ fontSize:32, fontWeight:800, color: career.color }}>
                                        {match}%
                                    </Typography>
                                    <Typography sx={{ fontSize:9, color: t.text.secondary }}>match</Typography>
                                </Box>
                            </Box>

                            <LinearProgress variant="determinate" value={match}
                                sx={{ height:4, borderRadius:10, mb:2,
                                    backgroundColor: `${t.glass.inset}`,
                                    "& .MuiLinearProgress-bar": {
                                        background:`linear-gradient(90deg, ${career.color}, ${career.color}88)`,
                                        borderRadius:10,
                                    }}} />

                            <Typography sx={{ fontSize:12, color: t.text.secondary, lineHeight:1.6 }}>
                                {career.description}
                            </Typography>

                            {/* Expanded prerequisite details */}
                            {isSelected && (
                                <Box sx={{ mt:2.5, animation:"fadeIn 0.25s ease" }}>
                                    <Typography sx={{ fontSize:10, color: t.text.muted, mb:1.5, letterSpacing:1 }}>
                                        REQUIRED SKILLS
                                    </Typography>
                                    <Box sx={{ display:"flex", flexDirection:"column", gap:1.2 }}>
                                        {Object.entries(career.requiredSkills).map(([skill, req]) => {
                                            const current = userSkills[skill] || 0;
                                            const met = current >= req;
                                            return (
                                                <Box key={skill}>
                                                    <Box sx={{ display:"flex", justifyContent:"space-between", mb:0.5 }}>
                                                        <Box sx={{ display:"flex", alignItems:"center", gap:0.8 }}>
                                                            {met
                                                                ? <CheckCircleRoundedIcon sx={{ fontSize:13, color:"#3ecf8e" }} />
                                                                : <LockRoundedIcon sx={{ fontSize:13, color: t.text.secondary }} />
                                                            }
                                                            <Typography sx={{ fontSize:11, color: met ? t.text.primary : t.text.secondary }}>
                                                                {skill}
                                                            </Typography>
                                                        </Box>
                                                        <Typography sx={{ fontSize:10,
                                                            color: met ? "#3ecf8e" : t.text.muted }}>
                                                            {current}% / {req}%
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ position:"relative", height:4, borderRadius:10,
                                                        backgroundColor: `${t.glass.inset}` }}>
                                                        <Box sx={{ position:"absolute", height:"100%", borderRadius:10,
                                                            width:`${req}%`, backgroundColor: met ? "#3ecf8e30" : (darkMode ? "rgba(255,255,255,0.04)" : "rgba(22,22,42,0.05)") }} />
                                                        <Box sx={{ position:"absolute", height:"100%", borderRadius:10,
                                                            width:`${current}%`,
                                                            background: met ? "linear-gradient(90deg,#3ecf8e,#38c9d8)" : `linear-gradient(90deg,${career.color},${career.color}66)` }} />
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    </Box>

                                    <Box sx={{ display:"flex", gap:1, mt:2.5 }}>
                                        <Button size="small" variant="outlined"
                                            endIcon={<ArrowForwardRoundedIcon />}
                                            onClick={(e) => { e.stopPropagation(); navigate("/roadmap"); }}
                                            sx={{ textTransform:"none", fontSize:11,
                                                color: career.color,
                                                borderColor:`${career.color}40`, borderRadius:"10px",
                                                "&:hover": { borderColor:career.color, backgroundColor:`${career.color}0A` } }}>
                                            View Roadmap
                                        </Button>
                                        <Button size="small" variant="outlined"
                                            onClick={(e) => { e.stopPropagation(); navigate("/gap-analysis"); }}
                                            sx={{ textTransform:"none", fontSize:11, color: t.text.secondary,
                                                borderColor: `${t.border.subtle}`, borderRadius:"10px",
                                                "&:hover": { borderColor: `${t.border.medium}`, backgroundColor: `${t.glass.inset}` } }}>
                                            Gap Analysis
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    );
                })}
            </Box>

            {/* Tip */}
            <Box sx={{ ...card, p:3, display:"flex", alignItems:"center", gap:2 }}>
                <AutoAwesomeRoundedIcon sx={{ color:"#9b6dff", flexShrink:0 }} />
                <Typography sx={{ fontSize:12, color: t.text.secondary, lineHeight:1.7 }}>
                    <strong style={{ color: t.text.primary }}>Tip:</strong> Match percentages are calculated from your current skill scores.
                    Take assessments on the Courses page to improve your scores and unlock better career matches.
                </Typography>
            </Box>
        </Box>
    );
};

export default CareerExplorer;
