import "flatpickr/dist/flatpickr.min.css";
import { Vietnamese } from "flatpickr/dist/l10n/vn.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import Flatpickr from "react-flatpickr";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";
import { useVonBangTien } from "../../hooks/useVonBangTien";
import { CalenderIcon } from "../../icons";
import { translateText } from "../../service/translation";

const TienGuiBIDVPage = () => {
  const { t, language } = useTranslation();
  const { theme } = useTheme();
  const [periodType, setPeriodType] = useState("ngay");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Helper function to format date in local timezone (avoid UTC conversion issues)
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
  const firstDayOfYear = `${currentYear}-01-01`;
  const today = formatDateLocal(currentDate);

  const [dateRange, setDateRange] = useState({
    startDate: firstDayOfYear,
    endDate: today,
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const params = useMemo(() => ({
    tk: '1121.1',
    ngay_ct1: dateRange.startDate,
    ngay_ct2: dateRange.endDate,
    ma_dvcs: 'CTY',
    store: 'GLSO1D',
    gop_tk: '0',
  }), [dateRange.startDate, dateRange.endDate]);

  const { data: response, isLoading, error } = useVonBangTien(params);
  const data = useMemo(() => {
    if (!response) return [];
    return Array.isArray(response) ? response : (response?.data || response?.rows || []);
  }, [response]);
  const [translatedData, setTranslatedData] = useState([]);
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
          if (row.ten_khach_hang && row.ten_khach_hang.trim()) {
            if (row.ten_khach_hang_zh) {
              translatedRow.ten_khach_hang = row.ten_khach_hang_zh;
            } else {
              try {
                translatedRow.ten_khach_hang = await translateText(row.ten_khach_hang, language);
              } catch (error) {
                console.warn("Failed to translate ten_khach_hang:", error);
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

  const totals = useMemo(() => {
    if (!response) return null;
    const totalsArray = Array.isArray(response?.totals) ? response.totals : [];
    return totalsArray.length > 0 ? totalsArray[0] : null;
  }, [response]);

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

  const formatAmountForTotal = (amount) => {
    if (!amount && amount !== 0) return "0";
    return new Intl.NumberFormat("vi-VN").format(amount);
  };
  const getPeriodKey = useCallback((dateString, type) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      switch (type) {
        case "ngay": {
          return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
        }
        case "tuan": {
          const week = getWeek(date);
          return `${t("cashFund.period.week")} ${week}/${year}`;
        }
        case "thang": {
          return `${String(month).padStart(2, "0")}/${year}`;
        }
        case "nam": {
          return `${year}`;
        }
        default:
          return "";
      }
    } catch {
      return dateString;
    }
  }, [t]);

  const getWeek = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  };

  const groupDataByPeriod = useMemo(() => {
    if (!displayData || displayData.length === 0) return { labels: [], psNo: [], psCo: [] };

    const grouped = {};

    displayData.forEach((item) => {
      const ngayCt = item.ngay_ct || item.ngay_ct_tu || "";
      if (!ngayCt) return;

      const key = getPeriodKey(ngayCt, periodType);
      const psNoValue = item.ps_no || item.no_ps || 0;
      const psCoValue = item.ps_co || item.co_ps || 0;
      const psNo = isNaN(parseFloat(psNoValue)) ? 0 : parseFloat(psNoValue);
      const psCo = isNaN(parseFloat(psCoValue)) ? 0 : parseFloat(psCoValue);

      if (!grouped[key]) {
        grouped[key] = { psNo: 0, psCo: 0 };
      }
      grouped[key].psNo += psNo;
      grouped[key].psCo += psCo;
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
      finalKeys = sortedKeys.slice(-20); // Lấy 20 ngày gần nhất
    }

    const labels = finalKeys;
    const psNo = finalKeys.map(key => grouped[key].psNo);
    const psCo = finalKeys.map(key => grouped[key].psCo);

    return { labels, psNo, psCo };
  }, [displayData, periodType, getPeriodKey]);

  const { labels, psNo, psCo } = groupDataByPeriod;

  const chartOptions = useMemo(() => {
    return {
      chart: {
        type: "bar",
        height: isMobile ? 350 : 400,
        fontFamily: "Outfit, sans-serif",
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
          },
        },
        stacked: false,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          dataLabels: {
            position: "top",
          },
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
          text: t(`cashFund.period.${periodType === "ngay" ? "day" :
            periodType === "tuan" ? "week" :
              periodType === "thang" ? "month" :
                "year"
            }`),
        },
      },
      yaxis: {
        title: {
          text: t("common.amount"),
        },
        labels: {
          formatter: function (val) {
            return new Intl.NumberFormat("vi-VN").format(val);
          },
        },
      },
      fill: {
        opacity: 1,
      },
      colors: ["#3C50E0", "#10B981"],
      legend: {
        position: "top",
        horizontalAlign: "right",
      },
      series: [
        {
          name: t("voucherListing.debit"),
          data: psNo,
        },
        {
          name: t("voucherListing.credit"),
          data: psCo,
        },
      ],
      title: {
        text: `${t("voucherListing.chartTitle")} ${t(`cashFund.period.${periodType === "ngay" ? "day" :
          periodType === "tuan" ? "week" :
            periodType === "thang" ? "month" :
              "year"
          }`)}`,
        align: "center",
      },
      tooltip: {
        theme: theme === "dark" ? "dark" : "light",
        y: {
          formatter: function (val) {
            return new Intl.NumberFormat("vi-VN").format(val) + " VND";
          },
        },
      },
    };
  }, [labels, psNo, psCo, periodType, t, isMobile, theme]);

  return (
    <div className="w-full space-y-4 md:space-y-6 p-2 md:p-4 lg:p-6 overflow-x-hidden">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 max-w-full overflow-x-hidden">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6 text-center">
          {t("sidebar.bidvDeposit")}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {/* Từ ngày */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("cashFund.fromDate")}
            </label>
            <div className="relative">
              <Flatpickr
                value={dateRange.startDate ? new Date(dateRange.startDate) : null}
                onChange={(date) => {
                  const formatted = date[0] ? formatDateLocal(date[0]) : "";
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: formatted,
                  }));
                }}
                options={{
                  dateFormat: "d/m/Y",
                  locale: Vietnamese,
                  allowInput: true,
                  maxDate: dateRange.endDate ? new Date(dateRange.endDate) : null,
                  disableMobile: false,
                  clickOpens: true,
                }}
                placeholder={t("cashFund.fromDate")}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              <CalenderIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Đến ngày */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("cashFund.toDate")}
            </label>
            <div className="relative">
              <Flatpickr
                value={dateRange.endDate ? new Date(dateRange.endDate) : null}
                onChange={(date) => {
                  const formatted = date[0] ? formatDateLocal(date[0]) : "";
                  setDateRange((prev) => ({
                    ...prev,
                    endDate: formatted,
                  }));
                }}
                options={{
                  dateFormat: "d/m/Y",
                  locale: Vietnamese,
                  allowInput: true,
                  minDate: dateRange.startDate ? new Date(dateRange.startDate) : null,
                  disableMobile: false,
                  clickOpens: true,
                }}
                placeholder={t("cashFund.toDate")}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              <CalenderIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t("cashFund.account")}</label>
            <input
              type="text"
              value="1121.1"
              disabled
              className="w-full p-2 md:p-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
            />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 max-w-full overflow-x-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
            {t("voucherListing.chartTitle")}
          </h2>
          <div className="flex flex-wrap gap-2 md:gap-4">
            {/* Period Tabs */}
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {[
                { key: "ngay", label: t("cashFund.byDay") },
                { key: "tuan", label: t("cashFund.byWeek") },
                { key: "thang", label: t("cashFund.byMonth") },
                { key: "nam", label: t("cashFund.byYear") },
              ].map((period) => (
                <button
                  key={period.key}
                  onClick={() => setPeriodType(period.key)}
                  className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-colors ${periodType === period.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full overflow-x-auto overflow-y-visible pb-4">
          <Chart options={chartOptions} series={chartOptions.series} type="bar" height={isMobile ? 350 : 400} />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 max-w-full overflow-x-hidden">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t("cashFund.detail")}
        </h2>
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
                <tr className="bg-gray-100 dark:bg-gray-700/40 border-b border-gray-300 dark:border-gray-600">
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    {t("cashFund.voucherDate")}
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    {t("cashFund.voucherCreateDate")}
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    {t("cashFund.voucherCode")}
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    {t("cashFund.voucherNumber")}
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    {t("cashFund.customerCode")}
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    {t("cashFund.customerName")}
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    {t("cashFund.description")}
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-right text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    {t("voucherListing.debit")}
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-right text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    {t("voucherListing.credit")}
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    {t("cashFund.amountDu")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900/40 divide-y divide-dashed divide-gray-300 dark:divide-gray-700">
                {displayData.map((row, index) => {
                  const ngayCt = formatDate(row.ngay_ct || row.ngay_ct_tu);
                  const ngayLapCt = formatDate(row.ngay_lct || row.ngay_lap_cti);
                  const maCt = row.ma_ct || row.ma_cto || "";
                  const soCt = row.so_ct || row.so_ct_tu || "";
                  const maKh = row.ma_kh || "";
                  const tenKh = row.ten_kh || row.ten_khach_hang || "";
                  const dienGiai = row.dien_giai || "";
                  // Xử lý ps_no và ps_co an toàn, tránh NaN
                  const psNoValue = row.ps_no || row.no_ps || 0;
                  const psCoValue = row.ps_co || row.co_ps || 0;
                  const psNo = isNaN(parseFloat(psNoValue)) ? 0 : parseFloat(psNoValue);
                  const psCo = isNaN(parseFloat(psCoValue)) ? 0 : parseFloat(psCoValue);
                  const tenTkDU = row.ten_tk_du || "";
                  const tenTk2DU = row.ten_tk2 || "";

                  return (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-[10px] md:text-xs text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-700">
                        {ngayCt}
                      </td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-[10px] md:text-xs text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-700">
                        {ngayLapCt}
                      </td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-[10px] md:text-xs text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-700">
                        {maCt}
                      </td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-[10px] md:text-xs text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-700">
                        {soCt}
                      </td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-[10px] md:text-xs text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-700">
                        {maKh}
                      </td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-[10px] md:text-xs text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-700">
                        {tenKh}
                      </td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-[10px] md:text-xs text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-700">
                        {dienGiai}
                      </td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-[10px] md:text-xs text-right text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-700">
                        {formatAmount(psNo)}
                      </td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-[10px] md:text-xs text-right text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-700">
                        {formatAmount(psCo)}
                      </td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-[10px] md:text-xs text-gray-900 dark:text-white">
                        {tenTkDU} ( {tenTk2DU} )
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

        {/* Phần tổng hợp số liệu */}
        {totals && (
          <div className="mt-4 md:mt-6 flex justify-center">
            <div className="inline-block">
              <table className="border-collapse border border-gray-300 dark:border-gray-600">
                <tbody>
                  <tr className="bg-blue-50 dark:bg-blue-900/20 border-b border-gray-300 dark:border-gray-600">
                    <td className="px-3 py-2 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200 border-r border-gray-300 dark:border-gray-600">
                      {t("voucherListing.summary.openingBalance")}:
                    </td>
                    <td className="px-3 py-2 text-xs md:text-sm text-gray-900 dark:text-white text-right border-r border-gray-300 dark:border-gray-600">
                      {formatAmountForTotal(isNaN(parseFloat(totals.no_dk)) ? 0 : parseFloat(totals.no_dk || 0))}
                    </td>
                    <td className="px-3 py-2 text-xs md:text-sm text-gray-900 dark:text-white text-right">
                      {formatAmountForTotal(isNaN(parseFloat(totals.co_dk)) ? 0 : parseFloat(totals.co_dk || 0))}
                    </td>
                  </tr>
                  <tr className="bg-blue-50 dark:bg-blue-900/20 border-b border-gray-300 dark:border-gray-600">
                    <td className="px-3 py-2 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200 border-r border-gray-300 dark:border-gray-600">
                      {t("voucherListing.summary.totalTransactions")}:
                    </td>
                    <td className="px-3 py-2 text-xs md:text-sm text-gray-900 dark:text-white text-right border-r border-gray-300 dark:border-gray-600">
                      {formatAmountForTotal(isNaN(parseFloat(totals.ps_no || totals.no_ps)) ? 0 : parseFloat(totals.ps_no || totals.no_ps || 0))}
                    </td>
                    <td className="px-3 py-2 text-xs md:text-sm text-gray-900 dark:text-white text-right">
                      {formatAmountForTotal(isNaN(parseFloat(totals.ps_co || totals.co_ps)) ? 0 : parseFloat(totals.ps_co || totals.co_ps || 0))}
                    </td>
                  </tr>
                  <tr className="bg-blue-50 dark:bg-blue-900/20">
                    <td className="px-3 py-2 text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200 border-r border-gray-300 dark:border-gray-600">
                      {t("voucherListing.summary.endingDebitBalance")}:
                    </td>
                    <td className={`px-3 py-2 text-xs md:text-sm text-right border-r border-gray-300 dark:border-gray-600 ${(isNaN(parseFloat(totals.no_ck)) ? 0 : parseFloat(totals.no_ck || 0)) < 0 ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
                      {formatAmountForTotal(isNaN(parseFloat(totals.no_ck)) ? 0 : parseFloat(totals.no_ck || 0))}
                    </td>
                    <td className="px-3 py-2 text-xs md:text-sm text-gray-900 dark:text-white text-right">
                      {formatAmountForTotal(isNaN(parseFloat(totals.co_ck)) ? 0 : parseFloat(totals.co_ck || 0))}
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

export default TienGuiBIDVPage;

