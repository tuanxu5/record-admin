import "flatpickr/dist/flatpickr.min.css";
import { Vietnamese } from "flatpickr/dist/l10n/vn.js";
import { useCallback, useEffect, useRef, useState } from "react";
import Flatpickr from "react-flatpickr";
import PageMeta from "../../components/common/PageMeta";
import useBangCanDoiKeToan from "../../hooks/useBangCanDoiKeToan";
import { useTranslation } from "../../hooks/useTranslation";
import { CalenderIcon } from "../../icons";

const BangCanDoiKeToanPage = () => {
  const { t } = useTranslation();

  const formatDateLocal = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper function to get first day based on report type
  const getFirstDayByReportType = (reportType) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12

    switch (parseInt(reportType)) {
      case 1: // Month - first day of current month
        return `${year}-${String(month).padStart(2, "0")}-01`;
      case 2: // Quarter - first day of current quarter
        const quarterStartMonth = Math.floor((month - 1) / 3) * 3 + 1;
        return `${year}-${String(quarterStartMonth).padStart(2, "0")}-01`;
      case 3: // Half year - first day of current half year
        const halfYearStartMonth = month <= 6 ? 1 : 7;
        return `${year}-${String(halfYearStartMonth).padStart(2, "0")}-01`;
      case 4: // Year - first day of current year
        return `${year}-01-01`;
      default:
        return `${year}-${String(month).padStart(2, "0")}-01`;
    }
  };

  const currentDate = new Date();
  const today = formatDateLocal(currentDate);

  const [toDate, setToDate] = useState(today);
  const [reportType, setReportType] = useState("1");
  const [buTruChecked, setBuTruChecked] = useState(false);
  const [mau, setMau] = useState("");

  const toDateRef = useRef(today);
  const reportTypeRef = useRef("1");
  const buTruCheckedRef = useRef(false);
  const mauRef = useRef("");

  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);

  const bangCanDoiKeToanMutation = useBangCanDoiKeToan();

  const fetchData = useCallback(
    async (payload = {}) => {
      try {
        const ngay_ct1 = payload.ngay_ct1 || getFirstDayByReportType(reportTypeRef.current);
        const ngay_ct2 = payload.ngay_ct2 || toDateRef.current;
        const bu_tru = payload.bu_tru !== undefined ? payload.bu_tru : buTruCheckedRef.current ? "2" : "1";
        const ma_dvcs = payload.ma_dvcs || "CTY";

        const apiPayload = {
          ngay_ct1,
          ngay_ct2,
          bu_tru,
          mau: "GLTCB2002",
          ma_dvcs,
        };

        setLoading(true);
        const response = await bangCanDoiKeToanMutation.mutateAsync(apiPayload);
        setRawData(response?.data || []);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        setRawData([]);
      } finally {
        setLoading(false);
      }
    },
    [bangCanDoiKeToanMutation]
  );

  const handleFilter = useCallback(() => {
    const ngay_ct1 = getFirstDayByReportType(reportTypeRef.current);
    const ngay_ct2 = toDateRef.current;
    const bu_tru = buTruCheckedRef.current ? "2" : "1";

    fetchData({
      ngay_ct1,
      ngay_ct2,
      bu_tru,
      mau: mauRef.current,
    });
  }, [fetchData]);

  // Update refs when state changes
  useEffect(() => {
    toDateRef.current = toDate;
  }, [toDate]);

  useEffect(() => {
    reportTypeRef.current = reportType;
  }, [reportType]);

  useEffect(() => {
    buTruCheckedRef.current = buTruChecked;
  }, [buTruChecked]);

  useEffect(() => {
    mauRef.current = mau;
  }, [mau]);

  // Load data on mount
  useEffect(() => {
    const ngay_ct1 = getFirstDayByReportType(reportType);
    const ngay_ct2 = toDate;
    const bu_tru = buTruChecked ? "2" : "1";

    fetchData({
      ngay_ct1,
      ngay_ct2,
      bu_tru,
      mau: mau || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Update ngay_ct1 when report type changes
  useEffect(() => {
    // This will be handled by the filter button, but we can auto-update if needed
  }, [reportType]);

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined || amount === "") return "";
    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <PageMeta title={t("balanceSheet.title")} description={t("balanceSheet.description")} />

      <div className="w-full h-[calc(100vh-80px)] p-2 md:p-4 overflow-hidden flex flex-col md:-mx-6 -mt-4 md:-mt-6">
        {/* Header - Sticky */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 mb-4 md:mb-6 max-w-full overflow-x-hidden flex-shrink-0 mt-4 md:mt-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6 text-center">
            📊 {t("balanceSheet.title")}
          </h1>

          {/* Filter Conditions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t("balanceSheet.toDate")}
              </label>
              <div className="relative">
                <Flatpickr
                  value={toDate ? new Date(toDate) : null}
                  onChange={(date) => {
                    const formatted = date[0] ? formatDateLocal(date[0]) : "";
                    setToDate(formatted);
                    toDateRef.current = formatted;
                  }}
                  options={{
                    dateFormat: "d/m/Y",
                    locale: Vietnamese,
                    allowInput: true,
                    disableMobile: false,
                    clickOpens: true,
                  }}
                  placeholder={t("balanceSheet.selectToDate")}
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
                {t("balanceSheet.reportType")}
              </label>
              <div>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={reportType}
                  onChange={(e) => {
                    const value = e.target.value;
                    setReportType(value);
                    reportTypeRef.current = value;
                  }}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("balanceSheet.reportTypeHint")}</p>
              </div>
            </div>

            <div className="flex items-center ">
              <div className="flex-1">
                <input
                  type="checkbox"
                  id="buTruCheckbox"
                  checked={buTruChecked}
                  onChange={(e) => {
                    setBuTruChecked(e.target.checked);
                    buTruCheckedRef.current = e.target.checked;
                  }}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  disabled={loading}
                />
                <label htmlFor="buTruCheckbox" className="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t("balanceSheet.offsetAccounts")}
                </label>
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
            📋 {t("balanceSheet.detail")}
          </h3>
          {loading ? (
            <div className="text-center py-8 flex-1 flex items-center justify-center">
              <div>
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{t("common.loading")}</p>
              </div>
            </div>
          ) : rawData.length > 0 ? (
            <div className="overflow-x-auto overflow-y-auto flex-1 -mx-2 md:mx-0">
              <table className="min-w-full border-collapse">
                <thead className="sticky top-0 z-20 bg-gray-100 dark:bg-gray-700">
                  <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                    <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                      {t("balanceSheet.stt")}
                    </th>
                    <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                      {t("balanceSheet.chiTieu")}
                    </th>
                    <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                      {t("balanceSheet.maSo")}
                    </th>
                    <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-right text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                      {t("balanceSheet.soCuoiNam")}
                    </th>
                    <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-right text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                      {t("balanceSheet.soDauNam")}
                    </th>
                    <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                      {t("balanceSheet.tk")}
                    </th>
                    <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                      {t("balanceSheet.congThuc")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-dashed divide-gray-300 dark:divide-gray-600">
                  {rawData.map((row, index) => {
                    const isBold = row.bold === 1;
                    const bgColor = isBold
                      ? "bg-gray-100 dark:bg-gray-700"
                      : index % 2 === 0
                      ? "bg-white dark:bg-gray-800"
                      : "bg-gray-50 dark:bg-gray-700/50";

                    // Highlight row if needed (based on image description)
                    const isHighlighted = row.ma_so === "137" || row.stt === "1370";

                    return (
                      <tr
                        key={row.stt_rec || row.stt || index}
                        className={`${bgColor} ${
                          isHighlighted ? "bg-yellow-200 dark:bg-yellow-900/30" : ""
                        } hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors`}
                      >
                        <td
                          className={`px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600 ${
                            isBold ? "font-bold" : ""
                          }`}
                        >
                          {row.stt || ""}
                        </td>
                        <td
                          className={`px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600 ${
                            isBold ? "font-bold" : ""
                          }`}
                        >
                          {row.chi_tieu || row.chi_tieu2 || ""}
                        </td>
                        <td
                          className={`px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600 ${
                            isBold ? "font-bold" : ""
                          }`}
                        >
                          {row.ma_so || ""}
                        </td>
                        <td
                          className={`px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white text-right border-r border-gray-200 dark:border-gray-600 ${
                            isBold ? "font-bold" : ""
                          }`}
                        >
                          {formatAmount(row.tien)}
                        </td>
                        <td
                          className={`px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white text-right border-r border-gray-200 dark:border-gray-600 ${
                            isBold ? "font-bold" : ""
                          }`}
                        >
                          {formatAmount(row.tien_nt)}
                        </td>
                        <td
                          className={`px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600 ${
                            isBold ? "font-bold" : ""
                          }`}
                        >
                          {row.tk || ""}
                        </td>
                        <td
                          className={`px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600 ${
                            isBold ? "font-bold" : ""
                          }`}
                        >
                          {row.cach_tinh || row.cong_thuc || ""}
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
      </div>
    </>
  );
};

export default BangCanDoiKeToanPage;
