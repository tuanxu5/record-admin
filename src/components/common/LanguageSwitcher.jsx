import { Globe } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";


export const LanguageSwitcher = () => {
  const { language, changeLanguage } = useTranslation();

  return (
    <div className="relative inline-block">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={() => changeLanguage(language === "vi" ? "zh" : "vi")}
        title={language === "vi" ? "切换到中文" : "Switch to Vietnamese"}
      >
        <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {language === "vi" ? "VI" : "中文"}
        </span>
      </button>
    </div>
  );
};

