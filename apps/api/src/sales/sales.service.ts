import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  OpenShiftDto,
  CloseShiftDto,
  CreateOrderDto,
  CreateReturnDto,
  DiscountTypeEnum,
} from './dto';
import { ShiftStatus, OrderStatus, ReturnStatus, UserRole, Prisma } from '@prisma/client';

// Discount limits by role
const DISCOUNT_LIMIT: Record<string, number> = {
  [UserRole.CASHIER]: 5,
  [UserRole.MANAGER]: 15,
  [UserRole.ADMIN]: 100,
  [UserRole.OWNER]: 100,
  [UserRole.VIEWER]: 0,
};

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ─── SHIFTS ───────────────────────────────────────────────────

  async openShift(tenantId: string, userId: string, dto: OpenShiftDto) {
    // Check if user already has an open shift
    const existing = await this.prisma.shift.findFirst({
      where: { tenantId, userId, status: ShiftStatus.OPEN },
    });
    if (existing) {
      throw new BadRequestException(
        `User already has an open shift: ${existing.id}`,
      );
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
      where: { id: shiftId, tenantId, userId, status: ShiftStatus.OPEN },
    });
    if (!shift) throw new NotFoundException(`Open shift ${shiftId} not found`);

    // Calculate expected cash: opening + cash sales
    const cashSales = await this.prisma.paymentIntent.aggregate({
      where: {
        tenantId,
        order: { shiftId },
        method: 'CASH',
        status: 'SETTLED',
      },
      _sum: { amount: true },
    });
    const expectedCash =
      Number(shift.openingCash) + Number(cashSales._sum.amount ?? 0);

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

  async getCurrentShift(tenantId: string, userId: string) {
    return this.prisma.shift.findFirst({
      where: { tenantId, userId, status: ShiftStatus.OPEN },
    });
  }

  // Mobile alias: GET /sales/shifts/active
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

  // Mobile alias: GET /sales/quick-stats
  async getQuickStats(tenantId: string, branchId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where = {
      tenantId,
      status: 'COMPLETED' as const,
      createdAt: { gte: today },
      ...(branchId && { branchId }),
    };

    const [orders, topProducts] = await this.prisma.$transaction([
      this.prisma.order.findMany({ where, select: { total: true } }),
      this.prisma.orderItem.groupBy({
        by: ['productId'],
        where: { order: { ...where } },
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { total: 'desc' } },
        take: 5,
      }),
    ]);

    const ordersCount = orders.length;
    const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
    const avgBasket = ordersCount > 0 ? totalRevenue / ordersCount : 0;

    const productIds = topProducts.map((p) => p.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });

    return {
      ordersCount,
      avgBasket: Math.round(avgBasket),
      currency: 'UZS',
      topProducts: topProducts.map((p) => {
        const product = products.find((pr) => pr.id === p.productId);
        const sum = p._sum ?? {};
        return {
          productId: p.productId,
          productName: product?.name ?? 'Unknown',
          quantity: Number((sum as { quantity?: unknown }).quantity ?? 0),
          revenue: Number((sum as { total?: unknown }).total ?? 0),
        };
      }),
    };
  }

  // ─── T-205: SHIFTS (paginated, filtered) ─────────────────────
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
      // CASHIER/MANAGER see only their own shifts
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
      };
    });

    return { items, total, page, limit };
  }

  // ─── ORDERS ───────────────────────────────────────────────────

  async createOrder(tenantId: string, userId: string, dto: CreateOrderDto, userRole?: UserRole) {
    return this.prisma.$transaction(async (tx) => {
      // ─── Discount limit check (T-026) ─────────────────────
      if (dto.discountAmount && dto.discountAmount > 0 && userRole) {
        const maxPct = DISCOUNT_LIMIT[userRole] ?? 0;
        let discountPct = dto.discountAmount;

        if (dto.discountType !== DiscountTypeEnum.PERCENT) {
          // Fixed discount — compute subtotal first for % check
          const rawSubtotal = dto.items.reduce(
            (s, i) => s + Number(i.unitPrice) * Number(i.quantity),
            0,
          );
          discountPct = rawSubtotal > 0 ? (dto.discountAmount / rawSubtotal) * 100 : 0;
        }

        if (discountPct > maxPct) {
          throw new ForbiddenException(
            `${userRole} role uchun maksimal chegirma ${maxPct}% (so'ralgan: ${discountPct.toFixed(1)}%)`,
          );
        }
      }

      // Fetch products and validate
      const productIds = dto.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, tenantId, deletedAt: null },
      });

      if (products.length !== productIds.length) {
        throw new NotFoundException('One or more products not found');
      }

      const productMap = new Map(products.map((p) => [p.id, p]));

      // Build order items with snapshots
      const orderItemsData = dto.items.map((item) => {
        const product = productMap.get(item.productId)!;
        const discount = item.discountAmount ?? 0;
        const total =
          Number(item.unitPrice) * Number(item.quantity) - discount;
        return {
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          costPrice: Number(product.costPrice),
          discountAmount: discount,
          total: Math.max(0, total),
          isTaxable: product.isTaxable,
        };
      });

      const subtotal = orderItemsData.reduce(
        (s, i) => s + Number(i.unitPrice) * Number(i.quantity),
        0,
      );

      let discountAmount = dto.discountAmount ?? 0;
      if (dto.discountType === DiscountTypeEnum.PERCENT) {
        discountAmount = (subtotal * discountAmount) / 100;
      }

      const total = Math.max(0, subtotal - discountAmount);

      // T-078: QQS (НДС 12%) — tax-inclusive narxlardan soliq hisoblash
      // Formula: taxAmount = taxableTotal * 0.12 / 1.12
      const taxableTotal = orderItemsData.reduce(
        (s, i) => s + (i.isTaxable ? Math.max(0, i.total) : 0),
        0,
      );
      const taxAmount = Math.round((taxableTotal * 0.12) / 1.12);

      // Generate order number (per tenant)
      const last = await tx.order.findFirst({
        where: { tenantId },
        orderBy: { orderNumber: 'desc' },
        select: { orderNumber: true },
      });
      const orderNumber = (last?.orderNumber ?? 0) + 1;

      // Strip isTaxable from items before DB insert (not a DB column)
      const orderItemsInsert = orderItemsData.map(({ isTaxable: _t, ...rest }) => rest);

      const order = await tx.order.create({
        data: {
          tenantId,
          userId,
          shiftId: dto.shiftId,
          branchId: dto.branchId,
          customerId: dto.customerId,
          orderNumber,
          status: OrderStatus.COMPLETED,
          subtotal,
          discountAmount,
          discountType: dto.discountType ?? 'FIXED',
          taxAmount,
          total,
          notes: dto.notes,
          items: { create: orderItemsInsert },
        },
        include: {
          items: true,
          customer: { select: { id: true, name: true, phone: true } },
        },
      });

      // Emit domain event
      this.eventEmitter.emit('sale.created', {
        tenantId,
        orderId: order.id,
        userId,
        customerId: dto.customerId,
        items: orderItemsData,
        total,
      });

      this.logger.log(`Order created: #${orderNumber} (${order.id})`, {
        tenantId,
        orderId: order.id,
        total,
      });

      return order;
    });
  }

  async getOrders(
    tenantId: string,
    opts: { page?: number; limit?: number; shiftId?: string },
  ) {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      ...(opts.shiftId && { shiftId: opts.shiftId }),
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true } },
            },
          },
          customer: { select: { id: true, name: true, phone: true } },
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
    ]);
    return { items, total, page, limit };
  }

  async getOrderById(tenantId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, tenantId },
      include: {
        items: {
          include: { product: { select: { id: true, name: true } } },
        },
        customer: { select: { id: true, name: true, phone: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
        paymentIntents: true,
      },
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  // ─── RETURNS ──────────────────────────────────────────────────

  async createReturn(tenantId: string, userId: string, dto: CreateReturnDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, tenantId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException(`Order ${dto.orderId} not found`);
    if (order.status === OrderStatus.RETURNED) {
      throw new BadRequestException('Order already returned');
    }

    return this.prisma.$transaction(async (tx) => {
      const returnItemsData = dto.items.map((ri) => {
        const orderItem = order.items.find((oi) => oi.id === ri.orderItemId);
        if (!orderItem) {
          throw new NotFoundException(`OrderItem ${ri.orderItemId} not found`);
        }
        const amount = Number(orderItem.unitPrice) * ri.quantity;
        return {
          orderItemId: ri.orderItemId,
          productId: ri.productId,
          quantity: ri.quantity,
          amount,
        };
      });

      const total = returnItemsData.reduce((s, i) => s + i.amount, 0);

      const ret = await tx.return.create({
        data: {
          tenantId,
          orderId: dto.orderId,
          userId,
          reason: dto.reason,
          total,
          status: ReturnStatus.PENDING,
          items: { create: returnItemsData },
        },
        include: { items: true },
      });

      this.eventEmitter.emit('return.created', {
        tenantId,
        returnId: ret.id,
        orderId: dto.orderId,
        items: returnItemsData,
      });

      this.logger.log(`Return created: ${ret.id}`, {
        tenantId,
        returnId: ret.id,
      });
      return ret;
    });
  }

  async approveReturn(tenantId: string, approvedBy: string, returnId: string) {
    const ret = await this.prisma.return.findFirst({
      where: { id: returnId, tenantId, status: ReturnStatus.PENDING },
      include: { items: true },
    });
    if (!ret) throw new NotFoundException(`Return ${returnId} not found`);

    const updated = await this.prisma.return.update({
      where: { id: returnId },
      data: { status: ReturnStatus.APPROVED, approvedBy },
    });

    this.eventEmitter.emit('return.approved', {
      tenantId,
      returnId,
      items: ret.items,
    });

    this.logger.log(`Return approved: ${returnId}`, { tenantId, approvedBy });
    return updated;
  }

  // ─── RECEIPT ──────────────────────────────────────────────────

  async getReceipt(tenantId: string, orderId: string) {
    const order = await this.getOrderById(tenantId, orderId);
    return {
      orderNumber: order.orderNumber,
      date: order.createdAt,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cashier: `${(order as any).user?.firstName} ${(order as any).user?.lastName}`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      customer: (order as any).customer?.name ?? null,
      items: order.items.map((i) => ({
        name: i.productName,
        qty: i.quantity,
        price: i.unitPrice,
        total: i.total,
      })),
      subtotal: order.subtotal,
      discount: order.discountAmount,
      tax: order.taxAmount,
      total: order.total,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payments: (order as any).paymentIntents?.map((p: any) => ({
        method: p.method,
        amount: p.amount,
      })),
    };
  }

  // ─── T-223: SHIFT BY ID ───────────────────────────────────────
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

  // ─── T-223: SHIFT SUMMARY ─────────────────────────────────────
  async getShiftSummary(tenantId: string, opts: { branchId?: string; fromDate?: string; toDate?: string }) {
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
      (s, sh) => s + sh.orders.reduce((os, o) => os + Number(o.total), 0), 0,
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

  async listReturns(tenantId: string, query: { page?: number; limit?: number; status?: string }) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.ReturnWhereInput = { tenantId };
    if (query.status) where.status = query.status as ReturnStatus;

    const [items, total] = await Promise.all([
      this.prisma.return.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { items: true },
      }),
      this.prisma.return.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }
}
