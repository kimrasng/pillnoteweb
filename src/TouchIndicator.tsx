import type { TouchPose } from "./touch";

export default function TouchIndicator({ touches }: { touches: TouchPose[] }) {
  return touches.map(
    (touch, index) =>
      touch.opacity > 0 && (
        <span
          key={index}
          className="app-touch"
          data-touch-phase={touch.phase}
          data-touch-x={touch.x}
          data-touch-y={touch.y}
          style={{
            left: `${(touch.x / 390) * 100}%`,
            top: `${(touch.y / 844) * 100}%`,
          }}
          aria-hidden="true"
        >
          <i
            className="app-touch-contact"
            style={{
              opacity: touch.opacity,
              transform: `scale(${touch.scale})`,
            }}
          />
          <i
            className="app-touch-ring"
            style={{
              opacity: touch.ringOpacity,
              transform: `scale(${touch.ringScale})`,
            }}
          />
        </span>
      ),
  );
}
