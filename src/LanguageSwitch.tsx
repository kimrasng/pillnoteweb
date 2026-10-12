import { useLocale } from "./LocaleProvider";

export default function LanguageSwitch({
  className = "",
}: {
  className?: string;
}) {
  const { locale, setLocale, copy } = useLocale();
  return (
    <div
      className={`language-switch ${className}`}
      role="group"
      aria-label={copy.language}
      data-locale={locale}
    >
      <span className="language-switch-thumb" aria-hidden="true" />
      <button
        type="button"
        lang="ko"
        aria-label="한국어"
        aria-pressed={locale === "ko"}
        onClick={() => setLocale("ko")}
      >
        KO
      </button>
      <button
        type="button"
        lang="en"
        aria-label="English"
        aria-pressed={locale === "en"}
        onClick={() => setLocale("en")}
      >
        EN
      </button>
    </div>
  );
}
