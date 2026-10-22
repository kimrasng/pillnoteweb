import DemoPlayer from "./DemoPlayer";
import { fullDemo } from "./demo";
import { demoTranslations } from "./demoCopy";
import { LocaleText, useLocale } from "./LocaleProvider";
import { productTranslations } from "./productCopy";

export default function TourSection() {
  const { locale } = useLocale();
  const text = demoTranslations[locale];
  return (
    <section
      className="info-section tour-section"
      id="features"
      tabIndex={-1}
      aria-labelledby="tour-title"
    >
      <div className="tour-heading">
        <p className="scene-label">
          <LocaleText>{text.tourLabel}</LocaleText>
        </p>
        <h2 id="tour-title">
          <LocaleText>{text.tourTitle}</LocaleText>
        </h2>
        <p className="info-lead">
          <LocaleText>{text.tourDescription}</LocaleText>
        </p>
      </div>
      <DemoPlayer demo={fullDemo} full />
      <p className="scope-note">
        <LocaleText>{productTranslations[locale].safety}</LocaleText>
      </p>
    </section>
  );
}
