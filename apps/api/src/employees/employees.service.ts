import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotifyService } from '../notifications/notify.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { EmployeesHelper } from './employees.helper';
import { EmployeesActivityHelper } from './employees-activity.helper';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notify: NotifyService,
    private readonly helper: EmployeesHelper,
    private readonly activityHelper: EmployeesActivityHelper,
  ) {}

  // ─── LIST ─────────────────────────────────────────────────────
  async getAll(tenantId: string, branchId?: string) {
    const users = await this.prisma.user.findMany({
      where: {
        tenantId,
        ...(branchId ? { branchId } : {}),
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

    return users.map((u) => this.helper.toEmployee(u));
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
    return this.helper.toEmployee(user);
  }

  // ─── CREATE ───────────────────────────────────────────────────
  // T-329: invite token (7d TTL) avtomatik yaratiladi
  async create(
    tenantId: string,
    dto: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role?: string;
      phone?: string;
    },
  ) {
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

    const { inviteLink } = await this.notify.createInviteTokenForUser(
      user.id,
      tenantId,
    );
    return { ...this.helper.toEmployee(user), inviteLink };
  }

  // ─── UPDATE STATUS ────────────────────────────────────────────
  // T-144: fired status qo'shildi | T-146: fired → sessiyalar o'chiriladi
  async updateStatus(
    tenantId: string,
    id: string,
    status: 'active' | 'inactive' | 'fired',
  ) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('Employee not found');

    const isActive = status === 'active';

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive },
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

    return this.helper.toEmployee(updated);
  }

  // ─── UPDATE POS ACCESS ────────────────────────────────────────
  // T-146: POS access olinganda → sessiyalar o'chiriladi
  async updatePosAccess(
    tenantId: string,
    id: string,
    hasPosAccess: boolean,
  ) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('Employee not found');

    const newRole = hasPosAccess ? 'CASHIER' : 'VIEWER';
    const updated = await this.prisma.user.update({
      where: { id },
      data: { role: newRole as UserRole },
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

    return this.helper.toEmployee(updated);
  }

  // ─── DELETE (soft) ────────────────────────────────────────────
  async delete(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('Employee not found');
    await this.prisma.user.update({ where: { id }, data: { isActive: false } });
  }

  // ─── TRANSFER ─────────────────────────────────────────────────
  async transferEmployee(
    tenantId: string,
    employeeId: string,
    newBranchId: string,
  ) {
    const employee = await this.prisma.user.findFirst({
      where: { id: employeeId, tenantId },
    });
    if (!employee) throw new NotFoundException('Xodim topilmadi');

    const branch = await this.prisma.branch.findFirst({
      where: { id: newBranchId, tenantId },
    });
    if (!branch) throw new NotFoundException('Filial topilmadi');

    const updated = await this.prisma.user.update({
      where: { id: employeeId },
      data: { branchId: newBranchId },
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

    this.logger.log(
      `Employee ${employeeId} transferred to branch ${newBranchId}`,
      { tenantId },
    );
    return this.helper.toEmployee(updated);
  }

  // ─── PERFORMANCE (TEAM) ───────────────────────────────────────
  getPerformance(
    tenantId: string,
    opts: {
      branchId?: string;
      fromDate?: string;
      toDate?: string;
      period?: string;
    },
  ) {
    return this.helper.getPerformance(tenantId, opts);
  }

  // ─── PERFORMANCE (SINGLE EMPLOYEE) ───────────────────────────
  getEmployeePerformance(
    tenantId: string,
    id: string,
    opts: { fromDate?: string; toDate?: string },
  ) {
    return this.helper.getEmployeePerformance(tenantId, id, opts);
  }

  // ─── SUSPICIOUS ACTIVITY (TEAM) ───────────────────────────────
  getSuspiciousActivity(
    tenantId: string,
    opts: {
      branchId?: string;
      fromDate?: string;
      toDate?: string;
      severity?: string;
    },
  ) {
    return this.activityHelper.getSuspiciousActivity(tenantId, opts);
  }

  // ─── SUSPICIOUS ACTIVITY (SINGLE EMPLOYEE) ────────────────────
  getEmployeeSuspiciousActivity(tenantId: string, id: string, limit = 20) {
    return this.activityHelper.getEmployeeSuspiciousActivity(tenantId, id, limit);
  }
}
