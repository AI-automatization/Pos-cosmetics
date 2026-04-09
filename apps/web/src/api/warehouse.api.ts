import { apiClient } from './client';

export interface InvoiceItem {
  productId: string;
  quantity: number;
  purchasePrice: number;
  warehouseId?: string;
  batchNumber?: string;
}

export interface CreateInvoiceDto {
  supplierId?: string;
  invoiceNumber?: string;
  note?: string;
  branchId?: string;
  items: InvoiceItem[];
}

export interface WarehouseInvoice {
  id: string;
  tenantId: string;
  supplierId?: string;
  invoiceNumber?: string;
  note?: string;
  totalCost: number;
  createdBy: string;
  createdAt: string;
  items: {
    id: string;
    productId: string;
    quantity: number;
    purchasePrice: number;
    totalCost: number;
    batchNumber?: string;
    expiryDate?: string;
  }[];
}

export type WriteOffReason = 'DAMAGED' | 'EXPIRED' | 'LOST' | 'OTHER';

export interface WriteOffDto {
  reason: WriteOffReason;
  note?: string;
  warehouseId?: string;
  items: { productId: string; qty: number }[];
}

export const warehouseApi = {
  // T-327
  createInvoice: (dto: CreateInvoiceDto) =>
    apiClient.post<WarehouseInvoice>('/warehouse/invoices', dto),

  listInvoices: (params?: { from?: string; to?: string; supplierId?: string; page?: number }) =>
    apiClient.get<{ invoices: WarehouseInvoice[]; total: number; page: number; limit: number }>(
      '/warehouse/invoices',
      { params },
    ),

  getInvoice: (id: string) =>
    apiClient.get<WarehouseInvoice>(`/warehouse/invoices/${id}`),

  // T-328
  writeOff: (dto: WriteOffDto) =>
    apiClient.post('/inventory/write-off', dto),

  // T-319/T-320
  getDashboard: () =>
    apiClient.get<{
      stats: { totalProducts: number; todayMovementsIn: number; todayMovementsOut: number; lowStockCount: number; expiryCount: number };
      lowStockItems: { productId: string; name: string; totalQty: number }[];
      expiryItems: { productId: string; expiryDate: string; batchNumber?: string; product?: { name: string } | null }[];
      recentMovements: { id: string; type: string; quantity: number; createdAt: string; product: { name: string } }[];
    }>('/warehouse/dashboard'),

  getTodayMovements: () =>
    apiClient.get<{ id: string; type: string; quantity: number; createdAt: string; product: { name: string } }[]>('/warehouse/movements/today'),

  getAlerts: () =>
    apiClient.get<{ expired: number; soonExpiring: number; alerts: { type: string; productId: string; expiryDate: string; batchNumber?: string | null; product?: { name: string } | null }[] }>('/warehouse/alerts'),

  // Inventar (stock levels)
  getStockLevels: (params?: { warehouseId?: string; lowStock?: boolean; search?: string }) =>
    apiClient.get<{ productId: string; name: string; sku: string | null; totalQty: number; warehouseName: string; warehouseId: string; minStockLevel: number | null }[]>(
      '/inventory/levels',
      { params },
    ),

  // T-336
  listMovements: (params?: {
    productId?: string;
    type?: string;
    userId?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) =>
    apiClient.get<{
      movements: StockMovement[];
      total: number;
      page: number;
      limit: number;
    }>('/warehouse/movements', { params }),
};

export interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  refType: string | null;
  refId:   string | null;
  batchNumber: string | null;
  expiryDate:  string | null;
  note: string | null;
  createdAt: string;
  product:   { name: string; sku: string | null } | null;
  user:      { firstName: string; lastName: string } | null;
  warehouse: { name: string } | null;
}
