import { useState } from "react";
import {
    Box, Typography, Chip, Button, Fade, LinearProgress,
    Stepper, Step, StepLabel, StepContent, IconButton, Radio,
    FormControl, FormControlLabel, RadioGroup, FormLabel,
} from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import CloudRoundedIcon from "@mui/icons-material/CloudRounded";
import PhoneAndroidRoundedIcon from "@mui/icons-material/PhoneAndroidRounded";
import SchemaRoundedIcon from "@mui/icons-material/SchemaRounded";
import BiotechRoundedIcon from "@mui/icons-material/BiotechRounded";
import TrackChangesRoundedIcon from "@mui/icons-material/TrackChangesRounded";
import LightbulbRoundedIcon from "@mui/icons-material/LightbulbRounded";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { authAPI } from "./api";
import { useTheme } from "./ThemeContext";

const CAREER_PATHS = [
    { id: "ai-engineer", title: "AI / ML Engineer", icon: <PsychologyRoundedIcon />, color: "#9b6dff", skills: ["Python", "Machine Learning", "Deep Learning", "Statistics", "NLP"], description: "Build intelligent systems that learn and adapt" },
    { id: "data-scientist", title: "Data Scientist", icon: <StorageRoundedIcon />, color: "#4f8ef7", skills: ["Python", "Statistics", "SQL", "Machine Learning", "Data Visualisation"], description: "Extract insights from complex datasets" },
    { id: "web-developer", title: "Full-Stack Developer", icon: <CodeRoundedIcon />, color: "#3ecf8e", skills: ["JavaScript", "React", "Node.js", "SQL", "Git"], description: "Build modern web applications" },
    { id: "cybersecurity", title: "Cybersecurity Analyst", icon: <SecurityRoundedIcon />, color: "#f76060", skills: ["Networking", "Linux", "Python", "Cryptography", "Risk Assessment"], description: "Protect systems and data from threats" },
    { id: "cloud-architect", title: "Cloud Architect", icon: <CloudRoundedIcon />, color: "#38c9d8", skills: ["AWS", "Docker", "Kubernetes", "Terraform", "Networking"], description: "Design scalable cloud infrastructure" },
    { id: "mobile-dev", title: "Mobile Developer", icon: <PhoneAndroidRoundedIcon />, color: "#f7934c", skills: ["React Native", "Flutter", "JavaScript", "Git", "UI/UX"], description: "Create mobile apps for iOS and Android" },
    { id: "blockchain-dev", title: "Blockchain Developer", icon: <SchemaRoundedIcon />, color: "#f77eb8", skills: ["Solidity", "JavaScript", "Cryptography", "Web3", "Smart Contracts"], description: "Build decentralized applications" },
    { id: "devops", title: "DevOps Engineer", icon: <TrackChangesRoundedIcon />, color: "#4f8ef7", skills: ["Docker", "Kubernetes", "CI/CD", "Linux", "Python"], description: "Automate and optimize deployment pipelines" },
];

const EXPERIENCE_LEVELS = [
    { id: "beginner", label: "Beginner", desc: "Just starting out, less than 1 year" },
    { id: "intermediate", label: "Intermediate", desc: "1-3 years of experience" },
    { id: "advanced", label: "Advanced", desc: "3+ years of experience" },
];

