import { ArrowRight } from "lucide-react";
import { useEffect, useRef, type CSSProperties } from "react";
import { LocaleText, useLocale } from "./LocaleProvider";
import { productTranslations } from "./productCopy";
import OverviewPreview from "./OverviewPreview";
import {
  CONTACT_EMAIL,
  COMPANY_PROFILE_URL,
  WEBSITE_URL,
  HISTORY_URL,
  LATEST_RELEASE_URL,
  RELEASES_URL,
  SOURCE_URL,
} from "./links";

export function ProductOverview({ onExplore }: { onExplore: () => void }) {
  const { locale } = useLocale();
  const { overview, safety } = productTranslations[locale];
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    if (
      !section.current ||
      !("IntersectionObserver" in window) ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("overview-reveal");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -24px 0px" },
    );
    section.current
      .querySelectorAll("[data-overview-reveal]")
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  return (
    <section
      className="info-section overview-section"
      ref={section}
      id="features"
      tabIndex={-1}
      aria-labelledby="overview-title"
    >
      <div className="overview-heading">
        <p className="scene-label">
          <LocaleText>{overview.label}</LocaleText>
        </p>
        <h2 id="overview-title" data-overview-reveal>
          <LocaleText>{overview.title}</LocaleText>
        </h2>
        <p className="info-lead" data-overview-reveal>
          <LocaleText>{overview.description}</LocaleText>
        </p>
      </div>
      <div className="overview-layout">
        <OverviewPreview />
        <div className="overview-content">
          <div className="overview-feature-list">
            {overview.features.map((feature, index) => (
              <article
                key={index}
                style={
                  { "--overview-delay": `${index * 45}ms` } as CSSProperties
                }
              >
                <h3 data-overview-reveal>
                  <LocaleText>{feature.title}</LocaleText>
                </h3>
                <p
                  data-overview-reveal
                  style={
                    {
                      "--overview-delay": `${index * 45 + 30}ms`,
                    } as CSSProperties
                  }
                >
                  <LocaleText>{feature.body}</LocaleText>
                </p>
              </article>
            ))}
          </div>
          <p className="info-note" data-overview-reveal>
            <LocaleText>{overview.conditions}</LocaleText>
          </p>
          <div className="companion-feature">
            <h3>
              <LocaleText>{overview.companion.title}</LocaleText>
            </h3>
            <p>
              <LocaleText>{overview.companion.body}</LocaleText>
            </p>
          </div>
          <div className="info-links" data-overview-reveal>
            <button onClick={onExplore}>
              <LocaleText>{overview.tour}</LocaleText>
              <ArrowRight size={18} />
            </button>
            <a href="#product">
              <LocaleText>{overview.status}</LocaleText>
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </div>
      <p className="scope-note" data-overview-reveal>
        <LocaleText>{safety}</LocaleText>
      </p>
    </section>
  );
}

