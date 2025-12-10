import apiClient from "./axios";


const bangCanDoiKeToanService = {
    getData: async (body) => {
        const response = await apiClient.post(`/baocaovonbangtien/can-doi-kt`, body);
        return response.data;
    },
};

export default bangCanDoiKeToanService;

