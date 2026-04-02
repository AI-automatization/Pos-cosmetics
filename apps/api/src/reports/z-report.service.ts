import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FiscalAdapterService } from '../tax/fiscal-adapter.service';

@Injectable()
export class ZReportService {
  private readonly logger = new Logger(ZReportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fiscalAdapter: FiscalAdapterService,
  ) {}

  // POST /reports/z-report — kunlik yakuniy fiskal hisobot (IMMUTABLE)
  async createZReport(tenantId: string, userId: string, date?: string) {
    const reportDate = date ? new Date(date) : new Date();
    const dayStart = new Date(reportDate.getFullYear(), reportDate.getMonth(), reportDate.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const existing = await this.prisma.zReport.findUnique({
      where: { tenantId_date: { tenantId, date: dayStart } },
    });
    if (existing) {
      throw new ConflictException(
        `${dayStart.toISOString().slice(0, 10)} kuni uchun Z-report allaqachon mavjud (seq #${existing.sequenceNumber})`,
      );
    }

    const [orderAgg, returnAgg] = await Promise.all([
      this.prisma.order.aggregate({
        where: { tenantId, createdAt: { gte: dayStart, lt: dayEnd }, status: { not: 'VOIDED' } },
        _sum: { total: true, taxAmount: true },
        _count: { id: true },
      }),
      this.prisma.return.aggregate({
        where: { tenantId, createdAt: { gte: dayStart, lt: dayEnd }, status: 'APPROVED' },
        _sum: { total: true },
      }),
    ]);

    type PaymentRow = { method: string; amount: number };
    const [paymentRows, fiscalCount, closedShifts, maxSeq] = await Promise.all([
      this.prisma.$queryRaw<PaymentRow[]>`
        SELECT
          pi.method,
          COALESCE(SUM(pi.amount), 0)::float AS amount
        FROM payment_intents pi
        JOIN orders o ON o.id = pi.order_id
        WHERE pi.tenant_id = ${tenantId}
          AND o.created_at >= ${dayStart}
          AND o.created_at <  ${dayEnd}
          AND pi.status = 'SETTLED'
        GROUP BY pi.method
      `,
      this.prisma.order.count({
        where: { tenantId, createdAt: { gte: dayStart, lt: dayEnd }, fiscalStatus: 'SENT' },
      }),
      this.prisma.shift.findMany({
        where: { tenantId, status: 'CLOSED', closedAt: { gte: dayStart, lt: dayEnd } },
        select: { id: true },
      }),
      this.prisma.zReport.findFirst({
        where: { tenantId },
        orderBy: { sequenceNumber: 'desc' },
        select: { sequenceNumber: true },
      }),
    ]);

    const paymentMap: Record<string, number> = {};
    for (const row of paymentRows) {
      paymentMap[row.method] = row.amount;
    }

    const sequenceNumber = (maxSeq?.sequenceNumber ?? 0) + 1;
    const totalRevenue = Number(orderAgg._sum.total ?? 0);
    const totalTax = Number(orderAgg._sum.taxAmount ?? 0);
    const totalReturns = Number(returnAgg._sum.total ?? 0);

    const zReport = await this.prisma.zReport.create({
      data: {
        tenantId,
        sequenceNumber,
        date: dayStart,
        totalOrders: orderAgg._count.id,
        totalRevenue,
        totalTax,
        totalReturns,
        cashAmount: paymentMap['CASH'] ?? 0,
        terminalAmount: paymentMap['TERMINAL'] ?? 0,
        clickAmount: paymentMap['CLICK'] ?? 0,
        paymeAmount: paymentMap['PAYME'] ?? 0,
        transferAmount: paymentMap['TRANSFER'] ?? 0,
        debtAmount: paymentMap['DEBT'] ?? 0,
        fiscalCount,
        shiftIds: closedShifts.map((s) => s.id),
        createdBy: userId,
      },
    });

    this.logger.log(`[ZReport] Created seq #${sequenceNumber} for ${dayStart.toISOString().slice(0, 10)}`, {
      tenantId,
      revenue: totalRevenue,
      orders: orderAgg._count.id,
    });

    this.fiscalAdapter.sendZReport({
      tenantId,
      sequenceNumber,
      date: dayStart,
      totalRevenue,
      totalTax,
      totalOrders: orderAgg._count.id,
      cashAmount: paymentMap['CASH'] ?? 0,
      terminalAmount: paymentMap['TERMINAL'] ?? 0,
    }).catch((err: unknown) => {
      this.logger.warn(`[ZReport] Fiscal Z-report send failed (non-critical): ${(err as Error).message}`, { tenantId });
    });

    return zReport;
  }

  async getZReports(tenantId: string, limit = 30) {
    return this.prisma.zReport.findMany({
      where: { tenantId },
      orderBy: { sequenceNumber: 'desc' },
      take: limit,
    });
  }

  async getShiftReport(tenantId: string, shiftId: string) {
    const shift = await this.prisma.shift.findFirst({
      where: { id: shiftId, tenantId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        branch: { select: { id: true, name: true } },
      },
    });

    if (!shift) return null;

    const [orderAgg, paymentAgg, topItems] = await Promise.all([
      this.prisma.order.aggregate({
        where: { tenantId, shiftId, status: { not: 'VOIDED' } },
        _sum: { total: true, discountAmount: true },
        _count: { id: true },
      }),
      this.prisma.$queryRaw<{ method: string; amount: number }[]>`
        SELECT
          pi.method,
          SUM(pi.amount)::float AS amount
        FROM payment_intents pi
        JOIN orders o ON o.id = pi.order_id
        WHERE o.tenant_id = ${tenantId}
          AND o.shift_id  = ${shiftId}
          AND pi.status::text = 'SETTLED'
        GROUP BY pi.method
      `,
      this.prisma.$queryRaw<{ productName: string; qty: number; revenue: number }[]>`
        SELECT
          oi.product_name AS "productName",
          SUM(oi.quantity)::float AS qty,
          SUM(oi.total)::float    AS revenue
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.tenant_id = ${tenantId}
          AND o.shift_id  = ${shiftId}
          AND o.status::text != 'VOIDED'
        GROUP BY oi.product_name
        ORDER BY revenue DESC
        LIMIT 10
      `,
    ]);

    return {
      shift: {
        id: shift.id,
        status: shift.status,
        cashier: `${shift.user.firstName} ${shift.user.lastName}`,
        branch: shift.branch?.name ?? null,
        openedAt: shift.openedAt,
        closedAt: shift.closedAt,
        openingCash: shift.openingCash,
        closingCash: shift.closingCash,
        expectedCash: shift.expectedCash,
      },
      orders: {
        count: orderAgg._count.id,
        totalRevenue: Number(orderAgg._sum.total ?? 0),
        totalDiscount: Number(orderAgg._sum.discountAmount ?? 0),
      },
      paymentBreakdown: paymentAgg,
      topProducts: topItems,
    };
  }
}
