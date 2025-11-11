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

const luuChuyenTienTeService = {
    getData: async (body) => {
        const response = await apiClient.post(`/baocaovonbangtien/luu-chuyen-tien-te`, body);
        return response.data;
    },
};

export default luuChuyenTienTeService;

