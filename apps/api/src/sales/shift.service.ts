import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OpenShiftDto, CloseShiftDto } from './dto';
import { ShiftStatus, ReturnStatus } from '@prisma/client';

@Injectable()
export class ShiftService {
  private readonly logger = new Logger(ShiftService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async openShift(tenantId: string, userId: string, dto: OpenShiftDto) {
    const existing = await this.prisma.shift.findFirst({
      where: { tenantId, userId, status: ShiftStatus.OPEN },
    });
    if (existing) {
      throw new BadRequestException(`User already has an open shift: ${existing.id}`);
    }

    const shift = await this.prisma.shift.create({
      data: {
        tenantId,
        userId,
        branchId: dto.branchId,
        openingCash: dto.openingCash,
        notes: dto.notes,
        status: ShiftStatus.OPEN,
      },
    });

    this.logger.log(`Shift opened: ${shift.id}`, { tenantId, userId });
    return shift;
  }

  async closeShift(tenantId: string, userId: string, shiftId: string, dto: CloseShiftDto) {
    const shift = await this.prisma.shift.findFirst({
      where: { id: shiftId, tenantId, status: ShiftStatus.OPEN },
    });
    if (!shift) throw new NotFoundException(`Open shift ${shiftId} not found`);

    const cashSales = await this.prisma.paymentIntent.aggregate({
      where: { tenantId, order: { shiftId }, method: 'CASH', status: 'SETTLED' },
      _sum: { amount: true },
    });
    const expectedCash = Number(shift.openingCash) + Number(cashSales._sum.amount ?? 0);

    const updated = await this.prisma.shift.update({
      where: { id: shiftId },
      data: {
        status: ShiftStatus.CLOSED,
        closedAt: new Date(),
        closingCash: dto.closingCash,
        expectedCash,
        notes: dto.notes ?? shift.notes,
      },
    });

    this.logger.log(`Shift closed: ${shiftId}`, { tenantId, userId });
    this.eventEmitter.emit('shift.closed', { tenantId, shiftId, userId });
    return updated;
  }

  async getShiftAvailableCash(tenantId: string, shiftId: string): Promise<{ availableCash: number; shiftId: string }> {
    const shift = await this.prisma.shift.findFirst({
      where: { id: shiftId, tenantId, status: ShiftStatus.OPEN },
      select: { openingCash: true },
    });
    if (!shift) throw new NotFoundException(`Open shift ${shiftId} not found`);

    let cashSalesAmt = 0;
    let cashReturnsAmt = 0;
    try {
      const [cashSales, cashReturns] = await Promise.all([
        this.prisma.paymentIntent.aggregate({
          where: { tenantId, order: { shiftId }, method: 'CASH', status: 'SETTLED' },
          _sum: { amount: true },
        }),
        this.prisma.return.aggregate({
          where: { tenantId, order: { shiftId }, refundMethod: 'CASH', status: ReturnStatus.APPROVED },
          _sum: { total: true },
        }),
      ]);
      cashSalesAmt = Number(cashSales._sum.amount ?? 0);
      cashReturnsAmt = Number(cashReturns._sum.total ?? 0);
    } catch (err) {
      this.logger.error('getShiftAvailableCash aggregate failed — returning openingCash only', { shiftId, err });
    }

    const availableCash = Number(shift.openingCash) + cashSalesAmt - cashReturnsAmt;
    this.logger.log(`Available cash for shift ${shiftId}: ${availableCash}`, { tenantId });
    return { availableCash, shiftId };
  }

  async getCurrentShift(tenantId: string, userId: string) {
    const shift = await this.prisma.shift.findFirst({
      where: { tenantId, userId, status: ShiftStatus.OPEN },
      include: {
        user: { select: { firstName: true, lastName: true } },
        branch: { select: { id: true, name: true } },
      },
    });

    if (!shift) return null;

    const orders = await this.prisma.order.findMany({
      where: { tenantId, shiftId: shift.id, status: 'COMPLETED' },
      include: { paymentIntents: { select: { method: true, amount: true } } },
    });

    let totalRevenue = 0;
    let naqdAmount = 0;
    let kartaAmount = 0;
    let nasiyaAmount = 0;

    for (const order of orders) {
      totalRevenue += Number(order.total);
      for (const payment of order.paymentIntents) {
        const amount = Number(payment.amount);
        if (payment.method === 'CASH') naqdAmount += amount;
        else if (payment.method === 'TERMINAL') kartaAmount += amount;
        else if (payment.method === 'DEBT') nasiyaAmount += amount;
      }
    }

    const ordersCount = orders.length;
    const avgOrderValue = ordersCount > 0 ? Math.round(totalRevenue / ordersCount) : 0;

    return {
      ...shift,
      cashierName: `${shift.user.firstName} ${shift.user.lastName}`.trim(),
      stats: {
        totalRevenue: Math.round(totalRevenue),
        ordersCount,
        avgOrderValue,
        naqdAmount: Math.round(naqdAmount),
        kartaAmount: Math.round(kartaAmount),
        nasiyaAmount: Math.round(nasiyaAmount),
      },
    };
  }

  async getActiveShifts(tenantId: string, branchId?: string) {
    return this.prisma.shift.findMany({
      where: { tenantId, status: ShiftStatus.OPEN, ...(branchId && { branchId }) },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        branch: { select: { id: true, name: true } },
      },
      orderBy: { openedAt: 'desc' },
    });
  }

