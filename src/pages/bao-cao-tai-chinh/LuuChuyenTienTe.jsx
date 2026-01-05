import "flatpickr/dist/flatpickr.min.css";
import { Vietnamese } from "flatpickr/dist/l10n/vn.js";
import { useCallback, useEffect, useRef, useState } from "react";
import Flatpickr from "react-flatpickr";
import PageMeta from "../../components/common/PageMeta";
import useLuuChuyenTienTe from "../../hooks/useLuuChuyenTienTe";
import { useTranslation } from "../../hooks/useTranslation";
import { CalenderIcon } from "../../icons";

const LuuChuyenTienTePage = () => {
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

  // Calculate ngay_ct3: first day of current month, previous year
  const getFirstDayCurrentMonthPreviousYear = () => {
    const prevYear = currentYear - 1;
    return `${prevYear}-${String(currentMonth).padStart(2, "0")}-01`;
  };

  const firstDayCurrentMonthPrevYear = getFirstDayCurrentMonthPreviousYear();

  const [ngayCt1, setNgayCt1] = useState(firstDayOfMonth);
  const [ngayCt2, setNgayCt2] = useState(today);
  const [ngayCt3, setNgayCt3] = useState(firstDayCurrentMonthPrevYear);
  const [ngayCt4, setNgayCt4] = useState(today);
  const [luyKeChecked, setLuyKeChecked] = useState(false);
  const [mau, setMau] = useState("");

  const ngayCt1Ref = useRef(firstDayOfMonth);
  const ngayCt2Ref = useRef(today);
  const ngayCt3Ref = useRef(firstDayCurrentMonthPrevYear);
  const ngayCt4Ref = useRef(today);
  const luyKeCheckedRef = useRef(false);
  const mauRef = useRef("");

  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);

  const luuChuyenTienTeMutation = useLuuChuyenTienTe();

  const fetchData = useCallback(
    async (payload = {}) => {
      try {
        const ngay_ct1 = payload.ngay_ct1 || ngayCt1Ref.current;
        const ngay_ct2 = payload.ngay_ct2 || ngayCt2Ref.current;
        const ngay_ct3 = payload.ngay_ct3 || ngayCt3Ref.current;
        const ngay_ct4 = payload.ngay_ct4 || ngayCt4Ref.current;
        const luyke = payload.luyke !== undefined ? payload.luyke : luyKeCheckedRef.current ? "1" : "0";
        const ma_dvcs = payload.ma_dvcs || "CTY";

        const apiPayload = {
          ngay_ct1,
          ngay_ct2,
          ngay_ct3,
          ngay_ct4,
          luyke,
          ma_dvcs,
          mau: "GLTCD2003",
        };

        setLoading(true);
        const response = await luuChuyenTienTeMutation.mutateAsync(apiPayload);
        setRawData(response?.data || []);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        setRawData([]);
      } finally {
        setLoading(false);
      }
    },
    [luuChuyenTienTeMutation]
  );

  const handleFilter = useCallback(() => {
    const luyke = luyKeCheckedRef.current ? "1" : "0";

    fetchData({
      ngay_ct1: ngayCt1Ref.current,
      ngay_ct2: ngayCt2Ref.current,
      ngay_ct3: ngayCt3Ref.current,
      ngay_ct4: ngayCt4Ref.current,
      luyke,
      mau: mauRef.current,
    });
  }, [fetchData]);

  // Update refs when state changes
  useEffect(() => {
    ngayCt1Ref.current = ngayCt1;
  }, [ngayCt1]);

  useEffect(() => {
    ngayCt2Ref.current = ngayCt2;
  }, [ngayCt2]);

  useEffect(() => {
    ngayCt3Ref.current = ngayCt3;
  }, [ngayCt3]);

  useEffect(() => {
    ngayCt4Ref.current = ngayCt4;
  }, [ngayCt4]);

  useEffect(() => {
    luyKeCheckedRef.current = luyKeChecked;
  }, [luyKeChecked]);

  useEffect(() => {
    mauRef.current = mau;
  }, [mau]);

  // Load data on mount
  useEffect(() => {
    const luyke = luyKeChecked ? "1" : "0";

    fetchData({
      ngay_ct1: ngayCt1,
      ngay_ct2: ngayCt2,
      ngay_ct3: ngayCt3,
      ngay_ct4: ngayCt4,
      luyke,
      mau: mau || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined || amount === "") return "";
    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <PageMeta title={t("cashFlow.title")} description={t("cashFlow.description")} />

      <div className="w-full h-[calc(100vh-80px)] p-2 md:p-4 overflow-hidden flex flex-col">
        {/* Header - Sticky */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 mb-4 md:mb-6 max-w-full overflow-x-hidden flex-shrink-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6 text-center">
            📊 {t("cashFlow.title")}
          </h1>

          {/* Filter Conditions */}
          <div className="space-y-4 mb-4 md:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t("cashFlow.fromDate")}
                </label>
                <div className="relative">
                  <Flatpickr
                    value={ngayCt1 ? new Date(ngayCt1) : null}
                    onChange={(date) => {
                      const formatted = date[0] ? formatDateLocal(date[0]) : "";
                      setNgayCt1(formatted);
                      ngayCt1Ref.current = formatted;
                    }}
                    options={{
                      dateFormat: "d/m/Y",
                      locale: Vietnamese,
                      allowInput: true,
                      disableMobile: false,
                      clickOpens: true,
                      maxDate: ngayCt2 ? new Date(ngayCt2) : null,
                    }}
                    placeholder={t("cashFlow.selectFromDate")}
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
                  {t("cashFlow.toDate")}
                </label>
                <div className="relative">
                  <Flatpickr
                    value={ngayCt2 ? new Date(ngayCt2) : null}
                    onChange={(date) => {
                      const formatted = date[0] ? formatDateLocal(date[0]) : "";
                      setNgayCt2(formatted);
                      ngayCt2Ref.current = formatted;
                    }}
                    options={{
                      dateFormat: "d/m/Y",
                      locale: Vietnamese,
                      allowInput: true,
                      disableMobile: false,
                      clickOpens: true,
                      minDate: ngayCt1 ? new Date(ngayCt1) : null,
                    }}
                    placeholder={t("cashFlow.selectToDate")}
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
                  {t("cashFlow.prevPeriodStartDate")}
                </label>
                <div className="relative">
                  <Flatpickr
                    value={ngayCt3 ? new Date(ngayCt3) : null}
                    onChange={(date) => {
                      const formatted = date[0] ? formatDateLocal(date[0]) : "";
                      setNgayCt3(formatted);
                      ngayCt3Ref.current = formatted;
                    }}
                    options={{
                      dateFormat: "d/m/Y",
                      locale: Vietnamese,
                      allowInput: true,
                      disableMobile: false,
                      clickOpens: true,
                      maxDate: ngayCt4 ? new Date(ngayCt4) : null,
                    }}
                    placeholder={t("cashFlow.selectPrevPeriodStartDate")}
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
                  {t("cashFlow.prevPeriodEndDate")}
                </label>
                <div className="relative">
                  <Flatpickr
                    value={ngayCt4 ? new Date(ngayCt4) : null}
                    onChange={(date) => {
                      const formatted = date[0] ? formatDateLocal(date[0]) : "";
                      setNgayCt4(formatted);
                      ngayCt4Ref.current = formatted;
                    }}
                    options={{
                      dateFormat: "d/m/Y",
                      locale: Vietnamese,
                      allowInput: true,
                      disableMobile: false,
                      clickOpens: true,
                      minDate: ngayCt3 ? new Date(ngayCt3) : null,
                    }}
                    placeholder={t("cashFlow.selectPrevPeriodEndDate")}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    disabled={loading}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <CalenderIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
              </div>

              <div className="flex items-end ">
                <div className="flex-1 mb-4">
                  <input
                    type="checkbox"
                    id="luyKeCheckbox"
                    checked={luyKeChecked}
                    onChange={(e) => {
                      setLuyKeChecked(e.target.checked);
                      luyKeCheckedRef.current = e.target.checked;
                    }}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    disabled={loading}
                  />
                  <label
                    htmlFor="luyKeCheckbox"
                    className="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {t("cashFlow.cumulative")}
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
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 md:p-4 lg:p-6 max-w-full flex-1 flex flex-col overflow-hidden">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-3 md:mb-4 flex-shrink-0">
            📋 {t("cashFlow.detail")}
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
                    <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600 min-w-[200px]">
                      {t("cashFlow.chiTieu")}
                    </th>
                    <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                      {t("cashFlow.maSo")}
                    </th>
                    <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-right text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                      {t("cashFlow.kyNay")}
                    </th>
                    <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-right text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                      {t("cashFlow.kyTruoc")}
                    </th>
                    <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                      {t("cashFlow.congThuc")}
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

                    // Highlight row if it's a main category
                    const isHighlighted = row.ma_so === "01" || row.ma_so === "10" || row.ma_so === "20";

                    return (
                      <tr
                        key={row.stt_rec || row.stt || index}
                        className={`${bgColor} ${isHighlighted ? "bg-orange-100 dark:bg-orange-900/30" : ""
                          } hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors`}
                      >
                        <td
                          className={`px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600 ${isBold ? "font-bold" : ""
                            }`}
                        >
                          {row.stt || ""}
                        </td>
                        <td
                          className={`px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600 min-w-[200px] ${isBold ? "font-bold" : ""
                            }`}
                        >
                          {row.chi_tieu || row.chi_tieu2 || ""}
                        </td>
                        <td
                          className={`px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600 ${isBold ? "font-bold" : ""
                            }`}
                        >
                          {row.ma_so || ""}
                        </td>
                        <td
                          className={`px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white text-right border-r border-gray-200 dark:border-gray-600 ${isBold ? "font-bold" : ""
                            }`}
                        >
                          {formatAmount(row.ky_nay)}
                        </td>
                        <td
                          className={`px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 whitespace-nowrap text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white text-right border-r border-gray-200 dark:border-gray-600 ${isBold ? "font-bold" : ""
                            }`}
                        >
                          {formatAmount(row.ky_truoc)}
                        </td>
                        <td
                          className={`px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-[10px] md:text-xs lg:text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600 ${isBold ? "font-bold" : ""
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

export default LuuChuyenTienTePage;
