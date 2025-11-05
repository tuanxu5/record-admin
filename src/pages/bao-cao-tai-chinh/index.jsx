import "flatpickr/dist/flatpickr.min.css";
import { Vietnamese } from "flatpickr/dist/l10n/vn.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import Flatpickr from "react-flatpickr";
import useBangKeChungTu from "../../hooks/useBangKeChungTu";
import { useTranslation } from "../../hooks/useTranslation";
import { CalenderIcon } from "../../icons";
import { translateText } from "../../service/translation";

const BaoCaoTaiChinhPage = () => {
  const { t, language } = useTranslation();
  const [chartType, setChartType] = useState("bar");
  const [periodType, setPeriodType] = useState("ngay");
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const startOfYear = `${currentYear}-01-01`;
  const today = currentDate.toISOString().split('T')[0];

  const [dateRange, setDateRange] = useState({
    startDate: startOfYear,
    endDate: today,
  });
  const [maTaiKhoan, setMaTaiKhoan] = useState("");
  const [data, setData] = useState([]);
  const [translatedData, setTranslatedData] = useState([]);
  const [loading, setLoading] = useState(false);

  const bangKeChungTuMutation = useBangKeChungTu();
  const fetchData = useCallback(async (payload = {}) => {
    try {
      const apiPayload = {
        configName: "bang_ke_chung_tu",
        ngay_ct1: payload.ngay_ct1 || dateRange.startDate || "",
        ngay_ct2: payload.ngay_ct2 || dateRange.endDate || "",
        ma_tai_khoan: payload.ma_tai_khoan || "",
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
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      setData([]);
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

      setTranslatedData(translated);
    };

    translateData();
  }, [data, language]);

  const displayData = useMemo(() => {
    return translatedData.length > 0 ? translatedData : data;
  }, [translatedData, data]);

  useEffect(() => {
    const payload = {
      ngay_ct1: dateRange.startDate,
      ngay_ct2: dateRange.endDate,
    };
    fetchData(payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = () => {
    const payload = {
      ngay_ct1: dateRange.startDate,
      ngay_ct2: dateRange.endDate,
    };
    if (maTaiKhoan) payload.ma_tai_khoan = maTaiKhoan;
    fetchData(payload);
  };

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
      fontFamily: "Inter, sans-serif",
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
          color: "#374151",
        },
      },
      labels: {
        style: {
          colors: "#6B7280",
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
        color: "#1F2937",
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
      theme: "light",
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
  }), [chartType, labels, psNo, periodType, t]);

  return (
    <div className="w-full min-h-screen p-2 md:p-4 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-4 md:mb-6 max-w-full overflow-x-hidden">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6 text-center">📋 {t("voucherListing.title")}</h1>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t("voucherListing.fromDate")}</label>
            <div className="relative">
              <Flatpickr
                value={dateRange.startDate}
                onChange={(date) => {
                  const formatted = date[0]?.toISOString().split("T")[0];
                  setDateRange({ ...dateRange, startDate: formatted || "" });
                }}
                options={{
                  dateFormat: "Y-m-d",
                  locale: Vietnamese,
                  allowInput: true,
                  maxDate: dateRange.endDate,
                  disableMobile: false,
                  clickOpens: true,
                }}
                placeholder={t("voucherListing.selectStartDate")}
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                disabled={loading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <CalenderIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t("voucherListing.toDate")}</label>
            <div className="relative">
              <Flatpickr
                value={dateRange.endDate}
                onChange={(date) => {
                  const formatted = date[0]?.toISOString().split("T")[0];
                  setDateRange({ ...dateRange, endDate: formatted || "" });
                }}
                options={{
                  dateFormat: "Y-m-d",
                  locale: Vietnamese,
                  allowInput: true,
                  minDate: dateRange.startDate,
                  disableMobile: false,
                  clickOpens: true,
                }}
                placeholder={t("voucherListing.selectEndDate")}
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                disabled={loading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <CalenderIcon className="w-5 h-5 text-gray-400" />
              </div>
          </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t("voucherListing.accountCode")}</label>
            <input
              type="text"
              value={maTaiKhoan}
              onChange={(e) => setMaTaiKhoan(e.target.value)}
              placeholder={t("voucherListing.enterAccountCode")}
              className="w-full p-2 md:p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-sm"
            />
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t("voucherListing.chartType")}</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
                className="w-full p-2 md:p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-sm"
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
      <div className="bg-white rounded-xl shadow-lg p-3 md:p-4 mb-4 md:mb-6 max-w-full overflow-x-hidden">
        {/* Period Tabs */}
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-200">
          <button
            onClick={() => setPeriodType("ngay")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${periodType === "ngay"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {t("voucherListing.byDay")}
          </button>
          <button
            onClick={() => setPeriodType("tuan")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${periodType === "tuan"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {t("voucherListing.byWeek")}
          </button>
          <button
            onClick={() => setPeriodType("thang")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${periodType === "thang"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {t("voucherListing.byMonth")}
          </button>
          <button
            onClick={() => setPeriodType("nam")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${periodType === "nam"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
          <div className="flex items-center justify-center h-96 text-gray-500">
            <p>{t("common.noData")}</p>
          </div>
        )}
      </div>
      {/* Bảng kê chứng từ */}
      <div className="bg-white rounded-xl shadow-lg p-3 md:p-4 lg:p-6 max-w-full overflow-x-hidden">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">📋 {t("voucherListing.detail")}</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">{t("common.loading")}</p>
          </div>
        ) : data.length > 0 ? (
          <div className="overflow-x-auto -mx-2 md:mx-0">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    <div className="flex items-center gap-1 md:gap-2">
                      <span>{t("voucherListing.voucherDate")}</span>
                    </div>
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    <div className="flex items-center gap-1 md:gap-2">
                      <span>{t("voucherListing.voucherCode")}</span>
                    </div>
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    <div className="flex items-center gap-1 md:gap-2">
                      <span>{t("voucherListing.voucherNumber")}</span>
                  </div>
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    <div className="flex items-center gap-1 md:gap-2">
                      <span>{t("voucherListing.customerCode")}</span>
                </div>
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    <div className="flex items-center gap-1 md:gap-2">
                      <span>{t("voucherListing.customerName")}</span>
              </div>
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    <div className="flex items-center gap-1 md:gap-2">
                      <span>{t("voucherListing.description")}</span>
            </div>
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    <div className="flex items-center gap-1 md:gap-2">
                      <span>{t("voucherListing.account")}</span>
      </div>
                </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    <div className="flex items-center gap-1 md:gap-2">
                      <span>{t("voucherListing.contraAccount")}</span>
                    </div>
                </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-right text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    <div className="flex items-center justify-end gap-1 md:gap-2">
                      <span>{t("voucherListing.debit")}</span>
                    </div>
                </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-right text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    <div className="flex items-center justify-end gap-1 md:gap-2">
                      <span>{t("voucherListing.credit")}</span>
                    </div>
                </th>
              </tr>
            </thead>
              <tbody className="bg-white divide-y divide-dashed divide-gray-300">
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
                  const psNo = row.ps_no || 0;
                  const psCo = row.ps_co || 0;

                return (
                  <tr
                      key={row.stt_rec || index}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-orange-100 transition-colors`}
                    >
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 border-r border-gray-200">{ngayCt}</td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 border-r border-gray-200">{maCt}</td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 border-r border-gray-200">{soCt}</td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 border-r border-gray-200">{maKh}</td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-[10px] md:text-xs lg:text-sm text-gray-900 border-r border-gray-200 max-w-[120px] md:max-w-xs truncate" title={tenKh}>
                        {tenKh}
                    </td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-[10px] md:text-xs lg:text-sm text-gray-900 border-r border-gray-200 max-w-[120px] md:max-w-xs truncate" title={dienGiai}>
                        {dienGiai}
                    </td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 border-r border-gray-200">{tk}</td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 border-r border-gray-200">{tkDu}</td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 text-right border-r border-gray-200">
                        {psNo > 0 ? formatAmount(psNo) : ""}
                    </td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 text-right border-r border-gray-200">
                        {psCo > 0 ? formatAmount(psCo) : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>{t("common.noData")}</p>
      </div>
        )}
      </div>
    </div>
  );
};

export default BaoCaoTaiChinhPage;
