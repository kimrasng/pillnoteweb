import { getFilmState } from "./film";
import type { Scene } from "./story";
import CaptureDates, { useCurrentDate } from "./CaptureDates";
import { dateKey } from "./dates";
import NotificationScreen, { notificationScreens } from "./NotificationScreen";
import { getTypingState } from "./typing";
import { useLocale } from "./LocaleProvider";
import { useEffect } from "react";
import NativeRaster, { warmRasterFrames } from "./NativeRaster";
import TouchIndicator from "./TouchIndicator";
import DoseCheckFeedback from "./DoseCheckFeedback";

const clip = ([top, right, bottom, left]: number[], radius = 0) =>
  `inset(${(top / 844) * 100}% ${(right / 390) * 100}% ${(bottom / 844) * 100}% ${(left / 390) * 100}%${radius ? ` round ${(radius / 390) * 100}cqw` : ""})`;
function Screen({
  image,
  now,
  label = "",
  visible = false,
  opening = 0,
  pressed = false,
}: {
  image: string;
  now: Date;
  label?: string;
  visible?: boolean;
  opening?: number;
  pressed?: boolean;
}) {
  const { copy } = useLocale();
  return notificationScreens.has(image) ? (
    <NotificationScreen
      image={image}
      now={now}
      opening={opening}
      pressed={pressed}
    />
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
  useEffect(() => {
    warmRasterFrames(
      [...scene.frames, ...(nextScene?.frames ?? [])]
        .filter(({ image }) => !notificationScreens.has(image))
        .map(({ image }) => ({
          image: `/images/app/${image}.png`,
          date: image,
        })),
    );
  }, [scene.id, nextScene?.id]);
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
  const unlocking = film.motion === "unlock";
  const lockedStatus = unlocking
    ? film.unlockProgress < 0.88
    : lockWeight > 0.5;
  const statusTimeOpacity = unlocking
    ? Math.max(0, (film.unlockProgress - 0.88) / 0.12)
    : 1 - lockWeight;
  const statusTime =
    displayScene.id === "alarm"
      ? "8:00"
      : displayScene.id === "guardian"
        ? "8:30"
        : "9:41";
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
                    opening={film.unlockProgress}
                    pressed={film.touches.some(
                      (touch) => touch.opacity > 0 && touch.phase === "down",
                    )}
                  />
                </div>
              </div>
            ))}
            <NativeRaster sample={film.native} now={now} />
            {film.doseProgress !== null && (
              <DoseCheckFeedback progress={film.doseProgress} />
            )}
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
            <div
              className={`phone-status ${lockedStatus ? "is-locked" : ""}`}
              aria-hidden="true"
            >
              <span style={{ opacity: statusTimeOpacity }}>{statusTime}</span>
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
            <div
              className={`phone-home-line ${lockedStatus ? "is-locked" : ""}`}
              aria-hidden="true"
            />
            {!reducedMotion && <TouchIndicator touches={film.touches} />}
            {film.power > 0 && (
              <div
                className="phone-power"
                style={{ opacity: film.power }}
                aria-hidden="true"
              />
            )}
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
