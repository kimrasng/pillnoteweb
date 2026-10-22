import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  ChevronDown,
  Download,
  PackageOpen,
} from "lucide-react";
import { LocaleText, useLocale } from "./LocaleProvider";
import { productTranslations } from "./productCopy";
import { CONTACT_EMAIL, LATEST_RELEASE_URL, RELEASES_URL } from "./links";

const installStepIcons = [Download, PackageOpen, CalendarCheck];

export function DownloadGuide() {
  const { locale } = useLocale();
  const { download } = productTranslations[locale];
  return (
    <section
      className="info-section download-section"
      id="download"
      tabIndex={-1}
      aria-labelledby="download-title"
    >
      <div className="download-heading">
        <div className="download-intro">
          <p className="scene-label">
            <LocaleText>{download.label}</LocaleText>
          </p>
          <h2 id="download-title">
            <LocaleText>{download.title}</LocaleText>
          </h2>
          <p className="info-lead">
            <LocaleText>{download.description}</LocaleText>
          </p>
        </div>
        <div className="download-actions">
          <a className="primary-action" href={LATEST_RELEASE_URL}>
            <Download size={19} aria-hidden="true" />
            <LocaleText>{download.latest}</LocaleText>
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <p className="download-platform">
            <LocaleText>{download.platform}</LocaleText>
          </p>
        </div>
      </div>
      <ol
        className="install-steps"
        role="list"
        aria-label={download.installTitle}
      >
        {download.steps.map((step, index) => {
          const StepIcon = installStepIcons[index];
          return (
            <li key={step.title}>
              <span className="install-step-icon" aria-hidden="true">
                <StepIcon size={22} strokeWidth={1.7} />
              </span>
              <div>
                <h3>
                  <LocaleText>{step.title}</LocaleText>
                </h3>
                <p>
                  <LocaleText>{step.body}</LocaleText>
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="download-footnotes">
        <details className="install-help">
          <summary>
            <LocaleText>{download.installHelp}</LocaleText>
            <ChevronDown size={17} aria-hidden="true" />
          </summary>
          <p>
            <LocaleText>{download.installPermission}</LocaleText>
          </p>
          <p>
            <LocaleText>{download.caution}</LocaleText>
          </p>
        </details>
        <a className="release-history" href={RELEASES_URL}>
          <LocaleText>{download.history}</LocaleText>
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
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
