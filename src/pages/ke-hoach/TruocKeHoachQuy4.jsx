import { useMemo } from "react";
import Chart from "react-apexcharts";
import { useTranslation } from "../../hooks/useTranslation";
import { useTheme } from "../../hooks/useTheme";

const costStructureData = [
  {
    category: { vi: "Chi phí nhân sự", zh: "人力成本" },
    items: [
      {
        stt: 1,
        detail: { vi: "Phân chia doanh thu Idol", zh: "主播(爱豆)分成" },
        note: "Doanh thu trực tiếp",
        amount: 180_000_000,
        percentage: 21,
      },
      {
        stt: 2,
        detail: { vi: "MC / Vận hành nội dung", zh: "MC主持/内容运营" },
        note: "3 người x 15tr",
        amount: 145_300_000,
        percentage: 17,
      },
      {
        stt: 3,
        detail: { vi: "Trang điểm / Trang phục / Nhảy", zh: "化妆师/服装师/舞蹈师" },
        note: "Theo buổi",
        amount: 60_000_000,
        percentage: 7,
      },
      {
        stt: 4,
        detail: { vi: "Trợ lý / HR / Hành chính", zh: "财务・HR・行政工资" },
        note: "Lương cố định",
        amount: 237_700_000,
        percentage: 28,
      },
    ],
  },
  {
    category: { vi: "Chi phí sản xuất", zh: "制作成本" },
    items: [
      {
        stt: 5,
        detail: { vi: "Thuê địa điểm quay", zh: "拍摄场地租赁" },
        note: "Theo tháng",
        amount: 0,
        percentage: 0,
      },
      {
        stt: 6,
        detail: { vi: "Đạo cụ / Trang phục", zh: "道具/服装采购" },
        note: "Mua sắm nhỏ",
        amount: 18_000_000,
        percentage: 2,
      },
      {
        stt: 7,
        detail: { vi: "Thuê thiết bị quay", zh: "拍摄设备租赁" },
        note: "Ánh sáng / Camera",
        amount: 0,
        percentage: 0,
      },
      {
        stt: 8,
        detail: { vi: "Dịch vụ hậu kỳ", zh: "剪辑与后期外包" },
        note: "Chỉnh sửa video",
        amount: 10_000_000,
        percentage: 1,
      },
    ],
  },
  {
    category: { vi: "Chi phí marketing", zh: "营销成本" },
    items: [
      {
        stt: 9,
        detail: { vi: "Quảng cáo TikTok", zh: "抖音广告投入" },
        note: "Nạp chính thức",
        amount: 0,
        percentage: 0,
      },
      {
        stt: 10,
        detail: { vi: "Hợp tác KOL", zh: "KOL合作" },
        note: "Video quảng bá",
        amount: 0,
        percentage: 0,
      },
      {
        stt: 11,
        detail: { vi: "Chi phí sự kiện", zh: "线下活动与奖品" },
        note: "Tặng thưởng",
        amount: 12_000_000,
        percentage: 1,
      },
    ],
  },
  {
    category: { vi: "Chi phí hành chính", zh: "行政管理费用" },
    items: [
      {
        stt: 12,
        detail: { vi: "Thuê văn phòng", zh: "办公室租金" },
        note: "Theo tháng",
        amount: 159_172_052,
        percentage: 18,
      },
      {
        stt: 13,
        detail: { vi: "Internet / Phần mềm", zh: "网络与软件服务" },
        note: "Dịch vụ hàng tháng",
        amount: 24_000_000,
        percentage: 3,
      },
      {
        stt: 14,
        detail: { vi: "Kế toán / Pháp lý", zh: "财税/法务外包" },
        note: "Thuê ngoài",
        amount: 0,
        percentage: 0,
      },
      {
        stt: 15,
        detail: { vi: "Điện nước / Khác", zh: "水电及其他杂项" },
        note: "Chi phí nhỏ",
        amount: 18_000_000,
        percentage: 2,
      },
    ],
  },
  {
    category: { vi: "Thuế & Phí", zh: "税费" },
    items: [
      {
        stt: 16,
        detail: { vi: "Thuế GTGT (VAT)", zh: "增值税(VAT)" },
        note: "Dự kiến 5-10%",
        amount: 0,
        percentage: 0,
      },
      {
        stt: 17,
        detail: { vi: "Thuế TNDN (CIT)", zh: "企业所得税(CIT)" },
        note: "Dự kiến 20%",
        amount: 0,
        percentage: 0,
      },
    ],
  },
];

const numberFormatter = new Intl.NumberFormat("vi-VN");

