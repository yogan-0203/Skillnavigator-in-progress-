import { useState, useEffect } from "react";
import {
    Box, Typography, LinearProgress, Chip, Button, CircularProgress,
    Fade, IconButton, Tooltip, Avatar,
} from "@mui/material";

import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WhatshotRoundedIcon from "@mui/icons-material/WhatshotRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import LightbulbRoundedIcon from "@mui/icons-material/LightbulbRounded";
import TrackChangesRoundedIcon from "@mui/icons-material/TrackChangesRounded";
import FlashOnRoundedIcon from "@mui/icons-material/FlashOnRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { userAPI } from "./api";
import DomainSelector from "./DomainSelector";
import AIChatbot from "./AIChatbot";

const card = {
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "20px",
    background: "linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.008))",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.01), 0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
    transition: "all 0.3s ease",
    "&:hover": { borderColor: "rgba(255,255,255,0.12)", transform: "translateY(-2px)" },
};

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDomainSelector, setShowDomainSelector] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const { data: d } = await userAPI.dashboard();
                setData(d);
            } catch {
                // fall back to auth user data silently
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    useEffect(() => {
        if (user?.learningDomain) {
            const domainMap = {
                "AI & Data Science": { id: "ai-ml", label: "AI / Machine Learning", color: "#9b6dff" },
                "Web Development": { id: "web-dev", label: "Web Development", color: "#3ecf8e" },
                "Data Science": { id: "data-science", label: "Data Science", color: "#4f8ef7" },
                "Cybersecurity": { id: "cybersecurity", label: "Cybersecurity", color: "#f76060" },
                "Cloud Computing": { id: "cloud", label: "Cloud Computing", color: "#38c9d8" },
            };
            setSelectedDomain(domainMap[user.learningDomain] || null);
        }
    }, [user]);

    const skills = data?.skills || user?.skills || {};
    const topSkills = Object.entries(skills).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const stats = data?.stats || {};
    const overallScore = stats.overallScore || 0;
    const aiInsight = data?.aiInsight || {};
    const xpForNextLevel = user ? user.level * 500 : 500;
    const xpToNext = xpForNextLevel - (user?.xp || 0);

    if (loading) {
        return (
            <Box sx={{ display:"flex", alignItems:"center", justifyContent:"center", height:"80vh" }}>
                <CircularProgress sx={{ color:"rgba(255,255,255,0.3)" }} />
            </Box>
        );
    }

    return (
        <Box sx={{ width:"100%", minHeight:"100%", color:"#fff", pb: 8, animation:"fadeIn 0.4s ease" }}>
            {/* Domain Selector Modal */}
            <DomainSelector open={showDomainSelector} onClose={() => setShowDomainSelector(false)} onSelect={(d) => { setSelectedDomain(d); setShowDomainSelector(false); }} />
            <AIChatbot domain={selectedDomain} />

            {/* Header */}
            <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", mb: 4 }}>
                <Box>
                    <Typography sx={{ color:"rgba(255,255,255,0.25)", fontSize:10, letterSpacing:3, mb: 1, fontWeight: 600 }}>
                        AI LEARNING COMMAND CENTER
                    </Typography>
                    <Typography sx={{ fontSize: 34, fontWeight: 800, letterSpacing:"-0.5px", lineHeight: 1.1,
                        background:"linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.5) 100%)",
                        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                        Welcome back, {user?.name?.split(" ")[0] || "Learner"}
                    </Typography>
                    <Box sx={{ display:"flex", alignItems:"center", gap: 2, mt: 2 }}>
                        {selectedDomain ? (
                            <Chip label={selectedDomain.label} size="small" icon={<Box sx={{ color: selectedDomain.color }}>{selectedDomain.icon}</Box>}
                                sx={{ background: `${selectedDomain.color}15`, border: `1px solid ${selectedDomain.color}30`, color: selectedDomain.color, fontSize: 11, height: 24 }} />
                        ) : (
                            <Button onClick={() => setShowDomainSelector(true)} size="small" startIcon={<AutoAwesomeRoundedIcon />}
                                sx={{ color:"#9b6dff", background:"rgba(155,109,255,0.1)", border:"1px solid rgba(155,109,255,0.2)", borderRadius:"10px", textTransform:"none", fontSize: 11, height: 28, "&:hover": { background:"rgba(155,109,255,0.15)" } }}>
                                Choose Your Domain
                            </Button>
                        )}
                        <Chip icon={<WhatshotRoundedIcon sx={{ fontSize: 14, color: "#f7934c" }} />} label={`${user?.streak || 0} day streak`}
                            sx={{ background:"rgba(247,147,76,0.1)", border:"1px solid rgba(247,147,76,0.2)", color:"#f7934c", fontSize: 11, height: 24 }} />
                    </Box>
                </Box>
                <Box sx={{ display:"flex", alignItems:"center", gap: 2 }}>
                    <Box sx={{ textAlign:"right" }}>
                        <Typography sx={{ fontSize: 11, color:"rgba(255,255,255,0.3)" }}>Level {user?.level || 1}</Typography>
                        <Typography sx={{ fontSize: 20, fontWeight: 800, color:"#4f8ef7" }}>{user?.xp || 0} XP</Typography>
                    </Box>
                    <Avatar sx={{ width: 44, height: 44, background:"linear-gradient(135deg, #4f8ef7, #9b6dff)", fontSize: 18, fontWeight: 700 }}>
                        {user?.name?.[0]?.toUpperCase() || "U"}
                    </Avatar>
                </Box>
            </Box>

            {/* XP Progress Bar */}
            <Box sx={{ ...card, p: 2.5, mb: 3 }}>
                <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb: 1.5 }}>
                    <Box sx={{ display:"flex", alignItems:"center", gap: 1 }}>
                        <FlashOnRoundedIcon sx={{ fontSize: 16, color: "#f7934c" }} />
                        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Level Progress</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 11, color:"rgba(255,255,255,0.4)" }}>{xpToNext} XP to Level {(user?.level || 1) + 1}</Typography>
                </Box>
                <LinearProgress variant="determinate" value={Math.min(100, Math.round(((user?.xp || 0) / xpForNextLevel) * 100))} sx={{ height: 6, borderRadius: 10, backgroundColor:"rgba(255,255,255,0.05)", "& .MuiLinearProgress-bar": { background:"linear-gradient(90deg, #4f8ef7, #9b6dff)", borderRadius: 10 } }} />
            </Box>

            {/* Stats Grid */}
            <Box sx={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap: 2, mb: 3 }}>
                {[
                    { label: "Overall Score", value: `${overallScore}%`, icon: <TrendingUpRoundedIcon sx={{ color: "#3ecf8e" }} />, color: "#3ecf8e" },
                    { label: "Courses", value: stats.totalCourses || 0, icon: <SchoolRoundedIcon sx={{ color: "#4f8ef7" }} />, color: "#4f8ef7" },
                    { label: "Assessments", value: stats.assessmentsTaken || 0, icon: <QueryStatsRoundedIcon sx={{ color: "#9b6dff" }} />, color: "#9b6dff" },
                    { label: "Achievements", value: user?.achievements?.length || 0, icon: <EmojiEventsRoundedIcon sx={{ color: "#f7934c" }} />, color: "#f7934c" },
                ].map((stat, i) => (
                    <Fade key={i} in timeout={(i + 1) * 150}>
                        <Box sx={{ ...card, p: 2.5, textAlign: "center" }}>
                            <Box sx={{ width: 36, height: 36, borderRadius: "12px", display:"flex", alignItems:"center", justifyContent:"center", mx:"auto", mb: 1.5, background: `${stat.color}12`, border: `1px solid ${stat.color}20` }}>
                                {stat.icon}
                            </Box>
                            <Typography sx={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</Typography>
                            <Typography sx={{ fontSize: 10, color:"rgba(255,255,255,0.35)", mt: 0.5 }}>{stat.label}</Typography>
                        </Box>
                    </Fade>
                ))}
            </Box>

            {/* AI Insight + Quick Actions */}
            <Box sx={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap: 2, mb: 3 }}>
                {/* AI Insight */}
                <Box sx={{ ...card, p: 3, position:"relative", overflow:"hidden" }}>
                    <Box sx={{ position:"absolute", top: -20, right: -20, width: 100, height: 100, borderRadius:"50%", background:"radial-gradient(circle, rgba(155,109,255,0.1), transparent)" }} />
                    <Box sx={{ display:"flex", alignItems:"center", gap: 1.5, mb: 2 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg, rgba(155,109,255,0.2), rgba(79,142,247,0.2))", border:"1px solid rgba(155,109,255,0.3)" }}>
                            <SmartToyRoundedIcon sx={{ fontSize: 18, color: "#9b6dff" }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>AI Insight</Typography>
                            <Typography sx={{ fontSize: 9, color:"rgba(255,255,255,0.3)" }}>Personalized for you</Typography>
                        </Box>
                    </Box>
                    <Typography sx={{ fontSize: 13, color:"rgba(255,255,255,0.65)", lineHeight: 1.7 }}>
                        {aiInsight.summary || `Based on your profile, focusing on ${selectedDomain?.label || "your chosen domain"} will maximize your career growth. Start with foundational courses and build projects to strengthen your portfolio.`}
                    </Typography>
                    <Box sx={{ mt: 2, p: 2, borderRadius: "12px", background:"rgba(155,109,255,0.05)", border:"1px solid rgba(155,109,255,0.1)" }}>
                        <Typography sx={{ fontSize: 11, color:"#9b6dff", fontWeight: 600, mb: 0.5 }}>Recommendation</Typography>
                        <Typography sx={{ fontSize: 11, color:"rgba(255,255,255,0.5)" }}>
                            {aiInsight.recommendation || "Take a skill assessment to identify your strengths and gaps, then follow the personalized learning path."}
                        </Typography>
                    </Box>
                </Box>

                {/* Quick Actions */}
                <Box sx={{ ...card, p: 3 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 2 }}>Quick Actions</Typography>
                    <Box sx={{ display:"flex", flexDirection:"column", gap: 1 }}>
                        {[
                            { label: "Take Assessment", icon: <PsychologyRoundedIcon sx={{ fontSize: 16 }} />, color: "#9b6dff", path: "/courses" },
                            { label: "Browse Courses", icon: <SchoolRoundedIcon sx={{ fontSize: 16 }} />, color: "#4f8ef7", path: "/courses" },
                            { label: "View Roadmap", icon: <TrackChangesRoundedIcon sx={{ fontSize: 16 }} />, color: "#3ecf8e", path: "/roadmap" },
                            { label: "AI Career Chat", icon: <SmartToyRoundedIcon sx={{ fontSize: 16 }} />, color: "#f7934c", action: () => setShowDomainSelector(true) },
                        ].map((action, i) => (
                            <Button key={i} onClick={() => action.path ? navigate(action.path) : action.action?.()} fullWidth
                                startIcon={action.icon}
                                sx={{ justifyContent:"flex-start", p: 1.5, borderRadius: "12px", textTransform:"none", color:"rgba(255,255,255,0.7)", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", "&:hover": { background: `${action.color}10`, borderColor: `${action.color}25`, color: action.color } }}>
                                {action.label}
                            </Button>
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* Skills & Domain Content */}
            <Box sx={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 2, mb: 3 }}>
                {/* Top Skills */}
                <Box sx={{ ...card, p: 3 }}>
                    <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb: 2 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Top Skills</Typography>
                        <Button onClick={() => navigate("/skill-profile")} sx={{ color:"rgba(255,255,255,0.4)", textTransform:"none", fontSize: 11 }}>View All</Button>
                    </Box>
                    {topSkills.length > 0 ? (
                        <Box sx={{ display:"flex", flexDirection:"column", gap: 1.5 }}>
                            {topSkills.map(([skill, value], i) => (
                                <Fade key={i} in timeout={(i + 1) * 100}>
                                    <Box>
                                        <Box sx={{ display:"flex", justifyContent:"space-between", mb: 0.5 }}>
                                            <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{skill}</Typography>
                                            <Typography sx={{ fontSize: 11, color:"rgba(255,255,255,0.4)" }}>{value}%</Typography>
                                        </Box>
                                        <LinearProgress variant="determinate" value={value} sx={{ height: 4, borderRadius: 10, backgroundColor:"rgba(255,255,255,0.05)", "& .MuiLinearProgress-bar": { background: `linear-gradient(90deg, #4f8ef7, #9b6dff)`, borderRadius: 10 } }} />
                                    </Box>
                                </Fade>
                            ))}
                        </Box>
                    ) : (
                        <Box sx={{ textAlign:"center", py: 3 }}>
                            <PsychologyRoundedIcon sx={{ fontSize: 32, color:"rgba(155,109,255,0.3)", mb: 1 }} />
                            <Typography sx={{ fontSize: 12, color:"rgba(255,255,255,0.3)" }}>No skills assessed yet</Typography>
                            <Button onClick={() => navigate("/courses")} size="small" sx={{ mt: 1, color:"#9b6dff", textTransform:"none", fontSize: 11 }}>Take Assessment</Button>
                        </Box>
                    )}
                </Box>

                {/* Domain-Specific Content */}
                <Box sx={{ ...card, p: 3 }}>
                    <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb: 2 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{selectedDomain ? `${selectedDomain.label} Path` : "Choose Domain"}</Typography>
                        <Button onClick={() => setShowDomainSelector(true)} sx={{ color:"rgba(255,255,255,0.4)", textTransform:"none", fontSize: 11 }}>Change</Button>
                    </Box>
                    {selectedDomain ? (
                        <Box>
                            <Box sx={{ p: 2, borderRadius: "12px", background: `${selectedDomain.color}08`, border: `1px solid ${selectedDomain.color}15`, mb: 2 }}>
                                <Box sx={{ display:"flex", alignItems:"center", gap: 1.5, mb: 1 }}>
                                    <Box sx={{ color: selectedDomain.color }}>{selectedDomain.icon}</Box>
                                    <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{selectedDomain.label}</Typography>
                                </Box>
                                <Typography sx={{ fontSize: 10, color:"rgba(255,255,255,0.4)" }}>{selectedDomain.description}</Typography>
                            </Box>
                            <Box sx={{ display:"flex", flexDirection:"column", gap: 0.8 }}>
                                {aiInsight.nextSkill && (
                                    <Box sx={{ display:"flex", alignItems:"center", gap: 1 }}>
                                        <LightbulbRoundedIcon sx={{ fontSize: 14, color: "#f7934c" }} />
                                        <Typography sx={{ fontSize: 11, color:"rgba(255,255,255,0.6)" }}>Next: <strong>{aiInsight.nextSkill}</strong></Typography>
                                    </Box>
                                )}
                                <Box sx={{ display:"flex", alignItems:"center", gap: 1 }}>
                                    <WorkspacePremiumRoundedIcon sx={{ fontSize: 14, color: "#3ecf8e" }} />
                                    <Typography sx={{ fontSize: 11, color:"rgba(255,255,255,0.6)" }}>Certification available</Typography>
                                </Box>
                                <Box sx={{ display:"flex", alignItems:"center", gap: 1 }}>
                                    <CodeRoundedIcon sx={{ fontSize: 14, color: "#4f8ef7" }} />
                                    <Typography sx={{ fontSize: 11, color:"rgba(255,255,255,0.6)" }}>5+ projects to build</Typography>
                                </Box>
                            </Box>
                            <Button onClick={() => navigate("/roadmap")} fullWidth sx={{ mt: 2, height: 36, borderRadius: "10px", textTransform:"none", background: `${selectedDomain.color}20`, color: selectedDomain.color, border: `1px solid ${selectedDomain.color}30`, "&:hover": { background: `${selectedDomain.color}30` } }}>
                                View Learning Path
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{ textAlign:"center", py: 3 }}>
                            <AutoAwesomeRoundedIcon sx={{ fontSize: 32, color:"rgba(155,109,255,0.3)", mb: 1 }} />
                            <Typography sx={{ fontSize: 12, color:"rgba(255,255,255,0.3)", mb: 1 }}>Select your domain to get started</Typography>
                            <Button onClick={() => setShowDomainSelector(true)} size="small" sx={{ color:"#9b6dff", textTransform:"none", fontSize: 11, background:"rgba(155,109,255,0.1)", borderRadius:"8px" }}>Choose Domain</Button>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* AI Features Section */}
            <Box sx={{ ...card, p: 3, mb: 3 }}>
                <Box sx={{ display:"flex", alignItems:"center", gap: 1.5, mb: 3 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: "10px", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg, rgba(155,109,255,0.2), rgba(79,142,247,0.2))", border:"1px solid rgba(155,109,255,0.3)" }}>
                        <AutoAwesomeRoundedIcon sx={{ fontSize: 18, color: "#9b6dff" }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>AI-Powered Features</Typography>
                        <Typography sx={{ fontSize: 10, color:"rgba(255,255,255,0.3)" }}>Click the bot icon to chat with AI Career Mentor</Typography>
                    </Box>
                </Box>
                <Box sx={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap: 1.5 }}>
                    {[
                        { icon: <SmartToyRoundedIcon sx={{ color: "#9b6dff" }} />, title: "AI Career Mentor", desc: "24/7 personalized career guidance" },
                        { icon: <LightbulbRoundedIcon sx={{ color: "#4f8ef7" }} />, title: "Smart Skill Analyzer", desc: "Identify gaps and strengths" },
                        { icon: <TrackChangesRoundedIcon sx={{ color: "#3ecf8e" }} />, title: "Learning Path AI", desc: "Custom roadmaps for your goals" },
                        { icon: <FlashOnRoundedIcon sx={{ color: "#f7934c" }} />, title: "Progress Predictor", desc: "AI predicts your readiness" },
                    ].map((feat, i) => (
                        <Fade key={i} in timeout={(i + 1) * 150}>
                            <Box sx={{ p: 2, borderRadius: "14px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", textAlign:"center", transition:"all 0.3s ease", "&:hover": { borderColor: "rgba(155,109,255,0.2)", transform: "translateY(-3px)" } }}>
                                <Box sx={{ width: 40, height: 40, borderRadius: "12px", display:"flex", alignItems:"center", justifyContent:"center", mx:"auto", mb: 1.5, background:"rgba(255,255,255,0.03)" }}>
                                    {feat.icon}
                                </Box>
                                <Typography sx={{ fontSize: 11, fontWeight: 600, mb: 0.5 }}>{feat.title}</Typography>
                                <Typography sx={{ fontSize: 9, color:"rgba(255,255,255,0.3)" }}>{feat.desc}</Typography>
                            </Box>
                        </Fade>
                    ))}
                </Box>
            </Box>

            {/* Empty state CTA */}
            {(!user?.assessmentHistory || user.assessmentHistory.length === 0) && (
                <Box sx={{ ...card, p: 4, textAlign:"center" }}>
                    <PsychologyRoundedIcon sx={{ fontSize: 44, color:"rgba(155,109,255,0.4)", mb: 2 }} />
                    <Typography sx={{ fontSize: 18, fontWeight: 600, mb: 1 }}>Take your first skill assessment</Typography>
                    <Typography sx={{ color:"rgba(255,255,255,0.35)", fontSize: 13, mb: 3 }}>Let AI analyse your current skill level and identify gaps to bridge.</Typography>
                    <Button onClick={() => navigate("/courses")} variant="outlined" sx={{ color:"#9b6dff", borderColor:"rgba(155,109,255,0.3)", borderRadius:"12px", textTransform:"none", px: 4, "&:hover": { borderColor:"#9b6dff", backgroundColor:"rgba(155,109,255,0.07)" } }}>
                        Browse Courses & Take Tests
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default Home;
