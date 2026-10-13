import {
  chapterLengths,
  motionDistances,
  TAP_SCREENS,
  TOUCH_EXTRA_SCREENS,
  POST_TOUCH_PAUSE_SCREENS,
} from "./pacing.ts";
import { nativeTouchCount } from "./native.ts";
import { translations } from "./i18n.ts";

export type Gesture = { x: number; y: number; start: number; end: number };
export type SceneId =
  "today" | "add" | "record" | "box" | "alarm" | "guardian" | "pharmacy";
export type ScreenMotion =
  | "push"
  | "pop"
  | "tab"
  | "update"
  | "dose"
  | "typing"
  | "search"
  | "scroll"
  | "sheet"
  | "dialog"
  | "dismiss-dialog"
  | "notification"
  | "unlock"
  | "lock";
export type CaptureFrame = {
  image: string;
  at: number;
  motion?: ScreenMotion;
  duration?: number;
  touchExtension?: number;
  pauseExtension?: number;
  region?: [number, number, number, number];
  travel?: number;
};
export type Scene = {
  id: SceneId;
  label: string;
  title: string;
  description: string;
  detail: string;
  tone: string;
  frames: CaptureFrame[];
  entry?: ScreenMotion;
  gestures?: Gesture[];
};

// Author the action timeline in viewport distances, then normalize for playback.
function timeline(index: number) {
  const length = chapterLengths[index];
  let previousImage = "";
  let extension = 0;
  return {
    frame(
      image: string,
      screens: number,
      motion?: ScreenMotion,
      options: Pick<CaptureFrame, "region" | "travel"> = {},
    ): CaptureFrame {
      const touchCount =
        nativeTouchCount(previousImage, image) || Number(motion === "unlock");
      const added =
        touchCount * (TOUCH_EXTRA_SCREENS + POST_TOUCH_PAUSE_SCREENS);
      extension += added;
      previousImage = image;
      return {
        image,
        at: (screens + extension) / length,
        ...(motion
          ? {
              motion,
              duration: (motionDistances[motion] + added) / length,
              touchExtension: TOUCH_EXTRA_SCREENS / motionDistances[motion],
              pauseExtension:
                POST_TOUCH_PAUSE_SCREENS / motionDistances[motion],
            }
          : {}),
        ...options,
      };
    },
    tap(x: number, y: number, screens: number): Gesture {
      return {
        x,
        y,
        start: screens / length,
        end: (screens + TAP_SCREENS) / length,
      };
    },
  };
}
const [today, add, record, box, alarm, guardian, pharmacy] = chapterLengths.map(
  (_, index) => timeline(index),
);

export const scenes: Scene[] = [
  {
    id: "today",
    ...translations.ko.scenes.today,
    tone: "today",
    frames: [
      today.frame("home-start", 0),
      today.frame("box-start", 1.1, "tab"),
    ],
    gestures: [today.tap(146, 770, 0.24)],
  },
  {
    id: "add",
    ...translations.ko.scenes.add,
    tone: "add",
    frames: [
      add.frame("box-start", 0),
      add.frame("search-empty", 0.9, "push"),
      add.frame("search-focused", 1.25, "update"),
      add.frame("search-typed", 2.85, "search"),
      add.frame("schedule", 3.7, "push"),
      add.frame("time-picker", 4.37, "dialog", { region: [174, 16, 154, 16] }),
      add.frame("schedule-ready", 5.1, "dismiss-dialog", {
        region: [174, 16, 154, 16],
      }),
      add.frame("registered", 5.77, "update"),
      add.frame("box-registered", 6.62, "pop"),
      add.frame("home", 7.32, "tab"),
    ],
    gestures: [
      add.tap(195, 696, 0.05),
      add.tap(195, 197, 0.9),
      add.tap(219, 286, 2.86),
      add.tap(59.25, 443, 3.7),
      add.tap(318, 642, 4.4),
      add.tap(195, 767, 5.16),
      add.tap(195, 719, 5.8),
    ],
  },
  {
    id: "record",
    ...translations.ko.scenes.record,
    tone: "record",
    frames: [record.frame("home", 0), record.frame("home-taken", 1.7, "dose")],
    gestures: [record.tap(342, 643.22, 0.4)],
  },
  {
    id: "box",
    ...translations.ko.scenes.box,
    tone: "box",
    entry: "tab",
    frames: [box.frame("box-taken", 0), box.frame("stock-taken", 2, "push")],
    gestures: [box.tap(180, 326, 1.13)],
  },
  {
    id: "alarm",
    ...translations.ko.scenes.alarm,
    tone: "alarm",
    entry: "lock",
    frames: [
      alarm.frame("dose-lock", 0),
      alarm.frame("dose-notification", 0.82, "notification"),
      alarm.frame("home-taken", 2.45, "unlock"),
    ],
    gestures: [alarm.tap(195, 600, 1.6)],
  },
  {
    id: "guardian",
    ...translations.ko.scenes.guardian,
    tone: "guardian",
    frames: [
      guardian.frame("home-taken", 0),
      guardian.frame("guardian-settings", 0.65, "tab"),
      guardian.frame("guardian-base", 1.35, "push"),
      guardian.frame("guardian-invite-empty", 2.2, "dialog", {
        region: [279, 55, 259, 55],
      }),
      guardian.frame("guardian-invite", 3.75, "typing"),
      guardian.frame("guardian-pending", 4.4, "dismiss-dialog", {
        region: [279, 55, 259, 55],
      }),
      guardian.frame("guardian-received", 5.45, "push"),
      guardian.frame("guardian-accepted", 6.3, "update"),
      guardian.frame("guardian-linked", 7, "push"),
      guardian.frame("guardian-lock", 7.8, "lock"),
      guardian.frame("guardian-notification", 8.52, "notification"),
      guardian.frame("guardian-linked", 9.6, "unlock"),
    ],
    gestures: [
      guardian.tap(204, 470, 0.28),
      guardian.tap(273.17, 538, 1.5),
      guardian.tap(308.17, 553, 3.77),
    ],
  },
  {
    id: "pharmacy",
    ...translations.ko.scenes.pharmacy,
    tone: "pharmacy",
    entry: "push",
    frames: [
      pharmacy.frame("pharmacy-station", 0),
      pharmacy.frame("pharmacy-list", 1.1, "scroll", { travel: 315 }),
      pharmacy.frame("pharmacy-detail", 2.35, "sheet", {
        region: [527, 0, 0, 0],
      }),
    ],
    gestures: [pharmacy.tap(177, 250, 1.62)],
  },
];
