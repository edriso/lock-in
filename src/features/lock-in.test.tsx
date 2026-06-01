import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '@/App';
import { createDefaultState } from '@/lib/repository';
import { useLockInStore } from '@/store/lockin-store';

// jsdom has no real visibility; drive document.hidden / visibilityState ourselves.
let hidden = false;
beforeAll(() => {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => (hidden ? 'hidden' : 'visible'),
  });
});

function setHidden(value: boolean) {
  hidden = value;
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
}

function reset() {
  localStorage.clear();
  hidden = false;
  const defaults = createDefaultState();
  useLockInStore.setState({ settings: defaults.settings, app: defaults.app });
}

beforeEach(() => {
  reset();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function advance(seconds: number) {
  act(() => {
    vi.advanceTimersByTime(seconds * 1000);
  });
}

function lockIn() {
  fireEvent.click(screen.getByRole('button', { name: 'Lock In' }));
  fireEvent.click(screen.getByRole('button', { name: /I.?m in/ }));
}

describe('the lock-in loop', () => {
  it('goes promise → run and only unlocks "End & bank" after two minutes', () => {
    render(<App />);
    lockIn();

    expect(screen.getByText('locked in')).toBeInTheDocument();
    advance(119);
    expect(screen.queryByRole('button', { name: /End & bank/ })).not.toBeInTheDocument();

    advance(1); // crosses 120s
    expect(screen.getByRole('button', { name: /End & bank/ })).toBeInTheDocument();
  });

  it('pauses and resumes', () => {
    render(<App />);
    lockIn();
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
  });

  it('banks a clean session and bumps the streak and log', () => {
    render(<App />);
    lockIn();
    advance(120);
    fireEvent.click(screen.getByRole('button', { name: /End & bank/ }));

    expect(screen.getByText('Clean lock')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Bank it' }));

    const state = useLockInStore.getState();
    expect(state.app.sessions).toHaveLength(1);
    expect(state.app.sessions[0].clean).toBe(true);
    expect(state.streak()).toBe(1);
    expect(screen.getByText('Deep work')).toBeInTheDocument();
  });

  it('marks the session broken when the user leaves past the grace window', () => {
    render(<App />);
    lockIn();

    // Leave for 10s (> 7s normal grace) → broken.
    setHidden(true);
    expect(screen.getByText(/get back here/)).toBeInTheDocument();
    advance(10);
    setHidden(false);

    advance(120);
    fireEvent.click(screen.getByRole('button', { name: /End & bank/ }));

    expect(screen.getByText('Locked, with a wobble')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Bank it' }));
    expect(useLockInStore.getState().app.sessions[0].clean).toBe(false);
  });

  it('forgives a brief blip under the grace window', () => {
    render(<App />);
    lockIn();

    setHidden(true);
    advance(3); // < 7s
    setHidden(false);

    advance(120);
    fireEvent.click(screen.getByRole('button', { name: /End & bank/ }));
    expect(screen.getByText('Clean lock')).toBeInTheDocument();
  });
});

describe('settings', () => {
  it('changes strictness from the settings panel', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    fireEvent.click(screen.getByRole('button', { name: 'strict' }));
    expect(useLockInStore.getState().settings.strictness).toBe('strict');
  });

  it('toggles the theme on the document element', () => {
    render(<App />);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    fireEvent.click(screen.getByRole('button', { name: 'Toggle theme' }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
