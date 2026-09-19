import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import Layout from "./Layout";
import Home from "./Home";
import SkillProfile from "./SkillProfile";
import CareerExplorer from "./CareerExplorer";
import GapAnalysis from "./GapAnalysis";
import Roadmap from "./Roadmap";
import Courses from "./Courses";
import Progress from "./Progress";
import Achievement from "./Achievement";
import Settings from "./Settings";
import CareerOnboarding from "./CareerOnboarding";

import { useAuth } from "./AuthContext";
import { Box, CircularProgress } from "@mui/material";

// Google OAuth callback handler
const GoogleCallback = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");

    useEffect(() => {
        const hash = window.location.hash;
        if (hash.startsWith("#token=")) {
            const token = hash.replace("#token=", "");
            localStorage.setItem("sn_token", token);
        }
        window.location.href = "/";
    }, []);

    if (error) {
        return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#030306", color: "#fff" }}>
                <div>{error}</div>
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#030306" }}>
            <CircularProgress sx={{ color: "#4f8ef7" }} />
        </Box>
    );
};

// Protected route wrapper
const Protected = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <Box sx={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#030306" }}>
                <CircularProgress sx={{ color: "rgba(255,255,255,0.4)" }} />
            </Box>
        );
    }

    return children;
};

// Onboarding wrapper - show onboarding if user hasn't completed it
const OnboardingWrapper = ({ children }) => {
    const { user } = useAuth();
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (user && !user.targetCareer) {
            setShowOnboarding(true);
        }
        setChecking(false);
    }, [user]);

    if (checking) {
        return (
            <Box sx={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#030306" }}>
                <CircularProgress sx={{ color: "rgba(255,255,255,0.4)" }} />
            </Box>
        );
    }

    if (showOnboarding) {
        return <CareerOnboarding onComplete={() => setShowOnboarding(false)} />;
    }

    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Google OAuth callback */}
                <Route path="/auth/google/callback" element={<GoogleCallback />} />


                {/* Protected app shell */}
                <Route element={<Protected><Layout /></Protected>}>
                    <Route path="/" element={<OnboardingWrapper><Home /></OnboardingWrapper>} />
                    <Route path="/skill-profile" element={<SkillProfile />} />
                    <Route path="/career-explorer" element={<CareerExplorer />} />
                    <Route path="/gap-analysis" element={<GapAnalysis />} />
                    <Route path="/roadmap" element={<Roadmap />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/progress" element={<Progress />} />
                    <Route path="/achievement" element={<Achievement />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
