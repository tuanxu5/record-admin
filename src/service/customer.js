import apiClient from "./axios";


const customerService = {
    getList: async (queryParams = {}) => {
        const response = await apiClient.get("/category-customer", { params: queryParams });
        return response.data;
    },
};

export default customerService;

