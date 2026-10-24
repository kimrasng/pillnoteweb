import { Download } from "lucide-react";
import { TextLink } from "./components";
import DemoPlayer from "./DemoPlayer";
import { fullDemo } from "./demo";
import { demoTranslations } from "./demoCopy";
import { LocaleText, useLocale } from "./LocaleProvider";

export default function LandingHero() {
  const { locale, copy } = useLocale();
  const text = demoTranslations[locale];
  return (
    <section
      className="landing-hero"
      tabIndex={-1}
      aria-labelledby="hero-title"
    >
      <DemoPlayer
        demo={fullDemo}
        full
        loop
        controls={false}
        playbackRate={1.2}
        intro={
          <div className="hero-copy">
            <p className="hero-platform">
              <LocaleText>{copy.intro.platform}</LocaleText>
            </p>
            <h1 id="hero-title">
              <span className="hero-lead">
                <LocaleText>{text.heroLead}</LocaleText>
              </span>
              <strong>
                <LocaleText>{text.heroTitle}</LocaleText>
              </strong>
            </h1>
            <p className="hero-description">
              <LocaleText>{text.heroDescription}</LocaleText>
            </p>
            <div className="hero-actions">
              <TextLink
                className="primary-action"
                href="#download"
                label={
                  locale === "ko" ? "PillNote 다운로드" : "Download PillNote"
                }
                icon={Download}
              />
            </div>
          </div>
        }
      />
    </section>
  );
}
