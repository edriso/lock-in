import { useState } from 'react';
import { Button } from '@/components/button';
import { Icon } from '@/components/icon';
import { Label } from '@/components/label';
import { addDays, dayKey } from '@/lib/date';
import { formatMinutes } from '@/lib/format';
import { computeStreak } from '@/lib/streak';
import { SessionOverlay } from '@/features/session/session-overlay';
import { useLockInStore } from '@/store/lockin-store';
import { DURATIONS, type Duration, type SessionResult } from '@/types/domain';

interface ActiveSession {
  minutes: number;
  subject: string;
  why: string;
}

export function HomeScreen() {
  const settings = useLockInStore((state) => state.settings);
  const app = useLockInStore((state) => state.app);
  const completeSession = useLockInStore((state) => state.completeSession);
  const setWhy = useLockInStore((state) => state.setWhy);

  const [duration, setDuration] = useState<Duration>(settings.duration);
  const [subject, setSubject] = useState('');
  const [why, setWhyDraft] = useState(app.why);
  const [session, setSession] = useState<ActiveSession | null>(null);

  const now = new Date();
  const todayKey = dayKey(now);
  const streak = computeStreak(app.sessions, now);
  const todaySessions = app.sessions.filter((s) => dayKey(new Date(s.at)) === todayKey);
  const weekStart = addDays(now, -6);
  const weekSecs = app.sessions
    .filter((s) => new Date(s.at) >= weekStart)
    .reduce((total, s) => total + s.minutes * 60, 0);

  const chain = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(now, -(6 - i));
    const key = dayKey(date);
    return {
      key,
      has: app.sessions.some((s) => dayKey(new Date(s.at)) === key),
      label: date.toLocaleDateString(undefined, { weekday: 'narrow' }),
      isToday: key === todayKey,
    };
  });

  function start() {
    setSession({
      minutes: duration,
      subject: subject.trim(),
      why: settings.showWhy ? why.trim() : '',
    });
  }

  function bank(result: SessionResult) {
    setWhy(why.trim());
    completeSession(result);
    setSession(null);
  }

  return (
    <main className="li-main">
      <div className="li-col">
        <div className="li-brand">
          <span className="li-logo">
            <Icon name="lock" size={19} />
          </span>
          <span>Lock In</span>
        </div>

        {/* Streak headline */}
        <div className="li-streak">
          <div className="li-streak-num">
            <Icon
              name="flame"
              size={30}
              style={{ color: streak > 0 ? 'var(--accent)' : 'var(--text-faint)' }}
            />
            <span>{streak}</span>
          </div>
          <div className="li-streak-label">
            {streak === 1 ? 'day' : 'days'} locked in
            {streak > 0 ? ' — don’t break it' : ' — start today'}
          </div>
          <div className="li-chain">
            {chain.map((day) => (
              <div key={day.key} className="li-chain-day">
                <div
                  className={
                    'li-chain-dot' + (day.has ? ' is-on' : '') + (day.isToday ? ' is-today' : '')
                  }
                >
                  {day.has && <Icon name="check" size={14} stroke={2.4} />}
                </div>
                <span>{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* The start console */}
        <div className="li-console">
          <Label style={{ marginBottom: 14 }}>Session length</Label>
          <div className="li-durs">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={'li-dur li-tap' + (duration === d ? ' is-on' : '')}
                aria-pressed={duration === d}
              >
                {d}
                <span>min</span>
              </button>
            ))}
          </div>

          <input
            className="li-field"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What are you locking in on? (optional)"
            aria-label="What are you locking in on?"
            maxLength={40}
          />
          {settings.showWhy && (
            <input
              className="li-field"
              value={why}
              onChange={(e) => setWhyDraft(e.target.value)}
              placeholder="Why does it matter? (shows mid-session)"
              aria-label="Why does it matter?"
              maxLength={60}
            />
          )}

          <Button
            onClick={start}
            variant="primary"
            size="xl"
            icon="lock"
            style={{ width: '100%', marginTop: 6 }}
          >
            Lock In
          </Button>
          <div className="li-console-sub">Phone down. {duration} minutes. No exits.</div>
        </div>

        {/* Week stat + today */}
        <div className="li-stats">
          <div className="li-stat">
            <div className="li-stat-num">
              {formatMinutes(weekSecs)}
              <span>min</span>
            </div>
            <div className="li-stat-label">locked in this week</div>
          </div>
          <div className="li-stat">
            <div className="li-stat-num">{todaySessions.length}</div>
            <div className="li-stat-label">
              {todaySessions.length === 1 ? 'session' : 'sessions'} today
            </div>
          </div>
        </div>

        {/* Recent log */}
        {app.sessions.length > 0 && (
          <div className="li-log">
            <Label style={{ marginBottom: 12 }}>Recent</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {app.sessions
                .slice()
                .reverse()
                .slice(0, 5)
                .map((s) => (
                  <div key={s.id} className="li-log-row">
                    <span className={'li-log-dot' + (s.clean ? ' is-clean' : '')}>
                      <Icon name={s.clean ? 'bolt' : 'flame'} size={15} />
                    </span>
                    <span className="li-log-main">{s.subject || 'Deep work'}</span>
                    <span className="li-log-meta">
                      {formatMinutes(s.minutes * 60)}m ·{' '}
                      {new Date(s.at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <p className="li-foot">
          Built on what actually works: start small, guard your attention, keep the chain. No shame
          if you slip — just lock back in.
        </p>
      </div>

      {session && (
        <SessionOverlay
          minutes={session.minutes}
          subject={session.subject}
          why={session.why}
          strictness={settings.strictness}
          onClose={() => setSession(null)}
          onComplete={bank}
        />
      )}
    </main>
  );
}
