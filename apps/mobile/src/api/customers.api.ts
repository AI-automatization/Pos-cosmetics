import api from './client';

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  birthDate: string | null;
  address: string | null;
  gender: 'MALE' | 'FEMALE' | null;
  debtLimit: number;
  notes: string | null;
  branchId: string | null;
  isActive: boolean;
  debtBalance: number;
}

export interface CustomerStats {
  orderCount: number;
  totalSpent: number;
  debtBalance: number;
}

export interface UpdateCustomerDto {
  name?: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  address?: string;
  gender?: 'MALE' | 'FEMALE';
  debtLimit?: number;
  notes?: string;
  isActive?: boolean;
}

export const customersApi = {
  search: async (query: string, branchId?: string): Promise<Customer[]> => {
    const { data } = await api.get<Customer[]>('/customers', {
      params: { search: query, ...(branchId ? { branchId } : {}) },
    });
    return Array.isArray(data) ? data : [];
  },

  create: async (name: string, phone?: string): Promise<Customer> => {
    const { data } = await api.post<Customer>('/customers', {
      name,
      ...(phone ? { phone } : {}),
    });
    return data;
  },

  getById: async (id: string): Promise<Customer> => {
    const { data } = await api.get<Customer>(`/customers/${id}`);
    return data;
  },

  getStats: async (id: string): Promise<CustomerStats> => {
    const { data } = await api.get<CustomerStats>(`/customers/${id}/stats`);
    return data;
  },

  update: async (id: string, dto: UpdateCustomerDto): Promise<Customer> => {
    const { data } = await api.patch<Customer>(`/customers/${id}`, dto);
    return data;
  },
};
