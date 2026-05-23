import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { ZzoneWebhookService } from './zzone-webhook.service';

/**
 * Listens to RAOS domain events and sends webhooks TO ZZone.
 *
 * Events:
 * - order status changed → order_status_changed
 * - stock deducted/adjusted → stock_updated
 * - product lifecycle → product_synced
 * - seller deactivated → seller_deactivated
 */

@Injectable()
export class ZzoneWebhookListener {
  private readonly logger = new Logger(ZzoneWebhookListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly webhook: ZzoneWebhookService,
  ) {}

  @OnEvent('sale.created', { async: true })
  async onSaleCreated(payload: { tenantId: string; items: { productId: string; quantity: number }[] }) {
    if (!(await this.isZzoneActive(payload.tenantId))) return;

    for (const item of payload.items) {
      const stock = await this.getCurrentStock(payload.tenantId, item.productId);
      await this.webhook.sendStockUpdated(item.productId, payload.tenantId, stock);
    }
  }

  @OnEvent('inventory.movement', { async: true })
  async onInventoryMovement(payload: { tenantId: string; productId: string }) {
    if (!(await this.isZzoneActive(payload.tenantId))) return;

    const stock = await this.getCurrentStock(payload.tenantId, payload.productId);
    await this.webhook.sendStockUpdated(payload.productId, payload.tenantId, stock);
  }

  @OnEvent('product.created', { async: true })
  async onProductCreated(payload: { tenantId: string; productId: string }) {
    if (!(await this.isZzoneActive(payload.tenantId))) return;
    await this.webhook.sendProductSynced(payload.productId, payload.tenantId, 'created');
  }

  @OnEvent('product.updated', { async: true })
  async onProductUpdated(payload: { tenantId: string; productId: string }) {
    if (!(await this.isZzoneActive(payload.tenantId))) return;
    await this.webhook.sendProductSynced(payload.productId, payload.tenantId, 'updated');
  }

  @OnEvent('product.deleted', { async: true })
  async onProductDeleted(payload: { tenantId: string; productId: string }) {
    if (!(await this.isZzoneActive(payload.tenantId))) return;
    await this.webhook.sendProductSynced(payload.productId, payload.tenantId, 'deleted');
  }

  // ─── Helpers ────────────────────────────────────────────────────────

  private async isZzoneActive(tenantId: string): Promise<boolean> {
    const config = await this.prisma.integrationConfig.findUnique({
      where: { tenantId_provider: { tenantId, provider: 'ZZONE' } },
      select: { isActive: true },
    });
    return config?.isActive ?? false;
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
