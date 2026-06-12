import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { AdetalOutboundService } from './adetal-outbound.service';
import { ADETAL_DEFAULT_CATEGORY, ADETAL_PROVIDER } from './adetal.constants';
import type { AdetalIntegrationConfig } from './dto/adetal.dto';

/**
 * Adetal Auto-Sync Listener
 *
 * Listens to RAOS domain events and auto-pushes to Adetal.
 * Only active for tenants with ADETAL IntegrationConfig (isActive + token).
 */
@Injectable()
export class AdetalSyncListener {
  private readonly logger = new Logger(AdetalSyncListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbound: AdetalOutboundService,
  ) {}

  @OnEvent('sale.created', { async: true })
  async onSaleCreated(payload: { tenantId: string; items: { productId: string }[] }) {
    for (const item of payload.items) {
      await this.syncStock(payload.tenantId, item.productId);
    }
  }

  @OnEvent('inventory.movement', { async: true })
  async onStockMovement(payload: { tenantId: string; productId: string }) {
    await this.syncStock(payload.tenantId, payload.productId);
  }

  @OnEvent('product.created', { async: true })
  async onProductCreated(payload: {
    tenantId: string;
    productId: string;
    product: { name: string; sku?: string; sellPrice: number; description?: string; categoryName?: string };
  }) {
    try {
      const adetalConfig = await this.getAdetalConfig(payload.tenantId);
      if (!adetalConfig) return;

      const stock = await this.getCurrentStock(payload.tenantId, payload.productId);

      const result = await this.outbound.createProduct(payload.tenantId, {
        name: payload.product.name,
        price: payload.product.sellPrice,
        category: payload.product.categoryName ?? ADETAL_DEFAULT_CATEGORY,
        description: payload.product.description ?? '',
        stock,
      });

      if (result?.product?._id) {
        await this.saveProductMapping(
          adetalConfig.configId,
          adetalConfig.productMappings,
          adetalConfig.reverseProductMappings,
          payload.productId,
          result.product._id,
        );
        this.logger.log(`[Adetal Sync] Product created: ${payload.productId} → adetal:${result.product._id}`);
      }
    } catch (err) {
      this.logger.warn(`[Adetal Sync] Product create failed: ${(err as Error).message}`);
    }
  }

  @OnEvent('product.updated', { async: true })
  async onProductUpdated(payload: { tenantId: string; productId: string; changes: Record<string, unknown> }) {
    try {
      const adetalConfig = await this.getAdetalConfig(payload.tenantId);
      if (!adetalConfig) return;

      const adetalProductId = adetalConfig.productMappings[payload.productId];
      if (!adetalProductId) return;

      const updates: Record<string, unknown> = {};
      if (payload.changes.name !== undefined) updates.name = payload.changes.name;
      if (payload.changes.sellPrice !== undefined) updates.price = Number(payload.changes.sellPrice);
      if (payload.changes.description !== undefined) updates.description = payload.changes.description;

      if (Object.keys(updates).length > 0) {
        await this.outbound.updateProduct(payload.tenantId, adetalProductId, updates);
        this.logger.log(`[Adetal Sync] Product updated: ${payload.productId}`);
      }
    } catch (err) {
      this.logger.warn(`[Adetal Sync] Product update failed: ${(err as Error).message}`);
    }
  }

  @OnEvent('product.deleted', { async: true })
  async onProductDeleted(payload: { tenantId: string; productId: string }) {
    try {
      const adetalConfig = await this.getAdetalConfig(payload.tenantId);
      if (!adetalConfig) return;

      const adetalProductId = adetalConfig.productMappings[payload.productId];
      if (!adetalProductId) return;

      await this.outbound.deleteProduct(payload.tenantId, adetalProductId);

      // Remove both forward and reverse mappings
      const { [payload.productId]: _, ...remainingForward } = adetalConfig.productMappings;
      const { [adetalProductId]: __, ...remainingReverse } = adetalConfig.reverseProductMappings;

      await this.prisma.integrationConfig.update({
        where: { id: adetalConfig.configId },
        data: {
          config: {
            ...adetalConfig.raw,
            productMappings: remainingForward,
            reverseProductMappings: remainingReverse,
          } as object,
        },
      });

      this.logger.log(`[Adetal Sync] Product deleted: ${payload.productId}`);
    } catch (err) {
      this.logger.warn(`[Adetal Sync] Product delete failed: ${(err as Error).message}`);
    }
  }

  // ─── PRIVATE ─────────────────────────────────────────────────────────

  private async getAdetalConfig(tenantId: string): Promise<{
    configId: string;
    productMappings: Record<string, string>;
    reverseProductMappings: Record<string, string>;
    raw: AdetalIntegrationConfig;
  } | null> {
    const config = await this.prisma.integrationConfig.findUnique({
      where: { tenantId_provider: { tenantId, provider: ADETAL_PROVIDER } },
    });

    if (!config || !config.isActive) return null;

    const adetalConfig = config.config as unknown as AdetalIntegrationConfig | null;
    if (!adetalConfig || typeof adetalConfig !== 'object' || !adetalConfig.accessToken) return null;

    return {
      configId: config.id,
      productMappings: adetalConfig.productMappings ?? {},
      reverseProductMappings: adetalConfig.reverseProductMappings ?? {},
      raw: adetalConfig,
    };
  }

  private async saveProductMapping(
    configId: string,
    currentForward: Record<string, string>,
    currentReverse: Record<string, string>,
    raosProductId: string,
    adetalProductId: string,
  ): Promise<void> {
    const updatedForward = { ...currentForward, [raosProductId]: adetalProductId };
    const updatedReverse = { ...currentReverse, [adetalProductId]: raosProductId };

    const config = await this.prisma.integrationConfig.findUnique({
      where: { id: configId },
    });
    const raw = (config?.config ?? {}) as Record<string, unknown>;

    await this.prisma.integrationConfig.update({
      where: { id: configId },
      data: {
        config: {
          ...raw,
          productMappings: updatedForward,
          reverseProductMappings: updatedReverse,
        } as object,
      },
    });
  }

  private async syncStock(tenantId: string, productId: string): Promise<void> {
    try {
      const adetalConfig = await this.getAdetalConfig(tenantId);
      if (!adetalConfig) return;

      const adetalProductId = adetalConfig.productMappings[productId];
      if (!adetalProductId) return;

      const stock = await this.getCurrentStock(tenantId, productId);
      await this.outbound.updateProduct(tenantId, adetalProductId, { stock });
      this.logger.log(`[Adetal Sync] Stock pushed: product ${productId} → ${stock}`);
    } catch (err) {
      this.logger.warn(`[Adetal Sync] Stock sync failed: ${(err as Error).message}`);
    }
  }

  private async getCurrentStock(tenantId: string, productId: string): Promise<number> {
    const snapshot = await this.prisma.stockSnapshot.findFirst({
      where: { productId, tenantId },
      orderBy: { calculatedAt: 'desc' },
      select: { quantity: true },
    });
    return snapshot ? Number(snapshot.quantity) : 0;
  }
}
