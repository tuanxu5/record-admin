import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import sanXuatKinhDoanhService from "../service/san-xuat-kinh-doanh";

const useSanXuatKinhDoanh = () => {
    return useMutation({
        mutationFn: (payload) => sanXuatKinhDoanhService.getData(payload),
        onError: (error) => {
            toast.error("Lỗi khi tải dữ liệu Kết quả hoạt động sản xuất kinh doanh!");
            console.error("Error:", error);
        },
    });
};

export default useSanXuatKinhDoanh;

