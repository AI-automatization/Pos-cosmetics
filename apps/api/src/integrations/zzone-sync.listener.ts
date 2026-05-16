import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { ZzoneClientService } from './zzone-client.service';

/**
 * ZZone Sync Listener
 *
 * Listens to domain events and auto-pushes stock changes to ZZone.
 * Only triggers for tenants with active ZZone integration.
 */

@Injectable()
export class ZzoneSyncListener {
  private readonly logger = new Logger(ZzoneSyncListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly zzoneClient: ZzoneClientService,
  ) {}

  /**
   * When a sale is created, update stock on ZZone for affected products.
   * Event payload: { tenantId, items: [{ productId, quantity }] }
   */
  @OnEvent('sale.created', { async: true })
  async handleSaleCreated(payload: {
    tenantId: string;
    items: { productId: string; quantity: number }[];
  }) {
    try {
      const config = await this.getActiveConfig(payload.tenantId);
      if (!config) return; // No ZZone integration for this tenant

      // For each sold product, check if it has a ZZone mapping and update stock
      for (const item of payload.items) {
        await this.syncProductStock(config.token, payload.tenantId, item.productId);
      }
    } catch (err) {
      this.logger.warn(
        `[ZZone Sync] Failed to sync after sale for tenant ${payload.tenantId}`,
        { error: (err as Error).message },
      );
    }
  }

  /**
   * When stock is manually adjusted, sync to ZZone.
   */
  @OnEvent('inventory.movement', { async: true })
  async handleStockMovement(payload: {
    tenantId: string;
    productId: string;
    newStock: number;
  }) {
    try {
      const config = await this.getActiveConfig(payload.tenantId);
      if (!config) return;

      await this.syncProductStock(config.token, payload.tenantId, payload.productId);
    } catch (err) {
      this.logger.warn(
        `[ZZone Sync] Failed to sync stock movement for tenant ${payload.tenantId}`,
        { error: (err as Error).message },
      );
    }
  }

  // ─── Private helpers ─────────────────────────────────────────────

  private async getActiveConfig(tenantId: string): Promise<{ token: string } | null> {
    const record = await this.prisma.integrationConfig.findUnique({
      where: { tenantId_provider: { tenantId, provider: 'ZZONE' } },
    });

    if (!record || !record.isActive) return null;

    const configData = record.config as any;
    return { token: configData.token };
  }

  private async syncProductStock(
    token: string,
    tenantId: string,
    productId: string,
  ): Promise<void> {
    // Get product with ZZone mapping
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
      select: { sku: true, name: true, zzoneProductId: true, showOnZzone: true },
    });

    if (!product || !product.zzoneProductId || !product.showOnZzone) return;

    // Get current stock from latest snapshot
    const snapshot = await this.prisma.stockSnapshot.findFirst({
      where: { productId, tenantId },
      orderBy: { calculatedAt: 'desc' },
      select: { quantity: true },
    });

    const currentStock = snapshot ? Number(snapshot.quantity) : 0;

    // Push stock update to ZZone
    await this.zzoneClient.updateProduct(token, product.zzoneProductId, {
      stock: currentStock,
    });

    this.logger.log(
      `[ZZone Sync] Pushed stock: "${product.name}" → ${currentStock} (ZZone: ${product.zzoneProductId})`,
    );
  }
}
