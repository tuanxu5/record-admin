import apiClient from "./axios";


const accountDirectoryService = {
    getList: async (queryParams = {}) => {
        const response = await apiClient.get("/account-directory", { params: queryParams });
        return response.data;
    },
};

export default accountDirectoryService;

