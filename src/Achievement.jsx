import { useState, useEffect, useMemo } from "react";
import { Box, Typography, Chip } from "@mui/material";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import WhatshotRoundedIcon from "@mui/icons-material/WhatshotRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import { achievementsAPI } from "./api";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { getTokens, ACCENTS } from "./theme/tokens";
import { ClayCard, PageHeader, StatTile, SegmentTabs, EmptyState, LoadingState } from "./theme/Clay";

const RARITY_STYLE = {
    common:    { color: "#8a8aa3", bg: "rgba(138,138,163,0.14)", border: "rgba(138,138,163,0.35)" },
    rare:      { color: "#4f8ef7", bg: "rgba(79,142,247,0.14)", border: "rgba(79,142,247,0.4)" },
    epic:      { color: "#9b6dff", bg: "rgba(155,109,255,0.14)", border: "rgba(155,109,255,0.4)" },
    legendary: { color: "#f7934c", bg: "rgba(247,147,76,0.14)", border: "rgba(247,147,76,0.4)" },
};


const Achievement = () => {
    const { user } = useAuth();
    const { darkMode } = useTheme();
    const t = useMemo(() => getTokens(darkMode), [darkMode]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    useEffect(() => {
        const fetch = async () => {
            try { const { data: d } = await achievementsAPI.get(); setData(d); }
            catch { setData({ achievements: [], stats: { total: 0, unlocked: 0 } }); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);
    if (loading) return <LoadingState t={t} />;
    const { achievements = [], stats = {} } = data || {};
    const filtered = achievements.filter((a) => {
        if (filter === "unlocked") return a.unlocked;
        if (filter === "locked") return !a.unlocked;
        return true;
    });
    const unlockedPct = stats.total > 0 ? Math.round((stats.unlocked / stats.total) * 100) : 0;
    const R = 30, CIRC = 2 * Math.PI * R;
    return (
        <Box className="stagger" sx={{ width: "100%", minHeight: "100%", color: t.text.primary, pb: 6, animation: "fadeInScale 0.45s ease both" }}>
            <PageHeader t={t} eyebrow="MILESTONES & BADGES" title="Achievements" titleAccent={ACCENTS.orange}
                subtitle="Your milestones, badges and accomplishments on this journey."
                action={<Chip icon={<EmojiEventsRoundedIcon />} label={`${stats.unlocked || 0} / ${stats.total || 0} Earned`}
                    sx={{ color: ACCENTS.orange, background: `${ACCENTS.orange}18`, border: `1px solid ${ACCENTS.orange}45`, fontSize: 12, fontWeight: 700, "& .MuiChip-icon": { color: ACCENTS.orange } }} />} />
            <Box sx={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", gap: 2, mb: 2.5 }}>
                <ClayCard t={t} sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
                        <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
                            <circle cx="36" cy="36" r={R} fill="none" stroke={t.glass.inset} strokeWidth="8" />
                            <circle cx="36" cy="36" r={R} fill="none" stroke={ACCENTS.orange} strokeWidth="8" strokeLinecap="round"
                                strokeDasharray={CIRC} strokeDashoffset={CIRC - (unlockedPct / 100) * CIRC} style={{ transition: "stroke-dashoffset 0.6s ease" }} />
                        </svg>
                        <Typography sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: t.text.primary }}>{unlockedPct}%</Typography>
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 28, fontWeight: 800, color: ACCENTS.orange, lineHeight: 1 }}>{stats.unlocked || 0}</Typography>
                        <Typography sx={{ fontSize: 11, color: t.text.secondary, mt: 0.5 }}>Achievements unlocked</Typography>
                    </Box>
                </ClayCard>
                <StatTile t={t} icon={<WhatshotRoundedIcon />} value={user?.streak || 0} label="Current streak (days)" sub={`Best: ${user?.longestStreak || 0} days`} accent={ACCENTS.red} />
                <StatTile t={t} icon={<StarRoundedIcon />} value={user?.xp || 0} label="Total XP earned" sub={`Level ${user?.level || 1}`} accent={ACCENTS.purple} />
                <StatTile t={t} icon={<WorkspacePremiumRoundedIcon />} value={stats.total || 0} label="Total badges" sub={`${(stats.total || 0) - (stats.unlocked || 0)} to go`} accent={ACCENTS.blue} />
            </Box>
            <Box sx={{ mb: 2.5 }}>
                <SegmentTabs t={t} accent={ACCENTS.blue} value={filter} onChange={setFilter}
                    options={[{ value: "all", label: "All" }, { value: "unlocked", label: "Unlocked" }, { value: "locked", label: "Locked" }]} />
            </Box>
            {filtered.length > 0 ? (
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                    {filtered.map((ach, idx) => {
                        const style = RARITY_STYLE[ach.rarity] || RARITY_STYLE.common;
                        return (
                            <ClayCard key={ach.achievementId} t={t} sx={{ p: 2.5, borderColor: ach.unlocked ? style.border : t.border.subtle, opacity: ach.unlocked ? 1 : 0.72, animation: `clayPop 0.45s ${Math.min(idx * 0.05, 0.5)}s cubic-bezier(0.22, 1, 0.36, 1) both` }}>
                                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                                    <Box sx={{ width: 54, height: 54, borderRadius: "16px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, background: ach.unlocked ? style.bg : t.glass.inset, border: `1px solid ${ach.unlocked ? style.border : t.border.subtle}`, position: "relative" }}>
                                        {ach.icon}
                                        {!ach.unlocked && (
                                            <Box sx={{ position: "absolute", inset: 0, borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", background: t.dark ? "rgba(5,5,10,0.55)" : "rgba(255,255,255,0.55)" }}>
                                                <LockRoundedIcon sx={{ fontSize: 18, color: t.text.muted }} />
                                            </Box>
                                        )}
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
                                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: ach.unlocked ? t.text.primary : t.text.secondary }}>{ach.title}</Typography>
                                            <Chip label={ach.rarity} size="small" sx={{ fontSize: 8, height: 18, textTransform: "capitalize", fontWeight: 700, color: style.color, backgroundColor: style.bg, border: `1px solid ${style.border}` }} />
                                        </Box>
                                        <Typography sx={{ fontSize: 12, color: t.text.secondary, lineHeight: 1.5 }}>{ach.description}</Typography>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1.5 }}>
                                            <Typography sx={{ fontSize: 10, fontWeight: 700, color: style.color }}>+{ach.xpReward} XP</Typography>
                                            {ach.unlocked && ach.unlockedAt && (
                                                <Typography sx={{ fontSize: 10, color: t.text.muted }}>{new Date(ach.unlockedAt).toLocaleDateString()}</Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                            </ClayCard>
                        );
                    })}
                </Box>
            ) : (
                <EmptyState t={t} icon={<EmojiEventsRoundedIcon sx={{ fontSize: 30 }} />} title="No achievements in this category yet" subtitle="Keep learning — badges unlock as you complete courses, assessments and streaks." />
            )}
        </Box>
    );
};

export default Achievement;
