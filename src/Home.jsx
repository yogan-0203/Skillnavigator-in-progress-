import { useState, useEffect, useMemo } from "react";
import { Box, Typography, Chip, Button, Fade, Avatar, Checkbox } from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import WhatshotRoundedIcon from "@mui/icons-material/WhatshotRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import LightbulbRoundedIcon from "@mui/icons-material/LightbulbRounded";
import TrackChangesRoundedIcon from "@mui/icons-material/TrackChangesRounded";
import FlashOnRoundedIcon from "@mui/icons-material/FlashOnRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { userAPI } from "./api";
import DomainSelector from "./DomainSelector";
import AIChatbot from "./AIChatbot";
import { getTokens, ACCENTS } from "./theme/tokens";
import { ClayCard, GlassPanel, ClayButton, StatTile, EmptyState, LoadingState } from "./theme/Clay";

const PLANNER_KEY = "sn_study_plan";
const seedPlan = (skills) => {
    const weak = Object.entries(skills || {}).filter(([, v]) => v < 60).sort((a, b) => a[1] - b[1]).slice(0, 3);
    const base = weak.length
        ? weak.map(([s, v]) => ({ id: `w-${s}`, text: `Practice ${s} (${v}%) — 30 min drill`, done: false }))
        : [{ id: "w-gen", text: "Take a skill assessment to seed your plan", done: false }];
    return [...base, { id: "d-focus", text: "1 Pomodoro focus session (25 min)", done: false }];
};

const StudyPlanner = ({ t, skills }) => {
    const [tasks, setTasks] = useState(() => {
        try {
            const raw = localStorage.getItem(PLANNER_KEY);
            if (raw) {
                const p = JSON.parse(raw);
                if (p.date === new Date().toISOString().slice(0, 10)) return p.tasks;
            }
        } catch {}
        return seedPlan(skills);
    });
    const [draft, setDraft] = useState("");
    useEffect(() => {
        try { localStorage.setItem(PLANNER_KEY, JSON.stringify({ date: new Date().toISOString().slice(0, 10), tasks })); } catch {}
    }, [tasks]);
    const done = tasks.filter((x) => x.done).length;
    const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    return (
        <ClayCard t={t} sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(145deg, #3ecf8e, #38c9d8)", border: "1px solid rgba(255,255,255,0.25)", boxShadow: t.shadow.glassSm }}>
                    <CalendarMonthRoundedIcon sx={{ fontSize: 18, color: "#fff" }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: t.text.primary }}>Today's Study Plan</Typography>
                    <Typography sx={{ fontSize: 10, color: t.text.muted }}>Auto-built from weakest skills</Typography>
                </Box>
                <Chip label={`${done}/${tasks.length}`} size="small" sx={{ fontWeight: 800, color: "#3ecf8e", background: "#3ecf8e18", border: "1px solid #3ecf8e45" }} />
            </Box>
            <Box sx={{ height: 8, borderRadius: 10, background: t.glass.inset, border: `1px solid ${t.border.subtle}`, mb: 2, overflow: "hidden" }}>
                <Box sx={{ height: "100%", width: `${pct}%`, borderRadius: 10, background: "linear-gradient(90deg, #3ecf8e, #38c9d8)", transition: "width 0.4s ease" }} />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                {tasks.map((task) => (
                    <Box key={task.id} sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.25, borderRadius: "12px", border: `1px solid ${task.done ? "#3ecf8e40" : t.border.subtle}` }}>
                        <Checkbox checked={task.done} size="small"
                            onChange={() => setTasks((ts) => ts.map((x) => (x.id === task.id ? { ...x, done: !x.done } : x)))}
                            sx={{ color: t.text.muted, "&.Mui-checked": { color: "#3ecf8e" }, p: 0.5 }} />
                        <Typography sx={{ fontSize: 12, flex: 1, color: task.done ? t.text.muted : t.text.primary, textDecoration: task.done ? "line-through" : "none" }}>{task.text}</Typography>
                        <DeleteOutlineRoundedIcon onClick={() => setTasks((ts) => ts.filter((x) => x.id !== task.id))}
                            sx={{ fontSize: 16, color: t.text.faint, cursor: "pointer", "&:hover": { color: "#f76060" } }} />
                    </Box>
                ))}
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
                <Box component="input" value={draft} placeholder="Add a task… (Enter)" onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && draft.trim()) { setTasks((ts) => [...ts, { id: `c-${Date.now()}`, text: draft.trim(), done: false }]); setDraft(""); } }}
                    sx={{ flex: 1, height: 36, px: 1.5, fontSize: 12, borderRadius: "10px", outline: "none", color: t.text.primary, background: t.glass.inset, border: `1px solid ${t.border.subtle}`, "&::placeholder": { color: t.text.muted } }} />
                <ClayButton t={t} accent="#3ecf8e" sx={{ minWidth: 0, px: 1.5, height: 36 }}
                    onClick={() => { if (draft.trim()) { setTasks((ts) => [...ts, { id: `c-${Date.now()}`, text: draft.trim(), done: false }]); setDraft(""); } }}>
                    <AddRoundedIcon sx={{ fontSize: 18 }} />
                </ClayButton>
            </Box>
        </ClayCard>
    );
};



