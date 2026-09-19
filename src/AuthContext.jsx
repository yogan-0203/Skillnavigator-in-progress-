import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "./api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("sn_token"));
    const [loading, setLoading] = useState(true);

    // Load persisted user on mount
    useEffect(() => {
        const init = async () => {
            // Check for Google OAuth token in URL hash
            const hash = window.location.hash;
            if (hash.startsWith("#token=")) {
                const googleToken = hash.replace("#token=", "");
                localStorage.setItem("sn_token", googleToken);
                window.history.replaceState(null, "", window.location.pathname);
            }

            let savedToken = localStorage.getItem("sn_token");
            if (!savedToken) {
                // No login yet — auto-login as demo user so the app opens directly
                try {
                    const { data } = await authAPI.demoLogin();
                    savedToken = data.token;
                    localStorage.setItem("sn_token", data.token);
                    setUser(data.user);
                    setToken(data.token);
                    setLoading(false);
                    return;
                } catch {
                    setLoading(false);
                    return;
                }
            }
            try {
                const { data } = await authAPI.me();
                setUser(data.user);
            } catch {
                // Stale/invalid token — auto recover with demo login
                localStorage.removeItem("sn_token");
                localStorage.removeItem("sn_user");
                setToken(null);
                try {
                    const { data } = await authAPI.demoLogin();
                    localStorage.setItem("sn_token", data.token);
                    setToken(data.token);
                    setUser(data.user);
                } catch {}
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const login = useCallback(async (email, password) => {
        const { data } = await authAPI.login({ email, password });
        localStorage.setItem("sn_token", data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    }, []);

    const register = useCallback(async (name, email, password) => {
        const { data } = await authAPI.register({ name, email, password });
        localStorage.setItem("sn_token", data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("sn_token");
        localStorage.removeItem("sn_user");
        setToken(null);
        setUser(null);
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const { data } = await authAPI.me();
            setUser(data.user);
        } catch {}
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, token, loading, login, register, logout, refreshUser }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};

export default AuthContext;
