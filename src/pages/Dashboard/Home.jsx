import { Link } from "react-router";
import { Calendar, Wallet, TrendingDown, TrendingUp, Receipt, Target, ArrowRight, BarChart3, PieChart } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  const stats = [
    {
      title: "Tổng Doanh Thu",
      value: "12.580.000.000",
      unit: "đ",
      change: "+12.5%",
      changeType: "up",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Tổng Chi Phí",
      value: "8.450.000.000",
      unit: "đ",
      change: "+5.2%",
      changeType: "up",
      icon: <TrendingDown className="w-6 h-6" />,
      color: "from-red-500 to-rose-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
    {
      title: "Thu Nhập Ròng",
      value: "4.130.000.000",
      unit: "đ",
      change: "+25.8%",
      changeType: "up",
      icon: <BarChart3 className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Quỹ Tiền Mặt",
      value: "2.580.000.000",
      unit: "đ",
      change: "+8.3%",
      changeType: "up",
      icon: <Wallet className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  const quickLinks = [
    {
      title: "Giao dịch trong ngày",
      description: "Xem các giao dịch hôm nay",
      icon: <Calendar className="w-8 h-8" />,
      link: "/bao-cao-tai-chinh",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Vốn bằng tiền",
      description: "Quản lý quỹ tiền mặt",
      icon: <Wallet className="w-8 h-8" />,
      link: "/von-bang-tien/quy-tien-mat",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Chi phí",
      description: "Theo dõi chi phí theo khoản mục",
      icon: <TrendingDown className="w-8 h-8" />,
      link: "/chi-phi/chi-phi-theo-khoan-muc",
      gradient: "from-red-500 to-rose-500",
    },
    {
      title: "Doanh thu",
      description: "Phân tích doanh thu",
      icon: <TrendingUp className="w-8 h-8" />,
      link: "/doanh-thu/doanh-thu-taler",
      gradient: "from-purple-500 to-indigo-500",
    },
    {
      title: "Công nợ",
      description: "Quản lý công nợ phải thu/trả",
      icon: <Receipt className="w-8 h-8" />,
      link: "/cong-no/cong-no-phai-thu",
      gradient: "from-orange-500 to-amber-500",
    },
    {
      title: "Kế hoạch",
      description: "Xem kế hoạch doanh thu/chi phí",
      icon: <Target className="w-8 h-8" />,
      link: "/ke-hoach/doanh-thu",
      gradient: "from-indigo-500 to-blue-500",
    },
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN").format(parseInt(value.replace(/\./g, "")));
  };

  return (
    <>
      <PageMeta
        title="Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="Trang tổng quan hệ thống quản lý tài chính"
      />
      <div className="space-y-6 md:space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl shadow-xl p-6 md:p-10 text-white">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">📊 Báo Cáo Tổng Quan</h1>
            <p className="text-blue-100 text-lg md:text-xl">Đây là trang báo cáo các thứ - Tổng hợp thông tin tài chính và hoạt động kinh doanh</p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              <div className={`bg-gradient-to-br ${stat.color} p-4`}>
                <div className="flex items-center justify-between">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                    {stat.icon}
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    stat.changeType === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-500 mb-2">{stat.title}</p>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {formatCurrency(stat.value)} <span className="text-sm text-gray-500">{stat.unit}</span>
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">🚀 Truy Cập Nhanh</h2>
              <p className="text-gray-600">Truy cập các báo cáo và chức năng chính</p>
            </div>
            <div className="hidden md:block">
              <PieChart className="w-12 h-12 text-gray-300" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                to={link.link}
                className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-transparent"
              >
                <div className="relative z-10">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${link.gradient} mb-4 text-white group-hover:scale-110 transition-transform duration-300`}>
                    {link.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{link.description}</p>
                  <div className="flex items-center text-blue-600 font-medium text-sm">
                    <span>Xem chi tiết</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <div className={`absolute inset-0 bg-gradient-to-br ${link.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              </Link>
            ))}
          </div>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border-l-4 border-blue-500">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 rounded-lg p-2 mr-3">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Hoạt Động Hôm Nay</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Giao dịch</span>
                <span className="text-2xl font-bold text-gray-800">156</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Thu</span>
                <span className="text-2xl font-bold text-green-600">450.000.000 đ</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Chi</span>
                <span className="text-2xl font-bold text-red-600">320.000.000 đ</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border-l-4 border-green-500">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 rounded-lg p-2 mr-3">
                <Wallet className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Tổng Kết Tài Chính</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Số dư hiện tại</span>
                <span className="text-2xl font-bold text-gray-800">2.580.000.000 đ</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tăng trưởng</span>
                <span className="text-2xl font-bold text-green-600">+3.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tỷ lệ thu/chi</span>
                <span className="text-2xl font-bold text-blue-600">1.41</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
