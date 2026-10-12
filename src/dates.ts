export type DateLabel = {
  kind: string;
  offset: number;
  times?: number[];
};

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function formatCaptureDate(label: DateLabel, now: Date): string {
  const day = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + label.offset,
  );
  if (label.kind === "month")
    return `${day.getFullYear()}년 ${day.getMonth() + 1}월`;
  if (label.kind === "day") return String(day.getDate());
  if (label.kind === "weekday")
    return ["일", "월", "화", "수", "목", "금", "토"][day.getDay()];
  if (label.kind === "start") return `${dateKey(day)}부터 · 종료일 없이`;
  const hours = label.times ?? [13];
  const next =
    hours
      .map(
        (hour) =>
          new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour),
      )
      .find((time) => time > now) ??
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hours[0]);
  const year = hours.length > 1 ? `${next.getFullYear()}년 ` : "";
  const date = `${year}${next.getMonth() + 1}월 ${next.getDate()}일`;
  return `다음 알림 · ${date} ${String(next.getHours()).padStart(2, "0")}:00`;
}
