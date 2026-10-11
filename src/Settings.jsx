import { useState } from "react";
import {
    Box, Typography, Button, Switch, Divider,
    TextField, CircularProgress, Alert, Avatar, Chip,
} from "@mui/material";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { authAPI } from "./api";
import { useTheme } from "./ThemeContext";
import { getTokens, ACCENTS, RADIUS } from "./theme/tokens";
import { ClayCard, GlassPanel, ClayButton, PageHeader, ClayInset } from "./theme/Clay";

const Settings = () => {
    const { user, refreshUser, logout } = useAuth();
    const { darkMode, toggleTheme, setTheme } = useTheme();
    const navigate = useNavigate();
    const t = getTokens(darkMode);
    const [profile, setProfile] = useState({
        name: user?.name || "",
        targetCareer: user?.targetCareer || "",
        learningDomain: user?.learningDomain || "",
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [prefs, setPrefs] = useState({
        aiRecommendations: true,
        learningNotifications: true,
        careerAlerts: true,
        profileVisibility: true,
    });

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await authAPI.updateProfile(profile);
            await refreshUser();
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch {
            alert("Could not save profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
        window.location.reload();
    };

    const inputSx = {
        mb: 2,
        "& .MuiOutlinedInput-root": {
            color: t.text.primary,
            borderRadius: "12px",
            background: t.glass.inset,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            "& fieldset": { borderColor: t.border.subtle },
            "&:hover fieldset": { borderColor: t.border.medium },
            "&.Mui-focused fieldset": { borderColor: ACCENTS.blue },
        },
        "& .MuiInputLabel-root": { color: t.text.secondary },
        "& .MuiInputLabel-root.Mui-focused": { color: ACCENTS.blue },
    };

    return (
        <Box className="stagger" sx={{ width: "100%", minHeight: "100%", color: t.text.primary, pb: 6, animation: "fadeInScale 0.45s ease both" }}>
            <PageHeader t={t} eyebrow="PREFERENCES" title="Settings" titleAccent={ACCENTS.blue}
                subtitle="Manage your profile, appearance and preferences."
                action={
                    <GlassPanel t={t} sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1 }}>
                        <Avatar sx={{ width: 34, height: 34, background: "linear-gradient(135deg,#4f8ef7,#9b6dff)", fontSize: 14, fontWeight: 700 }}>
                            {user?.name?.[0]?.toUpperCase() || "U"}
                        </Avatar>
                        <Box>
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: t.text.primary }}>{user?.name || "User"}</Typography>
                            <Typography sx={{ fontSize: 10, color: t.text.muted }}>Level {user?.level || 1} · {user?.xp || 0} XP</Typography>
                        </Box>
                    </GlassPanel>
                } />

            {/* ── Appearance: light / dark theme hero ─────────────────────── */}
            <ClayCard t={t} sx={{ p: 3, mb: 2.5 }} hover={false}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center",
                        background: `linear-gradient(135deg, ${ACCENTS.orange}, ${ACCENTS.purple})`, boxShadow: t.shadow.glassSm }}>
                        <PaletteRoundedIcon sx={{ fontSize: 18, color: "#fff" }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 17, fontWeight: 700 }}>Appearance</Typography>
                        <Typography sx={{ fontSize: 11, color: t.text.secondary }}>Choose the theme that fits your eyes</Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                    {[{ id: "light", label: "Light", desc: "Crisp frosted white glass", icon: <LightModeRoundedIcon sx={{ fontSize: 26 }} />, tint: ACCENTS.orange },
                      { id: "dark", label: "Dark", desc: "Deep midnight glass", icon: <DarkModeRoundedIcon sx={{ fontSize: 26 }} />, tint: ACCENTS.purple }].map((opt) => {
                        const active = (opt.id === "dark") === darkMode;
                        return (
                            <ClayInset key={opt.id} t={t} onClick={() => setTheme(opt.id)}
                                sx={{ p: 2.5, cursor: "pointer", textAlign: "center", transition: "all 0.25s ease",
                                    borderColor: active ? opt.tint : t.border.subtle,
                                    background: active ? (t.dark ? `${opt.tint}18` : `${opt.tint}12`) : t.glass.inset,
                                    boxShadow: active ? `0 8px 24px ${opt.tint}35, inset 0 1px 0 ${t.dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.9)"}` : t.shadow.glassSm,
                                    "&:hover": { borderColor: opt.tint } }}>
                                <Box sx={{ color: active ? opt.tint : t.text.muted, mb: 1, display: "flex", justifyContent: "center" }}>{opt.icon}</Box>
                                <Typography sx={{ fontSize: 14, fontWeight: 800, color: active ? opt.tint : t.text.primary }}>{opt.label}</Typography>
                                <Typography sx={{ fontSize: 10, color: t.text.muted, mt: 0.3 }}>{opt.desc}</Typography>
                            </ClayInset>
                        );
                    })}
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mt: 2.5 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: darkMode ? t.text.muted : ACCENTS.orange }}>Light</Typography>
                    <Switch checked={darkMode} onChange={toggleTheme}
                        sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: ACCENTS.purple },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: `${ACCENTS.purple}88` },
                            "& .MuiSwitch-track": { backgroundColor: t.border.medium } }} />
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: darkMode ? ACCENTS.purple : t.text.muted }}>Dark</Typography>
                </Box>
            </ClayCard>


            {/* ── Profile ─────────────────────────────────────────────────── */}
            <ClayCard t={t} sx={{ p: 3, mb: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
                        background: `${ACCENTS.blue}18`, border: `1px solid ${ACCENTS.blue}40` }}>
                        <PersonRoundedIcon sx={{ fontSize: 17, color: ACCENTS.blue }} />
                    </Box>
                    <Typography sx={{ fontSize: 17, fontWeight: 700 }}>Profile</Typography>
                </Box>

                {saved && (
                    <Alert severity="success" sx={{ mb: 2, borderRadius: "12px", backgroundColor: `${ACCENTS.green}14`, border: `1px solid ${ACCENTS.green}35`, color: ACCENTS.green, "& .MuiAlert-icon": { color: ACCENTS.green } }}>
                        Profile saved successfully!
                    </Alert>
                )}

                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                    <TextField label="Full Name" value={profile.name}
                        onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} sx={inputSx} />
                    <TextField label="Email" value={user?.email || ""} disabled
                        sx={{ ...inputSx, "& .MuiOutlinedInput-root": { ...inputSx["& .MuiOutlinedInput-root"], color: t.text.secondary } }} />
                    <TextField label="Target Career" value={profile.targetCareer}
                        onChange={(e) => setProfile((p) => ({ ...p, targetCareer: e.target.value }))} sx={inputSx} />
                    <TextField label="Learning Domain" value={profile.learningDomain}
                        onChange={(e) => setProfile((p) => ({ ...p, learningDomain: e.target.value }))} sx={inputSx} />
                </Box>

                <ClayButton t={t} accent={ACCENTS.blue} onClick={handleSaveProfile} disabled={saving}
                    sx={{ height: 44, px: 4 }}>
                    {saving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Save Profile"}
                </ClayButton>
            </ClayCard>


            {/* ── Notifications & Privacy ─────────────────────────────────── */}
            <ClayCard t={t} sx={{ p: 3, mb: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
                        background: `${ACCENTS.purple}18`, border: `1px solid ${ACCENTS.purple}40` }}>
                        <NotificationsRoundedIcon sx={{ fontSize: 17, color: ACCENTS.purple }} />
                    </Box>
                    <Typography sx={{ fontSize: 17, fontWeight: 700 }}>Notifications & Privacy</Typography>
                </Box>
                {[
                    { key: "aiRecommendations", label: "AI Recommendations", desc: "Get personalised AI learning suggestions" },
                    { key: "learningNotifications", label: "Learning Notifications", desc: "Reminders to keep your streak alive" },
                    { key: "careerAlerts", label: "Career Alerts", desc: "Notifications about career path updates" },
                    { key: "profileVisibility", label: "Public Profile", desc: "Allow others to see your learning profile" },
                ].map((pref, idx, arr) => (
                    <Box key={pref.key}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.75 }}>
                            <Box>
                                <Typography sx={{ fontSize: 14, fontWeight: 600, color: t.text.primary }}>{pref.label}</Typography>
                                <Typography sx={{ fontSize: 11, color: t.text.secondary, mt: 0.3 }}>{pref.desc}</Typography>
                            </Box>
                            <Switch checked={prefs[pref.key]}
                                onChange={(e) => setPrefs((p) => ({ ...p, [pref.key]: e.target.checked }))}
                                sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: ACCENTS.blue },
                                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: `${ACCENTS.blue}88` },
                                    "& .MuiSwitch-track": { backgroundColor: t.border.medium } }} />
                        </Box>
                        {idx < arr.length - 1 && <Divider sx={{ borderColor: t.border.subtle }} />}
                    </Box>
                ))}
            </ClayCard>

            {/* ── Account ─────────────────────────────────────────────────── */}
            <ClayCard t={t} sx={{ p: 3, mb: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
                        background: `${ACCENTS.green}18`, border: `1px solid ${ACCENTS.green}40` }}>
                        <SecurityRoundedIcon sx={{ fontSize: 17, color: ACCENTS.green }} />
                    </Box>
                    <Typography sx={{ fontSize: 17, fontWeight: 700 }}>Account</Typography>
                    <Chip icon={<VerifiedRoundedIcon sx={{ fontSize: 13 }} />}
                        label={user?.email_verified === false ? "Unverified" : "Verified"} size="small"
                        sx={{ ml: "auto", fontSize: 10, fontWeight: 700,
                            color: user?.email_verified === false ? ACCENTS.orange : ACCENTS.green,
                            background: user?.email_verified === false ? `${ACCENTS.orange}15` : `${ACCENTS.green}15`,
                            border: `1px solid ${user?.email_verified === false ? `${ACCENTS.orange}35` : `${ACCENTS.green}35`}` }} />
                </Box>
                {[
                    { label: "Account Level", value: `Level ${user?.level || 1}` },
                    { label: "Total XP", value: `${user?.xp || 0} XP` },
                    { label: "Member Since", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" }) : "—" },
                    { label: "Longest Streak", value: `${user?.longestStreak || 0} days` },
                ].map((item, idx, arr) => (
                    <Box key={item.label}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5 }}>
                            <Typography sx={{ fontSize: 14, color: t.text.secondary }}>{item.label}</Typography>
                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: t.text.primary }}>{item.value}</Typography>
                        </Box>
                        {idx < arr.length - 1 && <Divider sx={{ borderColor: t.border.subtle }} />}
                    </Box>
                ))}
            </ClayCard>


            {/* ── Logout ──────────────────────────────────────────────────── */}
            <ClayCard t={t} sx={{ p: 3, borderColor: `${ACCENTS.red}40` }} hover={false}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
                            background: `${ACCENTS.red}18`, border: `1px solid ${ACCENTS.red}40` }}>
                            <LogoutRoundedIcon sx={{ fontSize: 17, color: ACCENTS.red }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: 15, fontWeight: 700, color: t.text.primary }}>Log out</Typography>
                            <Typography sx={{ fontSize: 11, color: t.text.secondary }}>End your session on this device</Typography>
                        </Box>
                    </Box>
                    <Button onClick={handleLogout}
                        sx={{ height: 42, px: 3.5, borderRadius: "12px", textTransform: "none", fontWeight: 700, fontSize: 13,
                            color: "#fff", background: `linear-gradient(135deg, ${ACCENTS.red}, #e04a4a)`,
                            border: `1px solid ${ACCENTS.red}`,
                            boxShadow: `0 8px 24px ${ACCENTS.red}45, inset 0 1px 0 rgba(255,255,255,0.3)`,
                            backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                            transition: "all 0.2s ease",
                            "&:hover": { filter: "brightness(1.1)", transform: "translateY(-1px)" } }}>
                        Sign out
                    </Button>
                </Box>
            </ClayCard>
        </Box>
    );
};

export default Settings;
