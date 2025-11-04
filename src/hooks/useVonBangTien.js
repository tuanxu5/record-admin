import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import vonBangTienService from "../service/von-bang-tien";

export const useVonBangTien = (params) => {
    return useQuery({
        queryKey: ["vonBangTien", params],
        queryFn: async () => {
            try {
                const data = await vonBangTienService.getData(params);
                return data;
            } catch (error) {
                toast.error("Lỗi khi tải dữ liệu Vốn bằng tiền!");
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5,
    });
};