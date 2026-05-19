import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { ZzoneOutboundService } from './zzone-outbound.service';

interface ZzoneConfig {
  token?: string;
  productMappings?: Record<string, string>;
}

/**
 * ZZone Auto-Sync Listener
 *
 * Listens to RAOS domain events and auto-pushes to ZZone.
 * Only active for tenants that have ZZONE_TOKEN configured.
 */

@Injectable()
export class ZzoneSyncListener {
  private readonly logger = new Logger(ZzoneSyncListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbound: ZzoneOutboundService,
  ) {}

  /**
   * When a sale happens, push updated stock to ZZone.
   */
  @OnEvent('sale.created', { async: true })
  async onSaleCreated(payload: { tenantId: string; items: { productId: string }[] }) {
    for (const item of payload.items) {
      await this.syncStock(payload.tenantId, item.productId);
    }
  }

  /**
   * When stock is adjusted manually, push to ZZone.
   */
  @OnEvent('inventory.movement', { async: true })
  async onStockMovement(payload: { tenantId: string; productId: string }) {
    await this.syncStock(payload.tenantId, payload.productId);
  }

  /**
   * When a product is created, push to ZZone (AUTO_PARTS tenants only).
   */
  @OnEvent('product.created', { async: true })
  async onProductCreated(payload: {
    tenantId: string;
    productId: string;
    product: { name: string; sku?: string; sellPrice: number; description?: string; imageUrl?: string };
  }) {
    try {
      const zzoneConfig = await this.getZzoneConfig(payload.tenantId);
      if (!zzoneConfig) return;

      const result = await this.outbound.createProduct(zzoneConfig.token, {
        name: payload.product.name,
        price: payload.product.sellPrice,
        category: 'auto_parts',
        description: payload.product.description ?? '',
        stock: 0,
      });

      if (result?.zzoneProductId) {
        await this.saveProductMapping(zzoneConfig.configId, zzoneConfig.productMappings, payload.productId, result.zzoneProductId);
        this.logger.log(`[ZZone Sync] Product created: ${payload.productId} → zzone:${result.zzoneProductId}`);
      }
    } catch (err) {
      this.logger.warn(`[ZZone Sync] Product create failed: ${(err as Error).message}`);
    }
  }

  /**
   * When a product is updated, push changes to ZZone.
   */
  @OnEvent('product.updated', { async: true })
  async onProductUpdated(payload: { tenantId: string; productId: string; changes: Record<string, unknown> }) {
    try {
      const zzoneConfig = await this.getZzoneConfig(payload.tenantId);
      if (!zzoneConfig) return;

      const zzoneProductId = zzoneConfig.productMappings?.[payload.productId];
      if (!zzoneProductId) return;

      const updates: Record<string, unknown> = {};
      if (payload.changes.name !== undefined) updates.name = payload.changes.name;
      if (payload.changes.sellPrice !== undefined) updates.price = Number(payload.changes.sellPrice);
      if (payload.changes.description !== undefined) updates.description = payload.changes.description;

      if (Object.keys(updates).length > 0) {
        await this.outbound.updateProduct(zzoneConfig.token, zzoneProductId, updates);
        this.logger.log(`[ZZone Sync] Product updated: ${payload.productId}`);
      }
    } catch (err) {
      this.logger.warn(`[ZZone Sync] Product update failed: ${(err as Error).message}`);
    }
  }

  /**
   * When a product is deleted, remove from ZZone.
   */
  @OnEvent('product.deleted', { async: true })
  async onProductDeleted(payload: { tenantId: string; productId: string }) {
    try {
      const zzoneConfig = await this.getZzoneConfig(payload.tenantId);
      if (!zzoneConfig) return;

      const zzoneProductId = zzoneConfig.productMappings?.[payload.productId];
      if (!zzoneProductId) return;

      await this.outbound.deleteProduct(zzoneConfig.token, zzoneProductId);

      // Remove mapping
      const { [payload.productId]: _, ...remaining } = zzoneConfig.productMappings ?? {};
      await this.prisma.integrationConfig.update({
        where: { id: zzoneConfig.configId },
        data: { config: { ...zzoneConfig.raw, productMappings: remaining } },
      });

      this.logger.log(`[ZZone Sync] Product deleted: ${payload.productId}`);
    } catch (err) {
      this.logger.warn(`[ZZone Sync] Product delete failed: ${(err as Error).message}`);
    }
  }

  // ─── PRIVATE ─────────────────────────────────────────────────────────

  private async getZzoneConfig(tenantId: string): Promise<{
    configId: string;
    token: string;
    productMappings: Record<string, string>;
    raw: ZzoneConfig;
  } | null> {
    const config = await this.prisma.integrationConfig.findUnique({
      where: { tenantId_provider: { tenantId, provider: 'ZZONE' } },
    });

    if (!config || !config.isActive) return null;

    const zzoneConfig = config.config as ZzoneConfig | null;
    if (!zzoneConfig || typeof zzoneConfig !== 'object' || !zzoneConfig.token) return null;

    return {
      configId: config.id,
      token: zzoneConfig.token,
      productMappings: zzoneConfig.productMappings ?? {},
      raw: zzoneConfig,
    };
  }

  private async saveProductMapping(
    configId: string,
    currentMappings: Record<string, string>,
    raosProductId: string,
    zzoneProductId: string,
  ): Promise<void> {
    const updatedMappings = { ...currentMappings, [raosProductId]: zzoneProductId };
    await this.prisma.integrationConfig.update({
      where: { id: configId },
      data: { config: { productMappings: updatedMappings } },
    });
  }

  private async syncStock(tenantId: string, productId: string): Promise<void> {
    try {
      const zzoneConfig = await this.getZzoneConfig(tenantId);
      if (!zzoneConfig) return;

      const zzoneProductId = zzoneConfig.productMappings?.[productId];
      if (!zzoneProductId) return;

      const snapshot = await this.prisma.stockSnapshot.findFirst({
        where: { productId, tenantId },
        orderBy: { calculatedAt: 'desc' },
        select: { quantity: true },
      });

      const stock = snapshot ? Number(snapshot.quantity) : 0;
      await this.outbound.updateStock(zzoneConfig.token, zzoneProductId, stock);
      this.logger.log(`[ZZone Sync] Stock pushed: product ${productId} → ${stock}`);
    } catch (err) {
      this.logger.warn(`[ZZone Sync] Stock sync failed: ${(err as Error).message}`);
    }
  }
}
