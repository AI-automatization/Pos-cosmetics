import { useQuery } from '@tanstack/react-query';
import { salesApi } from '../../api';
import { todayISO } from '../../utils/date';
import { CONFIG } from '../../config';

export function useSalesData() {
  const today = todayISO();

  const orders = useQuery({
    queryKey: ['sales', 'orders', today],
    queryFn: () => salesApi.getOrders({ from: today, to: today, limit: 50 }),
    refetchInterval: CONFIG.REFETCH_INTERVAL_MS,
  });

  return { orders };
}
