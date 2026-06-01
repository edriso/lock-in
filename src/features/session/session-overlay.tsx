import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/button';
import { Icon } from '@/components/icon';
import { Label } from '@/components/label';
import { useInterval } from '@/hooks/use-interval';
import { useVisibility } from '@/hooks/use-visibility';
import { useWakeLock } from '@/hooks/use-wake-lock';
import {
  createCharge,
  drainTick,
  onHide,
  onShow,
  recoverTick,
  type ChargeState,
} from '@/lib/charge';
import { playChime } from '@/lib/chime';
import { formatClock } from '@/lib/format';
import { HYPE, pick } from '@/lib/hype';
import {
  begin,
  canBank,
  createTimer,
  endAndBank,
  minutesDone,
  progress as progressOf,
  secondsLeft,
  tick,
  togglePause,
  UNLOCK_SECONDS,
  type TimerState,
} from '@/lib/timer';
import type { SessionResult, Strictness } from '@/types/domain';
import { ChargeRing } from './charge-ring';

interface SessionOverlayProps {
  minutes: number;
  subject: string;
  why: string;
  strictness: Strictness;
  /** Abandon without banking. */
  onClose: () => void;
  /** Bank the finished session. */
  onComplete: (result: SessionResult) => void;
}

const FOCUSABLE = 'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])';

