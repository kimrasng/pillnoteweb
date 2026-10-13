import { getFilmState } from "./film.ts";
import { getScrollState } from "./scroll.ts";
import { scenes } from "./story.ts";
import { notificationScreens } from "./notificationScreens.ts";
import { rasterFrameSettled, warmRasterFrames } from "./rasterFrames.ts";

// Buffer both directions. The clock waits for the exact frame instead of
// skipping a route transition when network/decode falls behind.
export function playbackRasterReady(position: number) {
  const state = getScrollState(position, 1, scenes.length);
  const film = getFilmState(
    scenes[state.activeIndex],
    state.progress,
    false,
    scenes[state.activeIndex + 1],
    state.transition,
  );
  const frames = film.native
    ? [film.native.frame]
    : film.frames
        .filter(
          (frame) => frame.opacity > 0 && !notificationScreens.has(frame.image),
        )
        .map((frame) => ({
          image: `/images/app/${frame.image}.png`,
          date: frame.image,
        }));
  const ready = frames.every((frame) => rasterFrameSettled(frame.image));
  // Touch cached requested frames last so lookahead cannot evict them.
  warmRasterFrames([...(film.native?.neighbors ?? []), ...frames]);
  return ready;
}
