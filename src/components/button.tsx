import type { CSSProperties, ReactNode } from 'react';
import { Icon, type IconName } from './icon';

type Variant = 'primary' | 'ghost' | 'soft' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  style?: CSSProperties;
  disabled?: boolean;
  type?: 'button' | 'submit';
  'aria-label'?: string;
}

const sizes: Record<Size, CSSProperties> = {
  sm: { padding: '9px 16px', fontSize: 13.5 },
  md: { padding: '13px 20px', fontSize: 15 },
  lg: { padding: '17px 28px', fontSize: 16.5 },
  xl: { padding: '20px 34px', fontSize: 19 },
};

const variants: Record<Variant, CSSProperties> = {
  primary: {
    background: 'var(--accent)',
    color: 'var(--on-accent)',
    border: '1px solid transparent',
    boxShadow: '0 0 28px color-mix(in oklab, var(--accent) 30%, transparent)',
  },
  ghost: { background: 'transparent', color: 'var(--text)', border: '1px solid var(--line)' },
  soft: {
    background: 'var(--accent-soft)',
    color: 'var(--accent)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'transparent',
    color: 'var(--danger)',
    border: '1px solid color-mix(in oklab, var(--danger) 40%, var(--line))',
  },
};

/** The shared pill button, with an optional leading icon. */
export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  style,
  disabled,
  type = 'button',
  'aria-label': ariaLabel,
}: ButtonProps) {
  const iconSize = size === 'xl' ? 22 : size === 'lg' ? 20 : 18;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="li-btn li-tap"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        fontFamily: 'var(--display)',
        fontWeight: 700,
        letterSpacing: '-0.01em',
        borderRadius: 999,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        whiteSpace: 'nowrap',
        ...sizes[size],
        ...variants[variant],
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
    </button>
  );
}
