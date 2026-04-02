import { create } from 'zustand';
import type { SupportedLanguage } from '@/i18n';

interface AppState {
  selectedBranchId: string | null;
  language: SupportedLanguage;
  onboardingDone: boolean;

  setSelectedBranch: (id: string | null) => void;
  setLanguage: (lang: SupportedLanguage) => void;
  setOnboardingDone: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedBranchId: null,
  language: 'uz',
  onboardingDone: false,

  setSelectedBranch: (id) => set({ selectedBranchId: id }),
  setLanguage: (lang) => set({ language: lang }),
  setOnboardingDone: (value) => set({ onboardingDone: value }),
}));
