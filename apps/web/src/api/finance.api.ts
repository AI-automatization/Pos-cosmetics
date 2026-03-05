import { apiClient } from './client';
import type { Expense, CreateExpenseDto, ProfitReport } from '@/types/finance';

export const financeApi = {
  listExpenses(params?: { category?: string; from?: string; to?: string }) {
    return apiClient.get<Expense[]>('/finance/expenses', { params }).then((r) => r.data);
  },
  createExpense(dto: CreateExpenseDto) {
    return apiClient.post<Expense>('/finance/expenses', dto).then((r) => r.data);
  },
  deleteExpense(id: string) {
    return apiClient.delete<void>(`/finance/expenses/${id}`).then((r) => r.data);
  },
  getProfitReport(params: { from: string; to: string }) {
    return apiClient.get<ProfitReport>('/finance/profit', { params }).then((r) => r.data);
  },
};
