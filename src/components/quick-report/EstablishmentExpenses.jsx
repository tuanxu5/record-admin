import { useMemo } from "react";
import { FileText, DollarSign } from "lucide-react";
import Chart from "react-apexcharts";
import { useTranslation } from "../../hooks/useTranslation";

export default function EstablishmentExpenses({ data, isLoading }) {
    const { t } = useTranslation();

    const chartOptions = useMemo(() => {
        if (!data?.categories) return null;

        const categories = data.categories || [];
        const labels = categories.map((cat) => cat.name);
        const amounts = categories.map((cat) => cat.amount || 0);

        return {
            chart: {
                type: "bar",
                height: 300,
                fontFamily: "Outfit, sans-serif",
                toolbar: {
                    show: true,
                    tools: {
                        download: true,
                    },
                },
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    borderRadius: 4,
                    dataLabels: {
                        position: "top",
                    },
                },
            },
            dataLabels: {
                enabled: true,
                formatter: function (val) {
                    return new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                        minimumFractionDigits: 0,
                        notation: "compact",
                    }).format(val);
                },
                style: {
                    fontSize: "11px",
                    fontWeight: 600,
                    colors: ["#374151"],
                },
            },
            xaxis: {
                categories: labels,
                labels: {
                    style: {
                        colors: "#6B7280",
                        fontSize: "11px",
                    },
                },
            },
            yaxis: {
                labels: {
                    style: {
                        colors: "#6B7280",
                        fontSize: "11px",
                    },
                },
            },
            fill: {
                opacity: 1,
                colors: ["#EF4444"],
            },
            colors: ["#EF4444"],
            legend: {
                show: false,
            },
            tooltip: {
                theme: "light",
                style: {
                    fontSize: "14px",
                },
                fillSeriesColor: false,
                marker: {
                    show: true,
                },
                y: {
                    formatter: function (value) {
                        return new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                            minimumFractionDigits: 0,
                        }).format(value);
                    },
                },
            },
            grid: {
                borderColor: "#E5E7EB",
                strokeDashArray: 3,
                xaxis: {
                    lines: {
                        show: true,
                    },
                },
                yaxis: {
                    lines: {
                        show: true,
                    },
                },
            },
        };
    }, [data]);

    const chartSeries = useMemo(() => {
        if (!data?.categories) return [{ name: "", data: [] }];
        return [
            {
                name: t("quickReport.expenses"),
                data: data.categories.map((cat) => cat.amount || 0),
            },
        ];
    }, [data, t]);

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
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="bg-red-100 dark:bg-red-900 rounded-lg p-1.5">
                    <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                    {t("quickReport.establishmentExpenses")}
                </h3>
            </div>

            {data?.categories && data.categories.length > 0 ? (
                <>
                    {/* Biểu đồ */}
                    {chartOptions && (
                        <div className="mb-6">
                            <Chart
                                options={chartOptions}
                                series={chartSeries}
                                type="bar"
                                height={300}
                            />
                        </div>
                    )}

                    {/* Bảng chi tiết */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">
                                        {t("quickReport.expenseCategory")}
                                    </th>
                                    <th className="text-right py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">
                                        {t("common.amount")}
                                    </th>
                                    <th className="text-right py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">
                                        {t("quickReport.percentage")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.categories.map((category, index) => {
                                    const percentage =
                                        data.total > 0
                                            ? ((category.amount / data.total) * 100).toFixed(2)
                                            : 0;
                                    return (
                                        <tr
                                            key={index}
                                            className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <td className="py-3 px-2 text-gray-800 dark:text-gray-200">
                                                {category.name}
                                            </td>
                                            <td className="py-3 px-2 text-right font-semibold text-gray-800 dark:text-white">
                                                {new Intl.NumberFormat("vi-VN", {
                                                    style: "currency",
                                                    currency: "VND",
                                                    minimumFractionDigits: 0,
                                                }).format(category.amount)}
                                            </td>
                                            <td className="py-3 px-2 text-right text-gray-600 dark:text-gray-400">
                                                {percentage}%
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-50 dark:bg-gray-700/50 font-bold">
                                    <td className="py-4 px-2 text-gray-800 dark:text-white">
                                        {t("dashboard.total")}
                                    </td>
                                    <td className="py-4 px-2 text-right text-red-600 dark:text-red-400">
                                        {new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                            minimumFractionDigits: 0,
                                        }).format(data.total || 0)}
                                    </td>
                                    <td className="py-4 px-2 text-right text-red-600 dark:text-red-400">
                                        100%
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Tổng hợp */}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-red-600 dark:text-red-400" />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {t("quickReport.totalEstablishmentExpenses")}:
                                </span>
                            </div>
                            <span className="text-lg font-bold text-red-600 dark:text-red-400">
                                {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                    minimumFractionDigits: 0,
                                }).format(data.total || 0)}
                            </span>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {t("common.noData")}
                </div>
            )}
        </div>
    );
}

