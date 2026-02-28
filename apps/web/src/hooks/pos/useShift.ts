'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { shiftApi } from '@/api/shift.api';
import { extractErrorMessage } from '@/lib/utils';
import { usePOSStore } from '@/store/pos.store';
import type { OpenShiftDto, CloseShiftDto } from '@/types/shift';

export function useOpenShift(onSuccess?: () => void) {
  const { openShift } = usePOSStore();

  return useMutation({
    mutationFn: (dto: OpenShiftDto) => shiftApi.openShift(dto),
    onSuccess: (shift) => {
      openShift(shift.id, shift.cashierName, shift.openingCash);
      toast.success('Smena muvaffaqiyatli ochildi!');
      onSuccess?.();
    },
    onError: (err: unknown) => {
      // Backend tayyor bo'lmaguncha local fallback
      const msg = extractErrorMessage(err);
      if (msg.includes('404') || msg.includes('connect') || msg.includes('Network')) {
        // Demo mode: use local state until backend is ready (T-013/T-014)
        const demoId = `demo-${Date.now()}`;
        openShift(demoId, 'Kassir', 0);
        toast.success('Smena ochildi (demo rejim)');
        onSuccess?.();
      } else {
        toast.error(msg);
      }
    },
  });
}

export function useCloseShift(onSuccess?: () => void) {
  const { shiftId, closeShift } = usePOSStore();

  return useMutation({
    mutationFn: (dto: CloseShiftDto) => {
      if (!shiftId) throw new Error('Faol smena topilmadi');
      return shiftApi.closeShift(shiftId, dto);
    },
    onSuccess: () => {
      closeShift();
      toast.success('Smena yopildi!');
      onSuccess?.();
    },
    onError: (err: unknown) => {
      const msg = extractErrorMessage(err);
      if (msg.includes('404') || msg.includes('connect') || msg.includes('Network')) {
        // Demo mode fallback
        closeShift();
        toast.success('Smena yopildi (demo rejim)');
        onSuccess?.();
      } else {
        toast.error(msg);
      }
    },
  });
}
