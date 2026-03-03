import api from './client';

export interface LowStockItem {
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  stock: number;
  minStockLevel: number;
}

export const inventoryApi = {
  getLowStock: async (): Promise<LowStockItem[]> => {
    const { data } = await api.get<LowStockItem[]>('/inventory/levels', {
      params: { lowStock: true },
    });
    return data;
  },
};
