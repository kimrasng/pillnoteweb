import assert from "node:assert/strict";
import test from "node:test";
import { clampProgress, getFilmState } from "../src/film.ts";
import {
  CHAPTER_EXIT_SCREENS,
  chapterLengths,
  motionDistances,
  TAP_SCREENS,
  TOUCH_EXTRA_SCREENS,
  BASE_CHAPTER_EXIT_SCREENS,
} from "../src/pacing.ts";
import { scenes } from "../src/story.ts";
import { getScrollState, getChapterStart } from "../src/scroll.ts";
import { sampleNativeClip, nativeTouchCount } from "../src/native.ts";
import { notificationTouch } from "../src/touch.ts";
const add = scenes.find((scene) => scene.id === "add");

test("holding a scroll position freezes every capture, panel pose and touch", () => {
  const state = getFilmState(add, 1.05 / chapterLengths[1]);
  for (let repeat = 0; repeat < 100; repeat++)
    assert.deepEqual(getFilmState(add, 1.05 / chapterLengths[1]), state);
  assert.ok(state.gestures[1].opacity > 0);
});
test("reverse scrolling restores every action and native screen transition", () => {
  for (const [index, scene] of scenes.entries()) {
    const points = Array.from({ length: 1001 }, (_, i) => i / 1000);
    const sample = (point) =>
      getFilmState(
        scene,
        point,
        false,
        scenes[index + 1],
        Math.max(
          0,
          (point - (1 - CHAPTER_EXIT_SCREENS / chapterLengths[index])) /
            (CHAPTER_EXIT_SCREENS / chapterLengths[index]),
        ),
      );
    assert.deepEqual(
      points.map(sample),
      points.toReversed().map(sample).toReversed(),
      scene.id,
    );
  }
});
test("registration traverses the actual app states, including opening and closing its time picker", () => {
  const expected = [
    "box-start",
    "search-empty",
    "search-focused",
    "search-typed",
    "schedule",
    "time-picker",
    "schedule-ready",
    "registered",
    "box-registered",
    "home",
  ];
  assert.deepEqual(
    add.frames.map((frame) => frame.image),
    expected,
  );
  for (const [index, image] of expected.entries()) {
    const point = add.frames[index].at;
    const state = getFilmState(add, point);
    assert.equal(state.dominantImage, image);
    assert.equal(state.frames[state.dominantFrame].opacity, 1);
    assert.equal(state.frames[state.dominantFrame].x, 0);
    assert.equal(state.frames[state.dominantFrame].y, 0);
  }
});
test("all transitions keep an opaque underlying screen and bounded contributions", () => {
  for (const [index, scene] of scenes.entries()) {
    for (let i = 0; i <= 1000; i++) {
      const state = getFilmState(
        scene,
        i / 1000,
        false,
        scenes[index + 1],
        Math.max(
          0,
          (i / 1000 - (1 - CHAPTER_EXIT_SCREENS / chapterLengths[index])) /
            (CHAPTER_EXIT_SCREENS / chapterLengths[index]),
        ),
      );
      assert.ok(
        Math.abs(state.frames.reduce((sum, f) => sum + f.weight, 0) - 1) <
          1e-12,
      );
      assert.ok(state.frames.some((f) => f.opacity === 1));
      assert.ok(state.frames.every((f) => f.opacity >= 0 && f.opacity <= 1));
    }
  }
});
test("Flutter transitions select an engine-rendered frame without web transforms or dissolves", () => {
  const state = getFilmState(add, (0.9 - 0.55 / 2) / chapterLengths[1]);
  assert.equal(state.native.id, "box-start--search-empty");
  assert.ok(
    state.native.index > 0 && state.native.index < state.native.count - 1,
  );
  assert.equal(state.shade, 0);
  assert.ok(
    state.frames.every(
      (frame) => frame.x === 0 && frame.y === 0 && frame.scale === 1,
    ),
  );
  assert.equal(
    state.native.frame.image.startsWith("/images/app/native/"),
    true,
  );
});
test("the pharmacy list and sheet use complete Flutter renders including the pinned header", () => {
  const scene = scenes.find((s) => s.id === "pharmacy");
  const scrolling = getFilmState(scene, (1.1 - 0.7 / 2) / chapterLengths[6]);
  assert.equal(scrolling.native.id, "pharmacy-station--pharmacy-list");
  assert.equal(scrolling.pinnedHeader, 0);
  const sheet = getFilmState(scene, (2.35 - 0.42 / 2) / chapterLengths[6]);
  assert.equal(sheet.native.id, "pharmacy-list--pharmacy-detail");
  assert.equal(sheet.shade, 0);
});
test("touch indications stay within their scroll ranges and reduced motion is discrete", () => {
  for (const scene of scenes) {
    for (const [index, gesture] of (scene.gestures ?? []).entries()) {
      const middle = (gesture.start + gesture.end) / 2;
      assert.equal(
        getFilmState(scene, gesture.start).gestures[index].opacity,
        0,
      );
      assert.ok(getFilmState(scene, middle).gestures[index].opacity > 0.99);
      assert.equal(getFilmState(scene, gesture.end).gestures[index].opacity, 0);
    }
    for (let i = 0; i <= 100; i++) {
      const state = getFilmState(scene, i / 100, true);
      assert.ok(state.frames.every((f) => f.opacity === 0 || f.opacity === 1));
      assert.ok(
        state.frames.every((f) => f.x === 0 && f.y === 0 && f.scale === 1),
      );
      assert.ok(state.gestures.every((g) => g.opacity === 0));
      assert.equal(state.shade, 0);
    }
  }
  assert.equal(
    getFilmState(
      add,
      add.frames.find((f) => f.image === "schedule").at - 0.001,
      true,
    ).dominantImage,
    "search-typed",
  );
  assert.equal(
    getFilmState(add, add.frames.find((f) => f.image === "schedule").at, true)
      .dominantImage,
    "schedule",
  );
});
test("shared captures remain still and preserve medication state across chapters", () => {
  for (const [index, scene] of scenes.entries()) {
    const next = scenes[index + 1];
    if (!next || scene.frames.at(-1).image !== next.frames[0].image) continue;
    for (const blend of [0, 0.25, 0.5, 0.75, 1]) {
      const state = getFilmState(scene, 1, false, next, blend);
      const visible = state.frames.filter((f) => f.opacity > 0);
      assert.equal(visible.length, 1);
      assert.equal(visible[0].opacity, 1);
      assert.equal(visible[0].x, 0);
      assert.equal(visible[0].y, 0);
    }
  }
  assert.equal(scenes.find((s) => s.id === "box").frames[0].image, "box-taken");
});
test("scroll input stays normalized and the complete timeline never overlaps its chapter exit", () => {
  assert.equal(clampProgress(-1), 0);
  assert.equal(clampProgress(2), 1);
  assert.equal(clampProgress(NaN), 0);
  for (const [index, scene] of scenes.entries()) {
    assert.equal(scene.frames[0].at, 0);
    assert.ok(
      scene.frames.every(
        (f, i) =>
          f.at >= 0 &&
          f.at <= 1 - CHAPTER_EXIT_SCREENS / chapterLengths[index] &&
          (i === 0 || f.at > scene.frames[i - 1].at),
      ),
    );
  }
});

