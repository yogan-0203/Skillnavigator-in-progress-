import { useState, useRef, useEffect } from "react";
import {
    Box, Typography, TextField, IconButton, Fab, Drawer,
    Fade, Chip, Avatar, Collapse,
} from "@mui/material";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import LightbulbRoundedIcon from "@mui/icons-material/LightbulbRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";

const QUICK_PROMPTS = [
    { icon: <LightbulbRoundedIcon sx={{ fontSize: 14 }} />, text: "What skills do I need for AI/ML?", color: "#9b6dff" },
    { icon: <PsychologyRoundedIcon sx={{ fontSize: 14 }} />, text: "Create a learning roadmap for me", color: "#4f8ef7" },
    { icon: <RocketLaunchRoundedIcon sx={{ fontSize: 14 }} />, text: "How do I get my first job?", color: "#3ecf8e" },
];

const AI_RESPONSES = {
    "what skills do i need for ai/ml?": `Great question! Here's your personalized AI/ML skill roadmap:\n\n**Phase 1 - Foundations (Weeks 1-4)**\n Python Programming → NumPy & Pandas → Linear Algebra\n\n**Phase 2 - Core ML (Weeks 5-10)**\n Machine Learning Algorithms → Scikit-learn → Feature Engineering\n\n**Phase 3 - Deep Learning (Weeks 11-16)**\n Neural Networks → TensorFlow/PyTorch → CNNs & RNNs\n\n**Phase 4 - Specialization (Weeks 17-24)**\n NLP or Computer Vision → MLOps → Projects Portfolio\n\nI recommend starting with Python fundamentals and taking our Python for Beginners course first!`,
    "create a learning roadmap for me": `I've analyzed your profile and created a personalized roadmap!\n\n**Your Current Level:** Beginner (assessed from your skills)\n**Target Role:** AI/ML Engineer\n**Estimated Timeline:** 6 months\n\n**Month 1-2: Foundations**\n→ Python Advanced course\n→ Statistics for Data Science\n→ 2 mini-projects\n\n**Month 3-4: Core Skills**\n→ Machine Learning Fundamentals\n→ Deep Learning with Neural Networks\n→ Kaggle competitions\n\n**Month 5-6: Advanced & Portfolio**\n→ NLP or Computer Vision specialization\n→ 3 portfolio projects\n→ Mock interviews\n\nWould you like me to enroll you in the first course?`,
    "how do i get my first job?": `Here's your job-ready action plan:\n\n**Step 1: Build Portfolio (Do this week)**\n→ 3 solid projects on GitHub\n→ Deploy one project online\n\n**Step 2: Optimize Presence**\n→ LinkedIn profile with keywords\n→ GitHub with good READMEs\n→ Technical blog (even 2-3 posts)\n\n**Step 3: Apply Strategically**\n→ 10 applications/day to relevant roles\n→ Target: Startups + Mid-size companies\n→ Roles: Junior ML Engineer, Data Analyst, AI Intern\n\n**Step 4: Prepare for Interviews**\n→ Take 5+ assessments on our platform\n→ Practice coding problems\n→ Prepare project explanations\n\n**Pro Tip:** Companies value projects more than certificates. Focus on building!`,
};

const getAIResponse = (message) => {
    const lowerMsg = message.toLowerCase().trim();
    
    for (const [key, response] of Object.entries(AI_RESPONSES)) {
        if (lowerMsg.includes(key) || key.includes(lowerMsg)) return response;
    }
    
    if (lowerMsg.includes("skill") || lowerMsg.includes("learn")) {
        return `Based on your domain interest, here are the key skills you should focus on:\n\n**Technical Skills:**\n→ Programming (Python/JavaScript)\n→ Domain-specific tools\n→ Data structures & algorithms\n\n**Soft Skills:**\n→ Problem-solving\n→ Communication\n→ Project management\n\nWould you like me to create a detailed learning plan for you?`;
    }
    
    if (lowerMsg.includes("job") || lowerMsg.includes("career") || lowerMsg.includes("interview")) {
        return `Let me help you with career guidance!\n\n**Quick Assessment:**\n→ Take skill assessments to identify gaps\n→ Build 2-3 portfolio projects\n→ Practice with our AI interview prep\n\n**Current Market Trends:**\n→ AI/ML roles are up 75% this year\n→ Remote opportunities available\n→ Average entry salary: ₹8-15 LPA\n\nWant me to analyze your resume or suggest specific roles?`;
    }
    
    if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("hey")) {
        return `Hey there! I'm your AI Career Mentor. I can help you with:\n\n→ Learning roadmaps\n→ Skill gap analysis\n→ Career guidance\n→ Interview preparation\n→ Project ideas\n\nWhat would you like to explore today?`;
    }
    
    return `That's a great question! Let me think about that...\n\nBased on your current profile and goals, here are my recommendations:\n\n**Immediate Actions:**\n→ Take a skill assessment to identify your level\n→ Browse relevant courses in your domain\n→ Set weekly learning goals\n\n**This Week:**\n→ Complete one learning module\n→ Practice with hands-on exercises\n→ Track your progress on the dashboard\n\nIs there anything specific you'd like to dive deeper into? I can help with learning paths, career advice, or technical questions!`;
};

