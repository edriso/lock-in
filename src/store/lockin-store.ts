import { create } from 'zustand';
import { repository } from '@/lib/repository';
import { computeStreak } from '@/lib/streak';
import type {
  Accent,
  AppState,
  Duration,
  SessionResult,
  Settings,
  Strictness,
  Theme,
} from '@/types/domain';

interface LockInState {
  settings: Settings;
  app: AppState;
  /** Derived: the current streak (consecutive days), recomputed on changes. */
  streak: () => number;
  // Banking a finished session.
  completeSession: (result: SessionResult) => void;
  // The remembered "why" intention.
  setWhy: (why: string) => void;
  // Settings actions.
  setDuration: (duration: Duration) => void;
  setStrictness: (strictness: Strictness) => void;
  setTheme: (theme: Theme) => void;
  setAccent: (accent: Accent) => void;
  setShowWhy: (show: boolean) => void;
}

const initial = repository.getState();

let idCounter = 0;
function newId(): string {
  idCounter += 1;
  return `s${Date.now()}-${idCounter}`;
}

export const useLockInStore = create<LockInState>((set, get) => {
  function patchSettings(patch: Partial<Settings>): void {
    set({ settings: repository.setSettings(patch).settings });
  }

  return {
    settings: initial.settings,
    app: initial.app,

    streak: () => computeStreak(get().app.sessions),

    completeSession: (result) => {
      const session = {
        id: newId(),
        at: Date.now(),
        minutes: result.minutes,
        subject: result.subject,
        clean: result.clean,
      };
      set({ app: repository.completeSession(session).app });
    },

    setWhy: (why) => set({ app: repository.setWhy(why).app }),

    setDuration: (duration) => patchSettings({ duration }),
    setStrictness: (strictness) => patchSettings({ strictness }),
    setTheme: (theme) => patchSettings({ theme }),
    setAccent: (accent) => patchSettings({ accent }),
    setShowWhy: (showWhy) => patchSettings({ showWhy }),
  };
});