test("clicks have their own extra scroll distance while non-click motion keeps its original pace", () => {
  for (const [index, scene] of scenes.entries()) {
    for (const [i, frame] of scene.frames.entries()) {
      if (!frame.motion) continue;
      const count =
        nativeTouchCount(scene.frames[i - 1].image, frame.image) ||
        Number(frame.motion === "unlock");
      assert.ok(
        Math.abs(
          frame.duration * chapterLengths[index] -
            (motionDistances[frame.motion] + count * TOUCH_EXTRA_SCREENS),
        ) < 1e-10,
      );
      assert.ok(
        frame.at - frame.duration >= scene.frames[i - 1].at - 1e-10,
        `${scene.id}: ${frame.image}`,
      );
    }
    for (const gesture of scene.gestures ?? [])
      assert.ok(
        Math.abs(
          (gesture.end - gesture.start) * chapterLengths[index] - TAP_SCREENS,
        ) < 1e-10,
      );
  }
});

test("guardian dialogs include Flutter's own background, keyboard focus and closing animation", () => {
  const guardian = scenes.find((scene) => scene.id === "guardian");
  const midway = (image) => {
    const frame = guardian.frames.find((f) => f.image === image);
    return getFilmState(guardian, frame.at - frame.duration / 2);
  };
  const opening = midway("guardian-invite-empty");
  assert.equal(opening.native.id, "guardian-base--guardian-invite-empty");
  const typing = midway("guardian-invite");
  assert.equal(typing.native.id, "guardian-invite-empty--guardian-invite");
  const closing = midway("guardian-pending");
  assert.equal(closing.native.id, "guardian-invite--guardian-pending");
  assert.equal(closing.shade, 0);
});

