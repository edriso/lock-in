import type { ReactNode } from 'react';

interface ChargeRingProps {
  /** Session progress, 0..1 (drives the ring sweep and core size). */
  progress?: number;
  /** Focus charge, 0..1 (drives the core's glow and opacity). */
  charge?: number;
  /** When true, the core dims and the color shifts to danger. */
  broken?: boolean;
  size?: number;
  children?: ReactNode;
}

/**
 * The signature visual: an SVG progress ring around a glowing radial-gradient
 * core that scales and intensifies as the session proceeds and softly pulses.
 * When the user is away it dims and turns danger-red. The pulse is dropped under
 * prefers-reduced-motion (via the .li-pulse keyframes being disabled in CSS).
 */
export function ChargeRing({
  progress = 0,
  charge = 1,
  broken = false,
  size = 300,
  children,
}: ChargeRingProps) {
  const thickness = 5;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(1, progress)));
  const color = broken ? 'var(--danger)' : 'var(--accent)';
  const coreSize = size * (0.42 + 0.12 * progress);

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <div
        className={broken ? undefined : 'li-pulse'}
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: coreSize,
          height: coreSize,
          borderRadius: '50%',
          background: `radial-gradient(circle at 42% 38%, color-mix(in oklab, ${color} 70%, white) 0%, ${color} 45%, color-mix(in oklab, ${color} 30%, transparent) 100%)`,
          opacity: broken ? 0.25 : 0.35 + 0.5 * charge,
          filter: `blur(${broken ? 6 : 2}px)`,
          boxShadow: broken
            ? 'none'
            : `0 0 ${40 + 60 * charge}px color-mix(in oklab, ${color} ${40 * charge}%, transparent)`,
          transition:
            'opacity .5s ease, width .8s ease, height .8s ease, box-shadow .5s ease, filter .4s ease',
        }}
      />
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)', position: 'relative' }}
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--line)"
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s linear, stroke .4s ease',
            filter: `drop-shadow(0 0 6px color-mix(in oklab, ${color} 60%, transparent))`,
          }}
        />
      </svg>
      {children != null && (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          {children}
        </div>
      )}
    </div>
  );
}
