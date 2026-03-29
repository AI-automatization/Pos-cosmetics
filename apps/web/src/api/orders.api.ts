import { apiClient } from './client';
import type { Order, OrdersQuery } from '@/types/order';

interface PaginatedOrders {
  items: Order[];
  total: number;
  page: number;
  limit: number;
}

type RawOrder = Order & {
  user?: { firstName?: string; lastName?: string } | null;
  customer?: { id: string; name: string; phone: string } | null;
};

export const ordersApi = {
  list(params: OrdersQuery = {}) {
    return apiClient
      .get<PaginatedOrders>('/sales/orders', { params })
      .then((r) => {
        const d = r.data as unknown as Record<string, unknown>;
        const raw = (d.items as RawOrder[]) ?? [];
        return {
          items: raw.map((item) => ({
            ...item,
            cashierName: item.user
              ? `${item.user.firstName ?? ''} ${item.user.lastName ?? ''}`.trim() || null
              : (item.cashierName ?? null),
            customerName: item.customer?.name ?? item.customerName ?? null,
          })) as Order[],
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
