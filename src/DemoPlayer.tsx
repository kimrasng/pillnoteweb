import { Pause, Play, RotateCcw } from "lucide-react";
import { useId, useLayoutEffect, useRef, type ReactNode } from "react";
import PhoneFilm from "./PhoneFilm";
import { getScrollState } from "./scroll";
import { scenes } from "./story";
import { LocaleText, useLocale } from "./LocaleProvider";
import { demoTranslations } from "./demoCopy";
import { demoChapterTime, type DemoTimeline } from "./demo";
import useDemoPlayback from "./useDemoPlayback";

export default function DemoPlayer({
  demo,
  enabled = true,
  loop = false,
  full = false,
  controls = true,
  initialTime = 0,
  intro,
  playbackRate = 1,
}: {
  demo: DemoTimeline;
  enabled?: boolean;
  loop?: boolean;
  full?: boolean;
  controls?: boolean;
  initialTime?: number;
  intro?: ReactNode;
  playbackRate?: number;
}) {
  const { locale, copy } = useLocale();
  const text = demoTranslations[locale];
  const player = useDemoPlayback(demo, {
    enabled,
    loop,
    initialTime,
    playbackRate,
  });
  const stage = useRef<HTMLDivElement>(null);
  const pickerHintId = useId();
  const chapterList = useRef<HTMLDivElement>(null);
  const chapterIndicator = useRef<HTMLSpanElement>(null);
  const state = getScrollState(player.position, 1, scenes.length);
  const scene = scenes[state.activeIndex];
  const displayIndex =
    state.activeIndex +
    Number(
      full && state.transition >= 0.5 && state.activeIndex < scenes.length - 1,
    );
  const description = copy.scenes[scenes[displayIndex].id];
  const complete = player.time >= demo.duration;
  useLayoutEffect(() => {
    const list = chapterList.current;
    const indicator = chapterIndicator.current;
    if (!list || !indicator) return;
    const updateIndicator = () => {
      const selected = list.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (!selected) return;
      indicator.style.setProperty("--chapter-x", `${selected.offsetLeft}px`);
      indicator.style.setProperty("--chapter-y", `${selected.offsetTop}px`);
      indicator.style.setProperty(
        "--chapter-width",
        `${selected.offsetWidth}px`,
      );
      indicator.style.setProperty(
        "--chapter-height",
        `${selected.offsetHeight}px`,
      );
      indicator.dataset.ready = "true";

      if (list.scrollWidth <= list.clientWidth) return;
      const bounds = list.getBoundingClientRect();
      const button = selected.getBoundingClientRect();
      const offset =
        button.left < bounds.left
          ? button.left - bounds.left
          : button.right > bounds.right
            ? button.right - bounds.right
            : 0;
      if (offset)
        list.scrollTo({
          left: list.scrollLeft + offset,
          behavior: player.reducedMotion ? "instant" : "smooth",
        });
    };
    updateIndicator();
    const observer = new ResizeObserver(updateIndicator);
    observer.observe(list);
    list
      .querySelectorAll("button")
      .forEach((button) => observer.observe(button));
    return () => observer.disconnect();
  }, [displayIndex, locale, full, player.reducedMotion]);
  return (
    <div
      className={`demo-player ${full ? "demo-player-full" : ""} ${intro ? "demo-player-integrated" : ""}`}
      ref={player.container}
      data-demo={demo.id}
      data-playing={player.playing}
    >
      {intro}
      <div
        className={intro ? "tour-showcase" : undefined}
        id={intro ? "features" : undefined}
        tabIndex={intro ? -1 : undefined}
      >
        {full && (
          <div className="tour-picker">
            {intro && (
              <h2 className="tour-stage-title">
                <LocaleText>{text.tourTitle}</LocaleText>
              </h2>
            )}
            {intro && (
              <p className="tour-picker-hint" id={pickerHintId}>
                <LocaleText>{text.chooseHint}</LocaleText>
              </p>
            )}
          </div>
        )}
        <div className={full ? "tour-scene" : "demo-screen"} ref={stage}>
          {full && (
            <div className="tour-scene-copy" key={scenes[displayIndex].id}>
              {!intro && (
                <>
                  <p className="scene-label">
                    <LocaleText>{description.label}</LocaleText>
                  </p>
                  <h3>
                    <LocaleText>{description.title}</LocaleText>
                  </h3>
                </>
              )}
              <p>
                <LocaleText>{description.description}</LocaleText>
              </p>
              {scenes[displayIndex].id === "pharmacy" && (
                <a
                  className="map-credit"
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noreferrer"
                >
                  © OpenStreetMap contributors
                </a>
              )}
            </div>
          )}
          <PhoneFilm
            scene={scene}
            progress={state.progress}
            nextScene={full ? scenes[state.activeIndex + 1] : undefined}
            transition={full ? state.transition : 0}
            reducedMotion={player.reducedMotion}
          />
        </div>
        {full && (
          <div
            ref={chapterList}
            className="tour-chapters"
            role="group"
            aria-label={text.chapters}
            aria-describedby={intro ? pickerHintId : undefined}
          >
            <span
              ref={chapterIndicator}
              className="tour-chapter-indicator"
              aria-hidden="true"
            />
            {scenes.map((chapter, index) => (
              <button
                key={chapter.id}
                type="button"
                aria-pressed={displayIndex === index}
                onClick={() => {
                  player.seek(demoChapterTime(index));
                  if (controls) player.pause();
                  if (intro && matchMedia("(max-width: 740px)").matches)
                    stage.current?.closest(".tour-showcase")?.scrollIntoView({
                      block: "start",
                      behavior: "instant",
                    });
                  else stage.current?.scrollTo({ top: 0, behavior: "instant" });
                }}
              >
                <LocaleText>{copy.scenes[chapter.id].label}</LocaleText>
              </button>
            ))}
          </div>
        )}
        {controls && !player.reducedMotion && (
          <div className={`demo-controls ${full ? "demo-controls-full" : ""}`}>
            <button
              type="button"
              onClick={player.toggle}
              aria-label={
                complete ? text.replay : player.paused ? text.play : text.pause
              }
            >
              {complete ? (
                <RotateCcw size={18} />
              ) : player.paused ? (
                <Play size={18} />
              ) : (
                <Pause size={18} />
              )}
            </button>
            {!complete && (
              <button
                type="button"
                onClick={player.replay}
                aria-label={text.replay}
              >
                <RotateCcw size={18} />
              </button>
            )}
            {full && (
              <input
                className="demo-progress"
                type="range"
                min="0"
                max={demo.duration}
                step="100"
                value={player.time}
                aria-label={text.progress}
                aria-valuetext={`${Math.floor(player.time / 1000)} / ${Math.ceil(demo.duration / 1000)}${text.seconds}`}
                onChange={(event) => player.seek(Number(event.target.value))}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
