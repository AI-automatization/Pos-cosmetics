// ─── CATALOG TYPES ────────────────────────────────────────────

export interface Category {
  id: string;
  tenantId: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  children?: Category[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Unit {
  id: string;
  tenantId: string;
  name: string;
  shortName: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  tenantId: string;
  categoryId: string | null;
  unitId: string | null;
  name: string;
  sku: string | null;
  barcode: string | null;
  costPrice: number;
  sellPrice: number;
  minStockLevel: number;
  isActive: boolean;
  imageUrl: string | null;
  description: string | null;
  expiryTracking: boolean;
  category?: Pick<Category, 'id' | 'name'> | null;
  unit?: Pick<Unit, 'id' | 'name' | 'shortName'> | null;
  barcodes?: ProductBarcode[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductBarcode {
  id: string;
  productId: string;
  barcode: string;
  isPrimary: boolean;
  createdAt: Date;
}

export interface ProductFilter {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CreateProductPayload {
  name: string;
  sku?: string;
  barcode?: string;
  categoryId?: string;
  unitId?: string;
  costPrice: number;
  sellPrice: number;
  minStockLevel?: number;
  isActive?: boolean;
  imageUrl?: string;
  description?: string;
  expiryTracking?: boolean;
  extraBarcodes?: string[];
}

export type UpdateProductPayload = Partial<CreateProductPayload>;
