import React from "react";
import { useTranslation } from "react-react-i18next";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const languages = [
    { code: "en", label: "English" },
    { code: "am", label: "አማርኛ" },
    { code: "fr", label: "Français" }
  ];

  return (
    <div className="relative inline-flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
      <Globe size={14} className="text-gray-400" />
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="bg-transparent text-xs font-bold text-dark-900 focus:outline-none cursor-pointer pr-1"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="text-dark-900">
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}