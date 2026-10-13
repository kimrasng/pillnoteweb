const clamp = (n: number) =>
  Number.isNaN(n) ? 0 : Math.max(0, Math.min(1, n));
const ease = (n: number) => {
  const t = clamp(n);
  return t * t * (3 - 2 * t);
};

// The check, progress fill and list movement share the scroll clock.
// This also makes every intermediate state reversible and pauseable.
export function doseFeedback(progress: number) {
  const t = clamp(progress);
  const check = ease(t / 0.32);
  const move = ease((t - 0.32) / 0.68);
  const pulse = Math.sin(Math.PI * clamp(t / 0.5));
  return {
    check,
    move,
    scale: 1 + 0.07 * pulse,
    haloOpacity: 0.12 * pulse * (1 - move),
    haloScale: 1 + 0.65 * t,
    progressFill: ease((t - 0.12) / 0.8),
    cardHeight: 172 - 28 * move,
    barY: 453 - 28 * move,
    countY: 467 - 28 * move,
    listY: 506 - 28 * move,
    oldTextOpacity: 1 - ease(move / 0.6),
    newTextOpacity: ease((move - 0.2) / 0.8),
  };
}
