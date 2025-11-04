import { useMemo, useState } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Vietnamese } from "flatpickr/dist/l10n/vn.js";
import { CalenderIcon } from "../../icons";
import { useVonBangTien } from "../../hooks/useVonBangTien";

const QuyTienMatPage = () => {
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

  return (
    <div className="w-full min-h-screen p-2 md:p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6 text-center">💰 Quỹ Tiền Mặt</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Từ ngày</label>
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
                placeholder="Chọn ngày bắt đầu"
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <CalenderIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Đến ngày</label>
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
                placeholder="Chọn ngày kết thúc"
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <CalenderIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mã ĐVCS</label>
            <input
              type="text"
              value="CTY"
              disabled
              className="w-full p-2 md:p-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tài khoản</label>
            <input
              type="text"
              value="1111"
              disabled
              className="w-full p-2 md:p-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
            />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-3 md:p-4 lg:p-6">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">📋 Chi tiết Quỹ Tiền Mặt</h3>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>Có lỗi khi tải dữ liệu!</p>
          </div>
        ) : data.length > 0 ? (
          <div className="overflow-x-auto -mx-2 md:mx-0">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    Ngày c.từ
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    Ngày lập c.từ
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    Mã c.từ
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    Số c.từ
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    Ông bà
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    Mã khách
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    Tên khách hàng
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    Diễn giải
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-right text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    Thu
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-right text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    Chi
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-right text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    Số tồn
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    Mã dự án
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Mã c.từ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-dashed divide-gray-300">
                {data.map((row, index) => {
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
            <p>Không có dữ liệu để hiển thị</p>
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
                      Số tồn đầu:
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
                      Tổng số thu, chi:
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
                      Số tồn cuối:
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

