import type { Order, Shift } from '@raos/types';
import api from './client';

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface SaleDetail {
  id: string;
  branchName: string;
  cashierName: string;
  paymentMethod: string;
  total: number;
  currency: string;
  createdAt: string;
  items: SaleItem[];
}

export interface QuickStats {
  totalSalesToday: number;
  totalRevenueToday: number;
  currency: string;
  ordersCount: number;
  avgOrderValue: number;
}

export interface ActiveShift {
  id: string;
  branchId: string;
  branchName: string;
  cashierName: string;
  openedAt: string;
  totalSales: number;
  currency: string;
}

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

  getQuickStats: async (branchId?: string): Promise<QuickStats> => {
    const { data } = await api.get<QuickStats>('/sales/quick-stats', { params: { branchId } });
    return data;
  },

  getActiveShifts: async (branchId?: string): Promise<ActiveShift[]> => {
    const { data } = await api.get<ActiveShift[]>('/sales/shifts/active', { params: { branchId } });
    return data;
  },

  getById: async (saleId: string): Promise<SaleDetail> => {
    const { data } = await api.get<SaleDetail>(`/sales/orders/${saleId}`);
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
