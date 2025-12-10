import apiClient from "./axios";

const bangKeChungTuService = {
    getData: async (body) => {
        const response = await apiClient.post(`/baocaomuahang/bangke`, body);
        return response.data;
    },
};

export default bangKeChungTuService;