import { useQuery } from '@tanstack/react-query';
import { analyticsApi, salesApi, alertsApi, branchApi } from '@/api';
import { QUERY_STALE_TIMES, REFETCH_INTERVALS } from '@/config/constants';

export function useDashboard(branchId?: string) {
  const revenue = useQuery({
    queryKey: ['dashboard', 'revenue', branchId],
    queryFn: () => analyticsApi.getRevenue(branchId),
    staleTime: QUERY_STALE_TIMES.DASHBOARD,
    refetchInterval: REFETCH_INTERVALS.DASHBOARD,
  });

  const alerts = useQuery({
    queryKey: ['dashboard', 'alerts', branchId],
    queryFn: () => alertsApi.getActive(branchId),
    staleTime: QUERY_STALE_TIMES.ALERTS,
    refetchInterval: REFETCH_INTERVALS.ALERTS,
  });

  const branches = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchApi.getAll(),
    staleTime: QUERY_STALE_TIMES.BRANCHES,
  });

  const branchComparison = useQuery({
    queryKey: ['dashboard', 'branches-comparison'],
    queryFn: () => analyticsApi.getBranchComparison(),
    staleTime: QUERY_STALE_TIMES.DASHBOARD,
    refetchInterval: REFETCH_INTERVALS.DASHBOARD,
  });

  const quickStats = useQuery({
    queryKey: ['dashboard', 'quick-stats', branchId],
    queryFn: () => salesApi.getQuickStats(branchId),
    staleTime: QUERY_STALE_TIMES.DASHBOARD,
    refetchInterval: REFETCH_INTERVALS.DASHBOARD,
  });

  const activeShifts = useQuery({
    queryKey: ['dashboard', 'active-shifts', branchId],
    queryFn: () => salesApi.getActiveShifts(branchId),
    staleTime: QUERY_STALE_TIMES.ALERTS,
    refetchInterval: REFETCH_INTERVALS.ALERTS,
  });

  return { revenue, alerts, branches, branchComparison, quickStats, activeShifts };
}
