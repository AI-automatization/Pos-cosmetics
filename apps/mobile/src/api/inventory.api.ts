import { api } from './client';
import type { PaginatedResponse } from '@raos/types';

export interface StockItem {
  productId: string;
  productName: string;
  sku: string;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  threshold: number;
  isLow: boolean;
}

// READ ONLY — financial mutations TAQIQLANGAN
export const inventoryApi = {
  getStock: async (branchId?: string): Promise<PaginatedResponse<StockItem>> => {
    const { data } = await api.get<PaginatedResponse<StockItem>>('/inventory/stock', {
      params: { branchId },
    });
    return data;
  },

  getLowStock: async (branchId?: string): Promise<StockItem[]> => {
    const { data } = await api.get<StockItem[]>('/inventory/stock/low', {
      params: { branchId },
    });
    return data;
  },
};
