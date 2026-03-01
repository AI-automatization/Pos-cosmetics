import { api } from './client';
import type { PaginatedResponse, PaginationQuery } from '@raos/types';

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  id: string;
  branchId: string;
  branchName: string;
  cashierName: string;
  items: SaleItem[];
  total: number;
  currency: string;
  paymentMethod: string;
  status: 'COMPLETED' | 'REFUNDED' | 'PARTIAL_REFUND';
  createdAt: string;
}

export interface SalesQuery extends PaginationQuery {
  branchId?: string;
  from?: string;
  to?: string;
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
}

export interface QuickStats {
  ordersCount: number;
  avgBasket: number;
  currency: string;
  topProducts: TopProduct[];
}

export interface ActiveShift {
  id: string;
  branchId: string;
  branchName: string;
  cashierName: string;
  openedAt: string;
  openingCash: number;
  currency: string;
}

// READ ONLY — financial mutations TAQIQLANGAN
export const salesApi = {
  getAll: async (query: SalesQuery = {}): Promise<PaginatedResponse<Sale>> => {
    const { data } = await api.get<PaginatedResponse<Sale>>('/sales/orders', {
      params: query,
    });
    return data;
  },

  getById: async (id: string): Promise<Sale> => {
    const { data } = await api.get<Sale>(`/sales/orders/${id}`);
    return data;
  },

  getQuickStats: async (branchId?: string): Promise<QuickStats> => {
    const { data } = await api.get<QuickStats>('/sales/quick-stats', {
      params: { branchId },
    });
    return data;
  },

  getActiveShifts: async (branchId?: string): Promise<ActiveShift[]> => {
    const { data } = await api.get<ActiveShift[]>('/sales/shifts/active', {
      params: { branchId },
    });
    return data;
  },
};
