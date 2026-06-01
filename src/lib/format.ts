/** Formats whole seconds as a "MM:SS" countdown clock. */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Rounds seconds to whole minutes, showing "<1" for anything under a minute. */
export function formatMinutes(totalSeconds: number): string {
  const minutes = Math.round(totalSeconds / 60);
  return minutes < 1 ? '<1' : String(minutes);
}
