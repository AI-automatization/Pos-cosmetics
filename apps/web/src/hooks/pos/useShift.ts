'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { shiftApi } from '@/api/shift.api';
import { extractErrorMessage } from '@/lib/utils';
import { usePOSStore } from '@/store/pos.store';
import type { CloseShiftDto } from '@/types/shift';

// Form input — cashierName is stored locally (backend rejects this field)
interface OpenShiftInput {
  cashierName: string;
  openingCash: number;
}

export function useOpenShift(onSuccess?: () => void) {
  const { openShift } = usePOSStore();

  return useMutation({
    // Only send openingCash to backend (cashierName causes HTTP 400)
    mutationFn: (input: OpenShiftInput) =>
      shiftApi.openShift({ openingCash: input.openingCash }),
    onSuccess: (shift, input) => {
      // Use locally-entered cashierName — backend doesn't return this field
      openShift(shift.id, input.cashierName, input.openingCash);
      toast.success('Smena muvaffaqiyatli ochildi!');
      onSuccess?.();
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
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
