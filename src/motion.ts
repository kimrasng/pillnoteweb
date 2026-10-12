import type { CaptureFrame } from "./story.ts";

export type FramePose = {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  clip: [number, number, number, number];
  contentClip: [number, number, number, number];
  zIndex: number;
  radius: number;
};
const full: FramePose["clip"] = [0, 0, 0, 0];
export const restingPose = (): FramePose => ({
  x: 0,
  y: 0,
  scale: 1,
  opacity: 0,
  clip: [...full],
  contentClip: [...full],
  zIndex: 0,
  radius: 0,
});

// Coordinates use the genuine Flutter capture's 390 × 844 logical viewport.
export function getScreenMotion(frame: CaptureFrame, amount: number) {
  const t = Math.max(0, Math.min(1, amount));
  const from = { ...restingPose(), opacity: 1, zIndex: 1 };
  const to = { ...restingPose(), opacity: t, zIndex: 3 };
  let shade = 0;
  let pinnedHeader = 0;
  switch (frame.motion) {
    case "push":
      from.x = -30 * t;
      to.x = 100 * (1 - t);
      to.opacity = 1;
      break;
    case "pop":
      from.x = 100 * t;
      from.zIndex = 2;
      to.x = -30 * (1 - t);
      to.opacity = 1;
      to.zIndex = 1;
      break;
    case "tab":
      to.x = 18 * (1 - t);
      break;
    case "search": {
      const results = Math.max(0, Math.min(1, (t - 0.8) / 0.2));
      to.opacity = results * results * (3 - 2 * results);
      to.clip = [233, 0, 34, 0];
      to.y = 8 * (1 - results);
      break;
    }
    case "scroll": {
      const travel = frame.travel ?? 315;
      from.y = -travel * t;
      from.clip = [54, 0, 34, 0];
      to.y = travel * (1 - t);
      to.opacity = 1;
      to.clip = [110, 0, 34, 0];
      to.contentClip = [110, 0, 34, 0];
      pinnedHeader = t;
      break;
    }
    case "sheet":
      to.opacity = 1;
      to.contentClip = frame.region ?? [527, 0, 0, 0];
      to.y = (844 - to.contentClip[0]) * (1 - t);
      shade = 0.54 * t;
      break;
    case "dialog":
      to.contentClip = frame.region ?? [190, 26, 210, 26];
      to.radius = 28;
      to.y = 24 * (1 - t);
      to.scale = 0.94 + 0.06 * t;
      shade = 0.54 * t;
      break;
    case "dismiss-dialog":
      from.contentClip = frame.region ?? [190, 26, 210, 26];
      from.radius = 28;
      from.opacity = 1 - t;
      from.y = 18 * t;
      from.scale = 1 - 0.04 * t;
      from.zIndex = 3;
      to.opacity = 1;
      to.zIndex = 0;
      shade = 0.54 * (1 - t);
      break;
    case "notification":
      // Keep the clock/wallpaper in place; only the arriving card moves.
      to.contentClip = [535, 0, 165, 0];
      to.y = 32 * (1 - t);
      to.scale = 0.96 + 0.04 * t;
      break;
    case "unlock":
      // A notification opens a rounded app window from the card's position.
      // Its crop grows to the display edges while the lock chrome recedes.
      from.scale = 1 - 0.035 * t;
      from.y = -12 * t;
      to.opacity = Math.min(1, t * 4);
      to.y = 178 * (1 - t);
      to.contentClip = [
        366 * (1 - t),
        14 * (1 - t),
        366 * (1 - t),
        14 * (1 - t),
      ];
      to.radius = 24 * (1 - t);
      to.scale = 0.94 + 0.06 * t;
      break;
    case "lock":
      // The display briefly sleeps before the lock screen wakes.
      to.opacity = Number(t >= 0.4);
      break;
  }
  return { from, to, shade, pinnedHeader };
}
