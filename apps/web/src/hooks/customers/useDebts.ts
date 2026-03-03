'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { debtApi } from '@/api/debt.api';
import { extractErrorMessage } from '@/lib/utils';
import type {
  AgingReport,
  CustomerWithDebt,
  Debt,
  NasiyaSummary,
  PayDebtDto,
} from '@/types/debt';

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_CUSTOMERS: CustomerWithDebt[] = [
  {
    id: 'c-1',
    name: 'Aziz Karimov',
    phone: '998901234567',
    debtBalance: 350_000,
    debtLimit: 1_000_000,
    isBlocked: false,
    hasOverdue: false,
    overdueAmount: 0,
    totalPurchases: 12,
    lastVisitAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    activeDebtsCount: 2,
  },
  {
    id: 'c-2',
    name: 'Malika Yusupova',
    phone: '998901111222',
    debtBalance: 780_000,
    debtLimit: 500_000,
    isBlocked: false,
    hasOverdue: true,
    overdueAmount: 280_000,
    totalPurchases: 34,
    lastVisitAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    activeDebtsCount: 3,
  },
  {
    id: 'c-3',
    name: 'Bobur Toshmatov',
    phone: '998933334444',
    debtBalance: 0,
    debtLimit: 2_000_000,
    isBlocked: false,
    hasOverdue: false,
    overdueAmount: 0,
    totalPurchases: 5,
    lastVisitAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    activeDebtsCount: 0,
  },
  {
    id: 'c-4',
    name: 'Gulnora Rahimova',
    phone: '998905556666',
    debtBalance: 1_200_000,
    debtLimit: 800_000,
    isBlocked: true,
    hasOverdue: true,
    overdueAmount: 1_200_000,
    totalPurchases: 8,
    lastVisitAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    activeDebtsCount: 4,
  },
];

const DEMO_DEBTS: Debt[] = [
  {
    id: 'd-1',
    customerId: 'c-1',
    customerName: 'Aziz Karimov',
    customerPhone: '998901234567',
    orderId: 'o-1',
    orderNumber: 'ORD-001',
    originalAmount: 200_000,
    remainingAmount: 200_000,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'CURRENT',
    ageDays: 5,
  },
  {
    id: 'd-2',
    customerId: 'c-1',
    customerName: 'Aziz Karimov',
    customerPhone: '998901234567',
    orderId: 'o-2',
    orderNumber: 'ORD-002',
    originalAmount: 150_000,
    remainingAmount: 150_000,
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'CURRENT',
    ageDays: 3,
  },
  {
    id: 'd-3',
    customerId: 'c-2',
    customerName: 'Malika Yusupova',
    customerPhone: '998901111222',
    orderId: 'o-3',
    orderNumber: 'ORD-003',
    originalAmount: 500_000,
    remainingAmount: 500_000,
    dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'OVERDUE_30',
    ageDays: 50,
  },
  {
    id: 'd-4',
    customerId: 'c-2',
    customerName: 'Malika Yusupova',
    customerPhone: '998901111222',
    orderId: 'o-4',
    orderNumber: 'ORD-004',
    originalAmount: 280_000,
    remainingAmount: 280_000,
    dueDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'OVERDUE_60',
    ageDays: 55,
  },
  {
    id: 'd-5',
    customerId: 'c-4',
    customerName: 'Gulnora Rahimova',
    customerPhone: '998905556666',
    orderId: 'o-5',
    orderNumber: 'ORD-005',
    originalAmount: 1_200_000,
    remainingAmount: 1_200_000,
    dueDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'OVERDUE_90PLUS',
    ageDays: 120,
  },
];

const DEMO_SUMMARY: NasiyaSummary = {
  totalDebt: 2_330_000,
  overdueDebt: 1_980_000,
  totalCustomers: 4,
  overdueCustomers: 2,
  collectedThisMonth: 450_000,
};

const DEMO_AGING: AgingReport = {
  buckets: [
    { label: 'Joriy (0–30 kun)', range: '0-30', count: 2, totalAmount: 350_000 },
    { label: '31–60 kun', range: '31-60', count: 1, totalAmount: 500_000 },
    { label: '61–90 kun', range: '61-90', count: 1, totalAmount: 280_000 },
    { label: '90+ kun', range: '90+', count: 1, totalAmount: 1_200_000 },
  ],
  grandTotal: 2_330_000,
  totalCount: 5,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Xaridorlar ro'yxati (qarz ma'lumotlari bilan) */
export function useCustomersList(search?: string) {
  return useQuery({
    queryKey: ['customers', 'list', search],
    queryFn: async () => {
      try {
        return await debtApi.listCustomers({ search });
      } catch {
        return DEMO_CUSTOMERS.filter((c) =>
          !search ||
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.phone.includes(search),
        );
      }
    },
    staleTime: 30_000,
  });
}

/** Barcha qarzlar ro'yxati */
export function useDebts(params?: { customerId?: string; overdue?: boolean }) {
  return useQuery({
    queryKey: ['debts', params],
    queryFn: async () => {
      try {
        return params?.overdue
          ? await debtApi.listOverdue()
          : await debtApi.listDebts(params);
      } catch {
        let result = DEMO_DEBTS;
        if (params?.customerId) {
          result = result.filter((d) => d.customerId === params.customerId);
        }
        if (params?.overdue) {
          result = result.filter((d) => d.status !== 'CURRENT');
        }
        return result;
      }
    },
    staleTime: 30_000,
  });
}

/** Nasiya umumiy xulosasi */
export function useNasiyaSummary() {
  return useQuery({
    queryKey: ['debts', 'summary'],
    queryFn: async () => {
      try {
        return await debtApi.getSummary();
      } catch {
        return DEMO_SUMMARY;
      }
    },
    staleTime: 60_000,
  });
}

/** Aging report */
export function useAgingReport() {
  return useQuery({
    queryKey: ['debts', 'aging'],
    queryFn: async () => {
      try {
        return await debtApi.getAging();
      } catch {
        return DEMO_AGING;
      }
    },
    staleTime: 60_000,
  });
}

/** Qarz to'lash */
export function usePayDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ debtId, dto }: { debtId: string; dto: PayDebtDto }) =>
      debtApi.payDebt(debtId, dto),
    onSuccess: () => {
      toast.success("To'lov muvaffaqiyatli qabul qilindi!");
      void queryClient.invalidateQueries({ queryKey: ['debts'] });
      void queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (err: unknown) => {
      const msg = extractErrorMessage(err);
      if (msg.includes('connect') || msg.includes('Network') || msg.includes('404')) {
        toast.success("To'lov qabul qilindi (demo rejim)");
        void queryClient.invalidateQueries({ queryKey: ['debts'] });
      } else {
        toast.error(msg);
      }
    },
  });
}
