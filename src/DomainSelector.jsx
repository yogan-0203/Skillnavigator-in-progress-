import { useState, useRef, useEffect } from "react";
import {
    Box, Typography, Chip, Button, TextField, Autocomplete,
    Fade, Paper, Backdrop, LinearProgress, IconButton, Tooltip,
} from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import CloudRoundedIcon from "@mui/icons-material/CloudRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import PhoneAndroidRoundedIcon from "@mui/icons-material/PhoneAndroidRounded";
import BiotechRoundedIcon from "@mui/icons-material/BiotechRounded";
import SchemaRoundedIcon from "@mui/icons-material/SchemaRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";
import LightbulbRoundedIcon from "@mui/icons-material/LightbulbRounded";
import TrackChangesRoundedIcon from "@mui/icons-material/TrackChangesRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { useAuth } from "./AuthContext";
import { getTokens } from "./theme/tokens";

const DOMAINS = [
    { id: "ai-ml", label: "AI / Machine Learning", icon: <PsychologyRoundedIcon sx={{ fontSize: 20 }} />, color: "#9b6dff", description: "Neural networks, deep learning, NLP, computer vision" },
    { id: "data-science", label: "Data Science", icon: <StorageRoundedIcon sx={{ fontSize: 20 }} />, color: "#4f8ef7", description: "Analytics, statistics, visualization, big data" },
    { id: "web-dev", label: "Web Development", icon: <CodeRoundedIcon sx={{ fontSize: 20 }} />, color: "#3ecf8e", description: "React, Node.js, full-stack, APIs" },
    { id: "cybersecurity", label: "Cybersecurity", icon: <SecurityRoundedIcon sx={{ fontSize: 20 }} />, color: "#f76060", description: "Ethical hacking, network security, cryptography" },
    { id: "cloud", label: "Cloud Computing", icon: <CloudRoundedIcon sx={{ fontSize: 20 }} />, color: "#38c9d8", description: "AWS, Azure, DevOps, Kubernetes" },
    { id: "mobile", label: "Mobile Development", icon: <PhoneAndroidRoundedIcon sx={{ fontSize: 20 }} />, color: "#f7934c", description: "React Native, Flutter, iOS, Android" },
    { id: "blockchain", label: "Blockchain / Web3", icon: <SchemaRoundedIcon sx={{ fontSize: 20 }} />, color: "#f77eb8", description: "Smart contracts, DeFi, NFTs, Solidity" },
    { id: "biotech", label: "Biotech / Health Tech", icon: <BiotechRoundedIcon sx={{ fontSize: 20 }} />, color: "#4f8ef7", description: "Bioinformatics, health data, medical AI" },
];

const AI_FEATURES = [
    { icon: <SmartToyRoundedIcon sx={{ color: "#9b6dff" }} />, title: "AI Career Mentor", desc: "Get personalized career guidance from an AI mentor that understands your goals" },
    { icon: <AutoFixHighRoundedIcon sx={{ color: "#4f8ef7" }} />, title: "Smart Skill Analyzer", desc: "AI analyzes your skills and identifies exactly what to learn next" },
    { icon: <LightbulbRoundedIcon sx={{ color: "#3ecf8e" }} />, title: "AI Learning Paths", desc: "Custom learning roadmaps generated based on your target role" },
    { icon: <TrackChangesRoundedIcon sx={{ color: "#f7934c" }} />, title: "Progress Predictor", desc: "AI predicts your readiness for roles and suggests improvements" },
];

