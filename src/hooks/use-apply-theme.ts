import { useEffect } from 'react';
import { useLockInStore } from '@/store/lockin-store';

/** Reflects the theme and accent onto <html> so the palette swaps everywhere. */
export function useApplyTheme(): void {
  const theme = useLockInStore((state) => state.settings.theme);
  const accent = useLockInStore((state) => state.settings.accent);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.setProperty('--accent', accent);
  }, [theme, accent]);
}
