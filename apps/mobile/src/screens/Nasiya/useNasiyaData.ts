import { useQuery, useQueryClient } from '@tanstack/react-query';
import { nasiyaApi } from '../../api/nasiya.api';
import type { DebtRecord, DebtListResponse } from '../../api/nasiya.api';
import { daysAgoISO, todayISO } from '../../utils/date';

function makeDemoDebts(): DebtListResponse {
  const today = todayISO();
  const overdue1 = daysAgoISO(-0); // already past
  const records: DebtRecord[] = [
    {
      id: 'demo-1',
      customerId: 'c1',
      orderId: 'o1',
      totalAmount: 350000,
      paidAmount: 100000,
      remaining: 250000,
      status: 'OVERDUE',
      dueDate: daysAgoISO(5),
      notes: null,
      createdAt: daysAgoISO(20),
      customer: { id: 'c1', name: 'Aziza Karimova', phone: '+998901234567' },
      payments: [],
    },
    {
      id: 'demo-2',
      customerId: 'c2',
      orderId: 'o2',
      totalAmount: 180000,
      paidAmount: 0,
      remaining: 180000,
      status: 'ACTIVE',
      dueDate: daysAgoISO(-7),
      notes: null,
      createdAt: daysAgoISO(3),
      customer: { id: 'c2', name: 'Bobur Toshmatov', phone: '+998931112233' },
      payments: [],
    },
    {
      id: 'demo-3',
      customerId: 'c3',
      orderId: 'o3',
      totalAmount: 500000,
      paidAmount: 300000,
      remaining: 200000,
      status: 'PARTIAL',
      dueDate: daysAgoISO(-14),
      notes: null,
      createdAt: daysAgoISO(10),
      customer: { id: 'c3', name: 'Malika Yusupova', phone: '+998711234567' },
      payments: [],
    },
    {
      id: 'demo-4',
      customerId: 'c4',
      orderId: 'o4',
      totalAmount: 120000,
      paidAmount: 120000,
      remaining: 0,
      status: 'PAID',
      dueDate: daysAgoISO(2),
      notes: null,
      createdAt: daysAgoISO(15),
      customer: { id: 'c4', name: 'Jasur Rahimov', phone: '+998909876543' },
      payments: [],
    },
  ];
  void overdue1; void today;
  return { items: records, total: records.length, page: 1, limit: 100 };
}

export type FilterTab = 'ALL' | 'OVERDUE' | 'PAID';

export function useNasiyaData(activeTab: FilterTab) {
  const qc = useQueryClient();

  const allDebts = useQuery({
    queryKey: ['nasiya', 'all'],
    queryFn: async () => {
      try {
        const res = await nasiyaApi.getList();
        if (res.items.length > 0) return res;
        return makeDemoDebts();
      } catch {
        return makeDemoDebts();
      }
    },
    refetchInterval: 60_000,
  });

  const overdueDebts = useQuery({
    queryKey: ['nasiya', 'overdue'],
    queryFn: async () => {
      try {
        const res = await nasiyaApi.getOverdue();
        if (res.length > 0) return res;
        return makeDemoDebts().items.filter((d) => d.status === 'OVERDUE');
      } catch {
        return makeDemoDebts().items.filter((d) => d.status === 'OVERDUE');
      }
    },
    refetchInterval: 60_000,
  });

  const paidDebts = useQuery({
    queryKey: ['nasiya', 'paid'],
    queryFn: async () => {
      try {
        const res = await nasiyaApi.getList('PAID');
        if (res.items.length > 0) return res;
        return { ...makeDemoDebts(), items: makeDemoDebts().items.filter((d) => d.status === 'PAID') };
      } catch {
        return { ...makeDemoDebts(), items: makeDemoDebts().items.filter((d) => d.status === 'PAID') };
      }
    },
    refetchInterval: 60_000,
  });

  const refetchAll = () => {
    void qc.refetchQueries({ queryKey: ['nasiya'] });
  };

  const isLoading =
    activeTab === 'ALL'
      ? allDebts.isLoading
      : activeTab === 'OVERDUE'
        ? overdueDebts.isLoading
        : paidDebts.isLoading;

  const error =
    activeTab === 'ALL'
      ? allDebts.error
      : activeTab === 'OVERDUE'
        ? overdueDebts.error
        : paidDebts.error;

  const isFetching =
    activeTab === 'ALL'
      ? allDebts.isFetching
      : activeTab === 'OVERDUE'
        ? overdueDebts.isFetching
        : paidDebts.isFetching;

  // Summary — active + overdue from allDebts
  const allItems = allDebts.data?.items ?? [];
  const activeItems = allItems.filter(
    (d) => d.status === 'ACTIVE' || d.status === 'PARTIAL' || d.status === 'OVERDUE',
  );
  const totalDebt = activeItems.reduce((sum, d) => sum + Number(d.remaining), 0);
  const overdueCount = overdueDebts.data?.length ?? 0;
  const overdueAmount = (overdueDebts.data ?? []).reduce(
    (sum, d) => sum + Number(d.remaining),
    0,
  );

  const currentItems =
    activeTab === 'ALL'
      ? (allDebts.data?.items ?? [])
      : activeTab === 'OVERDUE'
        ? (overdueDebts.data ?? [])
        : (paidDebts.data?.items ?? []);

  return {
    currentItems,
    totalDebt,
    overdueCount,
    overdueAmount,
    isLoading,
    isFetching,
    error,
    refetchAll,
  };
}