const DomainSelector = ({ open, onClose, onSelect }) => {
    const { darkMode } = useTheme();
    const t = getTokens(darkMode);
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [step, setStep] = useState(0); // 0 = welcome, 1 = select domain, 2 = confirming
    const [showFeatures, setShowFeatures] = useState(false);

    useEffect(() => {
        if (open) {
            setStep(0);
            setSelectedDomain(null);
            setShowFeatures(false);
            const t1 = setTimeout(() => setStep(1), 1500);
            const t2 = setTimeout(() => setShowFeatures(true), 2500);
            return () => { clearTimeout(t1); clearTimeout(t2); };
        }
    }, [open]);

    const handleConfirm = () => {
        if (selectedDomain) {
            setStep(2);
            setTimeout(() => {
                onSelect(selectedDomain);
                onClose();
            }, 1200);
        }
    };

    if (!open) return null;

    return (
        <Backdrop open={open} onClick={onClose} sx={{ zIndex: 9999, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
            <Box onClick={(e) => e.stopPropagation()} sx={{ width: "700px", maxWidth: "95vw", animation: "fadeInScale 0.4s ease" }}>
                {/* Welcome Screen */}
                {step === 0 && (
                    <Box sx={{ textAlign: "center", py: 6, animation: "fadeIn 0.5s ease" }}>
                        <Box sx={{ width: 80, height: 80, borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3,
                            background: "linear-gradient(135deg, rgba(155,109,255,0.2), rgba(79,142,247,0.2))", border: "1px solid rgba(155,109,255,0.3)", animation: "float 3s ease-in-out infinite" }}>
                            <AutoAwesomeRoundedIcon sx={{ fontSize: 40, color: "#9b6dff" }} />
                        </Box>
                        <Typography sx={{ fontSize: 28, fontWeight: 800, mb: 1 }}>Welcome to Skill Navigator</Typography>
                        <Typography sx={{ color: t.text.primary, fontSize: 14 }}>Your AI-powered career companion</Typography>
                        <LinearProgress sx={{ mt: 4, height: 3, borderRadius: 10, width: 200, mx: "auto", backgroundColor: t.glass.inset, "& .MuiLinearProgress-bar": { background: "linear-gradient(90deg, #9b6dff, #4f8ef7)" } }} />
                    </Box>
                )}

                {/* Domain Selection */}
                {step >= 1 && (
                    <Box sx={{ animation: "fadeIn 0.5s ease" }}>
                        {/* Header */}
                        <Box sx={{ textAlign: "center", mb: 4 }}>
                            <Typography sx={{ fontSize: 11, letterSpacing: 3, color: t.text.secondary, mb: 1 }}>STEP 01</Typography>
                            <Typography sx={{ fontSize: 24, fontWeight: 700, mb: 1 }}>Choose Your Domain</Typography>
                            <Typography sx={{ color: t.text.secondary, fontSize: 13 }}>Select the field you want to master</Typography>
                        </Box>

                        {/* Domain Grid */}
                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5, mb: 3 }}>
                            {DOMAINS.map((domain, i) => (
                                <Fade key={domain.id} in timeout={(i + 1) * 200}>
                                    <Box
                                        onClick={() => setSelectedDomain(domain)}
                                        sx={{
                                            p: 2, borderRadius: "16px", cursor: "pointer",
                                            background: selectedDomain?.id === domain.id ? `${domain.color}15` : t.glass.inset,
                                            border: selectedDomain?.id === domain.id ? `1px solid ${domain.color}50` : `1px solid ${t.border.subtle}`,
                                            transition: "all 0.25s ease",
                                            "&:hover": { background: `${domain.color}10`, borderColor: `${domain.color}30`, transform: "translateY(-2px)" },
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                            <Box sx={{ color: domain.color }}>{domain.icon}</Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{domain.label}</Typography>
                                                <Typography sx={{ fontSize: 10, color: t.text.secondary, mt: 0.3 }}>{domain.description}</Typography>
                                            </Box>
                                            {selectedDomain?.id === domain.id && (
                                                <CheckCircleRoundedIcon sx={{ fontSize: 18, color: domain.color }} />
                                            )}
                                        </Box>
                                    </Box>
                                </Fade>
                            ))}
                        </Box>

                        {/* AI Features Preview */}
                        <Fade in={showFeatures} timeout={800}>
                            <Box sx={{ mb: 3 }}>
                                <Typography sx={{ fontSize: 11, letterSpacing: 3, color: t.text.secondary, mb: 2, textAlign: "center" }}>AI FEATURES YOU GET</Typography>
                                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1 }}>
                                    {AI_FEATURES.map((feat, i) => (
                                        <Box key={i} sx={{ p: 1.5, borderRadius: "12px", display: "flex", alignItems: "center", gap: 1.5, background: t.glass.inset, border: `1px solid ${t.border.subtle}` }}>
                                            {feat.icon}
                                            <Box>
                                                <Typography sx={{ fontSize: 11, fontWeight: 600 }}>{feat.title}</Typography>
                                                <Typography sx={{ fontSize: 9, color: t.text.secondary }}>{feat.desc}</Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Fade>

                        {/* Confirm Button */}
                        <Button
                            fullWidth
                            disabled={!selectedDomain}
                            onClick={handleConfirm}
                            endIcon={<ArrowForwardRoundedIcon />}
                            sx={{
                                height: 48, borderRadius: "14px", textTransform: "none", fontSize: 14, fontWeight: 600,
                                background: selectedDomain ? `linear-gradient(135deg, ${selectedDomain.color}, ${selectedDomain.color}cc)` : t.glass.chip,
                                color: selectedDomain ? "#fff" : t.text.secondary,
                                boxShadow: selectedDomain ? `0 4px 20px ${selectedDomain.color}30` : "none",
                                "&:hover": { boxShadow: selectedDomain ? `0 6px 30px ${selectedDomain.color}50` : "none" },
                                "&.Mui-disabled": { background: t.glass.inset },
                                transition: "all 0.3s ease",
                            }}
                        >
                            {step === 2 ? "Launching..." : selectedDomain ? `Start with ${selectedDomain.label}` : "Select a domain to continue"}
                        </Button>
                    </Box>
                )}
            </Box>
        </Backdrop>
    );
};

export default DomainSelector;

