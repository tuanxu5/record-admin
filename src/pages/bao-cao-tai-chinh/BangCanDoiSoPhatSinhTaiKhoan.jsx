import "flatpickr/dist/flatpickr.min.css";
import { Vietnamese } from "flatpickr/dist/l10n/vn.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Flatpickr from "react-flatpickr";
import PageMeta from "../../components/common/PageMeta";
import useCanDoiPsTaiKhoan from "../../hooks/useCanDoiPsTaiKhoan";
import { useTranslation } from "../../hooks/useTranslation";
import { CalenderIcon } from "../../icons";

const BangCanDoiSoPhatSinhTaiKhoanPage = () => {
  const { t } = useTranslation();
  const formatDateLocal = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const currentDate = new Date();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  const currentYear = currentDate.getFullYear();
  const firstDayOfMonth = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
  const today = formatDateLocal(currentDate);

  const [dateRange, setDateRange] = useState({
    startDate: firstDayOfMonth,
    endDate: today,
  });
  const [buTru, setBuTru] = useState("1");
  const [maTaiKhoan, setMaTaiKhoan] = useState("");

  const dateRangeRef = useRef({
    startDate: firstDayOfMonth,
    endDate: today,
  });

  const [rawData, setRawData] = useState([]);
  const [rawTotals, setRawTotals] = useState(null);
  const [loading, setLoading] = useState(false);

  const canDoiPsTaiKhoanMutation = useCanDoiPsTaiKhoan();

  const fetchData = useCallback(async (payload = {}) => {
    try {
      const apiPayload = {
        ngay_ct1: payload.ngay_ct1 || dateRangeRef.current.startDate || "",
        ngay_ct2: payload.ngay_ct2 || dateRangeRef.current.endDate || "",
        bu_tru: payload.bu_tru || buTru || "4",
        ma_dvcs: "CTY",
      };
      setLoading(true);
      const response = await canDoiPsTaiKhoanMutation.mutateAsync(apiPayload);
      setRawData(response?.data || []);
      setRawTotals(response?.totals?.[0] || null);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      setRawData([]);
      setRawTotals(null);
    } finally {
      setLoading(false);
    }
  }, [canDoiPsTaiKhoanMutation, buTru]);

  const handleFilter = useCallback(() => {
    const payload = {
      ngay_ct1: dateRangeRef.current.startDate,
      ngay_ct2: dateRangeRef.current.endDate,
      bu_tru: buTru,
    };
    fetchData(payload);
  }, [buTru, fetchData]);

  // Load data on mount only
  useEffect(() => {
    const payload = {
      ngay_ct1: dateRange.startDate,
      ngay_ct2: dateRange.endDate,
      bu_tru: buTru,
    };
    fetchData(payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount, use handleFilter to reload with new params

  // Filter data by account code (client-side filtering)
  const { data, totals } = useMemo(() => {
    if (!maTaiKhoan || maTaiKhoan.trim() === "") {
      return { data: rawData, totals: rawTotals };
    }

    const filteredData = rawData.filter((row) => {
      const tk = row.tk || "";
      // Check if the account code starts with the filter value
      return tk.toLowerCase().startsWith(maTaiKhoan.toLowerCase().trim());
    });

    // Recalculate totals for filtered data
    const filteredTotals = filteredData.length > 0
      ? filteredData.reduce(
        (acc, row) => {
          if (row.bold !== 1) {
            acc.no_dk = (acc.no_dk || 0) + (parseFloat(row.no_dk) || 0);
            acc.co_dk = (acc.co_dk || 0) + (parseFloat(row.co_dk) || 0);
            acc.ps_no = (acc.ps_no || 0) + (parseFloat(row.ps_no) || 0);
            acc.ps_co = (acc.ps_co || 0) + (parseFloat(row.ps_co) || 0);
            acc.no_ck = (acc.no_ck || 0) + (parseFloat(row.no_ck) || 0);
            acc.co_ck = (acc.co_ck || 0) + (parseFloat(row.co_ck) || 0);
          }
          return acc;
        },
        { no_dk: 0, co_dk: 0, ps_no: 0, ps_co: 0, no_ck: 0, co_ck: 0 }
      )
      : null;

    return { data: filteredData, totals: filteredTotals };
  }, [rawData, rawTotals, maTaiKhoan]);

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined || amount === "") return "";
    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  const buTruOptions = [
    { value: "4", label: t("balanceSheetAccounts.offsetWithParent") },
    { value: "3", label: t("balanceSheetAccounts.offsetWithSameCustomer") },
    { value: "2", label: t("balanceSheetAccounts.offsetByAccount") },
    { value: "1", label: t("balanceSheetAccounts.noOffset") },
  ];

  return (
    <>
      <PageMeta
        title={t("balanceSheetAccounts.title")}
        description={t("balanceSheetAccounts.description")}
      />

      <div className="w-full h-[calc(100vh-80px)] p-2 md:p-4 overflow-hidden flex flex-col">
        {/* Header - Sticky */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 mb-4 md:mb-6 max-w-full overflow-x-hidden flex-shrink-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6 text-center">
            📊 {t("balanceSheetAccounts.title")}
          </h1>

          {/* Filter Conditions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t("balanceSheetAccounts.fromDate")}
              </label>
              <div className="relative">
                <Flatpickr
                  value={dateRange.startDate ? new Date(dateRange.startDate) : null}
                  onChange={(date) => {
                    const formatted = date[0] ? formatDateLocal(date[0]) : "";
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
                  placeholder={t("balanceSheetAccounts.selectStartDate")}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  disabled={loading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <CalenderIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t("balanceSheetAccounts.toDate")}
              </label>
              <div className="relative">
                <Flatpickr
                  value={dateRange.endDate ? new Date(dateRange.endDate) : null}
                  onChange={(date) => {
                    const formatted = date[0] ? formatDateLocal(date[0]) : "";
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
                  placeholder={t("balanceSheetAccounts.selectEndDate")}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  disabled={loading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <CalenderIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t("balanceSheetAccounts.account")}
              </label>
              <input
                type="text"
                value={maTaiKhoan}
                onChange={(e) => setMaTaiKhoan(e.target.value)}
                placeholder={t("balanceSheetAccounts.account")}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                disabled={loading}
              />
            </div>

            <div className="flex items-end gap-2 ">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t("balanceSheetAccounts.offsetBalance")}
                </label>
                <select
                  value={buTru}
                  onChange={(e) => setBuTru(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  disabled={loading}
                >
                  {buTruOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
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

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 md:p-4 lg:p-6 max-w-full flex-1 flex flex-col overflow-hidden">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-3 md:mb-4 flex-shrink-0">
            📋 {t("balanceSheetAccounts.detail")}
          </h3>
          {loading ? (
            <div className="text-center py-8 flex-1 flex items-center justify-center">
              <div>
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{t("common.loading")}</p>
              </div>
            </div>
          ) : data.length > 0 ? (
            <div className="overflow-x-auto overflow-y-auto flex-1 -mx-2 md:mx-0">
              <table className="min-w-full border-collapse">
                <thead className="sticky top-0 z-20 bg-gray-100 dark:bg-gray-700">
                  <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                    <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                      {t("balanceSheetAccounts.account")}
                    </th>
                    <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                      {t("balanceSheetAccounts.accountName")}
                    </th>
                    <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-right text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                      {t("balanceSheetAccounts.openingDebit")}
                    </th>
                    <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-right text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                      {t("balanceSheetAccounts.openingCredit")}
                    </th>
                    <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-right text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                      {t("balanceSheetAccounts.debitMovement")}
                    </th>
                    <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-right text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                      {t("balanceSheetAccounts.creditMovement")}
                    </th>
                    <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-right text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                      {t("balanceSheetAccounts.closingDebit")}
                    </th>
                    <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-right text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                      {t("balanceSheetAccounts.closingCredit")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-dashed divide-gray-300 dark:divide-gray-600">
                  {data.map((row, index) => {
                    const isBold = row.bold === 1;
                    const bgColor = isBold
                      ? "bg-gray-100 dark:bg-gray-700"
                      : index % 2 === 0
                        ? "bg-white dark:bg-gray-800"
                        : "bg-gray-50 dark:bg-gray-700/50";

                    return (
                      <tr
                        key={row.stt_rec || index}
                        className={`${bgColor} hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors`}
                      >
                        <td className={`px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600 ${isBold ? "font-bold" : ""}`}>
                          {row.tk || ""}
                        </td>
                        <td className={`px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600 ${isBold ? "font-bold" : ""}`}>
                          {row.ten_tk || ""} ( {row.ten_tk2 || ""} )
                        </td>
                        <td className={`px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white text-right border-r border-gray-200 dark:border-gray-600 ${isBold ? "font-bold" : ""}`}>
                          {formatAmount(row.no_dk)}
                        </td>
                        <td className={`px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white text-right border-r border-gray-200 dark:border-gray-600 ${isBold ? "font-bold" : ""}`}>
                          {formatAmount(row.co_dk)}
                        </td>
                        <td className={`px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white text-right border-r border-gray-200 dark:border-gray-600 ${isBold ? "font-bold" : ""}`}>
                          {formatAmount(row.ps_no)}
                        </td>
                        <td className={`px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white text-right border-r border-gray-200 dark:border-gray-600 ${isBold ? "font-bold" : ""}`}>
                          {formatAmount(row.ps_co)}
                        </td>
                        <td className={`px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white text-right border-r border-gray-200 dark:border-gray-600 ${isBold ? "font-bold" : ""}`}>
                          {formatAmount(row.no_ck)}
                        </td>
                        <td className={`px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white text-right border-r border-gray-200 dark:border-gray-600 ${isBold ? "font-bold" : ""}`}>
                          {formatAmount(row.co_ck)}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Totals Row */}
                  {totals && (
                    <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-500 dark:border-blue-600 font-bold sticky bottom-0 z-20">
                      <td colSpan="2" className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600 bg-blue-50 dark:bg-blue-900/20">
                        {t("balanceSheetAccounts.total")}
                      </td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white text-right border-r border-gray-200 dark:border-gray-600 bg-blue-50 dark:bg-blue-900/20">
                        {formatAmount(totals.no_dk)}
                      </td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white text-right border-r border-gray-200 dark:border-gray-600 bg-blue-50 dark:bg-blue-900/20">
                        {formatAmount(totals.co_dk)}
                      </td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white text-right border-r border-gray-200 dark:border-gray-600 bg-blue-50 dark:bg-blue-900/20">
                        {formatAmount(totals.ps_no)}
                      </td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white text-right border-r border-gray-200 dark:border-gray-600 bg-blue-50 dark:bg-blue-900/20">
                        {formatAmount(totals.ps_co)}
                      </td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white text-right border-r border-gray-200 dark:border-gray-600 bg-blue-50 dark:bg-blue-900/20">
                        {formatAmount(totals.no_ck)}
                      </td>
                      <td className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white text-right border-r border-gray-200 dark:border-gray-600 bg-blue-50 dark:bg-blue-900/20">
                        {formatAmount(totals.co_ck)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>{t("common.noData")}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BangCanDoiSoPhatSinhTaiKhoanPage;

