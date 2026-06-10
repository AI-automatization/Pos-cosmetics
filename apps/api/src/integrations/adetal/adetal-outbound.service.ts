import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ADETAL_DEFAULT_API_URL,
  ADETAL_PROVIDER,
  ADETAL_TOKEN_BUFFER_MS,
} from './adetal.constants';
import type { AdetalIntegrationConfig } from './dto/adetal.dto';

/**
 * RAOS → Adetal (Outbound)
 *
 * HTTP client for all Adetal marketplace API endpoints.
 * Auto-manages Bearer token lifecycle (login, refresh, cache in DB).
 */
/** Convert Node.js Buffer to Blob (avoids SharedArrayBuffer type mismatch) */
function bufferToBlob(buf: Buffer): Blob {
  return new Blob([buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer]);
}

@Injectable()
export class AdetalOutboundService {
  private readonly logger = new Logger(AdetalOutboundService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const url = this.config.get<string>('ADETAL_API_URL');
    if (!url) {
      this.logger.warn('ADETAL_API_URL not set — using default');
    }
    this.baseUrl = url || ADETAL_DEFAULT_API_URL;
  }

  // ─── AUTH ────────────────────────────────────────────────────────────

  async login(phone: string, password: string): Promise<{
    token: string;
    refreshToken: string;
    user: { id: string; name: string; role: string };
  }> {
    const res = (await this.requestRaw('POST', '/api/auth/login', { phone, password })) as {
      token: string;
      refreshToken: string;
      user: { id: string; name: string; role: string };
    };
    return res;
  }

  async getProfile(tenantId: string): Promise<Record<string, unknown>> {
    return this.request('GET', '/api/auth/me', undefined, tenantId) as Promise<Record<string, unknown>>;
  }

  // ─── STORE ───────────────────────────────────────────────────────────

  async createStore(
    tenantId: string,
    data: { name: string; description?: string; locationLat?: number; locationLng?: number; locationAddress?: string },
  ): Promise<{ store: { _id: string } }> {
    return this.request('POST', '/api/stores', data, tenantId) as Promise<{ store: { _id: string } }>;
  }

  async getMyStore(tenantId: string): Promise<Record<string, unknown>> {
    return this.request('GET', '/api/stores/my', undefined, tenantId) as Promise<Record<string, unknown>>;
  }

  async updateStore(
    tenantId: string,
    data: { description?: string; phone?: string; telegram?: string; instagram?: string; whatsapp?: string },
  ): Promise<void> {
    await this.request('PATCH', '/api/stores/my', data, tenantId);
  }

  async updateLocation(
    tenantId: string,
    data: { lat: number; lng: number; address?: string },
  ): Promise<void> {
    await this.request('PUT', '/api/stores/my/location', data, tenantId);
  }

  async uploadLogo(tenantId: string, buffer: Buffer, filename: string): Promise<void> {
    const formData = new FormData();
    formData.append('logo', bufferToBlob(buffer), filename);
    await this.requestMultipart('PATCH', '/api/stores/my/logo', formData, tenantId);
  }

  async addGalleryImages(tenantId: string, images: Array<{ buffer: Buffer; filename: string }>): Promise<void> {
    const formData = new FormData();
    for (const img of images) {
      formData.append('images', bufferToBlob(img.buffer), img.filename);
    }
    await this.requestMultipart('POST', '/api/stores/my/images', formData, tenantId);
  }

  async deleteGalleryImage(tenantId: string, index: number): Promise<void> {
    await this.request('DELETE', `/api/stores/my/images/${index}`, undefined, tenantId);
  }

  async updateCard(tenantId: string, cardNumber: string): Promise<void> {
    await this.request('PATCH', '/api/stores/my/card', { cardNumber }, tenantId);
  }

  async getStorePlans(): Promise<{ plans: Array<{ name: string; price: number; durationDays: number }> }> {
    return this.requestRaw('GET', '/api/stores/plans') as Promise<{
      plans: Array<{ name: string; price: number; durationDays: number }>;
    }>;
  }

  async subscribe(tenantId: string, plan: string): Promise<Record<string, unknown>> {
    return this.request('POST', '/api/stores/subscription', { plan }, tenantId) as Promise<Record<string, unknown>>;
  }

  async getAnalytics(tenantId: string): Promise<Record<string, unknown>> {
    return this.request('GET', '/api/stores/my/analytics', undefined, tenantId) as Promise<Record<string, unknown>>;
  }

  // ─── PRODUCTS ────────────────────────────────────────────────────────

