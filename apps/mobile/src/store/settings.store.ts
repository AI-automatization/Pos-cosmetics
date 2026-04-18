import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';
type AutoLockMinutes = 15 | 30 | 60;

interface SettingsState {
  theme: Theme;
  biometricEnabled: boolean;
  autoLockMinutes: AutoLockMinutes;

  setTheme: (theme: Theme) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setAutoLockMinutes: (minutes: AutoLockMinutes) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'system',
  biometricEnabled: false,
  autoLockMinutes: 15,

  setTheme: (theme) => set({ theme }),
  setBiometricEnabled: (biometricEnabled) => set({ biometricEnabled }),
  setAutoLockMinutes: (autoLockMinutes) => set({ autoLockMinutes }),
}));
