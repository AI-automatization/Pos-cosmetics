import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

export type WebhookEventType =
  | 'order_status_changed'
  | 'stock_updated'
  | 'product_synced'
  | 'seller_deactivated';

interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  data: Record<string, unknown>;
}

@Injectable()
export class ZzoneWebhookService {
  private readonly logger = new Logger(ZzoneWebhookService.name);
  private readonly webhookUrl: string;
  private readonly webhookSecret: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.webhookUrl = this.config.get<string>('ZZONE_WEBHOOK_URL', 'https://api.zzone.uz/api/raos/webhook');
    this.webhookSecret = this.config.get<string>('ZZONE_WEBHOOK_SECRET', '');
    if (!this.webhookSecret) {
      this.logger.warn('ZZONE_WEBHOOK_SECRET not set — webhooks disabled');
    }
  }

  async sendOrderStatusChanged(orderId: string, status: string, sellerId: string): Promise<void> {
    await this.send('order_status_changed', {
      orderId,
      sellerId,
      status,
    });
  }

  async sendStockUpdated(productId: string, sellerId: string, stock: number): Promise<void> {
    await this.send('stock_updated', {
      productId,
      sellerId,
      stock,
    });
  }

  async sendProductSynced(productId: string, sellerId: string, action: 'created' | 'updated' | 'deleted'): Promise<void> {
    await this.send('product_synced', {
      productId,
      sellerId,
      action,
    });
  }

  async sendSellerDeactivated(sellerId: string): Promise<void> {
    await this.send('seller_deactivated', {
      sellerId,
    });
  }

  private async send(event: WebhookEventType, data: Record<string, unknown>): Promise<void> {
    if (!this.webhookSecret) {
      this.logger.debug(`[Webhook] Skipped ${event} — no secret configured`);
      return;
    }

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ZZone-Api-Key': this.webhookSecret,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        this.logger.warn(`[Webhook] ${event} failed: ${response.status}`, { body });
        // Store failed webhook for retry
        await this.storeFailedWebhook(payload, response.status);
        return;
      }

      this.logger.log(`[Webhook] ${event} sent successfully`);
    } catch (err) {
      this.logger.error(`[Webhook] ${event} error: ${(err as Error).message}`);
      await this.storeFailedWebhook(payload, 0);
    }
  }

  private async storeFailedWebhook(payload: WebhookPayload, statusCode: number): Promise<void> {
    try {
      await this.prisma.webhookLog.create({
        data: {
          provider: 'ZZONE',
          event: payload.event,
          payload: JSON.parse(JSON.stringify(payload)),
          statusCode,
          success: false,
          retriesLeft: 3,
        },
      });
    } catch {
      // webhookLog table may not exist yet — silently skip
      this.logger.debug('[Webhook] Could not store failed webhook — table may not exist');
    }
  }
}
