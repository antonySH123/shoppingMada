import { useLanguage } from "../context/useLanguage";

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
}

export default function LanguageSelector({
  compact = false,
  className = "",
}: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label className={`inline-flex items-center gap-2 ${className}`}>
      {!compact && (
        <span className="text-xs font-semibold text-gray-500">
          {t("language.label")}
        </span>
      )}
      <select
        aria-label={t("language.label")}
        value={language}
        onChange={(event) => setLanguage(event.target.value as "fr" | "en")}
        className="min-h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
      >
        <option value="fr">{compact ? "FR" : t("language.french")}</option>
        <option value="en">{compact ? "EN" : t("language.english")}</option>
      </select>
    </label>
  );
}
