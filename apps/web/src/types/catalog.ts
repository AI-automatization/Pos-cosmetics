// Catalog domain types
// TODO: Move to packages/types/ after backend implements schemas (T-011)

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  children?: Category[];
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductUnitObject {
  id: string;
  name: string;
  shortName: string;
}

export interface Product {
  id: string;
  name: string;
  barcode: string | null;
  sku: string | null;
  categoryId: string;
  unitId?: string;
  category: Pick<Category, 'id' | 'name'>;
  /** API returns object; form uses string code */
  unit: ProductUnitObject | ProductUnitCode;
  costPrice: number | string;
  sellPrice: number | string;
  minStockLevel?: number | string;
  /** Legacy alias kept for form compatibility */
  minStock?: number;
  currentStock?: number;
  imageUrl?: string | null;
  image?: string | null;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductUnit = ProductUnitCode;
export type ProductUnitCode = 'dona' | 'kg' | 'litr' | 'metr' | 'quti' | 'juft';

export const PRODUCT_UNITS: { value: ProductUnit; label: string }[] = [
  { value: 'dona', label: 'Dona' },
  { value: 'kg', label: 'Kilogram' },
  { value: 'litr', label: 'Litr' },
  { value: 'metr', label: 'Metr' },
  { value: 'quti', label: 'Quti' },
  { value: 'juft', label: 'Juft' },
];

// --- API DTOs ---

export interface ProductUnitItem {
  id: string;
  name: string;
  shortName: string;
}

export interface ProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateProductDto {
  name: string;
  barcode?: string;
  sku?: string;
  categoryId?: string;
  unitId?: string;
  costPrice: number;
  sellPrice: number;
  minStockLevel?: number;
  isActive?: boolean;
}

export type UpdateProductDto = Partial<CreateProductDto> & { isActive?: boolean };

export interface CreateCategoryDto {
  name: string;
  parentId?: string;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;
