import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateReturnDto } from './dto';
import { OrderStatus, ReturnStatus, Prisma } from '@prisma/client';

@Injectable()
export class ReturnService {
  private readonly logger = new Logger(ReturnService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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

      // ── POS cash return: check balance + auto-approve ──────────
      let initialStatus: ReturnStatus = ReturnStatus.PENDING;
      let approvedBy: string | undefined;

      if (dto.refundMethod === 'CASH' && order.shiftId) {
        try {
          const [cashSales, cashReturns, shift] = await Promise.all([
            tx.paymentIntent.aggregate({
              where: { tenantId, order: { shiftId: order.shiftId }, method: 'CASH', status: 'SETTLED' },
              _sum: { amount: true },
            }),
            tx.return.aggregate({
              where: { tenantId, order: { shiftId: order.shiftId }, refundMethod: 'CASH', status: ReturnStatus.APPROVED },
              _sum: { total: true },
            }),
            tx.shift.findUnique({ where: { id: order.shiftId }, select: { openingCash: true } }),
          ]);

          const availableCash =
            Number(shift?.openingCash ?? 0) +
            Number(cashSales._sum.amount ?? 0) -
            Number(cashReturns._sum.total ?? 0);

          if (availableCash >= total) {
            initialStatus = ReturnStatus.APPROVED;
            approvedBy = userId;
          } else {
            throw new BadRequestException(
              `INSUFFICIENT_CASH:${Math.round(availableCash)}:${Math.round(total)}`,
            );
          }
        } catch (err) {
          // Re-throw NestJS HttpExceptions (INSUFFICIENT_CASH etc.) as-is
          if (err instanceof BadRequestException || err instanceof NotFoundException) {
            throw err;
          }
          // Prisma/DB error (e.g. missing column) → fall through as PENDING
          this.logger.error('Cash balance check failed — creating return as PENDING', {
            tenantId, orderId: dto.orderId, error: (err as Error).message,
          });
          initialStatus = ReturnStatus.PENDING;
        }
      }
      // TERMINAL → always PENDING (bank reversal)
      // refundMethod undefined → always PENDING (admin path, backward compat)

      const ret = await tx.return.create({
        data: {
          tenantId,
          orderId: dto.orderId,
          userId,
          reason: dto.reason,
          total,
          refundMethod: dto.refundMethod,
          status: initialStatus,
          ...(approvedBy ? { approvedBy } : {}),
          items: { create: returnItemsData },
        },
        include: { items: true },
      });

      this.eventEmitter.emit('return.created', {
        tenantId,
        returnId: ret.id,
        orderId: dto.orderId,
        refundMethod: dto.refundMethod,
        status: initialStatus,
        items: returnItemsData,
      });

      if (initialStatus === ReturnStatus.APPROVED) {
        this.eventEmitter.emit('return.approved', {
          tenantId,
          returnId: ret.id,
          items: returnItemsData,
        });
      }

      this.logger.log(`Return created: ${ret.id} status=${initialStatus}`, {
        tenantId,
        returnId: ret.id,
        refundMethod: dto.refundMethod,
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
