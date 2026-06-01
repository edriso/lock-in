import { beforeEach, describe, expect, it } from 'vitest';
import type { Session } from '@/types/domain';
import { createLocalStorageRepository, type Repository } from './repository';

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  } as Storage;
}

const NOW = new Date(2026, 2, 10, 12, 0, 0);

function session(at: number, clean = true): Session {
  return { id: `s${at}`, at, minutes: 25, subject: 'Math', clean };
}

describe('localStorage repository', () => {
  let repo: Repository;
  let storage: Storage;

  beforeEach(() => {
    storage = memoryStorage();
    repo = createLocalStorageRepository(storage);
  });

  it('returns sensible defaults when nothing is stored', () => {
    const state = repo.getState();
    expect(state.version).toBe(1);
    expect(state.settings.duration).toBe(25);
    expect(state.settings.strictness).toBe('normal');
    expect(state.app.sessions).toEqual([]);
    expect(state.app.streak).toBe(0);
  });

  it('falls back to defaults on corrupt JSON', () => {
    storage.setItem('lockin-v1', 'not json');
    expect(repo.getState().settings.accent).toBe('#58e08c');
  });

  it('falls back to defaults on a valid-JSON but wrong shape', () => {
    storage.setItem('lockin-v1', JSON.stringify({ version: 1, settings: {} }));
    expect(repo.getState().settings.theme).toBe('dark');
  });

  it('rejects an invalid duration as a wrong shape', () => {
    storage.setItem(
      'lockin-v1',
      JSON.stringify({
        version: 1,
        settings: {
          duration: 30,
          strictness: 'normal',
          theme: 'dark',
          accent: '#58e08c',
          showWhy: true,
        },
        app: { sessions: [], streak: 0, lastDay: null, why: '' },
      }),
    );
    expect(repo.getState().settings.duration).toBe(25);
  });

  it('round-trips settings', () => {
    repo.setSettings({ strictness: 'strict', accent: '#7d8be0' });
    const after = repo.getState();
    expect(after.settings.strictness).toBe('strict');
    expect(after.settings.accent).toBe('#7d8be0');
  });

  it('completes a session: logs it, updates streak and lastDay', () => {
    const next = repo.completeSession(session(NOW.getTime()), NOW);
    expect(next.app.sessions).toHaveLength(1);
    expect(next.app.streak).toBe(1);
    expect(next.app.lastDay).toBe('2026-03-10');
  });

  it('remembers the why', () => {
    expect(repo.setWhy('finals').app.why).toBe('finals');
    expect(repo.getState().app.why).toBe('finals');
  });
});
