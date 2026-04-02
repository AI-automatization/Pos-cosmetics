import { create } from 'zustand';
import { salesApi } from '../api/sales.api';

interface ShiftState {
  isShiftOpen: boolean;
  shiftId: string | null;
  openShift: (openingCash?: number) => Promise<void>;
  closeShift: (closingCash?: number) => Promise<void>;
  syncWithApi: () => Promise<void>;
}

export const useShiftStore = create<ShiftState>((set, get) => ({
  isShiftOpen: false,
  shiftId: null,

  openShift: async (openingCash = 0) => {
    const shift = await salesApi.openShiftApi({ openingCash });
    set({ isShiftOpen: true, shiftId: shift.id });
  },

  closeShift: async (closingCash = 0) => {
    const { shiftId } = get();
    if (!shiftId) return;
    await salesApi.closeShiftApi(shiftId, { closingCash });
    set({ isShiftOpen: false, shiftId: null });
  },

  syncWithApi: async () => {
    try {
      const shift = await salesApi.getCurrentShift();
      if (shift && shift.status === 'OPEN') {
        set({ isShiftOpen: true, shiftId: shift.id });
      } else {
        set({ isShiftOpen: false, shiftId: null });
      }
    } catch {
      // Offline yoki xatolik — mavjud holatni saqlash
    }
  },
}));
