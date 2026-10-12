import { useState, useRef, useEffect } from "react";
import {
    Box, Typography, TextField, IconButton, Fab, Drawer,
    Fade, Chip, Avatar, Tooltip, Button, List, ListItemButton,
    ListItemText, Divider, Select, MenuItem, FormControl,
} from "@mui/material";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LightbulbRoundedIcon from "@mui/icons-material/LightbulbRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import ChildCareRoundedIcon from "@mui/icons-material/ChildCareRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import { studyAPI } from "./api";
import { studyStore } from "./studyStore";
import StudyMarkdown from "./StudyMarkdown";
import { useTheme } from "./ThemeContext";
import { getTokens } from "./theme/tokens";

const MODES = [
    { id: "explain", label: "Explain", icon: <MenuBookRoundedIcon sx={{ fontSize: 13 }} />, hint: "Clear explanation with examples" },
    { id: "guide", label: "Guide me", icon: <PsychologyRoundedIcon sx={{ fontSize: 13 }} />, hint: "Socratic hints before the answer" },
    { id: "quiz", label: "Quiz me", icon: <QuizRoundedIcon sx={{ fontSize: 13 }} />, hint: "Practice questions + feedback" },
    { id: "simplify", label: "Simplify", icon: <ChildCareRoundedIcon sx={{ fontSize: 13 }} />, hint: "ELI5 version" },
];

const LEVELS = [
    { id: "beginner", label: "Beginner" },
    { id: "intermediate", label: "Intermediate" },
    { id: "advanced", label: "Advanced" },
];

const errText = (code) => {
    if (code === "RATE_LIMIT") return "You're asking a bit fast — wait a minute, then hit retry. Your chat is saved.";
    if (code === "EMPTY") return "Please type a question first.";
    if (code === "ABORTED") return "Stopped. Hit retry or ask something else.";
    return "The tutor hit a snag (network or server). Your chat is saved — hit retry.";
};

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

