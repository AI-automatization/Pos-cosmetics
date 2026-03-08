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
  minStockLevel: number;
  expiryTracking: boolean;
}

// Backend Prisma product shape from /catalog/products/barcode/:code
interface ProductRaw {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  sellPrice: string | number;
  minStockLevel: number;
  expiryTracking: boolean;
  category: { id: string; name: string } | null;
  unit: { id: string; name: string; shortName: string } | null;
}

function mapProductRaw(raw: ProductRaw): ProductInfo {
  return {
    id: raw.id,
    name: raw.name,
    sku: raw.sku ?? '',
    barcode: raw.barcode ?? '',
    sellPrice: Number(raw.sellPrice),
    currency: 'UZS',
    stockQuantity: 0,    // not in catalog response — use inventoryApi.getProductStock
    expiryDate: null,    // per-batch in stock_movements, not per product
    categoryName: raw.category?.name ?? '',
    unitName: raw.unit?.name ?? '',
    minStockLevel: raw.minStockLevel,
    expiryTracking: raw.expiryTracking,
  };
}

// READ ONLY — product ma'lumotlarini ko'rish uchun
export const catalogApi = {
  getByBarcode: async (barcode: string): Promise<ProductInfo> => {
    const { data } = await api.get<ProductRaw>(`/catalog/products/barcode/${barcode}`);
    return mapProductRaw(data);
  },
};
