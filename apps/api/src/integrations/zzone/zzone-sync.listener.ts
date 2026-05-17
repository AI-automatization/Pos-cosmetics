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

  // ─── PRIVATE ─────────────────────────────────────────────────────────

  private async syncStock(tenantId: string, productId: string): Promise<void> {
    try {
      // Check if tenant has ZZone config
      const config = await this.prisma.integrationConfig.findUnique({
        where: { tenantId_provider: { tenantId, provider: 'ZZONE' } },
      });

      if (!config || !config.isActive) return;

      const zzoneConfig = config.config as ZzoneConfig | null;
      if (!zzoneConfig || typeof zzoneConfig !== 'object') return;

      const { token, productMappings } = zzoneConfig;
      if (!token) return;

      // Find ZZone product ID mapping
      const zzoneProductId = productMappings?.[productId];
      if (!zzoneProductId) return;

      // Get current stock
      const snapshot = await this.prisma.stockSnapshot.findFirst({
        where: { productId, tenantId },
        orderBy: { calculatedAt: 'desc' },
        select: { quantity: true },
      });

      const stock = snapshot ? Number(snapshot.quantity) : 0;

      // Push to ZZone
      await this.outbound.updateStock(token, zzoneProductId, stock);
      this.logger.log(`[ZZone Sync] Stock pushed: product ${productId} → ${stock}`);
    } catch (err) {
      this.logger.warn(`[ZZone Sync] Failed: ${(err as Error).message}`);
    }
  }
}
