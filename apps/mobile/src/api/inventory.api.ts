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
    const { data } = await api.get<LowStockItem[]>('/inventory/levels', {
      params: { lowStock: true, branchId },
    });
    return data;
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
    const { data } = await api.get<ReceiptListResponse>('/inventory/receipts', { params });
    return data;
  },

  getReceiptById: async (id: string): Promise<Receipt> => {
    const { data } = await api.get<Receipt>(`/inventory/receipts/${id}`);
    return data;
  },

  createReceipt: async (body: CreateReceiptBody): Promise<CreateReceiptResponse> => {
    const { data } = await api.post<CreateReceiptResponse>('/inventory/receipts', body);
    return data;
  },
};
