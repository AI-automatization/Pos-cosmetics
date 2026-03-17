import {
  Injectable,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

// T-070: Shubhali faoliyat chegaralari
const FRAUD_THRESHOLDS = {
  VOID_PER_HOUR: 3,          // 1 soatda 3+ void
  REFUND_RATIO: 0.20,        // qaytarishlar > savdoning 20%
  DISCOUNT_RATIO: 0.15,      // chegirmalar > savdoning 15%
} as const;

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emitter: EventEmitter2,
  ) {}

  // ─── DAILY REPORT (T-226) ─────────────────────────────────────

  async getDailyReport(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [orderAgg, returnAgg] = await Promise.all([
      this.prisma.order.aggregate({
        where: { tenantId, createdAt: { gte: today, lt: tomorrow }, status: { not: 'VOIDED' as const } },
        _sum: { total: true },
        _count: { id: true },
      }),
      this.prisma.return.aggregate({
        where: { tenantId, createdAt: { gte: today, lt: tomorrow }, status: 'APPROVED' },
        _sum: { total: true },
        _count: { id: true },
      }),
    ]);

    const revenue = Number(orderAgg._sum.total ?? 0);
    const returnTotal = Number(returnAgg._sum.total ?? 0);
    return {
      date: today.toISOString().slice(0, 10),
      orders: orderAgg._count.id,
      revenue,
      returns: returnAgg._count.id,
      returnTotal,
      netRevenue: revenue - returnTotal,
    };
  }

  // ─── DAILY REVENUE ────────────────────────────────────────────

  async getDailyRevenue(tenantId: string, from: Date, to: Date) {
    const rows = await this.prisma.$queryRaw<
      { date: string; revenue: number; orderCount: number }[]
    >`
      SELECT
        DATE(created_at) AS date,
        SUM(total)::float        AS revenue,
        COUNT(*)::int            AS "orderCount"
      FROM orders
      WHERE tenant_id = ${tenantId}
        AND created_at >= ${from}
        AND created_at <  ${to}
        AND status::text != 'VOIDED'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    this.logger.log(`DailyRevenue query: ${from.toISOString()} → ${to.toISOString()}`, { tenantId });
    return rows;
  }

  // ─── TOP PRODUCTS ─────────────────────────────────────────────

  async getTopProducts(tenantId: string, from: Date, to: Date, limit = 10) {
    const rows = await this.prisma.$queryRaw<
      { productId: string; productName: string; totalQty: number; totalRevenue: number }[]
    >`
      SELECT
        oi.product_id          AS "productId",
        oi.product_name        AS "productName",
        SUM(oi.quantity)::float       AS "totalQty",
        SUM(oi.total)::float          AS "totalRevenue"
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.tenant_id = ${tenantId}
        AND o.created_at >= ${from}
        AND o.created_at <  ${to}
        AND o.status::text != 'VOIDED'
      GROUP BY oi.product_id, oi.product_name
      ORDER BY "totalRevenue" DESC
      LIMIT ${limit}
    `;

    return rows;
  }

  // ─── SALES SUMMARY ────────────────────────────────────────────

  async getSalesSummary(tenantId: string, from: Date, to: Date) {
    const [orderAgg, returnAgg, paymentAgg] = await Promise.all([
      // Total orders
      this.prisma.order.aggregate({
        where: {
          tenantId,
          createdAt: { gte: from, lt: to },
          status: { not: 'VOIDED' },
        },
        _sum: { total: true, subtotal: true, discountAmount: true, taxAmount: true },
        _count: { id: true },
      }),

      // Total returns
      this.prisma.return.aggregate({
        where: {
          tenantId,
          createdAt: { gte: from, lt: to },
          status: 'APPROVED',
        },
        _sum: { total: true },
        _count: { id: true },
      }),

      // Payment breakdown by method
      this.prisma.$queryRaw<{ method: string; amount: number }[]>`
        SELECT
          pi.method,
          SUM(pi.amount)::float AS amount
        FROM payment_intents pi
        JOIN orders o ON o.id = pi.order_id
        WHERE pi.tenant_id = ${tenantId}
          AND o.created_at >= ${from}
          AND o.created_at <  ${to}
          AND pi.status::text = 'SETTLED'
        GROUP BY pi.method
      `,
    ]);

    const grossRevenue = Number(orderAgg._sum.total ?? 0);
    const returnTotal = Number(returnAgg._sum.total ?? 0);
    const netRevenue = grossRevenue - returnTotal;

    return {
      period: { from, to },
      orders: {
        count: orderAgg._count.id,
        grossRevenue,
        subtotal: Number(orderAgg._sum.subtotal ?? 0),
        totalDiscount: Number(orderAgg._sum.discountAmount ?? 0),
        totalTax: Number(orderAgg._sum.taxAmount ?? 0),
      },
      returns: {
        count: returnAgg._count.id,
        total: returnTotal,
      },
      netRevenue,
      paymentBreakdown: paymentAgg,
    };
  }

  // ─── PROFIT ESTIMATE ─────────────────────────────────────────

  async getProfitEstimate(tenantId: string, from: Date, to: Date) {
    // Revenue from orders
    const revenueAgg = await this.prisma.order.aggregate({
      where: {
        tenantId,
        createdAt: { gte: from, lt: to },
        status: { not: 'VOIDED' },
      },
      _sum: { total: true },
    });

    // COGS: sum of (quantity * cost_price) per order_item
    const cogsRows = await this.prisma.$queryRaw<{ cogs: number }[]>`
      SELECT SUM(oi.quantity * oi.cost_price)::float AS cogs
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.tenant_id = ${tenantId}
        AND o.created_at >= ${from}
        AND o.created_at <  ${to}
        AND o.status::text != 'VOIDED'
    `;

    // Returns
    const returnAgg = await this.prisma.return.aggregate({
      where: {
        tenantId,
        createdAt: { gte: from, lt: to },
        status: 'APPROVED',
      },
      _sum: { total: true },
    });

    const revenue = Number(revenueAgg._sum.total ?? 0);
    const cogs = Number(cogsRows[0]?.cogs ?? 0);
    const returns = Number(returnAgg._sum.total ?? 0);
    const grossProfit = revenue - cogs - returns;

    return {
      period: { from, to },
      revenue,
      cogs,
      returns,
      grossProfit,
      grossMarginPct: revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(2) : '0.00',
    };
  }

  // ─── Z-REPORT (T-083) ─────────────────────────────────────────
  // POST /reports/z-report — kunlik yakuniy fiskal hisobot (IMMUTABLE)

  async createZReport(tenantId: string, userId: string, date?: string) {
    // Qaysi sana uchun Z-report?
    const reportDate = date ? new Date(date) : new Date();
    const dayStart = new Date(reportDate.getFullYear(), reportDate.getMonth(), reportDate.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    // Duplicate check: bu kun uchun allaqachon bor?
    const existing = await this.prisma.zReport.findUnique({
      where: { tenantId_date: { tenantId, date: dayStart } },
    });
    if (existing) {
      throw new ConflictException(
        `${dayStart.toISOString().slice(0, 10)} kuni uchun Z-report allaqachon mavjud (seq #${existing.sequenceNumber})`,
      );
    }

    // ─── Aggregate: Orders ───────────────────────────────────────
    const orderAgg = await this.prisma.order.aggregate({
      where: {
        tenantId,
        createdAt: { gte: dayStart, lt: dayEnd },
        status: { not: 'VOIDED' },
      },
      _sum: { total: true, taxAmount: true },
      _count: { id: true },
    });

    // ─── Aggregate: Returns ──────────────────────────────────────
    const returnAgg = await this.prisma.return.aggregate({
      where: {
        tenantId,
        createdAt: { gte: dayStart, lt: dayEnd },
        status: 'APPROVED',
      },
      _sum: { total: true },
    });

    // ─── Payment breakdown ───────────────────────────────────────
    type PaymentRow = { method: string; amount: number };
    const paymentRows = await this.prisma.$queryRaw<PaymentRow[]>`
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
    `;

    const paymentMap: Record<string, number> = {};
    for (const row of paymentRows) {
      paymentMap[row.method] = row.amount;
    }

    // ─── Fiscal count ────────────────────────────────────────────
    const fiscalCount = await this.prisma.order.count({
      where: {
        tenantId,
        createdAt: { gte: dayStart, lt: dayEnd },
        fiscalStatus: 'SENT',
      },
    });

    // ─── Shift IDs (closed today) ─────────────────────────────────
    const closedShifts = await this.prisma.shift.findMany({
      where: {
        tenantId,
        status: 'CLOSED',
        closedAt: { gte: dayStart, lt: dayEnd },
      },
      select: { id: true },
    });

    // ─── Sequence number (per tenant, auto-increment) ─────────────
    const maxSeq = await this.prisma.zReport.findFirst({
      where: { tenantId },
      orderBy: { sequenceNumber: 'desc' },
      select: { sequenceNumber: true },
    });
    const sequenceNumber = (maxSeq?.sequenceNumber ?? 0) + 1;

    // ─── Create IMMUTABLE Z-report ────────────────────────────────
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

    return zReport;
  }

  // ─── GET Z-REPORT LIST ─────────────────────────────────────────

  async getZReports(tenantId: string, limit = 30) {
    return this.prisma.zReport.findMany({
      where: { tenantId },
      orderBy: { sequenceNumber: 'desc' },
      take: limit,
    });
  }

  // ─── SHIFT REPORT ─────────────────────────────────────────────

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

  // ─── T-070: EMPLOYEE ACTIVITY MONITOR ─────────────────────────

  async getEmployeeActivity(
    tenantId: string,
    from: Date,
    to: Date,
    userId?: string,
  ) {
    // Per-cashier aggregates
    const rows = await this.prisma.$queryRaw<
      {
        userId: string;
        firstName: string;
        lastName: string;
        completedOrders: number;
        voidedOrders: number;
        approvedReturns: number;
        totalRevenue: number;
        totalDiscount: number;
        avgTransaction: number;
        totalRefundAmount: number;
      }[]
    >`
      SELECT
        u.id                                  AS "userId",
        u.first_name                          AS "firstName",
        u.last_name                           AS "lastName",
        COUNT(CASE WHEN o.status::text = 'COMPLETED' THEN 1 END)::int  AS "completedOrders",
        COUNT(CASE WHEN o.status::text = 'VOIDED'    THEN 1 END)::int  AS "voidedOrders",
        COUNT(DISTINCT r.id)::int                                       AS "approvedReturns",
        COALESCE(SUM(CASE WHEN o.status::text = 'COMPLETED' THEN o.total END), 0)::float AS "totalRevenue",
        COALESCE(SUM(CASE WHEN o.status::text = 'COMPLETED' THEN o.discount_amount END), 0)::float AS "totalDiscount",
        COALESCE(AVG(CASE WHEN o.status::text = 'COMPLETED' THEN o.total END), 0)::float AS "avgTransaction",
        COALESCE(SUM(CASE WHEN r.status::text = 'APPROVED' THEN r.total END), 0)::float AS "totalRefundAmount"
      FROM users u
      LEFT JOIN orders o
        ON o.user_id = u.id
        AND o.tenant_id = ${tenantId}
        AND o.created_at >= ${from}
        AND o.created_at <  ${to}
      LEFT JOIN returns r
        ON r.user_id = u.id
        AND r.tenant_id = ${tenantId}
        AND r.created_at >= ${from}
        AND r.created_at <  ${to}
      WHERE u.tenant_id = ${tenantId}
        AND u."isActive" = true
        ${userId ? Prisma.sql`AND u.id = ${userId}` : Prisma.empty}
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY "completedOrders" DESC
    `;

    // Shubhali faoliyatni aniqlash
    const flagged: string[] = [];

    const result = rows.map((row) => {
      const suspicious: string[] = [];
      const revenue = row.totalRevenue || 1; // division by zero himoya

      // 1. Discount ratio
      if (row.totalDiscount / revenue > FRAUD_THRESHOLDS.DISCOUNT_RATIO) {
        suspicious.push(
          `Chegirma nisbati yuqori: ${((row.totalDiscount / revenue) * 100).toFixed(1)}%`,
        );
      }

      // 2. Refund ratio
      if (row.totalRefundAmount / revenue > FRAUD_THRESHOLDS.REFUND_RATIO) {
        suspicious.push(
          `Qaytarish nisbati yuqori: ${((row.totalRefundAmount / revenue) * 100).toFixed(1)}%`,
        );
      }

      // 3. Void ratio — 3+ void bolsa flag
      if (row.voidedOrders >= FRAUD_THRESHOLDS.VOID_PER_HOUR) {
        suspicious.push(`Ko'p void: ${row.voidedOrders} ta`);
      }

      if (suspicious.length > 0) {
        flagged.push(`${row.firstName} ${row.lastName}: ${suspicious.join(', ')}`);
      }

      return {
        ...row,
        discountRatio: revenue > 0 ? +(row.totalDiscount / revenue).toFixed(4) : 0,
        refundRatio: revenue > 0 ? +(row.totalRefundAmount / revenue).toFixed(4) : 0,
        suspicious,
        isFlagged: suspicious.length > 0,
      };
    });

    // Alert trigger: shubhali xodim topilsa → event emit
    if (flagged.length > 0) {
      this.emitter.emit('fraud.detected', { tenantId, from, to, flagged });
      this.logger.warn(`[T-070] Suspicious activity detected`, { tenantId, flagged });
    }

    return {
      from: from.toISOString(),
      to: to.toISOString(),
      employees: result,
      flaggedCount: result.filter((r) => r.isFlagged).length,
      thresholds: FRAUD_THRESHOLDS,
    };
  }

  // Soatlik void monitoring (cron yoki manual chaqirish uchun)
  async checkHourlyVoids(tenantId: string) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const rows = await this.prisma.$queryRaw<
      { userId: string; firstName: string; lastName: string; voidCount: number }[]
    >`
      SELECT
        u.id         AS "userId",
        u.first_name AS "firstName",
        u.last_name  AS "lastName",
        COUNT(o.id)::int AS "voidCount"
      FROM orders o
      JOIN users u ON u.id = o.user_id
      WHERE o.tenant_id = ${tenantId}
        AND o.status::text = 'VOIDED'
        AND o.created_at >= ${oneHourAgo}
      GROUP BY u.id, u.first_name, u.last_name
      HAVING COUNT(o.id) >= ${FRAUD_THRESHOLDS.VOID_PER_HOUR}
    `;

    if (rows.length > 0) {
      this.emitter.emit('fraud.detected', {
        tenantId,
        type: 'HOURLY_VOID',
        flagged: rows.map((r) => `${r.firstName} ${r.lastName}: ${r.voidCount} void/soat`),
      });
    }

    return rows;
  }
}
