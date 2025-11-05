import { BarChart3, PieChart, Target, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import Chart from "react-apexcharts";
import PageMeta from "../../components/common/PageMeta";
import { useDashboardData } from "../../hooks/useDashboard";
import { useTranslation } from "../../hooks/useTranslation";

export default function Home() {
  const { t } = useTranslation();
  const { cashAndDeposits, revenueByTaler, expenses, kpiPlan, isLoading } = useDashboardData();

  // Chart 1: Tiền và tiền gửi (Pie Chart)
  const cashAndDepositsChartOptions = useMemo(() => {
    const data = cashAndDeposits.data || {};
    const quyTienMat = data.quyTienMat || 0;
    const tienGuiBIDV = data.tienGuiBIDV || 0;
    const tienGuiViettinbank = data.tienGuiViettinbank || 0;
    const total = quyTienMat + tienGuiBIDV + tienGuiViettinbank;

    return {
      chart: {
        type: "pie",
        height: 300,
        fontFamily: "Inter, sans-serif",
        toolbar: {
          show: true,
          tools: {
            download: true,
          },
        },
      },
      series: [quyTienMat, tienGuiBIDV, tienGuiViettinbank],
      labels: [
        t("sidebar.cashFundDetail"),
        t("sidebar.bidvDeposit"),
        t("sidebar.viettinbankDeposit"),
      ],
      colors: ["#10B981", "#3B82F6", "#F59E0B"],
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        fontSize: "14px",
        fontWeight: 500,
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
            const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : 0;
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
        formatter: function (val) {
          return val.toFixed(1) + "%";
        },
      },
      title: {
        text: "",
        align: "center",
      },
    };
  }, [cashAndDeposits.data, t]);

  const revenueByTalerChartOptions = useMemo(() => {
    const data = revenueByTaler.data || {};
    const labels = data.labels || [];

    return {
      chart: {
        type: "bar",
        height: 300,
        fontFamily: "Inter, sans-serif",
        toolbar: {
          show: true,
          tools: {
            download: true,
          },
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          borderRadius: 4,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: labels,
        title: {
          text: t("dashboard.taler"),
          style: {
            fontSize: "14px",
            fontWeight: "bold",
            color: "#374151",
          },
        },
        labels: {
          style: {
            colors: "#6B7280",
            fontSize: "12px",
          },
        },
      },
      yaxis: {
        title: {
          text: t("common.amount"),
          style: {
            fontSize: "14px",
            fontWeight: "bold",
            color: "#374151",
          },
        },
        labels: {
          style: {
            colors: "#6B7280",
            fontSize: "12px",
          },
          formatter: function (value) {
            return new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              minimumFractionDigits: 0,
              notation: "compact",
            }).format(value);
          },
        },
      },
      fill: {
        opacity: 1,
        colors: ["#465FFF"],
      },
      colors: ["#465FFF"],
      legend: {
        show: false,
      },
      tooltip: {
        theme: "light",
        style: {
          fontSize: "14px",
          fontWeight: "bold",
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
      title: {
        text: "",
        align: "center",
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
  }, [revenueByTaler.data, t]);

  const revenueByTalerSeries = useMemo(() => {
    const data = revenueByTaler.data || {};
    return [
      {
        name: t("dashboard.revenue"),
        data: data.data || [],
      },
    ];
  }, [revenueByTaler.data, t]);

  // Chart 3: Các khoản chi (Bar Chart)
  const expensesChartOptions = useMemo(() => {
    const data = expenses.data || {};
    const labels = data.labels || [];

    return {
      chart: {
        type: "bar",
        height: 300,
        fontFamily: "Inter, sans-serif",
        toolbar: {
          show: true,
          tools: {
            download: true,
          },
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          borderRadius: 4,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: labels,
        title: {
          text: t("dashboard.expenseCategories"),
          style: {
            fontSize: "14px",
            fontWeight: "bold",
            color: "#374151",
          },
        },
        labels: {
          style: {
            colors: "#6B7280",
            fontSize: "12px",
          },
          rotate: -45,
          rotateAlways: false,
        },
      },
      yaxis: {
        title: {
          text: t("common.amount"),
          style: {
            fontSize: "14px",
            fontWeight: "bold",
            color: "#374151",
          },
        },
        labels: {
          style: {
            colors: "#6B7280",
            fontSize: "12px",
          },
          formatter: function (value) {
            return new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              minimumFractionDigits: 0,
              notation: "compact",
            }).format(value);
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
          fontWeight: "bold",
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
      title: {
        text: "",
        align: "center",
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
  }, [expenses.data, t]);

  const expensesSeries = useMemo(() => {
    const data = expenses.data || {};
    return [
      {
        name: t("sidebar.costs"),
        data: data.data || [],
      },
    ];
  }, [expenses.data, t]);

  // Chart 4: Kế hoạch KPI (Progress Bars)
  const kpiData = useMemo(() => {
    return kpiPlan.data?.kpis || [];
  }, [kpiPlan.data]);

  return (
    <>
      <PageMeta
        title={t("dashboard.title")}
        description={t("dashboard.description")}
      />
      {/* Header Section */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-5 md:p-6 mb-4 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>

          <div className="relative z-5">
            <div className="flex items-center justify-center mb-3">
              <div className="bg-white bg-opacity-20 rounded-full p-2.5">
                <BarChart3 className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl md:text-2xl font-bold text-white mb-2">
              {t("dashboard.title")}
            </h1>
            <p className="text-blue-100 text-sm md:text-base max-w-2xl mx-auto">
              {t("dashboard.description")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Chart 1: Tiền và tiền gửi (Pie Chart) */}
        <div className="col-span-12 lg:col-span-6 h-[550px]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 md:p-6 border border-gray-100 dark:border-gray-700 h-full">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="bg-green-100 dark:bg-green-900 rounded-lg p-1.5">
                <PieChart className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                {t("dashboard.cashAndDeposits")}
              </h3>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Chart
                options={cashAndDepositsChartOptions}
                series={cashAndDepositsChartOptions.series}
                type="pie"
                height={400}
              />
            )}
          </div>
        </div>

        {/* Chart 2: Doanh thu theo taler (Bar Chart) */}
        <div className="col-span-12 lg:col-span-6 h-[550px]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 md:p-6 border border-gray-100 dark:border-gray-700 h-full">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-1.5">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                {t("dashboard.revenueByTaler")}
              </h3>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Chart
                options={revenueByTalerChartOptions}
                series={revenueByTalerSeries}
                type="bar"
                height={400}
              />
            )}
          </div>
        </div>

        {/* Chart 3: Các khoản chi (Bar Chart) */}
        <div className="col-span-12 lg:col-span-6 h-[550px]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 md:p-6 border border-gray-100 dark:border-gray-700 h-full">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="bg-red-100 dark:bg-red-900 rounded-lg p-1.5">
                <BarChart3 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                {t("dashboard.expenses")}
              </h3>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Chart
                options={expensesChartOptions}
                series={expensesSeries}
                type="bar"
                height={400}
              />
            )}
          </div>
        </div>

        {/* Chart 4: Kế hoạch KPI (Progress Bars) */}
        <div className="col-span-12 lg:col-span-6 h-[550px]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 md:p-6 border border-gray-100 dark:border-gray-700 h-full">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-1.5">
                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                {t("dashboard.kpiPlan")}
              </h3>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {kpiData.map((kpi, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {kpi.name}
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {kpi.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-4 rounded-full transition-all duration-500 ${kpi.percentage >= 80
                          ? "bg-green-500"
                          : kpi.percentage >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                          }`}
                        style={{ width: `${kpi.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        {typeof kpi.actual === "number" && kpi.actual > 1000
                          ? new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                            minimumFractionDigits: 0,
                            notation: "compact",
                          }).format(kpi.actual)
                          : kpi.actual}
                        {" / "}
                        {typeof kpi.target === "number" && kpi.target > 1000
                          ? new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                            minimumFractionDigits: 0,
                            notation: "compact",
                          }).format(kpi.target)
                          : kpi.target}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}