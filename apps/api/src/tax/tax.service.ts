import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { extractVAT, UZ_VAT_RATE } from '../common/utils/currency.util';
import { CircuitBreakerService } from '../common/circuit-breaker/circuit-breaker.service';
import { QueueService } from '../common/queue/queue.service';

// ─── Placeholder Fiscal Adapter ───────────────────────────────
// Hozir faqat fiscal_status = PENDING qiladi
// Keyinroq real REGOS / OFD adapter qo'shiladi
// ⚠️ Sale ni HECH QACHON block qilmaymiz fiscal xato bo'lsa

interface SaleCreatedPayload {
  tenantId: string;
  orderId: string;
  total: number;
}

@Injectable()
export class TaxService {
  private readonly logger = new Logger(TaxService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cb: CircuitBreakerService,
    private readonly queueService: QueueService,
  ) {}

  // ─── EVENT: sale.created → queue fiscal receipt ────────────

  @OnEvent('sale.created')
  async handleSaleCreated(payload: SaleCreatedPayload) {
    // ⚠️ Fiscal xato bo'lsa ham sale to'xtatilmaydi
    try {
      // Avval PENDING qilib, keyin queue ga tashlash
      await this.prisma.order.update({
        where: { id: payload.orderId },
        data: { fiscalStatus: 'PENDING' },
      });

      // CB orqali queue ga qo'shish (queue ham tashqi resurs)
      await this.cb.execute(
        'fiscal-api',
        async () => {
          await this.queueService.addFiscalReceiptJob({
            tenantId: payload.tenantId,
            orderId: payload.orderId,
          });
          this.logger.log(`Fiscal job queued for order ${payload.orderId}`, {
            tenantId: payload.tenantId,
          });
        },
        async () => {
          this.logger.warn(
            `Fiscal circuit OPEN — order ${payload.orderId} stays PENDING for retry`,
            { tenantId: payload.tenantId },
          );
        },
      );
    } catch (err) {
      this.logger.warn(
        `Fiscal queue error for order ${payload.orderId} — sale NOT blocked`,
        { error: (err as Error).message, tenantId: payload.tenantId },
      );
    }
  }

  // ─── MANUAL: Retry fiscal (keyinroq ishlatiladi) ───────────

  async retryFiscal(tenantId: string, orderId: string): Promise<{ queued: boolean }> {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId, fiscalStatus: { in: ['FAILED', 'PENDING'] } },
    });

    if (!order) {
      this.logger.warn(`Fiscal retry: order ${orderId} not found or not retryable`);
      return { queued: false };
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: { fiscalStatus: 'PENDING' },
    });

    await this.queueService.addFiscalReceiptJob({ tenantId, orderId });
    this.logger.log(`Fiscal retry queued for order ${orderId}`, { tenantId });
    return { queued: true };
  }

  // ─── GET: Fiscal status by order ───────────────────────────

  async getFiscalStatus(tenantId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
      select: { id: true, fiscalStatus: true, fiscalId: true, fiscalQr: true },
    });
    return order;
  }

  // ─── NDS (QQS) HISOBLASH (T-078) ───────────────────────────

  /**
   * Buyurtma summasidan QQS hisoblash.
   * O'zbekiston: 12% tax-inclusive (narx allaqachon QQS bilan)
   */
  calculateOrderVAT(total: number, taxable = true) {
    if (!taxable) {
      return { subtotal: total, vatAmount: 0, total, vatRate: 0 };
    }
    const result = extractVAT(total);
    return { ...result, vatRate: UZ_VAT_RATE };
  }

  /**
   * Davriy QQS hisoboti — GET /tax/report
   */
  async getTaxReport(tenantId: string, from: string, to: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
        status: 'COMPLETED',
        createdAt: { gte: fromDate, lte: toDate },
      },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        taxAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    let totalRevenue = 0;
    let totalVAT = 0;
    let totalSubtotal = 0;

    const rows = orders.map((o) => {
      const total = Number(o.total);
      const { subtotal, vatAmount } = extractVAT(total);
      totalRevenue += total;
      totalVAT += vatAmount;
      totalSubtotal += subtotal;
      return {
        orderId: o.id,
        orderNumber: o.orderNumber,
        total,
        subtotal: Math.round(subtotal),
        vatAmount: Math.round(vatAmount),
        createdAt: o.createdAt,
      };
    });

    return {
      period: { from, to },
      vatRate: `${UZ_VAT_RATE * 100}%`,
      summary: {
        totalRevenue: Math.round(totalRevenue),
        totalSubtotal: Math.round(totalSubtotal),
        totalVAT: Math.round(totalVAT),
        orderCount: orders.length,
      },
      rows,
    };
  }
}
