import { apiClient } from './client';
import type { Expense, CreateExpenseDto, ProfitReport } from '@/types/finance';

// B-018 fix: backend @Controller('expenses') → /expenses, not /finance/expenses
// Profit: backend /reports/profit, not /finance/profit
export const financeApi = {
  listExpenses(params?: { category?: string; from?: string; to?: string }) {
    return apiClient.get<Expense[]>('/expenses', { params }).then((r) => r.data);
  },
  createExpense(dto: CreateExpenseDto) {
    return apiClient.post<Expense>('/expenses', dto).then((r) => r.data);
  },
  deleteExpense(id: string) {
    return apiClient.delete<void>(`/expenses/${id}`).then((r) => r.data);
  },
  getProfitReport(params: { from: string; to: string }) {
    return apiClient.get<ProfitReport>('/reports/profit', { params }).then((r) => r.data);
  },
};
