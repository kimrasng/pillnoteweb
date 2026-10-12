import assert from "node:assert/strict";
import test from "node:test";
import { dateKey, formatCaptureDate } from "../src/dates.ts";

test("calendar dates and weekdays stay centered on today across month and year boundaries", () => {
  const now = new Date(2027, 0, 1, 10);
  assert.equal(
    formatCaptureDate({ kind: "month", offset: 0 }, now),
    "2027년 1월",
  );
  assert.equal(formatCaptureDate({ kind: "day", offset: -1 }, now), "31");
  assert.equal(formatCaptureDate({ kind: "weekday", offset: -1 }, now), "목");
  assert.equal(formatCaptureDate({ kind: "weekday", offset: 0 }, now), "금");
  assert.equal(
    formatCaptureDate({ kind: "day", offset: 1 }, new Date(2028, 1, 28)),
    "29",
  );
});

test("schedule and registration start dates use the viewer's local date", () => {
  const now = new Date(2027, 11, 31, 23, 59);
  assert.equal(dateKey(now), "2027-12-31");
  assert.equal(
    formatCaptureDate({ kind: "start", offset: 0 }, now),
    "2027-12-31부터 · 종료일 없이",
  );
  assert.equal(
    formatCaptureDate({ kind: "start", offset: 0 }, new Date(2028, 0, 1)),
    "2028-01-01부터 · 종료일 없이",
  );
});

test("the next reminder follows the actual sample schedule and rolls over at its time", () => {
  const label = { kind: "next", offset: 0, times: [13] };
  assert.equal(
    formatCaptureDate(label, new Date(2027, 11, 31, 12, 59)),
    "다음 알림 · 12월 31일 13:00",
  );
  assert.equal(
    formatCaptureDate(label, new Date(2027, 11, 31, 13)),
    "다음 알림 · 1월 1일 13:00",
  );
  assert.equal(
    formatCaptureDate(
      { ...label, times: [8, 13, 20] },
      new Date(2027, 11, 31, 20),
    ),
    "다음 알림 · 2028년 1월 1일 08:00",
  );
});
