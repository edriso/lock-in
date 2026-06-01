import { describe, expect, it } from 'vitest';
import { createCharge, drainTick, graceSeconds, onHide, onShow, recoverTick } from './charge';

describe('graceSeconds', () => {
  it('maps strictness to grace windows', () => {
    expect(graceSeconds('strict')).toBe(3);
    expect(graceSeconds('normal')).toBe(7);
    expect(graceSeconds('gentle')).toBe(12);
  });
});

describe('leave / charge reducer', () => {
  it('forgives a brief blip under the grace window', () => {
    const left = onHide(createCharge(), 10_000);
    const back = onShow(left, 14_000, 'normal'); // gone 4s < 7s grace
    expect(back.broke).toBe(false);
    expect(back.charge).toBe(1);
    expect(back.away).toBe(false);
  });

  it('breaks and drops charge when gone past the grace window', () => {
    const left = onHide(createCharge(), 10_000);
    const back = onShow(left, 20_000, 'normal'); // gone 10s > 7s grace
    expect(back.broke).toBe(true);
    expect(back.charge).toBeCloseTo(0.65); // 1 - 0.35
  });

  it('bites harder under strict', () => {
    const left = onHide(createCharge(), 0);
    const back = onShow(left, 5_000, 'strict'); // gone 5s > 3s grace
    expect(back.broke).toBe(true);
    expect(back.charge).toBeCloseTo(0.4); // 1 - 0.6
  });

  it('does not break a 5s absence under gentle', () => {
    const left = onHide(createCharge(), 0);
    const back = onShow(left, 5_000, 'gentle'); // gone 5s < 12s grace
    expect(back.broke).toBe(false);
  });

  it('drains while away and recovers while present, clamped to 0..1', () => {
    const away = { ...createCharge(), away: true, charge: 0.1 };
    expect(drainTick(away).charge).toBeCloseTo(0.06);
    // Cannot drop below 0.
    expect(drainTick({ ...away, charge: 0.02 }).charge).toBe(0);

    const present = { ...createCharge(), charge: 0.5 };
    expect(recoverTick(present).charge).toBeCloseTo(0.52);
    // Cannot rise above 1, and does not recover while away.
    expect(recoverTick({ ...present, charge: 0.99 }).charge).toBe(1);
    expect(recoverTick(away).charge).toBe(0.1);
  });

  it('keeps broke=true once broken, even after returning cleanly', () => {
    let state = onHide(createCharge(), 0);
    state = onShow(state, 10_000, 'normal'); // breaks
    state = onHide(state, 20_000);
    state = onShow(state, 21_000, 'normal'); // brief, would be clean
    expect(state.broke).toBe(true);
  });
});
