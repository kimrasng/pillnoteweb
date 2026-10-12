import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  LANGUAGE_STORAGE_KEY,
  resolveLocale,
  translations,
  type Locale,
} from "./i18n";

function initialLocale(): Locale {
  try {
    return resolveLocale(localStorage.getItem(LANGUAGE_STORAGE_KEY));
  } catch {
    return "ko";
  }
}

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  copy: (typeof translations)[Locale];
} | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, updateLocale] = useState(initialLocale);
  const [switching, setSwitching] = useState(false);
  const changeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const copy = translations[locale];
  function setLocale(next: Locale) {
    clearTimeout(changeTimer.current);
    if (next === locale) {
      setSwitching(false);
      return;
    }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      updateLocale(next);
      setSwitching(false);
      return;
    }
    setSwitching(true);
    changeTimer.current = setTimeout(() => {
      updateLocale(next);
      setSwitching(false);
      changeTimer.current = undefined;
    }, 110);
  }
  useEffect(() => () => clearTimeout(changeTimer.current), []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = copy.pageTitle;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", copy.pageDescription);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", copy.pageTitle);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", copy.pageDescription);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
    } catch {
      // Switching still works when browser storage is unavailable.
    }
  }, [locale, copy]);
  return (
    <LocaleContext.Provider value={{ locale, setLocale, copy }}>
      <div className={`language-transition${switching ? " is-switching" : ""}`}>
        {children}
      </div>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("LocaleProvider is required");
  return context;
}
