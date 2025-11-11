import React from "react";
import { useTranslation } from "../../hooks/useTranslation";

export default function ChiPhiQuy4Page() {
  const { t } = useTranslation();

  const formatNumber = (value) => {
    if (!value && value !== 0) return "-";
    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Dữ liệu chi phí quý 4 dựa trên ảnh
  const costData = [
    // I. Công trình đang làm
    {
      category: "I. 在建工程 / Công trình đang làm",
      items: [
        {
          stt: 1,
          name: "装修工程 / Thi công nội thất",
          description: "公司装修 / Thi công công ty",
          thang9: 0,
          thang10: 688000000,
          thang11: 980927360,
          thang12: 344000000,
          vat: 0,
          total: 2012927360,
          note: "支付比例为442 / Tỉ lệ chi trả 442",
        },
        {
          stt: 2,
          name: "公共基础设施建设 / Xây dựng cơ sở hạ tầng công cộng",
          description: "电力、水 / Điện, nước",
          thang9: 0,
          thang10: 174000000,
          thang11: 0,
          thang12: 0,
          vat: 0,
          total: 174000000,
          note: "",
        },
      ],
    },
    // II. Chi phí cho nhân viên
    {
      category: "II. 人员成本 / Chi phí cho nhân viên",
      items: [
        {
          stt: 3,
          name: "工资 / Lương",
          description: "全体员工工资 / Lương toàn thể nhân viên",
          thang9: 0,
          thang10: 0,
          thang11: 223000000,
          thang12: 623000000,
          vat: 0,
          total: 846000000,
          note: "11月按14人计算,12月增加3位HR和12位主播及12位主播助理,平均月薪位15M / T11 tính 14 nhân sự, T12 thêm 3 HR 12 talent 12 trợ lý, bình quân 15tr/ng",
        },
        {
          stt: 4,
          name: "奖金 / Thưởng",
          description: "全体员工所获奖金 / Thưởng toàn nhân viên",
          thang9: 0,
          thang10: 0,
          thang11: 10000000,
          thang12: 10000000,
          vat: 0,
          total: 20000000,
          note: "按招聘1爱豆1M计算 / Tính tuyển 1 talent 1tr",
        },
        {
          stt: 5,
          name: "社会保险 / BHXH",
          description: "",
          thang9: 0,
          thang10: 0,
          thang11: 18060000,
          thang12: 37410000,
          vat: 0,
          total: 55470000,
          note: "一位员工1290000,11月14人,12月增加3位HR及12位主播助理。共计:29人 / 1.29tr/nhân sự, T11 14 nhân sự, T12 thêm 3 HR và 12 talent và trợ lý : tổng 29 người",
        },
        {
          stt: 6,
          name: "福利 / Phúc lợi",
          description: "",
          thang9: 0,
          thang10: 0,
          thang11: 4400000,
          thang12: 7300000,
          vat: 0,
          total: 11700000,
          note: "生日或者摩托车停车费等,12月总计41位员工,新增27位员工 / Sinh nhật, gửi xe, t12 tính tổng 41 nhân sự, thêm 27 nhân sự mới",
        },
      ],
    },
    // III. Thiết bị và tư sản
    {
      category: "III. 设备与资产 / Thiết bị và tư sản",
      items: [
        {
          stt: 7,
          name: "办公家具 / Đồ nội thất văn phòng",
          description: "公司整体家具设备 / Thiết bị nội thất toàn văn phòng",
          thang9: 0,
          thang10: 0,
          thang11: 120000000,
          thang12: 10000000,
          vat: 0,
          total: 130000000,
          note: "12月份预计补充少量设备 / T12 dự kiến thêm vài thiết bị",
        },
        {
          stt: 8,
          name: "电子设备 / Thiết bị điện tử",
          description: "直播设备 / Thiết bị livestream",
          thang9: 0,
          thang10: 0,
          thang11: 539000000,
          thang12: 808500000,
          vat: 0,
          total: 1347500000,
          note: "2个直播间设备 / Thiết bị 2 phòng live",
        },
        {
          stt: 9,
          name: "零星物资 / Vật tư nhỏ lẻ",
          description: "",
          thang9: 0,
          thang10: 0,
          thang11: 17000000,
          thang12: 8000000,
          vat: 0,
          total: 25000000,
          note: "12月份预计补充少量物资 / T12 dự kiến bổ sung ít vật tư",
        },
      ],
    },
    // IV. Vận hành văn phòng
    {
      category: "IV. 办公运营 / Vận hành văn phòng",
      items: [
        {
          stt: 10,
          name: "房租 / Tiền thuê nhà",
          description: "租金159,172,052/月 / Tiền thuê 159,172,052/tháng",
          thang9: 0,
          thang10: 0,
          thang11: 159172052,
          thang12: 159172052,
          vat: 0,
          total: 318344104,
          note: "",
        },
        {
          stt: 11,
          name: "水电费 / Tiền điện nước",
          description: "预估1000°/直播间 / Dự kiến 1000 số/phòng live",
          thang9: 0,
          thang10:0 ,
          thang11: 7500000,
          thang12: 16500000,
          vat: 0,
          total: 24000000,
          note: "预估电费为3000VND,11月份2个直播间,总计2500°电。12月份5个直播间,总计5500°电。 / Dự tính 3k/số điện, T11 2 phòng live, tổng 2500 số. T12, 5 phòng tổng 5500 số",
        },
        {
          stt: 12,
          name: "网络费 / Internet",
          description: "",
          thang9:0 ,
          thang10: 0,
          thang11: 33300000,
          thang12: 0,
          vat: 0,
          total: 33300000,
          note: "500M、7月 / 500M, 7 tháng",
        },
        {
          stt: 13,
          name: "办公用品 / Văn phòng phẩm",
          description: "",
          thang9:0 ,
          thang10: 0,
          thang11: 3000000,
          thang12: 3000000,
          vat: 0,
          total: 6000000,
          note: "纸笔其他 / Giấy bút...",
        },
        {
          stt: 14,
          name: "清洁费 / Phí vệ sinh",
          description: "",
          thang9:0 ,
          thang10: 0,
          thang11: 6000000,
          thang12: 6000000,
          vat: 0,
          total: 12000000,
          note: "",
        },
        {
          stt: 15,
          name: "服装与道具费 / Trang phục và đạo cụ",
          description: "预估2M/直播间 / Dự tính 2tr/phòng live",
          thang9: 0,
          thang10: 0,
          thang11: 6000000,
          thang12: 15000000,
          vat: 0,
          total: 21000000,
          note: "500K/人/月 / 500k/người",
        },
      ],
    },
    // V. Chi phí về tài vụ
    {
      category: "V. 财务费用 / Chi phí về tài vụ",
      items: [
        {
          stt: 16,
          name: "咨询服务费 / Phí dịch vụ tư vấn",
          description: "公司注册、工会注册等 / Đăng ký công ty, đăng ký MCN...",
          thang9: 0,
          thang10: 130000000,
          thang11: 0,
          thang12: 0,
          vat: 0,
          total: 130000000,
          note: "",
        },
        {
          stt: 17,
          name: "银行手续费 / Phí thủ tục ngân hàng",
          description: "",
          thang9: 0,
          thang10: 0,
          thang11: 0,
          thang12: 0,
          vat: 0,
          total: 0,
          note: "银行年费为2.4m / Phí quản lý tài khoản ngân hàng 2.4tr/năm",
        },
        {
          stt: 18,
          name: "汇损费用 / Phí lỗ tỉ giá",
          description: "换汇所所损失费用 / Phí lỗ tỉ giá",
          thang9: 0,
          thang10: 2000000,
          thang11: 0,
          thang12: 0,
          vat: 0,
          total: 2000000,
          note: "",
        },
        {
          stt: 19,
          name: "软件使用费 / Phí sử dụng phần mềm",
          description: "计票器 / Máy tính vote livestream",
          thang9: 0,
          thang10: 0,
          thang11: 0,
          thang12: 24000000,
          vat: 0,
          total: 24000000,
          note: "计票器:两个直播间/3月/3000RMB,财务软件: 1000000/月 / Máy tính vote livestream: 2 phòng live/3 tháng/3000NDT, phần mềm kế toán 1tr/tháng",
        },
      ],
    },
    // VI. Công tác và đi lại
    {
      category: "VI. 差旅与交通 / Công tác và đi lại",
      items: [
        {
          stt: 20,
          name: "大型交通费 / Phí giao thông cỡ lớn",
          description: "",
          thang9: 166176971,
          thang10: 0,
          thang11: 3000000,
          thang12: 3000000,
          vat: 0,
          total: 172176971,
          note: "胡志明学习总计,未单独区分 / Tổng phí công tác HCM",
        },
        {
          stt: 21,
          name: "住宿费 / Phí ở",
          description: "",
          thang9: 0,
          thang10: 0,
          thang11: 3000000,
          thang12: 3000000,
          vat: 0,
          total: 6000000,
          note: "",
        },
        {
          stt: 22,
          name: "小型交通费 / Phí giao thông cỡ nhỏ",
          description: "",
          thang9: 0,
          thang10: 0,
          thang11: 1000000,
          thang12: 1000000,
          vat: 0,
          total: 2000000,
          note: "",
        },
      ],
    },
    // VII. Tiền cọc
    {
      category: "VII. 押金 / Tiền cọc",
      items: [
        {
          stt: 23,
          name: "租赁押金 / Cọc thuê văn phòng",
          description: "押金为三个月租金 / Cọc 3 tháng thuê VP",
          thang9: 473000000,
          thang10: 0,
          thang11: 0,
          thang12: 0,
          vat: 0,
          total: 473000000,
          note: "",
        },
        {
          stt: 24,
          name: "装修押金 / Cọc thi công toà nhà",
          description: "",
          thang9: 0,
          thang10: 50760209,
          thang11: 0,
          thang12: 0,
          vat: 0,
          total: 50760209,
          note: "",
        },
        {
          stt: 25,
          name: "其他押金 / Các chi phí cọc khác",
          description: "",
          thang9: 0,
          thang10: 0,
          thang11: 0,
          thang12: 0,
          vat: 0,
          total: 0,
          note: "",
        },
      ],
    },
    // VIII. Chi phí khác
    {
      category: "VIII. 其他支出 / Chi phí khác",
      items: [
        {
          stt: 26,
          name: "备用金 / Quỹ dự phòng",
          description: "灵活性支取的资金 / Quỹ tiền linh hoạt",
          thang9: 0,
          thang10: 0,
          thang11: 10000000,
          thang12: 10000000,
          vat: 0,
          total: 20000000,
          note: "",
        },
        {
          stt: 27,
          name: "打交道1 / Phong bì 1",
          description: "关系费用 / Phí quan hệ",
          thang9: 0,
          thang10: 0,
          thang11: 0,
          thang12: 3000000,
          vat: 0,
          total: 3000000,
          note: "",
        },
        {
          stt: 28,
          name: "打交道2 / Phong bì 2",
          description: "",
          thang9: 0,
          thang10: 0,
          thang11: 0,
          thang12: 0,
          vat: 0,
          total: 0,
          note: "",
        },
        {
          stt: 29,
          name: "打交道3 / Phong bì 3",
          description: "",
          thang9: 0,
          thang10: 0,
          thang11: 0,
          thang12: 0,
          vat: 0,
          total: 0,
          note: "",
        },
        {
          stt: 30,
          name: "打交道4 / Phong bì 4",
          description: "",
          thang9: 0,
          thang10: 0,
          thang11: 0,
          thang12: 0,
          vat: 0,
          total: 0,
          note: "",
        },
      ],
    },
  ];

  // Tính tổng cho từng tháng và tổng cộng
  const calculateTotals = () => {
    let totalThang9 = 0;
    let totalThang10 = 0;
    let totalThang11 = 0;
    let totalThang12 = 0;
    let totalVat = 0;
    let grandTotal = 0;

    costData.forEach((category) => {
      category.items.forEach((item) => {
        totalThang9 += item.thang9 || 0;
        totalThang10 += item.thang10 || 0;
        totalThang11 += item.thang11 || 0;
        totalThang12 += item.thang12 || 0;
        totalVat += item.vat || 0;
        grandTotal += item.total || 0;
      });
    });

    return {
      totalThang9,
      totalThang10,
      totalThang11,
      totalThang12,
      totalVat,
      grandTotal,
    };
  };

  const totals = calculateTotals();

  return (
    <div className="rounded-sm shadow-default dark:border-strokedark dark:bg-boxdark max-w-full overflow-x-auto">
      <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
        <h3 className="font-semibold text-black dark:text-white">
          {t("keHoach.costPlanQuarter4Title")}
        </h3>
      </div>

      <div className="p-6.5">
        <div className="rounded-lg border border-stroke dark:border-strokedark overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-stroke dark:border-strokedark">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-stroke dark:border-strokedark min-w-[100px]">
                    费用类别 / Loại chi phí
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-stroke dark:border-strokedark w-16">
                    序号 / STT
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-stroke dark:border-strokedark min-w-[150px]">
                    项目 / Hạng mục
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-stroke dark:border-strokedark min-w-[150px]">
                    摘要 / Chi tiết
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-stroke dark:border-strokedark w-32">
                    9月/Tháng 9
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-stroke dark:border-strokedark w-32">
                    10月/Tháng 10
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-stroke dark:border-strokedark w-32">
                    11月/Tháng 11
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-stroke dark:border-strokedark w-32">
                    12月/Tháng 12
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-stroke dark:border-strokedark w-32">
                    增值税 / Thuế VAT
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-stroke dark:border-strokedark w-32">
                    合计 / Tổng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[200px]">
                    备注 / Ghi chú
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-stroke dark:divide-strokedark">
                {costData.map((category, categoryIndex) => (
                  <React.Fragment key={categoryIndex}>
                    {/* Category Header */}
                    <tr className="bg-gray-100 dark:bg-gray-800 font-semibold">
                      <td
                        colSpan="11"
                        className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-b border-stroke dark:border-strokedark"
                      >
                        {category.category}
                      </td>
                    </tr>
                    {/* Category Items */}
                    {category.items.map((item, itemIndex) => (
                      <tr
                        key={itemIndex}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-150"
                      >
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-stroke dark:border-strokedark"></td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-gray-100 border-r border-stroke dark:border-strokedark">
                          {item.stt}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-stroke dark:border-strokedark">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-r border-stroke dark:border-strokedark">
                          {item.description || "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-gray-100 border-r border-stroke dark:border-strokedark">
                          {formatNumber(item.thang9)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-gray-100 border-r border-stroke dark:border-strokedark">
                          {formatNumber(item.thang10)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-gray-100 border-r border-stroke dark:border-strokedark">
                          {formatNumber(item.thang11)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-gray-100 border-r border-stroke dark:border-strokedark">
                          {formatNumber(item.thang12)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-gray-100 border-r border-stroke dark:border-strokedark">
                          {formatNumber(item.vat)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100 border-r border-stroke dark:border-strokedark">
                          {formatNumber(item.total)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {item.note || "-"}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
                {/* Total Row */}
                <tr className="bg-gray-100 dark:bg-gray-800 font-bold border-t-2 border-stroke dark:border-strokedark">
                  <td
                    colSpan="4"
                    className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-stroke dark:border-strokedark"
                  >
                    合计: / Tổng cộng:
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-gray-100 border-r border-stroke dark:border-strokedark">
                    {formatNumber(totals.totalThang9)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-gray-100 border-r border-stroke dark:border-strokedark">
                    {formatNumber(totals.totalThang10)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-gray-100 border-r border-stroke dark:border-strokedark">
                    {formatNumber(totals.totalThang11)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-gray-100 border-r border-stroke dark:border-strokedark">
                    {formatNumber(totals.totalThang12)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-gray-100 border-r border-stroke dark:border-strokedark">
                    {formatNumber(totals.totalVat)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-gray-100 border-r border-stroke dark:border-strokedark">
                    {formatNumber(totals.grandTotal)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

