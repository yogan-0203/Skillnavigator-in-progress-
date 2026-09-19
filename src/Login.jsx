import { useState } from "react";
import {
    Box, Typography, TextField, Button,
    Divider, Alert, CircularProgress,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { authAPI } from "./api";
import { useTheme } from "./ThemeContext";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { darkMode } = useTheme();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const bg = darkMode ? "#030306" : "#f5f5f8";
    const cardBg = darkMode ? "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" : "linear-gradient(145deg, #ffffff, #f8f8fc)";
    const borderColor = darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
    const textPrimary = darkMode ? "#f0f0f8" : "#1a1a2e";
    const textSecondary = darkMode ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.5)";
    const inputBg = darkMode ? "rgba(255,255,255,0.05)" : "#ffffff";
    const inputBorder = darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.15)";

    const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
        setLoading(true);
        try {
            await login(form.email, form.password);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.detail || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { data } = await authAPI.googleUrl();
            window.location.href = data.url;
        } catch (err) {
            const detail = err.response?.data?.detail;
            if (detail && detail.includes && detail.includes("Google OAuth not configured")) {
                setError(
                    "Google OAuth is not configured yet. Please use email/password for now. " +
                    "Admin: set real GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env " +
                    "(get them from https://console.cloud.google.com/)."
                );
            } else {
                setError(detail || "Google sign-in is not available. Please use email/password.");
            }
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", width: "100vw", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: textPrimary, overflow: "hidden" }}>
            <Box sx={{ position: "fixed", top: -120, left: -120, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
            <Box sx={{ position: "fixed", bottom: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(155,109,255,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

            <Box component="form" onSubmit={handleSubmit} sx={{ width: 420, p: 4, borderRadius: "24px", border: `1px solid ${borderColor}`, background: cardBg, boxShadow: darkMode ? "0 30px 80px rgba(0,0,0,0.6)" : "0 30px 80px rgba(0,0,0,0.1)", backdropFilter: "blur(20px)", animation: "fadeIn 0.4s ease" }}>
                <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/register")} sx={{ color: textSecondary, textTransform: "none", mb: 2, fontSize: 12 }}>Don't have an account?</Button>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(79,142,247,0.15), rgba(155,109,255,0.15))", border: "1px solid rgba(79,142,247,0.25)" }}>
                        <LoginRoundedIcon sx={{ color: "#4f8ef7" }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 28, fontWeight: 700 }}>Welcome Back</Typography>
                        <Typography sx={{ fontSize: 12, color: textSecondary }}>Continue your learning journey</Typography>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "12px", backgroundColor: "rgba(247,96,96,0.1)", border: "1px solid rgba(247,96,96,0.25)", color: "#f76060", "& .MuiAlert-icon": { color: "#f76060" } }}>{error}</Alert>}

                <TextField fullWidth name="email" label="Email" type="email" value={form.email} onChange={handleChange}
                    sx={{ mb: 2, "& .MuiOutlinedInput-root": { color: textPrimary, borderRadius: "13px", background: inputBg, "& fieldset": { borderColor: inputBorder }, "&:hover fieldset": { borderColor: "#4f8ef7" }, "&.Mui-focused fieldset": { borderColor: "#4f8ef7" } }, "& .MuiInputLabel-root": { color: textSecondary }, "& .MuiInputLabel-root.Mui-focused": { color: "#4f8ef7" } }} autoComplete="email" />
                <TextField fullWidth name="password" label="Password" type="password" value={form.password} onChange={handleChange}
                    sx={{ mb: 3, "& .MuiOutlinedInput-root": { color: textPrimary, borderRadius: "13px", background: inputBg, "& fieldset": { borderColor: inputBorder }, "&:hover fieldset": { borderColor: "#4f8ef7" }, "&.Mui-focused fieldset": { borderColor: "#4f8ef7" } }, "& .MuiInputLabel-root": { color: textSecondary }, "& .MuiInputLabel-root.Mui-focused": { color: "#4f8ef7" } }} autoComplete="current-password" />

                <Button fullWidth type="submit" variant="contained" disabled={loading}
                    sx={{ height: 50, borderRadius: "13px", background: "linear-gradient(135deg, #4f8ef7, #9b6dff)", color: "#fff", fontWeight: 700, textTransform: "none", fontSize: 15, "&:hover": { background: "linear-gradient(135deg, #6ba3ff, #b08aff)" }, "&:disabled": { opacity: 0.6 } }}>
                    {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Login"}
                </Button>

                <Divider sx={{ my: 3, borderColor: darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)", "&::before,&::after": { borderColor: darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)" } }}>
                    <Typography sx={{ fontSize: 10, color: textSecondary }}>OR</Typography>
                </Divider>

                <Button fullWidth variant="outlined" startIcon={<GoogleIcon />} onClick={handleGoogleLogin}
                    sx={{ height: 48, borderRadius: "13px", color: textPrimary, borderColor: inputBorder, textTransform: "none", "&:hover": { borderColor: "#4f8ef7", background: darkMode ? "rgba(255,255,255,0.04)" : "rgba(79,142,247,0.04)" } }}>
                    Continue with Google
                </Button>

                <Typography sx={{ textAlign: "center", fontSize: 12, color: textSecondary, mt: 3 }}>
                    Don't have an account?{" "}
                    <Link to="/register" style={{ color: "#4f8ef7", fontWeight: 600, textDecoration: "none" }}>Create account</Link>
                </Typography>
            </Box>
        </Box>
    );
};

export default Login;
