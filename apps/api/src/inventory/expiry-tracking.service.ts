import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenTesterDto } from './dto/open-tester.dto';

@Injectable()
export class ExpiryTrackingService {
  private readonly logger = new Logger(ExpiryTrackingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getExpiringProducts(tenantId: string, days: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);

    return this.prisma.$queryRaw<
      {
        productId: string;
        productName: string;
        warehouseId: string;
        warehouseName: string;
        batchNumber: string | null;
        expiryDate: Date;
        qty: number;
        daysLeft: number;
      }[]
    >`
      SELECT
        sm.product_id       AS "productId",
        p.name              AS "productName",
        sm.warehouse_id     AS "warehouseId",
        w.name              AS "warehouseName",
        sm.batch_number     AS "batchNumber",
        sm.expiry_date      AS "expiryDate",
        SUM(
          CASE
            WHEN sm.type IN ('IN','RETURN_IN','TRANSFER_IN') THEN sm.quantity
            WHEN sm.type = 'ADJUSTMENT' THEN sm.quantity
            ELSE -sm.quantity
          END
        )::float            AS qty,
        EXTRACT(DAY FROM sm.expiry_date - NOW())::int AS "daysLeft"
      FROM stock_movements sm
      JOIN products p  ON p.id  = sm.product_id
      JOIN warehouses w ON w.id = sm.warehouse_id
      WHERE sm.tenant_id   = ${tenantId}
        AND sm.expiry_date IS NOT NULL
        AND sm.expiry_date >= NOW()
        AND sm.expiry_date <= ${cutoff}
      GROUP BY sm.product_id, p.name, sm.warehouse_id, w.name, sm.batch_number, sm.expiry_date
      HAVING SUM(
        CASE
          WHEN sm.type IN ('IN','RETURN_IN','TRANSFER_IN') THEN sm.quantity
          WHEN sm.type = 'ADJUSTMENT' THEN sm.quantity
          ELSE -sm.quantity
        END
      ) > 0
      ORDER BY sm.expiry_date ASC
    `;
  }

  async getExpiredProducts(tenantId: string) {
    const now = new Date();

    return this.prisma.$queryRaw<
      {
        productId: string;
        productName: string;
        batchNumber: string | null;
        expiryDate: Date;
        qty: number;
      }[]
    >`
      SELECT
        sm.product_id   AS "productId",
        p.name          AS "productName",
        sm.batch_number AS "batchNumber",
        sm.expiry_date  AS "expiryDate",
        SUM(
          CASE
            WHEN sm.type IN ('IN','RETURN_IN','TRANSFER_IN') THEN sm.quantity
            WHEN sm.type = 'ADJUSTMENT' THEN sm.quantity
            ELSE -sm.quantity
          END
        )::float AS qty
      FROM stock_movements sm
      JOIN products p ON p.id = sm.product_id
      WHERE sm.tenant_id   = ${tenantId}
        AND sm.expiry_date IS NOT NULL
        AND sm.expiry_date < ${now}
      GROUP BY sm.product_id, p.name, sm.batch_number, sm.expiry_date
      HAVING SUM(
        CASE
          WHEN sm.type IN ('IN','RETURN_IN','TRANSFER_IN') THEN sm.quantity
          WHEN sm.type = 'ADJUSTMENT' THEN sm.quantity
          ELSE -sm.quantity
        END
      ) > 0
      ORDER BY sm.expiry_date ASC
    `;
  }

  // T-096: Tester ochish — StockMovement + Expense bir tranzaksiyada
  async openTester(tenantId: string, userId: string, dto: OpenTesterDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, tenantId, deletedAt: null },
      select: { id: true, name: true },
    });
    if (!product) throw new NotFoundException(`Product ${dto.productId} not found`);

    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id: dto.warehouseId, tenantId },
      select: { id: true, name: true },
    });
    if (!warehouse) throw new NotFoundException(`Warehouse ${dto.warehouseId} not found`);

    const totalCost = dto.costPrice * dto.quantity;

    const [movement, expense] = await this.prisma.$transaction([
      this.prisma.stockMovement.create({
        data: {
          tenantId,
          productId: dto.productId,
          warehouseId: dto.warehouseId,
          userId,
          type: 'TESTER',
          quantity: dto.quantity,
          costPrice: dto.costPrice,
          note: dto.note ?? `Tester: ${product.name}`,
        },
      }),
      this.prisma.expense.create({
        data: {
          tenantId,
          userId,
          category: 'TESTER',
          description: `Tester: ${product.name} × ${dto.quantity} (${warehouse.name})`,
          amount: totalCost,
          date: new Date(),
        },
      }),
    ]);

    this.logger.log(`Tester opened: ${product.name} ×${dto.quantity}`, {
      tenantId,
      movementId: movement.id,
      expenseId: expense.id,
      totalCost,
    });

    return { movement, expense, totalCost };
  }

  // T-096: Tester/namuna harakatlari
  async getTesterMovements(tenantId: string, from?: string, to?: string) {
    const where: Record<string, unknown> = { tenantId, type: 'TESTER' };
    if (from || to) {
      where['createdAt'] = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      };
    }

    const movements = await this.prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        warehouse: { select: { id: true, name: true } },
      },
    });

    const totalCost = movements.reduce((sum, m) => {
      const cost = m.costPrice ? Number(m.costPrice) * Number(m.quantity) : 0;
      return sum + cost;
    }, 0);

    return { items: movements, totalCost, count: movements.length };
  }
}
