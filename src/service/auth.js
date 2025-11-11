import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const authService = {
    login: async (credentials) => {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
        return response.data;
    },

    getTenants: async () => {
        const response = await axios.get(`${API_BASE_URL}/tenants/public`);
        return response.data;
    },

    register: async (userData) => {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
        return response.data;
    },

    getProfile: async (token) => {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },

    getUsers: async () => {
        const response = await apiClient.get("/auth/list");
        return response.data;
    },

    updateUser: async (userId, userData) => {
        const response = await apiClient.put(`/auth/${userId}`, userData);
        return response.data;
    },

    deleteUser: async (userId) => {
        const response = await apiClient.delete(`/auth/${userId}`);
        return response.data;
    },
};

export default authService;

