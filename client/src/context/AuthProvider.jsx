
import {
    useCallback,
    useEffect,
    useState,
} from "react";

import AuthContext from "./AuthContext";
import api from "../services/api";

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCurrentUser = useCallback(async () => {
        try {
            const response = await api.get("/auth/me");

            setUser(
                response.data.success
                    ? response.data.user
                    : null
            );
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // LOGIN
    const login = async (email, password) => {
        const response = await api.post("/auth/login", {
            email,
            password,
        });

        if (response.data.success) {
            setUser(response.data.user);
        }

        return response.data;
    };

    // LOGOUT
    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setUser(null);
        }
    };

    // INITIAL AUTHENTICATION CHECK
    useEffect(() => {
        let active = true;

        Promise.resolve().then(async () => {
            if (active) {
                await fetchCurrentUser();
            }
        });

        return () => {
            active = false;
        };
    }, [fetchCurrentUser]);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                fetchCurrentUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
