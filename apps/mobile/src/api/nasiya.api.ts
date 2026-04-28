import api from './client';
import { customersApi } from './customers.api';

export type DebtStatus = 'ACTIVE' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface DebtCustomer {
  id: string;
  name: string;
  phone: string | null;
}

export interface DebtPayment {
  id: string;
  amount: number;
  currency: string;
  method: string;
  paymentMethod: string;
  notes: string | null;
  note: string | null;
  createdAt: string;
}

export interface Debtor {
  id: string;
  customerName: string;
  customerPhone: string | null;
  totalDebt: number;
  overdueAmount: number;
  currency: string;
  dueDate: string | null;
  status: DebtStatus;
  lastPayment: string | null;
}

export interface RecordPaymentDto {
  debtorId: string;
  amount: number;
  paymentMethod: string;
  note?: string;
}

export interface DebtRecord {
  id: string;
  customerId: string;
  orderId: string | null;
  totalAmount: number;
  paidAmount: number;
  remaining: number;
  status: DebtStatus;
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  customer: DebtCustomer;
  payments: DebtPayment[];
}

export interface DebtListResponse {
  items: DebtRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface NasiyaSummary {
  overdueCount: number;
  overdueAmount: number;
}

export const nasiyaApi = {
  getDebtors: async (branchId?: string): Promise<Debtor[]> => {
    const { data } = await api.get<Debtor[]>('/nasiya/debtors', { params: { branchId } });
    return data;
  },

  getDebtorById: async (id: string): Promise<Debtor & { payments: DebtPayment[] }> => {
    const { data } = await api.get<Debtor & { payments: DebtPayment[] }>(`/nasiya/debtors/${id}`);
    return data;
  },

  recordPayment: async (dto: RecordPaymentDto): Promise<void> => {
    await api.post(`/nasiya/${dto.debtorId}/pay`, {
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      note: dto.note,
    });
  },

  getList: async (status?: DebtStatus): Promise<DebtListResponse> => {
    const params: Record<string, string | number> = { limit: 100 };
    if (status) params['status'] = status;
    const { data } = await api.get<DebtListResponse>('/nasiya', { params });
    return data;
  },

  getOverdue: async (): Promise<DebtRecord[]> => {
    const { data } = await api.get<DebtRecord[]>('/nasiya/overdue');
    return data;
  },

  getById: async (id: string): Promise<DebtRecord> => {
    const { data } = await api.get<DebtRecord>(`/nasiya/${id}`);
    return data;
  },

  pay: async (id: string, amount: number, notes?: string): Promise<void> => {
    await api.post(`/nasiya/${id}/pay`, { amount, method: 'CASH', notes });
  },

  sendReminder: async (id: string): Promise<void> => {
    await api.post(`/nasiya/${id}/remind`);
  },

  create: async (body: {
    customerName: string;
    phone?: string;
    totalAmount: number;
    dueDate?: string;
    notes?: string;
  }): Promise<DebtRecord> => {
    // 1. Find or create customer
    const existing = await customersApi.search(body.customerName);
    const match = existing.find(
      (c) =>
        c.name.toLowerCase() === body.customerName.toLowerCase() &&
        (!body.phone || c.phone === body.phone),
    );
    const customerId = match
      ? match.id
      : (await customersApi.create(body.customerName, body.phone)).id;

    // 2. Create debt with customerId
    const { data } = await api.post<DebtRecord>('/nasiya', {
      customerId,
      totalAmount: body.totalAmount,
      ...(body.dueDate ? { dueDate: body.dueDate } : {}),
      ...(body.notes ? { notes: body.notes } : {}),
    });
    return data;
  },
};