export function SessionOverlay({
  minutes,
  subject,
  why,
  strictness,
  onClose,
  onComplete,
}: SessionOverlayProps) {
  const [timer, setTimer] = useState<TimerState>(() => createTimer(minutes));
  const [charge, setCharge] = useState<ChargeState>(createCharge);
  const [seed] = useState(() => Date.now());
  const veilRef = useRef<HTMLDivElement>(null);

  const running = timer.phase === 'run' && timer.running;
  const away = charge.away;

  // One-second tick: advance the timer and slowly recover charge while present.
  useInterval(
    () => {
      setTimer((current) => tick(current));
      setCharge((current) => recoverTick(current));
    },
    running ? 1000 : null,
  );

  // Drain the charge each second while the user is away.
  useInterval(() => setCharge((current) => drainTick(current)), away ? 1000 : null);

  // Leave-detection: forward visibility transitions to the pure charge reducer.
  useVisibility(timer.phase === 'run', {
    onHide: (now) => setCharge((current) => onHide(current, now)),
    onShow: (now) => setCharge((current) => onShow(current, now, strictness)),
  });

  // Keep the screen awake during the run (feature-detected, no-op otherwise).
  useWakeLock(timer.phase === 'run');

  // Soft chime once the session lands on the done screen.
  useEffect(() => {
    if (timer.phase === 'done') {
      playChime();
    }
  }, [timer.phase]);

  // Focus management + Escape to abandon.
  useEffect(() => {
    const container = veilRef.current;
    if (!container) {
      return;
    }
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const getFocusable = (): HTMLElement[] =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => !element.hasAttribute('disabled'),
      );
    (getFocusable()[0] ?? container).focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab') {
        return;
      }
      const items = getFocusable();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    container.addEventListener('keydown', onKeyDown);
    return () => {
      container.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  const veilStyle = {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 70,
    background: away ? 'color-mix(in oklab, var(--danger) 8%, var(--bg))' : 'var(--bg)',
    display: 'flex',
    flexDirection: 'column' as const,
    transition: 'background .4s ease',
  };

  const ringSize = Math.min(320, (typeof window !== 'undefined' ? window.innerWidth : 360) - 80);

  // ---------- PROMISE GATE (the 2-minute rule) ----------
  if (timer.phase === 'promise') {
    return (
      <div
        ref={veilRef}
        role="dialog"
        aria-modal="true"
        aria-label="Lock in"
        tabIndex={-1}
        className="li-veil"
        style={veilStyle}
      >
        <div style={{ position: 'absolute', top: 16, insetInlineStart: 16 }}>
          <button onClick={onClose} className="li-iconbtn li-tap" type="button" aria-label="Back">
            <Icon name="x" size={20} />
          </button>
        </div>
        <div style={centeredColumn}>
          <Label style={{ marginBottom: 22 }}>The deal</Label>
          <h1 style={promiseHeading}>
            Just <span style={{ color: 'var(--accent)' }}>two minutes</span>.
          </h1>
          <p
            style={{
              color: 'var(--text-dim)',
              fontSize: 17,
              lineHeight: 1.55,
              margin: '0 0 14px',
              textWrap: 'pretty',
            }}
          >
            Open your notes and start. After two minutes you&rsquo;re free to stop — but you
            won&rsquo;t. Starting is the whole battle.
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              color: 'var(--text-faint)',
              fontSize: 14,
              margin: '8px 0 32px',
            }}
          >
            <Icon name="phone" size={17} /> Put your phone across the room first.
          </div>
          <Button
            onClick={() => setTimer(begin)}
            variant="primary"
            size="xl"
            icon="lock"
            style={{ width: '100%', maxWidth: 320 }}
          >
            I&rsquo;m in
          </Button>
          <div
            style={{
              marginTop: 18,
              fontFamily: 'var(--mono)',
              fontSize: 12.5,
              color: 'var(--text-faint)',
            }}
          >
            {minutes} MIN · {subject ? subject.toUpperCase() : 'DEEP WORK'}
          </div>
        </div>
      </div>
    );
  }

  // ---------- DONE ----------
  if (timer.phase === 'done') {
    const clean = !charge.broke;
    const line = clean ? pick(HYPE.doneClean, seed) : pick(HYPE.doneBroke, seed);
    return (
      <div
        ref={veilRef}
        role="dialog"
        aria-modal="true"
        aria-label="Session complete"
        tabIndex={-1}
        className="li-veil"
        style={veilStyle}
      >
        <div style={centeredColumn}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              marginBottom: 24,
              background: clean
                ? 'var(--accent-soft)'
                : 'color-mix(in oklab, var(--danger) 16%, transparent)',
              color: clean ? 'var(--accent)' : 'var(--danger)',
            }}
          >
            <Icon name={clean ? 'bolt' : 'flame'} size={48} />
          </div>
          <Label style={{ marginBottom: 12 }}>
            {clean ? 'Clean lock' : 'Locked, with a wobble'}
          </Label>
          <h1 style={doneHeading}>{minutesDone(timer)} minutes, done.</h1>
          <p
            style={{
              color: 'var(--text-dim)',
              fontSize: 16.5,
              lineHeight: 1.55,
              margin: '0 0 30px',
              textWrap: 'pretty',
            }}
          >
            {line}
          </p>
          <Button
            onClick={() => onComplete({ minutes: minutesDone(timer), subject, clean })}
            variant="primary"
            size="lg"
            icon="check"
            style={{ minWidth: 220 }}
          >
            Bank it
          </Button>
        </div>
      </div>
    );
  }

  // ---------- RUN (locked in) ----------
  const elapsed = timer.elapsed;
  return (
    <div
      ref={veilRef}
      role="dialog"
      aria-modal="true"
      aria-label="Locked in"
      tabIndex={-1}
      className="li-veil"
      style={veilStyle}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
        }}
      >
        <button onClick={onClose} className="li-iconbtn li-tap" type="button" aria-label="Give up">
          <Icon name="x" size={20} />
        </button>
        <Label>{subject ? subject : 'Locked in'}</Label>
        <div style={{ width: 42 }} />
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <ChargeRing
          progress={progressOf(timer)}
          charge={charge.charge}
          broken={away}
          size={ringSize}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 'clamp(44px,12vw,62px)',
                fontWeight: 500,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                color: 'var(--text)',
              }}
            >
              {formatClock(secondsLeft(timer))}
            </div>
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                letterSpacing: '0.16em',
                color: 'var(--text-faint)',
                marginTop: 12,
                textTransform: 'uppercase',
              }}
            >
              {away ? '← get back here' : 'locked in'}
            </div>
          </div>
        </ChargeRing>

        <div style={{ marginTop: 36, textAlign: 'center', minHeight: 48, maxWidth: 360 }}>
          {away ? (
            <div
              className="li-fade"
              style={{
                color: 'var(--danger)',
                fontSize: 16,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                justifyContent: 'center',
              }}
            >
              <Icon name="skull" size={19} /> Charge draining. Come back.
            </div>
          ) : why ? (
            <p
              style={{
                fontFamily: 'var(--display)',
                fontStyle: 'italic',
                fontSize: 17,
                color: 'var(--text-dim)',
                margin: 0,
                lineHeight: 1.5,
                textWrap: 'pretty',
              }}
            >
              &ldquo;{why}&rdquo;
            </p>
          ) : (
            <p style={{ fontSize: 15.5, color: 'var(--text-faint)', margin: 0, lineHeight: 1.5 }}>
              {elapsed >= UNLOCK_SECONDS ? pick(HYPE.midway, seed) : pick(HYPE.start, seed)}
            </p>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 12,
          padding: '0 24px calc(36px + env(safe-area-inset-bottom))',
        }}
      >
        <Button
          onClick={() => setTimer(togglePause)}
          variant="ghost"
          size="lg"
          icon={timer.running ? 'pause' : 'play'}
        >
          {timer.running ? 'Pause' : 'Resume'}
        </Button>
        {canBank(timer) && (
          <Button onClick={() => setTimer(endAndBank)} variant="soft" size="lg" icon="check">
            End &amp; bank
          </Button>
        )}
      </div>
    </div>
  );
}

const centeredColumn = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center' as const,
  padding: 30,
  maxWidth: 460,
  margin: '0 auto',
};

const promiseHeading = {
  fontFamily: 'var(--display)',
  fontWeight: 700,
  fontSize: 'clamp(30px,8vw,42px)',
  letterSpacing: '-0.03em',
  lineHeight: 1.05,
  margin: '0 0 18px',
};

const doneHeading = {
  fontFamily: 'var(--display)',
  fontWeight: 700,
  fontSize: 'clamp(28px,7vw,38px)',
  letterSpacing: '-0.02em',
  margin: '0 0 12px',
};
