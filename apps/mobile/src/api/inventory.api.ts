import api from './client';

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
    const { data } = await api.get<{ invoices?: unknown[]; items?: unknown[]; data?: unknown[]; total: number; page: number; limit: number }>(
      '/warehouse/invoices',
      { params },
    );
    const items: Receipt[] = ((data.invoices ?? data.items ?? data.data) ?? []).map((r: any) => ({
      id: r.id,
      receiptNumber: r.invoiceNumber ?? '#' + String(r.id).slice(0, 6),
      date: new Date(r.createdAt).toLocaleDateString('uz-UZ'),
      supplierName: r.supplier?.name ?? r.supplierName ?? "Noma'lum",
      itemsCount: r.items?.length ?? r.itemsCount ?? 0,
      totalCost: r.totalCost,
      status: r.status === 'RECEIVED' ? 'RECEIVED' : r.status === 'CANCELLED' ? 'CANCELLED' : 'PENDING',
      notes: r.notes ?? r.note,
    }));
    return { items, total: data.total, page: data.page, limit: data.limit };
  },

  getReceiptById: async (id: string): Promise<Receipt> => {
    const { data } = await api.get<any>(`/warehouse/invoices/${id}`);
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
      items: r.items?.map((item: any) => ({
        productId: item.productId,
        productName: item.productName ?? item.product?.name ?? '',
        qty: item.quantity ?? item.qty,
        unit: item.unit ?? '',
        costPrice: item.purchasePrice ?? item.costPrice,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
      })),
    };
  },

  createReceipt: async (body: CreateReceiptBody): Promise<CreateReceiptResponse> => {
    const payload = {
      supplierName: body.supplierName,
      invoiceNumber: body.invoiceNumber,
      note: body.notes,
      items: body.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        purchasePrice: item.costPrice,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate || undefined,
      })),
    };
    const { data } = await api.post<any>('/warehouse/invoices', payload);
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

  approveReceipt: async (id: string): Promise<void> => {
    await api.patch(`/warehouse/invoices/${id}/approve`);
  },

  rejectReceipt: async (id: string): Promise<void> => {
    await api.patch(`/warehouse/invoices/${id}/reject`);
  },
};
