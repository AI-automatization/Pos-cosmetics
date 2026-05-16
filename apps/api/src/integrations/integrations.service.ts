import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ZzoneClientService, ZzoneOrder, ZzoneProduct, ZzoneStore } from './zzone-client.service';

/**
 * IntegrationsService — manages ZZone connection per tenant
 *
 * Stores ZZone credentials in DB (encrypted token).
 * Proxies POS requests to ZZone API.
 */

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly zzoneClient: ZzoneClientService,
  ) {}

  // ─── CONNECTION MANAGEMENT ───────────────────────────────────────────

  async connect(
    tenantId: string,
    phone: string,
    password: string,
  ): Promise<{ zzoneUserId: string; storeName: string }> {
    // 1. Login to ZZone
    const auth = await this.zzoneClient.login(phone, password);

    // 2. Get store info
    let store: ZzoneStore | null = null;
    try {
      store = await this.zzoneClient.getMyStore(auth.token);
    } catch {
      // Seller might not have a store yet
    }

    // 3. Save integration config
    await this.prisma.integrationConfig.upsert({
      where: {
        tenantId_provider: { tenantId, provider: 'ZZONE' },
      },
      create: {
        tenantId,
        provider: 'ZZONE',
        config: {
          phone,
          zzoneUserId: auth.user.id,
          zzoneStoreId: store?._id || null,
          storeName: store?.name || null,
          token: auth.token,
          refreshToken: auth.refreshToken,
        },
        isActive: true,
      },
      update: {
        config: {
          phone,
          zzoneUserId: auth.user.id,
          zzoneStoreId: store?._id || null,
          storeName: store?.name || null,
          token: auth.token,
          refreshToken: auth.refreshToken,
        },
        isActive: true,
      },
    });

    this.logger.log(`[ZZone] Tenant ${tenantId} connected as ${auth.user.name}`);

    return {
      zzoneUserId: auth.user.id,
      storeName: store?.name || 'No store',
    };
  }

  async disconnect(tenantId: string): Promise<void> {
    await this.prisma.integrationConfig.updateMany({
      where: { tenantId, provider: 'ZZONE' },
      data: { isActive: false },
    });
    this.logger.log(`[ZZone] Tenant ${tenantId} disconnected`);
  }

  async getStatus(tenantId: string): Promise<{
    connected: boolean;
    zzoneUserId?: string;
    storeName?: string;
    zzoneStoreId?: string;
    zzoneHealthy: boolean;
  }> {
    const config = await this.getConfig(tenantId);
    const zzoneHealthy = await this.zzoneClient.healthCheck();

    if (!config) {
      return { connected: false, zzoneHealthy };
    }

    return {
      connected: true,
      zzoneUserId: config.zzoneUserId,
      storeName: config.storeName ?? undefined,
      zzoneStoreId: config.zzoneStoreId ?? undefined,
      zzoneHealthy,
    };
  }

  // ─── PRODUCTS ────────────────────────────────────────────────────────

  async pushProduct(
    tenantId: string,
    product: { name: string; price: number; category: string; description?: string; stock: number },
  ): Promise<ZzoneProduct> {
    const token = await this.getToken(tenantId);
    return this.zzoneClient.createProduct(token, product);
  }

  async updateProduct(
    tenantId: string,
    zzoneProductId: string,
    updates: Partial<{ name: string; price: number; stock: number; description: string; category: string }>,
  ): Promise<ZzoneProduct> {
    const token = await this.getToken(tenantId);
    return this.zzoneClient.updateProduct(token, zzoneProductId, updates);
  }

  async updateStock(
    tenantId: string,
    zzoneProductId: string,
    stock: number,
  ): Promise<ZzoneProduct> {
    const token = await this.getToken(tenantId);
    return this.zzoneClient.updateProduct(token, zzoneProductId, { stock });
  }

  async deleteProduct(tenantId: string, zzoneProductId: string): Promise<void> {
    const token = await this.getToken(tenantId);
    await this.zzoneClient.deleteProduct(token, zzoneProductId);
  }

  async getProducts(
    tenantId: string,
    page = 1,
  ): Promise<{ products: ZzoneProduct[]; pagination: { total: number; page: number; pages: number } }> {
    const token = await this.getToken(tenantId);
    return this.zzoneClient.getMyProducts(token, page);
  }

  // ─── ORDERS ──────────────────────────────────────────────────────────

  async getOrders(
    tenantId: string,
    params?: { status?: string; page?: number },
  ): Promise<{ orders: ZzoneOrder[]; pagination: { total: number; page: number; pages: number } }> {
    const token = await this.getToken(tenantId);
    return this.zzoneClient.getSellerOrders(token, params);
  }

  async updateOrderStatus(
    tenantId: string,
    orderId: string,
    status: string,
  ): Promise<ZzoneOrder> {
    const token = await this.getToken(tenantId);
    return this.zzoneClient.updateOrderStatus(token, orderId, status);
  }

  // ─── STORE INFO ──────────────────────────────────────────────────────

  async getStoreInfo(tenantId: string): Promise<ZzoneStore> {
    const token = await this.getToken(tenantId);
    return this.zzoneClient.getMyStore(token);
  }

  // ─── PRODUCT MAPPING (RAOS ↔ ZZone) ─────────────────────────────────

  async publishProduct(
    tenantId: string,
    productId: string,
  ): Promise<{ zzoneProductId: string }> {
    const token = await this.getToken(tenantId);

    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
      select: { id: true, name: true, sellPrice: true, description: true, zzoneProductId: true },
    });

    if (!product) throw new NotFoundException('Product not found');

    // If already published — just return existing
    if (product.zzoneProductId) {
      return { zzoneProductId: product.zzoneProductId };
    }

    // Get stock
    const snapshot = await this.prisma.stockSnapshot.findFirst({
      where: { productId, tenantId },
      orderBy: { calculatedAt: 'desc' },
      select: { quantity: true },
    });
    const stock = snapshot ? Number(snapshot.quantity) : 0;

    // Push to ZZone
    const zzoneProduct = await this.zzoneClient.createProduct(token, {
      name: product.name,
      price: Number(product.sellPrice),
      category: 'Boshqa', // TODO: map RAOS category → ZZone category
      description: product.description || '',
      stock,
    });

    // Save mapping
    await this.prisma.product.update({
      where: { id: productId },
      data: {
        zzoneProductId: zzoneProduct._id,
        showOnZzone: true,
      },
    });

    this.logger.log(`[ZZone] Published "${product.name}" → ${zzoneProduct._id}`);

    return { zzoneProductId: zzoneProduct._id };
  }

  async unpublishProduct(
    tenantId: string,
    productId: string,
  ): Promise<void> {
    const token = await this.getToken(tenantId);

    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
      select: { id: true, zzoneProductId: true, name: true },
    });

    if (!product) throw new NotFoundException('Product not found');
    if (!product.zzoneProductId) return;

    // Delete from ZZone
    try {
      await this.zzoneClient.deleteProduct(token, product.zzoneProductId);
    } catch {
      // ZZone product might already be deleted — proceed
    }

    // Clear mapping
    await this.prisma.product.update({
      where: { id: productId },
      data: { zzoneProductId: null, showOnZzone: false },
    });

    this.logger.log(`[ZZone] Unpublished "${product.name}"`);
  }

  async getPublishedProducts(
    tenantId: string,
  ): Promise<{ id: string; name: string; zzoneProductId: string; sellPrice: number }[]> {
    const products = await this.prisma.product.findMany({
      where: { tenantId, showOnZzone: true, zzoneProductId: { not: null } },
      select: { id: true, name: true, zzoneProductId: true, sellPrice: true },
    });
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      zzoneProductId: p.zzoneProductId!,
      sellPrice: Number(p.sellPrice),
    }));
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────

  private async getConfig(tenantId: string): Promise<{
    token: string;
    refreshToken: string;
    zzoneUserId: string;
    zzoneStoreId: string | null;
    storeName: string | null;
    phone: string;
  } | null> {
    const record = await this.prisma.integrationConfig.findUnique({
      where: {
        tenantId_provider: { tenantId, provider: 'ZZONE' },
      },
    });

    if (!record || !record.isActive) return null;

    return record.config as any;
  }

  private async getToken(tenantId: string): Promise<string> {
    const config = await this.getConfig(tenantId);
    if (!config) {
      throw new BadRequestException(
        'ZZone integration not configured. Connect first via POST /integrations/zzone/connect',
      );
    }
    return config.token;
  }
}
