import { apiClient } from './client';
import type {
  Product,
  Category,
  ProductsQuery,
  PaginatedResponse,
  CreateProductDto,
  UpdateProductDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@/types/catalog';

export const catalogApi = {
  // --- Products ---

  getProducts(params: ProductsQuery = {}) {
    return apiClient
      .get<PaginatedResponse<Product>>('/catalog/products', { params })
      .then((r) => r.data);
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
};
