import { useState, useEffect } from "react";
import { Box, Typography, Chip, CircularProgress, LinearProgress } from "@mui/material";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import WhatshotRoundedIcon from "@mui/icons-material/WhatshotRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { achievementsAPI } from "./api";
import { useAuth } from "./AuthContext";

const card = {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    background: "linear-gradient(145deg, rgba(255,255,255,0.045), rgba(255,255,255,0.012))",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.012), 0 20px 50px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.05)",
};

const RARITY_STYLE = {
    common:    { color:"rgba(255,255,255,0.55)", bg:"rgba(255,255,255,0.07)", border:"rgba(255,255,255,0.12)" },
    rare:      { color:"#4f8ef7",  bg:"rgba(79,142,247,0.12)", border:"rgba(79,142,247,0.25)" },
    epic:      { color:"#9b6dff",  bg:"rgba(155,109,255,0.12)", border:"rgba(155,109,255,0.25)" },
    legendary: { color:"#f7934c",  bg:"rgba(247,147,76,0.12)", border:"rgba(247,147,76,0.25)" },
};

const Achievement = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all | unlocked | locked

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data: d } = await achievementsAPI.get();
                setData(d);
            } catch {
                setData({ achievements: [], stats: { total:0, unlocked:0 } });
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) return (
        <Box sx={{ display:"flex", alignItems:"center", justifyContent:"center", height:"80vh" }}>
            <CircularProgress sx={{ color:"rgba(255,255,255,0.3)" }} />
        </Box>
    );

    const { achievements = [], stats = {} } = data || {};
    const filtered = achievements.filter((a) => {
        if (filter === "unlocked") return a.unlocked;
        if (filter === "locked") return !a.unlocked;
        return true;
    });

    const unlockedPct = stats.total > 0 ? Math.round((stats.unlocked / stats.total) * 100) : 0;

    return (
        <Box sx={{ width:"100%", minHeight:"100%", color:"#fff", pb:6, animation:"fadeIn 0.4s ease" }}>

            {/* Header */}
            <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", mb:4 }}>
                <Box>
                    <Typography sx={{ fontSize:10, letterSpacing:2.5, color:"rgba(255,255,255,0.28)", mb:1 }}>
                        MILESTONES & BADGES
                    </Typography>
                    <Typography sx={{ fontSize:32, fontWeight:800,
                        background:"linear-gradient(135deg, #fff, rgba(247,147,76,0.8))",
                        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                        Achievements
                    </Typography>
                    <Typography sx={{ fontSize:13, color:"rgba(255,255,255,0.35)", mt:1 }}>
                        Your milestones, badges and accomplishments on this journey.
                    </Typography>
                </Box>
                <Chip
                    icon={<EmojiEventsRoundedIcon />}
                    label={`${stats.unlocked || 0} / ${stats.total || 0} Earned`}
                    sx={{ color:"#f7934c", backgroundColor:"rgba(247,147,76,0.1)",
                        border:"1px solid rgba(247,147,76,0.2)", fontSize:12,
                        "& .MuiChip-icon": { color:"#f7934c" } }}
                />
            </Box>

            {/* Stats row */}
            <Box sx={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:2, mb:3 }}>
                <Box sx={{ ...card, p:3 }}>
                    <EmojiEventsRoundedIcon sx={{ color:"#f7934c", mb:1 }} />
                    <Typography sx={{ fontSize:36, fontWeight:800, color:"#f7934c" }}>
                        {stats.unlocked || 0}
                    </Typography>
                    <Typography sx={{ fontSize:11, color:"rgba(255,255,255,0.35)", mt:0.5 }}>
                        Achievements unlocked
                    </Typography>
                    <LinearProgress variant="determinate" value={unlockedPct}
                        sx={{ mt:2, height:4, borderRadius:10, backgroundColor:"rgba(255,255,255,0.06)",
                            "& .MuiLinearProgress-bar": { background:"linear-gradient(90deg,#f7934c,#f76060)", borderRadius:10 } }} />
                </Box>
                <Box sx={{ ...card, p:3 }}>
                    <WhatshotRoundedIcon sx={{ color:"#f76060", mb:1 }} />
                    <Typography sx={{ fontSize:36, fontWeight:800, color:"#f76060" }}>
                        {user?.streak || 0}
                    </Typography>
                    <Typography sx={{ fontSize:11, color:"rgba(255,255,255,0.35)", mt:0.5 }}>
                        Current streak (days)
                    </Typography>
                    <Typography sx={{ fontSize:10, color:"rgba(255,255,255,0.25)", mt:1 }}>
                        Best: {user?.longestStreak || 0} days
                    </Typography>
                </Box>
                <Box sx={{ ...card, p:3 }}>
                    <StarRoundedIcon sx={{ color:"#9b6dff", mb:1 }} />
                    <Typography sx={{ fontSize:36, fontWeight:800, color:"#9b6dff" }}>
                        {user?.xp || 0}
                    </Typography>
                    <Typography sx={{ fontSize:11, color:"rgba(255,255,255,0.35)", mt:0.5 }}>
                        Total XP earned
                    </Typography>
                    <Typography sx={{ fontSize:10, color:"rgba(255,255,255,0.25)", mt:1 }}>
                        Level {user?.level || 1}
                    </Typography>
                </Box>
            </Box>

            {/* Filter tabs */}
            <Box sx={{ display:"flex", gap:1, mb:3 }}>
                {["all", "unlocked", "locked"].map((f) => (
                    <Button key={f} size="small" onClick={() => setFilter(f)}
                        sx={{
                            textTransform:"capitalize", fontSize:12, borderRadius:"10px", px:2.5,
                            backgroundColor: filter === f ? "rgba(79,142,247,0.15)" : "transparent",
                            color: filter === f ? "#4f8ef7" : "rgba(255,255,255,0.4)",
                            border: filter === f ? "1px solid rgba(79,142,247,0.3)" : "1px solid rgba(255,255,255,0.08)",
                            "&:hover": { backgroundColor:"rgba(79,142,247,0.08)" },
                        }}>
                        {f === "all" ? "All" : f === "unlocked" ? "Unlocked" : "Locked"}
                    </Button>
                ))}
            </Box>

            {/* Achievement grid */}
            <Box sx={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:2 }}>
                {filtered.map((ach) => {
                    const style = RARITY_STYLE[ach.rarity] || RARITY_STYLE.common;
                    return (
                        <Box
                            key={ach.achievementId}
                            sx={{
                                p:3, borderRadius:"18px",
                                border:`1px solid ${ach.unlocked ? style.border : "rgba(255,255,255,0.06)"}`,
                                background: ach.unlocked
                                    ? `linear-gradient(145deg, ${style.bg}, rgba(255,255,255,0.01))`
                                    : "rgba(255,255,255,0.02)",
                                opacity: ach.unlocked ? 1 : 0.5,
                                transition:"all 0.2s ease",
                                "&:hover": { opacity:1, borderColor: style.border },
                            }}
                        >
                            <Box sx={{ display:"flex", alignItems:"flex-start", gap:2 }}>
                                <Box sx={{
                                    width:54, height:54, borderRadius:"16px", flexShrink:0,
                                    display:"flex", alignItems:"center", justifyContent:"center",
                                    fontSize:26,
                                    background: ach.unlocked ? `${style.bg}` : "rgba(255,255,255,0.04)",
                                    border:`1px solid ${ach.unlocked ? style.border : "rgba(255,255,255,0.07)"}`,
                                    position:"relative",
                                }}>
                                    {ach.icon}
                                    {!ach.unlocked && (
                                        <Box sx={{ position:"absolute", inset:0, borderRadius:"16px",
                                            display:"flex", alignItems:"center", justifyContent:"center",
                                            backgroundColor:"rgba(5,5,8,0.7)" }}>
                                            <LockRoundedIcon sx={{ fontSize:18, color:"rgba(255,255,255,0.3)" }} />
                                        </Box>
                                    )}
                                </Box>

                                <Box sx={{ flex:1, minWidth:0 }}>
                                    <Box sx={{ display:"flex", alignItems:"center", gap:1, mb:0.5, flexWrap:"wrap" }}>
                                        <Typography sx={{ fontSize:14, fontWeight:700, color: ach.unlocked ? "#fff" : "rgba(255,255,255,0.4)" }}>
                                            {ach.title}
                                        </Typography>
                                        <Chip label={ach.rarity} size="small"
                                            sx={{ fontSize:8, height:18, textTransform:"capitalize",
                                                color: style.color, backgroundColor: style.bg,
                                                border:`1px solid ${style.border}` }} />
                                    </Box>
                                    <Typography sx={{ fontSize:12, color:"rgba(255,255,255,0.4)", lineHeight:1.5 }}>
                                        {ach.description}
                                    </Typography>
                                    <Box sx={{ display:"flex", justifyContent:"space-between", mt:1.5 }}>
                                        <Typography sx={{ fontSize:10, color: style.color }}>
                                            +{ach.xpReward} XP
                                        </Typography>
                                        {ach.unlocked && ach.unlockedAt && (
                                            <Typography sx={{ fontSize:10, color:"rgba(255,255,255,0.25)" }}>
                                                {new Date(ach.unlockedAt).toLocaleDateString()}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    );
                })}
            </Box>

            {filtered.length === 0 && (
                <Box sx={{ textAlign:"center", py:8, color:"rgba(255,255,255,0.3)" }}>
                    <EmojiEventsRoundedIcon sx={{ fontSize:48, mb:2, opacity:0.4 }} />
                    <Typography>No achievements in this category yet.</Typography>
                </Box>
            )}
        </Box>
    );
};

export default Achievement;
