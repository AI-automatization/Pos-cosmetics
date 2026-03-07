import api from './client';

export type DebtStatus = 'ACTIVE' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface DebtCustomer {
  id: string;
  name: string;
  phone: string | null;
}

export interface DebtPayment {
  id: string;
  amount: number;
  method: string;
  notes: string | null;
  createdAt: string;
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
};