const AIChatbot = ({ domain }) => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "ai", text: `Hi! I'm your AI Career Mentor. I see you're interested in ${domain?.label || "learning"}. How can I help you today?` }
    ]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = (text) => {
        if (!text.trim()) return;
        const userMsg = { role: "user", text: text.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setTyping(true);

        setTimeout(() => {
            const response = getAIResponse(text);
            setMessages(prev => [...prev, { role: "ai", text: response }]);
            setTyping(false);
        }, 1200 + Math.random() * 800);
    };

    return (
        <>
            {/* Floating Action Button */}
            <Fab
                onClick={() => setOpen(true)}
                sx={{
                    position: "fixed", bottom: 24, right: 24, zIndex: 1000,
                    background: "linear-gradient(135deg, #9b6dff, #4f8ef7)",
                    color: "#fff", width: 56, height: 56,
                    boxShadow: "0 4px 20px rgba(155,109,255,0.4)",
                    "&:hover": { background: "linear-gradient(135deg, #b08aff, #6ba3ff)", boxShadow: "0 6px 30px rgba(155,109,255,0.6)" },
                    animation: "pulseGlow 2s ease infinite",
                }}
            >
                <SmartToyRoundedIcon sx={{ fontSize: 26 }} />
            </Fab>

            {/* Chat Drawer */}
            <Drawer anchor="right" open={open} onClose={() => setOpen(false)}
                PaperProps={{ sx: { width: 400, maxWidth: "90vw", background: "#08080c", borderLeft: "1px solid rgba(255,255,255,0.08)" } }}
            >
                <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    {/* Header */}
                    <Box sx={{ p: 2, borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Box sx={{ width: 36, height: 36, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(155,109,255,0.2), rgba(79,142,247,0.2))", border: "1px solid rgba(155,109,255,0.3)" }}>
                                <SmartToyRoundedIcon sx={{ fontSize: 20, color: "#9b6dff" }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>AI Career Mentor</Typography>
                                <Typography sx={{ fontSize: 10, color: "#3ecf8e" }}>Online</Typography>
                            </Box>
                        </Box>
                        <IconButton onClick={() => setOpen(false)} sx={{ color: "rgba(255,255,255,0.4)" }}>
                            <CloseRoundedIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Box>

                    {/* Messages */}
                    <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                        {messages.map((msg, i) => (
                            <Fade key={i} in timeout={300}>
                                <Box sx={{ display: "flex", gap: 1, flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                                    <Avatar sx={{ width: 28, height: 28, background: msg.role === "ai" ? "linear-gradient(135deg, #9b6dff, #4f8ef7)" : "rgba(255,255,255,0.1)", flexShrink: 0 }}>
                                        {msg.role === "ai" ? <SmartToyRoundedIcon sx={{ fontSize: 16 }} /> : <Typography sx={{ fontSize: 12 }}>U</Typography>}
                                    </Avatar>
                                    <Box sx={{ maxWidth: "80%", p: 1.5, borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                                        background: msg.role === "user" ? "linear-gradient(135deg, #4f8ef7, #9b6dff)" : "rgba(255,255,255,0.05)", border: msg.role === "ai" ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                                        <Typography sx={{ fontSize: 12, whiteSpace: "pre-wrap", lineHeight: 1.6, color: msg.role === "user" ? "#fff" : "rgba(255,255,255,0.8)" }}>{msg.text}</Typography>
                                    </Box>
                                </Box>
                            </Fade>
                        ))}
                        {typing && (
                            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                <Avatar sx={{ width: 28, height: 28, background: "linear-gradient(135deg, #9b6dff, #4f8ef7)" }}>
                                    <SmartToyRoundedIcon sx={{ fontSize: 16 }} />
                                </Avatar>
                                <Box sx={{ p: 1.5, borderRadius: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                    <Box sx={{ display: "flex", gap: 0.5 }}>
                                        <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: "#9b6dff", animation: "float 1s ease infinite" }} />
                                        <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: "#4f8ef7", animation: "float 1s ease infinite 0.2s" }} />
                                        <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: "#3ecf8e", animation: "float 1s ease infinite 0.4s" }} />
                                    </Box>
                                </Box>
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Quick Prompts */}
                    {messages.length <= 1 && (
                        <Box sx={{ px: 2, pb: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                            {QUICK_PROMPTS.map((prompt, i) => (
                                <Chip key={i} label={prompt.text} icon={prompt.icon} onClick={() => sendMessage(prompt.text)}
                                    sx={{ fontSize: 10, height: 28, color: prompt.color, background: `${prompt.color}10`, border: `1px solid ${prompt.color}25`, "&:hover": { background: `${prompt.color}20` } }} />
                            ))}
                        </Box>
                    )}

                    {/* Input */}
                    <Box sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                            <TextField fullWidth size="small" placeholder="Ask me anything..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", color: "#fff", "& fieldset": { borderColor: "rgba(255,255,255,0.1)" }, "&:hover fieldset": { borderColor: "rgba(155,109,255,0.3)" }, "&.Mui-focused fieldset": { borderColor: "#9b6dff" } } }} />
                            <IconButton onClick={() => sendMessage(input)} disabled={!input.trim()}
                                sx={{ width: 40, height: 40, borderRadius: "12px", background: input.trim() ? "linear-gradient(135deg, #9b6dff, #4f8ef7)" : "rgba(255,255,255,0.05)", color: "#fff", "&:hover": { background: "linear-gradient(135deg, #b08aff, #6ba3ff)" }, "&.Mui-disabled": { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.2)" } }}>
                                <SendRoundedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>
            </Drawer>
        </>
    );
};

export default AIChatbot;
