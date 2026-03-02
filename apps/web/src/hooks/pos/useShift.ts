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
