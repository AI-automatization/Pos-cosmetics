import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreatePaymentIntentDto, SplitPaymentDto } from './dto/create-payment.dto';
import { PaymentIntentStatus, Prisma } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createPaymentIntent(tenantId: string, dto: CreatePaymentIntentDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, tenantId },
    });
    if (!order) throw new NotFoundException(`Order ${dto.orderId} not found`);

    const intent = await this.prisma.paymentIntent.create({
      data: {
        tenantId,
        orderId: dto.orderId,
        method: dto.method,
        amount: dto.amount,
        provider: dto.provider,
        providerRef: dto.providerRef,
        status: PaymentIntentStatus.CREATED,
      },
    });

    this.logger.log(`PaymentIntent created: ${intent.id}`, {
      tenantId,
      orderId: dto.orderId,
      method: dto.method,
      amount: dto.amount,
    });
    return intent;
  }

  async createSplitPayment(tenantId: string, dto: SplitPaymentDto) {
    return Promise.all(
      dto.payments.map((p) => this.createPaymentIntent(tenantId, p)),
    );
  }

  async confirmPayment(tenantId: string, intentId: string) {
    const intent = await this.prisma.paymentIntent.findFirst({
      where: { id: intentId, tenantId, status: PaymentIntentStatus.CREATED },
    });
    if (!intent) throw new NotFoundException(`PaymentIntent ${intentId} not found`);

    await this.prisma.paymentIntent.update({
      where: { id: intentId },
      data: { status: PaymentIntentStatus.CONFIRMED },
    });

    // Cash payments auto-settle
    if (intent.method === 'CASH') {
      return this.settlePayment(tenantId, intentId);
    }

    return intent;
  }

  async settlePayment(tenantId: string, intentId: string) {
    const intent = await this.prisma.paymentIntent.findFirst({
      where: {
        id: intentId,
        tenantId,
        status: { in: [PaymentIntentStatus.CREATED, PaymentIntentStatus.CONFIRMED] },
      },
    });
    if (!intent) throw new NotFoundException(`PaymentIntent ${intentId} not found`);

    const settled = await this.prisma.paymentIntent.update({
      where: { id: intentId },
      data: { status: PaymentIntentStatus.SETTLED },
    });

    this.eventEmitter.emit('payment.settled', {
      tenantId,
      intentId,
      orderId: intent.orderId,
      method: intent.method,
      amount: intent.amount,
    });

    this.logger.log(`Payment settled: ${intentId}`, {
      tenantId,
      amount: intent.amount,
    });
    return settled;
  }

  async reversePayment(tenantId: string, intentId: string) {
    const intent = await this.prisma.paymentIntent.findFirst({
      where: { id: intentId, tenantId, status: PaymentIntentStatus.SETTLED },
    });
    if (!intent)
      throw new NotFoundException(`Settled PaymentIntent ${intentId} not found`);

    const reversed = await this.prisma.paymentIntent.update({
      where: { id: intentId },
      data: { status: PaymentIntentStatus.REVERSED },
    });

    this.eventEmitter.emit('payment.reversed', {
      tenantId,
      intentId,
      orderId: intent.orderId,
    });

    this.logger.log(`Payment reversed: ${intentId}`, { tenantId });
    return reversed;
  }

  async getOrderPayments(tenantId: string, orderId: string) {
    return this.prisma.paymentIntent.findMany({
      where: { tenantId, orderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPaymentIntent(tenantId: string, intentId: string) {
    const intent = await this.prisma.paymentIntent.findFirst({
      where: { id: intentId, tenantId },
    });
    if (!intent) throw new NotFoundException(`PaymentIntent ${intentId} not found`);
    return intent;
  }

  async listPayments(tenantId: string, query: { page?: number; limit?: number; status?: string }) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentIntentWhereInput = { tenantId };
    if (query.status) where.status = query.status as PaymentIntentStatus;

    const [items, total] = await Promise.all([
      this.prisma.paymentIntent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          order: {
            select: {
              orderNumber: true,
              customer: { select: { id: true, name: true, phone: true } },
            },
          },
        },
      }),
      this.prisma.paymentIntent.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }
}
