import { create } from 'zustand';

interface ShiftState {
  isShiftOpen: boolean;
  openShift: () => void;
  closeShift: () => void;
}

export const useShiftStore = create<ShiftState>((set) => ({
  // Default false — SmenaScreen calls openShift() when shift starts
  isShiftOpen: false,

  openShift: () => set({ isShiftOpen: true }),
  closeShift: () => set({ isShiftOpen: false }),
}));
