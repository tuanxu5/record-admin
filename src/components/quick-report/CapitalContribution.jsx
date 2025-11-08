import { TrendingUp, Users } from "lucide-react";
import { useMemo } from "react";
import Chart from "react-apexcharts";
import { useTranslation } from "../../hooks/useTranslation";
import { useTheme } from "../../hooks/useTheme";

export default function CapitalContribution({ data, isLoading }) {
    const { t, language } = useTranslation();
    const { theme } = useTheme();

    // Tổng vốn góp yêu cầu: 5 tỷ
    const REQUIRED_CAPITAL = 5000000000;

    const membersData = useMemo(() => {
        if (!data?.members) return [];

        return data.members.map((member) => {
            // Sử dụng currentAmount từ API (đã được tính từ tổng ps_co)
            const currentAmount = member.currentAmount || 0;
            const percentage = member.totalAmount > 0
                ? ((currentAmount / member.totalAmount) * 100).toFixed(2)
                : 0;

            // Chọn tên theo ngôn ngữ hiện tại
            const displayName = language === "zh" && member.nameZh 
                ? member.nameZh 
                : member.name;

            return {
                ...member,
                displayName,
                currentAmount,
                percentage: parseFloat(percentage),
            };
        });
    }, [data, language]);

    // Tính tổng thực tế đã góp
    const totalActualContribution = useMemo(() => {
        return membersData.reduce((sum, member) => sum + (member.currentAmount || 0), 0);
    }, [membersData]);

    // Tính phần trăm thực tế so với yêu cầu
    const actualPercentage = useMemo(() => {
        return REQUIRED_CAPITAL > 0 
            ? ((totalActualContribution / REQUIRED_CAPITAL) * 100).toFixed(2)
            : 0;
    }, [totalActualContribution]);

    // Tính số tiền còn thiếu
    const remainingAmount = useMemo(() => {
        return Math.max(0, REQUIRED_CAPITAL - totalActualContribution);
    }, [totalActualContribution]);

    // Chart options cho pie chart
    const pieChartOptions = useMemo(() => {
        // Đảm bảo cả 2 phần đều hiển thị, nếu remainingAmount = 0 thì đặt giá trị nhỏ nhất
        const actualValue = totalActualContribution > 0 ? totalActualContribution : 0.01;
        const remainingValue = remainingAmount > 0 ? remainingAmount : 0.01;
        
        return {
            chart: {
                type: "pie",
                height: 350,
                fontFamily: "Outfit, sans-serif",
                toolbar: {
                    show: false,
                },
                offsetX: 0,
                offsetY: 0,
            },
            series: [actualValue, remainingValue],
            labels: [
                t("quickReport.currentContribution"),
                t("quickReport.remainingContribution") || "Còn thiếu"
            ],
            colors: ["#10B981", "#EF4444"],
            legend: {
                position: "bottom",
                horizontalAlign: "center",
                fontSize: "12px",
                fontWeight: 500,
                itemMargin: {
                    horizontal: 8,
                    vertical: 4,
                },
                labels: {
                    colors: theme === "dark" ? "#E5E7EB" : "#6B7280",
                },
            },
            tooltip: {
                theme: theme === "dark" ? "dark" : "light",
                y: {
                    formatter: function (value) {
                        const percentage = REQUIRED_CAPITAL > 0 
                            ? ((value / REQUIRED_CAPITAL) * 100).toFixed(2)
                            : 0;
                        return new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                            minimumFractionDigits: 0,
                        }).format(value) + ` (${percentage}%)`;
                    },
                },
            },
            dataLabels: {
                enabled: true,
                offsetY: -5,
                formatter: function (val, opts) {
                    const seriesIndex = opts.seriesIndex;
                    // Lấy giá trị thực tế (không phải giá trị đã điều chỉnh)
                    const actualValue = seriesIndex === 0 ? totalActualContribution : remainingAmount;
                    
                    // Nếu giá trị thực tế = 0, không hiển thị label
                    if (actualValue <= 0) {
                        return "";
                    }
                    
                    const percentage = REQUIRED_CAPITAL > 0 
                        ? ((actualValue / REQUIRED_CAPITAL) * 100).toFixed(2)
                        : 0;
                    const formattedValue = new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                        minimumFractionDigits: 0,
                        notation: "compact",
                    }).format(actualValue);
                    return `${formattedValue}\n${percentage}%`;
                },
                style: {
                    fontSize: "12px",
                    fontWeight: 700,
                    colors: ["#fff", "#fff"],
                },
                dropShadow: {
                    enabled: true,
                    color: "#000",
                    top: 1,
                    left: 1,
                    blur: 1,
                    opacity: 0.5,
                },
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: "0%",
                    },
                    expandOnClick: false,
                    offsetX: 0,
                    offsetY: 0,
                    dataLabels: {
                        offset: -30,
                    },
                },
            },
            fill: {
                opacity: 1,
            },
        };
    }, [totalActualContribution, remainingAmount, REQUIRED_CAPITAL, t, theme]);

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 md:p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-1.5">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                        {t("quickReport.capitalContribution")}
                    </h3>
                </div>
            </div>

            {/* Tổng hợp vốn góp - Pie Chart */}
            <div className="mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Tổng số vốn góp theo yêu cầu */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {t("quickReport.requiredCapital") || "Tổng số vốn góp theo yêu cầu"}
                        </div>
                        <div className="text-lg font-bold text-gray-800 dark:text-white">
                            {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                                minimumFractionDigits: 0,
                            }).format(REQUIRED_CAPITAL)}
                        </div>
                    </div>

                    {/* Tổng thực tế đã góp */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {t("quickReport.totalActualContribution") || "Tổng thực tế đã góp"}
                        </div>
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                                minimumFractionDigits: 0,
                            }).format(totalActualContribution)}
                        </div>
                        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">
                            {actualPercentage}%
                        </div>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2 md:p-4 overflow-hidden">
                    <div className="w-full flex justify-center">
                        <div className="w-full max-w-full" style={{ maxWidth: "100%" }}>
                            <Chart
                                options={pieChartOptions}
                                series={pieChartOptions.series}
                                type="pie"
                                height={350}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Chi tiết các thành viên */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    {t("quickReport.memberDetails") || "Chi tiết các thành viên"}
                </h4>
                <div className="space-y-6">
                {membersData.map((member, index) => (
                    <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {t("quickReport.member")} {index + 1} : {member.displayName || member.name}
                            </h4>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                    {member.percentage}%
                                </span>
                            </div>
                        </div>

                        {/* Gentech 2 Cột Format */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Cột 1: Tổng số tiền góp 100% */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    {t("quickReport.totalContribution")} (100%)
                                </div>
                                <div className="text-lg font-bold text-gray-800 dark:text-white">
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                        minimumFractionDigits: 0,
                                    }).format(member.totalAmount)}
                                </div>
                            </div>

                            {/* Cột 2: Số tiền góp hiện tại của các lần */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    {t("quickReport.currentContribution")}
                                </div>
                                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                        minimumFractionDigits: 0,
                                    }).format(member.currentAmount)}
                                </div>
                            </div>
                        </div>

                        {/* Chi tiết các lần góp vốn */}
                        {member.contributions && member.contributions.length > 0 && (
                            <div className="mt-3 space-y-2">
                                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                    {t("quickReport.contributionDetails")}:
                                </div>
                                <div className="space-y-1">
                                    {member.contributions.map((contrib, contribIndex) => (
                                        <div
                                            key={contribIndex}
                                            className="flex flex-col gap-1 text-xs bg-gray-50 dark:bg-gray-700/30 rounded px-3 py-2"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {contrib.date
                                                        ? new Date(contrib.date).toLocaleDateString(
                                                            language === "zh" ? "zh-CN" : "vi-VN"
                                                        )
                                                        : language === "zh"
                                                            ? `第 ${contribIndex + 1} 次`
                                                            : `Lần ${contribIndex + 1}`}
                                                </span>
                                                <span className="font-semibold text-gray-800 dark:text-white">
                                                    {new Intl.NumberFormat("vi-VN", {
                                                        style: "currency",
                                                        currency: "VND",
                                                        minimumFractionDigits: 0,
                                                    }).format(contrib.amount)}
                                                </span>
                                            </div>
                                            {contrib.dien_giai && (
                                                <div className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                                    {contrib.dien_giai}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Progress bar */}
                        <div className="mt-2">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div
                                    className={`h-2 rounded-full transition-all duration-500 ${member.percentage >= 100
                                        ? "bg-green-500"
                                        : member.percentage >= 50
                                            ? "bg-blue-500"
                                            : "bg-yellow-500"
                                        }`}
                                    style={{ width: `${Math.min(member.percentage, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {index < membersData.length - 1 && (
                            <div className="border-t border-gray-200 dark:border-gray-700 mt-4"></div>
                        )}
                    </div>
                ))}

                {membersData.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        {t("common.noData")}
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}

