import { LockKeyhole, Flashlight, Camera } from "lucide-react";
import { useLocale } from "./LocaleProvider";

export const notificationScreens = new Set([
  "dose-lock",
  "dose-notification",
  "guardian-notification",
  "guardian-lock",
]);

export default function NotificationScreen({
  image,
  now,
}: {
  image: string;
  now: Date;
}) {
  const { locale, copy } = useLocale();
  const text = copy.notification;
  const guardian = image.startsWith("guardian-");
  const notified = image.endsWith("-notification");
  const date = new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(now);
  return (
    <div
      className="notification-screen"
      aria-label={guardian ? text.guardianExample : text.doseExample}
    >
      <div className="lock-heading">
        <LockKeyhole size={24} strokeWidth={2.7} />
        <p>{date}</p>
        <strong>{guardian ? "8:30" : "8:00"}</strong>
      </div>
      {notified && (
        <div className="lock-notification">
          <img src="/images/app-icon.png" alt="" />
          <div className="lock-notification-copy">
            <div className="notification-sender">
              <span>PillNote</span>
              <small>{text.now}</small>
            </div>
            <strong>{guardian ? text.guardianTitle : text.doseTitle}</strong>
            <p>{guardian ? text.guardianBody : text.doseBody}</p>
          </div>
        </div>
      )}
      <div className="lock-controls" aria-hidden="true">
        <span>
          <Flashlight />
        </span>
        <span>
          <Camera />
        </span>
      </div>
    </div>
  );
}
