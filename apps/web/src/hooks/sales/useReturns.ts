'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { returnsApi } from '@/api/returns.api';
import { ordersApi } from '@/api/orders.api';
import { useTranslation } from '@/i18n/i18n-context';
import type { CreateReturnDto } from '@/types/returns';

export function useOrdersForReturns(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['orders', 'for-returns', params],
    queryFn: () => ordersApi.list({ page: params.page ?? 1, limit: params.limit ?? 30 }),
    staleTime: 30_000,
  });
}

export function useListReturns(params: { page?: number; limit?: number; status?: string } = {}) {
  return useQuery({
    queryKey: ['returns', params],
    queryFn: () => returnsApi.listReturns(params),
    staleTime: 30_000,
  });
}

export function useCreateReturn() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (dto: CreateReturnDto) => returnsApi.createReturn(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['returns'] });
      toast.success(t('toast.returnRequestSent'));
    },
    onError: () => toast.error(t('toast.genericError')),
  });
}

export function useApproveReturn() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (id: string) => returnsApi.approveReturn(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['returns'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success(t('toast.returnApproved'));
    },
    onError: () => toast.error(t('toast.genericError')),
  });
}
