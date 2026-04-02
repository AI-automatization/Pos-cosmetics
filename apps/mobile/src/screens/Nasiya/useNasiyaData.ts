import { useQueryClient, useQuery } from '@tanstack/react-query';
import { nasiyaApi } from '../../api/nasiya.api';
import type { DebtRecord, DebtListResponse } from '../../api/nasiya.api';

export type FilterTab = 'ALL' | 'OVERDUE' | 'PAID';

export function useNasiyaData(activeTab: FilterTab) {
  const qc = useQueryClient();

  const { data: allData, isLoading: allLoading, isFetching: allFetching } = useQuery<DebtListResponse>({
    queryKey: ['nasiya', 'all'],
    queryFn: () => nasiyaApi.getList(),
    staleTime: 30_000,
  });

  const { data: overdueData, isLoading: overdueLoading, isFetching: overdueFetching } = useQuery<DebtRecord[]>({
    queryKey: ['nasiya', 'overdue'],
    queryFn: () => nasiyaApi.getOverdue(),
    staleTime: 30_000,
  });

  const { data: paidData, isLoading: paidLoading, isFetching: paidFetching } = useQuery<DebtListResponse>({
    queryKey: ['nasiya', 'paid'],
    queryFn: () => nasiyaApi.getList('PAID'),
    staleTime: 30_000,
  });

  const refetchAll = () => {
    void qc.refetchQueries({ queryKey: ['nasiya'] });
  };

  const isLoading =
    activeTab === 'ALL' ? allLoading :
    activeTab === 'OVERDUE' ? overdueLoading :
    paidLoading;

  const isFetching =
    activeTab === 'ALL' ? allFetching :
    activeTab === 'OVERDUE' ? overdueFetching :
    paidFetching;

  const allItems = allData?.items ?? [];
  const overdueItems = overdueData ?? [];

  const activeItems = allItems.filter(
    (d) => d.status === 'ACTIVE' || d.status === 'PARTIAL' || d.status === 'OVERDUE',
  );
  const totalDebt = activeItems.reduce((sum, d) => sum + Number(d.remaining), 0);
  const overdueCount = overdueItems.length;
  const overdueAmount = overdueItems.reduce((sum, d) => sum + Number(d.remaining), 0);
  const totalCount = allItems.length;

  const currentItems: DebtRecord[] =
    activeTab === 'ALL' ? allItems :
    activeTab === 'OVERDUE' ? overdueItems :
    (paidData?.items ?? []);

  return {
    currentItems,
    totalDebt,
    totalCount,
    overdueCount,
    overdueAmount,
    isLoading,
    isFetching,
    error: null,
    refetchAll,
  };
}
