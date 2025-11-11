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

const sanXuatKinhDoanhService = {
    getData: async (body) => {
        const response = await apiClient.post(`/baocaovonbangtien/san-xuat-kinh-doanh`, body);
        return response.data;
    },
};

export default sanXuatKinhDoanhService;

