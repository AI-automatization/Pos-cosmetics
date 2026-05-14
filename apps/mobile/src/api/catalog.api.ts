import api from './client';

// ─── Supplier types ────────────────────────────────────
export interface Supplier {
  id: string;
  name: string;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierDto {
  name: string;
  phone?: string;
  company?: string;
  address?: string;
}

export interface UpdateSupplierDto {
  name?: string;
  phone?: string;
  company?: string;
  address?: string;
  isActive?: boolean;
}

export interface SupplierDetail extends Supplier {
  productSuppliers?: {
    product: {
      id: string;
      name: string;
      sku: string | null;
      sellPrice: number;
      isActive: boolean;
    };
  }[];
}

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

export interface CreateProductDto {
  name: string;
  sku?: string;
  categoryId?: string;
  costPrice: number;
  sellPrice: number;
  minStockLevel?: number;
  barcode?: string;
  isActive: boolean;
  description?: string;
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

  createCategory: async (dto: {
    name: string;
    parentId?: string | null;
  }): Promise<CatalogCategory> => {
    const { data } = await api.post<CatalogCategory>('/catalog/categories', dto);
    return data;
  },

  updateCategory: async (
    id: string,
    dto: { name?: string; parentId?: string | null },
  ): Promise<CatalogCategory> => {
    const { data } = await api.patch<CatalogCategory>(
      `/catalog/categories/${id}`,
      dto,
    );
    return data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/catalog/categories/${id}`);
  },

  getProductById: async (id: string): Promise<CatalogProduct> => {
    const { data } = await api.get<CatalogProduct>(`/catalog/products/${id}`);
    return data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/catalog/products/${id}`);
  },

  createProduct: async (dto: CreateProductDto): Promise<CatalogProduct> => {
    const { data } = await api.post<CatalogProduct>('/catalog/products', dto);
    return data;
  },

  updateProduct: async (id: string, dto: Partial<CreateProductDto>): Promise<CatalogProduct> => {
    const { data } = await api.patch<CatalogProduct>(`/catalog/products/${id}`, dto);
    return data;
  },

  // ─── Suppliers ────────────────────────────────────────
  getSuppliers: async (): Promise<Supplier[]> => {
    const { data } = await api.get<Supplier[]>('/catalog/suppliers');
    return Array.isArray(data) ? data : [];
  },

  createSupplier: async (dto: CreateSupplierDto): Promise<Supplier> => {
    const { data } = await api.post<Supplier>('/catalog/suppliers', dto);
    return data;
  },

  updateSupplier: async (id: string, dto: UpdateSupplierDto): Promise<Supplier> => {
    const { data } = await api.patch<Supplier>(`/catalog/suppliers/${id}`, dto);
    return data;
  },

  deleteSupplier: async (id: string): Promise<void> => {
    await api.delete(`/catalog/suppliers/${id}`);
  },

  getSupplierById: async (id: string): Promise<SupplierDetail> => {
    const { data } = await api.get(`/catalog/suppliers/${id}`);
    return data;
  },
};
