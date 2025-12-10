import apiClient from "./axios";


const keHoachService = {
    getList: async () => {
        const response = await apiClient.get("/ke-hoach/list");
        return response.data;
    },

    getOne: async (id) => {
        const response = await apiClient.get(`/ke-hoach/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await apiClient.post("/ke-hoach/add", data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await apiClient.put(`/ke-hoach/update/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/ke-hoach/delete/${id}`);
        return response.data;
    },

    importExcel: async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await apiClient.post("/ke-hoach/import", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
};

export default keHoachService;

