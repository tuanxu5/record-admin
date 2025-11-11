
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

const vonBangTienService = {
    getData: async (params) => {
        const query = new URLSearchParams(params).toString();
        const response = await apiClient.get(`/baocaovonbangtien/tiengui?${query}`);
        return response.data;
    }
};

export default vonBangTienService;