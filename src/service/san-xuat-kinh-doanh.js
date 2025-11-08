import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const sanXuatKinhDoanhService = {
    getData: async (body) => {
        const response = await axios.post(`${API_BASE_URL}/baocaovonbangtien/san-xuat-kinh-doanh`, body);
        return response.data;
    },
};

export default sanXuatKinhDoanhService;

