import { TrendingUp, Users } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "../../hooks/useTranslation";

export default function CapitalContribution({ data, isLoading }) {
    const { t, language } = useTranslation();

    const membersData = useMemo(() => {
        if (!data?.members) return [];

        return data.members.map((member) => {
            // Sử dụng currentAmount từ API (đã được tính từ tổng ps_co)
            const currentAmount = member.currentAmount || 0;
            const percentage = member.totalAmount > 0
                ? ((currentAmount / member.totalAmount) * 100).toFixed(2)
                : 0;

            // Chọn tên theo ngôn ngữ hiện tại
            const displayName = language === "zh" && member.nameZh 
                ? member.nameZh 
                : member.name;

            return {
                ...member,
                displayName,
                currentAmount,
                percentage: parseFloat(percentage),
            };
        });
    }, [data, language]);

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 md:p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-1.5">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                    {t("quickReport.capitalContribution")}
                </h3>
            </div>

            <div className="space-y-6">
                {membersData.map((member, index) => (
                    <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {t("quickReport.member")} {index + 1} : {member.displayName || member.name}
                            </h4>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                    {member.percentage}%
                                </span>
                            </div>
                        </div>

                        {/* Gentech 2 Cột Format */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Cột 1: Tổng số tiền góp 100% */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    {t("quickReport.totalContribution")} (100%)
                                </div>
                                <div className="text-lg font-bold text-gray-800 dark:text-white">
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                        minimumFractionDigits: 0,
                                    }).format(member.totalAmount)}
                                </div>
                            </div>

                            {/* Cột 2: Số tiền góp hiện tại của các lần */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    {t("quickReport.currentContribution")}
                                </div>
                                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                        minimumFractionDigits: 0,
                                    }).format(member.currentAmount)}
                                </div>
                            </div>
                        </div>

                        {/* Chi tiết các lần góp vốn */}
                        {member.contributions && member.contributions.length > 0 && (
                            <div className="mt-3 space-y-2">
                                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                    {t("quickReport.contributionDetails")}:
                                </div>
                                <div className="space-y-1">
                                    {member.contributions.map((contrib, contribIndex) => (
                                        <div
                                            key={contribIndex}
                                            className="flex flex-col gap-1 text-xs bg-gray-50 dark:bg-gray-700/30 rounded px-3 py-2"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {contrib.date
                                                        ? new Date(contrib.date).toLocaleDateString(
                                                            language === "zh" ? "zh-CN" : "vi-VN"
                                                        )
                                                        : language === "zh"
                                                            ? `第 ${contribIndex + 1} 次`
                                                            : `Lần ${contribIndex + 1}`}
                                                </span>
                                                <span className="font-semibold text-gray-800 dark:text-white">
                                                    {new Intl.NumberFormat("vi-VN", {
                                                        style: "currency",
                                                        currency: "VND",
                                                        minimumFractionDigits: 0,
                                                    }).format(contrib.amount)}
                                                </span>
                                            </div>
                                            {contrib.dien_giai && (
                                                <div className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                                    {contrib.dien_giai}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Progress bar */}
                        <div className="mt-2">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div
                                    className={`h-2 rounded-full transition-all duration-500 ${member.percentage >= 100
                                        ? "bg-green-500"
                                        : member.percentage >= 50
                                            ? "bg-blue-500"
                                            : "bg-yellow-500"
                                        }`}
                                    style={{ width: `${Math.min(member.percentage, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {index < membersData.length - 1 && (
                            <div className="border-t border-gray-200 dark:border-gray-700 mt-4"></div>
                        )}
                    </div>
                ))}

                {membersData.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        {t("common.noData")}
                    </div>
                )}
            </div>
        </div>
    );
}

