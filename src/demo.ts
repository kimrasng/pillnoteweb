import { playbackSteps, type PlaybackStep } from "./playback.ts";
import { getChapterStart, getScrollState } from "./scroll.ts";
import { scenes } from "./story.ts";

export type DemoTimeline = {
  id: string;
  segments: PlaybackStep[];
  duration: number;
  poster: number;
};

function timeline(
  id: string,
  segments: PlaybackStep[],
  poster: number,
): DemoTimeline {
  return {
    id,
    segments,
    poster,
    duration: segments.reduce((total, step) => total + step.duration, 0),
  };
}

const hold = (position: number, duration: number): PlaybackStep => ({
  start: position,
  end: position,
  duration,
});

function chapterActions(index: number) {
  // Each chapter ends with a route to the next chapter. Feature previews keep
  // the original actions and native renders, but omit that outgoing route.
  return playbackSteps
    .filter(
      (step) =>
        step.start >= getChapterStart(index) - 1e-10 &&
        step.end <= getChapterStart(index + 1) + 1e-10,
    )
    .slice(0, -1);
}

const recordActions = chapterActions(2);
const heroPlaybackRate = 1.2;
export const heroDemo = timeline(
  "hero",
  [
    hold(getChapterStart(2), 2600),
    ...recordActions,
    hold(recordActions.at(-1)!.end, 8300),
  ].map((step) => ({
    ...step,
    duration: step.duration / heroPlaybackRate,
    holds: step.holds?.map((pause) => ({
      ...pause,
      duration: pause.duration / heroPlaybackRate,
    })),
  })),
  recordActions.at(-1)!.end,
);

export const featureSceneIndices = [2, 1, 4, 5] as const;
export const featureDemos = featureSceneIndices.map((index) => {
  const allActions = chapterActions(index);
  // The caregiver preview demonstrates a check-in after connection. The full
  // tour retains the complete invitation, acceptance and connection sequence.
  const actions = index === 5 ? allActions.slice(-3) : allActions;
  const segments = [hold(actions[0].start, 1200)];
  for (const action of actions) segments.push(action, hold(action.end, 450));
  segments.push(hold(actions.at(-1)!.end, 1800));
  const poster =
    index === 4 || index === 5
      ? actions.find((action) => {
          const state = getScrollState(action.end, 1, scenes.length);
          return scenes[state.activeIndex].frames.some(
            (frame) =>
              Math.abs(frame.at - state.progress) < 1e-8 &&
              frame.motion === "notification",
          );
        })!.end
      : actions.at(-1)!.end;
  return timeline(scenes[index].id, segments, poster);
});

const fullSegments = [hold(getChapterStart(0), 1400)];
for (const step of playbackSteps.slice(1, -1))
  fullSegments.push(step, hold(step.end, 450));
// Keep the last frame inside the final scene, away from the document outro.
fullSegments.push(
  hold(
    getChapterStart(6) +
      scenes[6].frames.at(-1)!.at * (getChapterStart(7) - getChapterStart(6)),
    1800,
  ),
);
export const fullDemo = timeline("full", fullSegments, getChapterStart(0));

export function demoChapterTime(index: number) {
  let elapsed = 0;
  for (const segment of fullDemo.segments) {
    if (segment.start >= getChapterStart(index) - 1e-10) return elapsed;
    elapsed += segment.duration;
  }
  return 0;
}

export function sampleDemo(demo: DemoTimeline, elapsed: number) {
  let remaining = Math.max(0, Math.min(demo.duration, elapsed));
  for (const step of demo.segments) {
    if (remaining >= step.duration) {
      remaining -= step.duration;
      continue;
    }
    const holds = step.holds ?? [];
    const motionDuration =
      step.duration - holds.reduce((total, item) => total + item.duration, 0);
    let motionElapsed = remaining;
    for (const pause of holds) {
      const pauseAt =
        (motionDuration * (pause.position - step.start)) /
        (step.end - step.start);
      if (motionElapsed < pauseAt) break;
      if (motionElapsed < pauseAt + pause.duration) {
        motionElapsed = pauseAt;
        break;
      }
      motionElapsed -= pause.duration;
    }
    return (
      step.start +
      (step.end - step.start) * Math.min(1, motionElapsed / motionDuration)
    );
  }
  return demo.segments.at(-1)!.end;
}
