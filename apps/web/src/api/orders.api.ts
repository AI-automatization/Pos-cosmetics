import { apiClient } from './client';
import type { Order, OrdersQuery } from '@/types/order';

interface RawPaginatedOrders {
  items: RawOrder[];
  total: number;
  page: number;
  limit: number;
}

interface RawOrder extends Order {
  user?: { firstName?: string; lastName?: string } | null;
  customer?: { id: string; name: string; phone: string } | null;
  payments?: Array<{ method: string }> | null;
}

/** Backend may wrap single-order response in { data: ... } */
interface WrappedOrderResponse {
  data: RawOrder;
}

function normalizeOrder(raw: RawOrder): Order {
  return {
    ...raw,
    cashierName: raw.user
      ? `${raw.user.firstName ?? ''} ${raw.user.lastName ?? ''}`.trim() || null
      : (raw.cashierName ?? null),
    paymentMethod:
      raw.paymentMethod ??
      (raw.paymentIntents?.[0]?.method as Order['paymentMethod']) ??
      (raw.payments?.[0]?.method as Order['paymentMethod']) ??
      undefined,
    customerName: raw.customer?.name ?? raw.customerName ?? null,
  };
}

export const ordersApi = {
  list(params: OrdersQuery = {}) {
    return apiClient
      .get<RawPaginatedOrders>('/sales/orders', { params })
      .then((r) => {
        const d = r.data;
        const raw = d.items ?? [];
        return {
          items: raw.map(normalizeOrder),
          total: d.total ?? 0,
          page: d.page ?? 1,
          limit: d.limit ?? 20,
        };
      });
  },

  getById(id: string) {
    return apiClient.get<RawOrder | WrappedOrderResponse>(`/sales/orders/${id}`).then((r) => {
      const raw = 'data' in r.data && typeof r.data.data === 'object' && r.data.data !== null && 'id' in r.data.data
        ? (r.data as WrappedOrderResponse).data
        : r.data as RawOrder;
      return normalizeOrder(raw);
    });
  },

  getByOrderNumber(orderNumber: number) {
    return apiClient.get<RawOrder>(`/sales/orders/by-number/${orderNumber}`).then((r) => {
      return normalizeOrder(r.data);
    });
  },
};
