import api from './client';

export interface ProductInfo {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  sellPrice: number;
  costPrice: number;
  currency: string;
  categoryName: string;
  unitName: string;
  expiryTracking: boolean;
  minStockLevel: number;
  nearestExpiry: string | null;
  stockQuantity: number;
  expiryDate: string | null;
}

export const catalogApi = {
  getByBarcode: async (barcode: string): Promise<ProductInfo> => {
    const { data } = await api.get<ProductInfo>(
      `/catalog/products/barcode/${barcode}`,
    );
    return data;
  },
};
