import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePromoCodeDto, UpdatePromoCodeDto, ValidateCodeDto } from './dto/promo-code.dto';
import { Prisma, PromoType } from '@prisma/client';

/** Auto-generate code: RAOS-XXXX where X = uppercase alphanum */
function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const random = Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join('');
  return `RAOS-${random}`;
}

export interface ValidateResult {
  valid: boolean;
  discount: number;
  type: PromoType | null;
  message: string;
}

@Injectable()
export class PromoCodeService {
  private readonly logger = new Logger(PromoCodeService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listCodes(tenantId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where: Prisma.PromoCodeWhereInput = { tenantId };

    const [items, total] = await Promise.all([
      this.prisma.promoCode.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.promoCode.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getCode(tenantId: string, id: string) {
    const code = await this.prisma.promoCode.findFirst({ where: { id, tenantId } });
    if (!code) throw new NotFoundException('Promo kod topilmadi');
    return code;
  }

  async createCode(tenantId: string, dto: CreatePromoCodeDto) {
    const rawCode = dto.code?.trim().toUpperCase() ?? generateCode();

    const existing = await this.prisma.promoCode.findUnique({
      where: { tenantId_code: { tenantId, code: rawCode } },
    });
    if (existing) {
      throw new ConflictException(`"${rawCode}" kodi allaqachon mavjud`);
    }

    const created = await this.prisma.promoCode.create({
      data: {
        tenantId,
        code: rawCode,
        type: dto.type,
        value: new Prisma.Decimal(dto.value),
        usageLimit: dto.usageLimit ?? 0,
        minPurchase: new Prisma.Decimal(dto.minPurchase ?? 0),
        validFrom: new Date(dto.validFrom),
        validTo: dto.validTo ? new Date(dto.validTo) : null,
      },
    });

    this.logger.log('PromoCode created', { id: created.id, code: created.code, tenantId });
    return created;
  }

  async updateCode(tenantId: string, id: string, dto: UpdatePromoCodeDto) {
    await this.getCode(tenantId, id);

    if (dto.code !== undefined) {
      const normalized = dto.code.trim().toUpperCase();
      const conflict = await this.prisma.promoCode.findUnique({
        where: { tenantId_code: { tenantId, code: normalized } },
      });
      if (conflict && conflict.id !== id) {
        throw new ConflictException(`"${normalized}" kodi allaqachon mavjud`);
      }
    }

    return this.prisma.promoCode.update({
      where: { id, tenantId },
      data: {
        ...(dto.code !== undefined && { code: dto.code.trim().toUpperCase() }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.value !== undefined && { value: new Prisma.Decimal(dto.value) }),
        ...(dto.usageLimit !== undefined && { usageLimit: dto.usageLimit }),
        ...(dto.minPurchase !== undefined && {
          minPurchase: new Prisma.Decimal(dto.minPurchase),
        }),
        ...(dto.validFrom !== undefined && { validFrom: new Date(dto.validFrom) }),
        ...(dto.validTo !== undefined && { validTo: new Date(dto.validTo) }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async deleteCode(tenantId: string, id: string): Promise<{ success: boolean }> {
    await this.getCode(tenantId, id);
    // Soft delete — set isActive=false
    await this.prisma.promoCode.update({
      where: { id, tenantId },
      data: { isActive: false },
    });
    this.logger.log('PromoCode soft-deleted', { id, tenantId });
    return { success: true };
  }

  async validateCode(
    tenantId: string,
    dto: ValidateCodeDto,
  ): Promise<ValidateResult> {
    const now = new Date();
    const promoCode = await this.prisma.promoCode.findUnique({
      where: { tenantId_code: { tenantId, code: dto.code.trim().toUpperCase() } },
    });

    if (!promoCode) return { valid: false, discount: 0, type: null, message: 'Promo kod topilmadi' };
    if (!promoCode.isActive) return { valid: false, discount: 0, type: null, message: 'Promo kod faol emas' };
    if (promoCode.validFrom > now) return { valid: false, discount: 0, type: null, message: 'Promo kod hali kuchga kirmagan' };
    if (promoCode.validTo && promoCode.validTo < now) return { valid: false, discount: 0, type: null, message: 'Promo kod muddati tugagan' };
    if (promoCode.usageLimit > 0 && promoCode.usageCount >= promoCode.usageLimit) {
      return { valid: false, discount: 0, type: null, message: 'Promo kod foydalanish limiti tugagan' };
    }
    if (dto.purchaseAmount < Number(promoCode.minPurchase)) {
      return {
        valid: false,
        discount: 0,
        type: null,
        message: `Minimal xarid summasi: ${Number(promoCode.minPurchase).toLocaleString()} so'm`,
      };
    }

    const discount =
      promoCode.type === PromoType.PERCENT
        ? Math.round((dto.purchaseAmount * Number(promoCode.value)) / 100)
        : Math.min(Number(promoCode.value), dto.purchaseAmount);

    return { valid: true, discount, type: promoCode.type, message: 'Promo kod qabul qilindi' };
  }

  async applyCode(tenantId: string, dto: ValidateCodeDto): Promise<ValidateResult> {
    const result = await this.validateCode(tenantId, dto);
    if (!result.valid) return result;

    // Increment usageCount atomically
    await this.prisma.promoCode.update({
      where: { tenantId_code: { tenantId, code: dto.code.trim().toUpperCase() } },
      data: { usageCount: { increment: 1 } },
    });

    this.logger.log('PromoCode applied', { code: dto.code, tenantId });
    return result;
  }
}
