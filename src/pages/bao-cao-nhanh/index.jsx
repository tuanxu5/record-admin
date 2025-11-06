import PageMeta from "../../components/common/PageMeta";
import CapitalContribution from "../../components/quick-report/CapitalContribution";
import EstablishmentExpenses from "../../components/quick-report/EstablishmentExpenses";
import { useBaoCaoNhanh } from "../../hooks/useBaoCaoNhanh";
import { useTranslation } from "../../hooks/useTranslation";
import { FileText } from "lucide-react";

export default function BaoCaoNhanhPage() {
    const { t } = useTranslation();
    const { capitalContribution, establishmentExpenses, isLoading } = useBaoCaoNhanh();

    return (
        <>
            <PageMeta
                title={t("quickReport.title")}
                description={t("quickReport.description")}
            />
            
            {/* Header Section */}
            <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl shadow-lg p-5 md:p-6 mb-4 relative overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>

                    <div className="relative z-5">
                        <div className="flex items-center justify-center mb-3 gap-4">
                            <div className="bg-white bg-opacity-20 rounded-full p-2.5">
                                <FileText className="w-6 h-6 md:w-7 md:h-7 text-white" />
                            </div>
                            <h1 className="text-2xl md:text-2xl font-bold text-white">
                                {t("quickReport.title")}
                            </h1>
                        </div>

                        <p className="text-blue-100 text-sm md:text-base max-w-2xl mx-auto">
                            {t("quickReport.description")}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-4 md:gap-6">
                {/* Góp vốn của các thành viên */}
                <div className="col-span-12 lg:col-span-6">
                    <CapitalContribution
                        data={capitalContribution.data}
                        isLoading={isLoading}
                    />
                </div>

                {/* Chi phí thành lập công ty trước GoLive */}
                <div className="col-span-12 lg:col-span-6">
                    <EstablishmentExpenses
                        data={establishmentExpenses.data}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </>
    );
}
