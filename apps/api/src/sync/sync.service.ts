import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InboundSyncDto, SyncEventType } from './dto/sync.dto';
import { Prisma } from '@prisma/client';

export interface SyncResult {
  idempotencyKey: string;
  status: 'PROCESSED' | 'DUPLICATE' | 'FAILED';
  error?: string;
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  // POST /sync/inbound — POS dan batch events qabul qilish
  async processInbound(
    tenantId: string,
    dto: InboundSyncDto,
  ): Promise<{ results: SyncResult[]; processed: number; duplicates: number; failed: number }> {
    const results: SyncResult[] = [];

    for (const event of dto.events) {
      const result = await this.processSingleEvent(tenantId, event);
      results.push(result);
    }

    return {
      results,
      processed: results.filter((r) => r.status === 'PROCESSED').length,
      duplicates: results.filter((r) => r.status === 'DUPLICATE').length,
      failed: results.filter((r) => r.status === 'FAILED').length,
    };
  }

  private async processSingleEvent(
    tenantId: string,
    event: InboundSyncDto['events'][0],
  ): Promise<SyncResult> {
    const { idempotencyKey, type, payload, sequenceNumber, deviceId, branchId } = event;

    // Idempotency check — avval DB da bormi?
    const existing = await this.prisma.syncOutbox.findUnique({
      where: { idempotencyKey },
    });

    if (existing) {
      this.logger.warn(`Duplicate event skipped: ${idempotencyKey}`);
      return { idempotencyKey, status: 'DUPLICATE' };
    }

    // DB ga yozib olish (PENDING)
    const record = await this.prisma.syncOutbox.create({
      data: {
        tenantId,
        branchId: branchId ?? null,
        deviceId,
        eventType: type as any,
        payload: payload as Prisma.InputJsonValue,
        idempotencyKey,
        sequenceNumber: BigInt(sequenceNumber),
        status: 'PENDING',
      },
    });

    try {
      // Event turga qarab process qilish
      await this.dispatchEvent(tenantId, type, payload);

      await this.prisma.syncOutbox.update({
        where: { id: record.id },
        data: { status: 'PROCESSED', processedAt: new Date() },
      });

      this.logger.log(`Sync event processed: ${type} [${idempotencyKey}]`);
      return { idempotencyKey, status: 'PROCESSED' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      await this.prisma.syncOutbox.update({
        where: { id: record.id },
        data: { status: 'FAILED', errorMessage },
      });

      this.logger.error(`Sync event failed: ${type} [${idempotencyKey}]`, errorMessage);
      return { idempotencyKey, status: 'FAILED', error: errorMessage };
    }
  }

  private async dispatchEvent(
    tenantId: string,
    type: SyncEventType,
    payload: Record<string, unknown>,
  ): Promise<void> {
    switch (type) {
      case SyncEventType.SALE_CREATED:
        // POS dan kelgan savdo — Sales moduliga delegat qilish
        // Payload: { orderId, items, totalAmount, ... }
        this.logger.log(`[SYNC] SALE_CREATED from POS, orderId=${payload['orderId']}`);
        break;

      case SyncEventType.PAYMENT_SETTLED:
        this.logger.log(`[SYNC] PAYMENT_SETTLED from POS, paymentId=${payload['paymentId']}`);
        break;

      case SyncEventType.RETURN_CREATED:
        this.logger.log(`[SYNC] RETURN_CREATED from POS, returnId=${payload['returnId']}`);
        break;

      case SyncEventType.STOCK_MOVEMENT:
        // POS dan kelgan inventar harakati
        this.logger.log(`[SYNC] STOCK_MOVEMENT from POS, productId=${payload['productId']}`);
        break;

      default:
        throw new Error(`Unknown event type: ${type}`);
    }
  }

  // GET /sync/outbound — Server dan POS ga o'zgarishlar
  async getOutbound(
    tenantId: string,
    since: string,
    branchId?: string,
  ) {
    const sinceDate = new Date(since);

    const [products, categories, prices] = await Promise.all([
      // Mahsulotlar — yangilangan yoki yaratilgan
      this.prisma.product.findMany({
        where: {
          tenantId,
          updatedAt: { gt: sinceDate },
          deletedAt: null,
        },
        include: {
          barcodes: { select: { barcode: true } },
          unit: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: 'asc' },
        take: 500,
      }),

      // Kategoriyalar
      this.prisma.category.findMany({
        where: {
          tenantId,
          updatedAt: { gt: sinceDate },
          deletedAt: null,
        },
        orderBy: { updatedAt: 'asc' },
        take: 200,
      }),

      // Narxlar
      this.prisma.productPrice.findMany({
        where: {
          tenantId,
          updatedAt: { gt: sinceDate },
          isActive: true,
        },
        orderBy: { updatedAt: 'asc' },
        take: 500,
      }),
    ]);

    return {
      syncedAt: new Date().toISOString(),
      since: sinceDate.toISOString(),
      products,
      categories,
      prices,
      counts: {
        products: products.length,
        categories: categories.length,
        prices: prices.length,
      },
    };
  }

  // Pending / failed eventlar ro'yxati (monitoring uchun)
  async getPendingEvents(tenantId: string) {
    const [pending, failed] = await Promise.all([
      this.prisma.syncOutbox.count({ where: { tenantId, status: 'PENDING' } }),
      this.prisma.syncOutbox.count({ where: { tenantId, status: 'FAILED' } }),
    ]);

    const failedEvents = await this.prisma.syncOutbox.findMany({
      where: { tenantId, status: 'FAILED' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        eventType: true,
        idempotencyKey: true,
        deviceId: true,
        errorMessage: true,
        createdAt: true,
      },
    });

    return { pending, failed, failedEvents };
  }
}
