import { apiClient } from './client';
import type { CreateOrderDto, Order } from '@/types/sales';

export const salesApi = {
  createOrder(dto: CreateOrderDto) {
    return apiClient.post<Order>('/sales/orders', dto).then((r) => r.data);
  },

  getOrder(id: string) {
    return apiClient.get<Order>(`/sales/orders/${id}`).then((r) => r.data);
  },
};
