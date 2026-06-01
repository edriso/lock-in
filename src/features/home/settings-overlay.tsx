import type { ReactNode } from 'react';
import { Icon } from '@/components/icon';
import { Label } from '@/components/label';
import { Overlay } from '@/components/overlay';
import { useLockInStore } from '@/store/lockin-store';
import { ACCENTS, DURATIONS, STRICTNESS, type Duration, type Strictness } from '@/types/domain';

interface SettingsOverlayProps {
  onClose: () => void;
}

const STRICTNESS_HINT: Record<Strictness, string> = {
  gentle: '12s grace before a leave counts',
  normal: '7s grace before a leave counts',
  strict: '3s grace — bites harder',
};

/** Settings: default length, strictness, the "why" prompt, theme, accent. */
export function SettingsOverlay({ onClose }: SettingsOverlayProps) {
  const settings = useLockInStore((state) => state.settings);
  const setDuration = useLockInStore((state) => state.setDuration);
  const setStrictness = useLockInStore((state) => state.setStrictness);
  const setShowWhy = useLockInStore((state) => state.setShowWhy);
  const setTheme = useLockInStore((state) => state.setTheme);
  const setAccent = useLockInStore((state) => state.setAccent);

  return (
    <Overlay ariaLabel="Settings" onClose={onClose}>
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          padding: '24px 24px 26px',
          boxShadow: '0 24px 60px -20px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 22,
          }}
        >
          <Label>Settings</Label>
          <button onClick={onClose} className="li-iconbtn li-tap" type="button" aria-label="Close">
            <Icon name="x" size={18} />
          </button>
        </div>

        <Field label="Default length">
          <Pills
            options={DURATIONS.map((d) => ({ value: String(d), label: `${d} min` }))}
            selected={String(settings.duration)}
            onSelect={(value) => setDuration(Number(value) as Duration)}
          />
        </Field>

        <Field label={`Strictness · ${STRICTNESS_HINT[settings.strictness]}`}>
          <Pills
            options={STRICTNESS.map((s) => ({ value: s, label: s }))}
            selected={settings.strictness}
            onSelect={(value) => setStrictness(value as Strictness)}
          />
        </Field>

        <Field label="Before a session">
          <Toggle
            on={settings.showWhy}
            label="Ask “why does it matter?”"
            onChange={() => setShowWhy(!settings.showWhy)}
          />
        </Field>

        <Field label="Theme">
          <Pills
            options={[
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' },
            ]}
            selected={settings.theme}
            onSelect={(value) => setTheme(value === 'light' ? 'light' : 'dark')}
          />
        </Field>

        <Field label="Accent">
          <div role="group" aria-label="Accent" style={{ display: 'flex', gap: 12 }}>
            {ACCENTS.map((color) => {
              const selected = settings.accent === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAccent(color)}
                  aria-pressed={selected}
                  aria-label={color}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    background: color,
                    border: `2px solid ${selected ? 'var(--text)' : 'transparent'}`,
                    boxShadow: '0 0 0 1px var(--line)',
                  }}
                />
              );
            })}
          </div>
        </Field>
      </div>
    </Overlay>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <Label style={{ marginBottom: 11 }}>{label}</Label>
      {children}
    </div>
  );
}

interface PillOption {
  value: string;
  label: string;
}

function Pills({
  options,
  selected,
  onSelect,
}: {
  options: PillOption[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div role="group" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map((option) => {
        const isSelected = option.value === selected;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            aria-pressed={isSelected}
            className="li-tap"
            style={{
              padding: '9px 15px',
              borderRadius: 999,
              cursor: 'pointer',
              fontFamily: 'var(--display)',
              fontSize: 14,
              fontWeight: 600,
              textTransform: 'capitalize',
              background: isSelected ? 'var(--accent-soft)' : 'transparent',
              color: isSelected ? 'var(--accent)' : 'var(--text-dim)',
              border: `1px solid ${isSelected ? 'var(--accent-line)' : 'var(--line)'}`,
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({ on, label, onChange }: { on: boolean; label: string; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={on}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: 0,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text)',
        fontFamily: 'var(--display)',
        fontSize: 15,
      }}
    >
      <span>{label}</span>
      <span
        aria-hidden="true"
        style={{
          width: 44,
          height: 26,
          borderRadius: 999,
          flexShrink: 0,
          background: on ? 'var(--accent)' : 'var(--surface-2)',
          border: '1px solid var(--line)',
          position: 'relative',
          transition: 'background .25s ease',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            insetInlineStart: on ? 20 : 2,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: on ? 'var(--on-accent)' : 'var(--text-faint)',
            transition: 'inset-inline-start .25s ease',
          }}
        />
      </span>
    </button>
  );
}
