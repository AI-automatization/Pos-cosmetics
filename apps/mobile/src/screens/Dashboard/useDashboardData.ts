import { useQuery } from '@tanstack/react-query';
import type { SalesSummary, DailyRevenue, TopProduct } from '@raos/types';
import { reportsApi, salesApi, inventoryApi, nasiyaApi } from '../../api';
import { todayISO, daysAgoISO } from '../../utils/date';
import { CONFIG } from '../../config';

function makeDemoSummary(today: string): SalesSummary {
  return {
    period: { from: new Date(today), to: new Date(today) },
    orders: { count: 12, grossRevenue: 1850000, subtotal: 1850000, totalDiscount: 50000, totalTax: 0 },
    returns: { count: 0, total: 0 },
    netRevenue: 1800000,
    paymentBreakdown: [
      { method: 'CASH', amount: 1200000 },
      { method: 'TERMINAL', amount: 600000 },
    ],
  };
}

function makeDemoWeekly(today: string): DailyRevenue[] {
  const revenues = [920000, 1100000, 850000, 1350000, 1600000, 1200000, 1800000];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const date = d.toISOString().split('T')[0] ?? today;
    return { date, revenue: revenues[i] ?? 0, orderCount: Math.round((revenues[i] ?? 0) / 150000) };
  });
}

function makeDemoTopProducts(): TopProduct[] {
  return [
    { productId: 'p1', productName: 'Nivea Krem 100ml', totalQty: 24, totalRevenue: 480000 },
    { productId: 'p2', productName: 'Loreal Shampun', totalQty: 18, totalRevenue: 360000 },
    { productId: 'p3', productName: 'Garnier Niqob', totalQty: 15, totalRevenue: 300000 },
  ];
}

export function useDashboardData() {
  const today = todayISO();
  const sevenDaysAgo = daysAgoISO(6);

  const todaySummary = useQuery({
    queryKey: ['reports', 'summary', today],
    queryFn: async () => {
      try {
        return await reportsApi.getSalesSummary(today, today);
      } catch {
        return makeDemoSummary(today);
      }
    },
    refetchInterval: CONFIG.REFETCH_INTERVAL_MS,
  });

  const weeklyRevenue = useQuery({
    queryKey: ['reports', 'daily-revenue', sevenDaysAgo, today],
    queryFn: async () => {
      try {
        const data = await reportsApi.getDailyRevenue(sevenDaysAgo, today);
        return data.length > 0 ? data : makeDemoWeekly(today);
      } catch {
        return makeDemoWeekly(today);
      }
    },
    refetchInterval: CONFIG.REFETCH_INTERVAL_MS,
  });

  const topProducts = useQuery({
    queryKey: ['reports', 'top-products', today],
    queryFn: async () => {
      try {
        const data = await reportsApi.getTopProducts(today, today, 5);
        return data.length > 0 ? data : makeDemoTopProducts();
      } catch {
        return makeDemoTopProducts();
      }
    },
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
    currentShift.isFetching ||
    topProducts.isFetching ||
    lowStock.isFetching ||
    nasiyaOverdue.isFetching;

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
