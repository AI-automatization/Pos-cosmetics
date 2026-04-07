'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { debtApi } from '@/api/debt.api';
import { customerApi } from '@/api/customer.api';
import { extractErrorMessage } from '@/lib/utils';
import type { PayDebtDto } from '@/types/debt';
import type { CreateCustomerDto } from '@/types/customer';

/** Yangi xaridor yaratish */
export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCustomerDto) => customerApi.create(dto),
    onSuccess: () => {
      toast.success('Xaridor muvaffaqiyatli qo\'shildi!');
      void queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });
}

/** Xaridorlar ro'yxati (qarz ma'lumotlari bilan) */
export function useCustomersList(search?: string, branchId?: string) {
  return useQuery({
    queryKey: ['customers', 'list', search, branchId],
    queryFn: () => debtApi.listCustomers({ search, branchId }),
    staleTime: 30_000,
  });
}

/** Barcha qarzlar ro'yxati */
export function useDebts(params?: { customerId?: string; overdue?: boolean }) {
  const overdue = params?.overdue ?? false;
  const customerId = params?.customerId;
  return useQuery({
    queryKey: ['debts', overdue, customerId],
    queryFn: () =>
      overdue
        ? debtApi.listOverdue()
        : debtApi.listDebts(params),
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

/** Nasiya umumiy xulosasi */
export function useNasiyaSummary() {
  return useQuery({
    queryKey: ['debts', 'summary'],
    queryFn: () => debtApi.getSummary(),
    staleTime: 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

/** Aging report */
export function useAgingReport() {
  return useQuery({
    queryKey: ['debts', 'aging'],
    queryFn: () => debtApi.getAging(),
    staleTime: 60_000,
    retry: false,
    refetchOnWindowFocus: false,
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
