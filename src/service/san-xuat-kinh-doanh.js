import apiClient from "./axios";

const sanXuatKinhDoanhService = {
    getData: async (body) => {
        const response = await apiClient.post(`/baocaovonbangtien/san-xuat-kinh-doanh`, body);
        return response.data;
    },
};

export default sanXuatKinhDoanhService;

