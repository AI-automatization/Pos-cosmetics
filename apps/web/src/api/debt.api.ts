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
  // B-017 fix: backend @Controller('nasiya') → routes are /nasiya/*, not /debts/*

  /** Barcha qarzlar ro'yxati */
  listDebts: (params?: {
    customerId?: string;
    status?: string;
    overdue?: boolean;
  }): Promise<Debt[]> =>
    apiClient.get('/nasiya', { params }).then((r) => {
      const d = r.data;
      return (Array.isArray(d) ? d : (d?.items ?? [])) as Debt[];
    }),

  /** Muddati o'tgan qarzlar */
  listOverdue: (): Promise<Debt[]> =>
    apiClient.get('/nasiya/overdue').then((r) => {
      const d = r.data;
      return (Array.isArray(d) ? d : (d?.items ?? [])) as Debt[];
    }),

  /** Qarz to'lash */
  payDebt: (debtId: string, dto: PayDebtDto): Promise<DebtPayment> =>
    apiClient.post<DebtPayment>(`/nasiya/${debtId}/pay`, dto).then((r) => r.data),

  /** Nasiya umumiy xulosasi — backend: /nasiya/customer/:id/summary, no global summary */
  getSummary: (): Promise<NasiyaSummary> =>
    apiClient.get<NasiyaSummary>('/nasiya').then((r) => {
      const items: Debt[] = Array.isArray(r.data) ? r.data : [];
      const totalDebt = items.reduce((s, d) => s + (d.remainingAmount ?? 0), 0);
      const overdueItems = items.filter((d) => d.status === 'OVERDUE_30' || d.status === 'OVERDUE_60' || d.status === 'OVERDUE_90' || d.status === 'OVERDUE_90PLUS');
      const overdueDebt = overdueItems.reduce((s, d) => s + (d.remainingAmount ?? 0), 0);
      return { totalDebt, overdueDebt, totalCustomers: items.length, overdueCustomers: overdueItems.length, collectedThisMonth: 0 } satisfies NasiyaSummary;
    }),

  /** Aging report — no backend endpoint yet, return empty */
  getAging: (): Promise<AgingReport> =>
    Promise.resolve({ buckets: [] } as unknown as AgingReport),

  /** Xaridorning qarz tarixi — backend: GET /nasiya?customerId=:id */
  getCustomerDebts: (customerId: string): Promise<Debt[]> =>
    apiClient
      .get<Debt[] | { items: Debt[] }>('/nasiya', { params: { customerId } })
      .then((r) => (Array.isArray(r.data) ? r.data : (r.data as { items: Debt[] }).items ?? []))
      .catch(() => []),

  /** Barcha xaridorlar (qarz ma'lumotlari bilan) */
  listCustomers: (params?: { search?: string }): Promise<CustomerWithDebt[]> =>
    apiClient.get<CustomerWithDebt[]>('/customers', { params }).then((r) => r.data),
};
