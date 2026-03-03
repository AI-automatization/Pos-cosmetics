'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { financeApi } from '@/api/finance.api';
import type { CreateExpenseDto } from '@/types/finance';

const EXPENSES_KEY = 'expenses';

export function useExpenses(params?: { category?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: [EXPENSES_KEY, params],
    queryFn: () => financeApi.listExpenses(params),
    staleTime: 30_000,
  });
}

export function useProfitReport(from: string, to: string) {
  return useQuery({
    queryKey: [EXPENSES_KEY, 'profit', from, to],
    queryFn: () => financeApi.getProfitReport({ from, to }),
    staleTime: 60_000,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateExpenseDto) => financeApi.createExpense(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EXPENSES_KEY] });
      toast.success("Xarajat qo'shildi!");
    },
    onError: () => toast.error("Xato yuz berdi"),
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteExpense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EXPENSES_KEY] });
      toast.success("Xarajat o'chirildi");
    },
    onError: () => toast.error("Xato yuz berdi"),
  });
}
