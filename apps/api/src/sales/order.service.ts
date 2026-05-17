import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditService } from '../audit/audit.service';
import { CreateOrderDto, DiscountTypeEnum } from './dto';
import { OrderStatus, UserRole } from '@prisma/client';

// Discount limits by role
const DISCOUNT_LIMIT: Record<string, number> = {
  [UserRole.CASHIER]: 5,
  [UserRole.MANAGER]: 15,
  [UserRole.ADMIN]: 100,
  [UserRole.OWNER]: 100,
  [UserRole.VIEWER]: 0,
};

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly auditService: AuditService,
  ) {}

  async createOrder(tenantId: string, userId: string, dto: CreateOrderDto, userRole?: UserRole) {
    return this.prisma.$transaction(async (tx) => {
      // ─── Discount limit check (T-026) ─────────────────────
      if (dto.discountAmount && dto.discountAmount > 0 && userRole) {
        const maxPct = DISCOUNT_LIMIT[userRole] ?? 0;
        let discountPct = dto.discountAmount;

        if (dto.discountType !== DiscountTypeEnum.PERCENT) {
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

      // T-459: Auto-assign shiftId from user's open shift if not provided
      let resolvedShiftId = dto.shiftId;
      if (!resolvedShiftId) {
        const openShift = await tx.shift.findFirst({
          where: { tenantId, userId, status: 'OPEN' },
          select: { id: true, branchId: true },
        });
        if (openShift) {
          resolvedShiftId = openShift.id;
        }
      }

      // Auto-resolve branchId from shift if not provided in DTO
      let resolvedBranchId = dto.branchId;
      if (!resolvedBranchId && resolvedShiftId) {
        const shift = await tx.shift.findUnique({
          where: { id: resolvedShiftId },
          select: { branchId: true },
        });
        resolvedBranchId = shift?.branchId ?? undefined;
      }

      const productIds = dto.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, tenantId, deletedAt: null },
      });

      if (products.length !== productIds.length) {
        throw new NotFoundException('One or more products not found');
      }

      const productMap = new Map(products.map((p) => [p.id, p]));

      const orderItemsData = dto.items.map((item) => {
        const product = productMap.get(item.productId)!;
        const discount = item.discountAmount ?? 0;
        const total = Number(item.unitPrice) * Number(item.quantity) - discount;
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

      // T-078: QQS (НДС 12%) — tax-inclusive
      const taxableTotal = orderItemsData.reduce(
        (s, i) => s + (i.isTaxable ? Math.max(0, i.total) : 0),
        0,
      );
      const taxAmount = Math.round((taxableTotal * 0.12) / 1.12);

      const last = await tx.order.findFirst({
        where: { tenantId },
        orderBy: { orderNumber: 'desc' },
        select: { orderNumber: true },
      });
      const orderNumber = (last?.orderNumber ?? 0) + 1;

      const orderItemsInsert = orderItemsData.map(({ isTaxable: _t, ...rest }) => rest);

      // POS flow: payment is already confirmed by cashier before calling createOrder.
      // Use PENDING for deferred/online orders, COMPLETED for immediate POS sales.
      const initialStatus = dto.customerId && !resolvedShiftId
        ? OrderStatus.PENDING
        : OrderStatus.COMPLETED;

      const order = await tx.order.create({
        data: {
          tenantId,
          userId,
          shiftId: resolvedShiftId,
          branchId: resolvedBranchId,
          customerId: dto.customerId,
          orderNumber,
          status: initialStatus,
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

      void this.auditService.log({
        tenantId,
        userId,
        action: 'ORDER_CREATED',
        entityType: 'Order',
        entityId: order.id,
        newData: { orderNumber, total, itemsCount: dto.items.length },
      });

      return order;
    });
  }

  async getOrders(
    tenantId: string,
    opts: { page?: number; limit?: number; shiftId?: string; from?: string; to?: string },
  ) {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      tenantId,
      ...(opts.shiftId && { shiftId: opts.shiftId }),
    };

    // T-423: Date filter
    if (opts.from || opts.to) {
      const createdAt: Record<string, Date> = {};
      if (opts.from) createdAt.gte = new Date(opts.from);
      if (opts.to) {
        const toDate = new Date(opts.to);
        toDate.setHours(23, 59, 59, 999);
        createdAt.lte = toDate;
      }
      where.createdAt = createdAt;
    }

    const [total, orders] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { product: { select: { id: true, name: true } } } },
          customer: { select: { id: true, name: true, phone: true } },
          user: { select: { id: true, firstName: true, lastName: true } },
          paymentIntents: { select: { method: true, amount: true } },
        },
      }),
    ]);

    const items = orders.map((order) => {
      const methods = order.paymentIntents.map((p) => p.method);
      let paymentMethod = 'NAQD';
      if (methods.some((m) => m === 'DEBT')) paymentMethod = 'NASIYA';
      else if (methods.length > 0 && methods.every((m) => m === 'TERMINAL')) paymentMethod = 'KARTA';
      else if (methods.length > 1) paymentMethod = 'ARALASH';

      return { ...order, itemsCount: order.items.length, paymentMethod };
    });

    return { items, total, page, limit };
  }

  async getOrderById(tenantId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, tenantId },
      include: {
        items: { include: { product: { select: { id: true, name: true } } } },
        customer: { select: { id: true, name: true, phone: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
        paymentIntents: true,
      },
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async getOrderByNumber(tenantId: string, orderNumber: number) {
    const order = await this.prisma.order.findFirst({
      where: { tenantId, orderNumber },
      include: {
        items: { include: { product: { select: { id: true, name: true } } } },
        paymentIntents: { where: { status: 'SETTLED' }, select: { method: true, amount: true } },
        customer: { select: { id: true, name: true, phone: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!order) throw new NotFoundException(`Order #${orderNumber} not found`);
    return order;
  }

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
}
