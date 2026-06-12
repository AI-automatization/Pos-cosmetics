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
  GenerateVariantMatrixDto,
  BundleItem,
  AddBundleComponentDto,
  ProductCertificate,
  CreateCertificateDto,
} from '@/types/catalog';

export const catalogApi = {
  // --- Products ---

  getProducts(params: ProductsQuery = {}) {
    interface FlatPaginatedProducts {
      items: Product[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }
    return apiClient
      .get<PaginatedResponse<Product> | FlatPaginatedProducts>(
        '/catalog/products',
        { params },
      )
      .then((r) => {
        const d = r.data;
        // Normalize flat backend shape → PaginatedResponse shape
        if ('meta' in d) return d as PaginatedResponse<Product>;
        const flat = d as FlatPaginatedProducts;
        return {
          items: flat.items ?? [],
          meta: {
            total: flat.total ?? 0,
            page: flat.page ?? 1,
            limit: flat.limit ?? 20,
            totalPages: flat.totalPages ?? 1,
          },
        } satisfies PaginatedResponse<Product>;
      });
  },

  getProduct(id: string) {
    return apiClient.get<Product>(`/catalog/products/${id}`).then((r) => r.data);
  },

  getByBarcode(barcode: string) {
    return apiClient
      .get<Product>(`/catalog/products/barcode/${encodeURIComponent(barcode)}`)
      .then((r) => r.data);
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

  generateVariantMatrix(productId: string, dto: GenerateVariantMatrixDto) {
    return apiClient
      .post<ProductVariant[]>(`/catalog/products/${productId}/variants/generate-matrix`, dto)
      .then((r) => r.data);
  },

  // --- Units ---

  getUnits() {
    return apiClient.get<ProductUnitObject[]>('/catalog/units').then((r) => r.data);
  },

  createUnit(dto: { name: string; shortName: string }) {
    return apiClient.post<ProductUnitObject>('/catalog/units', dto).then((r) => r.data);
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

  // ─── Certificates ───

  getCertificates(productId: string) {
    return apiClient
      .get<ProductCertificate[]>(`/catalog/products/${productId}/certificates`)
      .then((r) => (Array.isArray(r.data) ? r.data : []));
  },

  createCertificate(productId: string, dto: CreateCertificateDto) {
    return apiClient
      .post<ProductCertificate>(`/catalog/products/${productId}/certificates`, dto)
      .then((r) => r.data);
  },

  deleteCertificate(productId: string, certId: string) {
    return apiClient
      .delete<void>(`/catalog/products/${productId}/certificates/${certId}`)
      .then((r) => r.data);
  },
};
