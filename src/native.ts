import { nativeClips } from "./nativeClips.ts";
import { getTouchPose, type TouchCue, type TouchPose } from "./touch.ts";
import { TOUCH_PRESS_SHARE } from "./pacing.ts";

export type NativeFrame = { image: string; date: string };
export type NativeClip = {
  from: string;
  to: string;
  frames: NativeFrame[];
  stops?: number[];
  touches?: TouchCue[];
};
export type NativeSample = {
  id: string;
  index: number;
  count: number;
  frame: NativeFrame;
  neighbors: NativeFrame[];
  touches: TouchPose[];
};

export function hasNativeClip(from: string, to: string) {
  return `${from}--${to}` in nativeClips;
}

export function nativeTouchCount(from: string, to: string) {
  const clip = (nativeClips as Record<string, NativeClip>)[`${from}--${to}`];
  return clip?.touches?.length ?? 0;
}

function interpolate(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function sequenceTouch(clip: NativeClip, position: number, extension: number) {
  const recorded = clip.touches ?? [];
  const duration = 1 + recorded.length * extension;
  const touches = recorded.map((touch, index) => {
    const originalEnd =
      recorded.length === 1 && touch.start === 0 ? touch.release : touch.end;
    const start = (touch.start + index * extension) / duration;
    const end = (originalEnd + (index + 1) * extension) / duration;
    return {
      ...touch,
      start,
      release: start + (end - start) * TOUCH_PRESS_SHARE,
      end,
    };
  });
  const stops =
    clip.stops ??
    clip.frames.map((_, index) => index / (clip.frames.length - 1));
  let previousScroll = 0;
  let previousCapture = 0;
  for (const [index, touch] of touches.entries()) {
    const original = recorded[index];
    if (position < touch.start) {
      return {
        progress: interpolate(
          previousCapture,
          original.start,
          (position - previousScroll) / (touch.start - previousScroll),
        ),
        touches,
      };
    }
    const releaseIndex = stops.findIndex(
      (stop) => stop >= original.release - 1e-10,
    );
    const pressed = stops[Math.max(0, releaseIndex - 1)];
    if (position < touch.release) {
      return {
        progress: interpolate(
          original.start,
          pressed,
          (position - touch.start) / (touch.release - touch.start),
        ),
        touches,
      };
    }
    // Keep the last pointer-down capture until the contact and ring disappear.
    // The first pointer-up capture can already contain a route or focus change.
    if (position < touch.end) return { progress: pressed, touches };
    previousScroll = touch.end;
    previousCapture = original.release;
  }
  return {
    progress: interpolate(
      previousCapture,
      1,
      (position - previousScroll) / (1 - previousScroll),
    ),
    touches,
  };
}

// Flutter already applied easing, ripples and route effects to these pixels.
// Keep its clock linear after the preceding touch indication has finished.
export function sampleNativeClip(
  from: string,
  to: string,
  progress: number,
  touchExtension = 0,
): NativeSample | null {
  const id = `${from}--${to}`;
  const clip = (nativeClips as Record<string, NativeClip>)[id];
  if (!clip) return null;
  const position = Number.isNaN(progress)
    ? 0
    : Math.max(0, Math.min(1, progress));
  const sequence = sequenceTouch(clip, position, touchExtension);
  let index = Math.min(
    clip.frames.length - 1,
    Math.floor(sequence.progress * (clip.frames.length - 1) + 1e-10),
  );
  if (clip.stops) {
    index = 0;
    for (let i = 1; i < clip.stops.length; i++)
      if (sequence.progress >= clip.stops[i] - 1e-10) index = i;
  }
  return {
    id,
    index,
    count: clip.frames.length,
    frame: clip.frames[index],
    neighbors: clip.frames.slice(Math.max(0, index - 3), index + 4),
    touches: sequence.touches.map((touch) => getTouchPose(touch, position)),
  };
}
