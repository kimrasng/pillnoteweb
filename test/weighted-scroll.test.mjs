import assert from "node:assert/strict";
import test from "node:test";
import { weightedWheelDelta } from "../src/useWeightedScroll.ts";
import {
  accumulateGesture,
  scrollThreshold,
  playbackSteps,
  nextPlaybackStep,
  playbackPosition,
} from "../src/playback.ts";
import { getScrollState } from "../src/scroll.ts";
import { getFilmState } from "../src/film.ts";
import { scenes } from "../src/story.ts";

test("wheel units keep consistent input thresholds", () => {
  assert.equal(weightedWheelDelta(100, 0, 800), 100);
  assert.equal(weightedWheelDelta(-100, 0, 800), -100);
  assert.equal(weightedWheelDelta(1, 1, 800), weightedWheelDelta(16, 0, 800));
});
test("small gestures accumulate without advancing; reversing resets the direction", () => {
  const threshold = scrollThreshold(750);
  let accumulated = 0;
  for (let i = 0; i < 4; i++) {
    const next = accumulateGesture(accumulated, 60, threshold);
    assert.equal(next.direction, 0);
    accumulated = next.accumulated;
  }
  assert.deepEqual(accumulateGesture(accumulated, 60, threshold), {
    accumulated: 0,
    direction: 1,
  });
  assert.deepEqual(accumulateGesture(180, -60, threshold), {
    accumulated: -60,
    direction: 0,
  });
});
test("every triggered action reaches a complete render on elapsed time alone", () => {
  for (const step of playbackSteps) {
    let position = step.start;
    for (let elapsed = 0; elapsed <= step.duration + 20; elapsed += 16)
      position = playbackPosition(step.start, step.end, elapsed, step.duration);
    assert.equal(position, step.end);
    const state = getScrollState(position * 750 + 1, 750, scenes.length);
    const film = getFilmState(
      scenes[state.activeIndex],
      state.progress,
      false,
      scenes[state.activeIndex + 1],
      state.transition,
    );
    assert.equal(film.native, null, `action ending at ${step.end} must settle`);
    assert.equal(film.touches.filter((t) => t.opacity > 0).length, 0);
  }
});
test("one input selects only one action and the opposite input completes the reverse", () => {
  let position = 0;
  for (const step of playbackSteps) {
    assert.equal(nextPlaybackStep(position, 1), step);
    assert.equal(nextPlaybackStep(step.end, -1), step);
    assert.equal(
      playbackPosition(step.end, step.start, step.duration, step.duration),
      step.start,
    );
    position = step.end;
  }
  assert.equal(nextPlaybackStep(position, 1), undefined);
  assert.equal(nextPlaybackStep(0, -1), undefined);
});
test("timed playback has the same endpoint at different refresh rates", () => {
  const step = playbackSteps[1];
  for (const interval of [1000 / 60, 1000 / 120]) {
    for (let elapsed = 0; elapsed < step.duration; elapsed += interval) {
      const position = playbackPosition(
        step.start,
        step.end,
        elapsed,
        step.duration,
      );
      assert.ok(position >= step.start && position <= step.end);
    }
    assert.equal(
      playbackPosition(step.start, step.end, step.duration, step.duration),
      step.end,
    );
  }
});
