import { useEffect, useRef, useState } from "react";
import { sampleDemo, type DemoTimeline } from "./demo";
import { playbackRasterReady } from "./playbackRaster";

export default function useDemoPlayback(
  demo: DemoTimeline,
  {
    enabled = true,
    loop = false,
    initialTime = 0,
  }: { enabled?: boolean; loop?: boolean; initialTime?: number } = {},
) {
  const container = useRef<HTMLDivElement>(null);
  const elapsed = useRef(initialTime);
  const [time, setTime] = useState(initialTime);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const [reducedMotion, setReducedMotion] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const motionChange = () => setReducedMotion(media.matches);
    const pageChange = () => setPageVisible(!document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) =>
        setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.2),
      { threshold: 0.2 },
    );
    // Start inline demos when the phone is visible, rather than when a long
    // player's chapter menu just reaches the bottom edge of the viewport.
    const screen = container.current?.querySelector(".phone-film");
    if (screen) observer.observe(screen);
    media.addEventListener("change", motionChange);
    document.addEventListener("visibilitychange", pageChange);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", motionChange);
      document.removeEventListener("visibilitychange", pageChange);
    };
  }, []);
  const playing =
    enabled &&
    visible &&
    pageVisible &&
    !paused &&
    !reducedMotion &&
    time < demo.duration;
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let previous: number | null = null;
    const tick = (now: number) => {
      const delta = previous === null ? 0 : Math.min(32, now - previous);
      previous = now;
      const nextTime = Math.min(demo.duration, elapsed.current + delta);
      if (playbackRasterReady(sampleDemo(demo, nextTime))) {
        elapsed.current = nextTime;
        if (nextTime >= demo.duration && loop) elapsed.current = 0;
        setTime(elapsed.current);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [demo, playing, loop]);
  function seek(nextTime: number) {
    elapsed.current = Math.max(0, Math.min(demo.duration, nextTime));
    setTime(elapsed.current);
  }
  function toggle() {
    if (elapsed.current >= demo.duration) {
      seek(0);
      setPaused(false);
    } else setPaused((value) => !value);
  }
  function replay() {
    seek(0);
    setPaused(false);
  }
  return {
    container,
    time,
    playing,
    paused,
    reducedMotion,
    seek,
    toggle,
    replay,
    position:
      reducedMotion && demo.id !== "full"
        ? demo.poster
        : sampleDemo(demo, time),
  };
}
