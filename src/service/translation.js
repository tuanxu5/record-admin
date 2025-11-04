import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Cache để lưu các bản dịch đã dịch (persistent trong localStorage)
const getTranslationCache = () => {
  try {
    const cached = localStorage.getItem("translation_cache");
    return cached ? new Map(JSON.parse(cached)) : new Map();
  } catch {
    return new Map();
  }
};

const saveTranslationCache = (cache) => {
  try {
    const cacheArray = Array.from(cache.entries());
    localStorage.setItem("translation_cache", JSON.stringify(cacheArray));
  } catch (error) {
    console.warn("Failed to save translation cache:", error);
  }
};

/**
 * Dịch text từ tiếng Việt sang tiếng Trung bằng Google Translate
 * Sử dụng Google Translate API không chính thức (miễn phí)
 * 
 * @param {string} text - Text cần dịch
 * @param {string} targetLang - Ngôn ngữ đích ('vi' hoặc 'zh')
 * @returns {Promise<string>} - Text đã dịch hoặc text gốc nếu dịch thất bại
 */
export const translateText = async (text, targetLang) => {
  if (!text || !text.trim()) return text;

  // Nếu ngôn ngữ đích là tiếng Việt và text đã là tiếng Việt, return nguyên
  if (targetLang === "vi") {
    return text;
  }

  const translationCache = getTranslationCache();

  // Kiểm tra cache trước
  const cacheKey = `${text}_${targetLang}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    // Sử dụng Google Translate API không chính thức (miễn phí)
    // Endpoint: https://translate.googleapis.com/translate_a/single
    const sourceLang = "vi";
    const targetLangCode = targetLang === "zh" ? "zh-CN" : targetLang;

    const response = await axios.get(
      `https://translate.googleapis.com/translate_a/single`,
      {
        params: {
          client: "gtx",
          sl: sourceLang,
          tl: targetLangCode,
          dt: "t",
          q: text,
        },
        timeout: 10000, // 10 seconds timeout
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    );

    // Parse response từ Google Translate
    let translatedText = text;
    if (response.data && Array.isArray(response.data) && response.data[0]) {
      const translatedArray = response.data[0];
      if (Array.isArray(translatedArray) && translatedArray.length > 0) {
        translatedText = translatedArray
          .map((item) => item[0])
          .filter(Boolean)
          .join("");
      }
    }

    // Nếu không có kết quả dịch, return text gốc
    if (!translatedText || translatedText === text) {
      return text;
    }

    // Lưu vào cache
    translationCache.set(cacheKey, translatedText);
    saveTranslationCache(translationCache);

    return translatedText;
  } catch (error) {
    console.warn("Google Translate failed, returning original text:", error.message);
    // Nếu dịch thất bại, return text gốc
    return text;
  }
};

/**
 * Dịch một mảng các text cùng lúc (batch translation)
 */
export const translateBatch = async (texts, targetLang) => {
  if (!texts || texts.length === 0) return texts;

  const results = await Promise.all(
    texts.map((text) => translateText(text, targetLang))
  );

  return results;
};



