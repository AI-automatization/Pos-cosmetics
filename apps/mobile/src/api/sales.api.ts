import type { Order, Shift, OpenShiftPayload, CloseShiftPayload, CreateOrderPayload } from '@raos/types';
import api from './client';

/**
 * T-447: packages/types dagi Order da paymentMethod yo'q.
 * packages/types zonasiga tegmasdan, mobile-lokal intersection type yaratildi.
 */
export type OrderWithMethod = Order & { paymentMethod?: string | null };

export interface ShiftDetail extends Shift {
  totalRevenue?: number;
  totalOrders?: number;
  cashAmount?: number;
  cardAmount?: number;
  nasiyaAmount?: number;
  expenses?: number;
  user?: { firstName: string; lastName: string };
  paymentBreakdown?: { method: string; amount: number }[];
}

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
  data: OrderWithMethod[];
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

  getOrderById: async (orderId: string): Promise<OrderWithMethod> => {
    const { data } = await api.get<OrderWithMethod>(`/sales/orders/${orderId}`);
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

  openShiftApi: async (payload: OpenShiftPayload): Promise<Shift> => {
    const { data } = await api.post<Shift>('/sales/shifts/open', payload);
    return data;
  },

  closeShiftApi: async (id: string, payload: CloseShiftPayload): Promise<Shift> => {
    const { data } = await api.post<Shift>(`/sales/shifts/${id}/close`, payload);
    return data;
  },

  getShiftById: async (id: string): Promise<ShiftDetail> => {
    const { data } = await api.get<ShiftDetail>(`/sales/shifts/${id}`);
    return data;
  },

  getShifts: async (page = 1, limit = 5): Promise<{ items: ShiftDetail[]; total: number }> => {
    const { data } = await api.get<{ items: ShiftDetail[]; total: number }>('/sales/shifts', {
      params: { page, limit },
    });
    return data;
  },

  createOrder: async (payload: CreateOrderPayload): Promise<OrderWithMethod> => {
    const { data } = await api.post<OrderWithMethod>('/sales/orders', payload);
    return data;
  },

  returnOrder: async (
    orderId: string,
    body: { items: { productId: string; quantity: number }[]; reason: string },
  ): Promise<void> => {
    await api.post(`/sales/orders/${orderId}/return`, body);
  },
};
