import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../common/cache/cache.service';
import { CreateInvoiceDto, WriteOffDto } from './dto/warehouse-invoice.dto';

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class WarehouseInvoiceService {
  private readonly logger = new Logger(WarehouseInvoiceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  // ─── POST /warehouse/invoices ─────────────────────────────────────────────

  async createInvoice(tenantId: string, userId: string, dto: CreateInvoiceDto) {
    if (!tenantId) throw new BadRequestException('Tenant context missing — please re-login');
    if (dto.items.length === 0) throw new BadRequestException('items bo\'sh bo\'lishi mumkin emas');

    const warehouseId = await this.resolveWarehouseId(tenantId, dto.items[0]?.warehouseId);
    const supplierId = await this.resolveSupplierId(tenantId, dto.supplierId, dto.supplierName);
    await this.assertProductsBelongToTenant(tenantId, dto.items.map((i) => i.productId));

    // T-140: accept purchasePrice OR costPrice (mobile alias)
    const itemsWithPrice = dto.items.map((item) => ({
      ...item,
      price: item.purchasePrice ?? item.costPrice ?? 0,
    }));

    const totalCost = itemsWithPrice.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    // Snapshot: invoice + items + stock movements — all in one transaction
    let invoice;
    try {
      invoice = await this.prisma.$transaction(async (tx) => {
        const inv = await tx.warehouseInvoice.create({
          data: {
            tenantId,
            branchId: dto.branchId ?? null,
            supplierId: supplierId ?? null,
            invoiceNumber: dto.invoiceNumber || `INV-${Date.now().toString(36).toUpperCase()}`,
            note: dto.note ?? null,
            totalCost,
            createdBy: userId,
            items: {
              create: itemsWithPrice.map((item) => ({
                tenantId,
                productId: item.productId,
                quantity: item.quantity,
                purchasePrice: item.price,
                totalCost: item.quantity * item.price,
                warehouseId: item.warehouseId ?? warehouseId,
                batchNumber: item.batchNumber ?? null,
                expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
              })),
            },
          },
          include: { items: true },
        });

        // Create stock movements for each item
        await Promise.all(
          itemsWithPrice.map((item) =>
            tx.stockMovement.create({
              data: {
                tenantId,
                warehouseId: item.warehouseId ?? warehouseId,
                productId: item.productId,
                userId,
                type: 'IN',
                quantity: item.quantity,
                costPrice: item.price,
                refType: 'INVOICE',
                refId: inv.id,
                note: dto.invoiceNumber ? `Nakladnoy: ${dto.invoiceNumber}` : 'Warehouse invoice',
                batchNumber: item.batchNumber ?? null,
                expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
              },
            }),
          ),
        );

        return inv;
      });
    } catch (err) {
      this.logger.error('[Invoice] createInvoice transaction failed', {
        tenantId,
        userId,
        itemCount: dto.items.length,
        warehouseId,
        error: (err as Error).message,
        stack: (err as Error).stack,
      });
      throw err;
    }

    await this.cache.invalidatePattern(CacheService.key.stockLevels(tenantId, '*'));
    this.logger.log(`[Invoice] Created ${invoice.id}, ${dto.items.length} items, totalCost=${totalCost}`, { tenantId });

    // T-140: Mobile-friendly response shape
    return {
      id: invoice.id,
      receiptNumber: invoice.invoiceNumber,
      date: invoice.createdAt.toISOString(),
      totalCost: Number(invoice.totalCost),
      itemsCount: invoice.items.length,
      status: invoice.status,
    };
  }

  // ─── GET /warehouse/invoices ──────────────────────────────────────────────

  async listInvoices(
    tenantId: string,
    opts: { from?: string; to?: string; supplierId?: string; page?: number; limit?: number },
  ) {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      ...(opts.supplierId && { supplierId: opts.supplierId }),
      ...((opts.from || opts.to) && {
        createdAt: {
          ...(opts.from && { gte: new Date(opts.from) }),
          ...(opts.to && { lte: new Date(opts.to) }),
        },
      }),
    };

    const [total, invoices] = await Promise.all([
      this.prisma.warehouseInvoice.count({ where }),
      this.prisma.warehouseInvoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { items: { select: { productId: true, quantity: true, totalCost: true } } },
      }),
    ]);

    return { invoices, total, page, limit };
  }

  // ─── GET /warehouse/invoices/:id ──────────────────────────────────────────

  async getInvoice(tenantId: string, invoiceId: string) {
    const invoice = await this.prisma.warehouseInvoice.findFirst({
      where: { id: invoiceId, tenantId },
      include: { items: true },
    });
    if (!invoice) throw new NotFoundException('Nakladnoy topilmadi');

    const productIds = invoice.items.map((i) => i.productId);
    const [products, supplier] = await Promise.all([
      this.prisma.product.findMany({
        where: { id: { in: productIds }, tenantId },
        select: { id: true, name: true, sku: true, unit: { select: { shortName: true } } },
      }),
      invoice.supplierId
        ? this.prisma.supplier.findFirst({
            where: { id: invoice.supplierId, tenantId },
            select: { id: true, name: true, phone: true, company: true },
          })
        : null,
    ]);

    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    return {
      ...invoice,
      supplier,
      items: invoice.items.map((item) => ({
        ...item,
        product: productMap[item.productId] ?? null,
      })),
    };
  }

  // ─── PATCH /warehouse/invoices/:id — update metadata ──────────────────

  async updateInvoiceMeta(
    tenantId: string,
    invoiceId: string,
    dto: { invoiceNumber?: string; note?: string; supplierId?: string },
  ) {
    const invoice = await this.prisma.warehouseInvoice.findFirst({
      where: { id: invoiceId, tenantId },
    });
    if (!invoice) throw new NotFoundException('Nakladnoy topilmadi');

    const data: Record<string, unknown> = {};
    if (dto.invoiceNumber !== undefined) data.invoiceNumber = dto.invoiceNumber || null;
    if (dto.note !== undefined) data.note = dto.note || null;
    if (dto.supplierId !== undefined) {
      // #51: supplierId из запроса обязан принадлежать тенанту
      if (dto.supplierId) {
        const owned = await this.prisma.supplier.findFirst({
          where: { id: dto.supplierId, tenantId },
          select: { id: true },
        });
        if (!owned) throw new NotFoundException('Yetkazib beruvchi topilmadi');
      }
      data.supplierId = dto.supplierId || null;
    }

    const updated = await this.prisma.warehouseInvoice.update({
      where: { id: invoiceId, tenantId },
      data,
    });
    return updated;
  }

  // ─── APPROVE invoice ────────────────────────────────────────────────

  async approveInvoice(tenantId: string, userId: string, invoiceId: string) {
    const invoice = await this.prisma.warehouseInvoice.findFirst({
      where: { id: invoiceId, tenantId },
    });
    if (!invoice) throw new NotFoundException('Nakladnoy topilmadi');
    if (invoice.status === 'RECEIVED') throw new BadRequestException('Allaqachon qabul qilingan');
    if (invoice.status === 'CANCELLED') throw new BadRequestException('Bekor qilingan nakladnoyni tasdiqlash mumkin emas');

    const updated = await this.prisma.warehouseInvoice.update({
      where: { id: invoiceId },
      data: { status: 'RECEIVED', approvedBy: userId, approvedAt: new Date() },
      include: { items: true },
    });

    this.logger.log("[Invoice] Approved " + invoiceId + " by " + userId, { tenantId });
    return updated;
  }

  async rejectInvoice(tenantId: string, userId: string, invoiceId: string) {
    const invoice = await this.prisma.warehouseInvoice.findFirst({
      where: { id: invoiceId, tenantId },
    });
    if (!invoice) throw new NotFoundException('Nakladnoy topilmadi');
    if (invoice.status === 'RECEIVED') throw new BadRequestException('Tasdiqlangan nakladnoyni bekor qilish mumkin emas');
    if (invoice.status === 'CANCELLED') throw new BadRequestException('Allaqachon bekor qilingan');

    const updated = await this.prisma.warehouseInvoice.update({
      where: { id: invoiceId },
      data: { status: 'CANCELLED', approvedBy: userId, approvedAt: new Date() },
    });

    this.logger.log("[Invoice] Rejected " + invoiceId + " by " + userId, { tenantId });
    return updated;
  }

  // ─── POST /inventory/write-off ────────────────────────────────────────────

  async writeOff(tenantId: string, userId: string, dto: WriteOffDto) {
    if (dto.items.length === 0) throw new BadRequestException('items bo\'sh bo\'lishi mumkin emas');

    const warehouseId = await this.resolveWarehouseId(tenantId, dto.warehouseId);
    await this.assertProductsBelongToTenant(tenantId, dto.items.map((i) => i.productId));

    const movements = await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.stockMovement.create({
          data: {
            tenantId,
            warehouseId,
            productId: item.productId,
            userId,
            type: 'WRITE_OFF',
            quantity: item.qty,
            refType: 'WRITE_OFF',
            note: `${dto.reason}${dto.note ? ': ' + dto.note : ''}`,
          },
        }),
      ),
    );

    await this.cache.invalidatePattern(CacheService.key.stockLevels(tenantId, '*'));
    this.logger.log(`[WriteOff] ${movements.length} items, reason=${dto.reason}`, { tenantId });

    return { created: movements.length, reason: dto.reason, movements };
  }

  private async resolveSupplierId(tenantId: string, supplierId?: string, supplierName?: string): Promise<string | null> {
    if (supplierId) {
      // #51: без проверки владения сюда можно подсунуть supplierId чужого тенанта
      const owned = await this.prisma.supplier.findFirst({
        where: { id: supplierId, tenantId },
        select: { id: true },
      });
      if (!owned) throw new NotFoundException('Yetkazib beruvchi topilmadi');
      return supplierId;
    }
    if (!supplierName?.trim()) return null;

    const existing = await this.prisma.supplier.findFirst({
      where: { tenantId, name: { equals: supplierName.trim(), mode: 'insensitive' } },
    });
    if (existing) return existing.id;

    const created = await this.prisma.supplier.create({
      data: { tenantId, name: supplierName.trim() },
    });
    return created.id;
  }

  // #51: productId приходят из тела запроса — без проверки инвойс/движения можно
  // привязать к товарам чужого тенанта (cross-tenant reference injection)
  private async assertProductsBelongToTenant(tenantId: string, productIds: string[]): Promise<void> {
    const unique = [...new Set(productIds)];
    if (unique.length === 0) return;
    const owned = await this.prisma.product.count({
      where: { id: { in: unique }, tenantId },
    });
    if (owned !== unique.length) {
      throw new BadRequestException("Ba'zi mahsulotlar topilmadi yoki sizning do'koningizga tegishli emas");
    }
  }

  private async resolveWarehouseId(tenantId: string, warehouseId?: string): Promise<string> {
    if (warehouseId) {
      const exists = await this.prisma.warehouse.findFirst({ where: { id: warehouseId, tenantId } });
      if (!exists) throw new NotFoundException(`Warehouse ${warehouseId} not found`);
      return warehouseId;
    }
    const first = await this.prisma.warehouse.findFirst({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    if (!first) {
      const created = await this.prisma.warehouse.create({
        data: { tenantId, name: 'Asosiy Ombor' },
      });
      return created.id;
    }
    return first.id;
  }
}
