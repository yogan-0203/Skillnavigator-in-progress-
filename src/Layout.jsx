import { Box, Typography, Button, Avatar, Tooltip, Switch, Chip, LinearProgress } from "@mui/material";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/Psychology";
import LeaderboardOutlinedIcon from "@mui/icons-material/Leaderboard";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import WhatshotRoundedIcon from "@mui/icons-material/WhatshotRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import FocusTimer from "./FocusTimer";
import { getTokens, RADIUS } from "./theme/tokens";

const menuItems = [
    { name: "Dashboard", icon: <DashboardOutlinedIcon />, path: "/" },
    { name: "Skill Profile", icon: <PersonOutlineOutlinedIcon />, path: "/skill-profile" },
    { name: "Career Explorer", icon: <ExploreOutlinedIcon />, path: "/career-explorer" },
    { name: "Gap Analysis", icon: <AnalyticsOutlinedIcon />, path: "/gap-analysis" },
    { name: "Roadmap", icon: <RouteOutlinedIcon />, path: "/roadmap" },
    { name: "Courses", icon: <SchoolOutlinedIcon />, path: "/courses" },
    { name: "Practice", icon: <PsychologyOutlinedIcon />, path: "/practice" },
    { name: "Leaderboard", icon: <LeaderboardOutlinedIcon />, path: "/leaderboard" },
    { name: "Progress", icon: <TrendingUpOutlinedIcon />, path: "/progress" },
    { name: "Achievement", icon: <EmojiEventsOutlinedIcon />, path: "/achievement" },
    { name: "Settings", icon: <SettingsOutlinedIcon />, path: "/settings" },
];

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const t = getTokens(darkMode);

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
        window.location.reload();
    };

    const xpForNextLevel = user ? user.level * 500 : 500;
    const xpForCurrentLevel = user ? (user.level - 1) * 500 : 0;
    const xpProgress = user ? Math.min(100, Math.round(((user.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100)) : 0;

    const textPrimary = t.text.primary;
    const textSecondary = t.text.secondary;
    const borderColor = t.border.subtle;
    const cardBg = t.dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";

    return (
        <Box sx={{ width: "100vw", height: "100vh", display: "flex", overflow: "hidden", background: t.bg.page, position: "relative" }}>
            <div className="app-backdrop" />
            {/* Sidebar */}
            <Box sx={{ width: "28%", height: "100vh", p: "16px 16px 16px 16px", boxSizing: "border-box", flexShrink: 0, position: "relative", zIndex: 1 }}>
                <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: `${RADIUS.xl}px`, border: `1px solid ${borderColor}`, background: t.bg.sidebar, backdropFilter: "blur(18px) saturate(1.3)", WebkitBackdropFilter: "blur(18px) saturate(1.3)", overflow: "hidden", boxShadow: t.shadow.glass }}>
                    {/* Logo */}
                    <Box sx={{ px: 3, pt: 3, pb: 2, flexShrink: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Box sx={{ width: 40, height: 40, borderRadius: `${RADIUS.md}px`, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(145deg, #4f8ef7, #9b6dff)", border: "1px solid rgba(255,255,255,0.25)", boxShadow: t.shadow.glassSm }}>
                                <AutoAwesomeRoundedIcon sx={{ fontSize: 20, color: "#fff" }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: 15, fontWeight: 800, color: textPrimary }}>Skill Navigator</Typography>
                                <Typography sx={{ fontSize: 9, color: textSecondary }}>AI-Powered Learning</Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Theme Toggle */}
                    <Box sx={{ px: 3, pb: 2, flexShrink: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, borderRadius: `${RADIUS.md}px`, background: t.glass.inset, border: `1px solid ${borderColor}`, boxShadow: t.shadow.glassSm }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                {darkMode ? <DarkModeRoundedIcon sx={{ fontSize: 16, color: "#9b6dff" }} /> : <LightModeRoundedIcon sx={{ fontSize: 16, color: "#f7934c" }} />}
                                <Typography sx={{ fontSize: 11, color: textSecondary }}>{darkMode ? "Dark" : "Light"} Mode</Typography>
                            </Box>
                            <Switch checked={darkMode} onChange={toggleTheme} size="small" sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#9b6dff" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "rgba(155,109,255,0.4)" }, "& .MuiSwitch-track": { backgroundColor: "rgba(128,128,128,0.3)" } }} />
                        </Box>
                    </Box>

                    {/* Navigation */}
                    <Box sx={{ flex: 1, px: 2, overflowY: "auto", py: 1 }}>
                        {menuItems.map((item) => {
                            const active = location.pathname === item.path;
                            return (
                                <NavLink key={item.path} to={item.path} style={{ textDecoration: "none" }}>
                                    <Button fullWidth startIcon={item.icon}
                                        sx={{ justifyContent: "flex-start", minHeight: "44px", mb: 0.5,
                                            color: active ? "#fff" : textSecondary,
                                            background: active ? "linear-gradient(145deg, #4f8ef7, #9b6dff)" : "transparent",
                                            border: active ? "1px solid rgba(255,255,255,0.22)" : "1px solid transparent",
                                            boxShadow: active ? t.shadow.glassSm : "none",
                                            borderRadius: `${RADIUS.md}px`, padding: "10px 16px", fontSize: 14, fontWeight: active ? 700 : 500,
                                            textTransform: "none", transition: "all 0.2s ease",
                                            "& .MuiButton-startIcon": { mr: "12px" },
                                            "&:hover": { color: active ? "#fff" : t.text.primary, background: active ? "linear-gradient(145deg, #4f8ef7, #9b6dff)" : (t.dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"), border: active ? "1px solid rgba(255,255,255,0.22)" : `1px solid ${t.border.subtle}`, transform: "translateX(3px)" },
                                        }}
                                    >
                                        {item.name}
                                    </Button>
                                </NavLink>
                            );
                        })}
                    </Box>

                    {/* User Profile */}
                    <Box sx={{ px: 2, py: 2, flexShrink: 0, borderTop: `1px solid ${borderColor}` }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                            <Avatar sx={{ width: 36, height: 36, background: "linear-gradient(135deg, #4f8ef7, #9b6dff)", fontSize: 14, fontWeight: 700 }}>
                                {user?.name?.[0]?.toUpperCase() || "U"}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "User"}</Typography>
                                <Typography sx={{ fontSize: 9, color: textSecondary }}>Level {user?.level || 1}</Typography>
                            </Box>
                            <Chip icon={<WhatshotRoundedIcon sx={{ fontSize: 12 }} />} label={`${user?.streak || 0}`} size="small" sx={{ height: 20, fontSize: 10, background: "rgba(247,147,76,0.1)", color: "#f7934c", border: "1px solid rgba(247,147,76,0.2)" }} />
                        </Box>
                        <LinearProgress variant="determinate" value={xpProgress} sx={{ height: 8, borderRadius: 10, background: t.glass.inset, border: `1px solid ${borderColor}`, "& .MuiLinearProgress-bar": { background: "linear-gradient(90deg, #4f8ef7, #9b6dff)", borderRadius: 10 } }} />
                    </Box>

                    {/* Logout */}
                    <Box sx={{ px: 2, pb: 3, pt: 1, flexShrink: 0 }}>
                        <Tooltip title="Logout" placement="right">
                            <Button onClick={handleLogout} startIcon={<LogoutOutlinedIcon />} fullWidth
                                sx={{ justifyContent: "flex-start", minHeight: "44px", color: darkMode ? "rgba(247,96,96,0.7)" : "rgba(247,96,96,0.6)", border: `1px solid ${darkMode ? "rgba(247,96,96,0.15)" : "rgba(247,96,96,0.12)"}`, borderRadius: "13px", padding: "10px 16px", fontSize: 14, fontWeight: 600, textTransform: "none", "& .MuiButton-startIcon": { mr: "12px" }, "&:hover": { color: "#f76060", backgroundColor: "rgba(247,96,96,0.08)", border: "1px solid rgba(247,96,96,0.25)" } }}>
                                Logout
                            </Button>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>

            {/* Main content */}
            <Box key={location.pathname} sx={{ flex: 1, height: "100vh", p: "16px 20px 16px 4px", boxSizing: "border-box", overflowY: "auto", overflowX: "hidden", position: "relative", zIndex: 1, animation: "fadeIn 0.35s ease both", "&::-webkit-scrollbar": { width: "5px" }, "&::-webkit-scrollbar-thumb": { background: t.dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.14)", borderRadius: "10px" } }}>
                <Outlet />
            </Box>

            {/* Floating Pomodoro Focus Timer — available on every page */}
            <FocusTimer />
        </Box>
    );
};

export default Layout;


