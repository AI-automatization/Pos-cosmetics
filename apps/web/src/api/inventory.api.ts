import { apiClient } from './client';
import type {
  StockLevel,
  StockMovement,
  StockInDto,
  StockOutDto,
  StockQuery,
} from '@/types/inventory';

export const inventoryApi = {
  getStock(params: StockQuery = {}) {
    return apiClient
      .get<StockLevel[]>('/inventory/stock', { params })
      .then((r) => r.data);
  },

  getLowStock() {
    return apiClient
      .get<StockLevel[]>('/inventory/low-stock')
      .then((r) => r.data);
  },

  getMovements(productId?: string) {
    return apiClient
      .get<StockMovement[]>('/inventory/movements', {
        params: productId ? { productId } : {},
      })
      .then((r) => r.data);
  },

  stockIn(dto: StockInDto) {
    return apiClient.post<void>('/inventory/stock-in', dto).then((r) => r.data);
  },

  stockOut(dto: StockOutDto) {
    return apiClient.post<void>('/inventory/stock-out', dto).then((r) => r.data);
  },
};
