import { useLanguage } from "../context/useLanguage";
import { useAuth } from "../helper/useAuth";
import useCSRF from "../helper/useCSRF";
import { toast } from "react-toastify";

import { useState } from "react";

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
}

export default function LanguageSelector({
  compact = false,
  className = "",
}: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();
  const { user, setUserInfo } = useAuth();
  const csrf = useCSRF();
  const [saving, setSaving] = useState(false);

  const changeLanguage = async (nextLanguage: "fr" | "en") => {
    if (saving || nextLanguage === language) return;
    const previousLanguage = language;
    setLanguage(nextLanguage);
    if (!user) return;
    if (!csrf) {
      setLanguage(previousLanguage);
      toast.error(t("language.saveError"));
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}user/preferences`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", "xsrf-token": csrf },
        body: JSON.stringify({ language: nextLanguage }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "La langue n’a pas pu être synchronisée.");
      setUserInfo({ ...user, preferences: result.data });
    } catch {
      setLanguage(previousLanguage);
      toast.error(t("language.saveError"));
    } finally {
      setSaving(false);
    }
  };

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
        disabled={saving}
        onChange={(event) => void changeLanguage(event.target.value as "fr" | "en")}
        className="min-h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
      >
        <option value="fr">{compact ? "FR" : t("language.french")}</option>
        <option value="en">{compact ? "EN" : t("language.english")}</option>
      </select>
    </label>
  );
}
