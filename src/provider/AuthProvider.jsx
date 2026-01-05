import { useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import authService from "../service/auth";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("access_token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            const response = await authService.login(credentials);
            if (response.success && response.access_token) {
                setToken(response.access_token);
                setUser(response.user);
                localStorage.setItem("access_token", response.access_token);
                localStorage.setItem("user", JSON.stringify(response.user));
                return response;
            }
            throw new Error(response.message || "Đăng nhập thất bại");
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await authService.createUser(userData);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
    };

    const isAdmin = () => {
        return user?.is_admin === 1 || user?.is_admin === true;
    };

    const isMasterAdmin = () => {
        // User từ DB QUANLY có tenant_id = null hoặc undefined
        return user && (user.tenant_id === null || user.tenant_id === undefined);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                login,
                register,
                logout,
                isAdmin,
                isMasterAdmin,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

