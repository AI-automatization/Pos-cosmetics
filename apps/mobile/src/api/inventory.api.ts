import api from './client';

export interface LowStockItem {
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  stock: number;
  minStockLevel: number;
}

export interface ProductStockLevel {
  warehouseId: string;
  warehouseName: string;
  stock: number;
  nearestExpiry: string | null;
}

export const inventoryApi = {
  getLowStock: async (): Promise<LowStockItem[]> => {
    const { data } = await api.get<LowStockItem[]>('/inventory/levels', {
      params: { lowStock: true },
    });
    return data;
  },

  getProductStock: async (productId: string): Promise<ProductStockLevel[]> => {
    const { data } = await api.get<ProductStockLevel[]>(
      `/inventory/products/${productId}/stock`,
    );
    return data;
  },
};
