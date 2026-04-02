import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'onboarding_complete';

interface OnboardingState {
  isComplete: boolean;
  currentStep: number;
  completeOnboarding: () => void;
  nextStep: () => void;
  reset: () => void;
  loadPersistedState: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  isComplete: false,
  currentStep: 0,

  completeOnboarding: () => {
    AsyncStorage.setItem(ONBOARDING_KEY, 'true').catch(() => undefined);
    set({ isComplete: true });
  },

  nextStep: () => {
    const { currentStep } = get();
    set({ currentStep: currentStep + 1 });
  },

  reset: () => {
    AsyncStorage.removeItem(ONBOARDING_KEY).catch(() => undefined);
    set({ isComplete: false, currentStep: 0 });
  },

  loadPersistedState: async () => {
    try {
      const stored = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (stored === 'true') {
        set({ isComplete: true });
      }
    } catch {
      // ignore
    }
  },
}));
