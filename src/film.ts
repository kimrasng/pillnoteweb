import type { CaptureFrame, Gesture, Scene } from "./story.ts";
import { getScreenMotion, restingPose, type FramePose } from "./motion.ts";
import { getTouchPose, notificationTouch, type TouchPose } from "./touch.ts";
import {
  hasNativeClip,
  nativeTouchCount,
  sampleNativeClip,
  type NativeSample,
} from "./native.ts";
import {
  BASE_CHAPTER_EXIT_SCREENS,
  TOUCH_EXTRA_SCREENS,
  POST_TOUCH_PAUSE_SCREENS,
} from "./pacing.ts";
import { lockPower } from "./feedback.ts";

export const FRAME_FADE_DISTANCE = 0.08;
type FilmFrame = FramePose & { image: string; weight: number };
type FilmGesture = { opacity: number; scale: number; progress: number };
export type FilmState = {
  progress: number;
  transition: number;
  dominantFrame: number;
  dominantImage: string;
  frames: FilmFrame[];
  gestures: FilmGesture[];
  motion: string;
  shade: number;
  pinnedHeader: number;
  pinnedImage: string;
  searchProgress: number;
  backgroundImage: string;
  native: NativeSample | null;
  touches: TouchPose[];
  doseProgress: number | null;
  unlockProgress: number;
  power: number;
};
export function clampProgress(progress: number): number {
  return Number.isNaN(progress) ? 0 : Math.max(0, Math.min(1, progress));
}
function smoothstep(value: number): number {
  return value * value * (3 - 2 * value);
}
function motionProgress(from: CaptureFrame, to: CaptureFrame, local: number) {
  if (
    hasNativeClip(from.image, to.image) ||
    to.motion === "search" ||
    to.motion === "scroll"
  )
    return local;
  if (to.motion === "unlock") {
    const motionStart = notificationTouch.motionStart ?? notificationTouch.end;
    if (local <= motionStart + 1e-10) return 0;
    return smoothstep(clampProgress((local - motionStart) / (1 - motionStart)));
  }
  return smoothstep(local);
}
export function getGestureState(
  gesture: Gesture,
  progress: number,
  reducedMotion = false,
): FilmGesture {
  const span = gesture.end - gesture.start;
  const local = span > 0 ? clampProgress((progress - gesture.start) / span) : 0;
  if (
    reducedMotion ||
    span <= 0 ||
    progress <= gesture.start ||
    progress >= gesture.end
  )
    return { opacity: 0, scale: 0.85, progress: local };
  const opacity =
    local < 0.5 ? smoothstep(local * 2) : 1 - smoothstep((local - 0.5) * 2);
  const scale =
    local < 0.5
      ? 0.85 - 0.2 * smoothstep(local * 2)
      : 0.65 + 0.65 * smoothstep((local - 0.5) * 2);
  return { opacity, scale, progress: local };
}

// Coordinates sample the captures; the input controller advances whole actions in time.
export function getFilmState(
  scene: Pick<Scene, "frames" | "gestures">,
  progress: number,
  reducedMotion = false,
  nextScene?: Pick<Scene, "frames" | "entry">,
  transition = 0,
): FilmState {
  const position = clampProgress(progress);
  const boundary = nextScene?.frames.length
    ? reducedMotion
      ? Number(clampProgress(transition) >= 0.5)
      : clampProgress(transition)
    : 0;
  const images = [
    ...new Set([
      ...scene.frames.map((frame) => frame.image),
      ...(nextScene?.frames.slice(0, 1).map((frame) => frame.image) ?? []),
    ]),
  ];
  const frames: FilmFrame[] = images.map((image) => ({
    image,
    weight: 0,
    ...restingPose(),
  }));
  let settled = 0;
  for (let i = 1; i < scene.frames.length; i++)
    if (position + 1e-10 >= scene.frames[i].at) settled = i;
  let from = scene.frames[settled];
  let to: CaptureFrame | undefined;
  let blend = 0;
  let actionProgress = 0;
  const next = scene.frames[settled + 1];
  if (next && !reducedMotion) {
    const start = Math.max(
      from.at,
      next.at - (next.duration ?? FRAME_FADE_DISTANCE),
    );
    if (position > start) {
      to = next;
      const local = clampProgress((position - start) / (next.at - start));
      actionProgress = local;
      blend = motionProgress(from, next, local);
    }
  }
  if (boundary > 0 && nextScene?.frames[0]) {
    from = scene.frames.at(-1)!;
    to = {
      ...nextScene.frames[0],
      motion: nextScene.entry ?? "push",
      touchExtension: nativeTouchCount(from.image, nextScene.frames[0].image)
        ? TOUCH_EXTRA_SCREENS / BASE_CHAPTER_EXIT_SCREENS
        : 0,
      pauseExtension: nativeTouchCount(from.image, nextScene.frames[0].image)
        ? POST_TOUCH_PAUSE_SCREENS / BASE_CHAPTER_EXIT_SCREENS
        : 0,
    };
    actionProgress = boundary;
    blend = motionProgress(from, to, boundary);
  }
  let shade = 0,
    pinnedHeader = 0,
    pinnedImage = "";
  const previous = frames.find((frame) => frame.image === from.image);
  const incoming = to && frames.find((frame) => frame.image === to.image);
  const native =
    to && !reducedMotion
      ? sampleNativeClip(
          from.image,
          to.image,
          blend,
          to.touchExtension,
          to.pauseExtension,
        )
      : null;
  if (previous) Object.assign(previous, { opacity: 1, weight: 1, zIndex: 0 });
  if (previous && incoming && to && incoming !== previous) {
    const motion = native
      ? {
          from: { ...restingPose(), opacity: 1 },
          to: restingPose(),
          shade: 0,
          pinnedHeader: 0,
        }
      : getScreenMotion(to, blend);
    Object.assign(previous, motion.from, { weight: 1 - blend });
    Object.assign(incoming, motion.to, { weight: blend });
    shade = motion.shade;
    pinnedHeader = motion.pinnedHeader;
    pinnedImage = to.image;
    if (blend === 1) {
      Object.assign(previous, { opacity: 0 });
      Object.assign(incoming, restingPose(), { opacity: 1, weight: 1 });
      shade = 0;
      pinnedHeader = 0;
    }
  }
  let dominantFrame = frames.findIndex((frame) => frame.weight === 1);
  if (dominantFrame < 0)
    dominantFrame = frames.reduce(
      (best, frame, index) =>
        frame.weight >= frames[best].weight ? index : best,
      0,
    );
  return {
    progress: position,
    transition: boundary,
    dominantFrame,
    dominantImage: frames[dominantFrame]?.image ?? "",
    frames,
    native,
    doseProgress:
      native?.id === "home--home-taken" ? native.postTouchProgress : null,
    unlockProgress: to?.motion === "unlock" ? blend : 0,
    power: to?.motion === "lock" ? lockPower(blend) : 0,
    touches: reducedMotion
      ? []
      : (native?.touches ??
        (to?.motion === "unlock" && from.image.endsWith("notification")
          ? [getTouchPose(notificationTouch, actionProgress)]
          : [])),
    motion: to?.motion ?? "hold",
    searchProgress: to?.motion === "search" ? blend : 0,
    backgroundImage: to?.motion === "dismiss-dialog" ? to.image : from.image,
    shade,
    pinnedHeader,
    pinnedImage,
    gestures: (scene.gestures ?? []).map((gesture) => {
      const state = getGestureState(gesture, position, reducedMotion);
      return { ...state, opacity: state.opacity * (1 - boundary) };
    }),
  };
}
