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

export interface CatalogProduct {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  sellPrice: number;
  costPrice: number;
  categoryId: string | null;
  categoryName: string | null;
  unitName: string | null;
  stockQuantity: number;
  minStockLevel: number;
  isActive: boolean;
}

export interface CatalogCategory {
  id: string;
  name: string;
  parentId: string | null;
}

export interface ProductsFilter {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export const catalogApi = {
  getByBarcode: async (barcode: string): Promise<ProductInfo> => {
    const { data } = await api.get<ProductInfo>(
      `/catalog/products/barcode/${barcode}`,
    );
    return data;
  },

  getProducts: async (filter?: ProductsFilter): Promise<CatalogProduct[]> => {
    const { data } = await api.get<{ items?: CatalogProduct[]; data?: CatalogProduct[] }>(
      '/catalog/products',
      { params: { isActive: true, limit: 200, ...filter } },
    );
    return data.items ?? data.data ?? [];
  },

  getCategories: async (): Promise<CatalogCategory[]> => {
    const { data } = await api.get<CatalogCategory[]>('/catalog/categories');
    return Array.isArray(data) ? data : [];
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/catalog/products/${id}`);
  },
};
