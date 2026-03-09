'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { debtApi } from '@/api/debt.api';
import { extractErrorMessage } from '@/lib/utils';
import type { PayDebtDto } from '@/types/debt';

/** Xaridorlar ro'yxati (qarz ma'lumotlari bilan) */
export function useCustomersList(search?: string) {
  return useQuery({
    queryKey: ['customers', 'list', search],
    queryFn: () => debtApi.listCustomers({ search }),
    staleTime: 30_000,
  });
}

/** Barcha qarzlar ro'yxati */
export function useDebts(params?: { customerId?: string; overdue?: boolean }) {
  return useQuery({
    queryKey: ['debts', params],
    queryFn: () =>
      params?.overdue
        ? debtApi.listOverdue()
        : debtApi.listDebts(params),
    staleTime: 30_000,
  });
}

/** Nasiya umumiy xulosasi */
export function useNasiyaSummary() {
  return useQuery({
    queryKey: ['debts', 'summary'],
    queryFn: () => debtApi.getSummary(),
    staleTime: 60_000,
  });
}

/** Aging report */
export function useAgingReport() {
  return useQuery({
    queryKey: ['debts', 'aging'],
    queryFn: () => debtApi.getAging(),
    staleTime: 60_000,
  });
}

/** Qarz to'lash */
export function usePayDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ debtId, dto }: { debtId: string; dto: PayDebtDto }) =>
      debtApi.payDebt(debtId, dto),
    onSuccess: () => {
      toast.success("To'lov muvaffaqiyatli qabul qilindi!");
      void queryClient.invalidateQueries({ queryKey: ['debts'] });
      void queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });
}
