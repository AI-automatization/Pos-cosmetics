import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics.api';
import { inventoryApi } from '../api/inventory.api';
import { debtsApi } from '../api/debts.api';
import { useBranchStore } from '../store/branch.store';
import { QUERY_KEYS } from '../config/queryKeys';
import { DASHBOARD_REFETCH_INTERVAL } from '../config/constants';

export function useDashboard() {
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const today = new Date().toISOString().split('T')[0];

  const revenue = useQuery({
    queryKey: QUERY_KEYS.dashboard.revenue(selectedBranchId),
    queryFn: () => analyticsApi.getRevenue({ branchId: selectedBranchId }),
    refetchInterval: DASHBOARD_REFETCH_INTERVAL,
  });

  const orders = useQuery({
    queryKey: QUERY_KEYS.dashboard.orders(selectedBranchId),
    queryFn: () => analyticsApi.getOrders({ branchId: selectedBranchId }),
    refetchInterval: DASHBOARD_REFETCH_INTERVAL,
  });

  const salesTrend = useQuery({
    queryKey: QUERY_KEYS.dashboard.salesTrend(selectedBranchId),
    queryFn: () =>
      analyticsApi.getSalesTrend({
        branchId: selectedBranchId,
        fromDate: thirtyDaysAgo,
        toDate: today,
        granularity: 'day',
      }),
  });

  const branchComparison = useQuery({
    queryKey: QUERY_KEYS.dashboard.branchComparison(),
    queryFn: () => analyticsApi.getBranchComparison({ period: 'month' }),
    enabled: selectedBranchId === null,
  });

  const topProducts = useQuery({
    queryKey: QUERY_KEYS.dashboard.topProducts(selectedBranchId),
    queryFn: () => analyticsApi.getTopProducts({ branchId: selectedBranchId, period: 'month', limit: 10 }),
  });

  const lowStock = useQuery({
    queryKey: QUERY_KEYS.inventory.lowStock(selectedBranchId),
    queryFn: () => inventoryApi.getLowStock(selectedBranchId),
    refetchInterval: DASHBOARD_REFETCH_INTERVAL,
  });

  const debtSummary = useQuery({
    queryKey: QUERY_KEYS.debts.summary(selectedBranchId),
    queryFn: () => debtsApi.getSummary(selectedBranchId),
    refetchInterval: DASHBOARD_REFETCH_INTERVAL,
  });

  return { revenue, orders, salesTrend, branchComparison, topProducts, lowStock, debtSummary };
}
