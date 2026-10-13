import { LockKeyhole, LockKeyholeOpen, Flashlight, Camera } from "lucide-react";
import type { CSSProperties } from "react";
import { useLocale } from "./LocaleProvider";

export { notificationScreens } from "./notificationScreens";

export function LockWallpaper() {
  return (
    <div className="lock-wallpaper" aria-hidden="true">
      <i />
      <i />
      <i />
    </div>
  );
}

export default function NotificationScreen({
  image,
  now,
  opening = 0,
  pressed = false,
}: {
  image: string;
  now: Date;
  opening?: number;
  pressed?: boolean;
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
      style={
        {
          "--lock-chrome": Math.max(0, 1 - opening * 2.4),
          "--lock-blur": `${opening * 2}cqw`,
          "--card-scale": pressed ? 0.975 : 1,
        } as CSSProperties
      }
    >
      <LockWallpaper />
      <div className="lock-auth" aria-hidden="true">
        {opening > 0 ? <LockKeyholeOpen /> : <LockKeyhole />}
      </div>
      <div className="lock-heading">
        <p>{date}</p>
        <strong>{guardian ? "8:30" : "8:00"}</strong>
      </div>
      {notified && (
        <div className="lock-notification">
          <div className="lock-notification-copy">
            <div className="notification-sender">
              <span>
                <img src="/images/app-icon.png" alt="" />
                PILLNOTE
              </span>
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
      <p className="lock-swipe" aria-hidden="true">
        {text.swipe}
      </p>
    </div>
  );
}
