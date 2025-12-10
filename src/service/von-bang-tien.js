import apiClient from "./axios";



const vonBangTienService = {
    getData: async (params) => {
        const query = new URLSearchParams(params).toString();
        const response = await apiClient.get(`/baocaovonbangtien/tiengui?${query}`);
        return response.data;
    }
};

export default vonBangTienService;