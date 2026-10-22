import assert from "node:assert/strict";
import test from "node:test";
import {
  heroDemo,
  featureDemos,
  fullDemo,
  demoChapterTime,
  sampleDemo,
} from "../src/demo.ts";
import { getScrollState } from "../src/scroll.ts";
import { getFilmState } from "../src/film.ts";
import { scenes } from "../src/story.ts";

function filmAt(demo, time) {
  const state = getScrollState(sampleDemo(demo, time), 1, scenes.length);
  return getFilmState(
    scenes[state.activeIndex],
    state.progress,
    false,
    scenes[state.activeIndex + 1],
    state.transition,
  );
}

test("the 10-second hero demonstrates a faster dose check and holds the completed record", () => {
  assert.ok(Math.abs(heroDemo.duration - 10000) < 1e-8);
  assert.equal(filmAt(heroDemo, 0).dominantImage, "home");
  assert.ok(
    filmAt(heroDemo, 2580).native,
    "the check uses native intermediate frames",
  );
  assert.equal(filmAt(heroDemo, 4200).dominantImage, "home-taken");
  assert.equal(filmAt(heroDemo, heroDemo.duration).dominantImage, "home-taken");
});

test("each feature stays in its selected chapter, including its completed last frame", () => {
  for (const demo of featureDemos) {
    for (let time = 0; time <= demo.duration; time += 100) {
      const state = getScrollState(sampleDemo(demo, time), 1, scenes.length);
      assert.equal(scenes[state.activeIndex].id, demo.id);
      assert.ok(Number.isFinite(state.progress));
    }
    assert.equal(filmAt(demo, demo.duration).native, null);
  }
});

test("caregiver preview covers the connected state, lock screen, notification and unlock", () => {
  const caregiver = featureDemos[3];
  const images = new Set();
  for (let time = 0; time <= caregiver.duration; time += 50)
    images.add(filmAt(caregiver, time).dominantImage);
  for (const image of [
    "guardian-linked",
    "guardian-lock",
    "guardian-notification",
  ])
    assert.ok(images.has(image), image);
  assert.equal(
    filmAt(caregiver, caregiver.duration).dominantImage,
    "guardian-linked",
  );
});

test("full tour advances through every chapter and chapter selection starts on its first frame", () => {
  let previous = 0;
  for (let time = 0; time <= fullDemo.duration; time += 10) {
    const position = sampleDemo(fullDemo, time);
    assert.ok(position >= previous - 1e-10, `time ${time} must not rewind`);
    previous = position;
  }
  scenes.forEach((scene, index) => {
    assert.equal(
      filmAt(fullDemo, demoChapterTime(index)).dominantImage,
      scene.frames[0].image,
    );
  });
  assert.equal(
    filmAt(fullDemo, fullDemo.duration).dominantImage,
    "pharmacy-detail",
  );
});

test("the full tour retains the empty email focus pause before caregiver typing", () => {
  let elapsed = 0;
  const step = fullDemo.segments.find((segment) => {
    if (segment.holds?.length) return true;
    elapsed += segment.duration;
    return false;
  });
  assert.ok(step);
  const pause = step.holds[0];
  const motionDuration = step.duration - pause.duration;
  const pauseAt =
    (motionDuration * (pause.position - step.start)) / (step.end - step.start);
  assert.equal(
    sampleDemo(fullDemo, elapsed + pauseAt + 10),
    sampleDemo(fullDemo, elapsed + pauseAt + 390),
  );
});
