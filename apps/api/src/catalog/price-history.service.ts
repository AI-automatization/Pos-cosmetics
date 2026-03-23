import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PriceHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * T-133: Get price change history for a product
   */
  async getHistory(tenantId: string, productId: string, limit = 50) {
    const rows = await this.prisma.priceChange.findMany({
      where: { tenantId, productId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        field: true,
        oldValue: true,
        newValue: true,
        reason: true,
        userId: true,
        createdAt: true,
      },
    });
    return rows.map((r) => ({
      id: r.id,
      field: r.field,
      oldValue: Number(r.oldValue),
      newValue: Number(r.newValue),
      reason: r.reason,
      userId: r.userId,
      createdAt: r.createdAt,
    }));
  }

  /**
   * Record a price change (called internally when product price is updated)
   */
  async record(params: {
    tenantId: string;
    productId: string;
    userId: string | null;
    field: string;
    oldValue: number;
    newValue: number;
    reason?: string;
  }) {
    return this.prisma.priceChange.create({
      data: {
        tenantId: params.tenantId,
        productId: params.productId,
        userId: params.userId,
        field: params.field,
        oldValue: params.oldValue,
        newValue: params.newValue,
        reason: params.reason ?? null,
      },
    });
  }

  /**
   * T-133: List recent price changes across all products for tenant
   */
  async listRecent(tenantId: string, limit = 100) {
    const rows = await this.prisma.priceChange.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        productId: true,
        product: { select: { name: true } },
        field: true,
        oldValue: true,
        newValue: true,
        reason: true,
        userId: true,
        createdAt: true,
      },
    });
    return rows.map((r) => ({
      id: r.id,
      productId: r.productId,
      productName: r.product.name,
      field: r.field,
      oldValue: Number(r.oldValue),
      newValue: Number(r.newValue),
      reason: r.reason,
      userId: r.userId,
      createdAt: r.createdAt,
    }));
  }
}
