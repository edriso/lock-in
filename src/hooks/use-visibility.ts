import { useEffect } from 'react';

interface VisibilityHandlers {
  onHide: (now: number) => void;
  onShow: (now: number) => void;
}

/*
 * A thin hook over the Page Visibility API. All the actual break/recover logic
 * lives in the pure charge reducer (lib/charge.ts); this only forwards the
 * hidden/visible transitions (with a timestamp) when `active` is true.
 */
export function useVisibility(active: boolean, handlers: VisibilityHandlers): void {
  const { onHide, onShow } = handlers;

  useEffect(() => {
    if (!active) {
      return;
    }
    const handler = () => {
      if (document.hidden) {
        onHide(Date.now());
      } else {
        onShow(Date.now());
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [active, onHide, onShow]);
}
