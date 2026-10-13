import { useEffect } from "react";
import { playbackRasterReady } from "./playbackRaster.ts";
import {
  accumulateGesture,
  nextPlaybackStep,
  playbackEnd,
  createPlaybackClock,
  scrollThreshold,
} from "./playback.ts";

export function weightedWheelDelta(
  delta: number,
  mode: number,
  height: number,
): number {
  const pixels = delta * (mode === 1 ? 16 : mode === 2 ? height : 1);
  return Math.max(-height * 0.85, Math.min(height * 0.85, pixels));
}

export default function useWeightedScroll(disabled: boolean) {
  useEffect(() => {
    if (disabled) return;
    let raf = 0,
      accumulated = 0,
      lastInput = 0,
      blockedUntil = 0;
    let touchY: number | null = null;
    const geometry = () => {
      const story = document.querySelector<HTMLElement>(
        ".scroll-story:not(.intro-only)",
      );
      if (!story) return null;
      const height =
        document.querySelector(".story-viewport")?.getBoundingClientRect()
          .height || innerHeight;
      return {
        story,
        origin: story.getBoundingClientRect().top + scrollY,
        height,
      };
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      accumulated = 0;
      blockedUntil = 0;
      const g = geometry();
      if (g) g.story.dataset.playbackState = "idle";
    };
    const canHandle = (target: EventTarget | null, delta: number) => {
      const element = target instanceof Element ? target : null;
      if (
        element?.closest(
          "dialog, input, textarea, select, [contenteditable=true]",
        )
      )
        return false;
      const intro = element?.closest(".intro-title-group");
      if (
        intro &&
        intro.scrollHeight > intro.clientHeight &&
        ((delta > 0 &&
          intro.scrollTop < intro.scrollHeight - intro.clientHeight - 1) ||
          (delta < 0 && intro.scrollTop > 0))
      )
        return false;
      const g = geometry();
      if (!g) return false;
      const position = (scrollY - g.origin) / g.height;
      return (
        raf !== 0 ||
        (position >= -0.002 &&
          position <= playbackEnd + 0.002 &&
          !(position <= 0.002 && delta < 0) &&
          !(position >= playbackEnd - 0.002 && delta > 0))
      );
    };
    const feed = (delta: number) => {
      const now = performance.now();
      // Inputs during playback are discarded: no skipped actions or queued momentum.
      if (raf || now < blockedUntil) {
        accumulated = 0;
        lastInput = now;
        return;
      }
      if (now - lastInput > 1200) accumulated = 0;
      lastInput = now;
      const g = geometry();
      if (!g) return;
      const gesture = accumulateGesture(
        accumulated,
        delta,
        scrollThreshold(g.height),
      );
      accumulated = gesture.accumulated;
      if (!gesture.direction) return;
      const step = nextPlaybackStep(
        (scrollY - g.origin) / g.height,
        gesture.direction,
      );
      if (!step) return;
      const from =
        gesture.direction > 0
          ? Math.max(step.start, (scrollY - g.origin) / g.height)
          : Math.min(step.end, (scrollY - g.origin) / g.height);
      const to = gesture.direction > 0 ? step.end : step.start;
      g.story.dataset.playbackState = "running";
      window.scrollTo({ top: g.origin + from * g.height, behavior: "instant" });
      const clock = createPlaybackClock(
        from,
        to,
        step.duration,
        performance.now(),
        step.holds,
      );
      const tick = (time: number) => {
        // Geometry is stable during an action; resize cancels playback.
        const sample = clock.advance(time, playbackRasterReady);
        if (!sample) {
          raf = requestAnimationFrame(tick);
          return;
        }
        window.scrollTo({
          // Native scrolling can round fractional pixels below the endpoint.
          // Land one pixel inside the stable hold after the final capture.
          top:
            g.origin +
            sample.position * g.height +
            (sample.complete ? gesture.direction : 0),
          behavior: "instant",
        });
        if (!sample.complete) raf = requestAnimationFrame(tick);
        else {
          raf = 0;
          accumulated = 0;
          blockedUntil = time + 250;
          g.story.dataset.playbackState = "idle";
        }
      };
      raf = requestAnimationFrame(tick);
    };
    const wheel = (event: WheelEvent) => {
      if (
        !event.cancelable ||
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
        !canHandle(event.target, event.deltaY)
      )
        return;
      event.preventDefault();
      feed(
        weightedWheelDelta(event.deltaY, event.deltaMode, geometry()!.height),
      );
    };
    const touchStart = (event: TouchEvent) => {
      touchY = event.touches.length === 1 ? event.touches[0].clientY : null;
    };
    const touchMove = (event: TouchEvent) => {
      if (touchY === null || event.touches.length !== 1) return;
      const y = event.touches[0].clientY;
      const delta = touchY - y;
      touchY = y;
      if (!event.cancelable || !canHandle(event.target, delta)) return;
      event.preventDefault();
      feed(delta);
    };
    const touchEnd = () => {
      touchY = null;
    };
    const key = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      )
        return;
      const target = event.target instanceof Element ? event.target : null;
      if (event.key === " " && target?.closest("button, a, summary")) return;
      const page = scrollThreshold(geometry()?.height ?? innerHeight);
      const amount =
        event.key === "ArrowDown"
          ? 60
          : event.key === "ArrowUp"
            ? -60
            : event.key === "PageDown" || (event.key === " " && !event.shiftKey)
              ? page
              : event.key === "PageUp" || (event.key === " " && event.shiftKey)
                ? -page
                : 0;
      if (!amount || !canHandle(event.target, amount)) return;
      event.preventDefault();
      feed(amount);
    };
    stop();
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("touchstart", touchStart, { passive: true });
    window.addEventListener("touchmove", touchMove, { passive: false });
    window.addEventListener("touchend", touchEnd);
    window.addEventListener("touchcancel", touchEnd);
    window.addEventListener("keydown", key);
    window.addEventListener("pillnote:navigation-start", stop);
    window.addEventListener("resize", stop);
    document.addEventListener("visibilitychange", stop);
    return () => {
      stop();
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("touchend", touchEnd);
      window.removeEventListener("touchcancel", touchEnd);
      window.removeEventListener("keydown", key);
      window.removeEventListener("pillnote:navigation-start", stop);
      window.removeEventListener("resize", stop);
      document.removeEventListener("visibilitychange", stop);
    };
  }, [disabled]);
}
