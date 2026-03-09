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

export interface ProductStockLevel {
  warehouseId: string;
  warehouseName: string;
  stock: number;
  nearestExpiry: string | null;
}

// Backend raw shape from /inventory/stock and /inventory/levels
interface StockLevelRaw {
  productId: string;
  warehouseId: string;
  stock: number;
  // May be present on low-stock endpoint
  productName?: string;
  sku?: string;
  warehouseName?: string;
  minStockLevel?: number;
}

function mapStockItem(raw: StockLevelRaw, isLow: boolean): StockItem {
  return {
    productId: raw.productId,
    productName: raw.productName ?? raw.productId,
    sku: raw.sku ?? '',
    warehouseId: raw.warehouseId,
    warehouseName: raw.warehouseName ?? raw.warehouseId,
    quantity: raw.stock,
    threshold: raw.minStockLevel ?? 0,
    isLow,
  };
}

// READ ONLY — financial mutations TAQIQLANGAN
export const inventoryApi = {
  // GET /inventory/stock — Backend returns plain StockLevelRaw[]; wrapped here as PaginatedResponse
  getStock: async (branchId?: string): Promise<PaginatedResponse<StockItem>> => {
    const { data } = await api.get<StockLevelRaw[]>('/inventory/stock', {
      params: { branchId },
    });
    const items = Array.isArray(data) ? data : [];
    return {
      data: items.map((raw) => mapStockItem(raw, false)),
      meta: { total: items.length, page: 1, limit: items.length, totalPages: 1 },
    };
  },

  // GET /inventory/stock/low — Backend returns plain StockLevelRaw[]
  getLowStock: async (branchId?: string): Promise<StockItem[]> => {
    const { data } = await api.get<StockLevelRaw[]>('/inventory/stock/low', {
      params: { branchId },
    });
    const items = Array.isArray(data) ? data : [];
    return items.map((raw) => mapStockItem(raw, true));
  },

  // GET /inventory/levels?productId=xxx — stock per warehouse for a single product
  getProductStock: async (productId: string): Promise<ProductStockLevel[]> => {
    const { data } = await api.get<StockLevelRaw[]>('/inventory/levels', {
      params: { productId },
    });
    const items = Array.isArray(data) ? data : [];
    return items.map((raw) => ({
      warehouseId: raw.warehouseId,
      warehouseName: raw.warehouseName ?? raw.warehouseId,
      stock: raw.stock,
      nearestExpiry: null,
    }));
  },
};
