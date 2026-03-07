import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePromotionDto, UpdatePromotionDto, ApplyPromotionDto } from './dto/promotion.dto';
import { Prisma, PromotionType } from '@prisma/client';

@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getPromotions(tenantId: string, activeOnly = false) {
    const now = new Date();
    return this.prisma.promotion.findMany({
      where: {
        tenantId,
        ...(activeOnly
          ? {
              isActive: true,
              validFrom: { lte: now },
              OR: [{ validTo: null }, { validTo: { gte: now } }],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPromotion(tenantId: string, id: string) {
    const p = await this.prisma.promotion.findFirst({ where: { id, tenantId } });
    if (!p) throw new NotFoundException('Aksiya topilmadi');
    return p;
  }

  async createPromotion(tenantId: string, dto: CreatePromotionDto) {
    return this.prisma.promotion.create({
      data: {
        tenantId,
        name: dto.name,
        type: dto.type,
        rules: dto.rules as Prisma.InputJsonValue,
        validFrom: new Date(dto.validFrom),
        validTo: dto.validTo ? new Date(dto.validTo) : null,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updatePromotion(tenantId: string, id: string, dto: UpdatePromotionDto) {
    await this.getPromotion(tenantId, id);
    return this.prisma.promotion.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.rules !== undefined && { rules: dto.rules as Prisma.InputJsonValue }),
        ...(dto.validFrom !== undefined && { validFrom: new Date(dto.validFrom) }),
        ...(dto.validTo !== undefined && { validTo: new Date(dto.validTo) }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async deletePromotion(tenantId: string, id: string) {
    await this.getPromotion(tenantId, id);
    await this.prisma.promotion.delete({ where: { id } });
    return { success: true };
  }

  /**
   * T-099: Cart ga mos aksiyalarni topib discount hisoblash.
   * Returns: { discountAmount, appliedPromotions[] }
   */
  async applyPromotions(tenantId: string, dto: ApplyPromotionDto) {
    const now = new Date();
    const activePromotions = await this.prisma.promotion.findMany({
      where: {
        tenantId,
        isActive: true,
        validFrom: { lte: now },
        OR: [{ validTo: null }, { validTo: { gte: now } }],
      },
    });

    let totalDiscount = 0;
    const applied: Array<{ promotionId: string; name: string; discount: number }> = [];

    for (const promo of activePromotions) {
      const rules = promo.rules as Record<string, unknown>;
      let discount = 0;

      if (promo.type === PromotionType.PERCENT) {
        const percent = Number(rules['percent'] ?? 0);
        discount = Math.round((dto.subtotal * percent) / 100);
      } else if (promo.type === PromotionType.FIXED) {
        discount = Number(rules['amount'] ?? 0);
      } else if (promo.type === PromotionType.BUY_X_GET_Y) {
        const buyQty = Number(rules['buyQty'] ?? 1);
        const getQty = Number(rules['getQty'] ?? 1);
        const totalQty = dto.items.reduce((s, i) => s + i.quantity, 0);
        const freeSets = Math.floor(totalQty / (buyQty + getQty));
        if (freeSets > 0) {
          const sortedItems = [...dto.items].sort((a, b) => a.unitPrice - b.unitPrice);
          let freeCount = freeSets * getQty;
          for (const item of sortedItems) {
            if (freeCount <= 0) break;
            const taken = Math.min(freeCount, item.quantity);
            discount += taken * item.unitPrice;
            freeCount -= taken;
          }
        }
      } else if (promo.type === PromotionType.BUNDLE) {
        const bundleProductIds = (rules['productIds'] as string[]) ?? [];
        const discountPercent = Number(rules['discount'] ?? 0);
        const cartIds = dto.items.map((i) => i.productId);
        const allPresent = bundleProductIds.every((pid) => cartIds.includes(pid));
        if (allPresent) {
          const bundleTotal = dto.items
            .filter((i) => bundleProductIds.includes(i.productId))
            .reduce((s, i) => s + i.quantity * i.unitPrice, 0);
          discount = Math.round((bundleTotal * discountPercent) / 100);
        }
      }

      if (discount > 0) {
        totalDiscount += discount;
        applied.push({ promotionId: promo.id, name: promo.name, discount });
      }
    }

    return {
      discountAmount: totalDiscount,
      appliedPromotions: applied,
    };
  }
}
