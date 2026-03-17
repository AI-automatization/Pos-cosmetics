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
      .get<{ items: StockMovement[]; total: number } | StockMovement[]>('/inventory/movements', {
        params: productId ? { productId } : {},
      })
      .then((r) => {
        const data = r.data;
        if (Array.isArray(data)) return data;
        if (data && Array.isArray((data as { items: StockMovement[] }).items)) return (data as { items: StockMovement[] }).items;
        return [];
      });
  },

  // Backend: POST /inventory/movements (single movement per request, requires warehouseId)
  // We fetch the default warehouse first, then send one request per item
  async stockIn(dto: StockInDto) {
    const warehouses = await apiClient
      .get<{ id: string }[]>('/inventory/warehouses')
      .then((r) => (Array.isArray(r.data) ? r.data : []));
    const warehouseId = warehouses[0]?.id;
    if (!warehouseId) throw new Error('No warehouse found. Please create a warehouse first.');
    for (const item of dto.items) {
      await apiClient.post('/inventory/movements', {
        warehouseId,
        productId: item.productId,
        type: 'IN',
        quantity: item.quantity,
        costPrice: item.costPrice,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
        note: [dto.supplier, dto.notes].filter(Boolean).join(' | ') || undefined,
      });
    }
  },

  async stockOut(dto: StockOutDto) {
    const warehouses = await apiClient
      .get<{ id: string }[]>('/inventory/warehouses')
      .then((r) => (Array.isArray(r.data) ? r.data : []));
    const warehouseId = warehouses[0]?.id;
    if (!warehouseId) throw new Error('No warehouse found. Please create a warehouse first.');
    for (const item of dto.items) {
      await apiClient.post('/inventory/movements', {
        warehouseId,
        productId: item.productId,
        type: 'OUT',
        quantity: item.quantity,
        note: dto.notes ?? dto.reason,
      });
    }
  },
};
