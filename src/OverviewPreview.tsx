import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import PhoneFilm from "./PhoneFilm";
import { LocaleText, useLocale } from "./LocaleProvider";
import { productTranslations } from "./productCopy";
import { scenes } from "./story";

const previews = [
  {
    scene: scenes[3],
    image: "drug-info",
    label: "drugInfo",
    notification: false,
  },
  {
    scene: scenes[2],
    image: "home-taken",
    label: "record",
    notification: false,
  },
  {
    scene: scenes[4],
    image: "dose-notification",
    label: "notification",
    notification: true,
  },
  {
    scene: scenes[6],
    image: "pharmacy-list",
    label: "pharmacy",
    notification: false,
  },
] as const;

export default function OverviewPreview() {
  const { locale, copy } = useLocale();
  const { overview } = productTranslations[locale];
  const container = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const [reducedMotion, setReducedMotion] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReducedMotion(media.matches);
    const visibility = () => setPageVisible(!document.hidden);
    media.addEventListener("change", change);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(
      ([entry]) =>
        setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.25),
      { threshold: 0.25 },
    );
    if (container.current) observer.observe(container.current);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", change);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    if (paused || reducedMotion || !visible || !pageVisible) return;
    const timer = setTimeout(
      () => setActive((index) => (index + 1) % previews.length),
      4500,
    );
    return () => clearTimeout(timer);
  }, [active, paused, reducedMotion, visible, pageVisible]);
  const label = overview.previewLabels[previews[active].label];
  const caption = previews[active].notification
    ? copy.notification.example
    : overview.screenCaption;
  return (
    <div className="overview-preview" ref={container}>
      <div className="overview-rotation" data-preview-index={active}>
        {previews.map(({ scene, image, label, notification }, index) => (
          <div
            className={`overview-slide ${index === active ? "is-active" : ""}`}
            aria-hidden={index !== active}
            inert={index !== active}
            key={image}
          >
            <PhoneFilm
              scene={{ ...scene, frames: [{ image, at: 0 }], gestures: [] }}
              progress={0}
              reducedMotion
              screenLabel={overview.previewLabels[label]}
              accessibleLabel={`${overview.previewLabels[label]} · ${notification ? copy.notification.example : overview.screenCaption}`}
            />
          </div>
        ))}
      </div>
      <div className="overview-preview-controls">
        <div
          className="overview-preview-pages"
          role="group"
          aria-label={
            locale === "ko" ? "대표 화면 선택" : "Choose a preview screen"
          }
        >
          {previews.map(({ scene, label }, index) => (
            <button
              key={scene.id}
              type="button"
              aria-label={overview.previewLabels[label]}
              aria-pressed={active === index}
              onClick={() => {
                setActive(index);
                setPaused(true);
              }}
            >
              <span aria-hidden="true" />
            </button>
          ))}
        </div>
        {!reducedMotion && (
          <button
            type="button"
            className="overview-preview-pause"
            aria-label={paused ? overview.playPreview : overview.pausePreview}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
        )}
      </div>
      <p className="overview-caption">
        <LocaleText>{label}</LocaleText>
      </p>
      <p className="overview-caption overview-preview-language">
        <LocaleText>{caption}</LocaleText>
      </p>
      <p className="overview-map-credit">
        {previews[active].label === "pharmacy" && (
          <a
            href="https://www.openstreetmap.org/copyright"
            onFocus={() => setPaused(true)}
          >
            © OpenStreetMap contributors
          </a>
        )}
      </p>
    </div>
  );
}
