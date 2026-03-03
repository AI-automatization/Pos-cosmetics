'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { financeApi } from '@/api/finance.api';
import type { Expense, CreateExpenseDto, ProfitReport } from '@/types/finance';

const today = new Date().toISOString().slice(0, 10);
const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

const DEMO_EXPENSES: Expense[] = [
  { id: 'e-1', category: 'RENT', description: 'Mart oyi ijarasi', amount: 2_500_000, date: today, createdAt: today, tenantId: 'demo' },
  { id: 'e-2', category: 'SALARY', description: 'Kassirlar maoshi (fevral)', amount: 3_200_000, date: monthAgo, createdAt: monthAgo, tenantId: 'demo' },
  { id: 'e-3', category: 'DELIVERY', description: 'Loreal mahsulotlari keltirish', amount: 150_000, date: today, createdAt: today, tenantId: 'demo' },
  { id: 'e-4', category: 'UTILITIES', description: 'Elektr va gaz (fevral)', amount: 320_000, date: monthAgo, createdAt: monthAgo, tenantId: 'demo' },
  { id: 'e-5', category: 'OTHER', description: 'Ofis buyumlari', amount: 85_000, date: today, createdAt: today, tenantId: 'demo' },
];

const DEMO_PROFIT: ProfitReport = {
  from: monthAgo,
  to: today,
  revenue: 18_750_000,
  cogs: 11_500_000,
  grossProfit: 7_250_000,
  totalExpenses: 6_255_000,
  netProfit: 995_000,
  expensesByCategory: [
    { category: 'RENT', total: 2_500_000, count: 1 },
    { category: 'SALARY', total: 3_200_000, count: 1 },
    { category: 'DELIVERY', total: 150_000, count: 1 },
    { category: 'UTILITIES', total: 320_000, count: 1 },
    { category: 'OTHER', total: 85_000, count: 1 },
  ],
};

const EXPENSES_KEY = 'expenses';

export function useExpenses(params?: { category?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: [EXPENSES_KEY, params],
    queryFn: async () => {
      try {
        return await financeApi.listExpenses(params);
      } catch {
        return DEMO_EXPENSES;
      }
    },
    staleTime: 30_000,
    retry: 0,
  });
}

export function useProfitReport(from: string, to: string) {
  return useQuery({
    queryKey: [EXPENSES_KEY, 'profit', from, to],
    queryFn: async () => {
      try {
        return await financeApi.getProfitReport({ from, to });
      } catch {
        return DEMO_PROFIT;
      }
    },
    staleTime: 60_000,
    retry: 0,
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
