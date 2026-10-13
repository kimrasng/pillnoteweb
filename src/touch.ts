export type TouchCue = {
  x: number;
  y: number;
  start: number;
  release: number;
  end: number;
  motionStart?: number;
};
export type TouchPose = TouchCue & {
  opacity: number;
  scale: number;
  ringOpacity: number;
  ringScale: number;
  phase: "down" | "release";
};

const notificationTouchEnd =
  (motionDistances.unlock * 0.3 + TOUCH_EXTRA_SCREENS) /
  (motionDistances.unlock + TOUCH_EXTRA_SCREENS + POST_TOUCH_PAUSE_SCREENS);
export const notificationTouch: TouchCue = {
  x: 195,
  y: 600,
  start: 0,
  release: notificationTouchEnd * TOUCH_PRESS_SHARE,
  end: notificationTouchEnd,
  motionStart:
    notificationTouchEnd +
    POST_TOUCH_PAUSE_SCREENS /
      (motionDistances.unlock + TOUCH_EXTRA_SCREENS + POST_TOUCH_PAUSE_SCREENS),
};

export function getTouchPose(cue: TouchCue, progress: number): TouchPose {
  const down = Math.max(
    0,
    Math.min(
      1,
      (progress - cue.start) / Math.max(0.0001, cue.release - cue.start),
    ),
  );
  const up = Math.max(
    0,
    Math.min(
      1,
      (progress - cue.release) / Math.max(0.0001, cue.end - cue.release),
    ),
  );
  const visible = progress > cue.start + 1e-10 && progress < cue.end - 1e-10;
  return {
    ...cue,
    phase: progress < cue.release ? "down" : "release",
    opacity: visible ? Math.min(1, down * 5) * (1 - up) : 0,
    scale: progress < cue.release ? 1 - 0.2 * down : 0.8 + 0.35 * up,
    ringOpacity: visible
      ? progress < cue.release
        ? 0.18 * down
        : 0.48 * (1 - up)
      : 0,
    ringScale: progress < cue.release ? 0.9 : 1 + 0.7 * up,
  };
}
import {
  motionDistances,
  TOUCH_EXTRA_SCREENS,
  TOUCH_PRESS_SHARE,
  POST_TOUCH_PAUSE_SCREENS,
} from "./pacing.ts";
