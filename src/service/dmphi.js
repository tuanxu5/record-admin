import apiClient from "./axios";

const dmphiService = {
    getList: async (queryParams = {}) => {
        const response = await apiClient.get("/dm/dmphi", { params: queryParams });
        return response.data;
    },
};

export default dmphiService;

