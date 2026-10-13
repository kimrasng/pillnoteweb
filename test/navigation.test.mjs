import assert from "node:assert/strict";
import test from "node:test";
import {
  chapterDestination,
  chapterNavigationMode,
  navigationDuration,
  navigationEase,
} from "../src/navigation.ts";
import { getScrollState } from "../src/scroll.ts";
import { scenes } from "../src/story.ts";

test("chapter clicks jump directly unless the completed scene continues to its next chapter", () => {
  for (const [index, scene] of scenes.entries()) {
    const completedAt = scene.frames.at(-1).at;
    assert.equal(
      chapterNavigationMode(index, 0.05, completedAt, index + 1),
      "direct",
    );
    assert.equal(
      chapterNavigationMode(index, completedAt - 0.001, completedAt, index + 1),
      "direct",
    );
    assert.equal(
      chapterNavigationMode(index, completedAt, completedAt, index + 1),
      "scroll",
    );
    assert.equal(
      chapterNavigationMode(index, 1, completedAt, index + 2),
      "direct",
    );
    assert.equal(
      chapterNavigationMode(index, 1, completedAt, index - 1),
      "direct",
    );
    assert.equal(chapterNavigationMode(index, 1, completedAt, index), "direct");
  }
});

test("chapter navigation accelerates from rest and decelerates symmetrically to its destination", () => {
  const positions = Array.from({ length: 101 }, (_, i) =>
    navigationEase(i / 100),
  );
  const speeds = positions.slice(1).map((p, i) => p - positions[i]);
  assert.equal(positions[0], 0);
  assert.equal(positions.at(-1), 1);
  assert.ok(speeds.every((s) => s > 0));
  for (let i = 1; i < 50; i++) assert.ok(speeds[i] > speeds[i - 1]);
  for (let i = 51; i < speeds.length; i++) assert.ok(speeds[i] < speeds[i - 1]);
  assert.ok(speeds[0] < speeds[49] / 100);
  for (let i = 0; i <= 100; i++)
    assert.ok(Math.abs(positions[i] + positions[100 - i] - 1) < 1e-12);
  assert.equal(navigationDuration(12000, 800), navigationDuration(-12000, 800));
  assert.ok(navigationDuration(24000, 800) > navigationDuration(400, 800));
  assert.ok(navigationDuration(1000000, 800) <= 2800);
});

test("chapter destinations stay inside the requested chapter after browser pixel rounding", () => {
  for (const height of [667, 750, 768, 844, 900, 1023.5]) {
    for (const origin of [0, 0.25, 64.75]) {
      for (const [index, scene] of scenes.entries()) {
        const destination = chapterDestination(origin, index, height);
        for (const round of [Math.floor, Math.round]) {
          const state = getScrollState(round(destination) - origin, height, scenes.length);
          assert.equal(state.activeIndex, index);
          assert.equal(state.transition, 0);
          assert.ok(state.progress < scene.frames[1].at - scene.frames[1].duration);
        }
      }
    }
  }
});
