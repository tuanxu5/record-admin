import { useEffect, useState } from "react";
import { LanguageContext } from "../context/LanguageContext";
import { vi } from "../locales/vi";
import { zh } from "../locales/zh";

const translations = {
  vi,
  zh,
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("vi");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load language from localStorage or default to Vietnamese
    const savedLanguage = localStorage.getItem("language");
    const initialLanguage = savedLanguage || "vi";

    setLanguage(initialLanguage);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("language", language);
      // Update HTML lang attribute
      document.documentElement.lang = language;
    }
  }, [language, isInitialized]);

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  const t = (key, params = {}) => {
    const keys = key.split(".");
    let value = translations[language];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key "${key}" not found for language "${language}"`);
        return key;
      }
    }

    // Replace params if value is a string
    if (typeof value === "string" && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
      });
    }

    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, translations: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

