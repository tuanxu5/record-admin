import "flatpickr/dist/flatpickr.min.css";
import { Vietnamese } from "flatpickr/dist/l10n/vn.js";
import { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import Flatpickr from "react-flatpickr";
import { useVonBangTien } from "../../hooks/useVonBangTien";
import { CalenderIcon } from "../../icons";

const QuyTienMatPage = () => {
  const [periodType, setPeriodType] = useState("ngay"); // ngay, tuan, thang, nam
  const [chartType, setChartType] = useState("bar"); // bar, pie

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

  // Hàm lấy key theo period type
  const getPeriodKey = (dateString, type) => {
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
          return `Tuần ${week}/${year}`;
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
  };

  // Hàm nhóm dữ liệu Thu, Chi, Số tồn theo period
  const groupDataByPeriod = useMemo(() => {
    if (!data || data.length === 0) return { labels: [], thu: [], chi: [], soTon: [] };

    const grouped = {};

    data.forEach((item) => {
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
  }, [data, periodType]);

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

  // Cấu hình ApexCharts cho Thu, Chi, Số tồn
  const chartOptions = useMemo(() => {
    // Pie chart options
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
        labels: ["Thu", "Chi", "Số tồn"],
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
          text: `Tổng hợp Thu, Chi, Số tồn theo ${periodType === "ngay" ? "Ngày" : periodType === "tuan" ? "Tuần" : periodType === "thang" ? "Tháng" : "Năm"}`,
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

    // Bar chart options
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
          name: "Thu",
          data: groupDataByPeriod.thu,
          color: "#10B981",
        },
        {
          name: "Chi",
          data: groupDataByPeriod.chi,
          color: "#EF4444",
        },
        {
          name: "Số tồn",
          data: groupDataByPeriod.soTon,
          color: "#3B82F6",
        },
      ],
      xaxis: {
        categories: groupDataByPeriod.labels,
        title: {
          text: periodType === "ngay" ? "Ngày" : periodType === "tuan" ? "Tuần" : periodType === "thang" ? "Tháng" : "Năm",
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
          text: "Số tiền (VND)",
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
        text: `Biểu đồ Thu, Chi, Số tồn theo ${periodType === "ngay" ? "Ngày" : periodType === "tuan" ? "Tuần" : periodType === "thang" ? "Tháng" : "Năm"}`,
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
  }, [chartType, groupDataByPeriod, totalThu, totalChi, totalSoTon, periodType]);

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
              Theo Ngày
            </button>
            <button
              onClick={() => setPeriodType("tuan")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${periodType === "tuan"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              Theo Tuần
            </button>
            <button
              onClick={() => setPeriodType("thang")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${periodType === "thang"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              Theo Tháng
            </button>
            <button
              onClick={() => setPeriodType("nam")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${periodType === "nam"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              Theo Năm
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">Loại biểu đồ:</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-sm"
            >
              <option value="pie">🟣 Biểu đồ tròn</option>
              <option value="bar">📊 Biểu đồ cột</option>
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
              <p>Không có dữ liệu để hiển thị biểu đồ</p>
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
              <p>Không có dữ liệu để hiển thị biểu đồ</p>
            </div>
          )
        )}
      </div>

      {/* Table */}
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

