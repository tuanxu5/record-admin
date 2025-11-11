import axios from "axios";
import bangKeChungTuService from "./bang-ke-chung-tu";
import keHoachService from "./keHoach";
import vonBangTienService from "./von-bang-tien";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
});
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const dashboardService = {
    getCashAndDeposits: async () => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const firstDayOfYear = `${currentYear}-${currentMonth}-01`;
        const today = currentDate.toISOString().split('T')[0];
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
        const calculateBalance = (data) => {
            const totals = Array.isArray(data?.totals) ? data.totals : [];
            if (totals.length > 0) {
                const total = totals[0];
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
    getRevenueByTaler: async () => {
        return {
            labels: ["Taler 1", "Taler 2", "Taler 3", "Taler 4", "Taler 5"],
            data: [15000000, 22000000, 18000000, 25000000, 20000000],
        };
    },
    getRevenueKPIExpenses: async () => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const firstDayOfMonth = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
        const today = currentDate.toISOString().split('T')[0];
        try {
            const revenueData = await bangKeChungTuService.getData({
                configName: "bang_ke_chung_tu",
                ngay_ct1: firstDayOfMonth,
                ngay_ct2: today,
                ma_tai_khoan: "511",
                ma_dvcs: "",
            });
            const expenseData = await bangKeChungTuService.getData({
                configName: "bang_ke_chung_tu",
                ngay_ct1: firstDayOfMonth,
                ngay_ct2: today,
                ma_tai_khoan: "642",
                ma_dvcs: "",
            });
            const kpiData = await keHoachService.getList();
            const currentMonthKey = `${String(currentMonth).padStart(2, "0")}/${currentYear}`;
            const groupByMonth = (data, field) => {
                const grouped = {};
                const rawData = Array.isArray(data) ? data : (data?.data || data?.rows || []);
                rawData.forEach((item) => {
                    const ngayCt = item.ngay_ct || item.ngay_ct_tu || "";
                    if (!ngayCt) return;
                    let date;
                    try {
                        if (typeof ngayCt === 'string') {
                            date = new Date(ngayCt);
                            if (isNaN(date.getTime())) {
                                const parts = ngayCt.split('/');
                                if (parts.length === 3) {
                                    date = new Date(parts[2], parts[1] - 1, parts[0]);
                                } else {
                                    return;
                                }
                            }
                        } else {
                            date = new Date(ngayCt);
                        }
                    } catch {
                        return;
                    }
                    if (isNaN(date.getTime())) return;
                    const month = date.getMonth() + 1;
                    const year = date.getFullYear();
                    const key = `${String(month).padStart(2, "0")}/${year}`;
                    if (key !== currentMonthKey) return;
                    if (!grouped[key]) {
                        grouped[key] = 0;
                    }
                    let value = 0;
                    if (field === "ps_co") {
                        value = parseFloat(item.ps_co || item.co_ps || 0);
                    } else if (field === "ps_no") {
                        value = parseFloat(item.ps_no || item.no_ps || 0);
                    } else {
                        value = parseFloat(item[field] || 0);
                    }
                    grouped[key] += value;
                });

                return {
                    labels: Object.keys(grouped),
                    data: Object.values(grouped),
                };
            };
            const groupKPIBymonth = (data) => {
                const grouped = {};
                const rawData = Array.isArray(data) ? data : (data?.data || []);
                rawData.forEach((item) => {
                    // Sử dụng thangdk và nam thay vì ngay
                    const thangdk = item.thangdk;
                    const nam = item.nam;

                    if (!thangdk || !nam) return;

                    // Tạo key từ thangdk và nam: "MM/YYYY"
                    const key = `${String(thangdk).padStart(2, "0")}/${nam}`;

                    if (!grouped[key]) {
                        grouped[key] = 0;
                    }

                    // Parse KPI - có thể là string với định dạng "5,000,000.00"
                    let kpiValue = 0;
                    if (item.kpi) {
                        if (typeof item.kpi === 'string') {
                            // Loại bỏ dấu phẩy và khoảng trắng, sau đó parse
                            kpiValue = parseFloat(item.kpi.replace(/,/g, '').trim()) || 0;
                        } else {
                            kpiValue = parseFloat(item.kpi) || 0;
                        }
                    }

                    grouped[key] += kpiValue;
                });
                return {
                    labels: Object.keys(grouped).sort(),
                    data: Object.values(grouped),
                };
            };
            const revenueGrouped = groupByMonth(revenueData, "ps_co");
            const expenseGrouped = groupByMonth(expenseData, "ps_no");
            const kpiGrouped = groupKPIBymonth(kpiData);

            // Lấy tất cả các tháng từ KPI data để hiển thị
            // Nếu không có KPI data, dùng tháng hiện tại
            const allMonths = kpiGrouped.labels.length > 0
                ? kpiGrouped.labels
                : [currentMonthKey];

            // Đảm bảo có đủ các tháng từ revenue và expense
            const allLabelsSet = new Set([
                ...revenueGrouped.labels,
                ...expenseGrouped.labels,
                ...allMonths
            ]);
            const labels = Array.from(allLabelsSet).sort();

            const revenue = labels.map(month => {
                const index = revenueGrouped.labels.indexOf(month);
                return index >= 0 ? revenueGrouped.data[index] : 0;
            });
            const expenses = labels.map(month => {
                const index = expenseGrouped.labels.indexOf(month);
                return index >= 0 ? expenseGrouped.data[index] : 0;
            });
            const kpi = labels.map(month => {
                const index = kpiGrouped.labels.indexOf(month);
                return index >= 0 ? kpiGrouped.data[index] : 0;
            });

            return {
                labels,
                revenue,
                kpi,
                expenses,
            };
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu Revenue/KPI/Expenses:", error);
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            const currentYear = currentDate.getFullYear();
            const currentMonthKey = `${String(currentMonth).padStart(2, "0")}/${currentYear}`;
            return {
                labels: [currentMonthKey],
                revenue: [0],
                kpi: [0],
                expenses: [0],
            };
        }
    },

    getExpenses: async () => {
        return {
            labels: ["Chi phí lương", "Chi phí văn phòng", "Chi phí khác", "Chi phí dịch vụ", "Chi phí nguyên vật liệu"],
            data: [50000000, 15000000, 8000000, 12000000, 20000000],
        };
    },

    getTopCustomersByRevenue: async () => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const firstDayOfMonth = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
        const today = currentDate.toISOString().split('T')[0];
        const currentMonthKey = `${String(currentMonth).padStart(2, "0")}/${currentYear}`;
        try {
            const revenueData = await bangKeChungTuService.getData({
                configName: "bang_ke_chung_tu",
                ngay_ct1: firstDayOfMonth,
                ngay_ct2: today,
                ma_tai_khoan: "511",
                ma_dvcs: "",
            });
            const rawData = Array.isArray(revenueData) ? revenueData : (revenueData?.data || revenueData?.rows || []);
            const customersMap = {};
            rawData.forEach((item) => {
                const ngayCt = item.ngay_ct || item.ngay_ct_tu || "";
                if (!ngayCt) {
                    return;
                }
                let date;
                try {
                    if (typeof ngayCt === 'string') {
                        date = new Date(ngayCt);
                        if (isNaN(date.getTime())) {
                            const parts = ngayCt.split('/');
                            if (parts.length === 3) {
                                date = new Date(parts[2], parts[1] - 1, parts[0]);
                            } else {
                                return;
                            }
                        }
                    } else {
                        date = new Date(ngayCt);
                    }
                } catch {
                    return;
                }

                if (isNaN(date.getTime())) {
                    return;
                }

                // Chỉ lấy dữ liệu của tháng hiện tại
                const month = date.getMonth() + 1;
                const year = date.getFullYear();
                const key = `${String(month).padStart(2, "0")}/${year}`;
                if (key !== currentMonthKey) {
                    return;
                }

                // Tìm field chứa mã khách hàng và tên khách hàng
                const maKh = item.ma_kh || item.ma_khach_hang || item.ma_khach || item.ma_kh_old || "";
                const tenKh = item.ten_kh || item.ten_khach_hang || item.ten_khach || item.ten_kh_old || maKh || "Khách hàng chưa có tên";

                if (!maKh && !tenKh) {
                    console.log("Missing customer info:", item);
                    return;
                }

                const customerKey = maKh || tenKh;

                if (!customersMap[customerKey]) {
                    customersMap[customerKey] = {
                        maKh: maKh,
                        tenKh: tenKh,
                        totalRevenue: 0,
                    };
                }
                const psCo = parseFloat(item.ps_co || item.co_ps || item.ps_co_kh || item.ps_co_nt || item.so_tien || 0);

                if (psCo > 0) {
                    customersMap[customerKey].totalRevenue += psCo;
                }
            });
            const kpiData = await keHoachService.getList();
            const kpiList = Array.isArray(kpiData) ? kpiData : (kpiData?.data || []);
            const kpiMap = {};
            kpiList.forEach((item) => {
                if (item.ma_kh && item.thangdk && item.nam) {
                    const normalizedMaKh = String(item.ma_kh).trim().toUpperCase();
                    const kpiKey = `${normalizedMaKh}_${item.thangdk}_${item.nam}`;
                    if (!kpiMap[kpiKey]) {
                        kpiMap[kpiKey] = 0;
                    }
                    // Parse KPI - có thể là string với định dạng "5,000,000.00"
                    let kpiValue = 0;
                    if (item.kpi) {
                        if (typeof item.kpi === 'string') {
                            kpiValue = parseFloat(item.kpi.replace(/,/g, '').trim()) || 0;
                        } else {
                            kpiValue = parseFloat(item.kpi) || 0;
                        }
                    }
                    kpiMap[kpiKey] += kpiValue;
                }
            });

            console.log("KPI Map:", kpiMap);

            // Tính tỉ lệ hoàn thành KPI cho mỗi khách hàng
            const customersArray = Object.values(customersMap).filter(customer => customer.totalRevenue > 0);
            customersArray.forEach((customer) => {
                // Normalize maKh để so sánh
                const normalizedMaKh = customer.maKh ? String(customer.maKh).trim().toUpperCase() : '';
                const kpiKey = `${normalizedMaKh}_${currentMonth}_${currentYear}`;
                const kpiTarget = kpiMap[kpiKey] || 0;
                customer.kpiTarget = kpiTarget;
                customer.kpiCompletionRate = kpiTarget > 0
                    ? Math.round((customer.totalRevenue / kpiTarget) * 100)
                    : null;

                console.log(`Customer ${customer.tenKh || customer.maKh}: maKh="${customer.maKh}", normalized="${normalizedMaKh}", kpiKey="${kpiKey}", kpiTarget=${kpiTarget}, rate=${customer.kpiCompletionRate}`);
            });

            const sortedByRevenue = [...customersArray].sort((a, b) => b.totalRevenue - a.totalRevenue);
            const top5Highest = sortedByRevenue.slice(0, 5).map((customer, index) => ({
                rank: index + 1,
                maKh: customer.maKh,
                tenKh: customer.tenKh,
                totalRevenue: customer.totalRevenue,
                kpiTarget: customer.kpiTarget,
                kpiCompletionRate: customer.kpiCompletionRate,
            }));

            const sortedByRevenueAsc = [...customersArray].sort((a, b) => a.totalRevenue - b.totalRevenue);

            const top5Lowest = sortedByRevenueAsc.slice(0, 5).map((customer, index) => ({
                rank: index + 1,
                maKh: customer.maKh,
                tenKh: customer.tenKh,
                totalRevenue: customer.totalRevenue,
                kpiTarget: customer.kpiTarget,
                kpiCompletionRate: customer.kpiCompletionRate,
            }));

            console.log("Top 5 highest:", top5Highest);
            console.log("Top 5 lowest:", top5Lowest);

            return {
                top5Highest,
                top5Lowest,
            };
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu top khách hàng:", error);
            return {
                top5Highest: [],
                top5Lowest: [],
            };
        }
    },

    getCapitalContribution: async () => {
        // Định nghĩa 3 thành viên
        const members = [

            {
                name: "Công ty cổ phần công nghệ Gentech",
                nameZh: "Gentech 科技股份公司",
                ma_kh: "GENTECH",
                totalAmount: 3277000000,
            },
            {
                name: "Bùi Lương Hiệp",
                nameZh: "裴良协",
                ma_kh: "HIEPGV",
                totalAmount: 1673000000,
            },
            {
                name: "Nguyễn Đăng Dương",
                nameZh: "阮登阳",
                ma_kh: "DUONGND",
                totalAmount: 50000000,
            },
        ];
        const currentDate = new Date();
        const startDate = "2025-01-01";
        const formatDateLocal = (date) => {
            if (!date) return "";
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };

        const today = formatDateLocal(currentDate);
        const membersData = await Promise.all(
            members.map(async (member) => {
                try {
                    const response = await bangKeChungTuService.getData({
                        configName: "bang_ke_chung_tu",
                        ngay_ct1: startDate, 
                        ngay_ct2: today, 
                        ma_tai_khoan: "411",
                        ma_kh: member.ma_kh, 
                        ma_dvcs: "",
                    });
                    let rawData = Array.isArray(response)
                        ? response
                        : response?.data || response?.rows || [];
                    const memberMaKhTrimmed = member.ma_kh.trim();
                    rawData = rawData.filter((item) => {
                        const itemMaKh = (item.ma_kh || "").trim();
                        return itemMaKh === memberMaKhTrimmed;
                    });
                    const totalContribution = rawData.reduce((sum, item) => {
                        return sum + parseFloat(item.ps_co || 0);
                    }, 0);
                    const contributions = rawData
                        .filter((item) => parseFloat(item.ps_co || 0) > 0)
                        .map((item) => ({
                            date: item.ngay_ct || item.ngay_ct_tu || "",
                            amount: parseFloat(item.ps_co || 0),
                            so_ct: item.so_ct || "",
                            dien_giai: item.dien_giai || "",
                            ngay_ct: item.ngay_ct || item.ngay_ct_tu || "",
                        }))
                        .sort((a, b) => {
                            const dateA = new Date(a.date);
                            const dateB = new Date(b.date);
                            return dateA - dateB;
                        });

                    return {
                        ...member,
                        currentAmount: totalContribution,
                        contributions: contributions,
                    };
                } catch (error) {
                    console.error(`Lỗi khi lấy dữ liệu góp vốn cho ${member.name}:`, error);
                    return {
                        ...member,
                        currentAmount: 0,
                        contributions: [],
                    };
                }
            })
        );

        return {
            members: membersData,
        };
    },

    getEstablishmentExpenses: async () => {
        return {
            categories: [
                { name: "Chi phí đăng ký kinh doanh", amount: 5000000 },
                { name: "Chi phí con dấu và giấy phép", amount: 3000000 },
                { name: "Chi phí thiết kế và xây dựng", amount: 50000000 },
                { name: "Chi phí trang thiết bị văn phòng", amount: 25000000 },
                { name: "Chi phí marketing ban đầu", amount: 15000000 },
                { name: "Chi phí tư vấn pháp lý", amount: 10000000 },
                { name: "Chi phí khác", amount: 7000000 },
            ],
            total: 111000000,
        };
    },
};

export default dashboardService;

