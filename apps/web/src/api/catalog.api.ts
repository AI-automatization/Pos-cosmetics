import { apiClient } from './client';
import type {
  Product,
  Category,
  ProductUnitObject,
  ProductsQuery,
  PaginatedResponse,
  CreateProductDto,
  UpdateProductDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  ProductVariant,
  CreateVariantDto,
  UpdateVariantDto,
  BundleItem,
  AddBundleComponentDto,
} from '@/types/catalog';

export const catalogApi = {
  // --- Products ---

  getProducts(params: ProductsQuery = {}) {
    return apiClient
      .get<PaginatedResponse<Product> | { items: Product[]; total: number; page: number; limit: number; totalPages: number }>(
        '/catalog/products',
        { params },
      )
      .then((r) => {
        const d = r.data as Record<string, unknown>;
        // Normalize flat backend shape → PaginatedResponse shape
        if ('meta' in d) return d as unknown as PaginatedResponse<Product>;
        return {
          items: (d.items as Product[]) ?? [],
          meta: {
            total: (d.total as number) ?? 0,
            page: (d.page as number) ?? 1,
            limit: (d.limit as number) ?? 20,
            totalPages: (d.totalPages as number) ?? 1,
          },
        } satisfies PaginatedResponse<Product>;
      });
  },

  getProduct(id: string) {
    return apiClient.get<Product>(`/catalog/products/${id}`).then((r) => r.data);
  },

  createProduct(dto: CreateProductDto) {
    return apiClient.post<Product>('/catalog/products', dto).then((r) => r.data);
  },

  updateProduct(id: string, dto: UpdateProductDto) {
    return apiClient.patch<Product>(`/catalog/products/${id}`, dto).then((r) => r.data);
  },

  deleteProduct(id: string) {
    return apiClient.delete<void>(`/catalog/products/${id}`).then((r) => r.data);
  },

  // --- Variants ---

  getVariants(productId: string) {
    return apiClient
      .get<ProductVariant[]>(`/catalog/products/${productId}/variants`)
      .then((r) => r.data);
  },

  createVariant(productId: string, dto: CreateVariantDto) {
    return apiClient
      .post<ProductVariant>(`/catalog/products/${productId}/variants`, dto)
      .then((r) => r.data);
  },

  updateVariant(productId: string, variantId: string, dto: UpdateVariantDto) {
    return apiClient
      .patch<ProductVariant>(`/catalog/products/${productId}/variants/${variantId}`, dto)
      .then((r) => r.data);
  },

  deleteVariant(productId: string, variantId: string) {
    return apiClient
      .delete<void>(`/catalog/products/${productId}/variants/${variantId}`)
      .then((r) => r.data);
  },

  // --- Units ---

  getUnits() {
    return apiClient.get<ProductUnitObject[]>('/catalog/units').then((r) => r.data);
  },

  // --- Categories ---

  getCategories() {
    return apiClient.get<Category[]>('/catalog/categories').then((r) => r.data);
  },

  createCategory(dto: CreateCategoryDto) {
    return apiClient.post<Category>('/catalog/categories', dto).then((r) => r.data);
  },

  updateCategory(id: string, dto: UpdateCategoryDto) {
    return apiClient
      .patch<Category>(`/catalog/categories/${id}`, dto)
      .then((r) => r.data);
  },

  deleteCategory(id: string) {
    return apiClient.delete<void>(`/catalog/categories/${id}`).then((r) => r.data);
  },

  // ─── Bundles ───

  getBundleComponents(productId: string) {
    return apiClient
      .get<BundleItem[]>(`/catalog/products/${productId}/components`)
      .then((r) => (Array.isArray(r.data) ? r.data : []));
  },

  addBundleComponent(productId: string, dto: AddBundleComponentDto) {
    return apiClient
      .post<BundleItem>(`/catalog/products/${productId}/components`, dto)
      .then((r) => r.data);
  },

  removeBundleComponent(productId: string, componentId: string) {
    return apiClient
      .delete<void>(`/catalog/products/${productId}/components/${componentId}`)
      .then((r) => r.data);
  },
};
