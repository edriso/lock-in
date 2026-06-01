import { useState } from 'react';
import { Icon } from '@/components/icon';
import { useApplyTheme } from '@/hooks/use-apply-theme';
import { HomeScreen } from '@/features/home/home-screen';
import { SettingsOverlay } from '@/features/home/settings-overlay';
import { useLockInStore } from '@/store/lockin-store';

export function App() {
  useApplyTheme();
  const theme = useLockInStore((state) => state.settings.theme);
  const setTheme = useLockInStore((state) => state.setTheme);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="li-app">
      <button
        className="li-themebtn li-tap"
        type="button"
        onClick={() => setSettingsOpen(true)}
        aria-label="Settings"
        style={{ insetInlineStart: 18, insetInlineEnd: 'auto' }}
      >
        <Icon name="sliders" size={18} />
      </button>
      <button
        className="li-themebtn li-tap"
        type="button"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label="Toggle theme"
      >
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
      </button>

      <HomeScreen />

      {settingsOpen && <SettingsOverlay onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
