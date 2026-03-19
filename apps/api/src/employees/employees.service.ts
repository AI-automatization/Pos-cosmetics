import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── LIST ─────────────────────────────────────────────────────
  async getAll(tenantId: string, branchId?: string) {
    const users = await this.prisma.user.findMany({
      where: {
        tenantId,
        ...(branchId ? {} : {}), // branch filter via shifts (users aren't directly linked to branch)
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        botSettings: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => this.toEmployee(u));
  }

  // ─── GET ONE ──────────────────────────────────────────────────
  async getById(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        botSettings: true,
      },
    });
    if (!user) throw new NotFoundException('Employee not found');
    return this.toEmployee(user);
  }

  // ─── CREATE ───────────────────────────────────────────────────
  async create(tenantId: string, dto: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
  }) {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        tenantId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        passwordHash,
        role: (dto.role as UserRole) ?? UserRole.CASHIER,
      },
      select: {
        id: true, firstName: true, lastName: true, email: true,
        role: true, isActive: true, createdAt: true, botSettings: true,
      },
    });
    return this.toEmployee(user);
  }

  // ─── UPDATE STATUS ────────────────────────────────────────────
  // T-144: fired status qo'shildi | T-146: fired → sessiyalar o'chiriladi
  async updateStatus(tenantId: string, id: string, status: 'active' | 'inactive' | 'fired') {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('Employee not found');

    const isActive = status === 'active';

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true, firstName: true, lastName: true, email: true,
        role: true, isActive: true, createdAt: true, botSettings: true,
      },
    });

    // T-146: fired yoki inactive → barcha sessiyalar va refresh token ni o'chirish
    if (status === 'fired' || status === 'inactive') {
      await Promise.all([
        this.prisma.session.deleteMany({ where: { userId: id, tenantId } }),
        this.prisma.user.update({
          where: { id },
          data: { refreshToken: null, refreshTokenExp: null },
        }),
      ]);
    }

    return this.toEmployee(updated);
  }

  // ─── UPDATE POS ACCESS ────────────────────────────────────────
  // T-146: POS access olinganda → sessiyalar o'chiriladi
  async updatePosAccess(tenantId: string, id: string, hasPosAccess: boolean) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('Employee not found');

    // POS access → role CASHIER (with access) or VIEWER (without)
    const newRole = hasPosAccess ? 'CASHIER' : 'VIEWER';
    const updated = await this.prisma.user.update({
      where: { id },
      data: { role: newRole as UserRole },
      select: {
        id: true, firstName: true, lastName: true, email: true,
        role: true, isActive: true, createdAt: true, botSettings: true,
      },
    });

    // T-146: POS access olinganda kassir darhol chiqarilishi kerak
    if (!hasPosAccess) {
      await Promise.all([
        this.prisma.session.deleteMany({ where: { userId: id, tenantId } }),
        this.prisma.user.update({
          where: { id },
          data: { refreshToken: null, refreshTokenExp: null },
        }),
      ]);
    }

    return this.toEmployee(updated);
  }

  // ─── DELETE (soft) ────────────────────────────────────────────
  async delete(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('Employee not found');
    await this.prisma.user.update({ where: { id }, data: { isActive: false } });
  }

  // ─── PERFORMANCE ──────────────────────────────────────────────
  async getPerformance(tenantId: string, opts: {
    branchId?: string;
    fromDate?: string;
    toDate?: string;
    period?: string;
  }) {
    const from = opts.fromDate
      ? new Date(opts.fromDate)
      : (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d; })();
    const to = opts.toDate ? new Date(opts.toDate) : new Date();

    const users = await this.prisma.user.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, firstName: true, lastName: true, role: true },
    });

    const results = await Promise.all(
      users.map(async (user) => {
        const orders = await this.prisma.order.findMany({
          where: {
            tenantId,
            userId: user.id,
            status: 'COMPLETED',
            createdAt: { gte: from, lte: to },
          },
          select: { total: true, discountAmount: true, id: true },
        });

        const returns = await this.prisma.return.findMany({
          where: { tenantId, userId: user.id, createdAt: { gte: from, lte: to } },
          select: { id: true },
        });

        const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
        const totalOrders = orders.length;
        const totalDiscounts = orders.filter((o) => Number(o.discountAmount) > 0).length;

        return {
          employeeId: user.id,
          employeeName: `${user.firstName} ${user.lastName}`,
          role: user.role.toLowerCase(),
          branchName: null,
          totalOrders,
          totalRevenue,
          avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
          totalRefunds: returns.length,
          refundRate: totalOrders > 0 ? parseFloat((returns.length / totalOrders * 100).toFixed(1)) : 0,
          totalVoids: 0,
          totalDiscounts,
          discountRate: totalOrders > 0 ? parseFloat((totalDiscounts / totalOrders * 100).toFixed(1)) : 0,
          suspiciousActivityCount: 0,
          alerts: [],
        };
      }),
    );

    return results;
  }

  // ─── EMPLOYEE PERFORMANCE ─────────────────────────────────────
  async getEmployeePerformance(tenantId: string, id: string, opts: {
    fromDate?: string;
    toDate?: string;
  }) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('Employee not found');

    const from = opts.fromDate
      ? new Date(opts.fromDate)
      : (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d; })();
    const to = opts.toDate ? new Date(opts.toDate) : new Date();

    const [orders, returns] = await Promise.all([
      this.prisma.order.findMany({
        where: { tenantId, userId: id, status: 'COMPLETED', createdAt: { gte: from, lte: to } },
        select: { total: true, discountAmount: true },
      }),
      this.prisma.return.findMany({
        where: { tenantId, userId: id, createdAt: { gte: from, lte: to } },
        select: { id: true },
      }),
    ]);

    const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
    const totalOrders = orders.length;
    const totalDiscounts = orders.filter((o) => Number(o.discountAmount) > 0).length;

    return {
      employeeId: id,
      employeeName: `${user.firstName} ${user.lastName}`,
      role: user.role.toLowerCase(),
      branchName: null,
      totalOrders,
      totalRevenue,
      avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      totalRefunds: returns.length,
      refundRate: totalOrders > 0 ? parseFloat((returns.length / totalOrders * 100).toFixed(1)) : 0,
      totalVoids: 0,
      totalDiscounts,
      discountRate: totalOrders > 0 ? parseFloat((totalDiscounts / totalOrders * 100).toFixed(1)) : 0,
      suspiciousActivityCount: 0,
      alerts: [],
    };
  }

  // ─── SUSPICIOUS ACTIVITY ──────────────────────────────────────
  async getSuspiciousActivity(tenantId: string, opts: {
    branchId?: string;
    fromDate?: string;
    toDate?: string;
    severity?: string;
  }) {
    const from = opts.fromDate
      ? new Date(opts.fromDate)
      : (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d; })();
    const to = opts.toDate ? new Date(opts.toDate) : new Date();

    // Find users with excessive returns (>3 in period)
    const users = await this.prisma.user.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, firstName: true, lastName: true },
    });

    const alerts: {
      id: string;
      employeeId: string;
      employeeName: string;
      type: string;
      description: string;
      occurredAt: Date;
      severity: string;
    }[] = [];

    for (const user of users) {
      const returns = await this.prisma.return.count({
        where: { tenantId, userId: user.id, createdAt: { gte: from, lte: to } },
      });

      if (returns >= 3) {
        alerts.push({
          id: `${user.id}-rapid-refunds`,
          employeeId: user.id,
          employeeName: `${user.firstName} ${user.lastName}`,
          type: 'RAPID_REFUNDS',
          description: `${returns} ta qaytarish ${Math.round((to.getTime() - from.getTime()) / 86400000)} kun ichida`,
          occurredAt: to,
          severity: returns >= 5 ? 'high' : 'medium',
        });
      }
    }

    if (opts.severity) {
      return alerts.filter((a) => a.severity === opts.severity);
    }
    return alerts;
  }

  async getEmployeeSuspiciousActivity(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('Employee not found');

    const from = new Date(); from.setDate(from.getDate() - 30);
    const returns = await this.prisma.return.count({
      where: { tenantId, userId: id, createdAt: { gte: from } },
    });

    if (returns < 3) return [];

    return [{
      id: `${id}-rapid-refunds`,
      type: 'RAPID_REFUNDS',
      description: `${returns} ta qaytarish 30 kun ichida`,
      occurredAt: new Date(),
      severity: returns >= 5 ? 'high' : 'medium',
    }];
  }

  // ─── HELPER ───────────────────────────────────────────────────
  private toEmployee(u: {
    id: string; firstName: string; lastName: string;
    email: string; role: string; isActive: boolean;
    createdAt: Date; botSettings: unknown;
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
}
