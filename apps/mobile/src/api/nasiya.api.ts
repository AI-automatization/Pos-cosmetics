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

export const nasiyaApi = {
  getDebtors: async (branchId?: string): Promise<Debtor[]> => {
    const { data } = await api.get<Debtor[]>('/nasiya/debtors', {
      params: { branchId },
    });
    return data;
  },

  getDebtorById: async (id: string): Promise<Debtor & { payments: DebtPayment[] }> => {
    const { data } = await api.get<Debtor & { payments: DebtPayment[] }>(`/nasiya/debtors/${id}`);
    return data;
  },

  recordPayment: async (dto: RecordPaymentDto): Promise<DebtPayment> => {
    const { data } = await api.post<DebtPayment>('/nasiya/payments', dto);
    return data;
  },

  sendReminder: async (debtorId: string): Promise<void> => {
    await api.post(`/nasiya/debtors/${debtorId}/remind`);
  },
};
