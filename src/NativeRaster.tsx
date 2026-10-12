import { useEffect, useRef, useState } from "react";
import type { NativeFrame, NativeSample } from "./native";
import CaptureDates from "./CaptureDates";

// Decode nearby frames only; bound memory while scrolling in either direction.
const decoded = new Map<string, HTMLImageElement>();
const pending = new Map<string, Promise<HTMLImageElement>>();
const MAX_DECODED = 16;
function loadFrame(frame: NativeFrame) {
  const cached = decoded.get(frame.image);
  if (cached) {
    decoded.delete(frame.image);
    decoded.set(frame.image, cached);
    return Promise.resolve(cached);
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
      throw error;
    });
  pending.set(frame.image, promise);
  return promise;
}

export default function NativeRaster({
  sample,
  now,
}: {
  sample: NativeSample;
  now: Date;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [displayed, setDisplayed] = useState<NativeFrame | null>(null);
  useEffect(() => {
    let active = true;
    const draw = (img: HTMLImageElement) => {
      if (!active) return;
      canvas.current
        ?.getContext("2d", { alpha: false })
        ?.drawImage(img, 0, 0, 780, 1688);
      setDisplayed(sample.frame);
    };
    const cached = decoded.get(sample.frame.image);
    if (cached) draw(cached);
    else
      void loadFrame(sample.frame)
        .then(draw)
        .catch(() => {});
    for (const neighbor of sample.neighbors)
      void loadFrame(neighbor).catch(() => {});
    return () => {
      active = false;
    };
  }, [sample.frame.image, sample.frame.date]);
  return (
    <div
      className="native-raster"
      data-native-clip={sample.id}
      data-native-index={sample.index}
      data-native-count={sample.count}
      data-native-displayed={displayed?.image}
      style={{ opacity: displayed ? 1 : 0 }}
      aria-hidden="true"
    >
      <canvas ref={canvas} width={780} height={1688} />
      {displayed && <CaptureDates image={displayed.date} now={now} />}
    </div>
  );
}
