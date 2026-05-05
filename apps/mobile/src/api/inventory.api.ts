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

export interface StockListResponse {
  data: LowStockItem[];
  total: number;
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

export const inventoryApi = {
  getStock: async (branchId?: string): Promise<StockListResponse> => {
    const { data } = await api.get<StockListResponse>('/inventory/levels', {
      params: { branchId },
    });
    return data;
  },

  getLowStock: async (branchId?: string): Promise<LowStockItem[]> => {
    const { data } = await api.get<StockListResponse>('/inventory/levels', {
      params: { lowStock: true, branchId },
    });
    return data.data ?? [];
  },

  getStockLevels: async (search?: string): Promise<LowStockItem[]> => {
    const { data } = await api.get<StockListResponse>('/inventory/levels', {
      params: search ? { search } : undefined,
    });
    return data.data ?? [];
  },

  getProductStock: async (productId: string): Promise<ProductStockLevel[]> => {
    const { data } = await api.get<ProductStockLevel[]>(
      `/inventory/products/${productId}/stock`,
    );
    return data;
  },

  getReceipts: async (params?: {
    page?: number;
    limit?: number;
    from?: string;
    to?: string;
  }): Promise<ReceiptListResponse> => {
    const { data } = await api.get<{ invoices?: WarehouseInvoice[]; items?: WarehouseInvoice[]; data?: WarehouseInvoice[]; total: number; page: number; limit: number }>(
      '/warehouse/invoices',
      { params },
    );
    // Backend returns { invoices, total, page, limit } — check all possible keys
    const rawItems: WarehouseInvoice[] = data.invoices ?? data.items ?? data.data ?? [];
    const items: Receipt[] = rawItems.map((r) => ({
      id: r.id,
      receiptNumber: r.invoiceNumber ?? '#' + String(r.id).slice(0, 6),
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('uz-UZ') : '—',
      supplierName: r.supplier?.name ?? r.supplierName ?? "Noma'lum",
      itemsCount: r.items?.length ?? r.itemsCount ?? 0,
      totalCost: r.totalCost ?? 0,
      status: r.status === 'RECEIVED' ? 'RECEIVED' : r.status === 'CANCELLED' ? 'CANCELLED' : 'PENDING',
      notes: r.notes ?? r.note,
    }));
    return { items, total: data.total ?? 0, page: data.page ?? 1, limit: data.limit ?? 20 };
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

  acceptReceipt: async (id: string): Promise<Receipt> => {
    const { data } = await api.patch<any>(`/warehouse/invoices/${id}/approve`);
    const r = data;
    return {
      id: r.id,
      receiptNumber: r.invoiceNumber ?? '#' + String(r.id).slice(0, 6),
      date: new Date(r.createdAt ?? Date.now()).toLocaleDateString('uz-UZ'),
      supplierName: r.supplier?.name ?? r.supplierName ?? "Noma'lum",
      itemsCount: r.items?.length ?? r.itemsCount ?? 0,
      totalCost: r.totalCost ?? 0,
      status: 'RECEIVED',
    };
  },

  cancelReceipt: async (id: string): Promise<Receipt> => {
    const { data } = await api.patch<any>(`/warehouse/invoices/${id}/reject`);
    const r = data;
    return {
      id: r.id,
      receiptNumber: r.invoiceNumber ?? '#' + String(r.id).slice(0, 6),
      date: new Date(r.createdAt ?? Date.now()).toLocaleDateString('uz-UZ'),
      supplierName: r.supplier?.name ?? r.supplierName ?? "Noma'lum",
      itemsCount: r.items?.length ?? r.itemsCount ?? 0,
      totalCost: r.totalCost ?? 0,
      status: 'CANCELLED',
    };
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
};
