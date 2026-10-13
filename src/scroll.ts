import { chapterLengths, CHAPTER_EXIT_SCREENS } from "./pacing.ts";

export const INTRO_SCREENS = 1.2;
export const CHAPTER_SCREENS = 2.15;
// Compact coordinates for sampling captures. Input thresholds and playback
// duration are separate from this authored timeline.
export const CHAPTER_SCROLL_SCALE = 0.4;
export const CHAPTER_SCROLL_EXIT_SCREENS =
  CHAPTER_EXIT_SCREENS * CHAPTER_SCROLL_SCALE;

export function getChapterScreens(index: number): number {
  return (chapterLengths[index] ?? CHAPTER_SCREENS) * CHAPTER_SCROLL_SCALE;
}

export function getChapterStart(index: number): number {
  let start = INTRO_SCREENS;
  for (let chapter = 0; chapter < Math.max(0, index); chapter += 1) {
    start += getChapterScreens(chapter);
  }
  return start;
}

export type ScrollState = {
  introProgress: number;
  scenePosition: number;
  activeIndex: number;
  progress: number;
  transition: number;
};

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function smoothstep(from: number, to: number, value: number): number {
  if (from === to) return value < from ? 0 : 1;
  const progress = clamp01((value - from) / (to - from));
  return progress * progress * (3 - 2 * progress);
}

export function introHandoff(progress: number): number {
  return smoothstep(0.28, 0.78, progress);
}

export function getStoryScreens(sceneCount: number): number {
  return getChapterStart(sceneCount) + 1;
}

export const STORY_SCREENS = getStoryScreens(7);

export function getScrollState(
  distancePixels: number,
  viewportHeight: number,
  sceneCount: number,
): ScrollState {
  const height = Math.max(1, viewportHeight);
  const count = Math.max(1, Math.floor(sceneCount));
  const screens = distancePixels / height;
  const introProgress = clamp01(screens / INTRO_SCREENS);
  let chapter = 0;
  let remaining = Math.max(0, screens - INTRO_SCREENS);
  while (chapter < count - 1 && remaining >= getChapterScreens(chapter)) {
    remaining -= getChapterScreens(chapter);
    chapter += 1;
  }
  const rawPosition = Math.min(
    count,
    chapter + remaining / getChapterScreens(chapter),
  );
  // Preserve exact chapter boundaries through floating-point viewport scaling.
  const nearestBoundary = Math.round(rawPosition);
  const scenePosition =
    Math.abs(rawPosition - nearestBoundary) < 1e-10
      ? nearestBoundary
      : rawPosition;
  const activeIndex = Math.min(count - 1, Math.floor(scenePosition));
  const progress = clamp01(scenePosition - activeIndex);

  return {
    introProgress,
    scenePosition,
    activeIndex,
    progress,
    transition:
      activeIndex < count - 1
        ? clamp01(
            (progress -
              (1 -
                CHAPTER_SCROLL_EXIT_SCREENS / getChapterScreens(activeIndex))) /
              (CHAPTER_SCROLL_EXIT_SCREENS / getChapterScreens(activeIndex)),
          )
        : 0,
  };
}

export function sceneScrollOffset(
  index: number,
  viewportHeight: number,
): number {
  return getChapterStart(Math.max(0, index)) * Math.max(1, viewportHeight);
}
