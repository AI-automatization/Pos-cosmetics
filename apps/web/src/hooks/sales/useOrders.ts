'use client';

import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/api/orders.api';
import type { OrdersQuery } from '@/types/order';

export const ORDERS_KEY = 'orders';

export function useOrders(params: OrdersQuery = {}) {
  return useQuery({
    queryKey: [ORDERS_KEY, params],
    queryFn: () => ordersApi.list(params),
    staleTime: 30_000,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: [ORDERS_KEY, id],
    queryFn: () => ordersApi.getById(id),
    staleTime: 60_000,
    enabled: !!id,
  });
}
