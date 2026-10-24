import { ArrowRight, ArrowUpRight, Download } from "lucide-react";
import { Disclosure, TextLink } from "./components";
import { LocaleText, useLocale } from "./LocaleProvider";
import { productTranslations } from "./productCopy";
import { CONTACT_EMAIL, LATEST_RELEASE_URL, RELEASES_URL } from "./links";

function InfoList({
  items,
}: {
  items: readonly { readonly title: string; readonly body: string }[];
}) {
  return (
    <div className="data-list">
      {items.map((item) => (
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
  );
}

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
          <h2 id="download-title">
            <LocaleText>{download.title}</LocaleText>
          </h2>
          <p className="info-lead">
            <LocaleText>{download.description}</LocaleText>
          </p>
        </div>
        <div className="download-actions">
          <TextLink
            className="primary-action"
            href={LATEST_RELEASE_URL}
            label={download.latest}
            icon={Download}
          />
        </div>
      </div>
      <div className="installation-guide">
        <h3>
          <LocaleText>
            {locale === "ko" ? "설치 방법" : "How to install"}
          </LocaleText>
        </h3>
        <ol
          className="install-steps"
          role="list"
          aria-label={download.installTitle}
        >
          {download.steps.map((step) => {
            return (
              <li key={step.title}>
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
          <Disclosure
            className="install-help"
            title={download.installHelp}
            iconSize={17}
          >
            <p>
              <LocaleText>{download.installPermission}</LocaleText>
            </p>
            <p>
              <LocaleText>{download.caution}</LocaleText>
            </p>
          </Disclosure>
          <TextLink
            className="release-history"
            href={RELEASES_URL}
            label={download.history}
            icon={ArrowUpRight}
            iconSize={16}
          />
        </div>
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
      <h1 id="data-title">
        <LocaleText>{data.label}</LocaleText>
      </h1>
      <h2 className="data-subtitle">
        <LocaleText>{data.title}</LocaleText>
      </h2>
      <p className="info-lead">
        <LocaleText>{data.description}</LocaleText>
      </p>
      <InfoList items={data.items} />
      <section
        id="data-deletion"
        className="deletion-guide"
        tabIndex={-1}
        aria-labelledby="deletion-title"
      >
        <h2 id="deletion-title">
          <LocaleText>{deletion.title}</LocaleText>
        </h2>
        <InfoList items={deletion.items} />
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
