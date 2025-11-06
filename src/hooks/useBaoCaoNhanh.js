import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import dashboardService from "../service/dashboard";

export const useBaoCaoNhanh = () => {
    const capitalContributionQuery = useQuery({
        queryKey: ["baoCaoNhanh", "capitalContribution"],
        queryFn: async () => {
            try {
                const data = await dashboardService.getCapitalContribution();
                return data;
            } catch (error) {
                toast.error("Lỗi khi tải dữ liệu góp vốn của thành viên!");
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5,
    });

    const establishmentExpensesQuery = useQuery({
        queryKey: ["baoCaoNhanh", "establishmentExpenses"],
        queryFn: async () => {
            try {
                const data = await dashboardService.getEstablishmentExpenses();
                return data;
            } catch (error) {
                toast.error("Lỗi khi tải dữ liệu chi phí thành lập công ty!");
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5,
    });

    return {
        capitalContribution: capitalContributionQuery,
        establishmentExpenses: establishmentExpensesQuery,
        isLoading: capitalContributionQuery.isLoading || establishmentExpensesQuery.isLoading,
    };
};

