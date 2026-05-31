import api from './client';
import type {
  RawStockLevelItem,
  WrappedStockResponse,
  WarehouseInvoice,
  LowStockItem,
  ProductStockLevel,
  Receipt,
  CreateReceiptBody,
  CreateReceiptResponse,
  InventoryItemStatus,
  InventoryItemsResponse,
  RestockRequestBody,
  RestockRequestResponse,
  CreateTransferBody,
  CreateTransferResponse,
  TransferListParams,
  TransferListResponse,
} from './inventory.types';
import { warehouseApi } from './warehouse.api';

// Re-export all types for backward compatibility
export * from './inventory.types';
export { warehouseApi } from './warehouse.api';

export const inventoryApi = {
  getStockLevels: async (params?: {
    search?: string;
    branchId?: string;
    lowStock?: boolean;
  }): Promise<LowStockItem[]> => {
    const { data } = await api.get<RawStockLevelItem[] | WrappedStockResponse>(
      '/inventory/levels',
      { params: params ?? undefined },
    );
    const raw: RawStockLevelItem[] = Array.isArray(data)
      ? data
      : ((data as WrappedStockResponse).data ?? (data as WrappedStockResponse).items ?? []);
    return raw.map((item: RawStockLevelItem): LowStockItem => {
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
    if (Array.isArray(res.data)) {
      return { items: res.data, total: res.data.length, page: 1, limit: res.data.length };
    }
    return res.data;
  },

  // Warehouse funksiyalar — backward compatibility uchun delegate
  ...warehouseApi,
};
