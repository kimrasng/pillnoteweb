import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, ChevronDown, Menu } from "lucide-react";
import PhoneFilm from "./PhoneFilm";
import { scenes, type Scene } from "./story";
import { notificationScreens } from "./NotificationScreen";
import useWeightedScroll from "./useWeightedScroll";
import useChapterNavigation from "./useChapterNavigation";
import { LocaleText, useLocale } from "./LocaleProvider";
import LanguageSwitch from "./LanguageSwitch";
import { CONTACT_EMAIL, COMPANY_PROFILE_URL, RELEASES_URL } from "./links";
import {
  DataGuide,
  DownloadGuide,
  ProductOverview,
  ProductStatus,
} from "./ProductInfo";
import { productTranslations } from "./productCopy";
import {
  chapterDestination,
  chapterNavigationMode,
  NAVIGATION_FADE_MS,
} from "./navigation";
import {
  getChapterScreens,
  INTRO_SCREENS,
  clamp01,
  getScrollState,
  getStoryScreens,
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
    <div className="story-copy">
      <p className="scene-label">
        <LocaleText>{text.label}</LocaleText>
      </p>
      <h2>
        <LocaleText>{text.title}</LocaleText>
      </h2>
      <p className="scene-description">
        <LocaleText>{text.description}</LocaleText>
      </p>
      <p className="scene-detail">
        <LocaleText>{text.detail}</LocaleText>
      </p>
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
      inert={reveal >= 0.12}
    >
      <div className="intro-title-group">
        <h1 className="intro-heading">
          <span>
            <LocaleText>{copy.intro.title}</LocaleText>
          </span>
          <strong>PillNote</strong>
        </h1>
        <div
          className="intro-body"
          style={{ opacity: 1 - smoothstep(0, 0.12, reveal) }}
        >
          <p className="intro-audience">
            <LocaleText>{copy.intro.audience}</LocaleText>
          </p>
          <p className="intro-description">
            <LocaleText>{copy.intro.description}</LocaleText>
          </p>
          <p className="intro-conditions">
            <LocaleText>{copy.intro.conditions}</LocaleText>
          </p>
          <div className="intro-actions">
            <a className="primary-action" href="#download">
              <LocaleText>{copy.release}</LocaleText>
              <ArrowRight size={18} />
            </a>
            <a href="#features">
              <LocaleText>{copy.intro.features}</LocaleText>
              <ArrowDown size={18} />
            </a>
          </div>
          <p className="intro-platform">
            <LocaleText>{copy.intro.platform}</LocaleText>
          </p>
        </div>
      </div>
      <div
        className="intro-scroll-cue"
        style={{ opacity: 1 - smoothstep(0, 0.12, reveal) }}
      >
        <span>
          <LocaleText>{copy.intro.scroll}</LocaleText>
        </span>
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
      if (rect.top >= innerHeight || rect.bottom <= 0) {
        setProgress(rect.bottom <= 0 ? 1 : 0);
        return;
      }
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

const stageColors = scenes.map(() => [245, 246, 248]);

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
        tabIndex={-1}
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
          inert={reveal === 0}
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

function StoryExperience({
  story,
  reducedMotion,
  naturalFlow,
  goToScene,
  navigationOpacity,
  onStateChange,
}: {
  story: React.RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  naturalFlow: boolean;
  goToScene: (index: number) => void;
  navigationOpacity: number;
  onStateChange: (state: ScrollState) => void;
}) {
  const [state, setState] = useState(() =>
    getScrollState(0, innerHeight, scenes.length),
  );
  useLayoutEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!story.current) return;
      const height =
        document.querySelector(".story-viewport")?.getBoundingClientRect()
          .height || window.innerHeight;
      const nextState = getScrollState(
        -story.current.getBoundingClientRect().top,
        height,
        scenes.length,
      );
      setState((previous) =>
        Object.keys(nextState).every(
          (key) =>
            previous[key as keyof ScrollState] ===
            nextState[key as keyof ScrollState],
        )
          ? previous
          : nextState,
      );
      onStateChange(nextState);
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
  }, [naturalFlow, onStateChange, story]);
  return (
    <>
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
          goToScene={goToScene}
          navigationOpacity={navigationOpacity}
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
    </>
  );
}