const CareerOnboarding = ({ onComplete }) => {
    const { darkMode } = useTheme();
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const [activeStep, setActiveStep] = useState(0);
    const [selectedCareer, setSelectedCareer] = useState(null);
    const [experience, setExperience] = useState("");
    const [learningGoal, setLearningGoal] = useState("");
    const [saving, setSaving] = useState(false);

    const handleNext = () => {
        if (activeStep === 0 && !selectedCareer) return;
        if (activeStep === 1 && !experience) return;
        if (activeStep === 2) {
            handleComplete();
            return;
        }
        setActiveStep((s) => s + 1);
    };

    const handleBack = () => setActiveStep((s) => Math.max(0, s - 1));

    const handleComplete = async () => {
        if (!selectedCareer) return;
        setSaving(true);
        try {
            await authAPI.updateProfile({
                targetCareer: selectedCareer.title,
                learningDomain: selectedCareer.title,
            });
            await refreshUser();
            onComplete?.();
        } catch {
            onComplete?.();
        } finally {
            setSaving(false);
        }
    };

    const bg = darkMode ? "#030306" : "#f5f5f8";
    const cardBg = darkMode ? "rgba(255,255,255,0.03)" : "#ffffff";
    const borderColor = darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
    const textPrimary = darkMode ? "#f0f0f8" : "#1a1a2e";
    const textSecondary = darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.6)";

    return (
        <Box sx={{ minHeight: "100vh", width: "100vw", background: bg, display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
            <Box sx={{ width: 640, maxWidth: "100%" }}>
                {/* Progress */}
                <Box sx={{ mb: 4 }}>
                    <LinearProgress variant="determinate" value={(activeStep / 3) * 100} sx={{ height: 4, borderRadius: 10, backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", "& .MuiLinearProgress-bar": { background: "linear-gradient(90deg, #4f8ef7, #9b6dff)", borderRadius: 10 } }} />
                    <Typography sx={{ fontSize: 11, color: textSecondary, mt: 1 }}>Step {activeStep + 1} of 4</Typography>
                </Box>

                {/* Step 0: Welcome */}
                {activeStep === 0 && (
                    <Fade in timeout={400}>
                        <Box sx={{ textAlign: "center" }}>
                            <Box sx={{ width: 72, height: 72, borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3, background: `linear-gradient(135deg, rgba(155,109,255,0.2), rgba(79,142,247,0.2))`, border: `1px solid rgba(155,109,255,0.3)` }}>
                                <AutoAwesomeRoundedIcon sx={{ fontSize: 36, color: "#9b6dff" }} />
                            </Box>
                            <Typography sx={{ fontSize: 28, fontWeight: 800, color: textPrimary, mb: 1 }}>Let's personalize your journey</Typography>
                            <Typography sx={{ fontSize: 14, color: textSecondary, mb: 4 }}>Tell us about your career goals so we can create the perfect learning path for you.</Typography>
                            <Button onClick={handleNext} variant="contained" endIcon={<ArrowForwardRoundedIcon />} sx={{ height: 48, px: 4, borderRadius: "12px", background: "linear-gradient(135deg, #4f8ef7, #9b6dff)", textTransform: "none", fontSize: 14 }}>Get Started</Button>
                        </Box>
                    </Fade>
                )}

                {/* Step 1: Career Selection */}
                {activeStep === 1 && (
                    <Fade in timeout={400}>
                        <Box>
                            <Typography sx={{ fontSize: 22, fontWeight: 700, color: textPrimary, mb: 1 }}>What career are you interested in?</Typography>
                            <Typography sx={{ fontSize: 13, color: textSecondary, mb: 3 }}>Choose the role that matches your goals</Typography>
                            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5, mb: 3 }}>
                                {CAREER_PATHS.map((career) => (
                                    <Box key={career.id} onClick={() => setSelectedCareer(career)} sx={{ p: 2, borderRadius: "14px", cursor: "pointer", background: selectedCareer?.id === career.id ? `${career.color}15` : cardBg, border: selectedCareer?.id === career.id ? `2px solid ${career.color}` : `1px solid ${borderColor}`, transition: "all 0.2s ease", "&:hover": { borderColor: `${career.color}50`, transform: "translateY(-2px)" } }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                                            <Box sx={{ color: career.color }}>{career.icon}</Box>
                                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{career.title}</Typography>
                                        </Box>
                                        <Typography sx={{ fontSize: 10, color: textSecondary }}>{career.description}</Typography>
                                        {selectedCareer?.id === career.id && <CheckCircleRoundedIcon sx={{ fontSize: 16, color: career.color, mt: 1 }} />}
                                    </Box>
                                ))}
                            </Box>
                            <Box sx={{ display: "flex", gap: 1 }}>
                                <Button onClick={handleBack} startIcon={<ArrowBackRoundedIcon />} sx={{ color: textSecondary, textTransform: "none" }}>Back</Button>
                                <Button onClick={handleNext} disabled={!selectedCareer} variant="contained" endIcon={<ArrowForwardRoundedIcon />} sx={{ ml: "auto", height: 40, px: 3, borderRadius: "10px", background: "linear-gradient(135deg, #4f8ef7, #9b6dff)", textTransform: "none", "&.Mui-disabled": { opacity: 0.4 } }}>Continue</Button>
                            </Box>
                        </Box>
                    </Fade>
                )}

                {/* Step 2: Experience Level */}
                {activeStep === 2 && (
                    <Fade in timeout={400}>
                        <Box>
                            <Typography sx={{ fontSize: 22, fontWeight: 700, color: textPrimary, mb: 1 }}>What's your experience level?</Typography>
                            <Typography sx={{ fontSize: 13, color: textSecondary, mb: 3 }}>This helps us calibrate the difficulty of your assessments</Typography>
                            <FormControl component="fieldset" sx={{ width: "100%", mb: 3 }}>
                                <RadioGroup value={experience} onChange={(e) => setExperience(e.target.value)}>
                                    {EXPERIENCE_LEVELS.map((level) => (
                                        <Box key={level.id} sx={{ p: 2, borderRadius: "12px", mb: 1, background: experience === level.id ? (darkMode ? "rgba(79,142,247,0.1)" : "rgba(79,142,247,0.05)") : cardBg, border: experience === level.id ? "2px solid #4f8ef7" : `1px solid ${borderColor}`, transition: "all 0.2s ease" }}>
                                            <FormControlLabel value={level.id} control={<Radio sx={{ color: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)", "&.Mui-checked": { color: "#4f8ef7" } }} />} label={
                                                <Box>
                                                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: textPrimary }}>{level.label}</Typography>
                                                    <Typography sx={{ fontSize: 11, color: textSecondary }}>{level.desc}</Typography>
                                                </Box>
                                            } />
                                        </Box>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <Box sx={{ display: "flex", gap: 1 }}>
                                <Button onClick={handleBack} startIcon={<ArrowBackRoundedIcon />} sx={{ color: textSecondary, textTransform: "none" }}>Back</Button>
                                <Button onClick={handleNext} disabled={!experience} variant="contained" endIcon={<ArrowForwardRoundedIcon />} sx={{ ml: "auto", height: 40, px: 3, borderRadius: "10px", background: "linear-gradient(135deg, #4f8ef7, #9b6dff)", textTransform: "none", "&.Mui-disabled": { opacity: 0.4 } }}>Continue</Button>
                            </Box>
                        </Box>
                    </Fade>
                )}

                {/* Step 3: Summary & Confirm */}
                {activeStep === 3 && (
                    <Fade in timeout={400}>
                        <Box sx={{ textAlign: "center" }}>
                            <Box sx={{ width: 72, height: 72, borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3, background: `${selectedCareer?.color}20`, border: `1px solid ${selectedCareer?.color}40` }}>
                                <Box sx={{ color: selectedCareer?.color }}>{selectedCareer?.icon}</Box>
                            </Box>
                            <Typography sx={{ fontSize: 22, fontWeight: 700, color: textPrimary, mb: 1 }}>You're all set!</Typography>
                            <Typography sx={{ fontSize: 13, color: textSecondary, mb: 3 }}>Here's your personalized learning plan</Typography>
                            <Box sx={{ p: 3, borderRadius: "16px", background: cardBg, border: `1px solid ${borderColor}`, textAlign: "left", mb: 3 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                                    <Box sx={{ color: selectedCareer?.color }}>{selectedCareer?.icon}</Box>
                                    <Box>
                                        <Typography sx={{ fontSize: 15, fontWeight: 600, color: textPrimary }}>{selectedCareer?.title}</Typography>
                                        <Typography sx={{ fontSize: 11, color: textSecondary }}>{selectedCareer?.description}</Typography>
                                    </Box>
                                </Box>
                                <Typography sx={{ fontSize: 11, color: textSecondary, mb: 1 }}>Key Skills You'll Learn:</Typography>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                    {selectedCareer?.skills.map((skill) => (
                                        <Chip key={skill} label={skill} size="small" sx={{ fontSize: 10, height: 22, background: `${selectedCareer?.color}15`, color: selectedCareer?.color, border: `1px solid ${selectedCareer?.color}30` }} />
                                    ))}
                                </Box>
                            </Box>
                            <Button onClick={handleComplete} disabled={saving} variant="contained" endIcon={saving ? null : <LightbulbRoundedIcon />} sx={{ height: 48, px: 5, borderRadius: "12px", background: `linear-gradient(135deg, ${selectedCareer?.color}, #4f8ef7)`, textTransform: "none", fontSize: 14 }}>
                                {saving ? "Setting up..." : "Start Learning"}
                            </Button>
                        </Box>
                    </Fade>
                )}
            </Box>
        </Box>
    );
};

export default CareerOnboarding;
