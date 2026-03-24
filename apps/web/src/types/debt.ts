export type DebtStatus = 'CURRENT' | 'OVERDUE_30' | 'OVERDUE_60' | 'OVERDUE_90' | 'OVERDUE_90PLUS';

export interface Debt {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  orderId: string;
  orderNumber?: string;
  originalAmount: number;
  remainingAmount: number;
  dueDate: string;
  createdAt: string;
  status: DebtStatus;
  ageDays: number;
}

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  method: 'CASH' | 'CARD' | 'TRANSFER';
  note?: string;
  createdAt: string;
}

export interface PayDebtDto {
  amount: number;
  method: 'CASH' | 'CARD' | 'TRANSFER';
  note?: string;
}

export interface AgingBucket {
  label: string;
  range: string;
  count: number;
  totalAmount: number;
}

export interface AgingReport {
  buckets: AgingBucket[];
  grandTotal: number;
  totalCount: number;
}

export interface NasiyaSummary {
  totalDebt: number;
  overdueDebt: number;
  totalCustomers: number;
  overdueCustomers: number;
  collectedThisMonth: number;
}

export interface CustomerWithDebt {
  id: string;
  name: string;
  phone: string;
  debtBalance: number;
  debtLimit: number;
  isBlocked: boolean;
  hasOverdue: boolean;
  overdueAmount: number;
  totalPurchases: number;
  lastVisitAt: string | null;
  activeDebtsCount: number;
}
