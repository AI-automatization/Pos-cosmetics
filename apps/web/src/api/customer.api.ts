import { apiClient } from './client';
import type { Customer, CreateCustomerDto } from '@/types/customer';

export const customerApi = {
  /** Backend: GET /customers?search=:phone — returns array, take first match */
  searchByPhone: (phone: string): Promise<Customer | null> =>
    apiClient
      .get<Customer[] | { items: Customer[] }>('/customers', { params: { search: phone } })
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : (r.data as { items: Customer[] }).items ?? [];
        return list[0] ?? null;
      })
      .catch(() => null),

  create: (dto: CreateCustomerDto): Promise<Customer> =>
    apiClient.post<Customer>('/customers', dto).then((r) => r.data),

  getById: (id: string): Promise<Customer> =>
    apiClient.get<Customer>(`/customers/${id}`).then((r) => r.data),
};
