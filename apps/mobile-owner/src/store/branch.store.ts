import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Branch } from '../api/branches.api';

const BRANCH_KEY = 'selected_branch_id';

interface BranchState {
  selectedBranchId: string | null;
  branches: Branch[];
  selectBranch: (id: string | null) => void;
  setBranches: (branches: Branch[]) => void;
  loadPersistedBranch: () => Promise<void>;
}

export const useBranchStore = create<BranchState>((set) => ({
  selectedBranchId: null,
  branches: [],

  selectBranch: (id: string | null) => {
    set({ selectedBranchId: id });
    AsyncStorage.setItem(BRANCH_KEY, id ?? '').catch(() => undefined);
  },

  setBranches: (branches: Branch[]) => set({ branches }),

  loadPersistedBranch: async () => {
    try {
      const stored = await AsyncStorage.getItem(BRANCH_KEY);
      if (stored) {
        set({ selectedBranchId: stored || null });
      }
    } catch {
      // ignore
    }
  },
}));
