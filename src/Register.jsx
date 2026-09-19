import { useState } from "react";
import {
    Box, Typography, TextField, Button,
    Divider, Alert, CircularProgress,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { authAPI } from "./api";
import { useTheme } from "./ThemeContext";

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const { darkMode } = useTheme();
    const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
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
        if (!form.name || !form.email || !form.password || !form.confirm) { setError("Please fill in all fields."); return; }
        if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
        if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
        setLoading(true);
        try {
            await register(form.name, form.email, form.password);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.detail || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
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
                setError(detail || "Google sign-up is not available. Please use email/password.");
            }
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", width: "100vw", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: textPrimary, overflow: "hidden" }}>
            <Box sx={{ position: "fixed", top: -100, right: -100, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(155,109,255,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
            <Box sx={{ position: "fixed", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

            <Box component="form" onSubmit={handleSubmit} sx={{ width: 420, p: 4, borderRadius: "24px", border: `1px solid ${borderColor}`, background: cardBg, boxShadow: darkMode ? "0 30px 80px rgba(0,0,0,0.6)" : "0 30px 80px rgba(0,0,0,0.1)", backdropFilter: "blur(20px)", animation: "fadeIn 0.4s ease" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(155,109,255,0.15), rgba(79,142,247,0.15))", border: "1px solid rgba(155,109,255,0.25)" }}>
                        <PersonAddRoundedIcon sx={{ color: "#9b6dff" }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 28, fontWeight: 700 }}>Create Account</Typography>
                        <Typography sx={{ fontSize: 12, color: textSecondary }}>Start building your career roadmap</Typography>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "12px", backgroundColor: "rgba(247,96,96,0.1)", border: "1px solid rgba(247,96,96,0.25)", color: "#f76060", "& .MuiAlert-icon": { color: "#f76060" } }}>{error}</Alert>}

                <TextField fullWidth name="name" label="Full Name" value={form.name} onChange={handleChange}
                    sx={{ mb: 2, "& .MuiOutlinedInput-root": { color: textPrimary, borderRadius: "13px", background: inputBg, "& fieldset": { borderColor: inputBorder }, "&:hover fieldset": { borderColor: "#9b6dff" }, "&.Mui-focused fieldset": { borderColor: "#9b6dff" } }, "& .MuiInputLabel-root": { color: textSecondary }, "& .MuiInputLabel-root.Mui-focused": { color: "#9b6dff" } }} />
                <TextField fullWidth name="email" label="Email" type="email" value={form.email} onChange={handleChange}
                    sx={{ mb: 2, "& .MuiOutlinedInput-root": { color: textPrimary, borderRadius: "13px", background: inputBg, "& fieldset": { borderColor: inputBorder }, "&:hover fieldset": { borderColor: "#9b6dff" }, "&.Mui-focused fieldset": { borderColor: "#9b6dff" } }, "& .MuiInputLabel-root": { color: textSecondary }, "& .MuiInputLabel-root.Mui-focused": { color: "#9b6dff" } }} autoComplete="email" />
                <TextField fullWidth name="password" label="Password" type="password" value={form.password} onChange={handleChange}
                    sx={{ mb: 2, "& .MuiOutlinedInput-root": { color: textPrimary, borderRadius: "13px", background: inputBg, "& fieldset": { borderColor: inputBorder }, "&:hover fieldset": { borderColor: "#9b6dff" }, "&.Mui-focused fieldset": { borderColor: "#9b6dff" } }, "& .MuiInputLabel-root": { color: textSecondary }, "& .MuiInputLabel-root.Mui-focused": { color: "#9b6dff" } }} autoComplete="new-password" />
                <TextField fullWidth name="confirm" label="Confirm Password" type="password" value={form.confirm} onChange={handleChange}
                    sx={{ mb: 3, "& .MuiOutlinedInput-root": { color: textPrimary, borderRadius: "13px", background: inputBg, "& fieldset": { borderColor: inputBorder }, "&:hover fieldset": { borderColor: "#9b6dff" }, "&.Mui-focused fieldset": { borderColor: "#9b6dff" } }, "& .MuiInputLabel-root": { color: textSecondary }, "& .MuiInputLabel-root.Mui-focused": { color: "#9b6dff" } }} autoComplete="new-password" />

                <Button fullWidth type="submit" variant="contained" disabled={loading}
                    sx={{ height: 50, borderRadius: "13px", background: "linear-gradient(135deg, #9b6dff, #4f8ef7)", color: "#fff", fontWeight: 700, textTransform: "none", fontSize: 15, "&:hover": { background: "linear-gradient(135deg, #b08aff, #6ba3ff)" }, "&:disabled": { opacity: 0.6 } }}>
                    {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Create Account"}
                </Button>

                <Divider sx={{ my: 3, borderColor: darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)", "&::before,&::after": { borderColor: darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)" } }}>
                    <Typography sx={{ fontSize: 10, color: textSecondary }}>OR</Typography>
                </Divider>

                <Button fullWidth variant="outlined" startIcon={<GoogleIcon />} onClick={handleGoogleSignup}
                    sx={{ height: 48, borderRadius: "13px", color: textPrimary, borderColor: inputBorder, textTransform: "none", "&:hover": { borderColor: "#9b6dff", background: darkMode ? "rgba(255,255,255,0.04)" : "rgba(155,109,255,0.04)" } }}>
                    Sign up with Google
                </Button>

                <Typography sx={{ textAlign: "center", fontSize: 12, color: textSecondary, mt: 3 }}>
                    Already have an account?{" "}
                    <Link to="/login" style={{ color: "#9b6dff", fontWeight: 600, textDecoration: "none" }}>Login</Link>
                </Typography>
            </Box>
        </Box>
    );
};

export default Register;
