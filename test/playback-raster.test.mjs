import assert from "node:assert/strict";
import test from "node:test";
import { playbackRasterReady } from "../src/playbackRaster.ts";
import { loadRasterFrame, getDecodedFrame } from "../src/rasterFrames.ts";
import { getChapterStart, getChapterScreens } from "../src/scroll.ts";
import { scenes } from "../src/story.ts";

const decodes = new Map();
globalThis.Image = class {
  decode() {
    return new Promise((resolve, reject) => decodes.set(this.src, { resolve, reject }));
  }
};

test("cold native transition waits for decoding; cached frame is immediately ready", async () => {
  const scene = scenes[1];
  const next = scene.frames[1];
  const progress = next.at - next.duration / 2;
  const position = getChapterStart(1) + getChapterScreens(1) * progress;
  assert.equal(playbackRasterReady(position), false);
  const requests = [...decodes.keys()];
  assert.ok(requests.some((image) => image.includes('/native/')));
  assert.ok(requests.length <= 24);
  for (const image of requests) decodes.get(image).resolve();
  await Promise.resolve();
  assert.equal(playbackRasterReady(position), true);
});

test("failed assets do not permanently trap the input controller or retry every frame", async () => {
  const position = getChapterStart(6) + getChapterScreens(6);
  assert.equal(playbackRasterReady(position), false);
  decodes.get('/images/app/pharmacy-detail.png').reject(new Error('offline'));
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(playbackRasterReady(position), true);
});

test("rolling decode cache stays bounded and deduplicates pending requests", async () => {
  for (let index = 0; index < 40; index++) {
    const frame = { image: `cache-${index}`, date: 'home' };
    const request = loadRasterFrame(frame);
    assert.equal(loadRasterFrame(frame), request);
    decodes.get(frame.image).resolve();
    await request;
  }
  assert.equal(getDecodedFrame('cache-0'), undefined);
  assert.ok(getDecodedFrame('cache-39'));
});
