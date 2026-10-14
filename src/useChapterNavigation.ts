import { useCallback, useEffect, useRef, useState } from "react";
import {
  navigationDuration,
  navigationEase,
  NAVIGATION_FADE_MS,
  type NavigationMode,
} from "./navigation";

export default function useChapterNavigation(reducedMotion: boolean) {
  const frame = useRef(0);
  const fadeTimer = useRef(0);
  const [contentOpacity, setContentOpacity] = useState(1);
  const stop = useCallback(() => {
    cancelAnimationFrame(frame.current);
    clearTimeout(fadeTimer.current);
    frame.current = 0;
    fadeTimer.current = 0;
    setContentOpacity(1);
  }, []);
  useEffect(() => {
    // A new input takes over immediately, including a second chapter click.
    const events = ["wheel", "touchstart", "pointerdown", "keydown", "resize"];
    for (const event of events)
      window.addEventListener(event, stop, { passive: true });
    return () => {
      cancelAnimationFrame(frame.current);
      clearTimeout(fadeTimer.current);
      for (const event of events) window.removeEventListener(event, stop);
    };
  }, [stop]);
  const navigateTo = useCallback(
    (destination: number, mode: NavigationMode = "scroll") => {
      stop();
      window.dispatchEvent(new Event("pillnote:navigation-start"));
      const origin = window.scrollY;
      const maximum = Math.max(
        0,
        document.documentElement.scrollHeight - innerHeight,
      );
      const target = Math.max(0, Math.min(maximum, destination));
      if (mode === "instant" || reducedMotion || Math.abs(target - origin) < 1) {
        window.scrollTo({ top: target, behavior: "instant" });
        return;
      }
      if (mode === "direct") {
        setContentOpacity(0);
        fadeTimer.current = window.setTimeout(() => {
          fadeTimer.current = 0;
          window.scrollTo({ top: target, behavior: "instant" });
          // Let React apply the new chapter and its first frame while hidden.
          frame.current = requestAnimationFrame(() => {
            frame.current = requestAnimationFrame(() => {
              frame.current = 0;
              setContentOpacity(1);
            });
          });
        }, NAVIGATION_FADE_MS);
        return;
      }
      const duration = navigationDuration(target - origin, innerHeight);
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        window.scrollTo({
          top: origin + (target - origin) * navigationEase(progress),
          behavior: "instant",
        });
        frame.current = progress < 1 ? requestAnimationFrame(tick) : 0;
      };
      frame.current = requestAnimationFrame(tick);
    },
    [reducedMotion, stop],
  );
  return { navigateTo, contentOpacity };
}
