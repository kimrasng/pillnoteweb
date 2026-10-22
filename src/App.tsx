import { useEffect, useRef } from "react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { LocaleText, useLocale } from "./LocaleProvider";
import LanguageSwitch from "./LanguageSwitch";
import { CONTACT_EMAIL } from "./links";
import { DataGuide, DownloadGuide } from "./ProductInfo";
import LandingHero from "./LandingHero";
import TourSection from "./TourSection";

export default function App() {
  const { copy, locale } = useLocale();
  const mobileMenu = useRef<HTMLDetailsElement>(null);
  function closeMenu() {
    if (mobileMenu.current) mobileMenu.current.open = false;
  }
  useEffect(() => {
    const dismissOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !mobileMenu.current?.contains(event.target)
      )
        closeMenu();
    };
    const dismissWithEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !mobileMenu.current?.open) return;
      closeMenu();
      mobileMenu.current.querySelector("summary")?.focus();
    };
    const desktop = matchMedia("(min-width: 741px)");
    const dismissOnDesktop = () => {
      if (desktop.matches) closeMenu();
    };
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("keydown", dismissWithEscape);
    desktop.addEventListener("change", dismissOnDesktop);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("keydown", dismissWithEscape);
      desktop.removeEventListener("change", dismissOnDesktop);
    };
  }, []);
  useEffect(() => {
    const navigateToHash = () => {
      let id: string;
      try {
        id = decodeURIComponent(location.hash.slice(1));
        if (id === "tour") id = "features";
      } catch {
        return;
      }
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "instant", block: "start" });
    };
    const frame = requestAnimationFrame(navigateToHash);
    window.addEventListener("hashchange", navigateToHash);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", navigateToHash);
    };
  }, []);
  function goHome() {
    closeMenu();
    if (location.hash)
      history.replaceState(
        history.state,
        "",
        location.pathname + location.search,
      );
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  return (
    <>
      <a className="skip-link" href="#features">
        <LocaleText>{copy.skip}</LocaleText>
      </a>
      <header className="site-header">
        <a
          className="brand"
          href="#top"
          onClick={(event) => {
            event.preventDefault();
            goHome();
          }}
        >
          <img src="/images/pillnote-logo.webp" alt="" />
          <span>PillNote</span>
        </a>
        <nav aria-label={copy.navigation}>
          <a href="#features">
            <LocaleText>{copy.guide}</LocaleText>
          </a>
          <a href="#about">
            <LocaleText>{copy.faqNavigation}</LocaleText>
          </a>
          <LanguageSwitch className="desktop-language" />
          <a
            className="release-button"
            aria-label={copy.release}
            href="#download"
          >
            <span className="release-label-full">
              <LocaleText>{copy.release}</LocaleText>
            </span>
            <span className="release-label-short">
              <LocaleText>{copy.releaseShort}</LocaleText>
            </span>
            <ArrowRight size={20} />
          </a>
          <details
            className="mobile-nav"
            ref={mobileMenu}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                closeMenu();
            }}
          >
            <summary aria-label={copy.menu}>
              <Menu className="menu-open-icon" size={24} aria-hidden="true" />
              <X className="menu-close-icon" size={24} aria-hidden="true" />
            </summary>
            <div className="mobile-nav-panel">
              <a href="#features" onClick={closeMenu}>
                <LocaleText>{copy.guide}</LocaleText>
              </a>
              <a href="#about" onClick={closeMenu}>
                <LocaleText>{copy.faqNavigation}</LocaleText>
              </a>
              <div className="mobile-language-row">
                <span>
                  <LocaleText>{copy.language}</LocaleText>
                </span>
                <LanguageSwitch />
              </div>
            </div>
          </details>
        </nav>
      </header>
      <main id="top">
        <LandingHero />
        <TourSection />
        <DownloadGuide />
        <section
          className="about-section"
          id="about"
          tabIndex={-1}
          aria-labelledby="faq-title"
        >
          <div className="about-intro">
            <p className="scene-label">
              <LocaleText>{copy.about.label}</LocaleText>
            </p>
            <h2 id="faq-title">
              <LocaleText>{copy.about.title}</LocaleText>
            </h2>
            <p>
              <LocaleText>{copy.about.description}</LocaleText>
            </p>
            <a className="contact-link" href={`mailto:${CONTACT_EMAIL}`}>
              <LocaleText>{copy.about.contact}</LocaleText>
              <ArrowRight size={18} />
            </a>
          </div>
          <div className="faq-list">
            {copy.faqs.map((faq, index) => (
              <details key={index}>
                <summary>
                  <LocaleText>{faq.question}</LocaleText>
                  <ChevronDown size={19} />
                </summary>
                <p>
                  <LocaleText>{faq.answer}</LocaleText>
                </p>
                {faq.link && (
                  <a className="faq-link" href={faq.link.href}>
                    <LocaleText>{faq.link.label}</LocaleText>
                    <ArrowRight size={16} />
                  </a>
                )}
              </details>
            ))}
          </div>
        </section>
        <DataGuide />
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <a
            className="footer-brand"
            href="#top"
            onClick={(event) => {
              event.preventDefault();
              goHome();
            }}
          >
            PillNote
          </a>
          <nav
            className="footer-links"
            aria-label={locale === "ko" ? "사이트 안내" : "Site information"}
          >
            <a href="#about">
              <LocaleText>{copy.faqNavigation}</LocaleText>
            </a>
            <a href="#privacy">
              <LocaleText>
                {locale === "ko" ? "개인정보·데이터" : "Privacy & data"}
              </LocaleText>
            </a>
            <a href="#data-deletion">
              <LocaleText>
                {locale === "ko"
                  ? "계정·데이터 삭제"
                  : "Account & data deletion"}
              </LocaleText>
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`}>
              <LocaleText>{locale === "ko" ? "문의" : "Contact"}</LocaleText>
            </a>
          </nav>
          <span className="footer-copyright">
            © {new Date().getFullYear()} PillNote
          </span>
        </div>
      </footer>
    </>
  );
}
