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
import { ShiftStatus, OrderStatus, ReturnStatus, UserRole } from '@prisma/client';

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

  async getShifts(tenantId: string, limit = 20, page = 1) {
    const skip = (page - 1) * limit;
    const [total, items] = await this.prisma.$transaction([
      this.prisma.shift.count({ where: { tenantId } }),
      this.prisma.shift.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { openedAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
          branch: { select: { id: true, name: true } },
        },
      }),
    ]);
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

      // Generate order number (per tenant)
      const last = await tx.order.findFirst({
        where: { tenantId },
        orderBy: { orderNumber: 'desc' },
        select: { orderNumber: true },
      });
      const orderNumber = (last?.orderNumber ?? 0) + 1;

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
          taxAmount: 0,
          total,
          notes: dto.notes,
          items: { create: orderItemsData },
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
}
