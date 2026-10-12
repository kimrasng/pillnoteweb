// Korean IME keystrokes, sampled from scroll position rather than a timer.
const keystrokes = [
  { at: 0, committed: "", composing: "" },
  { at: 0.08, committed: "", composing: "ㅂ" },
  { at: 0.18, committed: "", composing: "비" },
  { at: 0.3, committed: "", composing: "빝" },
  { at: 0.35, committed: "비", composing: "타" },
  { at: 0.47, committed: "비", composing: "탐" },
  { at: 0.52, committed: "비타", composing: "미" },
  { at: 0.65, committed: "비타", composing: "민" },
  { at: 0.76, committed: "비타민", composing: "" },
];
export function getTypingState(progress: number) {
  const position = Number.isNaN(progress)
    ? 0
    : Math.max(0, Math.min(1, progress));
  let index = 0;
  for (let i = 1; i < keystrokes.length; i++)
    if (position >= keystrokes[i].at) index = i;
  const key = keystrokes[index];
  const next = keystrokes[index + 1]?.at ?? 1;
  const local = (position - key.at) / (next - key.at);
  return {
    committed: key.committed,
    composing: key.composing,
    text: key.committed + key.composing,
    caretOpacity: 0.45 + 0.55 * (1 - local),
  };
}
