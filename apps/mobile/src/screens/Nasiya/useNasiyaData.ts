import { useQuery, useQueryClient } from '@tanstack/react-query';
import { nasiyaApi } from '../../api/nasiya.api';

export type FilterTab = 'ALL' | 'OVERDUE' | 'PAID';

export function useNasiyaData(activeTab: FilterTab) {
  const qc = useQueryClient();

  const allDebts = useQuery({
    queryKey: ['nasiya', 'all'],
    queryFn: () => nasiyaApi.getList(),
    refetchInterval: 60_000,
  });

  const overdueDebts = useQuery({
    queryKey: ['nasiya', 'overdue'],
    queryFn: () => nasiyaApi.getOverdue(),
    refetchInterval: 60_000,
  });

  const paidDebts = useQuery({
    queryKey: ['nasiya', 'paid'],
    queryFn: () => nasiyaApi.getList('PAID'),
    refetchInterval: 120_000,
  });

  const refetchAll = () => {
    void qc.invalidateQueries({ queryKey: ['nasiya'] });
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
