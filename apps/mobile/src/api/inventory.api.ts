import api from './client';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

interface WarehouseInvoiceItem {
  productId: string;
  productName?: string;
  product?: { name?: string };
  quantity?: number;
  qty?: number;
  unit?: string;
  purchasePrice?: number;
  costPrice?: number;
  batchNumber?: string;
  expiryDate?: string;
}

interface WarehouseInvoice {
  id: string;
  invoiceNumber?: string;
  createdAt: string;
  supplier?: { name?: string };
  supplierName?: string;
  items?: WarehouseInvoiceItem[];
  itemsCount?: number;
  totalCost: number;
  status: string;
  notes?: string;
  note?: string;
}

export interface LowStockItem {
  productId: string;
  productName: string;
  sku: string;
  warehouseId: string;
  warehouseName: string;
  stock: number;
  quantity: number;
  minStockLevel: number;
  threshold: number;
  isLow: boolean;
}

export interface ProductStockLevel {
  warehouseId: string;
  warehouseName: string;
  stock: number;
  nearestExpiry: string | null;
}

export interface ReceiptItem {
  productId: string;
  productName: string;
  qty: number;
  unit: string;
  costPrice: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  date: string;
  supplierName: string;
  itemsCount: number;
  totalCost: number;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
  items?: ReceiptItem[];
  notes?: string;
}