  async getShifts(
    tenantId: string,
    limit = 20,
    page = 1,
    opts: { branchId?: string; status?: string; userId?: string; role?: string } = {},
  ) {
    const skip = (page - 1) * limit;
    const statusMap: Record<string, ShiftStatus> = {
      open: ShiftStatus.OPEN,
      closed: ShiftStatus.CLOSED,
    };

    const where = {
      tenantId,
      ...(opts.branchId && { branchId: opts.branchId }),
      ...(opts.status && statusMap[opts.status] && { status: statusMap[opts.status] }),
      ...(opts.role && !['OWNER', 'ADMIN'].includes(opts.role) && opts.userId
        ? { userId: opts.userId }
        : {}),
    };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.shift.count({ where }),
      this.prisma.shift.findMany({
        where,
        skip,
        take: limit,
        orderBy: { openedAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
          branch: { select: { id: true, name: true } },
          orders: {
            where: { status: 'COMPLETED' },
            select: {
              total: true,
              paymentIntents: { select: { method: true, amount: true } },
            },
          },
        },
      }),
    ]);

    const items = rows.map((s) => {
      const totalRevenue = s.orders.reduce((sum, o) => sum + Number(o.total), 0);
      const totalOrders = s.orders.length;

      const pmMap: Record<string, number> = {};
      for (const o of s.orders) {
        for (const pi of o.paymentIntents) {
          const key = pi.method.toLowerCase();
          pmMap[key] = (pmMap[key] ?? 0) + Number(pi.amount);
        }
      }
      const paymentBreakdown = {
        cash: pmMap['cash'] ?? 0,
        card: pmMap['card'] ?? pmMap['terminal'] ?? 0,
        click: pmMap['click'] ?? 0,
        payme: pmMap['payme'] ?? 0,
      };

      return {
        id: s.id,
        branchId: s.branchId,
        branchName: s.branch?.name ?? null,
        cashierId: s.userId,
        cashierName: `${s.user?.firstName ?? ''} ${s.user?.lastName ?? ''}`.trim(),
        status: s.status.toLowerCase(),
        openedAt: s.openedAt,
        closedAt: s.closedAt,
        totalRevenue,
        totalOrders,
        paymentBreakdown,
        openingCash: Number(s.openingCash),
        closingCash: s.closingCash !== null ? Number(s.closingCash) : null,
        expectedCash: s.expectedCash !== null ? Number(s.expectedCash) : null,
      };
    });

    return { items, total, page, limit };
  }

  async getShiftById(tenantId: string, shiftId: string) {
    const shift = await this.prisma.shift.findFirst({
      where: { id: shiftId, tenantId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        branch: { select: { id: true, name: true } },
        orders: {
          where: { status: 'COMPLETED' },
          include: {
            paymentIntents: { select: { method: true, amount: true } },
            returns: { select: { id: true } },
          },
        },
      },
    });

    if (!shift) throw new NotFoundException('Shift not found');

    const totalRevenue = shift.orders.reduce((s, o) => s + Number(o.total), 0);
    const totalOrders = shift.orders.length;
    const totalRefunds = shift.orders.reduce((s, o) => s + o.returns.length, 0);

    const pmMap: Record<string, number> = {};
    for (const order of shift.orders) {
      for (const pi of order.paymentIntents) {
        const m = pi.method.toLowerCase();
        pmMap[m] = (pmMap[m] ?? 0) + Number(pi.amount);
      }
    }
    const paymentBreakdown = {
      cash: pmMap['cash'] ?? 0,
      card: pmMap['card'] ?? pmMap['terminal'] ?? 0,
      click: pmMap['click'] ?? 0,
      payme: pmMap['payme'] ?? 0,
    };

    return {
      id: shift.id,
      branchId: shift.branchId,
      branchName: shift.branch?.name ?? null,
      cashierId: shift.userId,
      cashierName: `${shift.user?.firstName ?? ''} ${shift.user?.lastName ?? ''}`.trim(),
      openedAt: shift.openedAt,
      closedAt: shift.closedAt,
      status: shift.status.toLowerCase(),
      totalRevenue,
      totalOrders,
      avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      totalRefunds,
      totalVoids: 0,
      totalDiscounts: shift.orders.filter((o) => Number(o.discountAmount) > 0).length,
      paymentBreakdown,
    };
  }

  async getShiftSummary(
    tenantId: string,
    opts: { branchId?: string; fromDate?: string; toDate?: string },
  ) {
    const from = opts.fromDate
      ? new Date(opts.fromDate)
      : (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d; })();
    const to = opts.toDate ? new Date(opts.toDate) : new Date();

    const shifts = await this.prisma.shift.findMany({
      where: {
        tenantId,
        openedAt: { gte: from, lte: to },
        ...(opts.branchId ? { branchId: opts.branchId } : {}),
      },
      include: {
        orders: { where: { status: 'COMPLETED' }, select: { total: true } },
      },
    });

    const totalRevenue = shifts.reduce(
      (s, sh) => s + sh.orders.reduce((os, o) => os + Number(o.total), 0),
      0,
    );
    const totalOrders = shifts.reduce((s, sh) => s + sh.orders.length, 0);
    const totalShifts = shifts.length;

    return {
      totalRevenue,
      totalOrders,
      totalShifts,
      avgRevenuePerShift: totalShifts > 0 ? Math.round(totalRevenue / totalShifts) : 0,
    };
  }
}
