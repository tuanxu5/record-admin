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

const hopDongService = {
    getList: async () => {
        const response = await apiClient.get("/hop-dong/list");
        return response.data;
    },

    getOne: async (id) => {
        const response = await apiClient.get(`/hop-dong/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await apiClient.post("/hop-dong/add", data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await apiClient.put(`/hop-dong/update/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/hop-dong/delete/${id}`);
        return response.data;
    },

    importExcel: async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await apiClient.post("/hop-dong/import", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    exportExcel: async () => {
        const response = await apiClient.get("/hop-dong/export", {
            responseType: "blob",
        });
        return response.data;
    },
};

export default hopDongService;

