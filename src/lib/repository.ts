import {
  type PersistedState,
  persistedStateSchema,
  type Session,
  type Settings,
} from '@/types/domain';
import { dayKey } from './date';
import { computeStreak } from './streak';

/*
 * The persistence seam. Components and the store never touch storage directly;
 * they go through this typed interface, backed by localStorage. Saved data is
 * parsed with Zod, so a corrupt, partial, or out-of-date shape safely falls
 * back to sensible defaults instead of crashing.
 */

const STORAGE_KEY = 'lockin-v1';

export function createDefaultState(): PersistedState {
  return {
    version: 1,
    settings: {
      duration: 25,
      strictness: 'normal',
      theme: 'dark',
      accent: '#58e08c',
      showWhy: true,
    },
    app: {
      sessions: [],
      streak: 0,
      lastDay: null,
      why: '',
    },
  };
}

export interface Repository {
  getState(): PersistedState;
  saveState(state: PersistedState): void;
  setSettings(patch: Partial<Settings>): PersistedState;
  /** Logs a finished session, recomputes the streak, and persists. */
  completeSession(session: Session, now?: Date): PersistedState;
  setWhy(why: string): PersistedState;
  clear(): void;
}

export function createLocalStorageRepository(storage: Storage = localStorage): Repository {
  function read(): PersistedState {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) {
        return createDefaultState();
      }
      const parsed = persistedStateSchema.safeParse(JSON.parse(raw));
      return parsed.success ? parsed.data : createDefaultState();
    } catch {
      return createDefaultState();
    }
  }

  function getState(): PersistedState {
    return read();
  }

  function saveState(state: PersistedState): void {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be unavailable (private mode, quota). The app still works
      // for this session; we just cannot persist.
    }
  }

  function setSettings(patch: Partial<Settings>): PersistedState {
    const current = read();
    const next: PersistedState = { ...current, settings: { ...current.settings, ...patch } };
    saveState(next);
    return next;
  }

  function completeSession(session: Session, now: Date = new Date()): PersistedState {
    const current = read();
    const sessions = [...current.app.sessions, session];
    const next: PersistedState = {
      ...current,
      app: {
        ...current.app,
        sessions,
        streak: computeStreak(sessions, now),
        lastDay: dayKey(now),
      },
    };
    saveState(next);
    return next;
  }

  function setWhy(why: string): PersistedState {
    const current = read();
    const next: PersistedState = { ...current, app: { ...current.app, why } };
    saveState(next);
    return next;
  }

  function clear(): void {
    try {
      storage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors.
    }
  }

  return { getState, saveState, setSettings, completeSession, setWhy, clear };
}

export const repository: Repository = createLocalStorageRepository();
