import { useEffect, useState } from "react";
import i18n from "@/lib/i18n";

export type LanguageOption = {
  code: string;
  label: string;
  dir?: "ltr" | "rtl";
};

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "hi", label: "हिन्दी" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "pt", label: "Português" },
  { code: "it", label: "Italiano" },
  { code: "ru", label: "Русский" },
  { code: "ko", label: "한국어" },
  { code: "tr", label: "Türkçe" },
  { code: "bn", label: "বাংলা" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "mr", label: "मराठी" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "ur", label: "اردو", dir: "rtl" },
  { code: "he", label: "עברית", dir: "rtl" },
  { code: "fa", label: "فارسی", dir: "rtl" },
  { code: "id", label: "Indonesia" },
  { code: "ms", label: "Melayu" },
  { code: "th", label: "ไทย" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "nl", label: "Nederlands" },
  { code: "sv", label: "Svenska" },
  { code: "no", label: "Norsk" },
  { code: "da", label: "Dansk" },
  { code: "fi", label: "Suomi" },
  { code: "pl", label: "Polski" },
  { code: "cs", label: "Čeština" },
  { code: "sk", label: "Slovenčina" },
  { code: "hu", label: "Magyar" },
  { code: "ro", label: "Română" },
  { code: "bg", label: "Български" },
  { code: "uk", label: "Українська" },
  { code: "el", label: "Ελληνικά" },
  { code: "sr", label: "Српски" },
  { code: "hr", label: "Hrvatski" },
  { code: "sl", label: "Slovenščina" },
  { code: "lt", label: "Lietuvių" },
  { code: "lv", label: "Latviešu" },
  { code: "et", label: "Eesti" },
];

export const getLanguageLabel = (code: string): string =>
  SUPPORTED_LANGUAGES.find((l) => l.code === code)?.label ?? code;

export const isRTL = (code: string): boolean =>
  ["ar", "he", "fa", "ur"].includes(code);

export function useLanguage() {
  const [language, _setLanguage] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("app_language");
      if (saved) return saved;
    } catch {}
    const browser = (navigator?.language || "en").slice(0, 2).toLowerCase();
    return SUPPORTED_LANGUAGES.some((l) => l.code === browser) ? browser : "en";
  });

  useEffect(() => {
    try {
      localStorage.setItem("app_language", language);
    } catch {}
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL(language) ? "rtl" : "ltr";
    i18n.changeLanguage(language);
  }, [language]);

  const setLanguage = (lang: string) => {
    _setLanguage(lang);
  };

  return { language, setLanguage };
}
