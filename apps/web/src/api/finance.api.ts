import { apiClient } from './client';
import type { Expense, CreateExpenseDto, ProfitReport } from '@/types/finance';

export const financeApi = {
  listExpenses(params?: { category?: string; from?: string; to?: string }) {
    // Backend: @Controller('expenses') → /expenses (not /finance/expenses)
    return apiClient.get<Expense[]>('/expenses', { params }).then((r) => r.data);
  },
  createExpense(dto: CreateExpenseDto) {
    return apiClient.post<Expense>('/expenses', dto).then((r) => r.data);
  },
  deleteExpense(id: string) {
    return apiClient.delete<void>(`/expenses/${id}`).then((r) => r.data);
  },
  getProfitReport(params: { from: string; to: string }) {
    // Backend: @Get('profit') in @Controller('reports') → /reports/profit
    return apiClient.get<ProfitReport>('/reports/profit', { params }).then((r) => r.data);
  },
};
