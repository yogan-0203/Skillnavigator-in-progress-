import { useState } from "react";
import {
    Box, Typography, LinearProgress, Chip, Button,
    Dialog, DialogTitle, DialogContent, TextField, DialogActions,
    CircularProgress,
} from "@mui/material";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import DataObjectRoundedIcon from "@mui/icons-material/DataObjectRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
    ResponsiveContainer, RadarChart, Radar,
    PolarGrid, PolarAngleAxis,
} from "recharts";
import { useAuth } from "./AuthContext";
import { userAPI } from "./api";
import { useNavigate } from "react-router-dom";

const card = {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    background: "linear-gradient(145deg, rgba(255,255,255,0.045), rgba(255,255,255,0.012))",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.012), 0 20px 50px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.05)",
};

const SKILL_META = {
    Python:              { icon: <CodeRoundedIcon />, category:"Programming", color:"#4f8ef7" },
    "Machine Learning":  { icon: <PsychologyRoundedIcon />, category:"AI", color:"#9b6dff" },
    SQL:                 { icon: <StorageRoundedIcon />, category:"Database", color:"#3ecf8e" },
    "Data Structures":   { icon: <DataObjectRoundedIcon />, category:"CS", color:"#f7934c" },
    Statistics:          { icon: <TrendingUpRoundedIcon />, category:"Mathematics", color:"#38c9d8" },
    "Deep Learning":     { icon: <PsychologyRoundedIcon />, category:"AI", color:"#f76060" },
    NLP:                 { icon: <AutoAwesomeRoundedIcon />, category:"AI", color:"#9b6dff" },
};

const LEVEL_LABELS = [
    [80, "Expert"],
    [60, "Advanced"],
    [40, "Intermediate"],
    [0,  "Beginner"],
];
const getLevel = (score) => LEVEL_LABELS.find(([min]) => score >= min)?.[1] || "Beginner";

