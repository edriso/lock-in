import type { Session } from '@/types/domain';
import { addDays, dayKey } from './date';

/*
 * Streak = consecutive days with at least one session, ending today or
 * yesterday. It is a chain of DAYS, not hours — honest and loss-averse, never a
 * vanity time-count. Multiple sessions on one day count once; a missed day
 * breaks it. Pure, so the today/yesterday anchor and the month/year/midnight
 * edges are easy to test.
 */
export function computeStreak(sessions: Session[], now: Date = new Date()): number {
  if (sessions.length === 0) {
    return 0;
  }
  const days = new Set(sessions.map((session) => dayKey(new Date(session.at))));

  // Anchor on today if studied today, else yesterday; otherwise the chain is broken.
  const todayKey = dayKey(now);
  const yesterdayKey = dayKey(addDays(now, -1));
  let anchor: Date;
  if (days.has(todayKey)) {
    anchor = now;
  } else if (days.has(yesterdayKey)) {
    anchor = addDays(now, -1);
  } else {
    return 0;
  }

  let count = 0;
  for (let i = 0; i < 400; i += 1) {
    if (days.has(dayKey(addDays(anchor, -i)))) {
      count += 1;
    } else {
      break;
    }
  }
  return count;
}
