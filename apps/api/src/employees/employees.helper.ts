import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EmployeesHelper {
  constructor(private readonly prisma: PrismaService) {}

  // ─── DATE RANGE RESOLVER ──────────────────────────────────────
  resolveDateRange(
    fromDate?: string,
    toDate?: string,
    period?: string,
  ): { from: Date; to: Date } {
    if (fromDate || toDate) {
      const from = fromDate
        ? new Date(fromDate)
        : (() => {
            const d = new Date();
            d.setDate(d.getDate() - 30);
            return d;
          })();
      const to = toDate ? new Date(toDate) : new Date();
      return { from, to };
    }
    const now = new Date();
    switch (period) {
      case 'today': {
        const from = new Date(now);
        from.setHours(0, 0, 0, 0);
        return { from, to: now };
      }
      case 'week': {
        const from = new Date(now);
        from.setDate(now.getDate() - 6);
        from.setHours(0, 0, 0, 0);
        return { from, to: now };
      }
      case 'month': {
        const from = new Date(now);
        from.setDate(1);
        from.setHours(0, 0, 0, 0);
        return { from, to: now };
      }
      default: {
        const from = new Date(now);
        from.setDate(now.getDate() - 30);
        return { from, to: now };
      }
    }
  }

  // ─── EMPLOYEE MAPPER ──────────────────────────────────────────
  toEmployee(u: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
    botSettings: unknown;
  }) {
    const settings = (u.botSettings as Record<string, unknown>) ?? {};
    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      fullName: `${u.firstName} ${u.lastName}`,
      phone: (settings['phone'] as string) ?? null,
      email: u.email,
      dateOfBirth: null,
      passportId: null,
      address: null,
      hireDate: u.createdAt.toISOString().split('T')[0],
      role: u.role.toLowerCase(),
      branchId: null,
      branchName: null,
      status: u.isActive ? 'active' : 'inactive',
      login: u.email,
      photoUrl: null,
      hasPosAccess: ['CASHIER', 'MANAGER', 'OWNER'].includes(u.role),
      hasAdminAccess: ['OWNER', 'MANAGER'].includes(u.role),
      hasReportsAccess: ['OWNER', 'MANAGER'].includes(u.role),
      emergencyContactName: null,
      emergencyContactPhone: null,
    };
  }

  // ─── TEAM PERFORMANCE ─────────────────────────────────────────
  async getPerformance(
    tenantId: string,
    opts: {
      branchId?: string;
      fromDate?: string;
      toDate?: string;
      period?: string;
    },
  ) {
    const { from, to } = this.resolveDateRange(
      opts.fromDate,
      opts.toDate,
      opts.period,
    );
    const branchFilter = opts.branchId
      ? Prisma.sql`AND o.branch_id = ${opts.branchId}`
      : Prisma.empty;

    const rows = await this.prisma.$queryRaw<{
      employeeId: string;
      firstName: string;
      lastName: string;
      role: string;
      branchName: string | null;
      totalOrders: number;
      totalRevenue: number;
      totalDiscountOrders: number;
      totalRefunds: number;
      totalRefundAmount: number;
      totalVoids: number;
    }[]>`
      SELECT
        u.id                                                                              AS "employeeId",
        u.first_name                                                                      AS "firstName",
        u.last_name                                                                       AS "lastName",
        u.role::text                                                                      AS "role",
        MAX(b.name)                                                                       AS "branchName",
        COUNT(DISTINCT CASE WHEN o.status::text = 'COMPLETED' THEN o.id END)::int        AS "totalOrders",
        COALESCE(SUM(CASE WHEN o.status::text = 'COMPLETED' THEN o.total END), 0)::float AS "totalRevenue",
        COUNT(DISTINCT CASE WHEN o.status::text = 'COMPLETED'
                             AND o.discount_amount > 0 THEN o.id END)::int               AS "totalDiscountOrders",
        COUNT(DISTINCT r.id)::int                                                         AS "totalRefunds",
        COALESCE(SUM(r.total), 0)::float                                                  AS "totalRefundAmount",
        COUNT(DISTINCT CASE WHEN o.status::text = 'VOIDED' THEN o.id END)::int           AS "totalVoids"
      FROM users u
      LEFT JOIN orders o
        ON o.user_id    = u.id
       AND o.tenant_id  = ${tenantId}
       AND o.created_at >= ${from}
       AND o.created_at <  ${to}
       ${branchFilter}
      LEFT JOIN branches b ON b.id = o.branch_id
      LEFT JOIN returns r
        ON r.user_id    = u.id
       AND r.tenant_id  = ${tenantId}
       AND r.created_at >= ${from}
       AND r.created_at <  ${to}
      WHERE u.tenant_id  = ${tenantId}
        AND u."isActive" = true
      GROUP BY u.id, u.first_name, u.last_name, u.role
      ORDER BY "totalOrders" DESC
    `;

    const employees = rows.map((row) => {
      const revenue = row.totalRevenue || 1;
      const refundRatio = row.totalRefundAmount / revenue;
      const discountRatio =
        row.totalDiscountOrders / Math.max(row.totalOrders, 1);
      let suspiciousActivityCount = 0;
      if (refundRatio > 0.2) suspiciousActivityCount++;
      if (discountRatio > 0.3) suspiciousActivityCount++;
      if (row.totalVoids >= 3) suspiciousActivityCount++;

      return {
        employeeId: row.employeeId,
        employeeName: `${row.firstName} ${row.lastName}`,
        role: row.role.toLowerCase(),
        branchName: row.branchName ?? null,
        totalOrders: row.totalOrders,
        totalRevenue: row.totalRevenue,
        totalRefunds: row.totalRefunds,
        refundRate:
          row.totalOrders > 0
            ? parseFloat(
                (row.totalRefunds / row.totalOrders * 100).toFixed(1),
              )
            : 0,
        totalVoids: row.totalVoids,
        suspiciousActivityCount,
      };
    });

    return { employees };
  }

  // ─── SINGLE EMPLOYEE PERFORMANCE ──────────────────────────────
  async getEmployeePerformance(
    tenantId: string,
    id: string,
    opts: { fromDate?: string; toDate?: string },
  ) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('Employee not found');

    const from = opts.fromDate
      ? new Date(opts.fromDate)
      : (() => {
          const d = new Date();
          d.setDate(d.getDate() - 30);
          return d;
        })();
    const to = opts.toDate ? new Date(opts.toDate) : new Date();

    const [orders, returns] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          tenantId,
          userId: id,
          status: 'COMPLETED',
          createdAt: { gte: from, lte: to },
        },
        select: { total: true, discountAmount: true },
      }),
      this.prisma.return.findMany({
        where: { tenantId, userId: id, createdAt: { gte: from, lte: to } },
        select: { id: true },
      }),
    ]);

    const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
    const totalOrders = orders.length;
    const totalDiscounts = orders.filter(
      (o) => Number(o.discountAmount) > 0,
    ).length;

    return {
      employeeId: id,
      employeeName: `${user.firstName} ${user.lastName}`,
      role: user.role.toLowerCase(),
      branchName: null,
      totalOrders,
      totalRevenue,
      avgOrderValue:
        totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      totalRefunds: returns.length,
      refundRate:
        totalOrders > 0
          ? parseFloat((returns.length / totalOrders * 100).toFixed(1))
          : 0,
      totalVoids: 0,
      totalDiscounts,
      discountRate:
        totalOrders > 0
          ? parseFloat((totalDiscounts / totalOrders * 100).toFixed(1))
          : 0,
      suspiciousActivityCount: 0,
      alerts: [],
    };
  }

}
