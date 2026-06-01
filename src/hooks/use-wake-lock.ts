import { useEffect } from 'react';

/*
 * Keeps the screen awake during a session via the Screen Wake Lock API, so a
 * phone left on its stand does not sleep mid-session. Feature-detected and
 * fully guarded — it is a no-op where unsupported, and re-acquires the lock if
 * the page becomes visible again (the browser releases it when hidden).
 */
interface WakeLockSentinelLike {
  release: () => Promise<void>;
}

interface WakeLockLike {
  request: (type: 'screen') => Promise<WakeLockSentinelLike>;
}

export function useWakeLock(active: boolean): void {
  useEffect(() => {
    const wakeLock = (navigator as Navigator & { wakeLock?: WakeLockLike }).wakeLock;
    if (!active || !wakeLock) {
      return;
    }

    let sentinel: WakeLockSentinelLike | null = null;
    let released = false;

    const request = async () => {
      try {
        sentinel = await wakeLock.request('screen');
      } catch {
        // Denied or unsupported in this context; fall back silently.
      }
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible' && !released) {
        void request();
      }
    };

    void request();
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      released = true;
      document.removeEventListener('visibilitychange', onVisible);
      void sentinel?.release().catch(() => {});
    };
  }, [active]);
}
