import type { Order, Shift } from '@raos/types';
import api from './client';

export interface OrdersFilter {
  from?: string;
  to?: string;
  limit?: number;
  page?: number;
}

export interface PaginatedOrders {
  data: Order[];
  total: number;
  page: number;
  limit: number;
}

export const salesApi = {
  getOrders: async (filter?: OrdersFilter): Promise<PaginatedOrders> => {
    const { data } = await api.get<PaginatedOrders>('/sales/orders', {
      params: filter,
    });
    return data;
  },

  getOrderById: async (orderId: string): Promise<Order> => {
    const { data } = await api.get<Order>(`/sales/orders/${orderId}`);
    return data;
  },

  getCurrentShift: async (): Promise<Shift | null> => {
    try {
      const { data } = await api.get<Shift>('/sales/shifts/current');
      return data;
    } catch {
      return null;
    }
  },
};
