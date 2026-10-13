import assert from "node:assert/strict";
import test from "node:test";
import {
  getChapterScreens,
  getChapterStart,
  INTRO_SCREENS,
  STORY_SCREENS,
  clamp01,
  getScrollState,
  getStoryScreens,
  sceneScrollOffset,
  smoothstep,
  CHAPTER_SCROLL_EXIT_SCREENS,
} from "../src/scroll.ts";

const height = 800;
const count = 7;
const atScene = (index, progress = 0, viewportHeight = height) =>
  (getChapterStart(index) + getChapterScreens(index) * progress) *
  viewportHeight;
const close = (actual, expected) =>
  assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} ≈ ${expected}`);

test("intro occupies the first viewport and keeps app playback at its start", () => {
  assert.deepEqual(getScrollState(0, height, count), {
    introProgress: 0,
    scenePosition: 0,
    activeIndex: 0,
    progress: 0,
    transition: 0,
  });
  assert.deepEqual(
    getScrollState(-height, height, count),
    getScrollState(0, height, count),
  );
  const midpoint = getScrollState((INTRO_SCREENS * height) / 2, height, count);
  assert.equal(midpoint.introProgress, 0.5);
  assert.equal(midpoint.scenePosition, 0);
  assert.equal(midpoint.progress, 0);
  assert.equal(getScrollState(atScene(0), height, count).introProgress, 1);
});

test("each chapter boundary selects the next scene and scrolling back restores the previous one", () => {
  for (let index = 1; index < count; index += 1) {
    const boundary = atScene(index);
    const before = getScrollState(boundary - 1, height, count);
    const forward = getScrollState(boundary, height, count);
    const backward = getScrollState(boundary - 1, height, count);
    assert.equal(before.activeIndex, index - 1);
    assert.ok(before.progress > 0.99);
    assert.equal(forward.activeIndex, index);
    assert.equal(forward.progress, 0);
    assert.deepEqual(backward, before);
  }
});

test("frame progress and chapter blend depend only on the sampled scroll position", () => {
  const middle = 1 - CHAPTER_SCROLL_EXIT_SCREENS / getChapterScreens(2) / 2;
  const distance = atScene(2, middle);
  const state = getScrollState(distance, height, count);
  assert.equal(state.activeIndex, 2);
  close(state.progress, middle);
  close(state.transition, 0.5);
  assert.deepEqual(getScrollState(distance, height, count), state);
  getScrollState(atScene(5, 0.5), height, count);
  assert.deepEqual(getScrollState(distance, height, count), state);
  assert.equal(
    getScrollState(
      atScene(
        2,
        1 - CHAPTER_SCROLL_EXIT_SCREENS / getChapterScreens(2) - 0.001,
      ),
      height,
      count,
    ).transition,
    0,
  );
});

test("the final scene reaches completion and remains clamped beyond the story", () => {
  const final = getScrollState(atScene(count), height, count);
  assert.equal(final.scenePosition, count);
  assert.equal(final.activeIndex, count - 1);
  assert.equal(final.progress, 1);
  assert.equal(final.transition, 0);
  assert.deepEqual(getScrollState(atScene(count + 10), height, count), final);
  assert.equal(
    getScrollState(atScene(count - 1, 0.95), height, count).transition,
    0,
  );
});

test("chapter navigation enters the intended scene at its settled first screen", () => {
  for (let index = 0; index < count; index += 1) {
    const state = getScrollState(
      sceneScrollOffset(index, height),
      height,
      count,
    );
    assert.equal(state.activeIndex, index);
    close(state.progress, 0);
    assert.equal(state.introProgress, 1);
  }
  assert.equal(sceneScrollOffset(-1, height), sceneScrollOffset(0, height));
});

test("viewport rescaling preserves the same visual progress", () => {
  const desktop = getScrollState(atScene(3, 0.46, 800), 800, count);
  const mobile = getScrollState(atScene(3, 0.46, 568), 568, count);
  close(desktop.scenePosition, mobile.scenePosition);
  close(desktop.progress, mobile.progress);
  assert.equal(desktop.activeIndex, mobile.activeIndex);
  assert.equal(getScrollState(0, 0, count).progress, 0);
  close(sceneScrollOffset(2, 0), getChapterStart(2));
});

test("story height and easing endpoints are explicit and bounded", () => {
  assert.equal(STORY_SCREENS, getStoryScreens(count));
  close(getStoryScreens(3), getChapterStart(3) + 1);
  assert.equal(clamp01(-2), 0);
  assert.equal(clamp01(2), 1);
  assert.equal(smoothstep(0.88, 1, 0.7), 0);
  assert.equal(smoothstep(0.88, 1, 1.2), 1);
  close(smoothstep(0.88, 1, 0.94), 0.5);
});

test("the intro is quicker while interactive chapters allow more scroll distance", () => {
  assert.ok(INTRO_SCREENS < 1.75);
  for (const index of [1, 2, 3])
    assert.ok(getChapterScreens(index) > getChapterScreens(0));
  assert.ok(getChapterScreens(1) > getChapterScreens(0));
});

test("chapter exits take equal scroll distance in short and long chapters", () => {
  for (let index = 0; index < count - 1; index++) {
    const start = 1 - CHAPTER_SCROLL_EXIT_SCREENS / getChapterScreens(index);
    close(getScrollState(atScene(index, start), height, count).transition, 0);
    close(
      getScrollState(atScene(index, (start + 1) / 2), height, count).transition,
      0.5,
    );
    close((1 - start) * getChapterScreens(index), CHAPTER_SCROLL_EXIT_SCREENS);
  }
});
