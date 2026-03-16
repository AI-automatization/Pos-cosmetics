import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics.api';
import { inventoryApi } from '../api/inventory.api';
import { useBranchStore } from '../store/branch.store';
import { QUERY_KEYS } from '../config/queryKeys';
import { Period, usePeriodFilter } from './usePeriodFilter';

export function useAnalytics(defaultPeriod: Period = 'month') {
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);
  const { period, setPeriod, fromDate, toDate } = usePeriodFilter(defaultPeriod);

  const revenueByBranch = useQuery({
    queryKey: QUERY_KEYS.analytics.revenueByBranch(period),
    queryFn: () => analyticsApi.getRevenueByBranch({ period, fromDate, toDate }),
  });

  const branchComparison = useQuery({
    queryKey: QUERY_KEYS.dashboard.branchComparison(),
    queryFn: () => analyticsApi.getBranchComparison({ period, fromDate, toDate }),
  });

  const stockValue = useQuery({
    queryKey: QUERY_KEYS.analytics.stockValue(selectedBranchId),
    queryFn: () => inventoryApi.getStockValue(selectedBranchId),
  });

  return { period, setPeriod, fromDate, toDate, revenueByBranch, branchComparison, stockValue };
}
