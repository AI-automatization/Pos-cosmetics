'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { financeApi } from '@/api/finance.api';
import { useTranslation } from '@/i18n/i18n-context';
import type { CreateExpenseDto } from '@/types/finance';

const EXPENSES_KEY = 'expenses';

export function useExpenses(params?: { category?: string; from?: string; to?: string }) {
  const category = params?.category;
  const from = params?.from;
  const to = params?.to;
  return useQuery({
    queryKey: [EXPENSES_KEY, category, from, to],
    queryFn: () => financeApi.listExpenses(params),
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useProfitReport(from: string, to: string) {
  return useQuery({
    queryKey: [EXPENSES_KEY, 'profit', from, to],
    queryFn: () => financeApi.getProfitReport({ from, to }),
    staleTime: 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (dto: CreateExpenseDto) => financeApi.createExpense(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EXPENSES_KEY] });
      toast.success(t('toast.expenseCreated'));
    },
    onError: () => toast.error(t('toast.genericError')),
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteExpense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EXPENSES_KEY] });
      toast.success(t('toast.expenseDeleted'));
    },
    onError: () => toast.error(t('toast.genericError')),
  });
}
