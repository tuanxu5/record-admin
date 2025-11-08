import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import bangCanDoiKeToanService from "../service/bang-can-doi-ke-toan";

const useBangCanDoiKeToan = () => {
    return useMutation({
        mutationFn: (payload) => bangCanDoiKeToanService.getData(payload),
        onError: (error) => {
            toast.error("Lỗi khi tải dữ liệu Bảng cân đối kế toán!");
            console.error("Error:", error);
        },
    });
};

export default useBangCanDoiKeToan;

