import type { NativeFrame } from "./native.ts";

// Keep a small rolling decode window instead of retaining the whole movie.
const decoded = new Map<string, HTMLImageElement>();
const pending = new Map<string, Promise<HTMLImageElement>>();
const MAX_DECODED = 24;
const failed = new Set<string>();

export function loadRasterFrame(frame: NativeFrame) {
  const cached = decoded.get(frame.image);
  if (cached) {
    decoded.delete(frame.image);
    decoded.set(frame.image, cached);
    return cached;
  }
  const request = pending.get(frame.image);
  if (request) return request;
  const img = new Image();
  img.src = frame.image;
  const promise = img
    .decode()
    .then(() => {
      pending.delete(frame.image);
      decoded.set(frame.image, img);
      while (decoded.size > MAX_DECODED)
        decoded.delete(decoded.keys().next().value!);
      return img;
    })
    .catch((error) => {
      pending.delete(frame.image);
      failed.add(frame.image);
      throw error;
    });
  pending.set(frame.image, promise);
  return promise;
}

export function getDecodedFrame(image: string) {
  return decoded.get(image);
}

export function rasterFrameSettled(image: string) {
  return decoded.has(image) || failed.has(image);
}

export function warmRasterFrames(frames: NativeFrame[]) {
  for (const frame of frames)
    if (!failed.has(frame.image))
      void Promise.resolve(loadRasterFrame(frame)).catch(() => {});
}
