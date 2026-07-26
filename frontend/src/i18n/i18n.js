import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import translationEN from "./locales/en.json";
import translationAM from "./locales/am.json";
import translationFR from "./locales/fr.json";

const resources = {
  en: { translation: translationEN },
  am: { translation: translationAM },
  fr: { translation: translationFR }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // React already protects against XSS injection vulnerabilities
    }
  });

export default i18n;