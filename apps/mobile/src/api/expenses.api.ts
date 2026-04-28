import api from './client';

export type ExpenseCategory = 'RENT' | 'SALARY' | 'DELIVERY' | 'UTILITIES' | 'OTHER';

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  RENT:      'Ijara',
  SALARY:    'Maosh',
  DELIVERY:  'Yetkazib berish',
  UTILITIES: 'Kommunal',
  OTHER:     'Boshqa',
};

export const EXPENSE_CATEGORIES: ExpenseCategory[] = ['RENT', 'SALARY', 'DELIVERY', 'UTILITIES', 'OTHER'];

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description?: string;
  amount: number;
  date: string;
  createdAt: string;
}

export interface CreateExpensePayload {
  category: ExpenseCategory;
  description?: string;
  amount: number;
  date: string;
}

export interface ExpenseFilter {
  category?: ExpenseCategory;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedExpenses {
  data: Expense[];
  total: number;
  page: number;
  limit: number;
}

export interface ExpenseSummaryItem {
  category: ExpenseCategory;
  total: number;
}

export const expensesApi = {
  getExpenses: async (filter?: ExpenseFilter): Promise<PaginatedExpenses> => {
    const { data } = await api.get<{ data: Array<Omit<Expense, 'amount'> & { amount: string }>; total: number; page: number; limit: number }>('/finance/expenses', {
      params: filter,
    });
    return {
      ...data,
      data: data.data.map((e) => ({ ...e, amount: parseFloat(e.amount) })),
    };
  },

  createExpense: async (payload: CreateExpensePayload): Promise<Expense> => {
    const { data } = await api.post<Omit<Expense, 'amount'> & { amount: string }>('/finance/expenses', payload);
    return { ...data, amount: parseFloat(data.amount) };
  },

  deleteExpense: async (id: string): Promise<void> => {
    await api.delete(`/finance/expenses/${id}`);
  },

  getSummary: async (from: string, to: string): Promise<ExpenseSummaryItem[]> => {
    const { data } = await api.get<Array<{ category: ExpenseCategory; total: string }>>('/finance/expenses/summary', {
      params: { from, to },
    });
    return data.map((item) => ({ ...item, total: parseFloat(item.total) }));
  },
};
