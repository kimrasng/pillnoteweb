import type { CSSProperties } from "react";
import { doseFeedback } from "./feedback";

type Rect = [x: number, y: number, width: number, height: number];

// Crop genuine Flutter text/rows at their original size. Only their position
// and opacity change; the card itself never scales or moves away from its top.
function CaptureCrop({
  image,
  rect: [x, y, width, height],
  top = y,
  opacity = 1,
}: {
  image: string;
  rect: Rect;
  top?: number;
  opacity?: number;
}) {
  return (
    <div
      className="dose-crop"
      style={{
        left: `${(x / 390) * 100}%`,
        top: `${(top / 844) * 100}%`,
        width: `${(width / 390) * 100}%`,
        height: `${(height / 844) * 100}%`,
        opacity,
      }}
    >
      <img
        src={`/images/app/${image}.png`}
        alt=""
        style={{
          left: `${(-x / width) * 100}%`,
          top: `${(-y / height) * 100}%`,
          width: `${(390 / width) * 100}%`,
          height: `${(844 / height) * 100}%`,
        }}
      />
    </div>
  );
}

export default function DoseCheckFeedback({ progress }: { progress: number }) {
  const pose = doseFeedback(progress);
  return (
    <div
      className="dose-feedback"
      data-dose-feedback={progress.toFixed(4)}
      aria-hidden="true"
    >
      <div
        className="dose-region"
        style={{
          clipPath: `inset(${(334 / 844) * 100}% 0 ${((844 - 739) / 844) * 100}% 0)`,
        }}
      >
        <div className="dose-region-backdrop" />
        <div
          className="dose-summary-panel"
          style={{ height: `${(pose.cardHeight / 844) * 100}%` }}
        />
        <CaptureCrop image="home" rect={[24, 334, 342, 46]} />
        <CaptureCrop
          image="home"
          rect={[44, 380, 302, 60]}
          top={380 - 5 * pose.move}
          opacity={pose.oldTextOpacity}
        />
        <CaptureCrop
          image="home-taken"
          rect={[44, 380, 302, 32]}
          top={380 + 5 * (1 - pose.move)}
          opacity={pose.newTextOpacity}
        />
        <div
          className="dose-progress-track"
          style={{ top: `${(pose.barY / 844) * 100}%` }}
        >
          <span style={{ transform: `scaleX(${0.5 * pose.progressFill})` }} />
        </div>
        <CaptureCrop
          image="home"
          rect={[44, 467, 302, 20]}
          top={pose.countY}
          opacity={1 - pose.move}
        />
        <CaptureCrop
          image="home-taken"
          rect={[44, 439, 302, 20]}
          top={pose.countY}
          opacity={pose.move}
        />
        <div
          className="dose-list"
          style={{ clipPath: `inset(${(pose.listY / 844) * 100}% 0 0 0)` }}
        >
          <CaptureCrop
            image="home"
            rect={[0, 506, 390, 233]}
            top={pose.listY}
            opacity={1 - pose.move}
          />
          <CaptureCrop
            image="home-taken"
            rect={[0, 478, 390, 261]}
            top={pose.listY}
            opacity={pose.move}
          />
        </div>
      </div>
      <div
        className="dose-check-response"
        style={
          {
            top: `${(643.22 / 844) * 100}%`,
            left: `${(342 / 390) * 100}%`,
            opacity: 1 - pose.move,
          } as CSSProperties
        }
      >
        <i
          style={{
            opacity: pose.haloOpacity,
            transform: `scale(${pose.haloScale})`,
          }}
        />
        <svg viewBox="0 0 40 40" style={{ transform: `scale(${pose.scale})` }}>
          <circle cx="20" cy="20" r="14" fill="#2563eb" opacity={pose.check} />
          <path
            d="m13.5 20 4.5 4.5 8.5-9"
            fill="none"
            stroke="white"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - pose.check}
            opacity={pose.check}
          />
        </svg>
      </div>
    </div>
  );
}
