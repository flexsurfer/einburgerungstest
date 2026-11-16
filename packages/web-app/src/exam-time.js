export function examSecondsRemaining(endsAt, now) {
  return Math.max(0, Math.ceil((endsAt - now) / 1000));
}

export function formatExamTime(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
