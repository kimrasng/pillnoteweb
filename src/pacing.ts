// Distances are viewport heights, so an action has the same pace in every chapter.
export const TOUCH_EXTRA_SCREENS = 0.22;
export const TOUCH_PRESS_SHARE = 0.52;
export const BASE_CHAPTER_EXIT_SCREENS = 0.55;
export const CHAPTER_EXIT_SCREENS =
  BASE_CHAPTER_EXIT_SCREENS + TOUCH_EXTRA_SCREENS;
const chapterTouchCounts = [1, 8, 1, 1, 1, 8, 1];
// Reserve the added contact distance inside each chapter and its outgoing route.
export const chapterLengths = [2.1, 8.2, 2.6, 4.2, 3.4, 10.7, 3.4].map(
  (length, index) =>
    length + (chapterTouchCounts[index] + 1) * TOUCH_EXTRA_SCREENS,
);
export const motionDistances = {
  push: 0.55,
  pop: 0.55,
  tab: 0.55,
  update: 0.32,
  dose: 0.95,
  typing: 1.4,
  search: 1.4,
  scroll: 0.7,
  sheet: 0.42,
  dialog: 0.42,
  "dismiss-dialog": 0.42,
  notification: 0.42,
  unlock: 0.55,
  lock: 0.55,
} as const;
export const TAP_SCREENS = 0.35;
