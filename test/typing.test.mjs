import assert from "node:assert/strict";
import test from "node:test";
import { getTypingState } from "../src/typing.ts";
import { getFilmState } from "../src/film.ts";
import { scenes } from "../src/story.ts";

test("search composes Korean keystrokes with a caret and commits the full name before results", () => {
  assert.equal(getTypingState(0).text, "");
  for (const [progress, text] of [
    [0.1, "ㅂ"],
    [0.2, "비"],
    [0.32, "빝"],
    [0.4, "비타"],
    [0.49, "비탐"],
    [0.6, "비타미"],
    [0.7, "비타민"],
    [0.8, "비타민"],
  ])
    assert.equal(getTypingState(progress).text, text);
  assert.equal(getTypingState(0.8).composing, "");
  const add = scenes.find((scene) => scene.id === "add");
  const typed = add.frames.find((frame) => frame.image === "search-typed");
  const atTyping = (amount) => typed.at - typed.duration * (1 - amount);
  for (const amount of [0.1, 0.3, 0.5, 0.76, 0.8]) {
    const film = getFilmState(add, atTyping(amount));
    assert.ok(Math.abs(film.searchProgress - amount) < 1e-10);
    assert.equal(
      film.frames.find((frame) => frame.image === "search-typed").opacity,
      0,
    );
  }
  const committed = getFilmState(add, atTyping(0.9));
  assert.equal(committed.native.id, "search-focused--search-typed");
  assert.equal(committed.native.index, 8);
  const results = getFilmState(add, typed.at);
  assert.equal(results.dominantImage, "search-typed");
});

test("pausing freezes input and reversing restores each composed syllable exactly", () => {
  const points = Array.from({ length: 1001 }, (_, i) => i / 1000);
  const states = points.map(getTypingState);
  assert.deepEqual(
    points.toReversed().map(getTypingState).toReversed(),
    states,
  );
  for (const point of points) {
    assert.deepEqual(getTypingState(point), getTypingState(point));
    assert.ok(
      getTypingState(point).caretOpacity >= 0.45 &&
        getTypingState(point).caretOpacity <= 1,
    );
  }
  assert.equal(getTypingState(NaN).text, "");
  assert.equal(getTypingState(2).text, "비타민");
});