const MASTERY = [[80, "Mastered", "#3ecf8e"], [60, "Strong", "#4f8ef7"], [40, "Growing", "#f7934c"], [0, "Seedling", "#9b6dff"]];
const masteryOf = (v) => MASTERY.find(([min]) => v >= min);

const MasteryMap = ({ t, skills, navigate }) => {
    const entries = Object.entries(skills || {}).filter(([, v]) => v >= 0).sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (!entries.length) {
        return <EmptyState t={t} icon={<MapRoundedIcon sx={{ fontSize: 30 }} />} title="No skills mapped yet" subtitle="Take an assessment and your mastery map blooms here." />;
    }
    return (
        <ClayCard t={t} sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(145deg, #9b6dff, #4f8ef7)", border: "1px solid rgba(255,255,255,0.25)", boxShadow: t.shadow.glassSm }}>
                        <MapRoundedIcon sx={{ fontSize: 18, color: "#fff" }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: t.text.primary }}>Skill Mastery Map</Typography>
                        <Typography sx={{ fontSize: 10, color: t.text.muted }}>Seedlings grow into mastery</Typography>
                    </Box>
                </Box>
                <Button onClick={() => navigate("/skill-profile")} sx={{ color: t.text.muted, textTransform: "none", fontSize: 11 }}>View All</Button>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.5 }}>
                {entries.map(([skill, value]) => {
                    const [, label, color] = masteryOf(value);
                    return (
                        <Box key={skill} sx={{ p: 1.75, borderRadius: "16px", textAlign: "center", background: `${color}10`, border: `1px solid ${color}35`, boxShadow: t.shadow.glassSm, transition: "transform 0.2s ease", "&:hover": { transform: "translateY(-3px)" } }}>
                            <Box sx={{ position: "relative", width: 54, height: 54, mx: "auto", mb: 1 }}>
                                <svg width="54" height="54" style={{ transform: "rotate(-90deg)" }}>
                                    <circle cx="27" cy="27" r="22" fill="none" stroke={t.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} strokeWidth="6" />
                                    <circle cx="27" cy="27" r="22" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={138.2} strokeDashoffset={138.2 * (1 - value / 100)} />
                                </svg>
                                <Typography sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: t.text.primary }}>{value}</Typography>
                            </Box>
                            <Typography sx={{ fontSize: 11, fontWeight: 700, color: t.text.primary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{skill}</Typography>
                            <Chip label={label} size="small" sx={{ mt: 0.75, fontSize: 8.5, height: 18, fontWeight: 700, color, background: `${color}18`, border: `1px solid ${color}40` }} />
                        </Box>
                    );
                })}
            </Box>
        </ClayCard>
    );
};