export default function App() {
  const { copy, locale } = useLocale();
  const productCopy = productTranslations[locale];
  const state = useRef(getScrollState(0, window.innerHeight, scenes.length));
  const header = useRef<HTMLElement>(null);
  const story = useRef<HTMLDivElement>(null);
  const mobileMenu = useRef<HTMLDetailsElement>(null);
  const reducedMotion = useMedia("(prefers-reduced-motion: reduce)");
  const naturalFlow = useMedia(
    "(max-width: 1024px) and (max-height: 480px) and (orientation: landscape)",
  );
  useWeightedScroll(reducedMotion);
  const { navigateTo, contentOpacity } = useChapterNavigation(reducedMotion);
  useEffect(() => {
    // Initial hash targets are rendered by React after the browser's first anchor lookup.
    const navigateToHash = () => {
      let id: string;
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }
      const target = document.getElementById(id);
      if (!target) return;
      window.dispatchEvent(new Event("pillnote:navigation-start"));
      target.scrollIntoView({ behavior: "instant", block: "start" });
    };
    const frame = requestAnimationFrame(navigateToHash);
    window.addEventListener("hashchange", navigateToHash);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", navigateToHash);
    };
  }, []);
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
    if (window.location.hash)
      history.replaceState(
        history.state,
        "",
        location.pathname + location.search,
      );
    navigateTo(0, "direct");
  }
  function goToScene(index: number, fromChapterNav = false) {
    if (mobileMenu.current) mobileMenu.current.open = false;
    if (!story.current) return;
    // The cinematic navigation has its own scroll coordinates, rather than a static section hash.
    if (window.location.hash)
      history.replaceState(
        history.state,
        "",
        location.pathname + location.search,
      );
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
      naturalFlow
        ? top + INTRO_SCREENS * height
        : chapterDestination(top, index, height),
      fromChapterNav
        ? chapterNavigationMode(
            state.current.activeIndex,
            state.current.progress,
            scenes[state.current.activeIndex].frames.at(-1)!.at,
            index,
          )
        : "scroll",
    );
  }
  return (
    <>
      <a className="skip-link" href="#features">
        <LocaleText>{copy.skip}</LocaleText>
      </a>
      <header className="site-header" ref={header}>
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
          <button onClick={() => goToScene(0)}>
            <LocaleText>{copy.explore}</LocaleText>
          </button>
          <a href="#features">
            <LocaleText>{copy.guide}</LocaleText>
          </a>
          <a href="#product">
            <LocaleText>{productCopy.productNavigation}</LocaleText>
          </a>
          <LanguageSwitch className="desktop-language" />
          <a
            className="release-button"
            aria-label={copy.release}
            href="#download"
          >
            <span className="release-label-full">
              <LocaleText>{copy.release}</LocaleText>
            </span>
            <span className="release-label-short">
              <LocaleText>{copy.releaseShort}</LocaleText>
            </span>
            <ArrowRight size={20} />
          </a>
          <details className="mobile-nav" ref={mobileMenu}>
            <summary aria-label={copy.menu}>
              <Menu size={24} />
            </summary>
            <div className="mobile-nav-panel">
              <button onClick={() => goToScene(0)}>
                <LocaleText>{copy.explore}</LocaleText>
              </button>
              <a
                href="#features"
                onClick={() => {
                  if (mobileMenu.current) mobileMenu.current.open = false;
                }}
              >
                <LocaleText>{copy.guide}</LocaleText>
              </a>
              <a
                href="#product"
                onClick={() => {
                  if (mobileMenu.current) mobileMenu.current.open = false;
                }}
              >
                <LocaleText>{productCopy.productNavigation}</LocaleText>
              </a>
              <div className="mobile-language-row">
                <span>
                  <LocaleText>{copy.language}</LocaleText>
                </span>
                <LanguageSwitch />
              </div>
            </div>
          </details>
        </nav>
      </header>
      <main id="top">
        <StoryExperience
          story={story}
          reducedMotion={reducedMotion}
          naturalFlow={naturalFlow}
          goToScene={(index) => goToScene(index, true)}
          navigationOpacity={contentOpacity}
          onStateChange={(nextState) => {
            state.current = nextState;
            if (header.current)
              header.current.style.backgroundColor = `rgba(255, 255, 255, ${smoothstep(0.48, 0.95, nextState.introProgress) * 0.94})`;
          }}
        />
        <ProductOverview
          onExplore={() => {
            goToScene(0, true);
            document
              .getElementById("app-story")
              ?.focus({ preventScroll: true });
          }}
        />
        <ProductStatus />
        <DownloadGuide />
        <section
          className="about-section"
          id="about"
          tabIndex={-1}
          aria-labelledby="faq-title"
        >
          <div className="about-intro">
            <img src="/images/app-icon.png" alt="" />
            <h2 id="faq-title">
              <LocaleText>{copy.about.title}</LocaleText>
            </h2>
            <p>
              <LocaleText>{copy.about.features}</LocaleText>
            </p>
            <a className="about-release" href={RELEASES_URL}>
              <LocaleText>{copy.about.release}</LocaleText>
              <ArrowRight size={18} />
            </a>
          </div>
          <div className="faq-list">
            {copy.faqs.map((faq, index) => (
              <details key={index}>
                <summary>
                  <LocaleText>{faq.question}</LocaleText>
                  <ChevronDown size={19} />
                </summary>
                <p>
                  <LocaleText>{faq.answer}</LocaleText>
                </p>
                {faq.link && (
                  <a className="faq-link" href={faq.link.href}>
                    <LocaleText>{faq.link.label}</LocaleText>
                    <ArrowRight size={16} />
                  </a>
                )}
              </details>
            ))}
          </div>
        </section>
        <DataGuide />
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <a
            className="footer-brand"
            href="#top"
            onClick={(event) => {
              event.preventDefault();
              goHome();
            }}
          >
            PillNote
          </a>
          <nav
            className="footer-links"
            aria-label={locale === "ko" ? "사이트 안내" : "Site information"}
          >
            <a href={COMPANY_PROFILE_URL}>
              <LocaleText>{productCopy.productNavigation}</LocaleText>
            </a>
            <a href="#privacy">
              <LocaleText>
                {locale === "ko" ? "개인정보·데이터" : "Privacy & data"}
              </LocaleText>
            </a>
            <a href="#data-deletion">
              <LocaleText>
                {locale === "ko"
                  ? "계정·데이터 삭제"
                  : "Account & data deletion"}
              </LocaleText>
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`}>
              <LocaleText>{locale === "ko" ? "문의" : "Contact"}</LocaleText>
            </a>
          </nav>
          <span className="footer-copyright">
            © {new Date().getFullYear()} PillNote
          </span>
        </div>
      </footer>
    </>
  );
}
