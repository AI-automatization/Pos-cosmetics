import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';

// T-070: Shubhali faoliyat chegaralari
const FRAUD_THRESHOLDS = {
  VOID_PER_HOUR: 3,
  REFUND_RATIO: 0.20,
  DISCOUNT_RATIO: 0.15,
} as const;

@Injectable()
export class EmployeeActivityService {
  private readonly logger = new Logger(EmployeeActivityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emitter: EventEmitter2,
  ) {}

  async getEmployeeActivity(tenantId: string, from: Date, to: Date, userId?: string) {
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

    const flagged: string[] = [];

    const result = rows.map((row) => {
      const suspicious: string[] = [];
      const revenue = row.totalRevenue || 1;

      if (row.totalDiscount / revenue > FRAUD_THRESHOLDS.DISCOUNT_RATIO) {
        suspicious.push(`Chegirma nisbati yuqori: ${((row.totalDiscount / revenue) * 100).toFixed(1)}%`);
      }
      if (row.totalRefundAmount / revenue > FRAUD_THRESHOLDS.REFUND_RATIO) {
        suspicious.push(`Qaytarish nisbati yuqori: ${((row.totalRefundAmount / revenue) * 100).toFixed(1)}%`);
      }
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
