import "flatpickr/dist/flatpickr.min.css";
import { Vietnamese } from "flatpickr/dist/l10n/vn.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Chart from "react-apexcharts";
import Flatpickr from "react-flatpickr";
import SearchableSelect from "../../components/form/SearchableSelect";
import useBangKeChungTu from "../../hooks/useBangKeChungTu";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";
import { CalenderIcon } from "../../icons";
import accountDirectoryService from "../../service/account-directory";
import customerService from "../../service/customer";
import dmphiService from "../../service/dmphi";
import { translateText } from "../../service/translation";

const BaoCaoTaiChinhPage = () => {
  const { t, language } = useTranslation();
  const { theme } = useTheme();
  const [chartType, setChartType] = useState("bar");
  const [periodType, setPeriodType] = useState("ngay");
  const [showChart, setShowChart] = useState(true);
  const [showTable, setShowTable] = useState(true);
  const formatDateLocal = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const startOfYear = `${currentYear}-01-01`;
  const today = formatDateLocal(currentDate);

  const [dateRange, setDateRange] = useState({
    startDate: startOfYear,
    endDate: today,
  });
  // Use ref to store latest dateRange for immediate access (fixes double-click issue)
  const dateRangeRef = useRef({
    startDate: startOfYear,
    endDate: today,
  });
  const [maTaiKhoan, setMaTaiKhoan] = useState("");
  const [tkDu, setTkDu] = useState("");
  const [maKh, setMaKh] = useState("");
  const [maPhi, setMaPhi] = useState("");
  const [data, setData] = useState([]);
  const [translatedData, setTranslatedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const dataRef = useRef(data);
  const [accountList, setAccountList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [dmphiList, setDmphiList] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(false);

  const bangKeChungTuMutation = useBangKeChungTu();

  const fetchData = useCallback(async (payload = {}) => {
    try {
      const apiPayload = {
        configName: "bang_ke_chung_tu",
        ngay_ct1: payload.ngay_ct1 || dateRange.startDate || "",
        ngay_ct2: payload.ngay_ct2 || dateRange.endDate || "",
        ma_tai_khoan: payload.ma_tai_khoan || "",
        tk_du: payload.tk_du || "",
        ma_kh: payload.ma_kh || "",
        ma_phi: payload.ma_phi || "",
        chung_tu_tu_so: payload.chung_tu_tu_so || "",
        den_so: payload.den_so || "",
        ma_dvcs: payload.ma_dvcs || "",
      };
      setLoading(true);
      const response = await bangKeChungTuMutation.mutateAsync(apiPayload);
      const rawData = Array.isArray(response)
        ? response
        : (response?.data || response?.rows || []);
      setData(rawData);
      dataRef.current = rawData;
      setTranslatedData([]);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      setData([]);
      dataRef.current = [];
      setTranslatedData([]);
    } finally {
      setLoading(false);
    }
  }, [bangKeChungTuMutation, dateRange.startDate, dateRange.endDate]);
  useEffect(() => {
    if (!data || data.length === 0) {
      setTranslatedData([]);
      return;
    }

    if (language === "vi") {
      setTranslatedData(data);
      return;
    }

    const translateData = async () => {
      if (dataRef.current !== data) {
        return;
      }

      const translated = await Promise.all(
        data.map(async (row) => {
          const translatedRow = { ...row };
          if (row.ten_kh && row.ten_kh.trim()) {
            if (row.ten_kh_zh) {
              translatedRow.ten_kh = row.ten_kh_zh;
            } else {
              try {
                translatedRow.ten_kh = await translateText(row.ten_kh, language);
              } catch (error) {
                console.warn("Failed to translate ten_kh:", error);
              }
            }
          }
          if (row.dien_giai && row.dien_giai.trim()) {
            if (row.dien_giai_zh) {
              translatedRow.dien_giai = row.dien_giai_zh;
            } else {
              try {
                translatedRow.dien_giai = await translateText(row.dien_giai, language);
              } catch (error) {
                console.warn("Failed to translate dien_giai:", error);
              }
            }
          }
          return translatedRow;
        })
      );

      // Double-check data hasn't changed before setting translated data
      if (dataRef.current === data) {
        setTranslatedData(translated);
      }
    };

    translateData();
  }, [data, language]);
  const displayData = useMemo(() => {
    if (translatedData.length > 0 && translatedData.length === data.length) {
      return translatedData;
    }
    return data;
  }, [translatedData, data]);

  useEffect(() => {
    const payload = {
      ngay_ct1: dateRange.startDate,
      ngay_ct2: dateRange.endDate,
    };
    fetchData(payload);
  }, []);

  const handleFilter = useCallback(() => {
    const payload = {
      ngay_ct1: dateRangeRef.current.startDate,
      ngay_ct2: dateRangeRef.current.endDate,
    };
    if (maTaiKhoan) payload.ma_tai_khoan = maTaiKhoan;
    if (tkDu) payload.tk_du = tkDu;
    if (maKh) payload.ma_kh = maKh;
    if (maPhi) payload.ma_phi = maPhi;
    fetchData(payload);
  }, [maTaiKhoan, tkDu, maKh, maPhi, fetchData]);

  // Load filter dropdown data
  useEffect(() => {
    const loadFilters = async () => {
      setLoadingFilters(true);
      try {
        // Load accounts
        const accountResponse = await accountDirectoryService.getList({ limit: 500, onlyList: true });
        const accounts = accountResponse?.data || [];
        setAccountList(accounts);

        // Load customers
        const customerResponse = await customerService.getList({ limit: 500 });
        const customers = customerResponse?.data || [];
        setCustomerList(customers);

        // Load dmphi
        const dmphiResponse = await dmphiService.getList({ limit: 500 });
        const dmphi = dmphiResponse?.data || [];
        setDmphiList(dmphi);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu filter:", error);
      } finally {
        setLoadingFilters(false);
      }
    };
    loadFilters();
  }, []);

  const getPeriodKey = useCallback((dateString, type) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const getWeek = (d) => {
        const start = new Date(year, 0, 1);
        const days = Math.floor((d - start) / (24 * 60 * 60 * 1000));
        return Math.ceil((days + start.getDay() + 1) / 7);
      };
      switch (type) {
        case "ngay":
          return `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year}`;
        case "tuan": {
          const week = getWeek(date);
          return `${t("voucherListing.period.week")} ${week}/${year}`;
        }
        case "thang":
          return `${month}/${year}`;
        case "nam":
          return `${year}`;
        default:
          return `${day}/${month}/${year}`;
      }
    } catch {
      return dateString;
    }
  }, [t]);

  const groupDataByPeriod = useMemo(() => {
    if (!displayData || displayData.length === 0) return { labels: [], psNo: [] };
    const grouped = {};

    displayData.forEach((item) => {
      const ngayCt = item.ngay_ct || item.ngay_ct_tu || "";
      if (!ngayCt) return;

      const key = getPeriodKey(ngayCt, periodType);
      const psNo = parseFloat(item.ps_no || 0);

      if (!grouped[key]) {
        grouped[key] = 0;
      }
      grouped[key] += psNo;
    });

    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      if (periodType === "ngay") {
        const [d1, m1, y1] = a.split("/").map(Number);
        const [d2, m2, y2] = b.split("/").map(Number);
        return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
      } else if (periodType === "tuan") {
        const [w1, y1] = a.match(/\d+/g).map(Number);
        const [w2, y2] = b.match(/\d+/g).map(Number);
        if (y1 !== y2) return y1 - y2;
        return w1 - w2;
      } else if (periodType === "thang") {
        const [m1, y1] = a.split("/").map(Number);
        const [m2, y2] = b.split("/").map(Number);
        if (y1 !== y2) return y1 - y2;
        return m1 - m2;
      } else {
        return Number(a) - Number(b);
      }
    });

    // Nếu là theo ngày, chỉ lấy 15-20 ngày gần nhất
    let finalKeys = sortedKeys;
    if (periodType === "ngay" && sortedKeys.length > 20) {
      finalKeys = sortedKeys.slice(-15); // Lấy 20 ngày gần nhất
    }

    const labels = finalKeys;
    const psNo = finalKeys.map(key => grouped[key]);

    return { labels, psNo };
  }, [displayData, periodType, getPeriodKey]);

  const { labels, psNo } = groupDataByPeriod;
  const chartOptions = useMemo(() => ({
    chart: {
      type: chartType,
      height: 400,
      fontFamily: "Outfit, sans-serif",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
    },
    series: [
      {
        name: t("voucherListing.chartTitle"),
        data: psNo,
        color: "#EF4444",
      },
    ],
    xaxis: {
      categories: labels,
      title: {
        text: t(`voucherListing.period.${periodType === "ngay" ? "day" :
          periodType === "tuan" ? "week" :
            periodType === "thang" ? "month" :
              "year"
          }`),
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
        rotate: labels.length > 10 ? -45 : 0,
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
    title: {
      text: `${t("voucherListing.chartTitle")} ${t(`voucherListing.period.${periodType === "ngay" ? "day" :
        periodType === "tuan" ? "week" :
          periodType === "thang" ? "month" :
            "year"
        }`)}`,
      align: "center",
      style: {
        fontSize: "20px",
        fontWeight: "bold",
        color: theme === "dark" ? "#E5E7EB" : "#1F2937",
      },
      margin: 20,
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      fontSize: "12px",
      fontWeight: 500,
      markers: {
        width: 12,
        height: 12,
        radius: 12,
      },
    },
    tooltip: {
      shared: false,
      intersect: true,
      theme: theme === "dark" ? "dark" : "light",
      style: {
        fontSize: "12px",
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
    stroke: {
      width: chartType === "line" ? 3 : 0,
      curve: "smooth",
    },
    fill: {
      type: chartType === "line" ? "gradient" : "solid",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.25,
        gradientToColors: undefined,
        inverseColors: false,
        opacityFrom: 0.85,
        opacityTo: 0.05,
        stops: [50, 0, 100],
      },
      colors: chartType === "bar" ? ["#EF4444"] : undefined,
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        dataLabels: {
          position: "top",
        },
      },
    },
  }), [chartType, labels, psNo, periodType, t, theme]);

  return (
    <div className="w-full min-h-screen p-2 md:p-4 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 mb-4 md:mb-6 max-w-full overflow-x-hidden">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6 text-center">📋 {t("voucherListing.title")}</h1>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t("voucherListing.fromDate")}</label>
            <div className="relative">
              <Flatpickr
                value={dateRange.startDate ? new Date(dateRange.startDate) : null}
                onChange={(date) => {
                  const formatted = date[0] ? formatDateLocal(date[0]) : "";
                  // Update both state and ref for immediate access
                  setDateRange((prev) => {
                    const updated = { ...prev, startDate: formatted };
                    dateRangeRef.current = updated;
                    return updated;
                  });
                }}
                options={{
                  dateFormat: "d/m/Y",
                  locale: Vietnamese,
                  allowInput: true,
                  maxDate: dateRange.endDate ? new Date(dateRange.endDate) : null,
                  disableMobile: false,
                  clickOpens: true,
                }}
                placeholder={t("voucherListing.selectStartDate")}
                className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                disabled={loading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <CalenderIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t("voucherListing.toDate")}</label>
            <div className="relative">
              <Flatpickr
                value={dateRange.endDate ? new Date(dateRange.endDate) : null}
                onChange={(date) => {
                  const formatted = date[0] ? formatDateLocal(date[0]) : "";
                  // Update both state and ref for immediate access
                  setDateRange((prev) => {
                    const updated = { ...prev, endDate: formatted };
                    dateRangeRef.current = updated;
                    return updated;
                  });
                }}
                options={{
                  dateFormat: "d/m/Y",
                  locale: Vietnamese,
                  allowInput: true,
                  minDate: dateRange.startDate ? new Date(dateRange.startDate) : null,
                  disableMobile: false,
                  clickOpens: true,
                }}
                placeholder={t("voucherListing.selectEndDate")}
                className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                disabled={loading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <CalenderIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
          </div>

          <SearchableSelect
            label={t("voucherListing.accountCode")}
            options={accountList}
            value={maTaiKhoan}
            onChange={setMaTaiKhoan}
            placeholder={t("voucherListing.enterAccountCode")}
            disabled={loadingFilters}
            getOptionLabel={(option) => `${option.tk || option.id || ""} - ${option.ten_tk || ""}`}
            getOptionValue={(option) => option.tk || option.id || ""}
          />

          <SearchableSelect
            label="Tài khoản đối ứng"
            options={accountList}
            value={tkDu}
            onChange={setTkDu}
            placeholder="-- Chọn tài khoản --"
            disabled={loadingFilters}
            getOptionLabel={(option) => `${option.tk || option.id || ""} - ${option.ten_tk || ""}`}
            getOptionValue={(option) => option.tk || option.id || ""}
          />

          <SearchableSelect
            label="Mã khách hàng"
            options={customerList}
            value={maKh}
            onChange={setMaKh}
            placeholder="-- Chọn khách hàng --"
            disabled={loadingFilters}
            getOptionLabel={(option) => `${option.ma_kh || option.id || ""} - ${option.ten_kh || ""}`}
            getOptionValue={(option) => option.ma_kh || option.id || ""}
          />

          <SearchableSelect
            label="Mã phí"
            options={dmphiList}
            value={maPhi}
            onChange={setMaPhi}
            placeholder="-- Chọn mã phí --"
            disabled={loadingFilters}
            getOptionLabel={(option) => `${option.ma_phi || option.id || ""} - ${option.ten_phi || ""}`}
            getOptionValue={(option) => option.ma_phi || option.id || ""}
          />

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t("voucherListing.chartType")}</label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="w-full p-2 md:p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="bar">📊 {t("voucherListing.barChart")}</option>
                <option value="line">📈 {t("voucherListing.lineChart")}</option>
              </select>
            </div>
            <button
              onClick={handleFilter}
              disabled={loading}
              className="px-3 py-2 md:px-4 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base whitespace-nowrap"
            >
              {loading ? "🔄" : "🔍"} {loading ? t("common.loading") : t("common.filter")}
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-4 md:mb-6 max-w-full overflow-x-hidden">
        {/* Header with toggle button */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">📊 {t("voucherListing.chartTitle")}</h3>
          <button
            onClick={() => setShowChart(!showChart)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={showChart ? "Ẩn biểu đồ" : "Hiện biểu đồ"}
          >
            <svg
              className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${showChart ? "" : "rotate-180"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>

        {showChart && (
          <div className="p-3 md:p-4">
            {/* Period Tabs */}
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setPeriodType("ngay")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${periodType === "ngay"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
              >
                {t("voucherListing.byDay")}
              </button>
              <button
                onClick={() => setPeriodType("tuan")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${periodType === "tuan"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
              >
                {t("voucherListing.byWeek")}
              </button>
              <button
                onClick={() => setPeriodType("thang")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${periodType === "thang"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
              >
                {t("voucherListing.byMonth")}
              </button>
              <button
                onClick={() => setPeriodType("nam")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${periodType === "nam"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
              >
                {t("voucherListing.byYear")}
              </button>
            </div>

            {/* Chart */}
            {labels.length > 0 && psNo.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <Chart
                  options={chartOptions}
                  series={chartOptions.series}
                  type={chartType}
                  height={400}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-500 dark:text-gray-400">
                <p>{t("common.noData")}</p>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Bảng kê chứng từ */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-full overflow-x-hidden">
        {/* Header with toggle button */}
        <div className="flex items-center justify-between p-3 md:p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">📋 {t("voucherListing.detail")}</h3>
          <button
            onClick={() => setShowTable(!showTable)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={showTable ? "Ẩn bảng chi tiết" : "Hiện bảng chi tiết"}
          >
            <svg
              className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${showTable ? "" : "rotate-180"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>

        {showTable && (
          <div className="p-3 md:p-4 lg:p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{t("common.loading")}</p>
              </div>
            ) : data.length > 0 ? (
              <div className="overflow-x-auto -mx-2 md:mx-0">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                      <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                        <div className="flex items-center gap-1 md:gap-2">
                          <span>{t("voucherListing.voucherDate")}</span>
                        </div>
                      </th>
                      <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                        <div className="flex items-center gap-1 md:gap-2">
                          <span>{t("voucherListing.voucherCode")}</span>
                        </div>
                      </th>
                      <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                        <div className="flex items-center gap-1 md:gap-2">
                          <span>{t("voucherListing.voucherNumber")}</span>
                        </div>
                      </th>
                      <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                        <div className="flex items-center gap-1 md:gap-2">
                          <span>{t("voucherListing.customerCode")}</span>
                        </div>
                      </th>
                      <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                        <div className="flex items-center gap-1 md:gap-2">
                          <span>{t("voucherListing.customerName")}</span>
                        </div>
                      </th>
                      <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                        <div className="flex items-center gap-1 md:gap-2">
                          <span>{t("voucherListing.description")}</span>
                        </div>
                      </th>
                      <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                        <div className="flex items-center gap-1 md:gap-2">
                          <span>{t("voucherListing.account")}</span>
                        </div>
                      </th>
                      <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                        <div className="flex items-center gap-1 md:gap-2">
                          <span>{t("voucherListing.contraAccount")}</span>
                        </div>
                      </th>
                      <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                        <div className="flex items-center gap-1 md:gap-2">
                            <span>{t("voucherListing.maphi")}</span>
                        </div>
                      </th>
                      <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-right text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                        <div className="flex items-center justify-end gap-1 md:gap-2">
                          <span>{t("voucherListing.debit")}</span>
                        </div>
                      </th>
                      <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-right text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                        <div className="flex items-center justify-end gap-1 md:gap-2">
                          <span>{t("voucherListing.credit")}</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-dashed divide-gray-300 dark:divide-gray-700">
                    {displayData.map((row, index) => {
                      const formatDate = (dateString) => {
                        if (!dateString) return "";
                        try {
                          const date = new Date(dateString);
                          const day = String(date.getDate()).padStart(2, "0");
                          const month = String(date.getMonth() + 1).padStart(2, "0");
                          const year = date.getFullYear();
                          return `${day}-${month}-${year}`;
                        } catch {
                          return dateString;
                        }
                      };
                      const formatAmount = (amount) => {
                        if (!amount && amount !== 0) return "";
                        return new Intl.NumberFormat("vi-VN").format(amount);
                      };

                      const ngayCt = formatDate(row.ngay_ct);
                      const maCt = row.ma_ct || row.ma_cto || "";
                      const soCt = row.so_ct || "";
                      const maKh = row.ma_kh || "";
                      const tenKh = row.ten_kh || "";
                      const dienGiai = row.dien_giai || "";
                      const tk = row.tk || "";
                      const tkDu = row.tk_du || "";
                      const maPhi = row.ma_phi || "";
                      const psNo = row.ps_no || 0;
                      const psCo = row.ps_co || 0;

                      return (
                        <tr
                          key={index}
                          className={`${index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700/50"} hover:bg-orange-100 dark:hover:bg-gray-700 transition-colors`}
                        >
                          <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">{ngayCt}</td>
                          <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">{maCt}</td>
                          <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">{soCt}</td>
                          <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">{maKh}</td>
                          <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 max-w-[120px] md:max-w-xs truncate" title={tenKh}>
                            {tenKh}
                          </td>
                          <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 max-w-[120px] md:max-w-xs truncate" title={dienGiai}>
                            {dienGiai}
                          </td>
                          <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">{tk}</td>
                          <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">{tkDu}</td>
                          <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">{maPhi || "-"}</td>
                          <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white text-right border-r border-gray-200 dark:border-gray-700">
                            {psNo > 0 ? formatAmount(psNo) : ""}
                          </td>
                          <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white text-right border-r border-gray-200 dark:border-gray-700">
                            {psCo > 0 ? formatAmount(psCo) : ""}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>{t("common.noData")}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BaoCaoTaiChinhPage;
