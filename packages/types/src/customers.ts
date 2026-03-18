// ─── CUSTOMER TYPES ───────────────────────────────────────────

export type DebtStatus = 'ACTIVE' | 'PARTIAL' | 'PAID' | 'OVERDUE';

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DebtRecord {
  id: string;
  tenantId: string;
  customerId: string;
  orderId: string | null;
  totalAmount: number;
  paidAmount: number;
  remaining: number;
  dueDate: Date | null;
  status: DebtStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DebtPayment {
  id: string;
  debtRecordId: string;
  amount: number;
  method: string;
  notes: string | null;
  createdAt: Date;
}

// ─── REQUEST TYPES ────────────────────────────────────────────

export interface CreateCustomerPayload {
  name: string;
  phone?: string;
  notes?: string;
}

export interface CreateDebtPayload {
  customerId: string;
  orderId?: string;
  totalAmount: number;
  dueDate?: string;
  notes?: string;
}

export interface PayDebtPayload {
  amount: number;
  method?: string;
  notes?: string;
}

// ─── AGING REPORT ─────────────────────────────────────────────

export interface AgingBucket {
  label: string;
  minDays: number;
  maxDays: number;
  count: number;
  totalAmount: number;
}

export interface AgingReport {
  buckets: AgingBucket[];
  grandTotal: number;
}
