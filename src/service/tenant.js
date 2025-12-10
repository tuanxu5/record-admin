import apiClient from "./axios";


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


