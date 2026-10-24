import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
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

const LANGUAGE_WIPE_OUT_MS = 160;
const LANGUAGE_WIPE_IN_MS = 200;
const LANGUAGE_STAGGER_MS = 140;

type ReadingPosition = {
  x: number;
  y: number;
  textIndex: number;
  top: number;
};

function readingTexts() {
  return [
    ...document.querySelectorAll<HTMLElement>(
      ".info-section .locale-text, .about-section .locale-text, .footer-links .locale-text",
    ),
  ];
}

function captureReadingPosition(): ReadingPosition {
  const headerBottom =
    document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0;
  const candidates = readingTexts()
    .map((text, textIndex) => {
      const block = text.closest("h2, h3, p, dt, dd, li, a, button") ?? text;
      return { textIndex, rect: block.getBoundingClientRect() };
    })
    .filter(
      ({ rect }) =>
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > headerBottom &&
        rect.top < window.innerHeight,
    );
  candidates.sort((a, b) => a.rect.top - b.rect.top);
  const anchor = candidates[0];
  return {
    x: window.scrollX,
    y: window.scrollY,
    textIndex: anchor?.textIndex ?? -1,
    top: anchor?.rect.top ?? 0,
  };
}

function restoreReadingPosition(position: ReadingPosition) {
  const text = readingTexts()[position.textIndex];
  const block = text?.closest("h2, h3, p, dt, dd, li, a, button") ?? text;
  const offset = block ? block.getBoundingClientRect().top - position.top : 0;
  window.scrollTo({
    left: position.x,
    top: block ? window.scrollY + offset : position.y,
    behavior: "instant",
  });
}

export function LocaleText({ children }: { children: ReactNode }) {
  return <span className="locale-text">{children}</span>;
}

function prepareTextDelays() {
  let longestDelay = 0;
  document.querySelectorAll<HTMLElement>(".locale-text").forEach((text) => {
    const rect = text.getBoundingClientRect();
    const visible =
      rect.width > 0 &&
      rect.height > 0 &&
      rect.bottom > 0 &&
      rect.top < window.innerHeight &&
      !text.closest('[inert], [aria-hidden="true"]');
    const delay = visible
      ? Math.round(
          (Math.max(0, rect.top) / window.innerHeight) * LANGUAGE_STAGGER_MS,
        )
      : 0;
    text.style.setProperty("--locale-delay", `${delay}ms`);
    longestDelay = Math.max(longestDelay, delay);
  });
  return longestDelay;
}

export function LocaleProvider({
  children,
  page = "home",
}: {
  children: ReactNode;
  page?: "home" | "privacy";
}) {
  const [locale, updateLocale] = useState(initialLocale);
  const [phase, setPhase] = useState<"idle" | "leaving" | "entering">("idle");
  const pendingLocale = useRef<Locale | null>(null);
  const readingPosition = useRef<ReadingPosition | null>(null);
  const changeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const copy = translations[locale];
  function commitLocale(next: Locale) {
    // Capture at the actual text swap, so scrolling during the wipe stays native.
    readingPosition.current = captureReadingPosition();
    window.dispatchEvent(new Event("pillnote:navigation-start"));
    updateLocale(next);
  }
  function setLocale(next: Locale) {
    if (pendingLocale.current === next) return;
    clearTimeout(changeTimer.current);
    pendingLocale.current = null;
    if (next === locale) {
      setPhase("idle");
      return;
    }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      commitLocale(next);
      setPhase("idle");
      return;
    }
    pendingLocale.current = next;
    const exitDelay = prepareTextDelays();
    setPhase("leaving");
    changeTimer.current = setTimeout(() => {
      commitLocale(next);
      setPhase("entering");
      changeTimer.current = setTimeout(() => {
        setPhase("idle");
        pendingLocale.current = null;
        changeTimer.current = undefined;
      }, LANGUAGE_WIPE_IN_MS + LANGUAGE_STAGGER_MS);
    }, LANGUAGE_WIPE_OUT_MS + exitDelay);
  }
  useLayoutEffect(() => {
    if (!readingPosition.current) return;
    restoreReadingPosition(readingPosition.current);
    readingPosition.current = null;
  }, [locale]);
  useLayoutEffect(() => {
    if (phase === "entering") prepareTextDelays();
  }, [locale, phase]);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const finishWithoutMotion = () => {
      if (!media.matches || !pendingLocale.current) return;
      clearTimeout(changeTimer.current);
      commitLocale(pendingLocale.current);
      pendingLocale.current = null;
      setPhase("idle");
    };
    media.addEventListener("change", finishWithoutMotion);
    return () => {
      clearTimeout(changeTimer.current);
      media.removeEventListener("change", finishWithoutMotion);
    };
  }, []);
  useEffect(() => {
    const pageTitle =
      page === "privacy"
        ? locale === "ko"
          ? "개인정보·데이터 안내 | PillNote"
          : "Privacy & data | PillNote"
        : copy.pageTitle;
    const pageDescription =
      page === "privacy"
        ? locale === "ko"
          ? "PillNote의 데이터 저장·동기화와 계정·데이터 삭제 방법을 안내합니다."
          : "How PillNote stores and syncs data, and how to delete your account and data."
        : copy.pageDescription;
    document.documentElement.lang = locale;
    document.title = pageTitle;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", pageDescription);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", pageTitle);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", pageDescription);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
    } catch {
      // Switching still works when browser storage is unavailable.
    }
  }, [locale, copy, page]);
  return (
    <LocaleContext.Provider value={{ locale, setLocale, copy }}>
      <div
        className={`language-transition locale-${phase}`}
        data-locale-phase={phase}
        style={
          {
            "--locale-exit-duration": `${LANGUAGE_WIPE_OUT_MS}ms`,
            "--locale-enter-duration": `${LANGUAGE_WIPE_IN_MS}ms`,
          } as CSSProperties
        }
      >
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
