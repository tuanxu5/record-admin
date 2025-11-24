import { ArrowDown, ArrowUp, BarChart3, PieChart, TrendingUp, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import PageMeta from "../../components/common/PageMeta";
import { useDashboardData } from "../../hooks/useDashboard";
import { useTranslation } from "../../hooks/useTranslation";
import { useTheme } from "../../hooks/useTheme";

export default function Home() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { cashAndDeposits, revenueKPIExpenses, expenses, topCustomers, accountsPayable, isLoading } = useDashboardData();
  const isTopCustomersLoading = topCustomers.isLoading;
  const topCustomersError = topCustomers.error;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Chart options cho Top 5 cao nhất
  const top5HighestChartOptions = useMemo(() => {
    const top5Highest = topCustomers.data?.top5Highest || [];
    const labels = top5Highest.map((c) => c.tenKh || c.maKh || `KH #${c.rank}`).reverse();

    return {
      chart: {
        type: "bar",
        height: 220,
        fontFamily: "Outfit, sans-serif",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "60%",
          borderRadius: 8,
          borderRadiusApplication: "end",
          dataLabels: {
            position: "top",
          },
        },
      },
      colors: ["#10b981"],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.5,
          gradientToColors: ['#059669'],
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.8,
          stops: [0, 100]
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          if (val === 0) return "";
          return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
            notation: "compact",
          }).format(val);
        },
        style: {
          fontSize: "10px",
          fontWeight: 600,
          colors: ["#fff"],
        },
      },
      xaxis: {
        categories: labels,
        labels: {
          style: {
            fontSize: "10px",
            colors: [theme === "dark" ? "#9CA3AF" : "#6b7280"],
          },
          rotate: -45,
          rotateAlways: false,
          trim: false,
        },
      },
      yaxis: {
        labels: {
          style: {
            fontSize: "10px",
            colors: theme === "dark" ? "#9CA3AF" : "#6b7280",
          },
          formatter: function (val) {
            return new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              minimumFractionDigits: 0,
              notation: "compact",
            }).format(val);
          },
        },
      },
      tooltip: {
        custom: function({ series, seriesIndex, dataPointIndex }) {
          const top5Highest = topCustomers.data?.top5Highest || [];
          const labels = top5Highest.map((c) => c.tenKh || c.maKh || `KH #${c.rank}`).reverse();
          const customerName = labels[dataPointIndex] || '';
          const value = series[seriesIndex][dataPointIndex];
          const formattedValue = new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
          }).format(value);
          return `<div class="apexcharts-tooltip-title" style="font-family: Outfit, sans-serif; font-size: 12px;"></div>
                  <div class="apexcharts-tooltip-series-group apexcharts-active" style="order: 1; display: flex;">
                    <span class="apexcharts-tooltip-marker" style="background-color: #10b981;"></span>
                    <div class="apexcharts-tooltip-text" style="font-family: Outfit, sans-serif; font-size: 12px;">
                      <div class="apexcharts-tooltip-y-group">
                        <span class="apexcharts-tooltip-text-y-label">${customerName}: </span>
                        <span class="apexcharts-tooltip-text-y-value">${formattedValue}</span>
                      </div>
                    </div>
                  </div>`;
        },
      },
      grid: {
        borderColor: theme === "dark" ? "#374151" : "#E5E7EB",
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
      legend: {
        show: false,
      },
    };
  }, [topCustomers.data, theme]);

  const top5HighestChartSeries = useMemo(() => {
    const top5Highest = topCustomers.data?.top5Highest || [];
    const data = top5Highest.map((c) => c.totalRevenue || 0).reverse();
    return [
      {
        name: t("dashboard.top5Highest"),
        data: data,
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'light',
            type: 'vertical',
            shadeIntensity: 0.5,
            gradientToColors: ['#059669'],
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 0.8,
            stops: [0, 100]
          }
        }
      },
    ];
  }, [topCustomers.data, t]);

  // Chart options cho Top 5 thấp nhất
  const top5LowestChartOptions = useMemo(() => {
    const top5Lowest = topCustomers.data?.top5Lowest || [];
    const labels = top5Lowest.map((c) => c.tenKh || c.maKh || `KH #${c.rank}`);

    return {
      chart: {
        type: "bar",
        height: 220,
        fontFamily: "Outfit, sans-serif",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "60%",
          borderRadius: 8,
          borderRadiusApplication: "end",
          dataLabels: {
            position: "top",
          },
        },
      },
      colors: ["#ef4444"],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.5,
          gradientToColors: ['#dc2626'],
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.8,
          stops: [0, 100]
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          if (val === 0) return "";
          return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
            notation: "compact",
          }).format(val);
        },
        style: {
          fontSize: "10px",
          fontWeight: 600,
          colors: ["#fff"],
        },
      },
      xaxis: {
        categories: labels,
        labels: {
          style: {
            fontSize: "10px",
            colors: [theme === "dark" ? "#9CA3AF" : "#6b7280"],
          },
          rotate: -45,
          rotateAlways: false,
          trim: false,
        },
      },
      yaxis: {
        labels: {
          style: {
            fontSize: "10px",
            colors: theme === "dark" ? "#9CA3AF" : "#6b7280",
          },
          formatter: function (val) {
            return new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              minimumFractionDigits: 0,
              notation: "compact",
            }).format(val);
          },
        },
      },
      tooltip: {
        custom: function({ series, seriesIndex, dataPointIndex }) {
          const top5Lowest = topCustomers.data?.top5Lowest || [];
          const labels = top5Lowest.map((c) => c.tenKh || c.maKh || `KH #${c.rank}`);
          const customerName = labels[dataPointIndex] || '';
          const value = series[seriesIndex][dataPointIndex];
          const formattedValue = new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
          }).format(value);
          return `<div class="apexcharts-tooltip-title" style="font-family: Outfit, sans-serif; font-size: 12px;"></div>
                  <div class="apexcharts-tooltip-series-group apexcharts-active" style="order: 1; display: flex;">
                    <span class="apexcharts-tooltip-marker" style="background-color: #ef4444;"></span>
                    <div class="apexcharts-tooltip-text" style="font-family: Outfit, sans-serif; font-size: 12px;">
                      <div class="apexcharts-tooltip-y-group">
                        <span class="apexcharts-tooltip-text-y-label">${customerName}: </span>
                        <span class="apexcharts-tooltip-text-y-value">${formattedValue}</span>
                      </div>
                    </div>
                  </div>`;
        },
      },
      grid: {
        borderColor: theme === "dark" ? "#374151" : "#E5E7EB",
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
      legend: {
        show: false,
      },
    };
  }, [topCustomers.data, theme]);

  const top5LowestChartSeries = useMemo(() => {
    const top5Lowest = topCustomers.data?.top5Lowest || [];
    const data = top5Lowest.map((c) => c.totalRevenue || 0);
    return [
      {
        name: t("dashboard.top5Lowest"),
        data: data,
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'light',
            type: 'vertical',
            shadeIntensity: 0.5,
            gradientToColors: ['#dc2626'],
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 0.8,
            stops: [0, 100]
          }
        }
      },
    ];
  }, [topCustomers.data, t]);

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
        height: 280,
        fontFamily: "Outfit, sans-serif",
        toolbar: {
          show: false,
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
        show: false,
      },
      tooltip: {
        theme: theme === "dark" ? "dark" : "light",
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
        formatter: function (val, opts) {
          const series = opts.series || opts.w.globals.series;
          const seriesIndex = opts.seriesIndex !== undefined ? opts.seriesIndex : opts.dataPointIndex;
          const value = series[seriesIndex];
          const total = series.reduce((sum, v) => sum + (v || 0), 0);
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
          return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
            notation: "compact",
          }).format(value) + `\n(${percentage}%)`;
        },
        style: {
          fontSize: "11px",
          fontWeight: 600,
          colors: ["#fff"],
        },
      },
      title: {
        text: "",
        align: "center",
      },
    };
  }, [cashAndDeposits.data, t, theme]);

  const revenueKPIExpensesChartOptions = useMemo(() => {
    const data = revenueKPIExpenses.data || {};
    const labels = data.labels || [];

    return {
      chart: {
        type: "bar",
        height: 300,
        fontFamily: "Outfit, sans-serif",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          borderRadius: 8,
          borderRadiusApplication: "end",
          dataLabels: {
            position: "top",
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val, { seriesIndex }) {
          // KPI là số lượng nên không format tiền tệ
          if (seriesIndex === 1) {
            return val.toLocaleString("vi-VN");
          }
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
          colors: ["#fff"],
        },
        offsetY: -5,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: labels,
        title: {
          style: {
            fontSize: "14px",
            fontWeight: "bold",
            color: "#374151",
          },
        },
        labels: {
          style: {
            colors: theme === "dark" ? "#9CA3AF" : "#6B7280",
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
            color: theme === "dark" ? "#E5E7EB" : "#374151",
          },
        },
        labels: {
          style: {
            colors: theme === "dark" ? "#9CA3AF" : "#6B7280",
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
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.5,
          gradientToColors: ['#059669', '#1d4ed8', '#dc2626'],
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.8,
          stops: [0, 100]
        }
      },
      colors: ["#10B981", "#3B82F6", "#EF4444"],
      legend: {
        show: false,
      },
      tooltip: {
        theme: theme === "dark" ? "dark" : "light",
        style: {
          fontSize: "14px",
          fontWeight: "bold",
        },
        fillSeriesColor: false,
        marker: {
          show: true,
        },
        y: {
          formatter: function (value, { seriesIndex }) {
            // KPI là số lượng nên không format tiền tệ
            if (seriesIndex === 1) {
              return value.toString();
            }
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
        borderColor: theme === "dark" ? "#374151" : "#E5E7EB",
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
  }, [revenueKPIExpenses.data, t, theme]);

  const revenueKPIExpensesSeries = useMemo(() => {
    const data = revenueKPIExpenses.data || {};
    return [
      {
        name: t("dashboard.revenue"),
        data: data.revenue || [],
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'light',
            type: 'vertical',
            shadeIntensity: 0.5,
            gradientToColors: ['#059669'],
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 0.8,
            stops: [0, 100]
          }
        }
      },
      {
        name: t("dashboard.kpi"),
        data: data.kpi || [],
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'light',
            type: 'vertical',
            shadeIntensity: 0.5,
            gradientToColors: ['#2563eb'],
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 0.8,
            stops: [0, 100]
          }
        }
      },
      {
        name: t("dashboard.expenses"),
        data: data.expenses || [],
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'light',
            type: 'vertical',
            shadeIntensity: 0.5,
            gradientToColors: ['#dc2626'],
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 0.8,
            stops: [0, 100]
          }
        }
      },
    ];
  }, [revenueKPIExpenses.data, t]);

  // Tính tổng của từng loại
  const totals = useMemo(() => {
    const data = revenueKPIExpenses.data || {};
    return {
      revenue: (data.revenue || []).reduce((sum, val) => sum + (val || 0), 0),
      kpi: (data.kpi || []).reduce((sum, val) => sum + (val || 0), 0),
      expenses: (data.expenses || []).reduce((sum, val) => sum + (val || 0), 0),
    };
  }, [revenueKPIExpenses.data]);
  const expensesChartOptions = useMemo(() => {
    const data = expenses.data || {};
    const labels = data.labels || [];

    return {
      chart: {
        type: "bar",
        height: 380,
        fontFamily: "Outfit, sans-serif",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "45%",
          borderRadius: 8,
          borderRadiusApplication: "end",
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
          colors: ["#fff"],
        },
        offsetY: -5,
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
            color: theme === "dark" ? "#E5E7EB" : "#374151",
          },
        },
        labels: {
          style: {
            colors: theme === "dark" ? "#9CA3AF" : "#6B7280",
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
            color: theme === "dark" ? "#E5E7EB" : "#374151",
          },
        },
        labels: {
          style: {
            colors: theme === "dark" ? "#9CA3AF" : "#6B7280",
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
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.5,
          gradientToColors: ['#dc2626'],
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.8,
          stops: [0, 100]
        }
      },
      colors: ["#EF4444"],
      legend: {
        show: false,
      },
      tooltip: {
        theme: theme === "dark" ? "dark" : "light",
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
        borderColor: theme === "dark" ? "#374151" : "#E5E7EB",
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
  }, [expenses.data, t, theme]);

  const expensesSeries = useMemo(() => {
    const data = expenses.data || {};
    return [
      {
        name: t("sidebar.costs"),
        data: data.data || [],
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'light',
            type: 'vertical',
            shadeIntensity: 0.5,
            gradientToColors: ['#dc2626'],
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 0.8,
            stops: [0, 100]
          }
        }
      },
    ];
  }, [expenses.data, t]);

  // Chart options cho Công nợ phải trả
  const accountsPayableChartOptions = useMemo(() => {
    const data = accountsPayable.data?.data || [];
    
    // Process data: get top suppliers by closing balance (C = need to pay)
    const suppliersData = data
      .map((item) => {
        // Parse dư cuối: du_cuoi2 là "Cr." (C) hoặc "Dr." (N)
        const duCuoi2 = String(item.du_cuoi2 || "").trim();
        const duCuoiType = duCuoi2 === "Cr." ? "C" : (duCuoi2 === "Dr." ? "N" : "");
        const noCk = parseFloat(item.no_ck || 0);
        const coCk = parseFloat(item.co_ck || 0);
        const duCuoiValue = duCuoiType === "C" ? coCk : (duCuoiType === "N" ? noCk : 0);
        
        // Only show suppliers with C (need to pay)
        const closingBalance = duCuoiType === "C" ? duCuoiValue : 0;
        
        return {
          maKh: item.ma_kh || item.maKh || "",
          tenKh: item.ten_kh || item.tenKh || item.ten_khach_hang || "",
          closingBalance,
        };
      })
      .filter((item) => item.closingBalance > 0)
      .sort((a, b) => b.closingBalance - a.closingBalance)
      .slice(0, 10); // Top 10

    const labels = suppliersData.map((s) => s.maKh || s.tenKh || "");

    return {
      chart: {
        type: "bar",
        height: 300,
        fontFamily: "Outfit, sans-serif",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: "55%",
          borderRadius: 8,
          borderRadiusApplication: "end",
          dataLabels: {
            position: "center",
          },
        },
      },
      colors: ["#F59E0B"],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'horizontal',
          shadeIntensity: 0.5,
          gradientToColors: ['#D97706'],
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.8,
          stops: [0, 100]
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          if (val === 0) return "";
          return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
          }).format(val);
        },
        style: {
          fontSize: "11px",
          fontWeight: 600,
          colors: ["#fff"],
        },
      },
      xaxis: {
        categories: labels,
        labels: {
          style: {
            fontSize: "11px",
            colors: theme === "dark" ? "#9CA3AF" : "#6b7280",
          },
          formatter: function (val) {
            return new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              minimumFractionDigits: 0,
              notation: "compact",
            }).format(val);
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            fontSize: "11px",
            colors: theme === "dark" ? "#9CA3AF" : "#6b7280",
          },
        },
      },
      tooltip: {
        theme: theme === "dark" ? "dark" : "light",
        style: {
          fontSize: "14px",
        },
        fillSeriesColor: false,
        marker: {
          show: true,
        },
        custom: function({ series, seriesIndex, dataPointIndex }) {
          const supplierName = labels[dataPointIndex] || '';
          const value = series[seriesIndex][dataPointIndex];
          const formattedValue = new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
          }).format(value);
          return `<div class="apexcharts-tooltip-title" style="font-family: Outfit, sans-serif; font-size: 12px;"></div>
                  <div class="apexcharts-tooltip-series-group apexcharts-active" style="order: 1; display: flex;">
                    <span class="apexcharts-tooltip-marker" style="background-color: #F59E0B;"></span>
                    <div class="apexcharts-tooltip-text" style="font-family: Outfit, sans-serif; font-size: 12px;">
                      <div class="apexcharts-tooltip-y-group">
                        <span class="apexcharts-tooltip-text-y-label">${supplierName}: </span>
                        <span class="apexcharts-tooltip-text-y-value">${formattedValue}</span>
                      </div>
                    </div>
                  </div>`;
        },
      },
      grid: {
        borderColor: theme === "dark" ? "#374151" : "#E5E7EB",
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
      legend: {
        show: false,
      },
    };
  }, [accountsPayable.data, theme]);

  const accountsPayableChartSeries = useMemo(() => {
    const data = accountsPayable.data?.data || [];
    
    const suppliersData = data
      .map((item) => {
        // Parse dư cuối: du_cuoi2 là "Cr." (C) hoặc "Dr." (N)
        const duCuoi2 = String(item.du_cuoi2 || "").trim();
        const duCuoiType = duCuoi2 === "Cr." ? "C" : (duCuoi2 === "Dr." ? "N" : "");
        const noCk = parseFloat(item.no_ck || 0);
        const coCk = parseFloat(item.co_ck || 0);
        const duCuoiValue = duCuoiType === "C" ? coCk : (duCuoiType === "N" ? noCk : 0);
        
        const closingBalance = duCuoiType === "C" ? duCuoiValue : 0;
        
        return {
          maKh: item.ma_kh || item.maKh || "",
          tenKh: item.ten_kh || item.tenKh || item.ten_khach_hang || "",
          closingBalance,
        };
      })
      .filter((item) => item.closingBalance > 0)
      .sort((a, b) => b.closingBalance - a.closingBalance)
      .slice(0, 10);

    const chartData = suppliersData.map((s) => s.closingBalance);

    return [
      {
        name: t("dashboard.accountsPayable"),
        data: chartData,
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'light',
            type: 'vertical',
            shadeIntensity: 0.5,
            gradientToColors: ['#D97706'],
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 0.8,
            stops: [0, 100]
          }
        }
      },
    ];
  }, [accountsPayable.data, t]);

  // Format balance with C/N indicator
  const formatBalance = (value, type) => {
    if (!value && value !== 0) return "";
    const formatted = new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
    return type === "C" ? `${formatted} C` : type === "N" ? `${formatted} N` : formatted;
  };

  // Process table data
  const accountsPayableTableData = useMemo(() => {
    const data = accountsPayable.data?.data || [];
    return data.map((item, index) => {
      // Parse dư đầu: du_dau là "C" hoặc "N", giá trị từ no_dk hoặc co_dk
      const duDauType = String(item.du_dau || "").trim();
      const noDk = parseFloat(item.no_dk || 0);
      const coDk = parseFloat(item.co_dk || 0);
      const duDauValue = duDauType === "N" ? noDk : (duDauType === "C" ? coDk : 0);
      
      // Parse phát sinh
      const psNo = parseFloat(item.ps_no || 0);
      const psCo = parseFloat(item.ps_co || 0);
      
      // Parse dư cuối: du_cuoi2 là "Cr." (C) hoặc "Dr." (N), giá trị từ no_ck hoặc co_ck
      const duCuoi2 = String(item.du_cuoi2 || "").trim();
      const duCuoiType = duCuoi2 === "Cr." ? "C" : (duCuoi2 === "Dr." ? "N" : "");
      const noCk = parseFloat(item.no_ck || 0);
      const coCk = parseFloat(item.co_ck || 0);
      const duCuoiValue = duCuoiType === "C" ? coCk : (duCuoiType === "N" ? noCk : 0);

      return {
        stt: index + 1,
        maKh: item.ma_kh || item.maKh || "",
        tenKh: item.ten_kh || item.tenKh || item.ten_khach_hang || "",
        duDau: duDauValue,
        duDauType,
        psNo,
        psCo,
        duCuoi: duCuoiValue,
        duCuoiType,
      };
    });
  }, [accountsPayable.data]);

  return (
    <>
      <PageMeta
        title={t("dashboard.title")}
        description={t("dashboard.description")}
      />
      {/* Header Section */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-amber-700 to-red-600 rounded-xl shadow-lg p-4 md:p-5 lg:p-6 mb-4 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>

          <div className="relative z-5">
            <div className="flex items-center justify-center mb-2 md:mb-3 gap-2 md:gap-4">
              <div className="bg-white bg-opacity-20 rounded-full p-2 md:p-2.5">
                <BarChart3 className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-white">
                {t("dashboard.title")}
              </h1>
            </div>

            <p className="text-red-100 text-xs md:text-sm lg:text-base max-w-2xl mx-auto px-2">
              {t("dashboard.description")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-8">
        {/* Chart 1: Tiền và tiền gửi (Pie Chart) */}
        <div className="col-span-12 lg:col-span-6 lg:h-[420px]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-3 md:p-4 lg:p-6 border border-gray-100 dark:border-gray-700 lg:h-full">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="bg-green-100 dark:bg-green-900 rounded-lg p-1.5">
                <PieChart className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-sm md:text-base font-semibold text-gray-800 dark:text-white">
                {t("dashboard.cashAndDeposits")}
              </h3>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-[200px] lg:h-[280px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-center">
                {/* Biểu đồ bên trái */}
                <div className="flex flex-col items-center justify-center w-full">
                  <Chart
                    options={cashAndDepositsChartOptions}
                    series={cashAndDepositsChartOptions.series}
                    type="pie"
                    height={isMobile ? 200 : 280}
                  />

                  {/* Tổng cộng dưới biểu đồ */}
                  <div className=" border-t border-gray-200 dark:border-gray-700 w-full text-center">
                    <div className="flex items-center gap-2 justify-center mt-3">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {t("dashboard.total")}:
                      </span>
                      <span className="text-lg font-bold text-red-900 dark:text-white">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                          minimumFractionDigits: 0,
                        }).format(
                          (cashAndDeposits.data?.quyTienMat || 0) +
                          (cashAndDeposits.data?.tienGuiBIDV || 0) +
                          (cashAndDeposits.data?.tienGuiViettinbank || 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>


                {/* Chú thích và tổng bên phải */}
                <div className="flex flex-col gap-4 ml-12">
                  {/* Chú thích */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-[#10B981]"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t("sidebar.cashFundDetail")}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                            minimumFractionDigits: 0,
                          }).format(cashAndDeposits.data?.quyTienMat || 0)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-[#3B82F6]"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t("sidebar.bidvDeposit")}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                            minimumFractionDigits: 0,
                          }).format(cashAndDeposits.data?.tienGuiBIDV || 0)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-[#F59E0B]"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t("sidebar.viettinbankDeposit")}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                            minimumFractionDigits: 0,
                          }).format(cashAndDeposits.data?.tienGuiViettinbank || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Tổng */}

                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Doanh thu, KPI và Chi phí theo tháng (Bar Chart - 3 cột) */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-3 md:p-4 lg:p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-1.5">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-sm md:text-base font-semibold text-gray-800 dark:text-white">
                {t("dashboard.revenueKPICost")}
              </h3>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-[250px] lg:h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4 items-center">
                {/* Biểu đồ bên trái */}
                <div className="flex justify-center lg:justify-start w-full">
                  <div className="w-full">
                    <Chart
                      options={revenueKPIExpensesChartOptions}
                      series={revenueKPIExpensesSeries}
                      type="bar"
                      height={isMobile ? 250 : 300}
                      width="100%"
                    />
                  </div>
                </div>
                {/* Chú thích và tổng bên phải */}
                <div className="flex flex-col gap-4">
                  {/* Chú thích */}
                  <div className="space-y-3 ml-12">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded bg-[#10B981]"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t("dashboard.revenue")}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                            minimumFractionDigits: 0,
                          }).format(totals.revenue)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded bg-[#3B82F6]"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t("dashboard.kpi")}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {totals.kpi.toLocaleString("vi-VN")} đ
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded bg-[#EF4444]"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t("dashboard.expenses")}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                            minimumFractionDigits: 0,
                          }).format(totals.expenses)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chart 3: Các khoản chi (Bar Chart) - Full Width */}
        <div className="col-span-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-3 md:p-4 lg:p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="bg-red-100 dark:bg-red-900 rounded-lg p-1.5">
                <BarChart3 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-sm md:text-base font-semibold text-gray-800 dark:text-white">
                {t("dashboard.expenses")}
              </h3>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-[300px] lg:h-[380px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Chart
                options={expensesChartOptions}
                series={expensesSeries}
                type="bar"
                height={isMobile ? 300 : 480}
              />
            )}
          </div>
        </div>

        {/* Chart 4: Top 5 Khách hàng doanh thu cao nhất và thấp nhất */}
        <div className="col-span-12 lg:h-[620px]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-3 md:p-4 lg:p-6 border border-gray-100 dark:border-gray-700 lg:h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-1.5">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-sm md:text-base font-semibold text-gray-800 dark:text-white">
                {t("dashboard.topCustomers")}
              </h3>
            </div>
            {isTopCustomersLoading ? (
              <div className="flex items-center justify-center flex-1 min-h-[400px] lg:min-h-0">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : topCustomersError ? (
              <div className="flex items-center justify-center flex-1 min-h-[400px] lg:min-h-0">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <p className="text-sm">{t("errors.loadDataError")}</p>
                  <p className="text-xs mt-2">{topCustomersError.message}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 flex-1 overflow-hidden">
                {/* Mobile: Đan xen - Desktop: Bên trái */}
                <div className="flex flex-col overflow-hidden gap-4">
                  {/* Biểu đồ Top 5 cao nhất */}
                  <div className="flex flex-col overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {t("dashboard.top5Highest")}
                      </h4>
                    </div>
                    {topCustomers.data?.top5Highest && topCustomers.data.top5Highest.length > 0 ? (
                      <Chart
                        options={top5HighestChartOptions}
                        series={top5HighestChartSeries}
                        type="bar"
                        height={isMobile ? 180 : 220}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-[220px] text-gray-500 dark:text-gray-400 text-sm">
                        {t("common.noData")}
                      </div>
                    )}
                  </div>

                  {/* Chi tiết Top 5 cao nhất - Mobile */}
                  <div className="flex flex-col overflow-hidden lg:hidden">
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {t("dashboard.top5Highest")}
                      </h4>
                    </div>
                    <div className="space-y-2 overflow-y-auto pr-2">
                      {topCustomers.data?.top5Highest && topCustomers.data.top5Highest.length > 0 ? (
                        topCustomers.data.top5Highest.map((customer, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-sm font-bold text-green-600 dark:text-green-400 w-8">
                                #{customer.rank}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                                  {customer.tenKh || customer.maKh || "N/A"}
                                </div>
                                {customer.kpiCompletionRate !== null && customer.kpiCompletionRate !== undefined && (
                                  <div className={`text-xs font-medium mt-1 ${customer.kpiCompletionRate >= 100
                                    ? "text-green-600 dark:text-green-400"
                                    : customer.kpiCompletionRate >= 80
                                      ? "text-yellow-600 dark:text-yellow-400"
                                      : "text-red-600 dark:text-red-400"
                                    }`}>
                                    KPI: {customer.kpiCompletionRate}%
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right ml-2">
                              <div className="text-sm font-bold text-green-600 dark:text-green-400">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                  minimumFractionDigits: 0,
                                  notation: "compact",
                                }).format(customer.totalRevenue)}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-4 text-gray-500 dark:text-gray-400 text-sm">
                          {t("common.noData")}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Biểu đồ Top 5 thấp nhất */}
                  <div className="flex flex-col overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {t("dashboard.top5Lowest")}
                      </h4>
                    </div>
                    {topCustomers.data?.top5Lowest && topCustomers.data.top5Lowest.length > 0 ? (
                      <Chart
                        options={top5LowestChartOptions}
                        series={top5LowestChartSeries}
                        type="bar"
                        height={isMobile ? 180 : 220}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-[220px] text-gray-500 dark:text-gray-400 text-sm">
                        {t("common.noData")}
                      </div>
                    )}
                  </div>

                  {/* Chi tiết Top 5 thấp nhất - Mobile */}
                  <div className="flex flex-col overflow-hidden lg:hidden">
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {t("dashboard.top5Lowest")}
                      </h4>
                    </div>
                    <div className="space-y-2 overflow-y-auto pr-2">
                      {topCustomers.data?.top5Lowest && topCustomers.data.top5Lowest.length > 0 ? (
                        topCustomers.data.top5Lowest.map((customer, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-sm font-bold text-red-600 dark:text-red-400 w-8">
                                #{customer.rank}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                                  {customer.tenKh || customer.maKh || "N/A"}
                                </div>
                                {customer.kpiCompletionRate !== null && customer.kpiCompletionRate !== undefined && (
                                  <div className={`text-xs font-medium mt-1 ${customer.kpiCompletionRate >= 100
                                    ? "text-green-600 dark:text-green-400"
                                    : customer.kpiCompletionRate >= 80
                                      ? "text-yellow-600 dark:text-yellow-400"
                                      : "text-red-600 dark:text-red-400"
                                    }`}>
                                    KPI: {customer.kpiCompletionRate}%
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right ml-2">
                              <div className="text-sm font-bold text-red-600 dark:text-red-400">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                  minimumFractionDigits: 0,
                                  notation: "compact",
                                }).format(customer.totalRevenue)}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-4 text-gray-500 dark:text-gray-400 text-sm">
                          {t("common.noData")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Desktop: Bên phải - Danh sách chi tiết */}
                <div className="hidden lg:flex flex-col overflow-hidden space-y-4">
                  {/* Top 5 cao nhất */}
                  <div className="flex flex-col overflow-hidden flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {t("dashboard.top5Highest")}
                      </h4>
                    </div>
                    <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                      {topCustomers.data?.top5Highest && topCustomers.data.top5Highest.length > 0 ? (
                        topCustomers.data.top5Highest.map((customer, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-sm font-bold text-green-600 dark:text-green-400 w-8">
                                #{customer.rank}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                                  {customer.tenKh || customer.maKh || "N/A"}
                                </div>
                                {customer.kpiCompletionRate !== null && customer.kpiCompletionRate !== undefined && (
                                  <div className={`text-xs font-medium mt-1 ${customer.kpiCompletionRate >= 100
                                    ? "text-green-600 dark:text-green-400"
                                    : customer.kpiCompletionRate >= 80
                                      ? "text-yellow-600 dark:text-yellow-400"
                                      : "text-red-600 dark:text-red-400"
                                    }`}>
                                    KPI: {customer.kpiCompletionRate}%
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right ml-2">
                              <div className="text-sm font-bold text-green-600 dark:text-green-400">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                  minimumFractionDigits: 0,
                                  notation: "compact",
                                }).format(customer.totalRevenue)}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-4 text-gray-500 dark:text-gray-400 text-sm">
                          {t("common.noData")}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Top 5 thấp nhất */}
                  <div className="flex flex-col overflow-hidden flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {t("dashboard.top5Lowest")}
                      </h4>
                    </div>
                    <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                      {topCustomers.data?.top5Lowest && topCustomers.data.top5Lowest.length > 0 ? (
                        topCustomers.data.top5Lowest.map((customer, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-sm font-bold text-red-600 dark:text-red-400 w-8">
                                #{customer.rank}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                                  {customer.tenKh || customer.maKh || "N/A"}
                                </div>
                                {customer.kpiCompletionRate !== null && customer.kpiCompletionRate !== undefined && (
                                  <div className={`text-xs font-medium mt-1 ${customer.kpiCompletionRate >= 100
                                    ? "text-green-600 dark:text-green-400"
                                    : customer.kpiCompletionRate >= 80
                                      ? "text-yellow-600 dark:text-yellow-400"
                                      : "text-red-600 dark:text-red-400"
                                    }`}>
                                    KPI: {customer.kpiCompletionRate}%
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right ml-2">
                              <div className="text-sm font-bold text-red-600 dark:text-red-400">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                  minimumFractionDigits: 0,
                                  notation: "compact",
                                }).format(customer.totalRevenue)}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-4 text-gray-500 dark:text-gray-400 text-sm">
                          {t("common.noData")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chart 5: Công nợ còn phải thanh toán */}
        <div className="col-span-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-3 md:p-4 lg:p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="bg-orange-100 dark:bg-orange-900 rounded-lg p-1.5">
                <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-sm md:text-base font-semibold text-gray-800 dark:text-white">
                {t("dashboard.accountsPayable")}
              </h3>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <Chart
                  options={accountsPayableChartOptions}
                  series={accountsPayableChartSeries}
                  type="bar"
                  height={isMobile ? 300 : 380}
                />
                
                {/* Detail Table */}
                <div className="mt-6 overflow-x-auto">
                  <h4 className="text-sm md:text-base font-semibold text-gray-800 dark:text-white mb-3">
                    {t("dashboard.accountsPayableDetail")}
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="px-2 py-2 md:px-3 md:py-2 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase border-r border-gray-300 dark:border-gray-600">
                            {t("dashboard.stt")}
                          </th>
                          <th className="px-2 py-2 md:px-3 md:py-2 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase border-r border-gray-300 dark:border-gray-600">
                            {t("dashboard.customerCode")}
                          </th>
                          <th className="px-2 py-2 md:px-3 md:py-2 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase border-r border-gray-300 dark:border-gray-600">
                            {t("dashboard.customerName")}
                          </th>
                          <th className="px-2 py-2 md:px-3 md:py-2 text-right text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase border-r border-gray-300 dark:border-gray-600">
                            {t("dashboard.openingBalance")}
                          </th>
                          <th className="px-2 py-2 md:px-3 md:py-2 text-right text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase border-r border-gray-300 dark:border-gray-600">
                            {t("dashboard.debitAccrual")}
                          </th>
                          <th className="px-2 py-2 md:px-3 md:py-2 text-right text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase border-r border-gray-300 dark:border-gray-600">
                            {t("dashboard.creditAccrual")}
                          </th>
                          <th className="px-2 py-2 md:px-3 md:py-2 text-right text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                            {t("dashboard.closingBalance")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {accountsPayableTableData.length > 0 ? (
                          accountsPayableTableData.map((row, index) => (
                            <tr
                              key={index}
                              className={index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700/50"}
                            >
                              <td className="px-2 py-2 md:px-3 md:py-2 text-[10px] md:text-xs text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                                {row.stt}
                              </td>
                              <td className="px-2 py-2 md:px-3 md:py-2 text-[10px] md:text-xs text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                                {row.maKh}
                              </td>
                              <td className="px-2 py-2 md:px-3 md:py-2 text-[10px] md:text-xs text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                                {row.tenKh}
                              </td>
                              <td className="px-2 py-2 md:px-3 md:py-2 text-[10px] md:text-xs text-gray-900 dark:text-white text-right border-r border-gray-200 dark:border-gray-600">
                                {row.duDau > 0 ? formatBalance(row.duDau, row.duDauType) : ""}
                              </td>
                              <td className="px-2 py-2 md:px-3 md:py-2 text-[10px] md:text-xs text-gray-900 dark:text-white text-right border-r border-gray-200 dark:border-gray-600">
                                {row.psNo > 0 ? new Intl.NumberFormat("vi-VN", { minimumFractionDigits: 0 }).format(row.psNo) : ""}
                              </td>
                              <td className="px-2 py-2 md:px-3 md:py-2 text-[10px] md:text-xs text-gray-900 dark:text-white text-right border-r border-gray-200 dark:border-gray-600">
                                {row.psCo > 0 ? new Intl.NumberFormat("vi-VN", { minimumFractionDigits: 0 }).format(row.psCo) : ""}
                              </td>
                              <td className="px-2 py-2 md:px-3 md:py-2 text-[10px] md:text-xs text-gray-900 dark:text-white text-right">
                                {row.duCuoi > 0 ? formatBalance(row.duCuoi, row.duCuoiType) : ""}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                              {t("common.noData")}
                            </td>
                          </tr>
                        )}
                        {/* Totals Row */}
                        {accountsPayable.data?.totals && (
                          <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-500 dark:border-blue-600 font-bold">
                            <td colSpan="3" className="px-2 py-2 md:px-3 md:py-2 text-[10px] md:text-xs text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                              {t("dashboard.total")}:
                            </td>
                            <td className="px-2 py-2 md:px-3 md:py-2 text-[10px] md:text-xs text-gray-900 dark:text-white text-right border-r border-gray-200 dark:border-gray-600">
                              {accountsPayable.data.totals.duDau !== 0 
                                ? formatBalance(Math.abs(accountsPayable.data.totals.duDau), accountsPayable.data.totals.duDau > 0 ? "C" : "N")
                                : ""}
                            </td>
                            <td className="px-2 py-2 md:px-3 md:py-2 text-[10px] md:text-xs text-gray-900 dark:text-white text-right border-r border-gray-200 dark:border-gray-600">
                              {new Intl.NumberFormat("vi-VN", { minimumFractionDigits: 0 }).format(accountsPayable.data.totals.psNo)}
                            </td>
                            <td className="px-2 py-2 md:px-3 md:py-2 text-[10px] md:text-xs text-gray-900 dark:text-white text-right border-r border-gray-200 dark:border-gray-600">
                              {new Intl.NumberFormat("vi-VN", { minimumFractionDigits: 0 }).format(accountsPayable.data.totals.psCo)}
                            </td>
                            <td className="px-2 py-2 md:px-3 md:py-2 text-[10px] md:text-xs text-gray-900 dark:text-white text-right">
                              {accountsPayable.data.totals.duCuoi !== 0
                                ? formatBalance(Math.abs(accountsPayable.data.totals.duCuoi), accountsPayable.data.totals.duCuoi > 0 ? "C" : "N")
                                : ""}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}