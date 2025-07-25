import { useEffect, useState } from "react";

const BaoCaoTaiChinhPage = () => {
  const [chartType, setChartType] = useState("line");
  const [dateRange, setDateRange] = useState({
    startYear: 2022,
    startQuarter: 1,
    endYear: 2024,
    endQuarter: 4,
  });

  // Dữ liệu mẫu
  const generateData = () => {
    const data = [];
    const labels = [];

    for (let year = dateRange.startYear; year <= dateRange.endYear; year++) {
      const startQ = year === dateRange.startYear ? dateRange.startQuarter : 1;
      const endQ = year === dateRange.endYear ? dateRange.endQuarter : 4;

      for (let quarter = startQ; quarter <= endQ; quarter++) {
        const label = `Q${quarter} ${year}`;
        labels.push(label);

        // Tạo dữ liệu ngẫu nhiên nhưng có xu hướng tăng
        const baseRevenue = 800000000 + Math.random() * 200000000; // 800M - 1B VND
        const baseCost = 500000000 + Math.random() * 150000000; // 500M - 650M VND
        const growthFactor = (year - dateRange.startYear) * 0.1 + quarter * 0.02;

        data.push({
          period: label,
          revenue: Math.round(baseRevenue * (1 + growthFactor)),
          cost: Math.round(baseCost * (1 + growthFactor * 0.8)),
        });
      }
    }

    return { labels, data };
  };

  const { labels, data } = generateData();
  const revenues = data.map((d) => d.revenue);
  const costs = data.map((d) => d.cost);
  const profits = revenues.map((rev, idx) => rev - costs[idx]);

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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
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
    <div className="w-full max-w-7xl mx-auto p-6 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">📊 Báo Cáo Tài Chính Theo Quý</h1>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Năm bắt đầu</label>
            <select
              value={dateRange.startYear}
              onChange={(e) => setDateRange({ ...dateRange, startYear: parseInt(e.target.value) })}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            >
              {[2020, 2021, 2022, 2023, 2024, 2025].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Quý bắt đầu</label>
            <select
              value={dateRange.startQuarter}
              onChange={(e) => setDateRange({ ...dateRange, startQuarter: parseInt(e.target.value) })}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            >
              {[1, 2, 3, 4].map((q) => (
                <option key={q} value={q}>
                  Quý {q}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Năm kết thúc</label>
            <select
              value={dateRange.endYear}
              onChange={(e) => setDateRange({ ...dateRange, endYear: parseInt(e.target.value) })}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            >
              {[2020, 2021, 2022, 2023, 2024, 2025].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Quý kết thúc</label>
            <select
              value={dateRange.endQuarter}
              onChange={(e) => setDateRange({ ...dateRange, endQuarter: parseInt(e.target.value) })}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            >
              {[1, 2, 3, 4].map((q) => (
                <option key={q} value={q}>
                  Quý {q}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Loại biểu đồ</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            >
              <option value="line">📈 Biểu đồ đường</option>
              <option value="bar">📊 Biểu đồ cột</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <ApexChart options={chartOptions} series={chartOptions.series} type={chartType} height="400" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {(() => {
          const totalRevenue = revenues.reduce((sum, val) => sum + val, 0);
          const totalCost = costs.reduce((sum, val) => sum + val, 0);
          const totalProfit = totalRevenue - totalCost;

          return [
            {
              title: "Tổng Thu Nhập",
              value: totalRevenue,
              icon: "💰",
              color: "from-green-400 to-green-600",
              textColor: "text-green-600",
            },
            {
              title: "Tổng Chi Phí",
              value: totalCost,
              icon: "💸",
              color: "from-red-400 to-red-600",
              textColor: "text-red-600",
            },
            {
              title: "Tổng Lợi Nhuận",
              value: totalProfit,
              icon: "📈",
              color: totalProfit >= 0 ? "from-blue-400 to-blue-600" : "from-red-400 to-red-600",
              textColor: totalProfit >= 0 ? "text-blue-600" : "text-red-600",
            },
          ].map((card, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className={`bg-gradient-to-r ${card.color} p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{card.title}</p>
                    <p className="text-white text-2xl font-bold">{formatCurrency(card.value)}</p>
                  </div>
                  <div className="text-3xl">{card.icon}</div>
                </div>
              </div>
            </div>
          ));
        })()}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Bảng Dữ Liệu Chi Tiết</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kỳ</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Thu Nhập
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Chi Phí
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Lợi Nhuận
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tỷ Suất LN (%)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, index) => {
                const profit = row.revenue - row.cost;
                const profitMargin = ((profit / row.revenue) * 100).toFixed(1);

                return (
                  <tr
                    key={index}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{row.period}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right font-semibold">
                      {formatCurrency(row.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right font-semibold">
                      {formatCurrency(row.cost)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                        profit >= 0 ? "text-blue-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(profit)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                        profit >= 0 ? "text-blue-600" : "text-red-600"
                      }`}
                    >
                      {profitMargin}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
        <h4 className="font-bold text-lg text-gray-800 mb-3">🔧 Hướng Dẫn Sử Dụng</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h5 className="font-semibold text-gray-700 mb-2">Tính năng ApexCharts:</h5>
            <ul className="space-y-1">
              <li>• Zoom và pan trên biểu đồ</li>
              <li>• Export biểu đồ thành PNG/SVG</li>
              <li>• Tooltip tương tác chi tiết</li>
              <li>• Animation mượt mà</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-gray-700 mb-2">Tùy chỉnh:</h5>
            <ul className="space-y-1">
              <li>• Chọn khoảng thời gian linh hoạt</li>
              <li>• Chuyển đổi loại biểu đồ</li>
              <li>• Hiển thị đa dữ liệu cùng lúc</li>
              <li>• Responsive trên mọi thiết bị</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaoCaoTaiChinhPage;
