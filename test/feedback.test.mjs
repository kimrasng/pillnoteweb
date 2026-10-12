import assert from "node:assert/strict";
import test from "node:test";
import { doseFeedback, lockPower } from "../src/feedback.ts";
import { getFilmState } from "../src/film.ts";
import { scenes } from "../src/story.ts";

test("the intake check completes before the list moves, without losing the final record", () => {
  const first = doseFeedback(0);
  const checked = doseFeedback(0.32);
  const last = doseFeedback(1);
  assert.equal(first.check, 0);
  assert.equal(checked.check, 1);
  assert.equal(checked.move, 0);
  assert.ok(doseFeedback(0.16).scale > 1);
  assert.equal(last.move, 1);
  assert.equal(last.progressFill, 1);
  assert.equal(last.haloOpacity, 0);
  assert.equal(first.cardHeight - last.cardHeight, 28);
  for (let i = 0; i <= 100; i++) {
    const pose = doseFeedback(i / 100);
    assert.ok(pose.cardHeight >= 144 && pose.cardHeight <= 172);
    assert.ok(Math.abs(pose.listY - (334 + pose.cardHeight)) < 1e-10);
    assert.ok(Math.abs(pose.countY - pose.barY - 14) < 1e-10);
  }
  const record = scenes.find((scene) => scene.id === "record");
  const target = record.frames.find((frame) => frame.image === "home-taken");
  const pressed = getFilmState(record, target.at - target.duration * 0.8);
  assert.ok(pressed.touches[0].opacity > 0);
  assert.equal(pressed.doseProgress, 0);
  assert.equal(getFilmState(record, 1).dominantImage, "home-taken");
  assert.deepEqual(
    record.frames.map((frame) => frame.image),
    ["home", "home-taken"],
  );
  assert.equal(
    getFilmState(record, target.at - 0.001, true).doseProgress,
    null,
  );
});

test("feedback freezes, reverses and stays bounded even for invalid input", () => {
  const points = Array.from({ length: 201 }, (_, i) => i / 200);
  for (const feedback of [doseFeedback, lockPower]) {
    assert.deepEqual(
      points.map(feedback),
      points.toReversed().map(feedback).toReversed(),
    );
    assert.deepEqual(feedback(NaN), feedback(0));
    assert.deepEqual(feedback(2), feedback(1));
  }
  assert.equal(lockPower(0), 0);
  assert.equal(lockPower(0.4), 1);
  assert.equal(lockPower(1), 0);
});
