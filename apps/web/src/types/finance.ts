// Finance / Expenses domain types

export type ExpenseCategory = 'RENT' | 'SALARY' | 'DELIVERY' | 'UTILITIES' | 'OTHER';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  createdAt: string;
  tenantId: string;
}

export interface CreateExpenseDto {
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
}

export interface ExpenseSummary {
  category: ExpenseCategory;
  total: number;
  count: number;
}

export interface ProfitReport {
  from: string;
  to: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
  expensesByCategory: ExpenseSummary[];
}

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  RENT: "Ijara",
  SALARY: "Maosh",
  DELIVERY: "Yetkazib berish",
  UTILITIES: "Kommunal",
  OTHER: "Boshqa",
};

export const EXPENSE_CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  RENT: '#3b82f6',
  SALARY: '#8b5cf6',
  DELIVERY: '#f59e0b',
  UTILITIES: '#10b981',
  OTHER: '#6b7280',
};
