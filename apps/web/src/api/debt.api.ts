import { apiClient } from './client';
import type {
  Debt,
  DebtPayment,
  PayDebtDto,
  AgingReport,
  NasiyaSummary,
  CustomerWithDebt,
} from '@/types/debt';

export const debtApi = {
  /** Barcha qarzlar ro'yxati */
  listDebts: (params?: {
    customerId?: string;
    status?: string;
    overdue?: boolean;
  }): Promise<Debt[]> =>
    apiClient.get<Debt[]>('/debts', { params }).then((r) => r.data),

  /** Muddati o'tgan qarzlar */
  listOverdue: (): Promise<Debt[]> =>
    apiClient.get<Debt[]>('/debts/overdue').then((r) => r.data),

  /** Qarz to'lash */
  payDebt: (debtId: string, dto: PayDebtDto): Promise<DebtPayment> =>
    apiClient.post<DebtPayment>(`/debts/${debtId}/pay`, dto).then((r) => r.data),

  /** Nasiya umumiy xulosasi */
  getSummary: (): Promise<NasiyaSummary> =>
    apiClient.get<NasiyaSummary>('/debts/summary').then((r) => r.data),

  /** Aging report */
  getAging: (): Promise<AgingReport> =>
    apiClient.get<AgingReport>('/debts/aging').then((r) => r.data),

  /** Xaridorning qarz tarixi */
  getCustomerDebts: (customerId: string): Promise<Debt[]> =>
    apiClient.get<Debt[]>(`/customers/${customerId}/debts`).then((r) => r.data),

  /** Barcha xaridorlar (qarz ma'lumotlari bilan) */
  listCustomers: (params?: { search?: string }): Promise<CustomerWithDebt[]> =>
    apiClient.get<CustomerWithDebt[]>('/customers', { params }).then((r) => r.data),
};
