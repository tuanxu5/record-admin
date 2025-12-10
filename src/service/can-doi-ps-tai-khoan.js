import apiClient from "./axios";



const canDoiPsTaiKhoanService = {
    getData: async (body) => {
        const response = await apiClient.post(`/baocaovonbangtien/can-doi-ps-tk`, body);
        return response.data;
    },
};

export default canDoiPsTaiKhoanService;

