import { useState, useEffect, useRef, useCallback } from "react";
import {
    Box, Typography, Button, Chip, CircularProgress, LinearProgress,
    Fade,
} from "@mui/material";

import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import WhatshotRoundedIcon from "@mui/icons-material/WhatshotRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useNavigate } from "react-router-dom";
import { practiceAPI } from "./api";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { getTokens, ACCENTS } from "./theme/tokens";
import { ClayCard, GlassPanel, ClayButton, PageHeader, StatTile, SegmentTabs, EmptyState, LoadingState, ChartTooltip } from "./theme/Clay";


const DIFFICULTY = {
    easy:   { color: "#3ecf8e", bg: "rgba(62,207,142,0.12)",  border: "rgba(62,207,142,0.28)" },
    medium: { color: "#f7934c", bg: "rgba(247,147,76,0.12)",  border: "rgba(247,147,76,0.28)" },
    hard:   { color: "#f76060", bg: "rgba(247,96,96,0.12)",   border: "rgba(247,96,96,0.28)" },
};

const Practice = () => {
    const { darkMode } = useTheme();
    const t = getTokens(darkMode);
    const tx = t.text;
    const card = { border: `1px solid ${t.border.subtle}`, borderRadius: "20px", background: t.glass.face };
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();

    // phase: idle → quiz → submitted
    const [phase, setPhase] = useState("idle");
    const [session, setSession] = useState(null);
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [index, setIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [picked, setPicked] = useState(null);
    const startTimeRef = useRef(Date.now());
    const [result, setResult] = useState(null);

    const loadSchedule = useCallback(async () => {
        try {
            const { data } = await practiceAPI.schedule();
            setSchedule(data);
        } catch {
            setSchedule(null);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            try { await loadSchedule(); } finally { setLoading(false); }
        };
        init();
    }, [loadSchedule]);

    const startSession = async () => {
        setStarting(true);
        setError("");
        try {
            const { data } = await practiceAPI.session();
            setSession(data);
            setAnswers([]);
            setIndex(0);
            setPicked(null);
            setResult(null);
            startTimeRef.current = Date.now();
            setPhase("quiz");
        } catch (err) {
            setError(err.response?.data?.detail || "Could not start a practice session.");
        } finally {
            setStarting(false);
        }
    };

    const pickOption = (optIdx) => {
        if (picked !== null) return;         // lock once chosen
        setPicked(optIdx);
        setAnswers((prev) => {
            const next = [...prev];
            next[index] = optIdx;
            return next;
        });
    };

    const nextQuestion = () => {
        setPicked(null);
        if (index + 1 < session.questions.length) {
            setIndex(index + 1);
        } else {
            finishSession();
        }
    };

    const finishSession = async () => {
        setSubmitting(true);
        setError("");
        const minutes = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 60000));
        try {
            const { data } = await practiceAPI.submit(
                session.sessionId,
                answers,
                minutes
            );
            setResult(data);
            setPhase("submitted");
            await Promise.all([loadSchedule(), refreshUser()]);
        } catch (err) {
            setError(err.response?.data?.detail || "Could not submit your session.");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Loading ─────────────────────────────────────────────────────────
    if (loading) return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
            <CircularProgress sx={{ color: t.text.secondary }} />
        </Box>
    );

    // ── Header (shared) ─────────────────────────────────────────────────
    const header = (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4 }}>
            <Box>
                <Typography sx={{ fontSize: 10, letterSpacing: 2.5, color: t.text.muted, mb: 1 }}>
                    ADAPTIVE SPACED REPETITION
                </Typography>
                <Typography sx={{ fontSize: 32, fontWeight: 800,
                    background: t.dark ? "linear-gradient(135deg, #fff, rgba(155,109,255,0.85))" : `linear-gradient(135deg, ${t.text.primary}, #9b6dff)`,
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Practice
                </Typography>
                <Typography sx={{ fontSize: 13, color: t.text.muted, mt: 1 }}>
                    A short daily session that targets your weakest skills — and brings them back right before you'd forget them.
                </Typography>
            </Box>
            <Chip
                icon={<WhatshotRoundedIcon />}
                label={`Streak ${user?.streak || 0}`}
                sx={{ height: 30, color: "#f7934c", backgroundColor: "rgba(247,147,76,0.12)",
                    border: "1px solid rgba(247,147,76,0.28)", fontSize: 12, fontWeight: 600 }}
            />
        </Box>
    );

    // ── Idle / intro ────────────────────────────────────────────────────
    if (phase === "idle") {
        const queue = schedule?.queue || [];
        const untested = schedule?.untestedSkills || [];
        return (
            <Box className="stagger" sx={{ width: "100%", minHeight: "100%", color: t.text.primary, pb: 6, animation: "fadeIn 0.4s ease" }}>
                {header}

                {error && (
                    <Typography sx={{ mb: 2, color: "#f76060", fontSize: 13 }}>{error}</Typography>
                )}

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
                    {/* Start card */}
                    <Box sx={{ ...card, p: 4, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <Box>
                            <Box sx={{ width: 56, height: 56, borderRadius: "16px", display: "flex",
                                alignItems: "center", justifyContent: "center", mb: 2,
                                background: "linear-gradient(135deg, rgba(155,109,255,0.22), rgba(79,142,247,0.22))",
                                border: "1px solid rgba(155,109,255,0.32)" }}>
                                <PsychologyRoundedIcon sx={{ fontSize: 28, color: "#9b6dff" }} />
                            </Box>
                            <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 1 }}>
                                Today's adaptive session
                            </Typography>
                            <Typography sx={{ fontSize: 13, color: t.text.secondary, lineHeight: 1.6 }}>
                                We pick the skills where an hour of practice moves you the most toward your goal —
                                weighted by weakness, career importance and what's due for review.
                            </Typography>

                            <Box sx={{ display: "flex", gap: 1.5, mt: 3, flexWrap: "wrap" }}>
                                <Chip icon={<BoltRoundedIcon />} label="~9 questions"
                                    sx={{ color: "#4f8ef7", backgroundColor: "rgba(79,142,247,0.12)",
                                        border: "1px solid rgba(79,142,247,0.28)", fontSize: 11 }} />
                                <Chip icon={<ScheduleRoundedIcon />} label="~3 minutes"
                                    sx={{ color: "#3ecf8e", backgroundColor: "rgba(62,207,142,0.12)",
                                        border: "1px solid rgba(62,207,142,0.28)", fontSize: 11 }} />
                                {schedule && schedule.dueCount > 0 && (
                                    <Chip icon={<AutoAwesomeRoundedIcon />} label={`${schedule.dueCount} due for review`}
                                        sx={{ color: "#f7934c", backgroundColor: "rgba(247,147,76,0.12)",
                                            border: "1px solid rgba(247,147,76,0.28)", fontSize: 11 }} />
                                )}
                            </Box>
                        </Box>

                        <Button
                            onClick={startSession}
                            disabled={starting}
                            startIcon={starting ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <PlayArrowRoundedIcon />}
                            sx={{ mt: 4, height: 52, borderRadius: "14px",
                                background: "linear-gradient(135deg, #9b6dff, #4f8ef7)",
                                color: "#fff", fontWeight: 700, fontSize: 15, textTransform: "none",
                                boxShadow: "0 8px 24px rgba(155,109,255,0.32)",
                                "&:hover": { background: "linear-gradient(135deg, #b08aff, #6ba3ff)" },
                                "&.Mui-disabled": { opacity: 0.6 } }}>
                            {starting ? "Building your session…" : "Start practice session"}
                        </Button>
                    </Box>

                    {/* Review queue card */}
                    <Box sx={{ ...card, p: 4 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                            <Box sx={{ width: 40, height: 40, borderRadius: "12px", display: "flex",
                                alignItems: "center", justifyContent: "center",
                                background: "rgba(247,147,76,0.12)", border: "1px solid rgba(247,147,76,0.28)" }}>
                                <ScheduleRoundedIcon sx={{ fontSize: 20, color: "#f7934c" }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Your review queue</Typography>
                                <Typography sx={{ fontSize: 11, color: t.text.muted }}>
                                    {schedule
                                        ? `${schedule.dueCount} of ${schedule.totalScheduled} skills due now`
                                        : "No reviews scheduled yet"}
                                </Typography>
                            </Box>
                        </Box>

                        {queue.length === 0 && (
                            <Typography sx={{ fontSize: 13, color: t.text.secondary, lineHeight: 1.7 }}>
                                Nothing scheduled yet. Complete your first practice session and we'll start
                                spacing your reviews — 1 day, then 3, then a week or more as each skill sticks.
                            </Typography>
                        )}

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
                            {queue.slice(0, 5).map((q) => (
                                <Box key={q.skill} sx={{ display: "flex", alignItems: "center", gap: 1.5,
                                    p: 1.5, borderRadius: "12px",
                                    background: q.due ? "rgba(247,147,76,0.07)" : (darkMode ? "rgba(255,255,255,0.03)" : "rgba(22,22,42,0.04)"),
                                    border: `1px solid ${q.due ? "rgba(247,147,76,0.22)" : t.border.subtle}` }}>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{q.skill}</Typography>
                                        <Typography sx={{ fontSize: 10, color: t.text.muted }}>
                                            {q.due ? "Due now" : `Next review ${q.dueDate}`}
                                            {" · "}{q.reps || 0} successful review{(q.reps || 0) === 1 ? "" : "s"}
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#4f8ef7" }}>
                                        {q.currentScore}%
                                    </Typography>
                                    <Chip label={q.due ? "DUE" : "OK"} size="small"
                                        sx={{ fontSize: 9, height: 20, fontWeight: 700,
                                            color: q.due ? "#f7934c" : "#3ecf8e",
                                            backgroundColor: q.due ? "rgba(247,147,76,0.14)" : "rgba(62,207,142,0.14)",
                                            border: `1px solid ${q.due ? "rgba(247,147,76,0.3)" : "rgba(62,207,142,0.3)"}` }} />
                                </Box>
                            ))}
                        </Box>

                        {untested.length > 0 && (
                            <Box sx={{ mt: 2.5, pt: 2, borderTop: `1px solid ${t.border.subtle}` }}>
                                <Typography sx={{ fontSize: 11, color: t.text.muted, mb: 1 }}>
                                    Not yet in your schedule
                                </Typography>
                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                    {untested.map((s) => (
                                        <Chip key={s} label={s} size="small"
                                            sx={{ fontSize: 10, height: 22, color: t.text.secondary,
                                                backgroundColor: `${t.glass.inset}`,
                                                border: `1px solid ${t.border.subtle}` }} />
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        );
    }

    // ── Quiz ────────────────────────────────────────────────────────────
    if (phase === "quiz" && session) {
        const questions = session.questions;
        const q = questions[index];
        const diff = DIFFICULTY[q.difficulty] || DIFFICULTY.medium;
        const progressPct = Math.round((index / questions.length) * 100);
        const isLast = index === questions.length - 1;
        const focusReason = session.skillFocus?.find((f) => f.skill === q.skill);

        return (
            <Box sx={{ width: "100%", minHeight: "100%", color: t.text.primary, pb: 6, animation: "fadeIn 0.3s ease" }}>
                {header}

                {error && (
                    <Typography sx={{ mb: 2, color: "#f76060", fontSize: 13 }}>{error}</Typography>
                )}

                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography sx={{ fontSize: 12, color: t.text.secondary }}>
                            Question {index + 1} of {questions.length}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: t.text.secondary }}>
                            {progressPct}% complete
                        </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={progressPct}
                        sx={{ height: 7, borderRadius: 10,
                            backgroundColor: `${t.glass.inset}`,
                            "& .MuiLinearProgress-bar": {
                                background: "linear-gradient(90deg, #9b6dff, #4f8ef7)",
                                borderRadius: 10 } }} />
                </Box>

                <Fade in key={index} timeout={250}>
                    <Box sx={{ ...card, p: { xs: 3, md: 5 } }}>
                        <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
                            <Chip label={q.skill} size="small"
                                sx={{ fontSize: 11, fontWeight: 600, color: "#4f8ef7",
                                    backgroundColor: "rgba(79,142,247,0.12)",
                                    border: "1px solid rgba(79,142,247,0.28)" }} />
                            <Chip label={q.difficulty} size="small"
                                sx={{ fontSize: 10, textTransform: "capitalize", color: diff.color,
                                    backgroundColor: diff.bg, border: `1px solid ${diff.border}` }} />
                            {focusReason && (
                                <Typography sx={{ fontSize: 11, color: t.text.muted }}>
                                    · {focusReason.reason}
                                </Typography>
                            )}
                        </Box>

                        <Typography sx={{ fontSize: { xs: 17, md: 20 }, fontWeight: 650, lineHeight: 1.5, mb: 3 }}>
                            {q.question}
                        </Typography>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            {q.options.map((opt, oi) => {
                                const chosen = answers[index] === oi;
                                const locked = picked !== null;
                                return (
                                    <Box key={oi} component="button"
                                        onClick={() => pickOption(oi)}
                                        disabled={locked}
                                        sx={{
                                            display: "flex", alignItems: "center", gap: 2,
                                            p: "14px 18px", borderRadius: "14px", textAlign: "left",
                                            fontFamily: "inherit", width: "100%",
                                            cursor: locked ? "default" : "pointer",
                                            fontSize: 14, lineHeight: 1.5,
                                            color: chosen ? "#fff" : t.text.primary,
                                            background: chosen
                                                ? "linear-gradient(135deg, rgba(155,109,255,0.22), rgba(79,142,247,0.18))"
                                                : (darkMode ? "rgba(255,255,255,0.035)" : "rgba(22,22,42,0.04)"),
                                            border: chosen
                                                ? "1px solid rgba(155,109,255,0.55)"
                                                : (darkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(22,22,42,0.1)"),
                                            transition: "all 0.18s ease",
                                            "&:hover": locked ? {} : {
                                                background: t.glass.inset,
                                                borderColor: "rgba(155,109,255,0.35)",
                                                transform: "translateX(4px)",
                                            },
                                        }}>
                                        <Box sx={{
                                            width: 26, height: 26, borderRadius: "8px", flexShrink: 0,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 12, fontWeight: 700,
                                            background: chosen ? "rgba(155,109,255,0.3)" : (darkMode ? "rgba(255,255,255,0.07)" : "rgba(22,22,42,0.05)"),
                                            border: `1px solid ${t.border.subtle}`,
                                        }}>
                                            {String.fromCharCode(65 + oi)}
                                        </Box>
                                        <Typography sx={{ fontSize: 14 }}>{opt}</Typography>
                                    </Box>
                                );
                            })}
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
                            <Button
                                onClick={nextQuestion}
                                disabled={picked === null || submitting}
                                endIcon={submitting
                                    ? <CircularProgress size={16} sx={{ color: "#fff" }} />
                                    : <ArrowForwardRoundedIcon />}
                                sx={{ px: 4, height: 48, borderRadius: "13px",
                                    background: "linear-gradient(135deg, #9b6dff, #4f8ef7)",
                                    color: "#fff", fontWeight: 700, fontSize: 14, textTransform: "none",
                                    "&:hover": { background: "linear-gradient(135deg, #b08aff, #6ba3ff)" },
                                    "&.Mui-disabled": { opacity: 0.4, background: t.glass.inset } }}>
                                {submitting ? "Scoring…" : isLast ? "Finish session" : "Next question"}
                            </Button>
                        </Box>
                    </Box>
                </Fade>
            </Box>
        );
    }

    // ── Results ─────────────────────────────────────────────────────────
    if (phase === "submitted" && result) {
        const { result: r, skillChanges = [], detailedResults = [] } = result;
        const verdict =
            r.percentage >= 80 ? { label: "Excellent recall", color: "#3ecf8e" } :
            r.percentage >= 50 ? { label: "Solid effort", color: "#f7934c" } :
                                 { label: "Keep going — this is how learning works", color: "#f76060" };

        return (
            <Box sx={{ width: "100%", minHeight: "100%", color: t.text.primary, pb: 6, animation: "fadeIn 0.4s ease" }}>
                {header}

                <Box sx={{ ...card, p: 4, mb: 3, textAlign: "center" }}>
                    <Typography sx={{ fontSize: 64, fontWeight: 800, lineHeight: 1,
                        background: t.dark ? "linear-gradient(135deg, #fff, #9b6dff)" : `linear-gradient(135deg, ${t.text.primary}, #9b6dff)`,
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        {r.percentage}%
                    </Typography>
                    <Typography sx={{ fontSize: 15, color: verdict.color, fontWeight: 600, mt: 1 }}>
                        {verdict.label}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: t.text.secondary, mt: 0.5 }}>
                        {r.score} of {r.total} correct
                    </Typography>

                    <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3, flexWrap: "wrap" }}>
                        <Chip icon={<BoltRoundedIcon />} label={`+${r.xpEarned} XP`}
                            sx={{ color: "#9b6dff", backgroundColor: "rgba(155,109,255,0.12)",
                                border: "1px solid rgba(155,109,255,0.3)", fontWeight: 700 }} />
                        <Chip label={`Level ${r.level}`}
                            sx={{ color: "#4f8ef7", backgroundColor: "rgba(79,142,247,0.12)",
                                border: "1px solid rgba(79,142,247,0.3)", fontWeight: 700 }} />
                        <Chip icon={<WhatshotRoundedIcon />} label={`Streak ${result.streak || 0}`}
                            sx={{ color: "#f7934c", backgroundColor: "rgba(247,147,76,0.12)",
                                border: "1px solid rgba(247,147,76,0.3)", fontWeight: 700 }} />
                    </Box>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
                    <Box sx={{ ...card, p: 4 }}>
                        <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 1 }}>What changed</Typography>
                        <Typography sx={{ fontSize: 12, color: t.text.muted, mb: 2.5 }}>
                            Scores update with a 75/25 weighting so one session never inflates a skill.
                        </Typography>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            {skillChanges.map((s) => (
                                <Box key={s.skill} sx={{ p: 2, borderRadius: "14px",
                                    background: `${t.glass.inset}`,
                                    border: `1px solid ${t.border.subtle}` }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Typography sx={{ fontSize: 14, fontWeight: 650 }}>{s.skill}</Typography>
                                        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                                            <span style={{ color: t.text.muted }}>{s.before}% → </span>
                                            <span style={{ color: s.after >= s.before ? "#3ecf8e" : "#f76060" }}>
                                                {s.after}%
                                            </span>
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1, flexWrap: "wrap", gap: 1 }}>
                                        <Typography sx={{ fontSize: 11, color: t.text.secondary }}>
                                            This session: {s.correct}/{s.total} ({s.sessionScore}%)
                                        </Typography>
                                        <Typography sx={{ fontSize: 11, color: "#f7934c" }}>
                                            Next review {s.nextReview} · every {s.intervalDays}d
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>

                        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                            <Button onClick={() => { setPhase("idle"); setSession(null); loadSchedule(); }}
                                startIcon={<RefreshRoundedIcon />}
                                sx={{ flex: 1, height: 46, borderRadius: "13px", textTransform: "none",
                                    fontWeight: 700, fontSize: 13, color: t.text.primary,
                                    border: `1px solid ${t.border.subtle}`,
                                    "&:hover": { background: `${t.glass.inset}`,
                                        borderColor: "rgba(155,109,255,0.4)" } }}>
                                Practice again
                            </Button>
                            <Button onClick={() => navigate("/progress")}
                                startIcon={<ArrowForwardRoundedIcon />}
                                sx={{ flex: 1, height: 46, borderRadius: "13px", textTransform: "none",
                                    fontWeight: 700, fontSize: 13, color: t.text.primary,
                                    background: "linear-gradient(135deg, #9b6dff, #4f8ef7)",
                                    "&:hover": { background: "linear-gradient(135deg, #b08aff, #6ba3ff)" } }}>
                                See progress
                            </Button>
                        </Box>
                    </Box>

                    {/* Answer review */}
                    <Box sx={{ ...card, p: 4 }}>
                        <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 1 }}>Answer review</Typography>
                        <Typography sx={{ fontSize: 12, color: t.text.muted, mb: 2.5 }}>
                            Read the explanations — that's where the actual learning happens.
                        </Typography>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2,
                            maxHeight: 460, overflowY: "auto", pr: 1,
                            "&::-webkit-scrollbar": { width: "4px" },
                            "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.12)", borderRadius: 10 } }}>
                            {detailedResults.map((d, i) => (
                                <Box key={i} sx={{ p: 2, borderRadius: "14px",
                                    background: d.isCorrect ? "rgba(62,207,142,0.05)" : "rgba(247,96,96,0.05)",
                                    border: `1px solid ${d.isCorrect ? "rgba(62,207,142,0.18)" : "rgba(247,96,96,0.2)"}` }}>
                                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", mb: 1 }}>
                                        {d.isCorrect
                                            ? <CheckCircleRoundedIcon sx={{ fontSize: 17, color: "#3ecf8e", mt: "1px" }} />
                                            : <CancelRoundedIcon sx={{ fontSize: 17, color: "#f76060", mt: "1px" }} />}
                                        <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.45 }}>
                                            {d.question}
                                        </Typography>
                                    </Box>

                                    {!d.isCorrect && (
                                        <Typography sx={{ fontSize: 12, color: t.text.secondary, mb: 0.5, ml: 3 }}>
                                            Your answer: {d.options[d.userAnswer] || "—"}
                                        </Typography>
                                    )}
                                    <Typography sx={{ fontSize: 12, color: "#3ecf8e", ml: 3, mb: 0.5 }}>
                                        Correct: {d.options[d.correctAnswer]}
                                    </Typography>
                                    {d.explanation && (
                                        <Typography sx={{ fontSize: 11.5, color: t.text.secondary,
                                            lineHeight: 1.6, ml: 3, mt: 1,
                                            pt: 1, borderTop: `1px solid ${t.border.subtle}` }}>
                                            {d.explanation}
                                        </Typography>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Box>
        );
    }

    return null;
};

export default Practice;





