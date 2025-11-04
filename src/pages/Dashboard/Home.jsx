import PageMeta from "../../components/common/PageMeta";
import { useTranslation } from "../../hooks/useTranslation";

export default function Home() {
  const { t } = useTranslation();

  return (
    <>
      <PageMeta
        title={t("dashboard.title")}
        description={t("dashboard.description")}
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">📊 {t("dashboard.title")}</h1>
            <p className="text-lg md:text-xl text-gray-600">{t("dashboard.description")}</p>
          </div>
        </div>
      </div>
    </>
  );
}
