
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const vonBangTienService = {
    getData: async (params) => {
        const query = new URLSearchParams(params).toString();
        const response = await axios.get(`${API_BASE_URL}/baocaovonbangtien/tiengui?${query}`);
        return response.data;
    }
};

export default vonBangTienService;