// Catalog domain types
// TODO: Move to packages/types/ after backend implements schemas (T-011)

export interface BundleItem {
  id: string;
  bundleId: string;
  componentId: string;
  component?: { id: string; name: string; sku?: string; sellPrice: number };
  quantity: number;
}

export interface AddBundleComponentDto {
  componentId: string;
  quantity: number;
}

export interface ProductCertificate {
  id: string;
  productId: string;
  certNumber: string;
  issuingAuthority: string;
  issuedAt: string;
  expiresAt?: string | null;
  fileUrl?: string | null;
  createdAt: string;
}

export interface CreateCertificateDto {
  certNumber: string;
  issuingAuthority: string;
  issuedAt: string;
  expiresAt?: string;
  fileUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  children?: Category[];
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

/** Unit object returned by backend API */
export interface ProductUnitObject {
  id: string;
  name: string;
  shortName: string;
}

export interface Product {
  id: string;
  name: string;
  barcode: string | null;
  extraBarcodes?: string[];
  sku: string | null;
  categoryId: string | null;
  category: Pick<Category, 'id' | 'name'> | null;
  unitId: string | null;
  unit: ProductUnitObject | null;
  costPrice: number;
  sellPrice: number;
  /** Actual backend field name */
  minStockLevel: number;
  /** Populated by backend via StockMovement aggregate */
  currentStock: number;
  /** Actual backend field name */
  imageUrl: string | null;
  isActive: boolean;
  isBundle: boolean;
  bundleItems?: BundleItem[];
  /** Nearest batch expiry date (populated by backend for expiryTracking products) */
  expiryDate?: string | null;
  productSuppliers?: { supplierId: string }[];
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

/** String codes for unit labels in the UI form */
export type ProductUnitCode = 'dona' | 'kg' | 'litr' | 'metr' | 'quti' | 'juft';

/** @deprecated Use ProductUnitCode for form selects */
export type ProductUnit = ProductUnitCode;

export const PRODUCT_UNITS: { value: ProductUnitCode; label: string }[] = [
  { value: 'dona', label: 'Dona' },
  { value: 'kg', label: 'Kilogram' },
  { value: 'litr', label: 'Litr' },
  { value: 'metr', label: 'Metr' },
  { value: 'quti', label: 'Quti' },
  { value: 'juft', label: 'Juft' },
];

// --- API DTOs ---

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

/** Matches backend CreateProductDto field names */
export interface CreateProductDto {
  name: string;
  barcode?: string;
  extraBarcodes?: string[];
  sku?: string;
  categoryId?: string;
  unitId?: string;
  costPrice: number;
  sellPrice: number;
  minStockLevel?: number;
  isActive?: boolean;
  imageUrl?: string;
  description?: string;
  expiryTracking?: boolean;
  supplierId?: string;
  initialStock?: number;
}

export type UpdateProductDto = Partial<CreateProductDto>;

// --- Product Variants ---

export interface ProductVariant {
  id: string;
  productId: string;
  tenantId: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  costPrice: number;
  costCurrency: string;
  sellPrice: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVariantDto {
  name: string;
  sku?: string;
  barcode?: string;
  costPrice?: number;
  sellPrice?: number;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateVariantDto = Partial<CreateVariantDto>;

export interface CreateCategoryDto {
  name: string;
  parentId?: string;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;
