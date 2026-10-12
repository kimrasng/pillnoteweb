import assert from "node:assert/strict";
import test from "node:test";
import { createRasterQueue } from "../src/rasterQueue.ts";

test("a cached image and its date commit synchronously before paint", () => {
  const commits = [];
  const queue = createRasterQueue(
    () => "decoded",
    (frame, image) => commits.push([frame, image]),
  );
  queue.select({ image: "next", date: "next-date" });
  assert.deepEqual(commits, [
    [{ image: "next", date: "next-date" }, "decoded"],
  ]);
});

test("late image decoding cannot flash an earlier clip after a reverse or hold", async () => {
  const pending = new Map();
  const commits = [];
  const queue = createRasterQueue(
    (frame) => new Promise((resolve) => pending.set(frame, resolve)),
    (frame) => commits.push(frame),
  );
  queue.select("forward");
  queue.select("reverse");
  pending.get("reverse")("image");
  await Promise.resolve();
  pending.get("forward")("image");
  await Promise.resolve();
  assert.deepEqual(commits, ["reverse"]);
  queue.select("next");
  queue.cancel();
  pending.get("next")("image");
  await Promise.resolve();
  assert.deepEqual(commits, ["reverse"]);
});
