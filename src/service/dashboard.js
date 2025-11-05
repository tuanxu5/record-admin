import axios from "axios";
import vonBangTienService from "./von-bang-tien";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

// Add request interceptor to include token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const dashboardService = {
    // Sử dụng API cũ cho tiền và tiền gửi
    getCashAndDeposits: async () => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const firstDayOfYear = `${currentYear}-01-01`;
        const today = currentDate.toISOString().split('T')[0];

        // Lấy dữ liệu từ 3 API: Quỹ tiền mặt (1111), BIDV (1121), ViettinBank (1122)
        const [quyTienMat, tienGuiBIDV, tienGuiViettinbank] = await Promise.all([
            vonBangTienService.getData({
                tk: '1111',
                ngay_ct1: firstDayOfYear,
                ngay_ct2: today,
                ma_dvcs: 'CTY',
                store: 'Caso1',
                gop_tk: '1',
            }),
            vonBangTienService.getData({
                tk: '1121.1',
                ngay_ct1: firstDayOfYear,
                ngay_ct2: today,
                ma_dvcs: 'CTY',
                store: 'Caso1',
                gop_tk: '1',
            }),
            vonBangTienService.getData({
                tk: '1121.2',
                ngay_ct1: firstDayOfYear,
                ngay_ct2: today,
                ma_dvcs: 'CTY',
                store: 'Caso1',
                gop_tk: '1',
            }),
        ]);

        // Tính tổng số tồn cuối kỳ của mỗi loại
        const calculateBalance = (data) => {
            const totals = Array.isArray(data?.totals) ? data.totals : [];
            if (totals.length > 0) {
                const total = totals[0];
                // Lấy trực tiếp no_ck từ totals vì API đã tính sẵn
                return parseFloat(total.no_ck || 0);
            }
            return 0;
        };

        return {
            quyTienMat: calculateBalance(quyTienMat),
            tienGuiBIDV: calculateBalance(tienGuiBIDV),
            tienGuiViettinbank: calculateBalance(tienGuiViettinbank),
        };
    },

    // Dữ liệu tĩnh cho doanh thu theo taler
    getRevenueByTaler: async () => {
        // Dữ liệu mẫu - sẽ được thay thế bằng API thực tế sau
        return {
            labels: ["Taler 1", "Taler 2", "Taler 3", "Taler 4", "Taler 5"],
            data: [15000000, 22000000, 18000000, 25000000, 20000000],
        };
    },

    // Dữ liệu tĩnh cho các khoản chi
    getExpenses: async () => {
        // Dữ liệu mẫu - sẽ được thay thế bằng API thực tế sau
        return {
            labels: ["Chi phí lương", "Chi phí văn phòng", "Chi phí khác", "Chi phí dịch vụ", "Chi phí nguyên vật liệu"],
            data: [50000000, 15000000, 8000000, 12000000, 20000000],
        };
    },

    // Dữ liệu tĩnh cho kế hoạch KPI
    getKPIPlan: async () => {
        // Dữ liệu mẫu - sẽ được thay thế bằng API thực tế sau
        return {
            kpis: [
                { name: "Doanh thu", target: 100000000, actual: 75000000, percentage: 75 },
                { name: "Số lượng khách hàng", target: 500, actual: 380, percentage: 76 },
                { name: "Tỷ lệ hoàn thành", target: 100, actual: 85, percentage: 85 },
                { name: "Chi phí", target: 50000000, actual: 40000000, percentage: 80 },
            ],
        };
    },
};

export default dashboardService;