export interface ReceiptListResponse {
  items: Receipt[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateReceiptBody {
  supplierName: string;
  invoiceNumber?: string;
  items: {
    productId: string;
    quantity: number;
    costPrice: number;
    batchNumber?: string;
    expiryDate?: string;
  }[];
  notes?: string;
}

export interface CreateReceiptResponse {
  id: string;
  receiptNumber: string;
  date: string;
  totalCost: number;
  itemsCount: number;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
}

export interface TransferItem {
  productId: string;
  quantity: number;
  warehouseId?: string;
}

export type InventoryItemStatus = 'out_of_stock' | 'low' | 'normal' | 'expiring' | 'expired';

export interface InventoryItem {
  productId: string;
  productName: string;
  barcode: string | null;
  branchName: string | null;
  branchId: string | null;
  quantity: number;
  unit: string;
  stockValue: number;
  expiryDate: string | null;
  status: InventoryItemStatus;
}

export interface InventoryItemsResponse {
  items: InventoryItem[];
  total: number;
  page: number;
  limit: number;
}

export interface RestockRequestBody {
  productId: string;
  productName: string;
  currentStock: number;
}

export interface RestockRequestResponse {
  success: boolean;
  notifiedCount: number;
}

export type TransferStatus = 'REQUESTED' | 'APPROVED' | 'SHIPPED' | 'RECEIVED' | 'CANCELLED';

export interface StockTransferListItem {
  id: string;
  fromBranchId: string;
  toBranchId: string;
  status: TransferStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: {
    id: string;
    productId: string;
    quantity: number;
    product: { name: string; sku: string };
  }[];
  fromBranch: { name: string };
  toBranch: { name: string };
  requestedBy: { firstName: string; lastName: string };
}

export interface TransferListResponse {
  items: StockTransferListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface TransferListParams {
  status?: TransferStatus;
  branchId?: string;
  page?: number;
  limit?: number;
}

export interface CreateTransferBody {
  fromBranchId: string;
  toBranchId: string;
  items: TransferItem[];
  notes?: string;
}

export interface CreateTransferResponse {
  id: string;
  status: string;
  fromBranchId: string;
  toBranchId: string;
  createdAt: string;
}

export type StockItem = LowStockItem;

export interface InvoiceListItem {
  id: string;
  invoiceNumber: string | null;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
  createdAt: string;
  totalCost: number;
  itemsCount: number;
  supplier: { id: string; name: string } | null;
  createdBy: { firstName: string; lastName: string } | null;
}

export interface InvoiceDetailItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
  totalCost: number;
  batchNumber: string | null;
  expiryDate: string | null;
}

export interface InvoiceDetail extends InvoiceListItem {
  note: string | null;
  items: InvoiceDetailItem[];
}

export interface InvoiceListResponse {
  invoices: InvoiceListItem[];
  total: number;
  page: number;
  limit: number;
}

// ── Warehouse Dashboard ──────────────────────────────────

export interface WarehouseDashboardStats {
  totalProducts: number;
  todayMovementsIn: number;
  todayMovementsOut: number;
  lowStockCount: number;
  expiryCount: number;
}

export interface DashboardLowStockItem {
  productId: string;
  name: string;
  totalQty: number;
}

export interface DashboardExpiryItem {
  productId: string;
  expiryDate: string;
  batchNumber: string | null;
  quantity: number;
  product: { name: string };
}

export interface DashboardMovement {
  id: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'WRITE_OFF' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'RETURN_IN';
  quantity: number;
  createdAt: string;
  note: string | null;
  product: { name: string };
}

export interface WarehouseDashboardResponse {
  stats: WarehouseDashboardStats;
  lowStockItems: DashboardLowStockItem[];
  expiryItems: DashboardExpiryItem[];
  recentMovements: DashboardMovement[];
}

export interface WarehouseAlertsResponse {
  expired: number;
  soonExpiring: number;
  alerts: {
    type: 'EXPIRED' | 'EXPIRING_SOON';
    productId: string;
    expiryDate: string;
    batchNumber: string | null;
    product: { name: string };
  }[];
}

// ── Tester / Sample ──────────────────────────────────

export interface OpenTesterDto {
  productId: string;
  warehouseId: string;
  quantity: number;
  costPrice: number;
  note?: string;
}

export interface OpenTesterResponse {
  movement: { id: string };
  expense: { id: string };
  totalCost: number;
}

export interface TesterMovement {
  id: string;
  productId: string;
  warehouseId: string;
  type: string;
  quantity: number;
  costPrice: number | null;
  note: string | null;
  createdAt: string;
  product: { id: string; name: string; sku: string | null };
  warehouse: { id: string; name: string };
}

export interface TesterListResponse {
  items: TesterMovement[];
  totalCost: number;
  count: number;
}

export const inventoryApi = {
  getStockLevels: async (params?: {
    search?: string;
    branchId?: string;
    lowStock?: boolean;
  }): Promise<LowStockItem[]> => {
    const { data } = await api.get<unknown>('/inventory/levels', {
      params: params ?? undefined,
    });
    // Backend returns a plain array: [{ productId, warehouseId, totalQty, name, sku, minStockLevel, warehouseName }]
    const raw = Array.isArray(data)
      ? data
      : ((data as any)?.data ?? (data as any)?.items ?? []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return raw.map((item: any): LowStockItem => {
      const qty = item.totalQty ?? item.stock ?? item.quantity ?? 0;
      const threshold = item.minStockLevel ?? 5;
      return {
        productId: item.productId,
        productName: item.name ?? item.productName ?? '',
        sku: item.sku ?? '',
        warehouseId: item.warehouseId,
        warehouseName: item.warehouseName ?? '',
        stock: qty,
        quantity: qty,
        minStockLevel: threshold,
        threshold,
        isLow: qty <= threshold,
      };
    });
  },

  getProductStock: async (productId: string): Promise<ProductStockLevel[]> => {
    const { data } = await api.get<ProductStockLevel[]>(
      `/inventory/products/${productId}/stock`,
    );
    return data;
  },

  getReceiptById: async (id: string): Promise<Receipt> => {
    const { data } = await api.get<WarehouseInvoice>(`/warehouse/invoices/${id}`);
    const r = data;
    return {
      id: r.id,
      receiptNumber: r.invoiceNumber ?? '#' + String(r.id).slice(0, 6),
      date: new Date(r.createdAt).toLocaleDateString('uz-UZ'),
      supplierName: r.supplier?.name ?? r.supplierName ?? "Noma'lum",
      itemsCount: r.items?.length ?? r.itemsCount ?? 0,
      totalCost: r.totalCost,
      status: r.status === 'RECEIVED' ? 'RECEIVED' : r.status === 'CANCELLED' ? 'CANCELLED' : 'PENDING',
      notes: r.notes ?? r.note,
      items: r.items?.map((item) => ({
        productId: item.productId,
        productName: item.productName ?? item.product?.name ?? '',
        qty: item.quantity ?? item.qty ?? 0,
        unit: item.unit ?? '',
        costPrice: item.purchasePrice ?? item.costPrice ?? 0,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
      })),
    };
  },

  getInventoryItems: async (params?: {
    branchId?: string;
    status?: InventoryItemStatus;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<InventoryItemsResponse> => {
    const { data } = await api.get<InventoryItemsResponse>('/inventory/items', { params });
    return data;
  },

  sendRestockRequest: async (body: RestockRequestBody): Promise<RestockRequestResponse> => {
    const { data } = await api.post<RestockRequestResponse>('/inventory/restock-request', body);
    return data;
  },

  createTransfer: async (body: CreateTransferBody): Promise<CreateTransferResponse> => {
    const { data } = await api.post<CreateTransferResponse>('/inventory/transfers', body);
    return data;
  },

  listTransfers: async (params?: TransferListParams): Promise<TransferListResponse> => {
    const { data } = await api.get('/inventory/transfers', { params });
    return data;
  },

  approveTransfer: async (id: string): Promise<void> => {
    await api.patch(`/inventory/transfers/${id}/approve`);
  },

  shipTransfer: async (id: string): Promise<void> => {
    await api.patch(`/inventory/transfers/${id}/ship`);
  },

  receiveTransfer: async (id: string): Promise<void> => {
    await api.patch(`/inventory/transfers/${id}/receive`);
  },

  cancelTransfer: async (id: string): Promise<void> => {
    await api.patch(`/inventory/transfers/${id}/cancel`);
  },

  createReceipt: async (body: CreateReceiptBody): Promise<CreateReceiptResponse> => {
    const payload = {
      invoiceNumber: body.invoiceNumber,
      note: body.notes,
      items: body.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        purchasePrice: item.costPrice,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
      })),
    };
    const { data } = await api.post<WarehouseInvoice>('/warehouse/invoices', payload);
    const r = data;
    return {
      id: r.id,
      receiptNumber: r.invoiceNumber ?? '#' + String(r.id).slice(0, 6),
      date: new Date(r.createdAt).toLocaleDateString('uz-UZ'),
      totalCost: r.totalCost,
      itemsCount: r.items?.length ?? r.itemsCount ?? 0,
      status: r.status === 'RECEIVED' ? 'RECEIVED' : r.status === 'CANCELLED' ? 'CANCELLED' : 'PENDING',
    };
  },

  writeOff: async (body: {
    items: Array<{ productId: string; qty: number }>;
    reason: 'DAMAGED' | 'EXPIRED' | 'LOST' | 'OTHER';
    note?: string;
    warehouseId?: string;
  }): Promise<{ created: number; reason: string; movements: unknown[] }> => {
    const res = await api.post('/inventory/write-off', body);
    return res.data;
  },

  getWarehouses: async (): Promise<Array<{
    id: string;
    name: string;
    branchId: string | null;
    isActive: boolean;
    branch?: { id: string; name: string };
  }>> => {
    const res = await api.get('/inventory/warehouses');
    return res.data;
  },

  getExpiringProducts: async (days: number = 30): Promise<Array<{
    productId: string;
    productName: string;
    warehouseId: string;
    warehouseName: string;
    batchNumber: string | null;
    expiryDate: string;
    qty: number;
    daysLeft: number;
  }>> => {
    const res = await api.get('/inventory/expiring', { params: { days } });
    return res.data;
  },

  getExpiredProducts: async (): Promise<Array<{
    productId: string;
    productName: string;
    batchNumber: string | null;
    expiryDate: string;
    qty: number;
  }>> => {
    const res = await api.get('/inventory/expired');
    return res.data;
  },

  getStockMovements: async (params?: {
    page?: number;
    limit?: number;
    productId?: string;
    warehouseId?: string;
  }): Promise<{
    items: Array<{
      id: string;
      productId: string;
      product?: { id: string; name: string; sku: string | null };
      warehouseId: string;
      warehouse?: { id: string; name: string };
      type: string;
      quantity: number;
      costPrice: number | null;
      note: string | null;
      batchNumber: string | null;
      expiryDate: string | null;
      userId: string | null;
      user?: { id: string; firstName: string; lastName: string };
      refId: string | null;
      refType: string | null;
      createdAt: string;
    }>;
    total: number;
    page: number;
    limit: number;
  }> => {
    const res = await api.get('/inventory/movements', { params });
    // Backend may return array or paginated object
    if (Array.isArray(res.data)) {
      return { items: res.data, total: res.data.length, page: 1, limit: res.data.length };
    }
    return res.data;
  },

  listInvoices: async (params?: {
    page?: number;
    limit?: number;
    from?: string;
    to?: string;
  }): Promise<InvoiceListResponse> => {
    const res = await api.get('/warehouse/invoices', { params });
    return res.data;
  },

  getInvoice: async (id: string): Promise<InvoiceDetail> => {
    const res = await api.get(`/warehouse/invoices/${id}`);
    return res.data;
  },

  approveInvoice: async (id: string): Promise<InvoiceDetail> => {
    const res = await api.patch(`/warehouse/invoices/${id}/approve`);
    return res.data;
  },

  rejectInvoice: async (id: string): Promise<InvoiceDetail> => {
    const res = await api.patch(`/warehouse/invoices/${id}/reject`);
    return res.data;
  },

  openTester: async (dto: OpenTesterDto): Promise<OpenTesterResponse> => {
    const { data } = await api.post<OpenTesterResponse>('/inventory/testers', dto);
    return data;
  },

  getTesters: async (params?: { from?: string; to?: string }): Promise<TesterListResponse> => {
    const { data } = await api.get<TesterListResponse>('/inventory/testers', { params });
    return data;
  },

  getWarehouseDashboard: async (): Promise<WarehouseDashboardResponse> => {
    const { data } = await api.get('/warehouse/dashboard');
    return data;
  },

  getWarehouseAlerts: async (): Promise<WarehouseAlertsResponse> => {
    const { data } = await api.get('/warehouse/alerts');
    return data;
  },
};
