import { useEffect, useRef, useState } from "react";
import { ArrowRight, Download } from "lucide-react";
import { BrandLink, Disclosure, TextLink } from "./components";
import { LocaleText, useLocale } from "./LocaleProvider";
import LanguageSwitch from "./LanguageSwitch";
import { CONTACT_EMAIL, DATA_DELETION_URL, PRIVACY_URL } from "./links";
import { DownloadGuide } from "./ProductInfo";
import LandingHero from "./LandingHero";
import { productTranslations } from "./productCopy";

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { copy } = useLocale();
  return (
    <>
      <TextLink href="#top" label={copy.introNavigation} onClick={onNavigate} />
      <TextLink href="#features" label={copy.guide} onClick={onNavigate} />
      <TextLink href="#about" label={copy.faqNavigation} onClick={onNavigate} />
    </>
  );
}

export default function App() {
  const { copy, locale } = useLocale();
  const mobileMenu = useRef<HTMLDetailsElement>(null);
  const [scrolled, setScrolled] = useState(() => window.scrollY > 24);
  function closeMenu() {
    if (mobileMenu.current) mobileMenu.current.open = false;
  }
  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);
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
    const desktop = matchMedia("(min-width: 961px)");
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
        if (id === "privacy" || id === "data-deletion") {
          location.replace(id === "privacy" ? PRIVACY_URL : DATA_DELETION_URL);
          return;
        }
        if (id === "tour") id = "features";
      } catch {
        return;
      }
      const target = document.getElementById(id);
      target?.scrollIntoView({ behavior: "instant", block: "start" });
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
      <TextLink className="skip-link" href="#features" label={copy.skip} />
      <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
        <div className="header-inner">
          <BrandLink
            href="#top"
            onClick={(event) => {
              event.preventDefault();
              goHome();
            }}
          />
          <nav className="header-menu" aria-label={copy.navigation}>
            <NavigationLinks />
          </nav>
          <div className="header-actions">
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
              <Download size={16} aria-hidden="true" />
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
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <path d="M3 6h14M3 14h14" />
                </svg>
              </summary>
              <div className="mobile-nav-panel">
                <NavigationLinks onNavigate={closeMenu} />
                <div className="mobile-language-row">
                  <span>
                    <LocaleText>{copy.language}</LocaleText>
                  </span>
                  <LanguageSwitch />
                </div>
              </div>
            </details>
          </div>
        </div>
      </header>
      <main id="top">
        <LandingHero />
        <DownloadGuide />
        <section
          className="about-section"
          id="about"
          tabIndex={-1}
          aria-labelledby="faq-title"
        >
          <header className="about-intro">
            <h2 id="faq-title">
              <LocaleText>{copy.about.title}</LocaleText>
            </h2>
            <p>
              <LocaleText>{copy.about.description}</LocaleText>
            </p>
          </header>
          <div className="faq-list">
            {copy.faqs.map((faq, index) => (
              <Disclosure key={index} title={faq.question}>
                <p>
                  <LocaleText>{faq.answer}</LocaleText>
                </p>
                {faq.link && (
                  <TextLink
                    className="faq-link"
                    href={faq.link.href}
                    label={faq.link.label}
                    icon={ArrowRight}
                    iconSize={16}
                  />
                )}
              </Disclosure>
            ))}
          </div>
          <div className="about-contact">
            <TextLink
              className="contact-link"
              href={`mailto:${CONTACT_EMAIL}`}
              label={copy.about.contact}
              icon={ArrowRight}
            />
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <p className="footer-scope">
          <LocaleText>{productTranslations[locale].safety}</LocaleText>
        </p>
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
            <TextLink href="#about" label={copy.faqNavigation} />
            <TextLink
              href={PRIVACY_URL}
              label={locale === "ko" ? "개인정보·데이터" : "Privacy & data"}
            />
            <TextLink
              href={DATA_DELETION_URL}
              label={locale === "ko" ? "계정·데이터 삭제" : "Account & data deletion"}
            />
            <TextLink
              href={`mailto:${CONTACT_EMAIL}`}
              label={locale === "ko" ? "문의" : "Contact"}
            />
          </nav>
          <span className="footer-copyright">
            © {new Date().getFullYear()} PillNote
          </span>
        </div>
      </footer>
    </>
  );
}
