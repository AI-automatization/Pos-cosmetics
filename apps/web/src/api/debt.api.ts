import { apiClient } from './client';
import type {
  Debt,
  DebtStatus,
  DebtPayment,
  PayDebtDto,
  AgingReport,
  NasiyaSummary,
  CustomerWithDebt,
} from '@/types/debt';

// Backend DebtRecord shape (Prisma serialization)
interface BackendDebt {
  id: string;
  customerId: string;
  orderId?: string | null;
  totalAmount: number | string;
  paidAmount: number | string;
  remaining: number | string;
  dueDate?: string | null;
  status: 'ACTIVE' | 'PARTIAL' | 'OVERDUE' | 'PAID';
  createdAt: string;
  customer?: { id: string; name: string; phone: string };
}

function computeDebtStatus(b: BackendDebt): DebtStatus {
  if (b.status === 'OVERDUE' && b.dueDate) {
    const days = Math.floor((Date.now() - new Date(b.dueDate).getTime()) / 86400000);
    if (days <= 30) return 'OVERDUE_30';
    if (days <= 60) return 'OVERDUE_60';
    if (days <= 90) return 'OVERDUE_90';
    return 'OVERDUE_90PLUS';
  }
  if (b.dueDate && new Date(b.dueDate) < new Date() && b.status !== 'PAID') {
    return 'OVERDUE_30';
  }
  return 'CURRENT';
}

function normalizeDebt(b: BackendDebt): Debt {
  const ageDays = b.dueDate
    ? Math.max(0, Math.floor((Date.now() - new Date(b.dueDate).getTime()) / 86400000))
    : 0;
  return {
    id: b.id,
    customerId: b.customerId,
    customerName: b.customer?.name ?? '—',
    customerPhone: b.customer?.phone ?? '—',
    orderId: b.orderId ?? '',
    originalAmount: Number(b.totalAmount),
    remainingAmount: Number(b.remaining),
    dueDate: b.dueDate ?? '',
    createdAt: b.createdAt,
    status: computeDebtStatus(b),
    ageDays,
  };
}

export const debtApi = {
  listDebts: (params?: { customerId?: string; status?: string; overdue?: boolean }): Promise<Debt[]> =>
    apiClient.get('/nasiya', { params }).then((r) => {
      const d = r.data;
      const raw: BackendDebt[] = Array.isArray(d) ? d : (d?.items ?? []);
      return raw.map(normalizeDebt);
    }),

  listOverdue: (): Promise<Debt[]> =>
    apiClient.get('/nasiya/overdue').then((r) => {
      const d = r.data;
      const raw: BackendDebt[] = Array.isArray(d) ? d : (d?.items ?? []);
      return raw.map(normalizeDebt);
    }),

  payDebt: (debtId: string, dto: PayDebtDto): Promise<DebtPayment> =>
    apiClient.post<DebtPayment>(`/nasiya/${debtId}/pay`, dto).then((r) => r.data),

  getSummary: (): Promise<NasiyaSummary> =>
    apiClient.get('/nasiya').then((r) => {
      const d = r.data;
      const raw: BackendDebt[] = Array.isArray(d) ? d : (d?.items ?? []);
      const items = raw.map(normalizeDebt);
      const totalDebt = items.reduce((s, x) => s + x.remainingAmount, 0);
      const overdueItems = items.filter((x) => x.status !== 'CURRENT');
      const overdueDebt = overdueItems.reduce((s, x) => s + x.remainingAmount, 0);
      return {
        totalDebt,
        overdueDebt,
        totalCustomers: items.length,
        overdueCustomers: overdueItems.length,
        collectedThisMonth: 0,
      } satisfies NasiyaSummary;
    }),

  getAging: (): Promise<AgingReport> =>
    Promise.resolve({ buckets: [] } as unknown as AgingReport),

  getCustomerDebts: (customerId: string): Promise<Debt[]> =>
    apiClient.get('/nasiya', { params: { customerId } }).then((r) => {
      const d = r.data;
      const raw: BackendDebt[] = Array.isArray(d) ? d : (d?.items ?? []);
      return raw.map(normalizeDebt);
    }),

  listCustomers: (params?: { search?: string }): Promise<CustomerWithDebt[]> =>
    apiClient.get('/customers', { params }).then((r) => {
      const d = r.data;
      const raw: { id: string; name: string; phone: string; debtBalance?: number; debtLimit?: number; isBlocked?: boolean }[] =
        Array.isArray(d) ? d : (d?.items ?? []);
      return raw.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone ?? '',
        debtBalance: c.debtBalance ?? 0,
        debtLimit: c.debtLimit ?? 0,
        isBlocked: c.isBlocked ?? false,
        hasOverdue: false,
        overdueAmount: 0,
        totalPurchases: 0,
        lastVisitAt: null,
        activeDebtsCount: 0,
      }));
    }),
};
