import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import dashboardService from "../service/dashboard";

export const useDashboardData = () => {
    const cashAndDepositsQuery = useQuery({
        queryKey: ["dashboard", "cashAndDeposits"],
        queryFn: async () => {
            try {
                const data = await dashboardService.getCashAndDeposits();
                return data;
            } catch (error) {
                toast.error("Lỗi khi tải dữ liệu tiền và tiền gửi!");
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5,
    });

    const revenueByTalerQuery = useQuery({
        queryKey: ["dashboard", "revenueByTaler"],
        queryFn: async () => {
            try {
                const data = await dashboardService.getRevenueByTaler();
                return data;
            } catch (error) {
                toast.error("Lỗi khi tải dữ liệu doanh thu theo taler!");
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5,
    });

    const expensesQuery = useQuery({
        queryKey: ["dashboard", "expenses"],
        queryFn: async () => {
            try {
                const data = await dashboardService.getExpenses();
                return data;
            } catch (error) {
                toast.error("Lỗi khi tải dữ liệu các khoản chi!");
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5,
    });

    const kpiPlanQuery = useQuery({
        queryKey: ["dashboard", "kpiPlan"],
        queryFn: async () => {
            try {
                const data = await dashboardService.getKPIPlan();
                return data;
            } catch (error) {
                toast.error("Lỗi khi tải dữ liệu kế hoạch KPI!");
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5,
    });

    return {
        cashAndDeposits: cashAndDepositsQuery,
        revenueByTaler: revenueByTalerQuery,
        expenses: expensesQuery,
        kpiPlan: kpiPlanQuery,
        isLoading: cashAndDepositsQuery.isLoading || revenueByTalerQuery.isLoading || expensesQuery.isLoading || kpiPlanQuery.isLoading,
    };
};

