import { describe, expect, it } from 'vitest';
import {
  begin,
  canBank,
  createTimer,
  endAndBank,
  minutesDone,
  progress,
  secondsLeft,
  tick,
  togglePause,
  type TimerState,
} from './timer';

function run(minutes = 25): TimerState {
  return begin(createTimer(minutes));
}

function advance(state: TimerState, seconds: number): TimerState {
  let next = state;
  for (let i = 0; i < seconds; i += 1) {
    next = tick(next);
  }
  return next;
}

describe('timer state machine', () => {
  it('starts at the promise gate and begins on demand', () => {
    const created = createTimer(25);
    expect(created.phase).toBe('promise');
    expect(begin(created).phase).toBe('run');
  });

  it('does not count down while at the promise gate', () => {
    const created = createTimer(25);
    expect(tick(created)).toEqual(created);
  });

  it('counts down second by second once running', () => {
    const state = advance(run(25), 10);
    expect(state.elapsed).toBe(10);
    expect(secondsLeft(state)).toBe(25 * 60 - 10);
  });

  it('pauses and resumes', () => {
    const paused = togglePause(advance(run(25), 5));
    expect(paused.running).toBe(false);
    expect(advance(paused, 10).elapsed).toBe(5); // no progress while paused
    expect(togglePause(paused).running).toBe(true);
  });

  it('unlocks "End & bank" only after two minutes', () => {
    expect(canBank(advance(run(25), 119))).toBe(false);
    expect(canBank(advance(run(25), 120))).toBe(true);
  });

  it('refuses to end-and-bank before the unlock', () => {
    const early = advance(run(25), 30);
    expect(endAndBank(early).phase).toBe('run');
    const late = advance(run(25), 120);
    expect(endAndBank(late).phase).toBe('done');
  });

  it('finishes naturally at zero', () => {
    const state = advance(run(1), 60); // 1-minute session
    expect(state.phase).toBe('done');
    expect(state.elapsed).toBe(60);
    expect(progress(state)).toBe(1);
  });

  it('reports whole minutes done', () => {
    expect(minutesDone(advance(run(25), 150))).toBe(3); // 150s rounds to 3 min
  });
});
