import assert from "node:assert/strict";
import test from "node:test";
import { getTouchPose } from "../src/touch.ts";

test("touch contact compresses before release and its ring fades without a playback clock", () => {
  const cue = { x: 195, y: 197, start: 0.1, release: 0.3, end: 0.6 };
  assert.equal(getTouchPose(cue, 0.1).opacity, 0);
  assert.equal(getTouchPose(cue, 0.6).opacity, 0);
  assert.ok(getTouchPose(cue, 0.25).scale < getTouchPose(cue, 0.15).scale);
  assert.ok(
    getTouchPose(cue, 0.45).ringScale > getTouchPose(cue, 0.3).ringScale,
  );
  assert.ok(getTouchPose(cue, 0.45).opacity < getTouchPose(cue, 0.3).opacity);
  const points = Array.from({ length: 101 }, (_, i) => i / 100);
  assert.deepEqual(
    points.map((p) => getTouchPose(cue, p)),
    points
      .toReversed()
      .map((p) => getTouchPose(cue, p))
      .toReversed(),
  );
  const frozen = getTouchPose(cue, 0.25);
  for (let i = 0; i < 10; i++)
    assert.deepEqual(getTouchPose(cue, 0.25), frozen);
});
