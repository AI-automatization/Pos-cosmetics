import { api } from './client';

export interface Debtor {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  totalDebt: number;
  currency: string;
  lastPaymentAt: string | null;
  dueDate: string | null;
  overdueAmount: number;
  branchId: string;
  branchName: string;
  status: string;
  createdAt: string;
}

export interface DebtPayment {
  id: string;
  debtorId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  note: string | null;
  createdAt: string;
}

export interface RecordPaymentDto {
  debtorId: string;
  amount: number;
  paymentMethod: string;
  note?: string;
}

// Backend response shape from GET /nasiya/:id
interface DebtRecordRaw {
  id: string;
  customerId: string;
  totalAmount: string | number;
  paidAmount: string | number;
  remaining: string | number;
  dueDate: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  customer: { id: string; name: string; phone: string };
  payments?: DebtPaymentRaw[];
}

interface DebtPaymentRaw {
  id: string;
  debtRecordId: string;
  amount: string | number;
  method: string;
  notes: string | null;
  createdAt: string;
}

// Backend GET /nasiya returns paginated { items, total, page, limit }
interface PaginatedDebts {
  items: DebtRecordRaw[];
  total: number;
  page: number;
  limit: number;
}

function mapDebtorRaw(raw: DebtRecordRaw): Debtor {
  const remaining = Number(raw.remaining);
  const isOverdue =
    raw.status === 'OVERDUE' ||
    (raw.dueDate != null && new Date(raw.dueDate) < new Date() && remaining > 0);

  return {
    id: raw.id,
    customerId: raw.customerId,
    customerName: raw.customer?.name ?? '',
    customerPhone: raw.customer?.phone ?? '',
    totalDebt: remaining,
    currency: 'UZS',
    lastPaymentAt: raw.payments?.[0]?.createdAt ?? null,
    dueDate: raw.dueDate ?? null,
    overdueAmount: isOverdue ? remaining : 0,
    branchId: '',
    branchName: '',
    status: raw.status,
    createdAt: raw.createdAt,
  };
}

function mapPaymentRaw(raw: DebtPaymentRaw, debtorId: string): DebtPayment {
  return {
    id: raw.id,
    debtorId,
    amount: Number(raw.amount),
    currency: 'UZS',
    paymentMethod: raw.method,
    note: raw.notes ?? null,
    createdAt: raw.createdAt,
  };
}

export const nasiyaApi = {
  // GET /nasiya — list all debts, map to Debtor[]
  getDebtors: async (_branchId?: string): Promise<Debtor[]> => {
    const { data } = await api.get<PaginatedDebts>('/nasiya', {
      params: { limit: 100 },
    });
    return (data.items ?? []).map(mapDebtorRaw);
  },

  // GET /nasiya/:id — single debt record
  getDebtorById: async (id: string): Promise<Debtor & { payments: DebtPayment[] }> => {
    const { data } = await api.get<DebtRecordRaw>(`/nasiya/${id}`);
    const debtor = mapDebtorRaw(data);
    const payments = (data.payments ?? []).map((p) => mapPaymentRaw(p, id));
    return { ...debtor, payments };
  },

  // POST /nasiya/:id/pay — record payment for a debt
  recordPayment: async (dto: RecordPaymentDto): Promise<DebtPayment> => {
    const { data } = await api.post<DebtPaymentRaw>(`/nasiya/${dto.debtorId}/pay`, {
      amount: dto.amount,
      method: dto.paymentMethod ?? 'CASH',
      notes: dto.note,
    });
    return mapPaymentRaw(data, dto.debtorId);
  },

  // POST /nasiya/:id/remind — send reminder (backend may not support)
  sendReminder: async (debtorId: string): Promise<void> => {
    await api.post(`/nasiya/${debtorId}/remind`).catch(() => null);
  },
};
