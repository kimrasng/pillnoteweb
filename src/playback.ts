import { scenes } from "./story.ts";
import {
  getChapterScreens,
  getChapterStart,
  INTRO_SCREENS,
  CHAPTER_SCROLL_EXIT_SCREENS,
} from "./scroll.ts";

export type PlaybackStep = { start: number; end: number; duration: number };

const durations: Record<string, number> = {
  search: 1400,
  typing: 1400,
  dose: 1100,
  update: 750,
  dialog: 800,
  "dismiss-dialog": 850,
  notification: 650,
  scroll: 850,
  sheet: 800,
};

// Coordinates still select genuine renders; time now drives a complete action.
export const playbackSteps: PlaybackStep[] = [
  { start: 0, end: INTRO_SCREENS, duration: 700 },
  ...scenes.flatMap((scene, index) => {
    const chapter = getChapterStart(index);
    const length = getChapterScreens(index);
    const actions = scene.frames.slice(1).map((frame, frameIndex) => ({
      start:
        chapter +
        Math.max(
          scene.frames[frameIndex].at,
          frame.at - (frame.duration ?? 0.08),
        ) *
          length,
      end: chapter + frame.at * length,
      duration: durations[frame.motion ?? ""] ?? 950,
    }));
    const end = getChapterStart(index + 1);
    actions.push({
      start:
        index < scenes.length - 1
          ? end - CHAPTER_SCROLL_EXIT_SCREENS
          : actions.at(-1)!.end,
      end,
      duration: index < scenes.length - 1 ? 950 : 500,
    });
    return actions;
  }),
];

export const playbackEnd = playbackSteps.at(-1)!.end;
export function scrollThreshold(height: number) {
  return Math.max(220, Math.min(360, height * 0.4));
}
export function accumulateGesture(
  current: number,
  delta: number,
  threshold: number,
) {
  const accumulated =
    Math.sign(current) && Math.sign(current) !== Math.sign(delta)
      ? delta
      : current + delta;
  return Math.abs(accumulated) >= threshold
    ? { accumulated: 0, direction: Math.sign(accumulated) }
    : { accumulated, direction: 0 };
}
export function nextPlaybackStep(position: number, direction: number) {
  if (direction > 0)
    return playbackSteps.find((step) => step.end > position + 0.002);
  for (let index = playbackSteps.length - 1; index >= 0; index--) {
    if (playbackSteps[index].start < position - 0.002)
      return playbackSteps[index];
  }
}
export function playbackPosition(
  from: number,
  to: number,
  elapsed: number,
  duration: number,
) {
  return from + (to - from) * Math.min(1, Math.max(0, elapsed / duration));
}
