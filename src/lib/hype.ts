/*
 * Hype copy — focused, a little hype, current student vernacular. Crucially,
 * the "broken" lines never shame: self-forgiveness measurably reduces future
 * procrastination, so a slip is always met with a clean way back in.
 */
export const HYPE = {
  start: [
    "Phone across the room. Let's go.",
    'No notifications. No exits. Lock in.',
    'Two minutes to break the dread. Move.',
  ],
  midway: [
    'Past the hard part. Keep going.',
    "You're in the zone now. Don't stop.",
    'This is the rep. Stay with it.',
  ],
  doneClean: [
    "Clean lock. That's a real rep.",
    "Held it the whole way. That's how it's built.",
    "Unbroken. That's the good stuff.",
  ],
  doneBroke: [
    'You finished. Next one, hold it clean.',
    'Done is done. Forgive it, run it back.',
    'Got there. The streak still counts.',
  ],
} as const;

/** Deterministic pick from a list (seeded), so renders and tests are stable. */
export function pick<T>(list: readonly T[], seed: number): T {
  return list[Math.abs(seed) % list.length];
}
