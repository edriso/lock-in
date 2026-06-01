import type { Strictness } from '@/types/domain';

/*
 * The leave/charge reducer — the commitment device, modelled as loss aversion.
 * You build a "charge" by staying present; bailing to your phone past a short
 * grace window marks the session BROKEN and drops the charge. Returning lets it
 * recover. Pure, so the grace windows and the break/no-break edges are testable.
 *
 * IMPORTANT — laptop vs. mobile. This is designed for the realistic setup:
 * studying on a laptop with the phone as the temptation, where switching to a
 * YouTube tab fires `visibilitychange` and is fairly "caught." On a phone,
 * locking the screen ALSO fires `visibilitychange`, so we keep the penalty
 * modest and lean on the physical "phone across the room" instruction plus the
 * Wake Lock API rather than punishing a screen-lock harshly.
 */

export interface ChargeState {
  charge: number; // 0..1 focus charge
  away: boolean; // currently hidden / switched away
  broke: boolean; // has this session ever been broken
  hiddenAt: number | null; // timestamp (ms) when the user left, if away
}

/** Grace window, in seconds, before leaving counts as a break. */
export function graceSeconds(strictness: Strictness): number {
  switch (strictness) {
    case 'strict':
      return 3;
    case 'gentle':
      return 12;
    default:
      return 7;
  }
}

/** How much charge a break costs — strict bites harder. */
function breakPenalty(strictness: Strictness): number {
  return strictness === 'strict' ? 0.6 : 0.35;
}

export function createCharge(): ChargeState {
  return { charge: 1, away: false, broke: false, hiddenAt: null };
}

/** The user left (tab/app hidden): mark away and remember when. */
export function onHide(state: ChargeState, now: number): ChargeState {
  return { ...state, away: true, hiddenAt: now };
}

/**
 * The user came back. If they were gone longer than the grace window, the
 * session breaks and the charge takes a hit; otherwise a brief blip is forgiven.
 */
export function onShow(state: ChargeState, now: number, strictness: Strictness): ChargeState {
  const goneSeconds = state.hiddenAt !== null ? (now - state.hiddenAt) / 1000 : 0;
  const broken = goneSeconds > graceSeconds(strictness);
  return {
    charge: broken ? clamp(state.charge - breakPenalty(strictness)) : state.charge,
    away: false,
    broke: state.broke || broken,
    hiddenAt: null,
  };
}

/** One second of draining while the user is away. */
export function drainTick(state: ChargeState): ChargeState {
  if (!state.away) {
    return state;
  }
  return { ...state, charge: clamp(state.charge - 0.04) };
}

/** One second of slow recovery while the user is present. */
export function recoverTick(state: ChargeState): ChargeState {
  if (state.away) {
    return state;
  }
  return { ...state, charge: clamp(state.charge + 0.02) };
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}
