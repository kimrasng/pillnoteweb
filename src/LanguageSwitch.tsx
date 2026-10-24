import { ChevronDown, Globe } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { resolveLocale } from "./i18n";
import "./language-select.css";

export default function LanguageSwitch({
  className = "",
}: {
  className?: string;
}) {
  const { locale, setLocale, copy } = useLocale();
  return (
    <label className={`language-select ${className}`}>
      <Globe className="language-select-globe" size={16} aria-hidden="true" />
      <select
        aria-label={copy.language}
        value={locale}
        onChange={(event) => setLocale(resolveLocale(event.target.value))}
      >
        <option value="ko" lang="ko">
          한국어
        </option>
        <option value="en" lang="en">
          English
        </option>
      </select>
      <ChevronDown
        className="language-select-chevron"
        size={14}
        aria-hidden="true"
      />
    </label>
  );
}
