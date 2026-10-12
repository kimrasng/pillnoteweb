// Korean IME keystrokes, sampled from scroll position rather than a timer.
const keystrokes = [
  { at: 0, committed: "", composing: "" },
  { at: 0.06, committed: "", composing: "ㅌ" },
  { at: 0.13, committed: "", composing: "타" },
  { at: 0.21, committed: "타", composing: "ㅇ" },
  { at: 0.28, committed: "타", composing: "이" },
  { at: 0.36, committed: "타이", composing: "ㄹ" },
  { at: 0.44, committed: "타이", composing: "레" },
  { at: 0.53, committed: "타이레", composing: "ㄴ" },
  { at: 0.61, committed: "타이레", composing: "노" },
  { at: 0.7, committed: "타이레", composing: "놀" },
  { at: 0.8, committed: "타이레놀", composing: "" },
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
