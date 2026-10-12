import { useEffect, useState } from "react";
import labels from "./capture-dates.json";
import { formatCaptureDate, type DateLabel } from "./dates";

type CaptureLabel = DateLabel & {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  color: string;
  opacity?: number;
  scale?: number;
  clipRight?: number;
};

export function useCurrentDate() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    // Only calendar/reminder text follows the clock. Film playback stays scroll driven.
    const refresh = () => {
      clearTimeout(timer);
      const date = new Date();
      setNow(date);
      timer = setTimeout(
        refresh,
        60_000 - date.getSeconds() * 1000 - date.getMilliseconds() + 20,
      );
    };
    const onVisible = () => {
      if (!document.hidden) refresh();
    };
    refresh();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refresh);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  return now;
}

export default function CaptureDates({
  image,
  now,
}: {
  image: string;
  now: Date;
}) {
  const items = (labels as Record<string, CaptureLabel[]>)[image] ?? [];
  return items.map((label, index) => {
    const centered = label.kind === "weekday" || label.kind === "day";
    const text = (
      <span
        key={index}
        className="capture-date"
        data-date-kind={label.kind}
        style={{
          left: `${((label.x + (centered ? (label.width * (label.scale ?? 1)) / 2 : 0)) / 390) * 100}%`,
          top: `${(label.y / 844) * 100}%`,
          height: `${((label.height * (label.scale ?? 1)) / 844) * 100}%`,
          fontSize: `${((label.fontSize * (label.scale ?? 1)) / 390) * 100}cqw`,
          fontWeight: label.fontWeight,
          lineHeight: label.lineHeight,
          color: label.color,
          opacity: label.opacity ?? 1,
          transform: centered ? "translateX(-50%)" : undefined,
        }}
      >
        {formatCaptureDate(label, now)}
      </span>
    );
    return (
      <div
        key={index}
        className="capture-date-clip"
        style={{
          // Scrolled calendar text must pass behind Flutter's pinned heading.
          clipPath: `inset(${(110 / 844) * 100}% ${(1 - (label.clipRight ?? 390) / 390) * 100}% ${(34 / 844) * 100}% 0)`,
        }}
      >
        {text}
      </div>
    );
  });
}
