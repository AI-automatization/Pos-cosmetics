import { useQuery } from '@tanstack/react-query';
import { salesApi } from '../../api';
import type { Order } from '@raos/types';

export function useSalesOrdersData() {
  const orders = useQuery({
    queryKey: ['sales', 'orders-admin'],
    queryFn: async (): Promise<Order[]> => {
      const res = await salesApi.getOrders({ limit: 100 });
      return (res.data ?? []) as Order[];
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  return { orders };
}
