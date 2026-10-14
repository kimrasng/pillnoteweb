import { sceneScrollOffset } from "./scroll.ts";

export type NavigationMode = "scroll" | "direct" | "instant";
export const NAVIGATION_FADE_MS = 160;

export function chapterNavigationMode(
  currentIndex: number,
  progress: number,
  completedAt: number,
  targetIndex: number,
): NavigationMode {
  return targetIndex === currentIndex + 1 && progress >= completedAt
    ? "scroll"
    : "direct";
}

export function navigationEase(progress: number) {
  const t = Number.isNaN(progress) ? 0 : Math.max(0, Math.min(1, progress));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function navigationDuration(distance: number, viewportHeight: number) {
  const screens = Math.abs(distance) / Math.max(1, viewportHeight);
  return Math.min(2800, 850 + 400 * Math.log1p(screens));
}

// Browsers can quantize scrollY to whole CSS pixels. Land safely inside the
// requested chapter, even when its authored boundary is fractional.
export function chapterDestination(
  origin: number,
  index: number,
  height: number,
) {
  return Math.ceil(origin + sceneScrollOffset(index, height)) + 1;
}
