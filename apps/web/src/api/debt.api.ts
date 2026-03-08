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
  // Backend: @Controller('nasiya') → /nasiya (not /debts)
  listDebts: (params?: {
    customerId?: string;
    status?: string;
    overdue?: boolean;
  }): Promise<Debt[]> =>
    apiClient.get<Debt[]>('/nasiya', { params }).then((r) => {
      const data = r.data as unknown;
      return (Array.isArray(data) ? data : (data as { items?: Debt[] }).items ?? []) as Debt[];
    }),

  /** Muddati o'tgan qarzlar */
  listOverdue: (): Promise<Debt[]> =>
    apiClient.get<Debt[]>('/nasiya/overdue').then((r) => {
      const data = r.data as unknown;
      return (Array.isArray(data) ? data : (data as { items?: Debt[] }).items ?? []) as Debt[];
    }),

  /** Qarz to'lash */
  payDebt: (debtId: string, dto: PayDebtDto): Promise<DebtPayment> =>
    apiClient.post<DebtPayment>(`/nasiya/${debtId}/pay`, dto).then((r) => r.data),

  /** Nasiya umumiy xulosasi — backend does not have a global summary endpoint,
   *  compute from list instead */
  getSummary: (): Promise<NasiyaSummary> =>
    apiClient.get<Debt[]>('/nasiya').then((r) => {
      const data = r.data as unknown;
      const items = (Array.isArray(data) ? data : (data as { items?: Debt[] }).items ?? []) as Debt[];
      const overdueStatuses: string[] = ['OVERDUE_30', 'OVERDUE_60', 'OVERDUE_90', 'OVERDUE_90PLUS'];
      const overdueItems = items.filter((d) => overdueStatuses.includes(d.status));
      return {
        totalDebt: items.reduce((s, d) => s + (d.remainingAmount ?? 0), 0),
        totalCustomers: new Set(items.map((d) => d.customerId)).size,
        overdueDebt: overdueItems.reduce((s, d) => s + (d.remainingAmount ?? 0), 0),
        overdueCustomers: new Set(overdueItems.map((d) => d.customerId)).size,
        collectedThisMonth: 0, // Debt type has no paidAt field — requires backend endpoint
      } satisfies NasiyaSummary;
    }),

  /** Aging report — computed from list since no backend aging endpoint */
  getAging: (): Promise<AgingReport> =>
    apiClient.get<Debt[]>('/nasiya').then((r) => {
      const data = r.data as unknown;
      const items = (Array.isArray(data) ? data : (data as { items?: Debt[] }).items ?? []) as Debt[];
      const makeBucket = (status: string, label: string, range: string) => {
        const filtered = items.filter((d) => d.status === status);
        return {
          label,
          range,
          count: filtered.length,
          totalAmount: filtered.reduce((s, d) => s + (d.remainingAmount ?? 0), 0),
        };
      };
      const buckets = [
        makeBucket('CURRENT', 'Joriy', '0 kun'),
        makeBucket('OVERDUE_30', '0–30 kun', '1–30 kun'),
        makeBucket('OVERDUE_60', '31–60 kun', '31–60 kun'),
        makeBucket('OVERDUE_90', '61–90 kun', '61–90 kun'),
        makeBucket('OVERDUE_90PLUS', '90+ kun', '90+ kun'),
      ];
      return {
        buckets,
        grandTotal: items.reduce((s, d) => s + (d.remainingAmount ?? 0), 0),
        totalCount: items.length,
      } satisfies AgingReport;
    }),

  /** Xaridorning qarz tarixi — filter by customerId from list */
  getCustomerDebts: (customerId: string): Promise<Debt[]> =>
    apiClient
      .get<Debt[]>('/nasiya', { params: { customerId } })
      .then((r) => {
        const data = r.data as unknown;
        return (Array.isArray(data) ? data : (data as { items?: Debt[] }).items ?? []) as Debt[];
      }),

  /** Barcha xaridorlar (qarz ma'lumotlari bilan) */
  listCustomers: (params?: { search?: string }): Promise<CustomerWithDebt[]> =>
    apiClient.get<CustomerWithDebt[]>('/customers', { params }).then((r) => {
      const data = r.data as unknown;
      return (Array.isArray(data) ? data : []) as CustomerWithDebt[];
    }),
};
