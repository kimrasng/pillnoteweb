import { ArrowRight } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { productTranslations } from "./productCopy";
import {
  CONTACT_EMAIL,
  HISTORY_URL,
  LATEST_RELEASE_URL,
  RELEASES_URL,
  SOURCE_URL,
} from "./links";

export function ProductOverview({ onExplore }: { onExplore: () => void }) {
  const { locale } = useLocale();
  const { overview, safety } = productTranslations[locale];
  return (
    <section
      className="info-section locale-copy"
      id="features"
      tabIndex={-1}
      aria-labelledby="overview-title"
    >
      <p className="scene-label">{overview.label}</p>
      <h2 id="overview-title">{overview.title}</h2>
      <p className="info-lead">{overview.description}</p>
      <div className="feature-grid">
        {overview.features.map((feature) => (
          <article key={feature.title}>
            <h3>{feature.title}</h3>
            <p>{feature.body}</p>
          </article>
        ))}
      </div>
      <p className="info-note">{overview.conditions}</p>
      <div className="companion-feature">
        <h3>{overview.companion.title}</h3>
        <p>{overview.companion.body}</p>
      </div>
      <div className="info-links">
        <button onClick={onExplore}>
          {overview.tour}
          <ArrowRight size={18} />
        </button>
        <a href="#product">
          {overview.status}
          <ArrowRight size={18} />
        </a>
      </div>
      <p className="scope-note">{safety}</p>
    </section>
  );
}

export function ProductStatus() {
  const { locale } = useLocale();
  const { product } = productTranslations[locale];
  return (
    <section
      className="info-section product-section locale-copy"
      id="product"
      tabIndex={-1}
      aria-labelledby="product-title"
    >
      <p className="scene-label">{product.label}</p>
      <h2 id="product-title">{product.title}</h2>
      <p className="info-lead">{product.description}</p>
      <dl className="product-facts">
        {product.facts.map((fact) => (
          <div key={fact.title}>
            <dt>{fact.title}</dt>
            <dd>{fact.body}</dd>
          </div>
        ))}
      </dl>
      <div className="info-links">
        <a href={LATEST_RELEASE_URL}>
          {product.latest}
          <ArrowRight size={18} />
        </a>
        <a href={RELEASES_URL}>
          {product.history}
          <ArrowRight size={18} />
        </a>
        <a href={SOURCE_URL}>
          {product.source}
          <ArrowRight size={18} />
        </a>
        <a href={HISTORY_URL}>
          {product.changes}
          <ArrowRight size={18} />
        </a>
      </div>
      <div className="development-note">
        <h3>{product.development.title}</h3>
        <p>{product.development.body}</p>
      </div>
      <div className="development-note">
        <h3>{product.claude.title}</h3>
        <p>{product.claude.body}</p>
      </div>
      <a className="contact-link" href={`mailto:${CONTACT_EMAIL}`}>
        {product.contact} · {CONTACT_EMAIL}
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
      className="info-section locale-copy"
      id="download"
      tabIndex={-1}
      aria-labelledby="download-title"
    >
      <p className="scene-label">{download.label}</p>
      <h2 id="download-title">{download.title}</h2>
      <p className="info-lead">{download.description}</p>
      <ol className="install-steps">
        {download.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <div className="info-links">
        <a className="primary-action" href={LATEST_RELEASE_URL}>
          {download.latest}
          <ArrowRight size={18} />
        </a>
        <a href={RELEASES_URL}>
          {download.history}
          <ArrowRight size={18} />
        </a>
      </div>
      <p className="info-note">{download.caution}</p>
      <p className="info-note">{download.language}</p>
    </section>
  );
}

export function DataGuide() {
  const { locale } = useLocale();
  const { data, deletion } = productTranslations[locale];
  return (
    <section
      className="info-section data-section locale-copy"
      id="privacy"
      tabIndex={-1}
      aria-labelledby="data-title"
    >
      <p className="scene-label">{data.label}</p>
      <h2 id="data-title">{data.title}</h2>
      <p className="info-lead">{data.description}</p>
      <div className="data-list">
        {data.items.map((item) => (
          <article key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
      <section
        id="data-deletion"
        className="deletion-guide"
        tabIndex={-1}
        aria-labelledby="deletion-title"
      >
        <h2 id="deletion-title">{deletion.title}</h2>
        <div className="data-list">
          {deletion.items.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
        <p className="info-note">{deletion.contact}</p>
        <a className="contact-link" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
          <ArrowRight size={18} />
        </a>
      </section>
    </section>
  );
}
