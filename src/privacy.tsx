import React from "react";
import ReactDOM from "react-dom/client";
import { useEffect } from "react";
import { LocaleProvider, useLocale } from "./LocaleProvider";
import LanguageSwitch from "./LanguageSwitch";
import { BrandLink, TextLink } from "./components";
import { DataGuide } from "./ProductInfo";
import "./styles.css";
import "./design-system.css";
import "./landing.css";
import "./privacy.css";

document.documentElement.classList.add("privacy-document");
history.scrollRestoration = location.hash ? "manual" : "auto";

function PrivacyPage() {
  const { locale, copy } = useLocale();
  useEffect(() => {
    const navigate = () => {
      const id = location.hash.slice(1);
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "instant", block: "start" });
    };
    const frame = requestAnimationFrame(navigate);
    window.addEventListener("hashchange", navigate);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", navigate);
    };
  }, []);
  return (
    <>
      <TextLink
        className="skip-link"
        href="#privacy"
        label={locale === "ko" ? "안내 본문으로 이동" : "Skip to guide"}
      />
      <header className="site-header">
        <BrandLink href="/" />
        <nav aria-label={copy.navigation}>
          <LanguageSwitch />
        </nav>
      </header>
      <main className="privacy-page">
        <DataGuide />
      </main>
      <footer className="privacy-footer">
        <TextLink
          href="/"
          label={
            locale === "ko" ? "PillNote 소개로 돌아가기" : "Back to PillNote"
          }
        />
      </footer>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LocaleProvider page="privacy">
      <PrivacyPage />
    </LocaleProvider>
  </React.StrictMode>,
);
