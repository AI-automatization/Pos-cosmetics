import { useQuery } from '@tanstack/react-query';
import { salesApi } from '../../api';
import { todayISO } from '../../utils/date';
import { CONFIG } from '../../config';
import { useShiftStore } from '../../store/shiftStore';

export function useSalesData() {
  const today = todayISO();
  const { shiftId, isShiftOpen } = useShiftStore();

  const orders = useQuery({
    queryKey: ['sales', 'orders', today],
    queryFn: () => salesApi.getOrders({ from: today, to: today, limit: 50 }),
    refetchInterval: CONFIG.REFETCH_INTERVAL_MS,
  });

  const shiftDetail = useQuery({
    queryKey: ['shift-detail', shiftId],
    queryFn: () => salesApi.getShiftById(shiftId!),
    enabled: !!shiftId && isShiftOpen,
    staleTime: 60_000,
  });

  return { orders, shiftDetail };
}
