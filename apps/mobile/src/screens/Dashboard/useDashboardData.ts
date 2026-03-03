import { useQuery } from '@tanstack/react-query';
import { reportsApi, salesApi, inventoryApi, nasiyaApi } from '../../api';
import { todayISO, daysAgoISO } from '../../utils/date';
import { CONFIG } from '../../config';

export function useDashboardData() {
  const today = todayISO();
  const sevenDaysAgo = daysAgoISO(6);

  const todaySummary = useQuery({
    queryKey: ['reports', 'summary', today],
    queryFn: () => reportsApi.getSalesSummary(today, today),
    refetchInterval: CONFIG.REFETCH_INTERVAL_MS,
  });

  const weeklyRevenue = useQuery({
    queryKey: ['reports', 'daily-revenue', sevenDaysAgo, today],
    queryFn: () => reportsApi.getDailyRevenue(sevenDaysAgo, today),
    refetchInterval: CONFIG.REFETCH_INTERVAL_MS,
  });

  const topProducts = useQuery({
    queryKey: ['reports', 'top-products', today],
    queryFn: () => reportsApi.getTopProducts(today, today, 5),
    refetchInterval: CONFIG.REFETCH_INTERVAL_MS,
  });

  const currentShift = useQuery({
    queryKey: ['sales', 'shift', 'current'],
    queryFn: salesApi.getCurrentShift,
    refetchInterval: CONFIG.ALERTS_REFETCH_INTERVAL_MS,
  });

  const lowStock = useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: inventoryApi.getLowStock,
    refetchInterval: CONFIG.ALERTS_REFETCH_INTERVAL_MS,
  });

  const nasiyaOverdue = useQuery({
    queryKey: ['nasiya', 'overdue'],
    queryFn: nasiyaApi.getOverdue,
    refetchInterval: CONFIG.REFETCH_INTERVAL_MS,
  });

  // Derive summary from overdue list
  const nasiyaSummary = {
    ...nasiyaOverdue,
    data: nasiyaOverdue.data
      ? {
          overdueCount: nasiyaOverdue.data.length,
          overdueAmount: nasiyaOverdue.data.reduce(
            (sum, d) => sum + Number(d.remaining),
            0,
          ),
        }
      : undefined,
  };

  const refetchAll = () => {
    todaySummary.refetch();
    weeklyRevenue.refetch();
    topProducts.refetch();
    currentShift.refetch();
    lowStock.refetch();
    nasiyaOverdue.refetch();
  };

  const isLoading =
    todaySummary.isLoading ||
    weeklyRevenue.isLoading ||
    currentShift.isLoading;

  const isRefreshing =
    todaySummary.isFetching ||
    weeklyRevenue.isFetching ||
    currentShift.isFetching;

  return {
    todaySummary,
    weeklyRevenue,
    topProducts,
    currentShift,
    lowStock,
    nasiyaSummary,
    isLoading,
    isRefreshing,
    refetchAll,
  };
}
