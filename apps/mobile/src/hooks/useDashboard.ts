import { useQuery } from '@tanstack/react-query';
import { analyticsApi, salesApi, alertsApi, branchesApi as branchApi } from '@/api';
import { QUERY_STALE_TIMES, REFETCH_INTERVALS } from '@/config/constants';
import { safeQueryFn } from '@/utils/error';
import type { RevenueData, BranchRevenue, InsightItem } from '@/api/analytics.api';
import type { QuickStats, ActiveShift } from '@/api/sales.api';
import type { Alert } from '@/api/alerts.api';
import type { Branch } from '@/api/branches.api';

export function useDashboard(branchId?: string) {
  const revenue = useQuery({
    queryKey: ['dashboard', 'revenue', branchId],
    queryFn: safeQueryFn<RevenueData[]>(() => analyticsApi.getRevenue(branchId), []),
    staleTime: QUERY_STALE_TIMES.DASHBOARD,
    refetchInterval: REFETCH_INTERVALS.DASHBOARD,
  });

  const alerts = useQuery({
    queryKey: ['dashboard', 'alerts', branchId],
    queryFn: safeQueryFn<Alert[]>(() => alertsApi.getActive(branchId), []),
    staleTime: QUERY_STALE_TIMES.ALERTS,
    refetchInterval: REFETCH_INTERVALS.ALERTS,
  });

  const branches = useQuery({
    queryKey: ['branches'],
    queryFn: safeQueryFn<Branch[]>(() => branchApi.getAll(), []),
    staleTime: QUERY_STALE_TIMES.BRANCHES,
  });

  const branchComparison = useQuery({
    queryKey: ['dashboard', 'branches-comparison'],
    queryFn: safeQueryFn<BranchRevenue[]>(() => analyticsApi.getBranchComparison(), []),
    staleTime: QUERY_STALE_TIMES.DASHBOARD,
    refetchInterval: REFETCH_INTERVALS.DASHBOARD,
  });

  const quickStats = useQuery({
    queryKey: ['dashboard', 'quick-stats', branchId],
    queryFn: safeQueryFn<QuickStats | null>(() => salesApi.getQuickStats(branchId), null),
    staleTime: QUERY_STALE_TIMES.DASHBOARD,
    refetchInterval: REFETCH_INTERVALS.DASHBOARD,
  });

  const activeShifts = useQuery({
    queryKey: ['dashboard', 'active-shifts', branchId],
    queryFn: safeQueryFn<ActiveShift[]>(() => salesApi.getActiveShifts(branchId), []),
    staleTime: QUERY_STALE_TIMES.ALERTS,
    refetchInterval: REFETCH_INTERVALS.ALERTS,
  });

  const insights = useQuery({
    queryKey: ['dashboard', 'insights'],
    queryFn: safeQueryFn<InsightItem[]>(() => analyticsApi.getInsights(), []),
    staleTime: QUERY_STALE_TIMES.DASHBOARD,
  });

  return { revenue, alerts, branches, branchComparison, quickStats, activeShifts, insights };
}
