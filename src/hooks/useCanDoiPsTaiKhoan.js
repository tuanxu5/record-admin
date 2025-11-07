import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import canDoiPsTaiKhoanService from "../service/can-doi-ps-tai-khoan";

const useCanDoiPsTaiKhoan = () => {
    return useMutation({
        mutationFn: (payload) => canDoiPsTaiKhoanService.getData(payload),
        onError: (error) => {
            toast.error("Lỗi khi tải dữ liệu Cân đối PS tài khoản!");
            console.error("Error:", error);
        },
    });
};

export default useCanDoiPsTaiKhoan;

