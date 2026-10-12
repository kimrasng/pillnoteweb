import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { nativeClips } from "../src/nativeClips.ts";
import { sampleNativeClip } from "../src/native.ts";
import { scenes } from "../src/story.ts";

test("every app transition has genuine intermediate Flutter frames and current-date metadata", () => {
  const dates = JSON.parse(
    readFileSync(new URL("../src/capture-dates.json", import.meta.url)),
  );
  for (const clip of Object.values(nativeClips)) {
    assert.ok(clip.frames.length >= 10);
    // Some app actions commit immediately; preserve that actual behavior.
    assert.ok(
      new Set(clip.frames.map((f) => f.image)).size >= 3,
      `${clip.from}--${clip.to}`,
    );
    for (const frame of clip.frames) {
      assert.ok(
        existsSync(new URL(`../public${frame.image}`, import.meta.url)),
        frame.image,
      );
      assert.ok(Array.isArray(dates[frame.date]), frame.date);
    }
    assert.equal(sampleNativeClip(clip.from, clip.to, 0).frame.date, clip.from);
    assert.equal(sampleNativeClip(clip.from, clip.to, 1).frame.date, clip.to);
  }
  for (const [index, scene] of scenes.entries()) {
    const pairs = scene.frames
      .slice(1)
      .map((to, i) => [scene.frames[i].image, to.image]);
    if (index > 0)
      pairs.push([
        scenes[index - 1].frames.at(-1).image,
        scene.frames[0].image,
      ]);
    for (const [from, to] of pairs) {
      if (from === to || /lock|notification/.test(from + to)) continue;
      assert.ok(sampleNativeClip(from, to, 0.5), `${from}--${to}`);
    }
  }
});

test("native motion holds, reverses and preserves the Flutter clock after the touch release", () => {
  const id = ["box-start", "search-empty"];
  const clip = nativeClips[id.join("--")];
  const state = sampleNativeClip(...id, 0.5);
  assert.equal(
    state.index,
    clip.stops.findLastIndex((stop) => stop <= 0.5),
  );
  assert.equal(clip.touches[0].release, 0.3);
  const releaseIndex = clip.stops.findIndex((stop) => stop === 0.3);
  const intervals = clip.stops
    .slice(releaseIndex + 1)
    .map((stop, i) => stop - clip.stops[releaseIndex + i]);
  assert.ok(
    intervals.every((interval) => Math.abs(interval - intervals[0]) < 1e-12),
  );
  const points = Array.from({ length: 101 }, (_, i) => i / 100);
  assert.deepEqual(
    points.map((p) => sampleNativeClip(...id, p)),
    points
      .toReversed()
      .map((p) => sampleNativeClip(...id, p))
      .toReversed(),
  );
  for (let i = 0; i < 20; i++)
    assert.deepEqual(sampleNativeClip(...id, 0.5), state);
  assert.deepEqual(sampleNativeClip(...id, NaN), sampleNativeClip(...id, 0));
});

test("every button and field action includes a touch at the captured Flutter coordinates", () => {
  const actions = [
    "home-start--box-start",
    "box-start--search-empty",
    "search-empty--search-focused",
    "search-typed--schedule",
    "schedule--time-picker",
    "time-picker--schedule",
    "schedule--registered",
    "registered--home",
    "home--home-taken",
    "home-taken--box-taken",
    "box-taken--stock-taken",
    "home-taken--guardian-settings",
    "guardian-settings--guardian-base",
    "guardian-base--guardian-invite-empty",
    "guardian-invite-empty--guardian-invite",
    "guardian-invite--guardian-pending",
    "guardian-received--guardian-accepted",
    "pharmacy-list--pharmacy-detail",
  ];
  for (const id of actions) {
    const clip = nativeClips[id];
    assert.ok(clip.touches?.length, id);
    for (const touch of clip.touches) {
      assert.ok(
        touch.x > 0 && touch.x < 390 && touch.y > 54 && touch.y < 810,
        id,
      );
      assert.ok(
        0 <= touch.start &&
          touch.start < touch.release &&
          touch.release < touch.end &&
          touch.end <= 1,
        id,
      );
      const displayedTouch = sampleNativeClip(
        clip.from,
        clip.to,
        touch.start,
      ).touches.find((pose) => pose.x === touch.x && pose.y === touch.y);
      const down = sampleNativeClip(
        clip.from,
        clip.to,
        (displayedTouch.start + displayedTouch.release) / 2,
      );
      assert.ok(
        down.touches.some((pose) => pose.opacity > 0 && pose.phase === "down"),
        id,
      );
    }
  }
});

test("every native click finishes its contact and ring before pointer-up playback, including longer touch windows", () => {
  for (const extension of [0, 0.22 / 0.55, 0.22 / 0.32, 0.22 / 1.4]) {
    for (const clip of Object.values(nativeClips)) {
      const stops =
        clip.stops ??
        clip.frames.map((_, index) => index / (clip.frames.length - 1));
      for (const [index, recorded] of (clip.touches ?? []).entries()) {
        const cue = sampleNativeClip(clip.from, clip.to, 0, extension).touches[
          index
        ];
        const releaseIndex = stops.findIndex(
          (stop) => stop >= recorded.release - 1e-10,
        );
        for (const portion of [0.1, 0.4, 0.7, 0.99]) {
          const sample = sampleNativeClip(
            clip.from,
            clip.to,
            cue.start + (cue.end - cue.start) * portion,
            extension,
          );
          assert.ok(
            sample.touches[index].opacity > 0,
            `${clip.from}: visible click`,
          );
          assert.ok(
            sample.index < releaseIndex,
            `${clip.from}: next motion waits for the ring`,
          );
        }
        const completed = sampleNativeClip(
          clip.from,
          clip.to,
          cue.end,
          extension,
        );
        assert.equal(completed.touches[index].opacity, 0);
        assert.equal(completed.touches[index].ringOpacity, 0);
        assert.equal(completed.index, releaseIndex);
      }
    }
  }
});

test("guardian typing records a completed empty focus state before each first character", () => {
  const clip = nativeClips["guardian-invite-empty--guardian-invite"];
  assert.equal(clip.focusStages.length, 2);
  for (const stage of clip.focusStages) {
    const touch = clip.touches[stage.field];
    assert.ok(stage.readyIndex < stage.firstCharacterIndex);
    assert.ok(stage.firstCharacterIndex < clip.frames.length - 1);
    assert.ok(touch.end < stage.firstCharacterIndex / (clip.frames.length - 1));
    assert.ok(
      new Set(
        clip.frames
          .slice(stage.readyIndex, stage.firstCharacterIndex + 1)
          .map((frame) => frame.image),
      ).size > 1,
    );
  }
});

test("extending a touch preserves the scroll distance between subsequent Flutter frames and typed characters", () => {
  const extension = 0.22 / 0.55;
  for (const clip of Object.values(nativeClips)) {
    const cues = sampleNativeClip(clip.from, clip.to, 0).touches;
    if (!cues.length) continue;
    for (const position of [0.2, 0.4, 0.6, 0.9]) {
      if (cues.some((cue) => position >= cue.start && position < cue.end))
        continue;
      const completed = cues.filter((cue) => position >= cue.end).length;
      const extendedPosition =
        (position + completed * extension) / (1 + cues.length * extension);
      assert.equal(
        sampleNativeClip(clip.from, clip.to, extendedPosition, extension).index,
        sampleNativeClip(clip.from, clip.to, position).index,
        `${clip.from}--${clip.to}: ${position}`,
      );
    }
  }
});
