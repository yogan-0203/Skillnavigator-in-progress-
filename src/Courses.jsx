import { useState, useEffect } from "react";
import {
    Box, Typography, Chip, Button, CircularProgress, LinearProgress,
    Dialog, DialogContent, DialogTitle, IconButton, Alert, Radio, RadioGroup,
    FormControlLabel, FormControl,
} from "@mui/material";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { coursesAPI, assessmentAPI } from "./api";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { getTokens, ACCENTS } from "./theme/tokens";
import { ClayCard, GlassPanel, ClayButton, PageHeader, StatTile, SegmentTabs, EmptyState, LoadingState, ChartTooltip } from "./theme/Clay";


const LEVEL_COLOR = {
    Beginner:     { color:"#3ecf8e", bg:"rgba(62,207,142,0.12)", border:"rgba(62,207,142,0.25)" },
    Intermediate: { color:"#4f8ef7", bg:"rgba(79,142,247,0.12)", border:"rgba(79,142,247,0.25)" },
    Advanced:     { color:"#f7934c", bg:"rgba(247,147,76,0.12)", border:"rgba(247,147,76,0.25)" },
};

const Courses = () => {
    const { darkMode } = useTheme();
    const t = getTokens(darkMode);
    const tx = t.text;
    const card = { border: `1px solid ${t.border.subtle}`, borderRadius: "20px", background: t.glass.face };
    const { user, refreshUser } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(null);
    const [filter, setFilter] = useState("All");

    // Assessment modal
    const [testModal, setTestModal] = useState({ open:false, course:null });
    const [assessment, setAssessment] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [generatingTest, setGeneratingTest] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await coursesAPI.getAll();
                setCourses(data.courses || []);
            } catch {
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const handleEnroll = async (courseId) => {
        setEnrolling(courseId);
        try {
            await coursesAPI.enroll(courseId);
            const { data } = await coursesAPI.getAll();
            setCourses(data.courses || []);
            await refreshUser();
        } catch (err) {
            alert(err.response?.data?.message || "Enrollment failed");
        } finally {
            setEnrolling(null);
        }
    };

    const openTest = async (course) => {
        setTestModal({ open:true, course });
        setResult(null);
        setAnswers({});
        setAssessment(null);
        setGeneratingTest(true);
        try {
            // Pick the first skill topic of the course to test on
            const topic = course.skillsGained?.[0]?.skill || course.title.split(" ")[0];
            const topics = ["Python","Machine Learning","Deep Learning","SQL","Statistics","NLP"];
            const testTopic = topics.find(t => course.title.includes(t.split(" ")[0])) || "Python";
            const { data } = await assessmentAPI.generate(testTopic, 5);
            setAssessment(data);
        } catch {
            alert("Could not generate test. Please try again.");
            setTestModal({ open:false, course:null });
        } finally {
            setGeneratingTest(false);
        }
    };

    const handleSubmitTest = async () => {
        if (!assessment) return;
        const answersArr = assessment.questions.map((_, i) => answers[i] ?? -1);
        setSubmitting(true);
        try {
            const { data } = await assessmentAPI.submit(assessment.assessmentId, answersArr);
            setResult(data);
            await refreshUser();
        } catch {
            alert("Could not submit test.");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredCourses = filter === "All"
        ? courses
        : courses.filter((c) => c.level === filter);

    if (loading) return (
        <Box sx={{ display:"flex", alignItems:"center", justifyContent:"center", height:"80vh" }}>
            <CircularProgress sx={{ color: t.text.secondary }} />
        </Box>
    );

    const enrolledIds = new Set(user?.enrolledCourses?.map(ec => ec.courseId?.toString()));

    return (
        <Box className="stagger" sx={{ width: "100%", minHeight: "100%", color: t.text.primary, pb:6, animation:"fadeIn 0.4s ease" }}>

            {/* Header */}
            <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", mb:4 }}>
                <Box>
                    <Typography sx={{ fontSize:10, letterSpacing:2.5, color: t.text.muted, mb:1 }}>
                        LEARNING RESOURCES
                    </Typography>
                    <Typography sx={{ fontSize:32, fontWeight:800,
                        background: t.dark ? "linear-gradient(135deg, #fff, rgba(79,142,247,0.8))" : `linear-gradient(135deg, ${t.text.primary}, #4f8ef7)`,
                        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                        Courses
                    </Typography>
                    <Typography sx={{ fontSize:13, color: t.text.muted, mt:1 }}>
                        Enrol in courses, check prerequisites, and take AI skill tests.
                    </Typography>
                </Box>
                <Chip icon={<SchoolRoundedIcon />} label={`${courses.length} Courses`}
                    sx={{ color:"#4f8ef7", backgroundColor:"rgba(79,142,247,0.1)",
                        border:"1px solid rgba(79,142,247,0.2)",
                        "& .MuiChip-icon": { color:"#4f8ef7" } }} />
            </Box>

            {/* Level filter */}
            <Box sx={{ display:"flex", gap:1, mb:3 }}>
                {["All","Beginner","Intermediate","Advanced"].map((lvl) => {
                    const cfg = LEVEL_COLOR[lvl] || { color: t.text.secondary, bg: t.glass.chip, border: t.border.medium };
                    return (
                        <Button key={lvl} size="small" onClick={() => setFilter(lvl)}
                            sx={{
                                textTransform:"none", fontSize:12, borderRadius:"10px", px:2.5,
                                backgroundColor: filter === lvl ? cfg.bg : "transparent",
                                color: filter === lvl ? cfg.color : t.text.secondary,
                                border: filter === lvl ? `1px solid ${cfg.border}` : `1px solid ${t.border.subtle}`,
                                "&:hover": { backgroundColor: cfg.bg },
                            }}>
                            {lvl}
                        </Button>
                    );
                })}
            </Box>

            {/* Course cards */}
            <Box sx={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:2 }}>
                {filteredCourses.map((course) => {
                    const lvlCfg = LEVEL_COLOR[course.level] || LEVEL_COLOR.Beginner;
                    const isEnrolled = enrolledIds.has(course._id);
                    const enrolledData = user?.enrolledCourses?.find(ec => ec.courseId?.toString() === course._id);

                    return (
                        <Box key={course._id}
                            sx={{
                                ...card, p:3,
                                opacity: !course.prerequisitesMet && !isEnrolled ? 0.75 : 1,
                                transition:"all 0.2s ease",
                                "&:hover": { borderColor: `${t.border.subtle}`, transform:"translateY(-2px)" },
                            }}>
                            {/* Header row */}
                            <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", mb:2 }}>
                                <Box sx={{ flex:1, pr:1 }}>
                                    <Typography sx={{ fontSize:15, fontWeight:700, lineHeight:1.4 }}>
                                        {course.title}
                                    </Typography>
                                    <Typography sx={{ fontSize:11, color: t.text.muted, mt:0.5 }}>
                                        {course.domain} • {course.duration}
                                    </Typography>
                                </Box>
                                <Chip label={course.level} size="small"
                                    sx={{ fontSize:10, color:lvlCfg.color, backgroundColor:lvlCfg.bg,
                                        border:`1px solid ${lvlCfg.border}`, flexShrink:0 }} />
                            </Box>

                            {/* Description */}
                            <Typography sx={{ fontSize:12, color: t.text.secondary, lineHeight:1.6, mb:2 }}>
                                {course.description?.slice(0, 100)}...
                            </Typography>

                            {/* Rating */}
                            <Box sx={{ display:"flex", alignItems:"center", gap:0.5, mb:2 }}>
                                <StarRoundedIcon sx={{ fontSize:13, color:"#f7934c" }} />
                                <Typography sx={{ fontSize:11, color: t.text.secondary }}>
                                    {course.rating} • {course.xpReward} XP reward
                                </Typography>
                            </Box>

                            {/* Prerequisites */}
                            {course.prerequisites?.length > 0 && (
                                <Box sx={{ mb:2 }}>
                                    <Typography sx={{ fontSize:10, color: t.text.muted, mb:1, letterSpacing:1 }}>
                                        PREREQUISITES
                                    </Typography>
                                    <Box sx={{ display:"flex", flexWrap:"wrap", gap:0.7 }}>
                                        {course.prerequisiteDetails?.map((p) => (
                                            <Chip key={p.skill} size="small"
                                                icon={p.met
                                                    ? <CheckCircleRoundedIcon style={{ fontSize:12, color:"#3ecf8e" }} />
                                                    : <LockRoundedIcon style={{ fontSize:12, color:"#f76060" }} />
                                                }
                                                label={`${p.skill} ≥${p.required}%`}
                                                sx={{
                                                    fontSize:10, height:22,
                                                    color: p.met ? "#3ecf8e" : "#f76060",
                                                    backgroundColor: p.met ? "rgba(62,207,142,0.08)" : "rgba(247,96,96,0.08)",
                                                    border: `1px solid ${p.met ? "rgba(62,207,142,0.2)" : "rgba(247,96,96,0.2)"}`,
                                                    "& .MuiChip-icon": { ml:"6px" },
                                                }} />
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* Progress if enrolled */}
                            {isEnrolled && enrolledData && (
                                <Box sx={{ mb:2 }}>
                                    <Box sx={{ display:"flex", justifyContent:"space-between", mb:0.6 }}>
                                        <Typography sx={{ fontSize:10, color: t.text.secondary }}>Progress</Typography>
                                        <Typography sx={{ fontSize:10, fontWeight:600, color:"#4f8ef7" }}>
                                            {enrolledData.progress || 0}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress variant="determinate" value={enrolledData.progress || 0}
                                        sx={{ height:4, borderRadius:10,
                                            backgroundColor: `${t.glass.inset}`,
                                            "& .MuiLinearProgress-bar": { background:"linear-gradient(90deg,#4f8ef7,#9b6dff)", borderRadius:10 } }} />
                                </Box>
                            )}

                            {/* Actions */}
                            <Box sx={{ display:"flex", gap:1, mt:"auto" }}>
                                {isEnrolled ? (
                                    <Button size="small" startIcon={<CheckCircleRoundedIcon />}
                                        sx={{ flex:1, color:"#3ecf8e", borderColor:"rgba(62,207,142,0.3)",
                                            border:"1px solid", borderRadius:"10px", textTransform:"none", fontSize:11,
                                            "&:hover": { backgroundColor:"rgba(62,207,142,0.07)" } }}>
                                        Enrolled
                                    </Button>
                                ) : (
                                    <Button size="small" variant="outlined"
                                        disabled={!course.prerequisitesMet || enrolling === course._id}
                                        onClick={() => handleEnroll(course._id)}
                                        sx={{ flex:1, color:"#4f8ef7", borderColor:"rgba(79,142,247,0.3)",
                                            borderRadius:"10px", textTransform:"none", fontSize:11,
                                            "&:hover": { borderColor:"#4f8ef7", backgroundColor:"rgba(79,142,247,0.07)" },
                                            "&:disabled": { opacity:0.45 } }}>
                                        {enrolling === course._id ? <CircularProgress size={14} sx={{ color:"#4f8ef7" }} />
                                            : !course.prerequisitesMet ? "Prerequisites Not Met"
                                            : "Enroll"}
                                    </Button>
                                )}

                                <Button size="small"
                                    startIcon={<PsychologyRoundedIcon />}
                                    onClick={() => openTest(course)}
                                    sx={{ color:"#9b6dff", borderColor:"rgba(155,109,255,0.3)",
                                        border:"1px solid", borderRadius:"10px", textTransform:"none", fontSize:11, px:1.5,
                                        "&:hover": { backgroundColor:"rgba(155,109,255,0.07)" } }}>
                                    Test
                                </Button>
                            </Box>
                        </Box>
                    );
                })}
            </Box>

            {/* ── Assessment Modal ─────────────────────────────────── */}
            <Dialog open={testModal.open}
                onClose={() => { setTestModal({open:false, course:null}); setResult(null); }}
                maxWidth="sm" fullWidth
                slotProps={{ paper: { sx: {
                    backgroundColor: t.glass.panel,
                    border:"1px solid rgba(155,109,255,0.2)",
                    borderRadius:"20px",
                    maxHeight:"90vh",
                }}}}>
                <DialogTitle sx={{ color: t.text.primary, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <Box sx={{ display:"flex", alignItems:"center", gap:1.5 }}>
                        <AutoAwesomeRoundedIcon sx={{ color:"#9b6dff" }} />
                        <Box>
                            <Typography sx={{ fontSize:17, fontWeight:700 }}>AI Skill Test</Typography>
                            <Typography sx={{ fontSize:11, color: t.text.muted }}>
                                {testModal.course?.title}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={() => { setTestModal({open:false, course:null}); setResult(null); }}
                        sx={{ color: t.text.secondary, "&:hover": { color: t.text.primary } }}>
                        <CloseRoundedIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ overflowY:"auto" }}>
                    {generatingTest && (
                        <Box sx={{ textAlign:"center", py:5 }}>
                            <CircularProgress sx={{ color:"#9b6dff" }} />
                            <Typography sx={{ color: t.text.secondary, mt:2, fontSize:13 }}>
                                Generating AI test...
                            </Typography>
                        </Box>
                    )}

                    {!generatingTest && !result && assessment && (
                        <Box>
                            <Typography sx={{ fontSize:12, color: t.text.secondary, mb:3, pb:2,
                                borderBottom: `1px solid ${t.border.subtle}` }}>
                                Answer all {assessment.totalQuestions} questions to analyse your skill level.
                            </Typography>

                            {assessment.questions.map((q, qi) => (
                                <Box key={qi} sx={{ mb:3 }}>
                                    <Typography sx={{ fontSize:13, fontWeight:600, mb:2, lineHeight:1.5 }}>
                                        {qi + 1}. {q.question}
                                    </Typography>
                                    <FormControl fullWidth>
                                        <RadioGroup value={answers[qi] ?? ""} onChange={(e) =>
                                            setAnswers(p => ({ ...p, [qi]: parseInt(e.target.value) }))}>
                                            {q.options.map((opt, oi) => (
                                                <FormControlLabel key={oi} value={oi} control={
                                                    <Radio size="small" sx={{
                                                        color: t.text.secondary,
                                                        "&.Mui-checked": { color:"#9b6dff" },
                                                    }} />
                                                }
                                                label={<Typography sx={{ fontSize:12, color: t.text.secondary }}>
                                                    {opt}
                                                </Typography>}
                                                sx={{ mb:0.5, mx:0, alignItems:"center",
                                                    borderRadius:"10px", px:1,
                                                    backgroundColor: answers[qi] === oi ? "rgba(155,109,255,0.08)" : "transparent",
                                                    border: answers[qi] === oi ? "1px solid rgba(155,109,255,0.2)" : "1px solid transparent",
                                                }} />
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                </Box>
                            ))}

                            <Button fullWidth variant="contained" disabled={submitting}
                                onClick={handleSubmitTest}
                                sx={{ mt:1, height:48, borderRadius:"13px",
                                    background:"linear-gradient(135deg,#9b6dff,#4f8ef7)",
                                    color: "#fff", fontWeight:700, textTransform:"none", fontSize:14,
                                    "&:disabled": { opacity:0.5 } }}>
                                {submitting ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Submit Test"}
                            </Button>
                        </Box>
                    )}

                    {result && (
                        <Box>
                            {/* Score summary */}
                            <Box sx={{ textAlign:"center", py:3,
                                borderBottom: `1px solid ${t.border.subtle}`, mb:3 }}>
                                <Typography sx={{ fontSize:52, fontWeight:800,
                                    color: result.result.percentage >= 80 ? "#3ecf8e"
                                        : result.result.percentage >= 50 ? "#4f8ef7" : "#f76060" }}>
                                    {result.result.percentage}%
                                </Typography>
                                <Typography sx={{ fontSize:14, color: t.text.secondary, mt:1 }}>
                                    {result.result.score}/{result.result.total} correct
                                </Typography>
                                <Chip label={`+${result.result.xpEarned} XP Earned`}
                                    sx={{ mt:1.5, color:"#f7934c", backgroundColor:"rgba(247,147,76,0.1)",
                                        border:"1px solid rgba(247,147,76,0.25)" }} />
                                {result.skillUpdate && (
                                    <Box sx={{ mt:2, p:2, borderRadius:"12px",
                                        border:"1px solid rgba(62,207,142,0.2)", backgroundColor:"rgba(62,207,142,0.06)" }}>
                                        <Typography sx={{ fontSize:12, color:"#3ecf8e" }}>
                                            {result.skillUpdate.skill}: {result.skillUpdate.before}% → {result.skillUpdate.after}%
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* Per-question results */}
                            {result.detailedResults.map((r, i) => (
                                <Box key={i} sx={{ mb:2.5, p:2, borderRadius:"14px",
                                    border:`1px solid ${r.isCorrect ? "rgba(62,207,142,0.2)" : "rgba(247,96,96,0.2)"}`,
                                    backgroundColor: r.isCorrect ? "rgba(62,207,142,0.05)" : "rgba(247,96,96,0.05)" }}>
                                    <Box sx={{ display:"flex", alignItems:"flex-start", gap:1.5 }}>
                                        {r.isCorrect
                                            ? <CheckCircleRoundedIcon sx={{ color:"#3ecf8e", fontSize:18, mt:0.3, flexShrink:0 }} />
                                            : <CloseRoundedIcon sx={{ color:"#f76060", fontSize:18, mt:0.3, flexShrink:0 }} />
                                        }
                                        <Box>
                                            <Typography sx={{ fontSize:12, fontWeight:600, mb:0.5 }}>
                                                {i+1}. {r.question}
                                            </Typography>
                                            {!r.isCorrect && (
                                                <Typography sx={{ fontSize:11, color:"#3ecf8e", mb:0.5 }}>
                                                    Correct: {r.options[r.correctAnswer]}
                                                </Typography>
                                            )}
                                            <Typography sx={{ fontSize:11, color: t.text.muted }}>
                                                {r.explanation}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            ))}

                            <Button fullWidth onClick={() => setTestModal({open:false, course:null})}
                                sx={{ mt:1, height:46, borderRadius:"13px",
                                    border: `1px solid ${t.border.subtle}`, color: t.text.primary,
                                    textTransform:"none", "&:hover": { backgroundColor: `${t.glass.inset}` } }}>
                                Close
                            </Button>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default Courses;
