import { apiClient } from './client';
import type { Expense, CreateExpenseDto, ProfitReport } from '@/types/finance';

// Backend @Controller('finance') with nested routes: /finance/expenses, /finance/pnl etc.
// Profit: backend /reports/profit
export const financeApi = {
  listExpenses(params?: { category?: string; from?: string; to?: string }) {
    return apiClient.get('/finance/expenses', { params }).then((r) => {
      const d = r.data;
      return (Array.isArray(d) ? d : (d?.items ?? [])) as Expense[];
    });
  },
  createExpense(dto: CreateExpenseDto) {
    return apiClient.post<Expense>('/finance/expenses', dto).then((r) => r.data);
  },
  deleteExpense(id: string) {
    return apiClient.delete<void>(`/finance/expenses/${id}`).then((r) => r.data);
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
