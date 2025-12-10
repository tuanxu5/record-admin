import apiClient from "./axios";


const luuChuyenTienTeService = {
    getData: async (body) => {
        const response = await apiClient.post(`/baocaovonbangtien/luu-chuyen-tien-te`, body);
        return response.data;
    },
};

export default luuChuyenTienTeService;