const Home = () => {
    const { user } = useAuth();
    const { darkMode } = useTheme();
    const t = useMemo(() => getTokens(darkMode), [darkMode]);
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDomainSelector, setShowDomainSelector] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState(null);
    useEffect(() => {
        const f = async () => {
            try { const { data: d } = await userAPI.dashboard(); setData(d); }
            catch {}
            finally { setLoading(false); }
        };
        f();
    }, []);
    useEffect(() => {
        if (user?.learningDomain) {
            const dm = {
                "AI & Data Science": { id: "ai-ml", label: "AI / ML", color: "#9b6dff" },
                "Web Development": { id: "web-dev", label: "Web Dev", color: "#3ecf8e" },
                "Data Science": { id: "data-science", label: "Data Science", color: "#4f8ef7" },
                "Cybersecurity": { id: "cybersecurity", label: "Cybersecurity", color: "#f76060" },
                "Cloud Computing": { id: "cloud", label: "Cloud", color: "#38c9d8" },
            };
            setSelectedDomain(dm[user.learningDomain] || null);
        }
    }, [user]);
    const skills = data?.skills || user?.skills || {};
    const topSkills = Object.entries(skills).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const stats = data?.stats || {};
    const overallScore = stats.overallScore || 0;
    const aiInsight = data?.aiInsight || {};
    const xpForNextLevel = user ? user.level * 500 : 500;
    const xpToNext = xpForNextLevel - (user?.xp || 0);
    const xpPct = Math.min(100, Math.round(((user?.xp || 0) / xpForNextLevel) * 100));
    if (loading) return <LoadingState t={t} />;
    return (
        <Box className="stagger" sx={{ width: "100%", minHeight: "100%", color: t.text.primary, pb: 8, animation: "fadeIn 0.45s ease both" }}>
            <DomainSelector open={showDomainSelector} onClose={() => setShowDomainSelector(false)} onSelect={(d) => { setSelectedDomain(d); setShowDomainSelector(false); }} />
            <AIChatbot domain={selectedDomain} />
            <Box className="clay-enter" sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexWrap: "wrap", gap: 2 }}>
                <Box>
                    <Typography sx={{ color: t.text.muted, fontSize: 10, letterSpacing: 3, mb: 1, fontWeight: 700 }}>AI LEARNING COMMAND CENTER</Typography>
                    <Typography sx={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1, background: t.dark ? "linear-gradient(135deg, #fff, #9b6dff)" : `linear-gradient(135deg, ${t.text.primary}, #9b6dff)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        Welcome back, {user?.name?.split(" ")[0] || "Learner"}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 2, flexWrap: "wrap" }}>
                        {selectedDomain ? (
                            <Chip label={selectedDomain.label} size="small" sx={{ background: `${selectedDomain.color}18`, border: `1px solid ${selectedDomain.color}45`, color: selectedDomain.color, fontSize: 11, height: 26, fontWeight: 700 }} />
                        ) : (
                            <ClayButton t={t} accent="#9b6dff" variant="outline" size="small" onClick={() => setShowDomainSelector(true)} sx={{ height: 28, fontSize: 11 }}>Choose Your Domain</ClayButton>
                        )}
                        <Chip icon={<WhatshotRoundedIcon sx={{ fontSize: 14, color: "#f7934c" }} />} label={`${user?.streak || 0} day streak`} sx={{ background: "#f7934c15", border: "1px solid #f7934c35", color: "#f7934c", fontSize: 11, height: 26, fontWeight: 700 }} />
                    </Box>
                </Box>
                <GlassPanel t={t} sx={{ display: "flex", alignItems: "center", gap: 2, px: 2.5, py: 1.5 }}>
                    <Box sx={{ textAlign: "right" }}>
                        <Typography sx={{ fontSize: 11, color: t.text.muted }}>Level {user?.level || 1}</Typography>
                        <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#4f8ef7" }}>{user?.xp || 0} XP</Typography>
                    </Box>
                    <Avatar sx={{ width: 44, height: 44, background: "linear-gradient(145deg, #4f8ef7, #9b6dff)", border: "1px solid rgba(255,255,255,0.3)", boxShadow: t.shadow.glassSm, fontSize: 18, fontWeight: 800 }}>{user?.name?.[0]?.toUpperCase() || "U"}</Avatar>
                </GlassPanel>
            </Box>
            <ClayCard t={t} sx={{ p: 2.5, mb: 2.5 }} hover={false}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.25 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: t.text.primary }}>Level {user?.level || 1} Progress</Typography>
                    <Typography sx={{ fontSize: 11, color: t.text.secondary }}>{xpToNext} XP to Level {(user?.level || 1) + 1}</Typography>
                </Box>
                <Box sx={{ height: 10, borderRadius: 10, background: t.glass.inset, border: `1px solid ${t.border.subtle}`, overflow: "hidden" }}>
                    <Box sx={{ height: "100%", width: `${xpPct}%`, borderRadius: 10, background: "linear-gradient(90deg, #4f8ef7, #9b6dff)" }} />
                </Box>
            </ClayCard>


            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 2.5 }}>
                {[
                    { label: "Overall Score", value: `${overallScore}%`, icon: <TrendingUpRoundedIcon />, color: "#3ecf8e" },
                    { label: "Courses", value: stats.totalCourses || 0, icon: <SchoolRoundedIcon />, color: "#4f8ef7" },
                    { label: "Assessments", value: stats.assessmentsTaken || 0, icon: <QueryStatsRoundedIcon />, color: "#9b6dff" },
                    { label: "Achievements", value: user?.achievements?.length || 0, icon: <EmojiEventsRoundedIcon />, color: "#f7934c" },
                ].map((stat, i) => (
                    <Fade key={i} in timeout={(i + 1) * 150}>
                        <Box className={`clay-enter-${i}`}><StatTile t={t} icon={stat.icon} value={stat.value} label={stat.label} accent={stat.color} /></Box>
                    </Fade>
                ))}
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2.5 }}>
                <StudyPlanner t={t} skills={skills} />
                <MasteryMap t={t} skills={skills} navigate={navigate} />
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 2, mb: 2.5 }}>
                <ClayCard t={t} sx={{ p: 3, position: "relative", overflow: "hidden" }}>
                    <Box sx={{ position: "absolute", top: -30, right: -30, width: 130, height: 130, borderRadius: "50%", background: "radial-gradient(circle, rgba(155,109,255,0.16), transparent)" }} />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(145deg, #9b6dff, #4f8ef7)", border: "1px solid rgba(255,255,255,0.25)", boxShadow: t.shadow.glassSm }}>
                            <SmartToyRoundedIcon sx={{ fontSize: 18, color: "#fff" }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: t.text.primary }}>AI Insight</Typography>
                            <Typography sx={{ fontSize: 9, color: t.text.muted }}>Personalized for you</Typography>
                        </Box>
                    </Box>
                    <Typography sx={{ fontSize: 13, color: t.text.secondary, lineHeight: 1.7 }}>{aiInsight.summary || "Take assessments to unlock personalized insights."}</Typography>
                    <GlassPanel t={t} sx={{ mt: 2, p: 2 }}>
                        <Typography sx={{ fontSize: 11, color: "#9b6dff", fontWeight: 700, mb: 0.5 }}>Recommendation</Typography>
                        <Typography sx={{ fontSize: 11, color: t.text.secondary }}>{aiInsight.recommendation || "Follow the personalized path."}</Typography>
                    </GlassPanel>
                </ClayCard>
                <ClayCard t={t} sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: t.text.primary, mb: 2 }}>Quick Actions</Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {[
                            { label: "Take Assessment", icon: <PsychologyRoundedIcon sx={{ fontSize: 16 }} />, color: "#9b6dff", path: "/courses" },
                            { label: "Browse Courses", icon: <SchoolRoundedIcon sx={{ fontSize: 16 }} />, color: "#4f8ef7", path: "/courses" },
                            { label: "View Roadmap", icon: <TrackChangesRoundedIcon sx={{ fontSize: 16 }} />, color: "#3ecf8e", path: "/roadmap" },
                            { label: "Practice Now", icon: <FlashOnRoundedIcon sx={{ fontSize: 16 }} />, color: "#f7934c", path: "/practice" },
                        ].map((a, i) => (
                            <Button key={i} onClick={() => navigate(a.path)} fullWidth startIcon={a.icon}
                                sx={{ justifyContent: "flex-start", p: 1.5, borderRadius: "12px", textTransform: "none", color: t.text.secondary, border: `1px solid ${t.border.subtle}`, "&:hover": { background: `${a.color}14`, borderColor: `${a.color}40`, color: a.color } }}>{a.label}</Button>
                        ))}
                    </Box>
                </ClayCard>
            </Box>


            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2.5 }}>
                <ClayCard t={t} sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: t.text.primary }}>Top Skills</Typography>
                        <Button onClick={() => navigate("/skill-profile")} sx={{ color: t.text.muted, textTransform: "none", fontSize: 11 }}>View All</Button>
                    </Box>
                    {topSkills.length > 0 ? (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            {topSkills.map(([skill, value], i) => (
                                <Fade key={i} in timeout={(i + 1) * 100}>
                                    <Box>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                            <Typography sx={{ fontSize: 12, fontWeight: 600, color: t.text.primary }}>{skill}</Typography>
                                            <Typography sx={{ fontSize: 11, color: t.text.muted }}>{value}%</Typography>
                                        </Box>
                                        <Box sx={{ height: 7, borderRadius: 10, background: t.glass.inset, border: `1px solid ${t.border.subtle}`, overflow: "hidden" }}>
                                            <Box sx={{ height: "100%", width: `${value}%`, borderRadius: 10, background: "linear-gradient(90deg, #4f8ef7, #9b6dff)" }} />
                                        </Box>
                                    </Box>
                                </Fade>
                            ))}
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: "center", py: 3 }}>
                            <Typography sx={{ fontSize: 12, color: t.text.muted, mb: 1.5 }}>No assessed skills yet</Typography>
                            <ClayButton t={t} accent="#9b6dff" size="small" onClick={() => navigate("/courses")}>Take Assessment</ClayButton>
                        </Box>
                    )}
                </ClayCard>
                <ClayCard t={t} sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: t.text.primary }}>{selectedDomain ? `${selectedDomain.label} Path` : "Choose Domain"}</Typography>
                        <Button onClick={() => setShowDomainSelector(true)} sx={{ color: t.text.muted, textTransform: "none", fontSize: 11 }}>Change</Button>
                    </Box>
                    {selectedDomain ? (
                        <Box>
                            <GlassPanel t={t} sx={{ p: 2, mb: 2 }}>
                                <Typography sx={{ fontSize: 12, fontWeight: 700, color: t.text.primary }}>{selectedDomain.label}</Typography>
                                <Typography sx={{ fontSize: 10, color: t.text.secondary, mt: 0.5 }}>Your focused learning track.</Typography>
                            </GlassPanel>
                            <ClayButton t={t} accent={selectedDomain.color || "#4f8ef7"} fullWidth sx={{ mt: 1, height: 38 }} onClick={() => navigate("/roadmap")}>View Learning Path</ClayButton>
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: "center", py: 3 }}>
                            <Typography sx={{ fontSize: 12, color: t.text.muted, mb: 1.5 }}>Select your domain</Typography>
                            <ClayButton t={t} accent="#9b6dff" size="small" onClick={() => setShowDomainSelector(true)}>Choose Domain</ClayButton>
                        </Box>
                    )}
                </ClayCard>
            </Box>


            <ClayCard t={t} sx={{ p: 3, mb: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(145deg, #9b6dff, #4f8ef7)", border: "1px solid rgba(255,255,255,0.25)", boxShadow: t.shadow.glassSm }}>
                        <AutoAwesomeRoundedIcon sx={{ fontSize: 18, color: "#fff" }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: t.text.primary }}>AI-Powered Features</Typography>
                        <Typography sx={{ fontSize: 10, color: t.text.muted }}>Chat with your AI Career Mentor</Typography>
                    </Box>
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1.5 }}>
                    {[
                        { icon: <SmartToyRoundedIcon sx={{ color: "#9b6dff" }} />, title: "AI Career Mentor", desc: "24/7 guidance", color: "#9b6dff" },
                        { icon: <LightbulbRoundedIcon sx={{ color: "#4f8ef7" }} />, title: "Skill Analyzer", desc: "Gaps & strengths", color: "#4f8ef7" },
                        { icon: <TrackChangesRoundedIcon sx={{ color: "#3ecf8e" }} />, title: "Learning Path AI", desc: "Custom roadmaps", color: "#3ecf8e" },
                        { icon: <FlashOnRoundedIcon sx={{ color: "#f7934c" }} />, title: "Progress Predictor", desc: "Readiness estimate", color: "#f7934c" },
                    ].map((f, i) => (
                        <Fade key={i} in timeout={(i + 1) * 150}>
                            <Box sx={{ p: 2, borderRadius: "16px", background: `${f.color}0d`, border: `1px solid ${f.color}30`, textAlign: "center", boxShadow: t.shadow.glassSm, transition: "transform 0.2s", "&:hover": { transform: "translateY(-3px)" } }}>
                                <Box sx={{ width: 40, height: 40, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5, background: t.glass.face, border: `1px solid ${t.border.subtle}` }}>{f.icon}</Box>
                                <Typography sx={{ fontSize: 11, fontWeight: 700, color: t.text.primary, mb: 0.5 }}>{f.title}</Typography>
                                <Typography sx={{ fontSize: 9, color: t.text.muted }}>{f.desc}</Typography>
                            </Box>
                        </Fade>
                    ))}
                </Box>
            </ClayCard>
            {(!user?.assessmentHistory || user.assessmentHistory.length === 0) && (
                <ClayCard t={t} sx={{ p: 4, textAlign: "center" }}>
                    <PsychologyRoundedIcon sx={{ fontSize: 44, color: "#9b6dff", mb: 2 }} />
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: t.text.primary, mb: 1 }}>Take your first skill assessment</Typography>
                    <Typography sx={{ color: t.text.secondary, fontSize: 13, mb: 3 }}>Let AI analyse your level and identify gaps.</Typography>
                    <ClayButton t={t} accent="#9b6dff" sx={{ px: 4 }} onClick={() => navigate("/courses")}>Browse Courses & Take Tests</ClayButton>
                </ClayCard>
            )}
        </Box>
    );
};

export default Home;
