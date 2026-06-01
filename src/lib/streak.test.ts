import { describe, expect, it } from 'vitest';
import type { Session } from '@/types/domain';
import { computeStreak } from './streak';

const NOW = new Date(2026, 2, 10, 12, 0, 0); // "2026-03-10"

function sessionOn(
  year: number,
  month: number,
  day: number,
  id = `${year}-${month}-${day}`,
): Session {
  return {
    id,
    at: new Date(year, month, day, 9, 0, 0).getTime(),
    minutes: 25,
    subject: '',
    clean: true,
  };
}

describe('computeStreak', () => {
  it('is 0 with no sessions', () => {
    expect(computeStreak([], NOW)).toBe(0);
  });

  it('counts a single session today as 1', () => {
    expect(computeStreak([sessionOn(2026, 2, 10)], NOW)).toBe(1);
  });

  it('anchors on yesterday when today has none', () => {
    expect(computeStreak([sessionOn(2026, 2, 9)], NOW)).toBe(1);
  });

  it('counts consecutive days ending today', () => {
    const sessions = [sessionOn(2026, 2, 8), sessionOn(2026, 2, 9), sessionOn(2026, 2, 10)];
    expect(computeStreak(sessions, NOW)).toBe(3);
  });

  it('counts multiple sessions on the same day only once', () => {
    const sessions = [
      sessionOn(2026, 2, 10, 'a'),
      sessionOn(2026, 2, 10, 'b'),
      sessionOn(2026, 2, 9, 'c'),
    ];
    expect(computeStreak(sessions, NOW)).toBe(2);
  });

  it('breaks on a gap', () => {
    const sessions = [sessionOn(2026, 2, 7), sessionOn(2026, 2, 8), sessionOn(2026, 2, 10)];
    // Today + a gap before it: only today counts.
    expect(computeStreak(sessions, NOW)).toBe(1);
  });

  it('is 0 when the most recent session is older than yesterday', () => {
    expect(computeStreak([sessionOn(2026, 2, 8)], NOW)).toBe(0);
  });

  it('counts across a month boundary', () => {
    const now = new Date(2026, 2, 1, 12, 0, 0); // 2026-03-01
    const sessions = [sessionOn(2026, 1, 27), sessionOn(2026, 1, 28), sessionOn(2026, 2, 1)];
    expect(computeStreak(sessions, now)).toBe(3); // Feb 27, 28, Mar 1 (2026 not a leap year)
  });

  it('counts across a year boundary', () => {
    const now = new Date(2026, 0, 1, 12, 0, 0); // 2026-01-01
    const sessions = [sessionOn(2025, 11, 31), sessionOn(2026, 0, 1)];
    expect(computeStreak(sessions, now)).toBe(2);
  });
});
