import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ADETAL_ORDER_ORIGIN, ADETAL_ORDER_STATUS_MAP, ADETAL_PROVIDER } from './adetal.constants';
import type { AdetalIntegrationConfig } from './dto/adetal.dto';

/**
 * Processes Adetal orders into RAOS system.
 * Called by AdetalOrderPollerService when new orders are fetched.
 */
@Injectable()
export class AdetalInboundService {
  private readonly logger = new Logger(AdetalInboundService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Convert an Adetal order into a RAOS order.
   * Idempotent: skips if order with same Adetal orderNumber already exists.
   */
  async processAdetalOrder(
    tenantId: string,
    adetalOrder: {
      _id: string;
      orderNumber: number;
      status: string;
      totalPrice: number;
      quantity: number;
      product: { _id: string; name: string; price: number };
      deliveryAddress?: { address: string; phone: string };
      createdAt: string;
    },
  ): Promise<{ id: string; skipped?: boolean }> {
    // Idempotency: check by origin + notes prefix
    const existing = await this.prisma.order.findFirst({
      where: {
        tenantId,
        origin: ADETAL_ORDER_ORIGIN,
        notes: { startsWith: `Adetal #${adetalOrder.orderNumber} |` },
      },
      select: { id: true },
    });

    if (existing) {
      return { id: existing.id, skipped: true };
    }

    // Reverse mapping: adetalProductId → raosProductId
    const config = await this.prisma.integrationConfig.findUnique({
      where: { tenantId_provider: { tenantId, provider: ADETAL_PROVIDER } },
    });
    if (!config) throw new NotFoundException('Adetal config not found');

    const adetalConfig = config.config as unknown as AdetalIntegrationConfig;
    const reverseMap = adetalConfig.reverseProductMappings ?? {};
    const raosProductId = reverseMap[adetalOrder.product._id];

    if (!raosProductId) {
      this.logger.warn(
        `[Adetal←] No RAOS mapping for Adetal product ${adetalOrder.product._id}, order #${adetalOrder.orderNumber}`,
      );
      return { id: '', skipped: true };
    }

    const product = await this.prisma.product.findFirst({
      where: { id: raosProductId, tenantId, deletedAt: null },
      select: { id: true, name: true },
    });
    if (!product) {
      this.logger.warn(`[Adetal←] RAOS product ${raosProductId} not found for tenant ${tenantId}`);
      return { id: '', skipped: true };
    }

    const systemUser = await this.prisma.user.findFirst({
      where: { tenantId, role: 'OWNER' },
      select: { id: true },
    });
    if (!systemUser) throw new NotFoundException('Tenant has no owner user');

    const unitPrice = adetalOrder.product.price;
    const totalPrice = adetalOrder.totalPrice;
    const quantity = adetalOrder.quantity;
    const clientPhone = adetalOrder.deliveryAddress?.phone ?? '';
    const clientAddress = adetalOrder.deliveryAddress?.address ?? '';

    // Atomic: stock check + order creation
    const order = await this.prisma.$transaction(async (tx) => {
      const snapshot = await tx.stockSnapshot.findFirst({
        where: { productId: raosProductId, tenantId },
        orderBy: { calculatedAt: 'desc' },
        select: { quantity: true },
      });
      const available = snapshot ? Number(snapshot.quantity) : 0;
      if (available < quantity) {
        throw new BadRequestException(
          `Insufficient stock for Adetal order #${adetalOrder.orderNumber}: available ${available}, requested ${quantity}`,
        );
      }

      const lastOrder = await tx.order.findFirst({
        where: { tenantId },
        orderBy: { orderNumber: 'desc' },
        select: { orderNumber: true },
      });
      const nextOrderNumber = (lastOrder?.orderNumber ?? 0) + 1;

      return tx.order.create({
        data: {
          tenantId,
          userId: systemUser.id,
          orderNumber: nextOrderNumber,
          origin: ADETAL_ORDER_ORIGIN,
          status: (ADETAL_ORDER_STATUS_MAP[adetalOrder.status as keyof typeof ADETAL_ORDER_STATUS_MAP] ?? 'PENDING') as OrderStatus,
          subtotal: totalPrice,
          total: totalPrice,
          notes: `Adetal #${adetalOrder.orderNumber} | ${clientPhone} | ${clientAddress}`,
          items: {
            create: {
              productId: raosProductId,
              productName: product.name,
              quantity,
              unitPrice,
              total: totalPrice,
            },
          },
        },
        select: { id: true },
      });
    });

    this.logger.log(`[Adetal←] Order created: ${order.id} from Adetal #${adetalOrder.orderNumber}`);

    this.eventEmitter.emit('sale.created', {
      tenantId,
      orderId: order.id,
      userId: systemUser.id,
      items: [{ productId: raosProductId, quantity }],
      total: totalPrice,
    });

    return { id: order.id };
  }

  /**
   * Map Adetal order status to RAOS and update local order.
   */
  async syncOrderStatus(tenantId: string, raosOrderId: string, adetalStatus: string): Promise<void> {
    const raosStatus = ADETAL_ORDER_STATUS_MAP[adetalStatus as keyof typeof ADETAL_ORDER_STATUS_MAP] as OrderStatus | undefined;
    if (!raosStatus) {
      this.logger.warn(`[Adetal←] Unknown Adetal status: ${adetalStatus}`);
      return;
    }

    const order = await this.prisma.order.findFirst({
      where: { id: raosOrderId, tenantId },
      select: { id: true, status: true },
    });
    if (!order) return;

    if (order.status !== raosStatus) {
      await this.prisma.order.update({
        where: { id: raosOrderId },
        data: { status: raosStatus },
      });
      this.logger.log(`[Adetal←] Order ${raosOrderId} status: ${order.status} → ${raosStatus}`);
    }
  }
}
