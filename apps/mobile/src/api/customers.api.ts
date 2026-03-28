import api from './client';

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
}

export const customersApi = {
  search: async (query: string): Promise<Customer[]> => {
    const { data } = await api.get<Customer[]>('/customers', { params: { search: query } });
    return Array.isArray(data) ? data : [];
  },

  create: async (name: string, phone?: string): Promise<Customer> => {
    const { data } = await api.post<Customer>('/customers', {
      name,
      ...(phone ? { phone } : {}),
    });
    return data;
  },
};
