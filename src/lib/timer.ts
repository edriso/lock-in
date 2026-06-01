import type { SessionPhase } from '@/types/domain';

/*
 * The session timer state machine — pure, so the countdown, pause/resume, the
 * 2-minute "End & bank" unlock, and the natural finish at zero are all testable
 * without React or real time. The component drives it one tick (one second) at
 * a time and renders the result.
 */

/** Seconds that must elapse before "End & bank" appears (the 2-minute promise). */
export const UNLOCK_SECONDS = 120;

export interface TimerState {
  phase: SessionPhase;
  total: number; // total seconds for the session
  elapsed: number; // seconds elapsed
  running: boolean;
}

export function createTimer(minutes: number): TimerState {
  return { phase: 'promise', total: minutes * 60, elapsed: 0, running: true };
}

/** Leave the promise gate and begin the run. */
export function begin(state: TimerState): TimerState {
  if (state.phase !== 'promise') {
    return state;
  }
  return { ...state, phase: 'run', running: true };
}

/** Advance by one second. Completes naturally when the time is up. */
export function tick(state: TimerState): TimerState {
  if (state.phase !== 'run' || !state.running) {
    return state;
  }
  const elapsed = state.elapsed + 1;
  if (elapsed >= state.total) {
    return { ...state, elapsed: state.total, phase: 'done', running: false };
  }
  return { ...state, elapsed };
}

export function togglePause(state: TimerState): TimerState {
  if (state.phase !== 'run') {
    return state;
  }
  return { ...state, running: !state.running };
}

/** End early and bank — only allowed once the 2-minute promise is met. */
export function endAndBank(state: TimerState): TimerState {
  if (state.phase !== 'run' || !canBank(state)) {
    return state;
  }
  return { ...state, phase: 'done', running: false };
}

/** True once enough time has elapsed to honor the 2-minute promise. */
export function canBank(state: TimerState): boolean {
  return state.elapsed >= UNLOCK_SECONDS;
}

export function secondsLeft(state: TimerState): number {
  return Math.max(0, state.total - state.elapsed);
}

export function progress(state: TimerState): number {
  if (state.total <= 0) {
    return 1;
  }
  return Math.max(0, Math.min(1, state.elapsed / state.total));
}

/** Whole minutes elapsed, for banking. */
export function minutesDone(state: TimerState): number {
  return Math.round(state.elapsed / 60);
}
