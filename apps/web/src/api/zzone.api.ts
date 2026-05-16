import { apiClient } from './client';

export interface ZzoneStatus {
  connected: boolean;
  zzoneUserId?: string;
  storeName?: string;
  zzoneStoreId?: string;
  zzoneHealthy: boolean;
}

export interface ZzoneProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  status: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface ZzoneOrder {
  _id: string;
  client: { _id: string; name: string };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentMethod: string;
  status: string;
  orderNumber: string;
  deliveryAddress: {
    address: string;
    apartment: string;
    phone: string;
    lat: number;
    lng: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ZzoneStore {
  _id: string;
  name: string;
  description: string;
  contacts: { phone: string; telegram: string; instagram: string; whatsapp: string };
  location: { lat: number; lng: number; address: string };
  subscriptionPlan: string;
  isActive: boolean;
}

export const zzoneApi = {
  // Connection
  getStatus(): Promise<ZzoneStatus> {
    return apiClient.get('/integrations/zzone/status').then((r) => r.data?.data ?? r.data);
  },

  connect(phone: string, password: string): Promise<{ zzoneUserId: string; storeName: string }> {
    return apiClient
      .post('/integrations/zzone/connect', { phone, password })
      .then((r) => r.data?.data ?? r.data);
  },

  disconnect(): Promise<void> {
    return apiClient.post('/integrations/zzone/disconnect').then(() => undefined);
  },

  // Store
  getStore(): Promise<ZzoneStore> {
    return apiClient.get('/integrations/zzone/store').then((r) => r.data?.data ?? r.data);
  },

  // Products
  getProducts(page = 1): Promise<{ products: ZzoneProduct[]; pagination: { total: number; page: number; pages: number } }> {
    return apiClient
      .get('/integrations/zzone/products', { params: { page } })
      .then((r) => r.data?.data ?? r.data);
  },

  pushProduct(product: { name: string; price: number; category: string; description?: string; stock: number }): Promise<ZzoneProduct> {
    return apiClient
      .post('/integrations/zzone/products', product)
      .then((r) => r.data?.data ?? r.data);
  },

  updateProduct(id: string, updates: Partial<{ name: string; price: number; stock: number; description: string; category: string }>): Promise<ZzoneProduct> {
    return apiClient
      .patch(`/integrations/zzone/products/${id}`, updates)
      .then((r) => r.data?.data ?? r.data);
  },

  deleteProduct(id: string): Promise<void> {
    return apiClient.delete(`/integrations/zzone/products/${id}`).then(() => undefined);
  },

  // Orders
  getOrders(params?: { status?: string; page?: number }): Promise<{ orders: ZzoneOrder[]; pagination: { total: number; page: number; pages: number } }> {
    return apiClient
      .get('/integrations/zzone/orders', { params })
      .then((r) => r.data?.data ?? r.data);
  },

  updateOrderStatus(orderId: string, status: string): Promise<ZzoneOrder> {
    return apiClient
      .patch(`/integrations/zzone/orders/${orderId}/status`, { status })
      .then((r) => r.data?.data ?? r.data);
  },
};
