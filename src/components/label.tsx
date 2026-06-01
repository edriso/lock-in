import type { CSSProperties, ReactNode } from 'react';

/** A small mono, wide-tracked uppercase label. */
export function Label({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontFamily: 'var(--mono)',
        fontSize: 11.5,
        fontWeight: 500,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: 'var(--text-faint)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
