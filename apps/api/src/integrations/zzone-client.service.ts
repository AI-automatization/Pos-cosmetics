import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CircuitBreakerService } from '../common/circuit-breaker/circuit-breaker.service';

/**
 * ZZone Backend HTTP Client
 * Handles all communication with zzoneback-production.up.railway.app
 */

export interface ZzoneAuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    phone: string;
    role: string;
    balance: number;
  };
}

export interface ZzoneProduct {
  _id: string;
  store: string;
  seller: string;
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
  store: string;
  product: string | null;
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
  contacts: {
    phone: string;
    telegram: string;
    instagram: string;
    whatsapp: string;
  };
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  subscriptionPlan: string;
  isActive: boolean;
}

interface ZzoneResponse<T> {
  statusCode?: number;
  data: T;
  message: string;
  success: boolean;
}

@Injectable()
export class ZzoneClientService {
  private readonly logger = new Logger(ZzoneClientService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly config: ConfigService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {
    this.baseUrl =
      this.config.get<string>('ZZONE_API_URL') ||
      'https://zzoneback-production.up.railway.app';
  }

  // ─── AUTH ────────────────────────────────────────────────────────────

  async login(
    phone: string,
    password: string,
  ): Promise<ZzoneAuthResponse> {
    const res = await this.request<{ token: string; refreshToken: string; user: ZzoneAuthResponse['user'] }>(
      'POST',
      '/api/auth/login',
      { phone, password },
    );
    return {
      token: res.token,
      refreshToken: res.refreshToken,
      user: res.user,
    };
  }

  async getMe(token: string): Promise<ZzoneAuthResponse['user']> {
    const res = await this.request<{ user: ZzoneAuthResponse['user'] }>(
      'GET',
      '/api/auth/me',
      undefined,
      token,
    );
    return res.user;
  }

  // ─── STORE ───────────────────────────────────────────────────────────

  async getMyStore(token: string): Promise<ZzoneStore> {
    const res = await this.request<{ store: ZzoneStore }>(
      'GET',
      '/api/stores/my',
      undefined,
      token,
    );
    return res.store;
  }

  async updateStoreLocation(
    token: string,
    location: { lat: number; lng: number; address: string },
  ): Promise<ZzoneStore> {
    const res = await this.request<{ store: ZzoneStore }>(
      'PUT',
      '/api/stores/my/location',
      location,
      token,
    );
    return res.store;
  }

  // ─── PRODUCTS ────────────────────────────────────────────────────────

  async getMyProducts(
    token: string,
    page = 1,
  ): Promise<{ products: ZzoneProduct[]; pagination: { total: number; page: number; pages: number } }> {
    const res = await this.request<{
      products: ZzoneProduct[];
      pagination: { total: number; page: number; pages: number };
    }>('GET', `/api/products/my?page=${page}`, undefined, token);
    return res;
  }

  async createProduct(
    token: string,
    product: {
      name: string;
      price: number;
      category: string;
      description?: string;
      stock: number;
    },
  ): Promise<ZzoneProduct> {
    const res = await this.request<{ product: ZzoneProduct }>(
      'POST',
      '/api/products',
      product,
      token,
    );
    return res.product;
  }

  async updateProduct(
    token: string,
    productId: string,
    updates: Partial<{ name: string; price: number; stock: number; description: string; category: string }>,
  ): Promise<ZzoneProduct> {
    const res = await this.request<{ product: ZzoneProduct }>(
      'PATCH',
      `/api/products/${productId}`,
      updates,
      token,
    );
    return res.product;
  }

  async deleteProduct(token: string, productId: string): Promise<void> {
    await this.request('DELETE', `/api/products/${productId}`, undefined, token);
  }

  // ─── ORDERS ──────────────────────────────────────────────────────────

  async getSellerOrders(
    token: string,
    params?: { status?: string; page?: number },
  ): Promise<{ orders: ZzoneOrder[]; pagination: { total: number; page: number; pages: number } }> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    const qs = query.toString() ? `?${query.toString()}` : '';

    const res = await this.request<{
      orders: ZzoneOrder[];
      pagination: { total: number; page: number; pages: number };
    }>('GET', `/api/orders/seller${qs}`, undefined, token);
    return res;
  }

  async updateOrderStatus(
    token: string,
    orderId: string,
    status: string,
  ): Promise<ZzoneOrder> {
    const res = await this.request<{ order: ZzoneOrder }>(
      'PATCH',
      `/api/orders/${orderId}/status`,
      { status },
      token,
    );
    return res.order;
  }

  // ─── HEALTH ──────────────────────────────────────────────────────────

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // ─── INTERNAL HTTP ───────────────────────────────────────────────────

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    token?: string,
  ): Promise<T> {
    return this.circuitBreaker.execute(
      'zzone-api',
      async () => {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const url = `${this.baseUrl}${path}`;
        const options: RequestInit = {
          method,
          headers,
          signal: AbortSignal.timeout(15000),
        };

        if (body && method !== 'GET') {
          options.body = JSON.stringify(body);
        }

        this.logger.debug(`[ZZone] ${method} ${path}`);

        const response = await fetch(url, options);

        if (!response.ok) {
          const errorBody = await response.text().catch(() => 'No body');
          this.logger.error(
            `[ZZone] ${method} ${path} → ${response.status}`,
            { body: errorBody },
          );
          throw new Error(
            `ZZone API error: ${response.status} ${response.statusText} — ${errorBody}`,
          );
        }

        const json = (await response.json()) as ZzoneResponse<T>;

        if (json.success === false) {
          throw new Error(`ZZone API: ${json.message}`);
        }

        return json.data;
      },
      async () => {
        throw new Error('ZZone service unavailable (circuit open)');
      },
    );
  }
}
