import { api } from './client';

export interface ProductInfo {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  sellPrice: number;
  currency: string;
  stockQuantity: number;
  expiryDate: string | null;
  categoryName: string;
  unitName: string;
}

// READ ONLY — product ma'lumotlarini ko'rish uchun
export const catalogApi = {
  getByBarcode: async (barcode: string): Promise<ProductInfo> => {
    const { data } = await api.get<ProductInfo>(`/catalog/products/barcode/${barcode}`);
    return data;
  },
};
