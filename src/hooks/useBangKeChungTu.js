import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import bangKeChungTuService from "../service/bang-ke-chung-tu";

const useBangKeChungTu = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => bangKeChungTuService.getData(payload),
        onSuccess: () => {
            queryClient.invalidateQueries(["baocaoKho"]);
        },
        onError: () => {
            toast.error("Có lỗi khi gửi báo cáo!");
        },
    });
}
export default useBangKeChungTu;