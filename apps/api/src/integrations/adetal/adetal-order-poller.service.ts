import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { AdetalOutboundService } from './adetal-outbound.service';
import { AdetalInboundService } from './adetal-inbound.service';
import { ADETAL_PROVIDER } from './adetal.constants';
import type { AdetalIntegrationConfig } from './dto/adetal.dto';

/**
 * Polls Adetal API for new seller orders every 2 minutes.
 * Adetal does not provide webhooks, so polling is the only way.
 */
@Injectable()
export class AdetalOrderPollerService {
  private readonly logger = new Logger(AdetalOrderPollerService.name);
  private isRunning = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbound: AdetalOutboundService,
    private readonly inbound: AdetalInboundService,
  ) {}

  @Cron('*/2 * * * *', { name: 'adetal-order-poll', timeZone: 'Asia/Tashkent' })
  async pollAllTenants() {
    if (this.isRunning) {
      this.logger.debug('[Adetal Poller] Previous poll still running, skipping');
      return;
    }

    this.isRunning = true;
    try {
      const configs = await this.prisma.integrationConfig.findMany({
        where: { provider: ADETAL_PROVIDER, isActive: true },
      });

      if (configs.length === 0) return;

      this.logger.debug(`[Adetal Poller] Polling ${configs.length} tenant(s)`);

      for (const config of configs) {
        try {
          await this.pollTenantOrders(config.tenantId, config.id, config.config as unknown as AdetalIntegrationConfig);
        } catch (err) {
          this.logger.warn(`[Adetal Poller] Tenant ${config.tenantId} failed: ${(err as Error).message}`);
        }
      }
    } finally {
      this.isRunning = false;
    }
  }

  private async pollTenantOrders(tenantId: string, configId: string, adetalConfig: AdetalIntegrationConfig) {
    if (!adetalConfig.accessToken) return;

    const result = await this.outbound.getSellerOrders(tenantId, { status: 'PENDING', limit: 50 });

    if (!result.orders?.length) return;

    let processed = 0;
    let skipped = 0;

    for (const order of result.orders) {
      try {
        const res = await this.inbound.processAdetalOrder(tenantId, order);
        if (res.skipped) {
          skipped++;
        } else {
          processed++;
        }
      } catch (err) {
        this.logger.warn(`[Adetal Poller] Order #${order.orderNumber} failed: ${(err as Error).message}`);
      }
    }

    // Update lastPolledAt
    const currentConfig = (await this.prisma.integrationConfig.findUnique({
      where: { id: configId },
    }))?.config as Record<string, unknown> | null;

    if (currentConfig) {
      currentConfig.lastPolledAt = new Date().toISOString();
      await this.prisma.integrationConfig.update({
        where: { id: configId },
        data: { config: currentConfig as object },
      });
    }

    if (processed > 0) {
      this.logger.log(`[Adetal Poller] Tenant ${tenantId}: ${processed} new, ${skipped} skipped`);
    }
  }
}