  async createProduct(
    tenantId: string,
    data: { name: string; price: number; category: string; description?: string; stock?: number },
    imageBuffers?: Array<{ buffer: Buffer; filename: string }>,
  ): Promise<{ product: { _id: string; status: string } }> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('price', String(data.price));
    formData.append('category', data.category);
    if (data.description) formData.append('description', data.description);
    if (data.stock !== undefined) formData.append('stock', String(data.stock));

    if (imageBuffers?.length) {
      for (const img of imageBuffers) {
        formData.append('images', bufferToBlob(img.buffer), img.filename);
      }
    }

    return this.requestMultipart('POST', '/api/products', formData, tenantId) as Promise<{
      product: { _id: string; status: string };
    }>;
  }

  async getMyProducts(tenantId: string, page = 1): Promise<{
    products: Array<{ _id: string; name: string; price: number; stock: number; status: string }>;
    total: number;
  }> {
    return this.request('GET', `/api/products/my?page=${page}&limit=50`, undefined, tenantId) as Promise<{
      products: Array<{ _id: string; name: string; price: number; stock: number; status: string }>;
      total: number;
    }>;
  }

  async updateProduct(
    tenantId: string,
    adetalProductId: string,
    data: { name?: string; price?: number; category?: string; description?: string; stock?: number },
  ): Promise<void> {
    await this.request('PATCH', `/api/products/${adetalProductId}`, data, tenantId);
  }

  async deleteProduct(tenantId: string, adetalProductId: string): Promise<void> {
    await this.request('DELETE', `/api/products/${adetalProductId}`, undefined, tenantId);
  }

  // ─── ORDERS ──────────────────────────────────────────────────────────

  async getSellerOrders(
    tenantId: string,
    params?: { status?: string; page?: number; limit?: number },
  ): Promise<{
    orders: Array<{
      _id: string;
      orderNumber: number;
      status: string;
      totalPrice: number;
      quantity: number;
      product: { _id: string; name: string; price: number };
      deliveryAddress?: { address: string; phone: string };
      createdAt: string;
    }>;
    total: number;
  }> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : '';

    return this.request('GET', `/api/orders/seller${qs}`, undefined, tenantId) as Promise<{
      orders: Array<{
        _id: string;
        orderNumber: number;
        status: string;
        totalPrice: number;
        quantity: number;
        product: { _id: string; name: string; price: number };
        deliveryAddress?: { address: string; phone: string };
        createdAt: string;
      }>;
      total: number;
    }>;
  }

  async updateOrderStatus(tenantId: string, orderId: string, status: string): Promise<void> {
    await this.request('PATCH', `/api/orders/${orderId}/status`, { status }, tenantId);
  }

  async reviewPayment(tenantId: string, orderId: string, approved: boolean): Promise<void> {
    await this.request('PATCH', `/api/orders/${orderId}/review-payment`, { approved }, tenantId);
  }

  // ─── NOTIFICATIONS ───────────────────────────────────────────────────

  async getNotifications(tenantId: string): Promise<{
    notifications: Array<{ _id: string; type: string; message: string; read: boolean }>;
    unreadCount: number;
  }> {
    return this.request('GET', '/api/notifications', undefined, tenantId) as Promise<{
      notifications: Array<{ _id: string; type: string; message: string; read: boolean }>;
      unreadCount: number;
    }>;
  }

  async markAllNotificationsRead(tenantId: string): Promise<void> {
    await this.request('PATCH', '/api/notifications/read-all', undefined, tenantId);
  }

  // ─── REVIEWS (read-only for seller) ──────────────────────────────────

  async getSellerReviews(tenantId: string): Promise<{ reviews: Array<Record<string, unknown>> }> {
    return this.request('GET', '/api/reviews/seller', undefined, tenantId) as Promise<{
      reviews: Array<Record<string, unknown>>;
    }>;
  }

  // ─── HEALTH ──────────────────────────────────────────────────────────

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/status`, {
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // ─── TOKEN MANAGEMENT ────────────────────────────────────────────────

  async getToken(tenantId: string): Promise<string> {
    const config = await this.prisma.integrationConfig.findUnique({
      where: { tenantId_provider: { tenantId, provider: ADETAL_PROVIDER } },
    });

    if (!config) throw new NotFoundException('Adetal integration not configured');

    const adetalConfig = config.config as unknown as AdetalIntegrationConfig;

    if (!adetalConfig.accessToken) {
      throw new UnauthorizedException('Adetal account not authenticated');
    }

    const expiresAt = adetalConfig.tokenExpiresAt ? new Date(adetalConfig.tokenExpiresAt).getTime() : 0;
    const now = Date.now();

    if (expiresAt > now + ADETAL_TOKEN_BUFFER_MS) {
      return adetalConfig.accessToken;
    }

    // Token expired or about to expire — refresh
    if (adetalConfig.refreshToken) {
      return this.refreshAccessToken(tenantId, adetalConfig.refreshToken);
    }

    throw new UnauthorizedException('Adetal tokens expired — re-authenticate via admin panel');
  }

  private async refreshAccessToken(tenantId: string, refreshToken: string): Promise<string> {
    this.logger.log(`Refreshing Adetal token for tenant ${tenantId}`);

    const res = (await this.requestRaw('POST', '/api/auth/refresh', { refreshToken })) as {
      token: string;
      refreshToken: string;
    };

    // Store new tokens
    const config = await this.prisma.integrationConfig.findUnique({
      where: { tenantId_provider: { tenantId, provider: ADETAL_PROVIDER } },
    });

    if (config) {
      const currentConfig = (config.config ?? {}) as Record<string, unknown>;
      currentConfig.accessToken = res.token;
      currentConfig.refreshToken = res.refreshToken;
      currentConfig.tokenExpiresAt = new Date(Date.now() + 55 * 60 * 1000).toISOString(); // ~55min

      await this.prisma.integrationConfig.update({
        where: { id: config.id },
        data: { config: currentConfig as object },
      });
    }

    return res.token;
  }

  // ─── INTERNAL HTTP ───────────────────────────────────────────────────

  private async request(method: string, path: string, body?: unknown, tenantId?: string): Promise<unknown> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    if (tenantId) {
      const token = await this.getToken(tenantId);
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}${path}`;
    const options: RequestInit = { method, headers, signal: AbortSignal.timeout(15000) };
    if (body && method !== 'GET') options.body = JSON.stringify(body);

    this.logger.debug(`[Adetal→] ${method} ${path}`);

    const response = await fetch(url, options);

    if (response.status === 401 && tenantId) {
      // Try token refresh once
      const config = await this.prisma.integrationConfig.findUnique({
        where: { tenantId_provider: { tenantId, provider: ADETAL_PROVIDER } },
      });
      const adetalConfig = (config?.config ?? {}) as unknown as AdetalIntegrationConfig;
      if (adetalConfig.refreshToken) {
        const newToken = await this.refreshAccessToken(tenantId, adetalConfig.refreshToken);
        headers['Authorization'] = `Bearer ${newToken}`;
        const retryResponse = await fetch(url, { ...options, headers });
        if (!retryResponse.ok) {
          const errorBody = await retryResponse.text().catch(() => '');
          this.logger.error(`[Adetal→] ${method} ${path} → ${retryResponse.status} (after refresh)`, { body: errorBody });
          throw new Error(`Adetal API ${retryResponse.status}: ${errorBody}`);
        }
        const json = await retryResponse.json();
        return json.data;
      }
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      this.logger.error(`[Adetal→] ${method} ${path} → ${response.status}`, { body: errorBody });
      throw new Error(`Adetal API ${response.status}: ${errorBody}`);
    }

    const json = await response.json();
    return json.data;
  }

  private async requestMultipart(method: string, path: string, formData: FormData, tenantId: string): Promise<unknown> {
    const token = await this.getToken(tenantId);
    const url = `${this.baseUrl}${path}`;

    this.logger.debug(`[Adetal→] ${method} ${path} (multipart)`);

    const response = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      this.logger.error(`[Adetal→] ${method} ${path} → ${response.status} (multipart)`, { body: errorBody });
      throw new Error(`Adetal API ${response.status}: ${errorBody}`);
    }

    const json = await response.json();
    return json.data;
  }

  /** Raw request without tenant token (for login, public endpoints) */
  private async requestRaw(method: string, path: string, body?: unknown): Promise<unknown> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const url = `${this.baseUrl}${path}`;
    const options: RequestInit = { method, headers, signal: AbortSignal.timeout(15000) };
    if (body && method !== 'GET') options.body = JSON.stringify(body);

    this.logger.debug(`[Adetal→] ${method} ${path} (raw)`);

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      this.logger.error(`[Adetal→] ${method} ${path} → ${response.status}`, { body: errorBody });
      throw new Error(`Adetal API ${response.status}: ${errorBody}`);
    }

    const json = await response.json();
    return json.data;
  }
}
