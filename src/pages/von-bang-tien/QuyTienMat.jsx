import "flatpickr/dist/flatpickr.min.css";
import { Vietnamese } from "flatpickr/dist/l10n/vn.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import Flatpickr from "react-flatpickr";
import { useTranslation } from "../../hooks/useTranslation";
import { useVonBangTien } from "../../hooks/useVonBangTien";
import { CalenderIcon } from "../../icons";
import { translateText } from "../../service/translation";

const QuyTienMatPage = () => {
  const { t, language } = useTranslation();
  const [periodType, setPeriodType] = useState("ngay"); 
  const [chartType, setChartType] = useState("bar"); 

  // Mặc định: từ 1/1 năm hiện tại đến ngày hiện tại
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const firstDayOfYear = `${currentYear}-01-01`;
  const today = currentDate.toISOString().split('T')[0]; // Format YYYY-MM-DD

  const [dateRange, setDateRange] = useState({
    startDate: firstDayOfYear,
    endDate: today,
  });

  // Params cho API
  const params = useMemo(() => ({
    tk: '1111',
    ngay_ct1: dateRange.startDate,
    ngay_ct2: dateRange.endDate,
    ma_dvcs: 'CTY',
    store: 'Caso1',
    gop_tk: '1',
  }), [dateRange.startDate, dateRange.endDate]);

  const { data: response, isLoading, error } = useVonBangTien(params);

  // Extract data từ response
  const data = useMemo(() => {
    if (!response) return [];
    return Array.isArray(response) ? response : (response?.data || response?.rows || []);
  }, [response]);

  // Dịch tự động data khi ngôn ngữ thay đổi
  const [translatedData, setTranslatedData] = useState([]);

  useEffect(() => {
    if (!data || data.length === 0) {
      setTranslatedData([]);
      return;
    }

    // Nếu ngôn ngữ là tiếng Việt, không cần dịch
    if (language === "vi") {
      setTranslatedData(data);
      return;
    }

    // Dịch tự động các field ten_kh, ten_khach_hang và dien_giai
    const translateData = async () => {
      const translated = await Promise.all(
        data.map(async (row) => {
          const translatedRow = { ...row };

          // Dịch ten_kh
          if (row.ten_kh && !row.ten_kh_zh && !row.ten_kh_vn) {
            try {
              translatedRow.ten_kh = await translateText(row.ten_kh, language);
            } catch (error) {
              console.warn("Failed to translate ten_kh:", error);
            }
          }

          // Dịch ten_khach_hang (nếu có)
          if (row.ten_khach_hang && !row.ten_khach_hang_zh && !row.ten_khach_hang_vn) {
            try {
              translatedRow.ten_khach_hang = await translateText(row.ten_khach_hang, language);
            } catch (error) {
              console.warn("Failed to translate ten_khach_hang:", error);
            }
          }

          // Dịch dien_giai
          if (row.dien_giai && !row.dien_giai_zh && !row.dien_giai_vn) {
            try {
              translatedRow.dien_giai = await translateText(row.dien_giai, language);
            } catch (error) {
              console.warn("Failed to translate dien_giai:", error);
            }
          }

          return translatedRow;
        })
      );

      setTranslatedData(translated);
    };

    translateData();
  }, [data, language]);

  // Sử dụng translatedData nếu có, nếu không thì dùng data gốc
  const displayData = useMemo(() => {
    return translatedData.length > 0 ? translatedData : data;
  }, [translatedData, data]);

  // Extract totals từ response
  const totals = useMemo(() => {
    if (!response) return null;
    const totalsArray = Array.isArray(response?.totals) ? response.totals : [];
    return totalsArray.length > 0 ? totalsArray[0] : null;
  }, [response]);

  // Format ngày từ ISO string
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

  // Format số tiền với dấu chấm làm phân cách hàng nghìn
  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return "";
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  // Format số tiền cho phần tổng hợp (luôn hiển thị, kể cả 0)
  const formatAmountForTotal = (amount) => {
    if (!amount && amount !== 0) return "0";
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  // Hàm lấy key theo period type
  const getPeriodKey = useCallback((dateString, type) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      // Lấy tuần trong năm
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
          return `${t("cashFund.period.week")} ${week}/${year}`;
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

  // Hàm nhóm dữ liệu Thu, Chi, Số tồn theo period
  const groupDataByPeriod = useMemo(() => {
    if (!displayData || displayData.length === 0) return { labels: [], thu: [], chi: [], soTon: [] };

    const grouped = {};

    displayData.forEach((item) => {
      const ngayCt = item.ngay_ct || item.ngay_ct_tu || "";
      if (!ngayCt) return;

      const key = getPeriodKey(ngayCt, periodType);
      const thu = parseFloat(item.thu || item.ps_no || item.so_tien_thu || 0);
      const chi = parseFloat(item.chi || item.ps_co || item.so_tien_chi || 0);
      const soTon = parseFloat(item.so_du || item.so_du || 0);

      if (!grouped[key]) {
        grouped[key] = { thu: 0, chi: 0, soTon: 0 };
      }
      grouped[key].thu += thu;
      grouped[key].chi += chi;
      // Số tồn lấy giá trị cuối cùng của period
      grouped[key].soTon = soTon;
    });

    // Sắp xếp theo thời gian
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

    const labels = sortedKeys;
    const thu = sortedKeys.map(key => grouped[key].thu);
    const chi = sortedKeys.map(key => grouped[key].chi);
    const soTon = sortedKeys.map(key => grouped[key].soTon);

    return { labels, thu, chi, soTon };
  }, [displayData, periodType, getPeriodKey]);

  // Tính tổng cho pie chart
  const totalThu = useMemo(() => {
    return groupDataByPeriod.thu.reduce((sum, val) => sum + val, 0);
  }, [groupDataByPeriod]);

  const totalChi = useMemo(() => {
    return groupDataByPeriod.chi.reduce((sum, val) => sum + val, 0);
  }, [groupDataByPeriod]);

  const totalSoTon = useMemo(() => {
    return groupDataByPeriod.soTon.length > 0 ? groupDataByPeriod.soTon[groupDataByPeriod.soTon.length - 1] : 0;
  }, [groupDataByPeriod]);
  const chartOptions = useMemo(() => {
    if (chartType === "pie") {
      return {
        chart: {
          type: "pie",
          height: 400,
          fontFamily: "Inter, sans-serif",
          toolbar: {
            show: true,
            tools: {
              download: true,
            },
          },
        },
        series: [totalThu, totalChi, Math.abs(totalSoTon)],
        labels: [t("cashFund.income"), t("cashFund.expense"), t("cashFund.balance")],
        colors: ["#10B981", "#EF4444", "#3B82F6"],
        legend: {
          position: "bottom",
          horizontalAlign: "center",
          fontSize: "14px",
          fontWeight: 500,
        },
        tooltip: {
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
        },
        title: {
          text: `${t("cashFund.chartTitle")} ${t(`cashFund.period.${periodType === "ngay" ? "day" :
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
      };
    }
    return {
      chart: {
        type: "bar",
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
          name: t("cashFund.income"),
          data: groupDataByPeriod.thu,
          color: "#10B981",
        },
        {
          name: t("cashFund.expense"),
          data: groupDataByPeriod.chi,
          color: "#EF4444",
        },
        {
          name: t("cashFund.balance"),
          data: groupDataByPeriod.soTon,
          color: "#3B82F6",
        },
      ],
      xaxis: {
        categories: groupDataByPeriod.labels,
        title: {
          text: t(`cashFund.period.${periodType === "ngay" ? "day" :
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
          rotate: groupDataByPeriod.labels.length > 10 ? -45 : 0,
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
        text: `${t("cashFund.chartTitle")} ${t(`cashFund.period.${periodType === "ngay" ? "day" :
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
        shared: true,
        intersect: false,
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
      fill: {
        colors: ["#10B981", "#EF4444", "#3B82F6"],
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
    };
  }, [chartType, groupDataByPeriod, totalThu, totalChi, totalSoTon, periodType, t]);

  return (
    <div className="w-full min-h-screen p-2 md:p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6 text-center">💰 {t("cashFund.title")}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t("cashFund.fromDate")}</label>
            <div className="relative">
              <Flatpickr
                value={dateRange.startDate}
                onChange={(date) => {
                  const formatted = date[0]?.toLocaleDateString("en-CA");
                  setDateRange({ ...dateRange, startDate: formatted || "" });
                }}
                options={{
                  dateFormat: "Y-m-d",
                  locale: Vietnamese,
                  allowInput: true,
                }}
                placeholder={t("voucherListing.selectStartDate")}
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <CalenderIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t("cashFund.toDate")}</label>
            <div className="relative">
              <Flatpickr
                value={dateRange.endDate}
                onChange={(date) => {
                  const formatted = date[0]?.toLocaleDateString("en-CA");
                  setDateRange({ ...dateRange, endDate: formatted || "" });
                }}
                options={{
                  dateFormat: "Y-m-d",
                  locale: Vietnamese,
                  allowInput: true,
                }}
                placeholder={t("voucherListing.selectEndDate")}
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <CalenderIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t("cashFund.account")}</label>
            <input
              type="text"
              value="1111"
              disabled
              className="w-full p-2 md:p-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
            />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-lg p-3 md:p-4 mb-4 md:mb-6">
        {/* Period Tabs và Chart Type */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPeriodType("ngay")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${periodType === "ngay"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {t("cashFund.byDay")}
            </button>
            <button
              onClick={() => setPeriodType("tuan")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${periodType === "tuan"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {t("cashFund.byWeek")}
            </button>
            <button
              onClick={() => setPeriodType("thang")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${periodType === "thang"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {t("cashFund.byMonth")}
            </button>
            <button
              onClick={() => setPeriodType("nam")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${periodType === "nam"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {t("cashFund.byYear")}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">{t("cashFund.chartType")}:</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-sm"
            >
              <option value="pie">🟣 {t("cashFund.pieChart")}</option>
              <option value="bar">📊 {t("cashFund.barChart")}</option>
            </select>
          </div>
        </div>

        {/* Chart */}
        {chartType === "pie" ? (
          (totalThu > 0 || totalChi > 0 || totalSoTon !== 0) ? (
            <Chart
              options={chartOptions}
              series={chartOptions.series}
              type="pie"
              height={400}
            />
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-500">
              <p>{t("common.noData")}</p>
            </div>
          )
        ) : (
          groupDataByPeriod.labels.length > 0 && (groupDataByPeriod.thu.length > 0 || groupDataByPeriod.chi.length > 0 || groupDataByPeriod.soTon.length > 0) ? (
            <Chart
              options={chartOptions}
              series={chartOptions.series}
              type="bar"
              height={400}
            />
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-500">
              <p>{t("common.noData")}</p>
            </div>
          )
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg p-3 md:p-4 lg:p-6">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">📋 {t("cashFund.detail")}</h3>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">{t("common.loading")}</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>{t("errors.loadDataError")}</p>
          </div>
        ) : displayData.length > 0 ? (
          <div className="overflow-x-auto -mx-2 md:mx-0">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    {t("cashFund.voucherDate")}
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    {t("cashFund.voucherCreateDate")}
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    {t("cashFund.voucherCode")}
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    {t("cashFund.voucherNumber")}
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    {t("cashFund.person")}
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    {t("cashFund.customerCode")}
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    {t("cashFund.customerName")}
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    {t("cashFund.description")}
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-right text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    {t("cashFund.income")}
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-right text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    {t("cashFund.expense")}
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-right text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    {t("cashFund.balance")}
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    {t("cashFund.projectCode")}
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {t("cashFund.voucherCode")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-dashed divide-gray-300">
                {displayData.map((row, index) => {
                  const ngayCt = formatDate(row.ngay_ct || row.ngay_ct_tu);
                  const ngayLapCt = formatDate(row.ngay_lct || row.ngay_lap_cti);
                  const maCt = row.ma_ct || row.ma_cto || "";
                  const soCt = row.so_ct || row.so_ct_tu || "";
                  const ongBa = row.ong_ba || row.ong_ba_name || "";
                  const maKh = row.ma_kh || "";
                  const tenKh = row.ten_kh || row.ten_khach_hang || "";
                  const dienGiai = row.dien_giai || "";
                  const thu = row.thu || row.ps_no || row.so_tien_thu || 0;
                  const chi = row.chi || row.ps_co || row.so_tien_chi || 0;
                  const soTon = row.so_du || row.so_du || row.so_du || 0;
                  const maDuAn = row.ma_du_an || row.ma_duan || "";
                  const maCtTu = row.ma_ct || row.ma_ct || maDuAn || "";

                  return (
                    <tr
                      key={row.stt_rec || row.id || index}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-orange-100 transition-colors`}
                    >
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 border-r border-gray-200">{ngayCt}</td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 border-r border-gray-200">{ngayLapCt}</td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 border-r border-gray-200">{maCt}</td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 border-r border-gray-200">{soCt}</td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 border-r border-gray-200">{ongBa}</td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 border-r border-gray-200">{maKh}</td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-[10px] md:text-xs lg:text-sm text-gray-900 border-r border-gray-200 max-w-[120px] md:max-w-xs truncate" title={tenKh}>
                        {tenKh}
                      </td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-[10px] md:text-xs lg:text-sm text-gray-900 border-r border-gray-200 max-w-[120px] md:max-w-xs truncate" title={dienGiai}>
                        {dienGiai}
                      </td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 text-right border-r border-gray-200">
                        {thu > 0 ? formatAmount(thu) : ""}
                      </td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 text-right border-r border-gray-200">
                        {chi > 0 ? formatAmount(chi) : ""}
                      </td>
                      <td className={`px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-right border-r border-gray-200 ${soTon < 0 ? "text-red-600" : "text-gray-900"}`}>
                        {soTon !== 0 ? formatAmount(soTon) : ""}
                      </td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 border-r border-gray-200">{maDuAn}</td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900">{maCtTu}</td>
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

        {/* Phần tổng hợp số liệu */}
        {totals && (
          <div className="mt-4 md:mt-6 flex justify-center">
            <div className="inline-block">
              <table className="border-collapse border border-gray-300">
                <tbody>
                  <tr className="bg-blue-50 border-b border-gray-300">
                    <td className="px-3 py-2 text-xs md:text-sm font-semibold text-gray-800 border-r border-gray-300">
                      {t("cashFund.summary.openingBalance")}:
                    </td>
                    <td className="px-3 py-2 text-xs md:text-sm text-gray-900 text-right border-r border-gray-300">
                      {formatAmountForTotal(totals.no_dk || 0)}
                    </td>
                    <td className="px-3 py-2 text-xs md:text-sm text-gray-900 text-right">
                      {formatAmountForTotal(totals.co_dk || 0)}
                    </td>
                  </tr>
                  <tr className="bg-blue-50 border-b border-gray-300">
                    <td className="px-3 py-2 text-xs md:text-sm font-semibold text-gray-800 border-r border-gray-300">
                      {t("cashFund.summary.totalIncomeExpense")}:
                    </td>
                    <td className="px-3 py-2 text-xs md:text-sm text-gray-900 text-right border-r border-gray-300">
                      {formatAmountForTotal(totals.ps_no || 0)}
                    </td>
                    <td className="px-3 py-2 text-xs md:text-sm text-gray-900 text-right">
                      {formatAmountForTotal(totals.ps_co || 0)}
                    </td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="px-3 py-2 text-xs md:text-sm font-semibold text-gray-800 border-r border-gray-300">
                      {t("cashFund.summary.closingBalance")}:
                    </td>
                    <td className={`px-3 py-2 text-xs md:text-sm text-right border-r border-gray-300 ${(totals.no_ck || 0) < 0 ? "text-red-600" : "text-gray-900"}`}>
                      {formatAmountForTotal(totals.no_ck || 0)}
                    </td>
                    <td className="px-3 py-2 text-xs md:text-sm text-gray-900 text-right">
                      {formatAmountForTotal(totals.co_ck || 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuyTienMatPage;

