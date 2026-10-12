import { getFilmState } from "./film";
import type { Scene } from "./story";
import CaptureDates, { useCurrentDate } from "./CaptureDates";
import { dateKey } from "./dates";
import NotificationScreen, { notificationScreens } from "./NotificationScreen";
import { getTypingState } from "./typing";
import { useLocale } from "./LocaleProvider";
import NativeRaster from "./NativeRaster";
import TouchIndicator from "./TouchIndicator";

const clip = ([top, right, bottom, left]: number[], radius = 0) =>
  `inset(${(top / 844) * 100}% ${(right / 390) * 100}% ${(bottom / 844) * 100}% ${(left / 390) * 100}%${radius ? ` round ${(radius / 390) * 100}cqw` : ""})`;
function Screen({
  image,
  now,
  label = "",
  visible = false,
}: {
  image: string;
  now: Date;
  label?: string;
  visible?: boolean;
}) {
  const { copy } = useLocale();
  return notificationScreens.has(image) ? (
    <NotificationScreen image={image} now={now} />
  ) : (
    <>
      <img
        className="app-capture"
        src={`/images/app/${image}.png`}
        alt={visible ? `${copy.appScreen}: ${label}` : ""}
        aria-hidden={!visible}
        draggable={false}
        decoding="async"
      />
      <CaptureDates image={image} now={now} />
    </>
  );
}
export default function PhoneFilm({
  scene,
  progress,
  reducedMotion,
  nextScene,
  transition = 0,
}: {
  scene: Scene;
  progress: number;
  reducedMotion: boolean;
  nextScene?: Scene;
  transition?: number;
}) {
  const { copy } = useLocale();
  const now = useCurrentDate();
  const film = getFilmState(
    scene,
    progress,
    reducedMotion,
    nextScene,
    transition,
  );
  const displayScene = film.transition >= 0.5 && nextScene ? nextScene : scene;
  const label = copy.scenes[displayScene.id].label;
  const typing = getTypingState(film.searchProgress);
  const lockWeight = film.frames.reduce(
    (sum, frame) =>
      sum + (notificationScreens.has(frame.image) ? frame.weight : 0),
    0,
  );
  return (
    <figure
      className="phone-film"
      data-progress={film.progress.toFixed(6)}
      data-transition={film.transition.toFixed(6)}
      data-frame={film.dominantImage}
      data-motion={film.motion}
      data-today={dateKey(now)}
      aria-label={`${label} — ${notificationScreens.has(film.dominantImage) ? copy.notification.example : copy.appAnimation}`}
    >
      <div className="phone-shell">
        <div className="phone-display">
          <div className="phone-bleed" aria-hidden="true">
            {film.native ? (
              <img
                className="app-capture"
                src={film.native.frame.image}
                alt=""
                draggable={false}
              />
            ) : (
              <Screen image={film.backgroundImage} now={now} />
            )}
            <div
              className="phone-bleed-shade"
              style={{ opacity: film.shade }}
            />
          </div>
          <div className="phone-content">
            {film.frames.map((item, index) => (
              <div
                className={`capture-layer ${index === film.dominantFrame ? "is-current" : ""}`}
                key={item.image}
                style={{
                  opacity: item.opacity,
                  zIndex: item.zIndex,
                  clipPath: clip(item.clip),
                }}
                aria-hidden={index !== film.dominantFrame}
              >
                <div
                  className="capture-surface"
                  style={{
                    transform: `translate3d(${item.x}%, ${(item.y / 844) * 100}%, 0) scale(${item.scale})`,
                    clipPath: clip(item.contentClip, item.radius),
                  }}
                >
                  <Screen
                    image={item.image}
                    now={now}
                    label={label}
                    visible={index === film.dominantFrame}
                  />
                </div>
              </div>
            ))}
            {film.native && <NativeRaster sample={film.native} now={now} />}
            {film.shade > 0 && (
              <div
                className="film-shade"
                style={{ opacity: film.shade }}
                aria-hidden="true"
              />
            )}
            {!film.native && film.searchProgress > 0 && (
              <div className="search-typing" aria-hidden="true">
                <div className="search-field-mask" />
                <div
                  className="search-input-text"
                  data-typed-text={typing.text}
                >
                  <span>{typing.committed}</span>
                  <span className="search-composing">{typing.composing}</span>
                  <i
                    className="search-caret"
                    style={{ opacity: typing.caretOpacity }}
                  />
                </div>
              </div>
            )}
            {film.pinnedHeader > 0 && (
              <div
                className="pinned-header-backdrop"
                style={{ clipPath: clip([54, 0, 734, 0]) }}
                aria-hidden="true"
              />
            )}
            {film.pinnedHeader > 0 && (
              <div
                className="capture-layer pinned-app-header"
                style={{
                  opacity: film.pinnedHeader,
                  clipPath: clip([54, 0, 734, 0]),
                }}
                aria-hidden="true"
              >
                <Screen image={film.pinnedImage} now={now} />
              </div>
            )}
            <div className="phone-status" aria-hidden="true">
              <span style={{ opacity: 1 - lockWeight }}>9:41</span>
              <div className="phone-signals">
                <span className="phone-bars">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <span className="phone-wifi" />
                <span className="phone-battery" />
              </div>
            </div>
            <div className="phone-home-line" aria-hidden="true" />
            {!reducedMotion && <TouchIndicator touches={film.touches} />}
          </div>
        </div>
        <img
          className="phone-device-art"
          src="/images/device/iphone-18-pro-silver.webp"
          width="1332"
          height="2748"
          alt=""
          aria-hidden="true"
          draggable={false}
        />
      </div>
    </figure>
  );
}
