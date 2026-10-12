import assert from "node:assert/strict";
import test from "node:test";
import {
  chapterNavigationMode,
  navigationDuration,
  navigationEase,
} from "../src/navigation.ts";
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
