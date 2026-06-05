'use client';

import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { shiftApi } from '@/api/shift.api';
import { extractErrorMessage } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import { usePOSStore } from '@/store/pos.store';
import type { OpenShiftDto, CloseShiftDto } from '@/types/shift';

export function useOpenShift(onSuccess?: () => void) {
  const { openShift } = usePOSStore();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (dto: OpenShiftDto) => shiftApi.openShift(dto),
    onSuccess: (shift, _variables) => {
      openShift(shift.id, 'Kassir', Number(shift.openingCash));
      toast.success(t('toast.shiftOpened'));
      onSuccess?.();
    },
    onError: async (err: unknown, _variables) => {
      const msg = extractErrorMessage(err);
      // If a shift is already open, fetch it and resume silently
      if (msg.includes('already has an open shift') || msg.includes('already has open')) {
        try {
          const existing = await shiftApi.getActiveShift();
          if (existing) {
            openShift(existing.id, 'Kassir', Number(existing.openingCash));
            toast.success(t('toast.shiftRestored'));
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
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (dto: CloseShiftDto) => {
      if (!shiftId) throw new Error('Faol smena topilmadi');
      return shiftApi.closeShift(shiftId, dto);
    },
    onSuccess: () => {
      closeShift();
      toast.success(t('toast.shiftClosed'));
      onSuccess?.();
    },
    onError: (err: unknown) => {
      // Shift allaqachon yopilgan yoki topilmadi — store ni tozala
      if (err instanceof AxiosError && (err.response?.status === 404 || err.response?.status === 400)) {
        closeShift();
        toast.warning(t('toast.shiftAlreadyClosed'));
        onSuccess?.();
        return;
      }
      toast.error(extractErrorMessage(err));
    },
  });
}
