import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, ChevronDown, Menu } from "lucide-react";
import PhoneFilm from "./PhoneFilm";
import { scenes, type Scene } from "./story";
import { notificationScreens } from "./NotificationScreen";
import useWeightedScroll from "./useWeightedScroll";
import useChapterNavigation from "./useChapterNavigation";
import { useLocale } from "./LocaleProvider";
import LanguageSwitch from "./LanguageSwitch";
import { RELEASES_URL } from "./links";
import { chapterNavigationMode, NAVIGATION_FADE_MS } from "./navigation";
import {
  getChapterScreens,
  INTRO_SCREENS,
  clamp01,
  getScrollState,
  getStoryScreens,
  sceneScrollOffset,
  smoothstep,
  introHandoff,
  type ScrollState,
} from "./scroll";

function useMedia(query: string) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    media.addEventListener("change", update);
    update();
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
}

function SceneCopy({ scene }: { scene: Scene }) {
  const { copy } = useLocale();
  const text = copy.scenes[scene.id];
  return (
    <div className="story-copy locale-copy">
      <p className="scene-label">{text.label}</p>
      <h2>{text.title}</h2>
      <p className="scene-description">{text.description}</p>
      <p className="scene-detail">{text.detail}</p>
      {scene.id === "pharmacy" && (
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
  );
}

function BrandIntro({
  opacity,
  shrink,
  reveal,
}: {
  opacity: number;
  shrink: number;
  reveal: number;
}) {
  const { copy } = useLocale();
  return (
    <div
      className="brand-intro"
      style={{
        opacity,
        transform: `translateY(calc(${-shrink * 40}px - ${reveal} * min(38svh, 360px))) scale(${1 - shrink * 0.12})`,
      }}
      aria-hidden={opacity === 0}
    >
      <div className="intro-title-group locale-copy">
        <h1 className="intro-heading">
          <span>{copy.intro.title}</span>
          <strong>PillNote</strong>
        </h1>
        <p
          className="intro-description"
          style={{ opacity: 1 - smoothstep(0, 0.12, reveal) }}
        >
          {copy.intro.description}
        </p>
      </div>
      <div
        className="intro-scroll-cue locale-copy"
        style={{ opacity: 1 - smoothstep(0, 0.12, reveal) }}
      >
        <span>{copy.intro.scroll}</span>
        <ArrowDown size={19} />
      </div>
    </div>
  );
}

function FlowScene({
  scene,
  index,
  reducedMotion,
}: {
  scene: Scene;
  index: number;
  reducedMotion: boolean;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!track.current) return;
      const phone = track.current.querySelector(".phone-film");
      if (!phone) return;
      const rect = track.current.getBoundingClientRect();
      const phoneRect = phone.getBoundingClientRect();
      const top = parseFloat(getComputedStyle(phone).top) || 64;
      const pinned = getComputedStyle(phone).position === "sticky";
      setProgress(
        clamp01(
          pinned
            ? (top - rect.top) / Math.max(1, rect.height - phoneRect.height)
            : (window.innerHeight * 0.55 - phoneRect.height * 0.06 - rect.top) /
                Math.max(1, phoneRect.height * 1.3),
        ),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
  return (
    <section className={`flow-scene tone-${scene.tone}`} id={`scene-${index}`}>
      <SceneCopy scene={scene} />
      <div
        className="flow-film-track"
        ref={track}
        style={
          { "--flow-screens": getChapterScreens(index) } as React.CSSProperties
        }
      >
        <PhoneFilm
          scene={scene}
          progress={progress}
          reducedMotion={reducedMotion}
        />
      </div>
    </section>
  );
}

const stageColors = scenes.map(() => [242, 245, 243]);

function StoryViewport({
  state,
  reducedMotion,
  naturalFlow,
  goToScene,
  navigationOpacity,
}: {
  state: ScrollState;
  reducedMotion: boolean;
  naturalFlow: boolean;
  goToScene: (index: number) => void;
  navigationOpacity: number;
}) {
  const { copy } = useLocale();
  const active = naturalFlow ? 0 : state.activeIndex;
  const progress = naturalFlow ? 0 : state.progress;
  const transition = naturalFlow
    ? 0
    : reducedMotion
      ? Number(state.transition >= 0.5)
      : smoothstep(0, 1, state.transition);
  const current = scenes[active];
  const next = scenes[active + 1];
  const displayIndex = active + Number(transition >= 0.5 && Boolean(next));
  const shrink = reducedMotion
    ? state.introProgress >= 0.65
      ? 1
      : 0
    : smoothstep(0, 1, state.introProgress);
  const reveal = reducedMotion
    ? state.introProgress >= 0.65
      ? 1
      : 0
    : introHandoff(state.introProgress);
  const introOpacity = 1 - smoothstep(0, 0.7, reveal);
  const color = stageColors[active].map((channel, i) =>
    Math.round(
      channel +
        ((stageColors[active + 1] || stageColors[active])[i] - channel) *
          transition,
    ),
  );
  const stageStyle = {
    "--intro-shrink": shrink,
    "--stage-color": `rgb(${color.join(" ")})`,
  } as React.CSSProperties;
  return (
    <div
      className={`story-viewport ${naturalFlow ? "natural-intro" : ""}`}
      data-intro-progress={state.introProgress}
    >
      <section
        className="film-stage"
        id="app-story"
        style={stageStyle}
        aria-label={copy.storyLabel}
      >
        <BrandIntro opacity={introOpacity} shrink={shrink} reveal={reveal} />
        <div
          className="app-presentation"
          style={{
            opacity: reveal,
            transform: reducedMotion
              ? undefined
              : `translateY(calc(${1 - reveal} * min(32svh, 300px))) scale(${1.04 - reveal * 0.04})`,
            visibility: reveal === 0 ? "hidden" : "visible",
          }}
          aria-hidden={reveal === 0}
        >
          <div
            className="stage-layout"
            style={{
              opacity: navigationOpacity,
              transition: reducedMotion
                ? "none"
                : `opacity ${NAVIGATION_FADE_MS}ms ease`,
            }}
          >
            <div
              className="copy-stack"
              style={{ opacity: smoothstep(0.55, 1, reveal) }}
            >
              <div
                className="copy-layer"
                style={{
                  opacity: 1 - smoothstep(0, 0.5, transition),
                  transform: `translateY(${-transition * 18}px)`,
                  pointerEvents: transition > 0.5 ? "none" : "auto",
                }}
                aria-hidden={transition > 0.5}
                inert={transition > 0.5}
              >
                <SceneCopy scene={current} />
              </div>
              {next && !naturalFlow && (
                <div
                  className="copy-layer"
                  style={{
                    opacity: smoothstep(0.5, 1, transition),
                    transform: `translateY(${(1 - transition) * 18}px)`,
                    visibility: transition === 0 ? "hidden" : "visible",
                    pointerEvents: transition <= 0.5 ? "none" : "auto",
                  }}
                  aria-hidden={transition <= 0.5}
                  inert={transition <= 0.5}
                >
                  <SceneCopy scene={next} />
                </div>
              )}
            </div>
            <div className="phone-scene">
              <PhoneFilm
                scene={current}
                progress={progress}
                nextScene={naturalFlow ? undefined : next}
                transition={naturalFlow ? 0 : state.transition}
                reducedMotion={reducedMotion}
              />
            </div>
          </div>
          {!naturalFlow && (
            <nav className="chapter-nav" aria-label={copy.chaptersLabel}>
              {scenes.map((scene, index) => (
                <button
                  onClick={() => goToScene(index)}
                  aria-label={`${index + 1}. ${copy.scenes[scene.id].label}`}
                  aria-current={displayIndex === index ? "step" : undefined}
                  className={displayIndex === index ? "active" : ""}
                  key={scene.id}
                >
                  <span>{copy.scenes[scene.id].label}</span>
                  <i />
                </button>
              ))}
            </nav>
          )}
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const { copy } = useLocale();
  const [state, setState] = useState(() =>
    getScrollState(0, window.innerHeight, scenes.length),
  );
  const story = useRef<HTMLDivElement>(null);
  const mobileMenu = useRef<HTMLDetailsElement>(null);
  const reducedMotion = useMedia("(prefers-reduced-motion: reduce)");
  const naturalFlow = useMedia(
    "(max-width: 1024px) and (max-height: 480px) and (orientation: landscape)",
  );
  useWeightedScroll(reducedMotion);
  const { navigateTo, contentOpacity } = useChapterNavigation(reducedMotion);
  useLayoutEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!story.current) return;
      const height =
        document.querySelector(".story-viewport")?.getBoundingClientRect()
          .height || window.innerHeight;
      setState(
        getScrollState(
          -story.current.getBoundingClientRect().top,
          height,
          scenes.length,
        ),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [naturalFlow]);
  useEffect(() => {
    scenes
      .flatMap((scene) => scene.frames)
      .filter((frame) => !notificationScreens.has(frame.image))
      .forEach((frame) => {
        const image = new Image();
        image.src = `/images/app/${frame.image}.png`;
      });
  }, []);
  function goHome() {
    if (mobileMenu.current) mobileMenu.current.open = false;
    navigateTo(0);
  }
  function goToScene(index: number, fromChapterNav = false) {
    if (mobileMenu.current) mobileMenu.current.open = false;
    if (!story.current) return;
    if (naturalFlow && index > 0) {
      const element = document.getElementById(`scene-${index}`);
      if (element)
        navigateTo(window.scrollY + element.getBoundingClientRect().top - 64);
      return;
    }
    const height =
      document.querySelector(".story-viewport")?.getBoundingClientRect()
        .height || window.innerHeight;
    const top = window.scrollY + story.current.getBoundingClientRect().top;
    navigateTo(
      top +
        (naturalFlow
          ? INTRO_SCREENS * height
          : sceneScrollOffset(index, height)),
      fromChapterNav
        ? chapterNavigationMode(
            state.activeIndex,
            state.progress,
            scenes[state.activeIndex].frames.at(-1)!.at,
            index,
          )
        : "scroll",
    );
  }
  return (
    <>
      <a className="skip-link" href="#about">
        {copy.skip}
      </a>
      <header
        className="site-header"
        style={{
          backgroundColor: `rgba(255, 255, 255, ${smoothstep(0.48, 0.95, state.introProgress) * 0.94})`,
        }}
      >
        <a
          className="brand"
          href="#top"
          onClick={(event) => {
            event.preventDefault();
            goHome();
          }}
        >
          <img src="/images/pillnote-logo.webp" alt="" />
          <span>PillNote</span>
        </a>
        <nav aria-label={copy.navigation}>
          <button className="locale-copy" onClick={() => goToScene(0)}>
            {copy.explore}
          </button>
          <a className="locale-copy" href="#about">
            {copy.guide}
          </a>
          <LanguageSwitch className="desktop-language" />
          <a
            className="release-button"
            aria-label={copy.release}
            href={RELEASES_URL}
          >
            <span className="release-label-full locale-copy">
              {copy.release}
            </span>
            <span className="release-label-short locale-copy">
              {copy.releaseShort}
            </span>
            <ArrowRight size={20} />
          </a>
          <details className="mobile-nav" ref={mobileMenu}>
            <summary aria-label={copy.menu}>
              <Menu size={24} />
            </summary>
            <div className="mobile-nav-panel">
              <button className="locale-copy" onClick={() => goToScene(0)}>
                {copy.explore}
              </button>
              <a
                href="#about"
                className="locale-copy"
                onClick={() => {
                  if (mobileMenu.current) mobileMenu.current.open = false;
                }}
              >
                {copy.guide}
              </a>
              <div className="mobile-language-row">
                <span className="locale-copy">{copy.language}</span>
                <LanguageSwitch />
              </div>
            </div>
          </details>
        </nav>
      </header>
      <main id="top">
        <div
          className={`scroll-story ${naturalFlow ? "intro-only" : ""}`}
          ref={story}
          style={
            {
              "--story-screens": naturalFlow
                ? INTRO_SCREENS + 1
                : getStoryScreens(scenes.length),
            } as React.CSSProperties
          }
        >
          <StoryViewport
            state={state}
            reducedMotion={reducedMotion}
            naturalFlow={naturalFlow}
            goToScene={(index) => goToScene(index, true)}
            navigationOpacity={contentOpacity}
          />
        </div>
        {naturalFlow && (
          <div className="natural-story">
            {scenes.slice(1).map((scene, index) => (
              <FlowScene
                scene={scene}
                index={index + 1}
                reducedMotion={reducedMotion}
                key={scene.id}
              />
            ))}
          </div>
        )}
        <section className="about-section" id="about">
          <div className="about-intro locale-copy">
            <img src="/images/app-icon.png" alt="" />
            <h2>{copy.about.title}</h2>
            <p>{copy.about.features}</p>
            <a className="about-release" href={RELEASES_URL}>
              {copy.about.release}
              <ArrowRight size={18} />
            </a>
          </div>
          <div className="faq-list locale-copy">
            {copy.faqs.map((faq, index) => (
              <details key={index}>
                <summary>
                  {faq.question}
                  <ChevronDown size={19} />
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <a
          className="brand"
          href="#top"
          onClick={(event) => {
            event.preventDefault();
            goHome();
          }}
        >
          <img src="/images/pillnote-logo.webp" alt="" />
          <span>PillNote</span>
        </a>
        <div>
          <span>{copy.developer}</span>
          <a href="mailto:dohyun.kim@pillnote.app">
            dohyun.kim@pillnote.app
            <ArrowRight size={12} />
          </a>
        </div>
        <span>© {new Date().getFullYear()} PillNote</span>
      </footer>
    </>
  );
}