export default function TruocKeHoachQuy4Page() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const tableRows = useMemo(
    () =>
      costStructureData.flatMap((group) =>
        group.items.map((item) => ({
          ...item,
          category: group.category,
        }))
      ),
    []
  );

  const totals = useMemo(() => {
    const amount = tableRows.reduce((sum, row) => sum + (row.amount || 0), 0);
    const percentage = tableRows.reduce((sum, row) => sum + (row.percentage || 0), 0);
    return { amount, percentage };
  }, [tableRows]);

  const chartData = useMemo(() => {
    const slices = tableRows.filter((row) => row.amount > 0);
    return {
      labels: slices.map((row) => `${row.detail.zh} / ${row.detail.vi}`),
      series: slices.map((row) => row.amount),
      percentages: slices.map((row) => row.percentage),
    };
  }, [tableRows]);

  const chartOptions = useMemo(
    () => ({
      chart: {
        type: "pie",
        fontFamily: "Outfit, sans-serif",
      },
      labels: chartData.labels,
      legend: {
        position: "bottom",
        fontSize: "13px",
        labels: {
          colors: theme === "dark" ? "#E5E7EB" : "#374151",
        },
      },
      title: {
        text: "成本结构比例 Cost Structure",
        align: "center",
        style: {
          fontSize: "18px",
          fontWeight: 600,
          color: theme === "dark" ? "#E5E7EB" : "#111827",
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (_value, opts) => {
          const percentage = chartData.percentages[opts.seriesIndex] || 0;
          return `${percentage}%`;
        },
        style: {
          fontSize: "12px",
          colors: ["#FFFFFF"],
        },
        dropShadow: {
          enabled: true,
        },
      },
      tooltip: {
        y: {
          formatter: (value) => numberFormatter.format(value),
          title: {
            formatter: (_seriesName, opts) => chartData.labels[opts.seriesIndex] || "",
          },
        },
      },
      theme: {
        mode: theme === "dark" ? "dark" : "light",
      },
      colors: [
        "#2E93fA",
        "#66DA26",
        "#546E7A",
        "#E91E63",
        "#FF9800",
        "#775DD0",
        "#4CAF50",
        "#FBC02D",
        "#FF5722",
        "#26C6DA",
      ],
    }),
    [chartData, theme]
  );

  return (
    <div className="space-y-6">
     

      <div className="rounded-sm shadow-default dark:border-strokedark dark:bg-boxdark overflow-hidden">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 className="font-semibold text-black dark:text-white">
            {t("keHoach.preQuarter4Title")}
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {t("keHoach.preQuarter4Description")}
          </p>
        </div>
        <div className="rounded-sm shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="p-6.5">
          <Chart options={chartOptions} series={chartData.series} type="pie" height={360} />
        </div>
      </div>

        <div className="p-6.5">
          <div className="rounded-lg border border-stroke dark:border-strokedark overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-stroke dark:border-strokedark">
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 dark:text-gray-300 border-r border-stroke dark:border-strokedark w-24">
                    占比 / %
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-700 dark:text-gray-300 border-r border-stroke dark:border-strokedark w-12">
                    STT
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 dark:text-gray-300 border-r border-stroke dark:border-strokedark min-w-[160px]">
                    Loại chi phí
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 dark:text-gray-300 border-r border-stroke dark:border-strokedark min-w-[180px]">
                    Hạng mục chi tiết
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 dark:text-gray-300 border-r border-stroke dark:border-strokedark min-w-[180px]">
                    Ghi chú
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-700 dark:text-gray-300">
                    Số tiền dự kiến (VND)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-stroke dark:divide-strokedark">
                {tableRows.map((row) => (
                  <tr key={row.stt} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-stroke dark:border-strokedark">
                      {row.percentage}%
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border-r border-stroke dark:border-strokedark">
                      {row.stt}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-stroke dark:border-strokedark">
                      <span className="block font-medium">{row.category.vi}</span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">{row.category.zh}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-stroke dark:border-strokedark">
                      <span className="block font-medium">{row.detail.vi}</span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">{row.detail.zh}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-r border-stroke dark:border-strokedark">
                      {row.note ? (
                        <span className="inline-block px-2 py-1 rounded-md bg-gray-100 hover:bg-yellow-200 dark:bg-gray-800/70 dark:hover:bg-yellow-500/20 transition-colors">
                          {row.note}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {numberFormatter.format(row.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 dark:bg-gray-800 font-semibold">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-stroke dark:border-strokedark">
                    {totals.percentage}%
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border-r border-stroke dark:border-strokedark">
                    —
                  </td>
                  <td colSpan="3" className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-stroke dark:border-strokedark">
                    Tổng cộng
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-gray-100">
                    {numberFormatter.format(totals.amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


