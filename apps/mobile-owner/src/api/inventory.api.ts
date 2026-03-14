import { apiClient } from './client';
import { ENDPOINTS } from '../config/endpoints';

export type InventoryStatus = 'normal' | 'low' | 'out_of_stock' | 'expiring' | 'expired';

export interface InventoryItem {
  readonly id: string;
  readonly productName: string;
  readonly barcode: string;
  readonly quantity: number;
  readonly unit: string;
  readonly branchName: string;
  readonly branchId: string;
  readonly costPrice: number;
  readonly stockValue: number;
  readonly reorderLevel: number;
  readonly expiryDate: string | null;
  readonly status: InventoryStatus;
}

export interface InventoryParams {
  branchId?: string | null;
  status?: InventoryStatus | 'all';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface StockValueData {
  totalValue: number;
  byBranch: Array<{ branchId: string; branchName: string; value: number }>;
}

export const inventoryApi = {
  async getStock(params: InventoryParams): Promise<PaginatedResponse<InventoryItem>> {
    const { data } = await apiClient.get<PaginatedResponse<InventoryItem>>(ENDPOINTS.INVENTORY_STOCK, {
      params: {
        branch_id: params.branchId ?? undefined,
        status: params.status !== 'all' ? params.status : undefined,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      },
    });
    return data;
  },

  async getLowStock(branchId?: string | null): Promise<InventoryItem[]> {
    const { data } = await apiClient.get<InventoryItem[]>(ENDPOINTS.INVENTORY_LOW_STOCK, {
      params: { branch_id: branchId ?? undefined },
    });
    return data;
  },

  async getExpiring(branchId?: string | null, days: number = 30): Promise<InventoryItem[]> {
    const { data } = await apiClient.get<InventoryItem[]>(ENDPOINTS.INVENTORY_EXPIRING, {
      params: { branch_id: branchId ?? undefined, days },
    });
    return data;
  },

  async getOutOfStock(branchId?: string | null): Promise<InventoryItem[]> {
    const { data } = await apiClient.get<InventoryItem[]>(ENDPOINTS.INVENTORY_OUT_OF_STOCK, {
      params: { branch_id: branchId ?? undefined },
    });
    return data;
  },

  async getStockValue(branchId?: string | null): Promise<StockValueData> {
    const { data } = await apiClient.get<StockValueData>(ENDPOINTS.INVENTORY_STOCK_VALUE, {
      params: { branch_id: branchId ?? undefined },
    });
    return data;
  },
};
