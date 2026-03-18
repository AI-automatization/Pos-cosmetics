import { apiClient } from './client';
import type { Supplier, CreateSupplierDto, UpdateSupplierDto } from '@/types/supplier';

export const suppliersApi = {
  list() {
    return apiClient
      .get<Supplier[]>('/catalog/suppliers')
      .then((r) => (Array.isArray(r.data) ? r.data : []));
  },

  create(dto: CreateSupplierDto) {
    return apiClient.post<Supplier>('/catalog/suppliers', dto).then((r) => r.data);
  },

  update(id: string, dto: UpdateSupplierDto) {
    return apiClient.patch<Supplier>(`/catalog/suppliers/${id}`, dto).then((r) => r.data);
  },

  remove(id: string) {
    return apiClient.delete<void>(`/catalog/suppliers/${id}`).then((r) => r.data);
  },
};
