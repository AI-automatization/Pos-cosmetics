import { apiClient } from './client';
import type {
  StockLevel,
  StockMovement,
  StockInDto,
  StockOutDto,
  StockQuery,
  StockTransfer,
  CreateTransferDto,
  TransferStatus,
} from '@/types/inventory';

export const inventoryApi = {
  getWarehouses() {
    return apiClient
      .get<{ id: string; name: string; branchId?: string | null }[]>('/inventory/warehouses')
      .then((r) => (Array.isArray(r.data) ? r.data : []));
  },

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

  // ─── Transfers ───

  listTransfers(params?: { status?: TransferStatus; branchId?: string; page?: number; limit?: number }) {
    return apiClient
      .get<{ items: StockTransfer[]; total: number }>('/inventory/transfers', { params })
      .then((r) => {
        const d = r.data;
        if (Array.isArray(d)) return { items: d as StockTransfer[], total: (d as StockTransfer[]).length };
        return { items: d?.items ?? [], total: d?.total ?? 0 };
      });
  },

  createTransfer(dto: CreateTransferDto) {
    return apiClient.post<StockTransfer>('/inventory/transfers', dto).then((r) => r.data);
  },

  approveTransfer(id: string) {
    return apiClient.patch<StockTransfer>(`/inventory/transfers/${id}/approve`).then((r) => r.data);
  },

  shipTransfer(id: string) {
    return apiClient.patch<StockTransfer>(`/inventory/transfers/${id}/ship`).then((r) => r.data);
  },

  receiveTransfer(id: string) {
    return apiClient.patch<StockTransfer>(`/inventory/transfers/${id}/receive`).then((r) => r.data);
  },

  cancelTransfer(id: string) {
    return apiClient.patch<StockTransfer>(`/inventory/transfers/${id}/cancel`).then((r) => r.data);
  },

  sendRestockRequest(dto: { productId: string; productName: string; currentStock: number }) {
    return apiClient.post<{ success: boolean; notifiedCount: number }>('/inventory/restock-request', dto).then((r) => r.data);
  },

  openTester(dto: { productId: string; warehouseId: string; quantity: number; costPrice: number; note?: string }) {
    return apiClient.post<{ movement: { id: string }; expense: { id: string }; totalCost: number }>('/inventory/testers', dto).then((r) => r.data);
  },

  getTesters(params: { from?: string; to?: string } = {}) {
    return apiClient.get<{ items: unknown[]; totalCost: number; count: number }>('/inventory/testers', { params }).then((r) => r.data);
  },
};
