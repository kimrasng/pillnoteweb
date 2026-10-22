import { ArrowRight, Play } from "lucide-react";
import DemoPlayer from "./DemoPlayer";
import { heroDemo } from "./demo";
import { demoTranslations } from "./demoCopy";
import { LocaleText, useLocale } from "./LocaleProvider";

export default function LandingHero() {
  const { locale, copy } = useLocale();
  const text = demoTranslations[locale];
  return (
    <section className="landing-hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="scene-label">
          <LocaleText>{text.eyebrow}</LocaleText>
        </p>
        <h1 id="hero-title">
          <LocaleText>{text.heroTitle}</LocaleText>
        </h1>
        <p className="hero-description">
          <LocaleText>{text.heroDescription}</LocaleText>
        </p>
        <div className="hero-actions">
          <a className="primary-action" href="#download">
            <LocaleText>{copy.release}</LocaleText>
            <ArrowRight size={18} />
          </a>
          <a className="tour-action" href="#features">
            <Play size={17} aria-hidden="true" />
            <LocaleText>{text.allTour}</LocaleText>
          </a>
        </div>
        <p className="hero-platform">
          <LocaleText>{copy.intro.platform}</LocaleText>
        </p>
      </div>
      <DemoPlayer demo={heroDemo} loop controls={false} />
    </section>
  );
}
