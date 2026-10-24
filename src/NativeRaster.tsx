import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { NativeFrame, NativeSample } from "./native";
import CaptureDates from "./CaptureDates";
import { createRasterQueue } from "./rasterQueue";

import {
  getDecodedFrame,
  loadRasterFrame,
  warmRasterFrames,
} from "./rasterFrames";
export { warmRasterFrames } from "./rasterFrames";

type RasterFrame = NativeFrame & { clipId: string };
type ReadyFrame = { frame: RasterFrame; image: HTMLImageElement };

export default function NativeRaster({
  sample,
  now,
}: {
  sample: NativeSample | null;
  now: Date;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState<ReadyFrame | null>(null);
  const queue = useMemo(
    () =>
      createRasterQueue<RasterFrame, HTMLImageElement>(
        loadRasterFrame,
        (frame, image) => setReady({ frame, image }),
      ),
    [],
  );
  useLayoutEffect(() => {
    if (!sample) {
      queue.cancel();
      return;
    }
    // A new clip starts from its own endpoint, never a stale canvas from a
    // different clip. This fallback is also decoded before any paint.
    if (
      ready?.frame.clipId !== sample.id &&
      !getDecodedFrame(sample.frame.image)
    ) {
      const from = sample.neighbors[0];
      const image = getDecodedFrame(from.image);
      if (image) setReady({ frame: { ...from, clipId: sample.id }, image });
    }
    queue.select({ ...sample.frame, clipId: sample.id });
    warmRasterFrames(sample.neighbors);
    return () => queue.cancel();
  }, [queue, sample?.id, sample?.frame.image, sample?.frame.date]);
  useLayoutEffect(() => {
    if (ready)
      canvas.current
        ?.getContext("2d", { alpha: false })
        ?.drawImage(ready.image, 0, 0, 780, 1688);
  }, [ready]);
  const displayed =
    sample && ready?.frame.clipId === sample.id ? ready.frame : null;
  return (
    <div
      className="native-raster"
      data-native-clip={sample?.id}
      data-native-index={sample?.index}
      data-native-count={sample?.count}
      data-native-displayed={displayed?.image}
      data-native-displayed-clip={displayed?.clipId}
      data-native-date={displayed?.date}
      style={{ opacity: displayed ? 1 : 0 }}
      aria-hidden="true"
    >
      <canvas ref={canvas} width={780} height={1688} />
      {displayed && <CaptureDates image={displayed.date} now={now} />}
    </div>
  );
}
