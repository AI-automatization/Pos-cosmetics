import { apiClient } from './client';
import type { Expense, CreateExpenseDto, ProfitReport } from '@/types/finance';

// B-018 fix: backend @Controller('expenses') → /expenses, not /finance/expenses
// Profit: backend /reports/profit, not /finance/profit
export const financeApi = {
  listExpenses(params?: { category?: string; from?: string; to?: string }) {
    return apiClient.get('/expenses', { params }).then((r) => {
      const d = r.data;
      return (Array.isArray(d) ? d : (d?.items ?? [])) as Expense[];
    });
  },
  createExpense(dto: CreateExpenseDto) {
    return apiClient.post<Expense>('/expenses', dto).then((r) => r.data);
  },
  deleteExpense(id: string) {
    return apiClient.delete<void>(`/expenses/${id}`).then((r) => r.data);
  },
  getProfitReport(params: { from: string; to: string }) {
    return apiClient.get('/reports/profit', { params }).then((r) => {
      const d = r.data ?? {};
      return {
        from: params.from,
        to: params.to,
        revenue: d.revenue ?? 0,
        cogs: d.cogs ?? 0,
        grossProfit: d.grossProfit ?? 0,
        totalExpenses: d.totalExpenses ?? 0,
        netProfit: d.netProfit ?? 0,
        expensesByCategory: Array.isArray(d.expensesByCategory) ? d.expensesByCategory : [],
      } as ProfitReport;
    });
  },
};
