'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { shiftApi } from '@/api/shift.api';
import { extractErrorMessage } from '@/lib/utils';
import { usePOSStore } from '@/store/pos.store';
import type { OpenShiftDto, CloseShiftDto } from '@/types/shift';

function isNetworkError(err: unknown): boolean {
  if (err instanceof AxiosError) {
    // no response = server not reachable
    if (!err.response) return true;
    if (err.response.status === 404 || err.response.status >= 500) return true;
  }
  const msg = extractErrorMessage(err);
  return msg.includes('connect') || msg.includes('Network') || msg.includes('ECONNREFUSED');
}

export function useOpenShift(onSuccess?: () => void) {
  const { openShift } = usePOSStore();

  return useMutation({
    mutationFn: (dto: OpenShiftDto) => shiftApi.openShift(dto),
    onSuccess: (shift) => {
      openShift(shift.id, shift.cashierName, shift.openingCash);
      toast.success('Smena muvaffaqiyatli ochildi!');
      onSuccess?.();
    },
    onError: (err: unknown, dto: OpenShiftDto) => {
      if (isNetworkError(err)) {
        // Demo mode: use submitted form values until backend is ready (T-013/T-014)
        const demoId = `demo-${Date.now()}`;
        openShift(demoId, dto.cashierName, dto.openingCash);
        toast.success('Smena ochildi (demo rejim)');
        onSuccess?.();
      } else {
        toast.error(extractErrorMessage(err));
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
      if (isNetworkError(err)) {
        closeShift();
        toast.success('Smena yopildi (demo rejim)');
        onSuccess?.();
      } else {
        toast.error(extractErrorMessage(err));
      }
    },
  });
}
