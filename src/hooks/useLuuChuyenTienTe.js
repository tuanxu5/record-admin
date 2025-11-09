import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import luuChuyenTienTeService from "../service/luu-chuyen-tien-te";

const useLuuChuyenTienTe = () => {
    return useMutation({
        mutationFn: (payload) => luuChuyenTienTeService.getData(payload),
        onError: (error) => {
            toast.error("Lỗi khi tải dữ liệu Lưu chuyển tiền tệ!");
            console.error("Error:", error);
        },
    });
};

export default useLuuChuyenTienTe;