const AIChatbot = () => {
    const { darkMode } = useTheme();
    const t = getTokens(darkMode);
    const [open, setOpen] = useState(false);
    const [convoId, setConvoId] = useState(() => studyStore.newId());
    const [messages, setMessages] = useState([]);
    const [convos, setConvos] = useState(() => studyStore.list());
    const [mode, setMode] = useState("explain");
    const [level, setLevel] = useState("beginner");
    const [streaming, setStreaming] = useState(false);
    const [engine, setEngine] = useState(null);   // "llm" | "local" — from last reply
    const [followups, setFollowups] = useState([]);
    const [err, setErr] = useState("");
    const [renaming, setRenaming] = useState(null);
    const [renameText, setRenameText] = useState("");
    const [input, setInput] = useState("");
    const [title, setTitle] = useState("New chat");
    const [historyOpen, setHistoryOpen] = useState(false);

    const messagesEndRef = useRef(null);
    const abortRef = useRef(null);
    const persistRef = useRef({ id: convoId, title: "New chat" });
    const stateRef = useRef({ messages, mode, level });
    stateRef.current = { messages, mode, level };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, open]);

    // Persist the active conversation to localStorage and refresh the list.
    const persist = () => {
        const s = stateRef.current;
        if (persistRef.current.id && s.messages.length) {
            studyStore.save({
                id: persistRef.current.id,
                title: persistRef.current.title,
                mode: s.mode,
                level: s.level,
                messages: s.messages,
            });
            setConvos(studyStore.list());
        }
    };

    // Persist on unmount.
    useEffect(() => () => persist(), []);

    const sendMessage = (rawText, base = messages) => {
        const text = (rawText ?? input).trim();
        if (!text || streaming) return;
        setErr("");
        setFollowups([]);

        // Name the conversation from the first user message.
        if (!base.length) {
            const named = text.length > 40 ? text.slice(0, 40) + "..." : text;
            setTitle(named);
            persistRef.current.title = named;
        }

        const historyMsgs = [...base, { role: "user", text }];
        setMessages([...historyMsgs, { role: "ai", text: "", streaming: true }]);
        setInput("");
        setStreaming(true);

        const history = historyMsgs.map((m) => ({
            role: m.role === "ai" ? "assistant" : "user",
            content: m.text,
        }));

        const controller = new AbortController();
        abortRef.current = controller;

        let acc = "";
        studyAPI.streamChat(history, mode, level, (token, done, info) => {
            if (done) {
                setEngine(info?.engine || null);
                setFollowups(info?.followups || []);
            } else if (token) {
                acc += token;
                setMessages([...historyMsgs, { role: "ai", text: acc, streaming: true }]);
            }
        }, controller.signal)
            .catch((e) => {
                const code = e?.name === "AbortError" ? "ABORTED" : e?.message;
                setErr(errText(code));
            })
            .finally(() => {
                const finalMsgs = [...historyMsgs, { role: "ai", text: acc, streaming: false }];
                setMessages(finalMsgs);
                setStreaming(false);
                abortRef.current = null;
                stateRef.current = { messages: finalMsgs, mode, level };
                persist();
            });
    };

    const stop = () => abortRef.current?.abort();

    const retry = () => {
        if (streaming) return;
        let idx = -1;
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === "user") { idx = i; break; }
        }
        if (idx === -1) return;
        sendMessage(messages[idx].text, messages.slice(0, idx));
    };

    const newChat = () => {
        if (streaming) abortRef.current?.abort();
        const id = studyStore.newId();
        setConvoId(id);
        persistRef.current = { id, title: "New chat" };
        setMessages([]);
        setTitle("New chat");
        setMode("explain");
        setLevel("beginner");
        setEngine(null);
        setFollowups([]);
        setErr("");
        setInput("");
        setStreaming(false);
        setHistoryOpen(false);
    };

    const openConvo = (id) => {
        const c = studyStore.get(id);
        if (!c) return;
        if (streaming) abortRef.current?.abort();
        setConvoId(id);
        persistRef.current = { id, title: c.title || "New chat" };
        setMessages(Array.isArray(c.messages) ? c.messages : []);
        setTitle(c.title || "New chat");
        setMode(c.mode || "explain");
        setLevel(c.level || "beginner");
        setEngine(null);
        setFollowups([]);
        setErr("");
        setStreaming(false);
        setHistoryOpen(false);
    };

    const deleteConvo = (id) => {
        studyStore.remove(id);
        setConvos(studyStore.list());
        if (id === convoId) {
            const nid = studyStore.newId();
            setConvoId(nid);
            persistRef.current = { id: nid, title: "New chat" };
            setMessages([]);
            setTitle("New chat");
            setFollowups([]);
            setErr("");
            setEngine(null);
        }
    };

    const startRename = (id, current) => {
        setRenaming(id);
        setRenameText(current || "");
    };

    const commitRename = () => {
        if (renaming && renameText.trim()) {
            const clean = renameText.trim().slice(0, 60);
            studyStore.rename(renaming, clean);
            setConvos(studyStore.list());
            if (renaming === convoId) {
                setTitle(clean);
                persistRef.current.title = clean;
            }
        }
        setRenaming(null);
        setRenameText("");
    };

    const copyMessage = async (i) => {
        const text = messages[i]?.text || "";
        try { await navigator.clipboard.writeText(text); } catch {
            const ta = document.createElement("textarea");
            ta.value = text; document.body.appendChild(ta); ta.select();
            try { document.execCommand("copy"); } catch { /* ignore */ }
            ta.remove();
        }
        setMessages((prev) => prev.map((m, j) => (j === i ? { ...m, copied: true } : m)));
        setTimeout(() => setMessages((prev) => prev.map((m, j) => (j === i ? { ...m, copied: false } : m))), 1500);
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
                slotProps={{ paper: { sx: { width: 400, maxWidth: "90vw",
                    background: t.glass.panel, backdropFilter: "blur(24px) saturate(1.3)", WebkitBackdropFilter: "blur(24px) saturate(1.3)",
                    borderLeft: `1px solid ${t.border.subtle}` } } }}
            >
                <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    {/* Header */}
                    <Box sx={{ p: 1.5, borderBottom: `1px solid ${t.border.subtle}`, display: "flex", alignItems: "center", gap: 1 }}>
                        <Tooltip title="Chat history">
                            <IconButton onClick={() => setHistoryOpen(true)} sx={{ color: t.text.secondary }}>
                                <HistoryRoundedIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                        </Tooltip>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: 0 }}>
                            <Box sx={{ width: 36, height: 36, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(155,109,255,0.2), rgba(79,142,247,0.2))", border: "1px solid rgba(155,109,255,0.3)", flexShrink: 0 }}>
                                <SmartToyRoundedIcon sx={{ fontSize: 20, color: "#9b6dff" }} />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography noWrap sx={{ fontSize: 14, fontWeight: 600, maxWidth: 190 }}>{title}</Typography>
                                <Typography sx={{ fontSize: 10, color: engine === "local" ? "#f7934c" : "#3ecf8e" }}>
                                    {engine === "llm" ? "Neural engine online" : engine === "local" ? "Local engine" : "Online"}
                                </Typography>
                            </Box>
                        </Box>
                        <Tooltip title="New chat">
                            <IconButton onClick={newChat} sx={{ color: t.text.secondary }}>
                                <AddRoundedIcon sx={{ fontSize: 22 }} />
                            </IconButton>
                        </Tooltip>
                        <IconButton onClick={() => setOpen(false)} sx={{ color: t.text.secondary }}>
                            <CloseRoundedIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Box>

                    {/* Messages */}
                    <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0 }}>
                        {messages.map((msg, i) => (
                            <Fade key={i} in timeout={250}>
                                <Box sx={{ display: "flex", gap: 1.5, flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                                    <Avatar sx={{ width: 30, height: 30, background: msg.role === "ai" ? "linear-gradient(135deg, #9b6dff, #4f8ef7)" : t.glass.chip, flexShrink: 0 }}>
                                        {msg.role === "ai" ? <SmartToyRoundedIcon sx={{ fontSize: 16 }} /> : <Typography sx={{ fontSize: 12 }}>U</Typography>}
                                    </Avatar>
                                    {msg.role === "ai" ? (
                                        <Box sx={{ flex: 1, minWidth: 0, p: 1.5, borderRadius: 4, bgcolor: t.glass.face, border: `1px solid ${t.border.subtle}`, borderTopLeftRadius: 2, maxWidth: "100%" }}>
                                            {msg.text ? <StudyMarkdown text={msg.text} t={t} /> : (
                                                <Typography sx={{ fontSize: 12, color: t.text.muted }}>Thinking…</Typography>
                                            )}
                                            {msg.text && !msg.streaming && (
                                                <Box sx={{ display: "flex", gap: 0.5, mt: 1 }}>
                                                    <Chip size="small" icon={msg.copied ? <CheckRoundedIcon sx={{ fontSize: 13 }} /> : <ContentCopyRoundedIcon sx={{ fontSize: 13 }} />} label={msg.copied ? "Copied" : "Copy"} onClick={() => copyMessage(i)} variant="outlined" sx={{ fontSize: 9, height: 22, color: t.text.muted, borderColor: t.border.subtle, "& .MuiChip-icon": { color: t.text.muted } }} />
                                                    {i === messages.length - 1 && (
                                                        <Chip size="small" icon={<RefreshRoundedIcon sx={{ fontSize: 13 }} />} label="Retry" onClick={retry} variant="outlined" sx={{ fontSize: 9, height: 22, color: t.text.muted, borderColor: t.border.subtle, "& .MuiChip-icon": { color: t.text.muted } }} />
                                                    )}
                                                    {engine && (
                                                        <Chip label={engine === "llm" ? "Neural" : "Local"} size="small" variant="outlined" sx={{ fontSize: 9, height: 22, color: engine === "llm" ? "#3ecf8e" : "#f7934c", borderColor: engine === "llm" ? "rgba(62,207,142,0.3)" : "rgba(247,147,76,0.25)" }} />
                                                    )}
                                                </Box>
                                            )}
                                        </Box>
                                    ) : (
                                        <Box sx={{ maxWidth: "65%", p: 1.5, borderRadius: "14px 4px 14px 14px", bgcolor: t.glass.face, border: `1px solid ${t.border.subtle}`, whiteSpace: "pre-wrap" }}>
                                            <Typography sx={{ fontSize: 12.5, color: t.text.primary, whiteSpace: "pre-wrap" }}>{msg.text}</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Fade>
                        ))}

                        {followups.length > 0 && !streaming && (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 0.5 }}>
                                {followups.map((f) => (
                                    <Chip key={f} label={f} size="small" onClick={() => sendMessage(f)} variant="outlined" sx={{ fontSize: 11, color: t.text.secondary, borderColor: t.border.subtle, background: t.glass.face, "&:hover": { borderColor: "#9b6dff", color: "#9b6dff" } }} />
                                ))}
                            </Box>
                        )}

                        {err && <Box sx={{ px: 2, py: 1, border: `1px solid ${t.border.subtle}`, borderRadius: 3, background: "rgba(247,147,76,0.06)", color: "#f7934c", fontSize: 11, mb: 1 }}>⚠️ {err}</Box>}
                        {!messages.length && (
                            <Box sx={{ textAlign: "center", mt: 2 }}>
                                <Typography sx={{ fontSize: 13, color: t.text.secondary, fontWeight: 600 }}>Ask me anything</Typography>
                                <Typography sx={{ fontSize: 11, color: t.text.muted, mt: 0.5, mb: 2 }}>
                                    {mode === "quiz" ? "I'll create practice questions first, then check your answers." : "I'll explain it clearly at your level."}
                                </Typography>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                    {QUICK_PROMPTS.map((q) => (
                                        <Button key={q.text} onClick={() => sendMessage(q.text)} variant="outlined" startIcon={q.icon}
                                            sx={{ justifyContent: "flex-start", textTransform: "none", fontSize: 12, color: t.text.secondary, borderColor: t.border.subtle, borderRadius: 3, px: 1.5, py: 0.75, background: t.glass.face, "&:hover": { borderColor: q.color, color: q.color, background: "rgba(155,109,255,0.06)" } }}
                                        >{q.text}</Button>
                                    ))}
                                </Box>
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Composer */}
                    <Box sx={{ borderTop: `1px solid ${t.border.subtle}`, p: 1.5, background: t.glass.panel }}>
                        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                            <FormControl size="small" sx={{ flex: 1 }}>
                                <Select value={mode} onChange={(e) => setMode(e.target.value)} disabled={streaming}
                                    renderValue={(v) => { const m = MODES.find((x) => x.id === v); return (<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>{m?.icon}<span>{m?.label}</span></Box>); }}
                                    sx={{ fontSize: 11, height: 30, color: t.text.secondary, background: t.glass.face, "& .MuiOutlinedInput-notchedOutline": { borderColor: t.border.subtle }, "& .MuiSvgIcon-root": { color: t.text.muted } }}
                                >
                                    {MODES.map((m) => (
                                        <MenuItem key={m.id} value={m.id} sx={{ fontSize: 12 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                {m.icon}
                                                <Box>
                                                    <Typography sx={{ fontSize: 12 }}>{m.label}</Typography>
                                                    <Typography sx={{ fontSize: 10, color: t.text.muted }}>{m.hint}</Typography>
                                                </Box>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ width: 120 }}>
                                <Select value={level} onChange={(e) => setLevel(e.target.value)} disabled={streaming}
                                    sx={{ fontSize: 11, height: 30, color: t.text.secondary, background: t.glass.face, "& .MuiOutlinedInput-notchedOutline": { borderColor: t.border.subtle }, "& .MuiSvgIcon-root": { color: t.text.muted } }}
                                >
                                    {LEVELS.map((l) => (<MenuItem key={l.id} value={l.id} sx={{ fontSize: 12 }}>{l.label}</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                            <TextField fullWidth multiline maxRows={4} placeholder="Ask your AI Career Mentor…" value={input} onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                sx={{ "& .MuiOutlinedInput-root": { fontSize: 12.5, color: t.text.primary, background: t.glass.face, borderRadius: 3, "& fieldset": { borderColor: t.border.subtle }, "&:hover fieldset": { borderColor: "rgba(155,109,255,0.4)" }, "&.Mui-focused fieldset": { borderColor: "#9b6dff" } } }}
                            />
                            {streaming ? (
                                <IconButton onClick={stop} sx={{ background: "rgba(247,147,76,0.15)", color: "#f7934c", "&:hover": { background: "rgba(247,147,76,0.25)" } }}>
                                    <StopRoundedIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                            ) : (
                                <IconButton onClick={() => sendMessage()} disabled={!input.trim()}
                                    sx={{ background: input.trim() ? "linear-gradient(135deg, #9b6dff, #4f8ef7)" : t.glass.chip, color: input.trim() ? "#fff" : t.text.muted, "&:hover": { background: input.trim() ? "linear-gradient(135deg, #b08aff, #6ba3ff)" : t.glass.chip }, "&.Mui-disabled": { background: t.glass.chip, color: t.text.muted } }}
                                >
                                    <SendRoundedIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Drawer>

            {/* History Drawer */}
            <Drawer anchor="left" open={historyOpen} onClose={() => setHistoryOpen(false)}
                slotProps={{ paper: { sx: { width: 300, maxWidth: "85vw", background: t.glass.panel, backdropFilter: "blur(24px) saturate(1.3)", WebkitBackdropFilter: "blur(24px) saturate(1.3)", borderRight: `1px solid ${t.border.subtle}` } } }}
            >
                <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${t.border.subtle}` }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Your chats</Typography>
                    <IconButton onClick={() => setHistoryOpen(false)} sx={{ color: t.text.secondary }}>
                        <CloseRoundedIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </Box>
                <Box sx={{ p: 1.5 }}>
                    <Button fullWidth variant="outlined" startIcon={<AddRoundedIcon />} onClick={newChat}
                        sx={{ justifyContent: "flex-start", textTransform: "none", fontSize: 12, color: "#9b6dff", borderColor: "rgba(155,109,255,0.4)", "&:hover": { borderColor: "#9b6dff", background: "rgba(155,109,255,0.06)" } }}
                    >New chat</Button>
                </Box>
                <Divider sx={{ borderColor: t.border.subtle }} />
                <List sx={{ flex: 1, overflowY: "auto", p: 1 }}>
                    {convos.length === 0 && (
                        <Typography sx={{ fontSize: 12, color: t.text.muted, textAlign: "center", mt: 4, px: 2 }}>
                            No saved chats yet. Start a conversation and it'll show up here.
                        </Typography>
                    )}
                    {convos.map((c) => (
                        <ListItemButton key={c.id} onClick={() => openConvo(c.id)}
                            sx={{ borderRadius: 2, mb: 0.5, background: c.id === convoId ? "rgba(155,109,255,0.1)" : "transparent", "&:hover": { background: "rgba(155,109,255,0.08)" } }}
                        >
                            <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 16, mr: 1.5, color: c.id === convoId ? "#9b6dff" : t.text.muted }} />
                            {renaming === c.id ? (
                                <TextField autoFocus fullWidth size="small" value={renameText} onChange={(e) => setRenameText(e.target.value)} onClick={(e) => e.stopPropagation()} onBlur={commitRename}
                                    onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") { setRenaming(null); setRenameText(""); } }}
                                    sx={{ "& .MuiInputBase-input": { fontSize: 12, color: t.text.primary } }}
                                />
                            ) : (
                                <>
                                    <ListItemText primary={c.title || "New chat"} secondary={new Date(c.updatedAt || Date.now()).toLocaleDateString()}
                                        primaryTypographyProps={{ noWrap: true, sx: { fontSize: 12.5, color: t.text.primary } }}
                                        secondaryTypographyProps={{ sx: { fontSize: 10, color: t.text.muted } }}
                                    />
                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); startRename(c.id, c.title); }} sx={{ color: t.text.muted }}>
                                        <EditRoundedIcon sx={{ fontSize: 15 }} />
                                    </IconButton>
                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); deleteConvo(c.id); }} sx={{ color: t.text.muted, "&:hover": { color: "#f76060" } }}>
                                        <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </>
                            )}
                        </ListItemButton>
                    ))}
                </List>
            </Drawer>
        </>
    );
};

export default AIChatbot;
