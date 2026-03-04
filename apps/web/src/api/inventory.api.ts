import { apiClient } from './client';
import type {
  StockLevel,
  StockMovement,
  StockInDto,
  StockOutDto,
  StockQuery,
} from '@/types/inventory';

export const inventoryApi = {
  // B-010 fix: backend route is /inventory/levels (not /inventory/stock)
  getStock(params: StockQuery = {}) {
    return apiClient
      .get<StockLevel[]>('/inventory/levels', {
        params: {
          ...(params.lowStockOnly ? { lowStock: 'true' } : {}),
        },
      })
      .then((r) => r.data);
  },

  // B-010 fix: backend route is /inventory/levels?lowStock=true
  getLowStock() {
    return apiClient
      .get<StockLevel[]>('/inventory/levels', { params: { lowStock: 'true' } })
      .then((r) => r.data);
  },

  getMovements(productId?: string) {
    return apiClient
      .get<StockMovement[]>('/inventory/movements', {
        params: productId ? { productId } : {},
      })
      .then((r) => r.data);
  },

  // B-010 note: backend uses POST /inventory/movements with type='IN' per item + warehouseId
  // Frontend DTO (StockInDto) has multi-item batch format — needs backend batch endpoint
  stockIn(dto: StockInDto) {
    return apiClient.post<void>('/inventory/stock-in', dto).then((r) => r.data);
  },

  stockOut(dto: StockOutDto) {
    return apiClient.post<void>('/inventory/stock-out', dto).then((r) => r.data);
  },
};
