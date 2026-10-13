import { nativeFocusProgress } from "./native.ts";
import { scenes } from "./story.ts";
import {
  getChapterScreens,
  getChapterStart,
  INTRO_SCREENS,
  CHAPTER_SCROLL_EXIT_SCREENS,
} from "./scroll.ts";

export type PlaybackHold = { position: number; duration: number };
export type PlaybackStep = {
  start: number;
  end: number;
  duration: number;
  holds?: PlaybackHold[];
};
export const EMAIL_FOCUS_PAUSE_MS = 400;

const durations: Record<string, number> = {
  push: 820,
  lock: 450,
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
    const actions: PlaybackStep[] = scene.frames
      .slice(1)
      .map((frame, frameIndex) => {
        const start =
          chapter +
          Math.max(
            scene.frames[frameIndex].at,
            frame.at - (frame.duration ?? 0.08),
          ) *
            length;
        const end = chapter + frame.at * length;
        const focus =
          frame.image === "guardian-invite"
            ? nativeFocusProgress(
                scene.frames[frameIndex].image,
                frame.image,
                0,
                frame.touchExtension,
                frame.pauseExtension,
              )
            : null;
        const holds =
          focus === null
            ? []
            : [
                {
                  position: start + (end - start) * focus,
                  duration: EMAIL_FOCUS_PAUSE_MS,
                },
              ];
        return {
          start,
          end,
          duration:
            (durations[frame.motion ?? ""] ?? 950) +
            holds.reduce((sum, hold) => sum + hold.duration, 0),
          holds,
        };
      });
    const end = getChapterStart(index + 1);
    actions.push({
      start:
        index < scenes.length - 1
          ? end - CHAPTER_SCROLL_EXIT_SCREENS
          : actions.at(-1)!.end,
      end,
      duration:
        index < scenes.length - 1
          ? scenes[index + 1].entry === "lock"
            ? 450
            : scenes[index + 1].entry === "push"
              ? 820
              : 950
          : 500,
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

// A stalled decode or a long main-thread task must not consume unseen motion.
export function createPlaybackClock(
  from: number,
  to: number,
  duration: number,
  started: number,
  holds: PlaybackHold[] = [],
) {
  const activeHolds = holds
    .filter(
      (hold) =>
        hold.position > Math.min(from, to) &&
        hold.position < Math.max(from, to),
    )
    .sort((a, b) => (a.position - b.position) * Math.sign(to - from));
  const motionDuration =
    duration - holds.reduce((sum, hold) => sum + hold.duration, 0);
  const totalDuration =
    motionDuration + activeHolds.reduce((sum, hold) => sum + hold.duration, 0);
  let elapsed = 0;
  let previousTime = started;
  return {
    advance(time: number, ready: (position: number) => boolean) {
      const delta = Math.max(0, Math.min(32, time - previousTime));
      previousTime = time;
      const nextElapsed = Math.min(totalDuration, elapsed + delta);
      let motionElapsed = nextElapsed;
      for (const hold of activeHolds) {
        const holdAt = (motionDuration * (hold.position - from)) / (to - from);
        if (motionElapsed < holdAt) break;
        if (motionElapsed < holdAt + hold.duration) {
          motionElapsed = holdAt;
          break;
        }
        motionElapsed -= hold.duration;
      }
      const position = playbackPosition(
        from,
        to,
        motionElapsed,
        motionDuration,
      );
      if (!ready(position)) return null;
      elapsed = nextElapsed;
      return { position, complete: elapsed >= totalDuration };
    },
  };
}
