import { create } from 'zustand';
import type { SupportedLanguage } from '@/i18n';

interface AppState {
  selectedBranchId: string | null;
  language: SupportedLanguage;

  setSelectedBranch: (id: string | null) => void;
  setLanguage: (lang: SupportedLanguage) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedBranchId: null,
  language: 'uz',

  setSelectedBranch: (id) => set({ selectedBranchId: id }),
  setLanguage: (lang) => set({ language: lang }),
}));
