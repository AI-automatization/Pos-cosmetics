import { useQuery } from '@tanstack/react-query';
import { salesApi } from '../../api';
import { todayISO } from '../../utils/date';
import { CONFIG } from '../../config';
import { useShiftStore } from '../../store/shiftStore';

export function useSalesData(from: string, to: string) {
  const { shiftId, isShiftOpen } = useShiftStore();

  const orders = useQuery({
    queryKey: ['sales', 'orders', from, to],
    queryFn: () => salesApi.getOrders({ from, to, limit: 50 }),
    refetchInterval: CONFIG.REFETCH_INTERVAL_MS,
    staleTime: 30_000,
  });

  const shiftDetail = useQuery({
    queryKey: ['shift-detail', shiftId],
    queryFn: () => salesApi.getShiftById(shiftId!),
    enabled: !!shiftId && isShiftOpen,
    staleTime: 60_000,
  });

  return { orders, shiftDetail };
}

// Default export uchun today range — backward compat kerak bo'lsa
export function useSalesDataToday() {
  const today = todayISO();
  return useSalesData(today, today);
}
