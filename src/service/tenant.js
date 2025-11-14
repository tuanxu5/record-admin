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

const tenantService = {
    // Lấy danh sách tất cả tenants (cần auth)
    getAllTenants: async () => {
        const response = await apiClient.get("/tenants");
        return response.data;
    },

    // Lấy thông tin một tenant
    getTenantById: async (id) => {
        const response = await apiClient.get(`/tenants/${id}`);
        return response.data;
    },

    // Tạo tenant mới
    createTenant: async (tenantData) => {
        const response = await apiClient.post("/tenants", tenantData);
        return response.data;
    },

    // Cập nhật tenant
    updateTenant: async (id, tenantData) => {
        const response = await apiClient.patch(`/tenants/${id}`, tenantData);
        return response.data;
    },

    // Xóa tenant
    deleteTenant: async (id) => {
        const response = await apiClient.delete(`/tenants/${id}`);
        return response.data;
    },
};

export default tenantService;