export function ProductStatus() {
  const { locale } = useLocale();
  const { product } = productTranslations[locale];
  return (
    <section
      className="info-section product-section"
      id="product"
      tabIndex={-1}
      aria-labelledby="product-title"
    >
      <p className="scene-label">
        <LocaleText>{product.label}</LocaleText>
      </p>
      <h2 id="product-title">
        <LocaleText>{product.title}</LocaleText>
      </h2>
      <p className="info-lead">
        <LocaleText>{product.description}</LocaleText>
      </p>
      <dl className="product-facts">
        {product.facts.map((fact) => (
          <div key={fact.title}>
            <dt>
              <LocaleText>{fact.title}</LocaleText>
            </dt>
            <dd>
              <LocaleText>{fact.body}</LocaleText>
            </dd>
          </div>
        ))}
      </dl>
      <div className="info-links">
        <a href={COMPANY_PROFILE_URL}>
          <LocaleText>
            {locale === "ko" ? "회사 소개 페이지" : "Company profile"}
          </LocaleText>
          <ArrowRight size={18} />
        </a>
        <a href={WEBSITE_URL}>
          <LocaleText>
            {locale === "ko" ? "공식 웹사이트" : "Official website"}
          </LocaleText>
          <ArrowRight size={18} />
        </a>
        <a href={LATEST_RELEASE_URL}>
          <LocaleText>{product.latest}</LocaleText>
          <ArrowRight size={18} />
        </a>
        <a href={RELEASES_URL}>
          <LocaleText>{product.history}</LocaleText>
          <ArrowRight size={18} />
        </a>
        <a href={SOURCE_URL}>
          <LocaleText>{product.source}</LocaleText>
          <ArrowRight size={18} />
        </a>
        <a href={HISTORY_URL}>
          <LocaleText>{product.changes}</LocaleText>
          <ArrowRight size={18} />
        </a>
      </div>
      <div className="development-note">
        <h3>
          <LocaleText>{product.development.title}</LocaleText>
        </h3>
        <p>
          <LocaleText>{product.development.body}</LocaleText>
        </p>
      </div>
      <div className="development-note">
        <h3>
          <LocaleText>{product.claude.title}</LocaleText>
        </h3>
        <p>
          <LocaleText>{product.claude.body}</LocaleText>
        </p>
      </div>
      <a className="contact-link" href={`mailto:${CONTACT_EMAIL}`}>
        <LocaleText>{product.contact}</LocaleText> · {CONTACT_EMAIL}
        <ArrowRight size={18} />
      </a>
    </section>
  );
}

export function DownloadGuide() {
  const { locale } = useLocale();
  const { download } = productTranslations[locale];
  return (
    <section
      className="info-section"
      id="download"
      tabIndex={-1}
      aria-labelledby="download-title"
    >
      <p className="scene-label">
        <LocaleText>{download.label}</LocaleText>
      </p>
      <h2 id="download-title">
        <LocaleText>{download.title}</LocaleText>
      </h2>
      <p className="info-lead">
        <LocaleText>{download.description}</LocaleText>
      </p>
      <ol className="install-steps">
        {download.steps.map((step) => (
          <li key={step}>
            <LocaleText>{step}</LocaleText>
          </li>
        ))}
      </ol>
      <div className="info-links">
        <a className="primary-action" href={LATEST_RELEASE_URL}>
          <LocaleText>{download.latest}</LocaleText>
          <ArrowRight size={18} />
        </a>
        <a href={RELEASES_URL}>
          <LocaleText>{download.history}</LocaleText>
          <ArrowRight size={18} />
        </a>
      </div>
      <p className="info-note">
        <LocaleText>{download.caution}</LocaleText>
      </p>
      <p className="info-note">
        <LocaleText>{download.language}</LocaleText>
      </p>
    </section>
  );
}

export function DataGuide() {
  const { locale } = useLocale();
  const { data, deletion } = productTranslations[locale];
  return (
    <section
      className="info-section data-section"
      id="privacy"
      tabIndex={-1}
      aria-labelledby="data-title"
    >
      <p className="scene-label">
        <LocaleText>{data.label}</LocaleText>
      </p>
      <h2 id="data-title">
        <LocaleText>{data.title}</LocaleText>
      </h2>
      <p className="info-lead">
        <LocaleText>{data.description}</LocaleText>
      </p>
      <div className="data-list">
        {data.items.map((item) => (
          <article key={item.title}>
            <h3>
              <LocaleText>{item.title}</LocaleText>
            </h3>
            <p>
              <LocaleText>{item.body}</LocaleText>
            </p>
          </article>
        ))}
      </div>
      <section
        id="data-deletion"
        className="deletion-guide"
        tabIndex={-1}
        aria-labelledby="deletion-title"
      >
        <h2 id="deletion-title">
          <LocaleText>{deletion.title}</LocaleText>
        </h2>
        <div className="data-list">
          {deletion.items.map((item) => (
            <article key={item.title}>
              <h3>
                <LocaleText>{item.title}</LocaleText>
              </h3>
              <p>
                <LocaleText>{item.body}</LocaleText>
              </p>
            </article>
          ))}
        </div>
        <p className="info-note">
          <LocaleText>{deletion.contact}</LocaleText>
        </p>
        <a className="contact-link" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
          <ArrowRight size={18} />
        </a>
      </section>
    </section>
  );
}
