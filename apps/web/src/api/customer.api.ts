import { apiClient } from './client';
import type { Customer, CreateCustomerDto } from '@/types/customer';

export const customerApi = {
  searchByPhone: (phone: string): Promise<Customer | null> =>
    apiClient
      .get<Customer>(`/customers/phone/${encodeURIComponent(phone)}`)
      .then((r) => r.data)
      .catch(() => null),

  create: (dto: CreateCustomerDto): Promise<Customer> =>
    apiClient.post<Customer>('/customers', dto).then((r) => r.data),

  getById: (id: string): Promise<Customer> =>
    apiClient.get<Customer>(`/customers/${id}`).then((r) => r.data),
};
