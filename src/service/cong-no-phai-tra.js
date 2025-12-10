import apiClient from "./axios";

const congNoPhaiTraService = {
    getData: async (body) => {
        const response = await apiClient.post(`/baocaomuahang/muahang`, body);
        return response.data;
    },
};

export default congNoPhaiTraService;

