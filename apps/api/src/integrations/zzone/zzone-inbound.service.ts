import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { ZzoneWebhookService } from './zzone-webhook.service';
import type { CreateZzoneOrderDto, UpdateProductDto } from './dto/zzone.dto';

@Injectable()
export class ZzoneInboundService {
  private readonly logger = new Logger(ZzoneInboundService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly webhookService: ZzoneWebhookService,
  ) {}

  // ─── PRODUCTS ────────────────────────────────────────────────────────

  async getProducts(sellerId: string, page = 1, updatedAfter?: Date) {
    const limit = 50;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null, isActive: true, zzoneVisible: true, tenantId: sellerId };
    if (updatedAfter) {
      where.updatedAt = { gte: updatedAfter };
    }

    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          tenantId: true,
          name: true,
          sku: true,
          barcode: true,
          sellPrice: true,
          description: true,
          imageUrl: true,
          category: { select: { id: true, name: true } },
        },
      }),
    ]);

    return {
      products: products.map((p) => ({
        id: p.id,
        sellerId: p.tenantId,
        name: p.name,
        sku: p.sku,
        barcode: p.barcode,
        price: Number(p.sellPrice),
        description: p.description,
        imageUrl: p.imageUrl,
        category: p.category?.name ?? null,
      })),
      pagination: { total, page, pages: Math.ceil(total / limit) },
    };
  }

  async getProduct(sellerId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId: sellerId, deletedAt: null },
      select: {
        id: true,
        tenantId: true,
        name: true,
        sku: true,
        barcode: true,
        sellPrice: true,
        description: true,
        imageUrl: true,
        isActive: true,
        category: { select: { id: true, name: true } },
      },
    });

    if (!product) throw new NotFoundException('Product not found');

    return {
      id: product.id,
      sellerId: product.tenantId,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      price: Number(product.sellPrice),
      description: product.description,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
      category: product.category?.name ?? null,
    };
  }

  async getProductStock(sellerId: string, productId: string) {
    const snapshot = await this.prisma.stockSnapshot.findFirst({
      where: { productId, tenantId: sellerId },
      orderBy: { calculatedAt: 'desc' },
      select: { quantity: true, calculatedAt: true },
    });

    return {
      productId,
      stock: snapshot ? Number(snapshot.quantity) : 0,
      updatedAt: snapshot?.calculatedAt ?? null,
    };
  }

  async updateProduct(sellerId: string, productId: string, data: UpdateProductDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId: sellerId, deletedAt: null },
    });
    if (!product) throw new NotFoundException('Product not found');

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.price !== undefined) updateData.sellPrice = data.price;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: updateData,
      select: { id: true, tenantId: true, name: true, sellPrice: true, updatedAt: true },
    });

    this.logger.log(`[ZZone] Product updated: ${productId}`);

    return {
      id: updated.id,
      sellerId: updated.tenantId,
      name: updated.name,
      price: Number(updated.sellPrice),
      updatedAt: updated.updatedAt,
    };
  }

  async deleteProduct(sellerId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId: sellerId, deletedAt: null },
    });
    if (!product) throw new NotFoundException('Product not found');

    await this.prisma.product.update({
      where: { id: productId },
      data: { deletedAt: new Date(), isActive: false },
    });

    this.logger.log(`[ZZone] Product soft-deleted: ${productId}`);

    return { id: productId, deleted: true, deletedAt: new Date() };
  }

  // ─── ORDERS ──────────────────────────────────────────────────────────

  async createOrderFromZzone(data: CreateZzoneOrderDto) {
    // Idempotency: check if order with same zzoneOrderId already exists
    const existing = await this.prisma.order.findFirst({
      where: { origin: 'ZZONE', notes: { contains: `ZZone #${data.orderNumber}` } },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(`Order with ZZone #${data.orderNumber} already exists (RAOS ID: ${existing.id})`);
    }

    const product = await this.prisma.product.findFirst({
      where: { id: data.productId, deletedAt: null },
      select: { id: true, tenantId: true, name: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Check available stock
    const snapshot = await this.prisma.stockSnapshot.findFirst({
      where: { productId: data.productId, tenantId: product.tenantId },
      orderBy: { calculatedAt: 'desc' },
      select: { quantity: true },
    });
    const available = snapshot ? Number(snapshot.quantity) : 0;
    if (available < data.quantity) {
      throw new BadRequestException(`Insufficient stock: available ${available}, requested ${data.quantity}`);
    }

    const [systemUser, lastOrder] = await Promise.all([
      this.prisma.user.findFirst({
        where: { tenantId: product.tenantId, role: 'OWNER' },
        select: { id: true },
      }),
      this.prisma.order.findFirst({
        where: { tenantId: product.tenantId },
        orderBy: { orderNumber: 'desc' },
        select: { orderNumber: true },
      }),
    ]);

    if (!systemUser) throw new NotFoundException('Tenant has no owner user');

    const nextOrderNumber = (lastOrder?.orderNumber ?? 0) + 1;

    const order = await this.prisma.order.create({
      data: {
        tenantId: product.tenantId,
        userId: systemUser.id,
        orderNumber: nextOrderNumber,
        origin: 'ZZONE',
        status: 'PENDING',
        subtotal: data.totalPrice,
        total: data.totalPrice,
        notes: `ZZone #${data.orderNumber} | ${data.clientName ?? ''} | ${data.clientPhone ?? ''} | ${data.deliveryAddress ?? ''}`,
        items: {
          create: {
            productId: data.productId,
            productName: product.name,
            quantity: data.quantity,
            unitPrice: data.unitPrice,
            total: data.totalPrice,
          },
        },
      },
      select: { id: true },
    });

    this.logger.log(`[ZZone←] Order created: ${order.id} from ZZone #${data.orderNumber}`);

    // Emit sale.created to trigger stock deduction
    this.eventEmitter.emit('sale.created', {
      tenantId: product.tenantId,
      orderId: order.id,
      userId: systemUser.id,
      items: [{ productId: data.productId, quantity: data.quantity }],
      total: data.totalPrice,
    });

    return { id: order.id };
  }

  async updateOrderStatus(orderId: string, status: string, sellerId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId: sellerId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(status as OrderStatus)) {
      throw new BadRequestException(`Invalid status: ${status}. Valid: ${validStatuses.join(', ')}`);
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as OrderStatus },
      select: { id: true, status: true, createdAt: true },
    });

    this.webhookService.sendOrderStatusChanged(orderId, status, sellerId).catch((err) => {
      this.logger.warn(`Webhook failed for order status: ${(err as Error).message}`);
    });

    return { orderId: updated.id, status: updated.status, createdAt: updated.createdAt };
  }

  async getOrders(sellerId: string, status?: string) {
    const where: { origin: string; tenantId: string; status?: OrderStatus } = {
      origin: 'ZZONE',
      tenantId: sellerId,
    };
    if (status) where.status = status as OrderStatus;

    const orders = await this.prisma.order.findMany({
      where,
      take: 50,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        tenantId: true,
        status: true,
        total: true,
        notes: true,
        createdAt: true,
        items: {
          select: { productId: true, quantity: true, unitPrice: true },
        },
      },
    });

    return orders.map((o) => ({
      id: o.id,
      sellerId: o.tenantId,
      status: o.status,
      total: Number(o.total),
      notes: o.notes,
      createdAt: o.createdAt,
      items: o.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
      })),
    }));
  }

  async getOrder(orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, origin: 'ZZONE' },
      select: {
        id: true,
        tenantId: true,
        status: true,
        total: true,
        notes: true,
        createdAt: true,
        items: {
          select: { productId: true, productName: true, quantity: true, unitPrice: true },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    return {
      id: order.id,
      sellerId: order.tenantId,
      status: order.status,
      total: Number(order.total),
      notes: order.notes,
      createdAt: order.createdAt,
      items: order.items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
      })),
    };
  }

  async updateOrder(orderId: string, sellerId: string, data: {
    quantity?: number;
    totalPrice?: number;
    deliveryAddress?: string;
    clientPhone?: string;
  }) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId: sellerId, origin: 'ZZONE' },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order can only be edited in PENDING status');
    }

    const updateData: Record<string, unknown> = {};
    if (data.totalPrice !== undefined) {
      updateData.subtotal = data.totalPrice;
      updateData.total = data.totalPrice;
    }
    if (data.deliveryAddress !== undefined || data.clientPhone !== undefined) {
      const parts = (order.notes ?? '').split(' | ');
      while (parts.length < 4) parts.push('');
      if (data.clientPhone !== undefined) parts[2] = data.clientPhone;
      if (data.deliveryAddress !== undefined) parts[3] = data.deliveryAddress;
      updateData.notes = parts.join(' | ');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
      select: { id: true, status: true, total: true, createdAt: true },
    });

    this.logger.log(`[ZZone] Order updated: ${orderId}`);

    return {
      id: updated.id,
      status: updated.status,
      total: Number(updated.total),
      updatedAt: new Date(),
    };
  }

  async voidOrder(orderId: string, sellerId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId: sellerId, origin: 'ZZONE' },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
      throw new BadRequestException(`Cannot void order in ${order.status} status`);
    }

    const warehouse = await this.prisma.warehouse.findFirst({
      where: { tenantId: sellerId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'VOIDED' },
      });

      if (warehouse) {
        const movementData = order.items.map((item) => ({
          tenantId: sellerId,
          warehouseId: warehouse.id,
          productId: item.productId,
          type: 'RETURN_IN' as const,
          quantity: item.quantity,
          refId: orderId,
          refType: 'ZZONE_VOID',
        }));
        await tx.stockMovement.createMany({ data: movementData });

        for (const item of order.items) {
          await tx.stockSnapshot.upsert({
            where: {
              tenantId_warehouseId_productId: {
                tenantId: sellerId,
                warehouseId: warehouse.id,
                productId: item.productId,
              },
            },
            update: { quantity: { increment: item.quantity }, calculatedAt: new Date() },
            create: {
              tenantId: sellerId,
              warehouseId: warehouse.id,
              productId: item.productId,
              quantity: item.quantity,
              calculatedAt: new Date(),
            },
          });
        }
      }
    });

    this.logger.log(`[ZZone] Order voided: ${orderId}, stock restored: ${!!warehouse}`);

    this.webhookService.sendOrderStatusChanged(orderId, 'VOIDED', sellerId).catch((err) => {
      this.logger.warn(`Webhook failed for order void: ${(err as Error).message}`);
    });

    return { id: orderId, status: 'VOIDED', stockRestored: !!warehouse, voidedAt: new Date() };
  }

  // ─── SELLERS ─────────────────────────────────────────────────────────

  async getSeller(sellerId: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: sellerId },
      select: { id: true, name: true, slug: true, phone: true, city: true },
    });
    if (!tenant) throw new NotFoundException('Seller not found');

    return { id: tenant.id, name: tenant.name, slug: tenant.slug, phone: tenant.phone, city: tenant.city };
  }

  async updateSeller(sellerId: string, data: { name?: string; phone?: string; city?: string }) {
    const tenant = await this.prisma.tenant.findFirst({ where: { id: sellerId } });
    if (!tenant) throw new NotFoundException('Seller not found');

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.city !== undefined) updateData.city = data.city;

    const updated = await this.prisma.tenant.update({
      where: { id: sellerId },
      data: updateData,
      select: { id: true, name: true, phone: true, city: true, updatedAt: true },
    });

    this.logger.log(`[ZZone] Seller updated: ${sellerId}`);
    return { id: updated.id, name: updated.name, phone: updated.phone, city: updated.city, updatedAt: updated.updatedAt };
  }

  async deactivateSeller(sellerId: string) {
    const tenant = await this.prisma.tenant.findFirst({ where: { id: sellerId } });
    if (!tenant) throw new NotFoundException('Seller not found');

    const { count } = await this.prisma.product.updateMany({
      where: { tenantId: sellerId, isActive: true, deletedAt: null },
      data: { isActive: false },
    });

    await this.prisma.tenant.update({ where: { id: sellerId }, data: { isActive: false } });

    this.logger.log(`[ZZone] Seller deactivated: ${sellerId}, products hidden: ${count}`);

    this.webhookService.sendSellerDeactivated(sellerId).catch((err) => {
      this.logger.warn(`Webhook failed for seller deactivation: ${(err as Error).message}`);
    });

    return { id: sellerId, isActive: false, productsHidden: count, deactivatedAt: new Date() };
  }

  // ─── STORES ──────────────────────────────────────────────────────────

  async getStores(sellerId: string) {
    const branches = await this.prisma.branch.findMany({
      where: { tenantId: sellerId, isActive: true },
      select: { id: true, name: true, address: true, tenantId: true, isActive: true },
      orderBy: { name: 'asc' },
    });

    return branches.map((b) => ({
      id: b.id, sellerId: b.tenantId, name: b.name, address: b.address, isActive: b.isActive,
    }));
  }

  async getStore(sellerId: string, storeId: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id: storeId, tenantId: sellerId },
      select: { id: true, name: true, address: true, tenantId: true, isActive: true },
    });
    if (!branch) throw new NotFoundException('Store not found');

    return { id: branch.id, sellerId: branch.tenantId, name: branch.name, address: branch.address, isActive: branch.isActive };
  }

  async updateStore(sellerId: string, storeId: string, data: { name?: string; address?: string }) {
    const branch = await this.prisma.branch.findFirst({ where: { id: storeId, tenantId: sellerId } });
    if (!branch) throw new NotFoundException('Store not found');

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.address !== undefined) updateData.address = data.address;

    const updated = await this.prisma.branch.update({
      where: { id: storeId },
      data: updateData,
      select: { id: true, name: true, address: true, updatedAt: true },
    });

    this.logger.log(`[ZZone] Store updated: ${storeId}`);
    return { id: updated.id, name: updated.name, address: updated.address, updatedAt: updated.updatedAt };
  }

  async deactivateStore(sellerId: string, storeId: string) {
    const branch = await this.prisma.branch.findFirst({ where: { id: storeId, tenantId: sellerId } });
    if (!branch) throw new NotFoundException('Store not found');

    await this.prisma.branch.update({ where: { id: storeId }, data: { isActive: false } });

    this.logger.log(`[ZZone] Store deactivated: ${storeId}`);
    return { id: storeId, isActive: false, deactivatedAt: new Date() };
  }
}
