import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeesActivityHelper {
  constructor(private readonly prisma: PrismaService) {}

  // ─── SUSPICIOUS ACTIVITY (TEAM) ───────────────────────────────
  async getSuspiciousActivity(
    tenantId: string,
    opts: {
      branchId?: string;
      fromDate?: string;
      toDate?: string;
      severity?: string;
    },
  ) {
    const from = opts.fromDate
      ? new Date(opts.fromDate)
      : (() => {
          const d = new Date();
          d.setDate(d.getDate() - 7);
          return d;
        })();
    const to = opts.toDate ? new Date(opts.toDate) : new Date();
    const dayCount = Math.round(
      (to.getTime() - from.getTime()) / 86400000,
    );

    const returnGroups = await this.prisma.return.groupBy({
      by: ['userId'],
      where: { tenantId, createdAt: { gte: from, lte: to } },
      _count: { id: true },
    });

    const suspicious = returnGroups.filter((r) => r._count.id >= 3);
    if (suspicious.length === 0) return [];

    const userIds = suspicious
      .map((r) => r.userId)
      .filter((id): id is string => id !== null);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds }, tenantId },
      select: { id: true, firstName: true, lastName: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const alerts = suspicious
      .filter(
        (r) => r.userId !== null && userMap.has(r.userId as string),
      )
      .map((r) => {
        const user = userMap.get(r.userId as string)!;
        const count = r._count.id;
        return {
          id: `${r.userId}-rapid-refunds`,
          employeeId: r.userId as string,
          employeeName: `${user.firstName} ${user.lastName}`,
          type: 'RAPID_REFUNDS',
          description: `${count} ta qaytarish ${dayCount} kun ichida`,
          occurredAt: to,
          severity: count >= 5 ? 'high' : 'medium',
        };
      });

    if (opts.severity) {
      return alerts.filter((a) => a.severity === opts.severity);
    }
    return alerts;
  }

  // ─── SUSPICIOUS ACTIVITY (SINGLE EMPLOYEE) ────────────────────
  async getEmployeeSuspiciousActivity(
    tenantId: string,
    id: string,
    limit = 20,
  ) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('Employee not found');

    const from = new Date();
    from.setDate(from.getDate() - 30);
    const safeLimit = Math.min(Math.max(limit, 1), 100);

    const avgRows = await this.prisma.$queryRaw<{ avg: number }[]>`
      SELECT COALESCE(AVG(total), 0)::float AS avg
      FROM orders
      WHERE tenant_id = ${tenantId} AND status::text = 'COMPLETED'
    `;
    const avgOrderValue = Number(avgRows[0]?.avg ?? 0);
    const refundThreshold = avgOrderValue * 3;

    const [largeRefunds, highDiscountOrders, voidedOrders] = await Promise.all(
      [
        this.prisma.return.findMany({
          where: {
            tenantId,
            userId: id,
            createdAt: { gte: from },
            ...(refundThreshold > 0 && { total: { gt: refundThreshold } }),
          },
          select: { id: true, total: true, orderId: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: safeLimit,
        }),
        this.prisma.$queryRaw<
          {
            id: string;
            total: number;
            discountAmount: number;
            createdAt: Date;
          }[]
        >`
          SELECT id, total::float, discount_amount::float AS "discountAmount", created_at AS "createdAt"
          FROM orders
          WHERE tenant_id  = ${tenantId}
            AND user_id    = ${id}
            AND status::text = 'COMPLETED'
            AND created_at >= ${from}
            AND total > 0
            AND discount_amount > 0
            AND discount_amount::float / (total::float + discount_amount::float) > 0.30
          ORDER BY created_at DESC
          LIMIT ${safeLimit}
        `,
        this.prisma.order.findMany({
          where: {
            tenantId,
            userId: id,
            status: 'VOIDED',
            createdAt: { gte: from },
          },
          select: { id: true, total: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: safeLimit,
        }),
      ],
    );

    const activities = [
      ...largeRefunds.map((r) => ({
        id: r.id,
        type: 'LARGE_REFUND' as const,
        description: `Katta qaytarish: ${Number(r.total).toLocaleString()} so'm (o'rtachadan 3× ko'p)`,
        orderId: r.orderId ?? undefined,
        amount: Number(r.total),
        createdAt: r.createdAt,
      })),
      ...highDiscountOrders.map((o) => ({
        id: o.id,
        type: 'HIGH_DISCOUNT' as const,
        description: `Katta chegirma: ${Number(o.discountAmount).toLocaleString()} so'm (>30%)`,
        orderId: o.id,
        amount: Number(o.discountAmount),
        createdAt: o.createdAt,
      })),
      ...voidedOrders.map((o) => ({
        id: o.id,
        type: 'VOID' as const,
        description: `Bekor qilingan buyurtma: ${Number(o.total).toLocaleString()} so'm`,
        orderId: o.id,
        amount: Number(o.total),
        createdAt: o.createdAt,
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, safeLimit);

    return { activities };
  }
}
