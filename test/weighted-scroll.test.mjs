import assert from "node:assert/strict";
import test from "node:test";
import { weightedWheelDelta, dampScroll } from "../src/useWeightedScroll.ts";

test("wheel input keeps its native distance and direction with consistent units", () => {
  assert.equal(weightedWheelDelta(100, 0, 800), 100);
  assert.equal(
    weightedWheelDelta(-100, 0, 800),
    -weightedWheelDelta(100, 0, 800),
  );
  assert.ok(weightedWheelDelta(1, 2, 800) > 800 / 2);
  assert.ok(weightedWheelDelta(1, 2, 800) < 800);
  assert.equal(weightedWheelDelta(1, 1, 800), weightedWheelDelta(16, 0, 800));
});
test("scroll damping converges without overshoot and an opposite target responds immediately", () => {
  let current = 0;
  for (let i = 0; i < 100; i++) {
    const next = dampScroll(current, 500, 16);
    assert.ok(next >= current && next <= 500);
    current = next;
  }
  assert.ok(Math.abs(500 - current) < 0.001);
  let quick = 0;
  for (let i = 0; i < 16; i++) quick = dampScroll(quick, 500, 16);
  assert.ok(
    quick > 475,
    "a flick settles over 95% of the distance within 256 ms",
  );
  assert.ok(
    dampScroll(0, 500, 16) < 125,
    "one frame does not jump a quarter of the way",
  );
  assert.ok(dampScroll(current, 0, 16) < current);
  assert.equal(dampScroll(current, current, 16), current);
});
test("scroll smoothing has the same pace at 60 and 120 updates per second", () => {
  let standard = 0,
    highRefresh = 0;
  for (let i = 0; i < 15; i++) standard = dampScroll(standard, 500, 16);
  for (let i = 0; i < 30; i++) highRefresh = dampScroll(highRefresh, 500, 8);
  assert.ok(Math.abs(standard - highRefresh) < 1e-10);
});
