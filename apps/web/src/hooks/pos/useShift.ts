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
    onSuccess: (shift, variables) => {
      openShift(shift.id, variables.cashierName ?? 'Kassir', Number(shift.openingCash));
      toast.success('Smena muvaffaqiyatli ochildi!');
      onSuccess?.();
    },
    onError: async (err: unknown, variables) => {
      const msg = extractErrorMessage(err);
      // If a shift is already open, fetch it and resume silently
      if (msg.includes('already has an open shift') || msg.includes('already has open')) {
        try {
          const existing = await shiftApi.getActiveShift();
          if (existing) {
            openShift(existing.id, variables.cashierName ?? 'Kassir', Number(existing.openingCash));
            toast.success('Mavjud smena tiklandi');
            onSuccess?.();
            return;
          }
        } catch {
          // fall through to default error
        }
      }
      toast.error(msg);
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
      toast.error(extractErrorMessage(err));
    },
  });
}
