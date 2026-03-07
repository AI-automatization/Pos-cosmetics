import { apiClient } from './client';
import type { Order, OrdersQuery } from '@/types/order';

interface PaginatedOrders {
  items: Order[];
  total: number;
  page: number;
  limit: number;
}

export const ordersApi = {
  list(params: OrdersQuery = {}) {
    return apiClient
      .get<PaginatedOrders>('/sales/orders', { params })
      .then((r) => {
        const d = r.data as unknown as Record<string, unknown>;
        return {
          items: (d.items as Order[]) ?? [],
          total: (d.total as number) ?? 0,
          page: (d.page as number) ?? 1,
          limit: (d.limit as number) ?? 20,
        };
      });
  },

  getById(id: string) {
    return apiClient.get<Order>(`/sales/orders/${id}`).then((r) => r.data);
  },
};
