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

    const revenueKPIExpensesQuery = useQuery({
        queryKey: ["dashboard", "revenueKPIExpenses"],
        queryFn: async () => {
            try {
                const data = await dashboardService.getRevenueKPIExpenses();
                return data;
            } catch (error) {
                toast.error("Lỗi khi tải dữ liệu doanh thu/KPI/chi phí!");
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
                const data = await dashboardService.getRevenueKPIExpenses();
                return data;
            } catch (error) {
                toast.error("Lỗi khi tải dữ liệu kế hoạch KPI!");
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5,
    });

    const topCustomersQuery = useQuery({
        queryKey: ["dashboard", "topCustomers"],
        queryFn: async () => {
            try {
                console.log("Fetching top customers data...");
                const data = await dashboardService.getTopCustomersByRevenue();
                console.log("Top customers data received:", data);
                return data;
            } catch (error) {
                console.error("Error fetching top customers:", error);
                toast.error("Lỗi khi tải dữ liệu top khách hàng!");
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5,
    });

    return {
        cashAndDeposits: cashAndDepositsQuery,
        revenueByTaler: revenueByTalerQuery,
        revenueKPIExpenses: revenueKPIExpensesQuery,
        expenses: expensesQuery,
        kpiPlan: kpiPlanQuery,
        topCustomers: topCustomersQuery,
        isLoading: cashAndDepositsQuery.isLoading || revenueByTalerQuery.isLoading || revenueKPIExpensesQuery.isLoading || expensesQuery.isLoading || kpiPlanQuery.isLoading || topCustomersQuery.isLoading,
    };
};

