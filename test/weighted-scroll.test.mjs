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

test("decode stalls freeze forward and reverse playback without a catch-up jump", async () => {
  const { createPlaybackClock } = await import("../src/playback.ts");
  for (const [from, to] of [[0, 1], [1, 0]]) {
    const clock = createPlaybackClock(from, to, 1000, 0);
    const first = clock.advance(16, () => true);
    assert.equal(first.position, from + (to - from) * 0.016);
    for (let time = 32; time < 2000; time += 16)
      assert.equal(clock.advance(time, () => false), null);
    const resumed = clock.advance(2000, () => true);
    assert.ok(Math.abs(resumed.position - first.position) <= 0.032);
    assert.equal(resumed.complete, false);
    let result;
    for (let time = 2016; time < 3100; time += 16)
      result = clock.advance(time, () => true);
    assert.deepEqual(result, { position: to, complete: true });
  }
});

test("long main-thread stalls cannot skip straight to a transition endpoint", async () => {
  const { createPlaybackClock } = await import("../src/playback.ts");
  const clock = createPlaybackClock(0, 1, 800, 0);
  assert.deepEqual(clock.advance(2000, () => true), {
    position: 0.04, complete: false,
  });
});


test("email focus holds an empty field for 400ms before the first character, in both directions", async () => {
  const { createPlaybackClock, EMAIL_FOCUS_PAUSE_MS } = await import("../src/playback.ts");
  const step = playbackSteps.find((step) => step.holds?.length);
  assert.equal(step.holds.length, 1);
  assert.equal(step.holds[0].duration, EMAIL_FOCUS_PAUSE_MS);
  const heldState = getScrollState(step.holds[0].position, 1, scenes.length);
  const film = getFilmState(scenes[heldState.activeIndex], heldState.progress);
  assert.equal(film.native.index, 20);
  assert.ok(film.touches.every((touch) => touch.opacity === 0));
  for (const [from, to] of [[step.start, step.end], [step.end, step.start]]) {
    const clock = createPlaybackClock(from, to, step.duration, 0, step.holds);
    const samples = [];
    for (let time = 0; time <= step.duration; time += 10)
      samples.push(clock.advance(time, () => true));
    const held = samples.filter((sample) => Math.abs(sample.position - step.holds[0].position) < 1e-10);
    assert.equal(held.length * 10, EMAIL_FOCUS_PAUSE_MS);
    assert.deepEqual(samples.at(-1), { position: to, complete: true });
  }
});

test("subpage pushes are slightly faster than pops while locking has a short direct transition", () => {
  const add = scenes[1];
  const chapterStart = playbackSteps.find((step) => {
    const state = getScrollState(step.end, 1, scenes.length);
    return state.activeIndex === 1 && Math.abs(state.progress - add.frames[1].at) < 1e-10;
  });
  assert.equal(chapterStart.duration, 820);
  for (const step of playbackSteps) {
    const state = getScrollState((step.start + step.end) / 2, 1, scenes.length);
    const film = getFilmState(scenes[state.activeIndex], state.progress, false, scenes[state.activeIndex + 1], state.transition);
    if (film.motion === 'lock') assert.equal(step.duration, 450);
  }
});
