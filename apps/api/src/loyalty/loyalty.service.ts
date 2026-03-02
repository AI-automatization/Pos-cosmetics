import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import {
  UpdateLoyaltyConfigDto,
  EarnPointsDto,
  RedeemPointsDto,
  AdjustPointsDto,
} from './dto/loyalty.dto';
import { LoyaltyTxType } from '@prisma/client';

@Injectable()
export class LoyaltyService {
  private readonly logger = new Logger(LoyaltyService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── CONFIG ───────────────────────────────────────────────────

  async getConfig(tenantId: string) {
    const config = await this.prisma.loyaltyConfig.findUnique({
      where: { tenantId },
    });
    if (!config) {
      // Yangi tenant uchun default config avtomatik yaratiladi
      return this.prisma.loyaltyConfig.create({ data: { tenantId } });
    }
    return config;
  }

  async updateConfig(tenantId: string, dto: UpdateLoyaltyConfigDto) {
    return this.prisma.loyaltyConfig.upsert({
      where: { tenantId },
      create: {
        tenantId,
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.earnRate !== undefined && { earnRate: dto.earnRate }),
        ...(dto.redeemRate !== undefined && { redeemRate: dto.redeemRate }),
        ...(dto.minRedeem !== undefined && { minRedeem: dto.minRedeem }),
      },
      update: {
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.earnRate !== undefined && { earnRate: dto.earnRate }),
        ...(dto.redeemRate !== undefined && { redeemRate: dto.redeemRate }),
        ...(dto.minRedeem !== undefined && { minRedeem: dto.minRedeem }),
      },
    });
  }

  // ─── ACCOUNT ──────────────────────────────────────────────────

  async getAccount(tenantId: string, customerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, tenantId },
    });
    if (!customer) throw new NotFoundException(`Customer ${customerId} not found`);

    const account = await this.getOrCreateAccount(tenantId, customerId);
    const transactions = await this.prisma.loyaltyTransaction.findMany({
      where: { accountId: account.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return { ...account, transactions };
  }

  // ─── EARN ─────────────────────────────────────────────────────

  async earnPoints(tenantId: string, dto: EarnPointsDto) {
    const config = await this.getConfig(tenantId);
    if (!config.isActive) return { pointsEarned: 0, message: 'Loyalty faol emas' };

    const pointsEarned = Math.floor(dto.orderTotal / Number(config.earnRate));
    if (pointsEarned <= 0) return { pointsEarned: 0 };

    const account = await this.getOrCreateAccount(tenantId, dto.customerId);

    await this.prisma.$transaction([
      this.prisma.loyaltyAccount.update({
        where: { id: account.id },
        data: { points: { increment: pointsEarned } },
      }),
      this.prisma.loyaltyTransaction.create({
        data: {
          tenantId,
          accountId: account.id,
          orderId: dto.orderId,
          type: LoyaltyTxType.EARN,
          points: pointsEarned,
          note: `Xarid uchun ball: ${dto.orderTotal.toLocaleString()} so'm`,
        },
      }),
    ]);

    this.logger.log(
      `Loyalty: +${pointsEarned} ball — customer ${dto.customerId}`,
      { tenantId },
    );
    return { pointsEarned, newBalance: account.points + pointsEarned };
  }

  // ─── REDEEM ───────────────────────────────────────────────────

  async redeemPoints(tenantId: string, dto: RedeemPointsDto) {
    const config = await this.getConfig(tenantId);
    if (!config.isActive)
      throw new BadRequestException('Loyalty dasturi faol emas');

    if (dto.points < config.minRedeem)
      throw new BadRequestException(
        `Minimal yechish: ${config.minRedeem} ball (so'ralgan: ${dto.points})`,
      );

    const account = await this.getOrCreateAccount(tenantId, dto.customerId);
    if (account.points < dto.points)
      throw new BadRequestException(
        `Yetarli ball yo'q: ${account.points} ball mavjud, ${dto.points} so'raldi`,
      );

    const discountAmount = dto.points * Number(config.redeemRate);

    await this.prisma.$transaction([
      this.prisma.loyaltyAccount.update({
        where: { id: account.id },
        data: { points: { decrement: dto.points } },
      }),
      this.prisma.loyaltyTransaction.create({
        data: {
          tenantId,
          accountId: account.id,
          type: LoyaltyTxType.REDEEM,
          points: -dto.points,
          note: `${dto.points} ball → ${discountAmount.toLocaleString()} so'm chegirma`,
        },
      }),
    ]);

    this.logger.log(
      `Loyalty: -${dto.points} ball yechildi, chegirma ${discountAmount} so'm`,
      { tenantId },
    );
    return {
      pointsRedeemed: dto.points,
      discountAmount,
      newBalance: account.points - dto.points,
    };
  }

  // ─── MANUAL ADJUST ────────────────────────────────────────────

  async adjustPoints(tenantId: string, dto: AdjustPointsDto) {
    const account = await this.getOrCreateAccount(tenantId, dto.customerId);
    const newBalance = account.points + dto.points;
    if (newBalance < 0)
      throw new BadRequestException("Ball manfiy bo'la olmaydi");

    await this.prisma.$transaction([
      this.prisma.loyaltyAccount.update({
        where: { id: account.id },
        data: { points: { increment: dto.points } },
      }),
      this.prisma.loyaltyTransaction.create({
        data: {
          tenantId,
          accountId: account.id,
          type: LoyaltyTxType.ADJUSTMENT,
          points: dto.points,
          note: dto.note ?? 'Admin tomonidan tuzatish',
        },
      }),
    ]);

    this.logger.log(
      `Loyalty: ${dto.points > 0 ? '+' : ''}${dto.points} ball tuzatish — customer ${dto.customerId}`,
      { tenantId },
    );
    return { adjusted: dto.points, newBalance };
  }

  // ─── EVENT LISTENER ───────────────────────────────────────────

  @OnEvent('sale.created')
  async handleSaleCreated(payload: {
    tenantId: string;
    orderId: string;
    customerId?: string;
    total: number;
  }) {
    if (!payload.customerId) return;

    try {
      await this.earnPoints(payload.tenantId, {
        customerId: payload.customerId,
        orderId: payload.orderId,
        orderTotal: payload.total,
      });
    } catch (err) {
      // Sale hech qachon block qilinmaydi
      this.logger.warn('Loyalty earn xatosi (bloklash yo\'q)', {
        error: (err as Error).message,
        orderId: payload.orderId,
      });
    }
  }

  // ─── PRIVATE ──────────────────────────────────────────────────

  private async getOrCreateAccount(tenantId: string, customerId: string) {
    const existing = await this.prisma.loyaltyAccount.findUnique({
      where: { customerId },
    });
    if (existing) return existing;

    return this.prisma.loyaltyAccount.create({
      data: { tenantId, customerId, points: 0 },
    });
  }
}
