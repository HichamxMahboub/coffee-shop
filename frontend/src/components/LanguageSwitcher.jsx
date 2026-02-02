import React from "react";
import { useTranslation } from "react-i18next";

const options = [
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "ar", label: "AR", flag: "🇲🇦" },
  { code: "es", label: "ES", flag: "🇪🇸" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleChange = (event) => {
    const next = event.target.value;
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
    document.documentElement.setAttribute("dir", next === "ar" ? "rtl" : "ltr");
  };

  return (
    <label className="flex items-center gap-2 text-xs text-slate-300">
      <span>{options.find((opt) => opt.code === i18n.language)?.flag}</span>
      <select
        className="input h-9 w-24 px-2"
        value={i18n.language}
        onChange={handleChange}
      >
        {options.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.flag} {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
