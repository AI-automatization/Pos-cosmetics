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
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Ulanish vaqti tugadi. Internetni tekshiring.')), 15_000),
    );
    const shift = await Promise.race([
      salesApi.openShiftApi({ openingCash }),
      timeoutPromise,
    ]);
    set({ isShiftOpen: true, shiftId: shift.id });
  },

  closeShift: async (closingCash = 0) => {
    // Avval API dan yangi holatni olib kelamiz (stale shiftId dan himoya)
    try {
      const current = await salesApi.getCurrentShift();
      if (current && current.id) {
        set({ shiftId: current.id, isShiftOpen: true });
      }
    } catch {
      // Offline — mavjud shiftId bilan davom etamiz
    }

    const { shiftId } = get();
    if (!shiftId) {
      throw new Error('Faol smena topilmadi. Iltimos, avval smena oching.');
    }
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Ulanish vaqti tugadi. Internetni tekshiring.')), 15_000),
    );
    await Promise.race([
      salesApi.closeShiftApi(shiftId, { closingCash }),
      timeoutPromise,
    ]);
    set({ isShiftOpen: false, shiftId: null });
  },

  syncWithApi: async () => {
    try {
      const shift = await salesApi.getCurrentShift();
      if (shift && shift.status?.toUpperCase() === 'OPEN') {
        set({ isShiftOpen: true, shiftId: shift.id });
      } else if (shift === null) {
        // Faqat aniq null javob bo'lganda reset (network xato emas)
        set({ isShiftOpen: false, shiftId: null });
      }
    } catch {
      // Offline yoki xatolik — mavjud holatni saqlash
    }
  },
}));
