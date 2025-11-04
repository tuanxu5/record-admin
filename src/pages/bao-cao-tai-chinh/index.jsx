import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Vietnamese } from "flatpickr/dist/l10n/vn.js";
import { CalenderIcon } from "../../icons";
import useBangKeChungTu from "../../hooks/useBangKeChungTu";

const BaoCaoTaiChinhPage = () => {
  const [chartType, setChartType] = useState("line");

  // Mặc định: từ 1/1 năm hiện tại đến ngày hiện tại
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const startOfYear = `${currentYear}-01-01`;
  const today = currentDate.toISOString().split('T')[0]; // Format YYYY-MM-DD

  const [dateRange, setDateRange] = useState({
    startDate: startOfYear,
    endDate: today,
  });
  const [maTaiKhoan, setMaTaiKhoan] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const bangKeChungTuMutation = useBangKeChungTu();

  // Hàm gọi API để lấy dữ liệu
  const fetchData = useCallback(async (payload = {}) => {
    try {
      // Luôn truyền các trường bắt buộc, nếu payload rỗng thì giá trị sẽ là rỗng
      const apiPayload = {
        configName: "bang_ke_chung_tu",
        ngay_ct1: payload.ngay_ct1 || dateRange.startDate || "",
        ngay_ct2: payload.ngay_ct2 || dateRange.endDate || "",
        ma_tai_khoan: payload.ma_tai_khoan || "",
        chung_tu_tu_so: payload.chung_tu_tu_so || "",
        den_so: payload.den_so || "",
        ma_dvcs: payload.ma_dvcs || "",
      };
      console.log("Gọi API với payload:", apiPayload);
      setLoading(true);
      const response = await bangKeChungTuMutation.mutateAsync(apiPayload);
      const rawData = Array.isArray(response)
        ? response
        : (response?.data || response?.rows || []);
      const totalsData = Array.isArray(response?.totals)
        ? (response.totals || [])
        : [];
      console.log("Dữ liệu nhận được từ API:", { rawData, totalsData });
      setData(rawData);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      // Log chi tiết lỗi từ API
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        toast.error(`Lỗi ${error.response.status}: ${error.response.data?.message || error.response.data || "Có lỗi khi tải dữ liệu báo cáo!"}`);
      } else if (error.request) {
        console.error("Request:", error.request);
        toast.error("Không nhận được phản hồi từ server!");
      } else {
        console.error("Error message:", error.message);
        toast.error("Có lỗi khi tải dữ liệu báo cáo!");
      }
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [bangKeChungTuMutation, dateRange]);

  // Gọi API khi component mount với dateRange mặc định
  useEffect(() => {
    const payload = {
      ngay_ct1: dateRange.startDate,
      ngay_ct2: dateRange.endDate,
    };
    fetchData(payload);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilter = () => {
    const payload = {
      ngay_ct1: dateRange.startDate,
      ngay_ct2: dateRange.endDate,
    };
    if (maTaiKhoan) payload.ma_tai_khoan = maTaiKhoan;
    // Thêm các trường khác nếu cần
    // payload.chung_tu_tu_so = ...;
    // payload.den_so = ...;
    // payload.ma_dvcs = ...;

    fetchData(payload);
  };

  // Chuẩn bị dữ liệu cho biểu đồ từ API response
  const prepareChartData = () => {
    if (!data || data.length === 0) return { labels: [], revenues: [], costs: [], profits: [] };

    const labels = data.map(item => item.period || item.ngay_ct || item.ten_khoan || `Item ${data.indexOf(item) + 1}`);
    const revenues = data.map(item => item.revenue || item.thu_nhap || item.so_tien_thu || 0);
    const costs = data.map(item => item.cost || item.chi_phi || item.so_tien_chi || 0);
    const profits = revenues.map((rev, idx) => rev - costs[idx]);

    return { labels, revenues, costs, profits };
  };

  const { labels, revenues, costs, profits } = prepareChartData();

  // Cấu hình ApexCharts
  const chartOptions = {
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
        name: "Thu nhập",
        data: revenues,
        color: "#10B981",
      },
      {
        name: "Chi phí",
        data: costs,
        color: "#EF4444",
      },
      {
        name: "Lợi nhuận",
        data: profits,
        color: "#3B82F6",
      },
    ],
    xaxis: {
      categories: labels,
      title: {
        text: "Thời gian",
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
      text: "Biểu đồ Thu Chi Theo Quý",
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

  // Component ApexChart đơn giản
  const ApexChart = ({ options, series, type, height }) => {
    useEffect(() => {
      // Tạo chart container
      const chartContainer = document.getElementById("apex-chart");
      if (!chartContainer) return;

      // Xóa chart cũ nếu có
      chartContainer.innerHTML = "";

      // Tính toán giá trị max trước
      const maxValue = Math.max(...revenues, ...costs, ...profits.map(Math.abs));

      // Tạo chart mới bằng SVG đơn giản (mock ApexCharts)
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", height || "400");
      svg.setAttribute("viewBox", "0 0 800 400");

      // Vẽ grid và labels trục Y
      for (let i = 0; i <= 10; i++) {
        const y = 40 + i * 32;

        // Vẽ đường grid ngang
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", "60");
        line.setAttribute("y1", y);
        line.setAttribute("x2", "740");
        line.setAttribute("y2", y);
        line.setAttribute("stroke", "#E5E7EB");
        line.setAttribute("stroke-width", "1");
        svg.appendChild(line);

        // Thêm labels trục Y (cột mốc giá trị)
        const value = (maxValue * (10 - i)) / 10;
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", "55");
        text.setAttribute("y", y + 4);
        text.setAttribute("text-anchor", "end");
        text.setAttribute("font-size", "10");
        text.setAttribute("fill", "#6B7280");
        text.textContent = new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
          minimumFractionDigits: 0,
          notation: "compact",
        }).format(value);
        svg.appendChild(text);
      }
      const chartWidth = 680;
      const chartHeight = 320;
      const pointWidth = chartWidth / (labels.length - 1 || 1);

      series.forEach((serie, serieIndex) => {
        const color = serie.color;

        if (type === "line") {
          // Vẽ đường
          let pathData = "";
          serie.data.forEach((value, index) => {
            const x = 60 + index * pointWidth;
            const y = 360 - (value / maxValue) * chartHeight;
            if (index === 0) {
              pathData += `M ${x} ${y}`;
            } else {
              pathData += ` L ${x} ${y}`;
            }
          });

          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          path.setAttribute("d", pathData);
          path.setAttribute("stroke", color);
          path.setAttribute("stroke-width", "3");
          path.setAttribute("fill", "none");
          svg.appendChild(path);

          // Vẽ điểm
          serie.data.forEach((value, index) => {
            const x = 60 + index * pointWidth;
            const y = 360 - (value / maxValue) * chartHeight;

            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", x);
            circle.setAttribute("cy", y);
            circle.setAttribute("r", "4");
            circle.setAttribute("fill", color);
            svg.appendChild(circle);
          });
        } else {
          // Vẽ cột
          const barWidth = (pointWidth * 0.6) / series.length;
          serie.data.forEach((value, index) => {
            const x = 60 + index * pointWidth - (series.length * barWidth) / 2 + serieIndex * barWidth;
            const y = 360 - (value / maxValue) * chartHeight;
            const height = (value / maxValue) * chartHeight;

            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", x);
            rect.setAttribute("y", y);
            rect.setAttribute("width", barWidth);
            rect.setAttribute("height", height);
            rect.setAttribute("fill", color);
            rect.setAttribute("rx", "2");
            svg.appendChild(rect);
          });
        }
      });

      // Thêm labels trục X
      labels.forEach((label, index) => {
        const x = 60 + index * pointWidth;
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x);
        text.setAttribute("y", "385");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-size", "12");
        text.setAttribute("fill", "#6B7280");
        text.textContent = label;
        svg.appendChild(text);
      });

      chartContainer.appendChild(svg);
    }, [options, series, type, height]);

    return <div id="apex-chart" className="w-full"></div>;
  };

  return (
    <div className="w-full min-h-screen p-2 md:p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6 text-center">📋 Bảng Kê Chứng Từ</h1>

        {/* Controls */}
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
                disabled={loading}
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
                disabled={loading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <CalenderIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mã tài khoản</label>
            <input
              type="text"
              value={maTaiKhoan}
              onChange={(e) => setMaTaiKhoan(e.target.value)}
              placeholder="Nhập mã tài khoản..."
              className="w-full p-2 md:p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-sm"
            />
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Loại biểu đồ</label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="w-full p-2 md:p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-sm"
              >
                <option value="line">📈 Biểu đồ đường</option>
                <option value="bar">📊 Biểu đồ cột</option>
              </select>
            </div>
            <button
              onClick={handleFilter}
              disabled={loading}
              className="px-3 py-2 md:px-4 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base whitespace-nowrap"
            >
              {loading ? "🔄" : "🔍"} {loading ? "Đang tải..." : "Lọc"}
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-lg p-3 md:p-4 mb-4 md:mb-6">
        <ApexChart options={chartOptions} series={chartOptions.series} type={chartType} height="400" />
      </div>
      {/* Bảng kê chứng từ */}
      <div className="bg-white rounded-xl shadow-lg p-3 md:p-4 lg:p-6">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">📋 Chi tiết bảng Kê Chứng Từ</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : data.length > 0 ? (
          <div className="overflow-x-auto -mx-2 md:mx-0">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    <div className="flex items-center gap-1 md:gap-2">
                      <span>Ngày c.từ</span>
                    </div>
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    <div className="flex items-center gap-1 md:gap-2">
                      <span>Mã c.ti</span>
                    </div>
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    <div className="flex items-center gap-1 md:gap-2">
                      <span>Số c.từ</span>
                    </div>
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    <div className="flex items-center gap-1 md:gap-2">
                      <span>Mã khách</span>
                    </div>
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    <div className="flex items-center gap-1 md:gap-2">
                      <span>Tên khách hàng</span>
                    </div>
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    <div className="flex items-center gap-1 md:gap-2">
                      <span>Diễn giải</span>
                    </div>
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    <div className="flex items-center gap-1 md:gap-2">
                      <span>Tk</span>
                    </div>
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    <div className="flex items-center gap-1 md:gap-2">
                      <span>Tk đ.ứng</span>
                    </div>
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-right text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    <div className="flex items-center justify-end gap-1 md:gap-2">
                      <span>Ps nợ</span>
                    </div>
                  </th>
                  <th className="px-2 py-2 md:px-3 md:py-2 lg:px-4 lg:py-3 text-right text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    <div className="flex items-center justify-end gap-1 md:gap-2">
                      <span>Ps có</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-dashed divide-gray-300">
                {data.map((row, index) => {
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
            <p>Không có dữ liệu để hiển thị</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BaoCaoTaiChinhPage;