const SkillProfile = () => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [editOpen, setEditOpen] = useState(false);
    const [editSkills, setEditSkills] = useState({});
    const [saving, setSaving] = useState(false);

    const userSkills = user?.skills || {};
    const skillEntries = Object.entries(userSkills).filter(([, v]) => v >= 0);

    const coreSkills = skillEntries
        .filter(([name]) => SKILL_META[name])
        .sort((a, b) => b[1] - a[1]);

    const supportingSkills = skillEntries
        .filter(([name]) => !SKILL_META[name])
        .sort((a, b) => b[1] - a[1]);

    const avgScore = skillEntries.length > 0
        ? Math.round(skillEntries.reduce((s, [, v]) => s + v, 0) / skillEntries.length)
        : 0;

    const verifiedCount = skillEntries.filter(([, v]) => v > 0).length;

    // Radar data
    const radarData = coreSkills.slice(0, 6).map(([name, value]) => ({
        skill: name.split(" ")[0],
        value,
    }));

    const openEdit = () => {
        const init = {};
        skillEntries.forEach(([k, v]) => { init[k] = v; });
        setEditSkills(init);
        setEditOpen(true);
    };

    const saveSkills = async () => {
        setSaving(true);
        try {
            await userAPI.updateSkills(editSkills);
            await refreshUser();
            setEditOpen(false);
        } catch {
            alert("Could not save skills. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ width:"100%", minHeight:"100%", color:"#fff", pb:6, animation:"fadeIn 0.4s ease" }}>

            {/* Header */}
            <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", mb:4 }}>
                <Box>
                    <Typography sx={{ fontSize:10, letterSpacing:2.5, color:"rgba(255,255,255,0.28)", mb:1 }}>
                        PERSONAL SKILL INTELLIGENCE
                    </Typography>
                    <Typography sx={{ fontSize:32, fontWeight:800,
                        background:"linear-gradient(135deg, #fff, rgba(79,142,247,0.8))",
                        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                        Skill Profile
                    </Typography>
                    <Typography sx={{ fontSize:13, color:"rgba(255,255,255,0.35)", mt:1 }}>
                        Understand your current abilities, strengths and areas for improvement.
                    </Typography>
                </Box>
                <Button startIcon={<EditRoundedIcon />} onClick={openEdit}
                    sx={{ color:"#fff", border:"1px solid rgba(255,255,255,0.1)",
                        borderRadius:"12px", textTransform:"none", px:2,
                        "&:hover": { backgroundColor:"rgba(255,255,255,0.06)", borderColor:"rgba(255,255,255,0.2)" } }}>
                    Update Skills
                </Button>
            </Box>

            {/* Stat cards */}
            <Box sx={{ display:"grid", gridTemplateColumns:"1.1fr 0.9fr 0.9fr", gap:2, mb:2 }}>
                <Box sx={{ ...card, p:3 }}>
                    <Box sx={{ display:"flex", alignItems:"center", gap:2 }}>
                        <Box sx={{
                            width:50, height:50, borderRadius:"16px", display:"flex",
                            alignItems:"center", justifyContent:"center",
                            background:"linear-gradient(135deg, rgba(79,142,247,0.15), rgba(155,109,255,0.15))",
                            border:"1px solid rgba(79,142,247,0.2)",
                        }}>
                            <PersonOutlineRoundedIcon sx={{ color:"#4f8ef7", fontSize:26 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize:16, fontWeight:600 }}>{user?.learningDomain || "AI & Data Science"}</Typography>
                            <Typography sx={{ fontSize:11, color:"rgba(255,255,255,0.3)", mt:0.5 }}>Current learning domain</Typography>
                        </Box>
                    </Box>
                    <Typography sx={{ color:"rgba(255,255,255,0.4)", fontSize:12, lineHeight:1.7, mt:2 }}>
                        {verifiedCount > 0
                            ? `You have ${verifiedCount} assessed skills. Your strongest area is ${coreSkills[0]?.[0] || "Python"} at ${coreSkills[0]?.[1] || 0}%.`
                            : "Take skill assessments to build your profile and unlock personalised AI insights."}
                    </Typography>
                </Box>

                <Box sx={{ ...card, p:3 }}>
                    <Typography sx={{ fontSize:10, letterSpacing:1, color:"rgba(255,255,255,0.35)" }}>
                        OVERALL SKILL SCORE
                    </Typography>
                    <Typography sx={{ fontSize:46, fontWeight:800, mt:1,
                        color: avgScore >= 70 ? "#3ecf8e" : avgScore >= 40 ? "#4f8ef7" : "#f7934c" }}>
                        {avgScore}%
                    </Typography>
                    <LinearProgress variant="determinate" value={avgScore}
                        sx={{ height:6, borderRadius:10, mt:0.5,
                            backgroundColor:"rgba(255,255,255,0.06)",
                            "& .MuiLinearProgress-bar": { background:"linear-gradient(90deg,#4f8ef7,#9b6dff)", borderRadius:10 } }} />
                    <Typography sx={{ fontSize:10, color:"rgba(255,255,255,0.3)", mt:1 }}>
                        {getLevel(avgScore)} level overall
                    </Typography>
                </Box>

                <Box sx={{ ...card, p:3 }}>
                    <Typography sx={{ fontSize:10, letterSpacing:1, color:"rgba(255,255,255,0.35)" }}>
                        ASSESSED SKILLS
                    </Typography>
                    <Typography sx={{ fontSize:46, fontWeight:800, mt:1, color:"#9b6dff" }}>
                        {verifiedCount}
                    </Typography>
                    <Typography sx={{ fontSize:10, color:"rgba(255,255,255,0.3)", mt:1 }}>
                        {skillEntries.filter(([,v]) => v > 0).length} skills with scores
                    </Typography>
                </Box>
            </Box>

            {/* Core skills + radar */}
            <Box sx={{ display:"grid", gridTemplateColumns:"1.1fr 0.9fr", gap:2, mb:2 }}>
                <Box sx={{ ...card, p:3 }}>
                    <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:3 }}>
                        <Box>
                            <Typography sx={{ fontSize:18, fontWeight:600 }}>Core Skills</Typography>
                            <Typography sx={{ fontSize:11, color:"rgba(255,255,255,0.3)", mt:0.5 }}>
                                Your most important technical competencies
                            </Typography>
                        </Box>
                        <Chip label="AI Assessed" icon={<AutoAwesomeRoundedIcon />} size="small"
                            sx={{ color:"rgba(255,255,255,0.5)", backgroundColor:"rgba(255,255,255,0.05)",
                                border:"1px solid rgba(255,255,255,0.08)", fontSize:10,
                                "& .MuiChip-icon": { color:"rgba(255,255,255,0.5)", fontSize:14 } }} />
                    </Box>

                    {coreSkills.length > 0 ? (
                        <Box sx={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:2 }}>
                            {coreSkills.map(([name, score]) => {
                                const meta = SKILL_META[name] || { icon:<CodeRoundedIcon />, category:"Skill", color:"#4f8ef7" };
                                const level = getLevel(score);
                                return (
                                    <Box key={name} sx={{ p:2.5, borderRadius:"16px",
                                        border:`1px solid ${meta.color}20`, backgroundColor:`${meta.color}06` }}>
                                        <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                                            <Box sx={{ display:"flex", alignItems:"center", gap:1.5 }}>
                                                <Box sx={{ width:38, height:38, borderRadius:"11px", display:"flex",
                                                    alignItems:"center", justifyContent:"center",
                                                    backgroundColor:`${meta.color}18`, border:`1px solid ${meta.color}30`,
                                                    "& svg": { color: meta.color, fontSize:18 } }}>
                                                    {meta.icon}
                                                </Box>
                                                <Box>
                                                    <Typography sx={{ fontSize:13, fontWeight:600 }}>{name}</Typography>
                                                    <Typography sx={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>{meta.category}</Typography>
                                                </Box>
                                            </Box>
                                            <Chip label={level} size="small"
                                                sx={{ fontSize:9, color:meta.color,
                                                    backgroundColor:`${meta.color}18`, border:`1px solid ${meta.color}30` }} />
                                        </Box>
                                        <Box sx={{ display:"flex", justifyContent:"space-between", mt:2, mb:0.7 }}>
                                            <Typography sx={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>Proficiency</Typography>
                                            <Typography sx={{ fontSize:12, fontWeight:700, color:meta.color }}>{score}%</Typography>
                                        </Box>
                                        <LinearProgress variant="determinate" value={score}
                                            sx={{ height:5, borderRadius:10,
                                                backgroundColor:"rgba(255,255,255,0.06)",
                                                "& .MuiLinearProgress-bar": { background:`linear-gradient(90deg,${meta.color},${meta.color}88)`, borderRadius:10 } }} />
                                    </Box>
                                );
                            })}
                        </Box>
                    ) : (
                        <Box sx={{ textAlign:"center", py:4 }}>
                            <Typography sx={{ color:"rgba(255,255,255,0.35)", fontSize:13, mb:2 }}>
                                No skills assessed yet. Take a course test to get started.
                            </Typography>
                            <Button onClick={() => navigate("/courses")}
                                sx={{ color:"#4f8ef7", textTransform:"none", fontSize:12 }}>
                                Go to Courses →
                            </Button>
                        </Box>
                    )}
                </Box>

                {/* Radar chart */}
                <Box sx={{ ...card, p:3 }}>
                    <Typography sx={{ fontSize:18, fontWeight:600, mb:1 }}>Skill Radar</Typography>
                    <Typography sx={{ fontSize:11, color:"rgba(255,255,255,0.3)", mb:2 }}>Visual overview of your abilities</Typography>
                    {radarData.length > 2 ? (
                        <Box sx={{ height:250 }}>
                            <ResponsiveContainer>
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.07)" />
                                    <PolarAngleAxis dataKey="skill"
                                        tick={{ fill:"rgba(255,255,255,0.45)", fontSize:10 }} />
                                    <Radar name="Skills" dataKey="value"
                                        stroke="#4f8ef7" fill="#4f8ef7" fillOpacity={0.18} strokeWidth={2} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </Box>
                    ) : (
                        <Box sx={{ height:250, display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <Typography sx={{ fontSize:12, color:"rgba(255,255,255,0.25)", textAlign:"center" }}>
                                Complete more assessments<br />to see your skill radar.
                            </Typography>
                        </Box>
                    )}

                    {/* AI Insight */}
                    <Box sx={{ mt:2, p:2, borderRadius:"13px",
                        border:"1px solid rgba(155,109,255,0.15)", backgroundColor:"rgba(155,109,255,0.06)" }}>
                        <Box sx={{ display:"flex", alignItems:"center", gap:1, mb:1 }}>
                            <WarningAmberRoundedIcon sx={{ fontSize:15, color:"#9b6dff" }} />
                            <Typography sx={{ fontSize:12, fontWeight:600 }}>Recommended Focus</Typography>
                        </Box>
                        <Typography sx={{ color:"rgba(255,255,255,0.35)", fontSize:11, lineHeight:1.6 }}>
                            {coreSkills.length > 0
                                ? `Improve ${coreSkills[coreSkills.length-1]?.[0] || "NLP"} → Model Deployment → MLOps`
                                : "Start with Python basics → Statistics → Machine Learning"}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Supporting skills */}
            {supportingSkills.length > 0 && (
                <Box sx={{ ...card, p:3 }}>
                    <Typography sx={{ fontSize:18, fontWeight:600, mb:3 }}>Supporting Skills</Typography>
                    <Box sx={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:1.5 }}>
                        {supportingSkills.map(([name, score]) => (
                            <Box key={name} sx={{ p:1.5, borderRadius:"13px", backgroundColor:"rgba(255,255,255,0.025)",
                                border:"1px solid rgba(255,255,255,0.06)" }}>
                                <Box sx={{ display:"flex", justifyContent:"space-between", mb:0.7 }}>
                                    <Typography sx={{ fontSize:11, color:"rgba(255,255,255,0.55)" }}>{name}</Typography>
                                    <Typography sx={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{score}%</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={score}
                                    sx={{ height:3, borderRadius:10,
                                        backgroundColor:"rgba(255,255,255,0.05)",
                                        "& .MuiLinearProgress-bar": { backgroundColor:"rgba(255,255,255,0.4)", borderRadius:10 } }} />
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {/* Edit Skills Modal */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { backgroundColor:"#0c0c12", border:"1px solid rgba(255,255,255,0.1)",
                    borderRadius:"20px" } }}>
                <DialogTitle sx={{ color:"#fff" }}>
                    <Typography sx={{ fontSize:18, fontWeight:700 }}>Update Your Skills</Typography>
                    <Typography sx={{ fontSize:12, color:"rgba(255,255,255,0.4)", mt:0.5 }}>
                        Set your current skill level (0-100)
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display:"flex", flexDirection:"column", gap:2, pt:1 }}>
                        {Object.entries(editSkills).map(([skill, value]) => (
                            <Box key={skill}>
                                <Box sx={{ display:"flex", justifyContent:"space-between", mb:1 }}>
                                    <Typography sx={{ fontSize:13, color:"rgba(255,255,255,0.7)" }}>{skill}</Typography>
                                    <Typography sx={{ fontSize:13, fontWeight:700, color:"#4f8ef7" }}>{value}%</Typography>
                                </Box>
                                <TextField type="number" fullWidth size="small"
                                    value={value}
                                    onChange={(e) => {
                                        const v = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                        setEditSkills(p => ({ ...p, [skill]: v }));
                                    }}
                                    inputProps={{ min:0, max:100 }}
                                    sx={{ "& .MuiOutlinedInput-root": {
                                            color:"#fff", borderRadius:"10px",
                                            "& fieldset": { borderColor:"rgba(255,255,255,0.12)" },
                                            "&:hover fieldset": { borderColor:"rgba(255,255,255,0.25)" },
                                            "&.Mui-focused fieldset": { borderColor:"#4f8ef7" },
                                        },
                                        "& input": { textAlign:"center" },
                                    }} />
                            </Box>
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px:3, pb:3 }}>
                    <Button onClick={() => setEditOpen(false)}
                        sx={{ color:"rgba(255,255,255,0.4)", textTransform:"none" }}>
                        Cancel
                    </Button>
                    <Button onClick={saveSkills} disabled={saving} variant="contained"
                        sx={{ background:"linear-gradient(135deg,#4f8ef7,#9b6dff)",
                            color:"#fff", textTransform:"none", borderRadius:"10px",
                            "&:disabled": { opacity:0.5 } }}>
                        {saving ? <CircularProgress size={18} sx={{ color:"#fff" }} /> : "Save Skills"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SkillProfile;
