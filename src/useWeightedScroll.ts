import { useEffect } from "react";

export function weightedWheelDelta(
  delta: number,
  mode: number,
  height: number,
): number {
  const pixels = delta * (mode === 1 ? 16 : mode === 2 ? height : 1);
  return Math.max(-height * 0.85, Math.min(height * 0.85, pixels));
}
export function dampScroll(
  current: number,
  target: number,
  elapsedMs: number,
): number {
  return (
    current +
    (target - current) *
      (1 - Math.exp(-Math.min(50, Math.max(0, elapsedMs)) / 45))
  );
}

export default function useWeightedScroll(disabled: boolean) {
  useEffect(() => {
    if (disabled || !matchMedia("(pointer: fine)").matches) return;
    let raf = 0,
      target = window.scrollY,
      lastWrite = window.scrollY,
      previousTime = 0,
      direction = 0;
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      target = window.scrollY;
      direction = 0;
    };
    const tick = (time: number) => {
      const current = window.scrollY;
      if (Math.abs(current - lastWrite) > 2) {
        stop();
        return;
      }
      const gap = target - current;
      const next =
        Math.abs(gap) < 0.5
          ? target
          : dampScroll(
              current,
              target,
              previousTime ? time - previousTime : 16,
            );
      previousTime = time;
      lastWrite = next;
      window.scrollTo({ top: next, behavior: "instant" });
      if (Math.abs(target - next) < 0.5) {
        raf = 0;
        direction = 0;
      } else raf = requestAnimationFrame(tick);
    };
    const wheel = (event: WheelEvent) => {
      if (
        !event.cancelable ||
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
      )
        return;
      const element = event.target instanceof Element ? event.target : null;
      if (
        !element?.closest(".scroll-story, .flow-scene") ||
        element.closest("dialog, input, textarea, select")
      )
        return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const sign = Math.sign(event.deltaY);
      if (
        !sign ||
        (window.scrollY <= 0 && sign < 0) ||
        (window.scrollY >= max - 1 && sign > 0)
      )
        return;
      event.preventDefault();
      if (!raf || sign !== direction) {
        target = window.scrollY;
        previousTime = 0;
      }
      direction = sign;
      const delta = weightedWheelDelta(
        event.deltaY,
        event.deltaMode,
        window.innerHeight,
      );
      target = Math.max(
        0,
        Math.min(
          max,
          Math.max(
            window.scrollY - window.innerHeight * 1.2,
            Math.min(window.scrollY + window.innerHeight * 1.2, target + delta),
          ),
        ),
      );
      if (!raf) {
        lastWrite = window.scrollY;
        raf = requestAnimationFrame(tick);
      }
    };
    const interrupt = () => {
      if (raf) stop();
    };
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("pointerdown", interrupt);
    window.addEventListener("keydown", interrupt);
    window.addEventListener("resize", interrupt);
    window.addEventListener("pillnote:navigation-start", interrupt);
    return () => {
      stop();
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("pointerdown", interrupt);
      window.removeEventListener("keydown", interrupt);
      window.removeEventListener("resize", interrupt);
      window.removeEventListener("pillnote:navigation-start", interrupt);
    };
  }, [disabled]);
}