test("button, field and notification touches remain visible for at least 0.3 viewport before the next motion", () => {
  for (const [index, scene] of scenes.entries()) {
    for (const frame of scene.frames.slice(1)) {
      const state = getFilmState(scene, frame.at - frame.duration / 2);
      for (const cue of state.touches) {
        const distance =
          (cue.end - cue.start) * frame.duration * chapterLengths[index];
        assert.ok(
          distance >= 0.3 && distance <= 0.42,
          `${scene.id}: ${frame.image}, ${distance}`,
        );
      }
      assert.equal(
        getFilmState(scene, frame.at - frame.duration / 2, true).touches.length,
        0,
      );
    }
  }
  for (const [index, next] of scenes.entries()) {
    if (!index) continue;
    const state = getFilmState(scenes[index - 1], 1, false, next, 0.5);
    for (const cue of state.touches) {
      const distance = (cue.end - cue.start) * CHAPTER_EXIT_SCREENS;
      assert.ok(distance >= 0.3 && distance <= 0.42, next.id);
    }
  }
});

test("notifications wait for the tap, then open the corresponding app screen from their card", () => {
  for (const [sceneId, targetImage] of [
    ["alarm", "home-taken"],
    ["guardian", "guardian-linked"],
  ]) {
    const scene = scenes.find((scene) => scene.id === sceneId);
    const target = scene.frames.at(-1);
    assert.equal(target.image, targetImage);
    assert.equal(target.motion, "unlock");
    const sample = (progress) =>
      getFilmState(
        scene,
        target.at - target.duration + target.duration * progress,
      );
    for (const portion of [
      0.1,
      (notificationTouch.release + notificationTouch.end) / 2,
    ]) {
      const pressed = sample(portion);
      assert.ok(pressed.touches[0].opacity > 0);
      assert.equal(pressed.unlockProgress, 0);
      assert.equal(
        pressed.frames.find((frame) => frame.image === targetImage).opacity,
        0,
      );
    }
    const opening = sample(
      notificationTouch.end + (1 - notificationTouch.end) * 0.5,
    );
    const incoming = opening.frames.find(
      (frame) => frame.image === targetImage,
    );
    assert.equal(opening.touches[0].opacity, 0);
    assert.ok(incoming.contentClip[0] > 0);
    assert.ok(incoming.scale > 0.94 && incoming.scale < 1);
    assert.ok(incoming.y > 0);
    const settled = getFilmState(scene, target.at);
    assert.equal(settled.dominantImage, targetImage);
    assert.deepEqual(
      settled.frames[settled.dominantFrame].contentClip,
      [0, 0, 0, 0],
    );
  }
});

test("cross-chapter Flutter playback keeps the same clock as transitions within a chapter", () => {
  const index = 2;
  const height = 1000;
  const quarter = getChapterStart(index + 1) - CHAPTER_EXIT_SCREENS * 0.75;
  const scroll = getScrollState(quarter * height, height, scenes.length);
  const film = getFilmState(
    scenes[index],
    scroll.progress,
    false,
    scenes[index + 1],
    scroll.transition,
  );
  const expected = sampleNativeClip(
    "home-taken",
    "box-taken",
    0.25,
    TOUCH_EXTRA_SCREENS / BASE_CHAPTER_EXIT_SCREENS,
  );
  assert.equal(film.native.index, expected.index);
  assert.equal(film.native.frame.image, expected.frame.image);
});
