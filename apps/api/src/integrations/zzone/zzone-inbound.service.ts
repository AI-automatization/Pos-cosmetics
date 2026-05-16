import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * ZZone → RAOS (Inbound Service)
 *
 * Handles requests FROM ZZone — queries products, stock, creates orders.
 */

@Injectable()
export class ZzoneInboundService {
  private readonly logger = new Logger(ZzoneInboundService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── PRODUCTS ────────────────────────────────────────────────────────

  async getProducts(sellerId?: string, page = 1) {
    const limit = 50;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null, isActive: true };
    if (sellerId) {
      where.tenantId = sellerId;
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

  async getProduct(productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      select: {
        id: true,
        tenantId: true,
        name: true,
        sku: true,
        barcode: true,
        sellPrice: true,
        costPrice: true,
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

  async getProductStock(productId: string) {
    const snapshot = await this.prisma.stockSnapshot.findFirst({
      where: { productId },
      orderBy: { calculatedAt: 'desc' },
      select: { quantity: true, calculatedAt: true },
    });

    return {
      productId,
      stock: snapshot ? Number(snapshot.quantity) : 0,
      updatedAt: snapshot?.calculatedAt ?? null,
    };
  }

  // ─── ORDERS ──────────────────────────────────────────────────────────

  async createOrderFromZzone(data: {
    zzoneOrderId: string;
    orderNumber: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    paymentMethod: string;
    clientName?: string;
    clientPhone?: string;
    deliveryAddress?: string;
  }) {
    // Get product to find tenantId
    const product = await this.prisma.product.findFirst({
      where: { id: data.productId, deletedAt: null },
      select: { id: true, tenantId: true, name: true },
    });

    if (!product) throw new NotFoundException('Product not found');

    // Get first user of this tenant (system user for ZZone orders)
    const systemUser = await this.prisma.user.findFirst({
      where: { tenantId: product.tenantId, role: 'OWNER' },
      select: { id: true },
    });

    if (!systemUser) throw new NotFoundException('Tenant has no owner user');

    // Get next order number
    const lastOrder = await this.prisma.order.findFirst({
      where: { tenantId: product.tenantId },
      orderBy: { orderNumber: 'desc' },
      select: { orderNumber: true },
    });
    const nextOrderNumber = (lastOrder?.orderNumber ?? 0) + 1;

    // Create order in RAOS
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
      select: { id: true, status: true, total: true, createdAt: true },
    });

    this.logger.log(`[ZZone←] Order created: ${order.id} from ZZone #${data.orderNumber}`);

    return {
      raosOrderId: order.id,
      zzoneOrderId: data.zzoneOrderId,
      status: order.status,
      total: Number(order.total),
      createdAt: order.createdAt,
    };
  }

  async updateOrderStatus(orderId: string, status: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Order not found');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
      select: { id: true, status: true, createdAt: true },
    });

    return { orderId: updated.id, status: updated.status, createdAt: updated.createdAt };
  }

  async getOrders(sellerId?: string, status?: string) {
    const where: any = { origin: 'ZZONE' };
    if (sellerId) where.tenantId = sellerId;
    if (status) where.status = status;

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
          select: {
            productId: true,
            quantity: true,
            unitPrice: true,
          },
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

  // ─── SELLERS / STORES ─────────────────────────────────────��──────────

  async getSeller(sellerId: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: sellerId },
      select: { id: true, name: true, slug: true, phone: true, city: true },
    });

    if (!tenant) throw new NotFoundException('Seller not found');

    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      phone: tenant.phone,
      city: tenant.city,
    };
  }

  async getStore(storeId: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id: storeId },
      select: { id: true, name: true, address: true, tenantId: true },
    });

    if (!branch) throw new NotFoundException('Store not found');

    return {
      id: branch.id,
      sellerId: branch.tenantId,
      name: branch.name,
      address: branch.address,
    };
  }
}
