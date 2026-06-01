import type { CSSProperties, ReactElement } from 'react';

export type IconName =
  | 'lock'
  | 'bolt'
  | 'play'
  | 'pause'
  | 'check'
  | 'x'
  | 'flame'
  | 'target'
  | 'clock'
  | 'chevR'
  | 'chevL'
  | 'plus'
  | 'arrow'
  | 'phone'
  | 'sun'
  | 'moon'
  | 'skull'
  | 'sliders';

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  style?: CSSProperties;
}

/** The inline-SVG icon set, ported from the prototype. Decorative by default. */
export function Icon({ name, size = 22, stroke = 1.8, style }: IconProps): ReactElement {
  const p = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  const paths: Record<IconName, ReactElement> = {
    lock: (
      <>
        <rect {...p} x="5" y="10.5" width="14" height="9.5" rx="2.2" />
        <path {...p} d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
        <circle cx="12" cy="15" r="1.3" fill="currentColor" />
      </>
    ),
    bolt: <path {...p} d="M13 3 5 13h6l-1 8 8-10h-6z" />,
    play: <path {...p} d="M9 6.5 17 12l-8 5.5z" />,
    pause: <path {...p} d="M9.5 6.5v11M14.5 6.5v11" />,
    check: <path {...p} d="M5 12.5 9.5 17 19 7" />,
    x: <path {...p} d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" />,
    flame: (
      <path
        {...p}
        d="M12 3c.5 3-2 4-2 7a2 2 0 0 0 4 0c0-1 0-1.5-.5-2.5C16 9 17 11 17 14a5 5 0 0 1-10 0c0-4 3-5 5-11Z"
      />
    ),
    target: (
      <>
        <circle {...p} cx="12" cy="12" r="8.5" />
        <circle {...p} cx="12" cy="12" r="4.5" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" />
      </>
    ),
    clock: (
      <>
        <circle {...p} cx="12" cy="12" r="8.5" />
        <path {...p} d="M12 7.5V12l3 1.8" />
      </>
    ),
    chevR: <path {...p} d="M9.5 6l6 6-6 6" />,
    chevL: <path {...p} d="M14.5 6l-6 6 6 6" />,
    plus: <path {...p} d="M12 5v14M5 12h14" />,
    arrow: <path {...p} d="M5 12h13M13 6.5 18.5 12 13 17.5" />,
    phone: (
      <>
        <rect {...p} x="7" y="3" width="10" height="18" rx="2.4" />
        <path {...p} d="M11 18h2" />
      </>
    ),
    sun: (
      <>
        <circle {...p} cx="12" cy="12" r="4" />
        <path
          {...p}
          d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5 5l1.8 1.8M17.2 17.2 19 19M19 5l-1.8 1.8M6.8 17.2 5 19"
        />
      </>
    ),
    moon: <path {...p} d="M19 13.5A7.5 7.5 0 1 1 10.5 5a6 6 0 0 0 8.5 8.5Z" />,
    skull: (
      <>
        <path {...p} d="M12 3a8 8 0 0 0-5 14.2V20h10v-2.8A8 8 0 0 0 12 3Z" />
        <circle cx="9" cy="12" r="1.4" fill="currentColor" />
        <circle cx="15" cy="12" r="1.4" fill="currentColor" />
      </>
    ),
    sliders: (
      <>
        <path {...p} d="M5 8h9M18 8h1M5 16h1M10 16h9" />
        <circle {...p} cx="16" cy="8" r="2.2" />
        <circle {...p} cx="8" cy="16" r="2.2" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
