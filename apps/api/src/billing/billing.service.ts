import {
  Injectable,
  Logger,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const GRACE_PERIOD_DAYS = 3;

export interface UsageLimits {
  maxBranches: number;
  maxProducts: number;
  maxUsers: number;
  features: string[];
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── PLANLAR ──────────────────────────────────────────────────

  async getPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getPlanBySlug(slug: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { slug } });
    if (!plan) throw new NotFoundException(`Plan "${slug}" not found`);
    return plan;
  }

  // ─── TENANT SUBSCRIPTION ──────────────────────────────────────

  async getTenantSubscription(tenantId: string) {
    const sub = await this.prisma.tenantSubscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (!sub) {
      // Yangi tenant — default Free Trial yaratish
      return this.startTrial(tenantId);
    }

    return sub;
  }

  async startTrial(tenantId: string) {
    // Basic plan mavjudligini tekshirish
    const basicPlan = await this.prisma.subscriptionPlan.findFirst({
      where: { slug: 'basic' },
    });

    const freePlan = await this.prisma.subscriptionPlan.findFirst({
      where: { slug: 'free' },
      orderBy: { sortOrder: 'asc' },
    }) ?? basicPlan;

    if (!freePlan) {
      this.logger.warn(`[Billing] No default plan found for trial, tenant=${tenantId}`);
      return null;
    }

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + freePlan.trialDays);

    return this.prisma.tenantSubscription.upsert({
      where: { tenantId },
      create: {
        tenantId,
        planId: freePlan.id,
        status: 'TRIAL',
        trialEndsAt,
        expiresAt: trialEndsAt,
      },
      update: {},
      include: { plan: true },
    });
  }

  async upgradePlan(tenantId: string, planSlug: string, months = 1) {
    const plan = await this.getPlanBySlug(planSlug);

    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + months);

    const sub = await this.prisma.tenantSubscription.upsert({
      where: { tenantId },
      create: {
        tenantId,
        planId: plan.id,
        status: 'ACTIVE',
        startedAt: now,
        expiresAt,
      },
      update: {
        planId: plan.id,
        status: 'ACTIVE',
        expiresAt,
        cancelledAt: null,
      },
      include: { plan: true },
    });

    this.logger.log(`[Billing] Tenant ${tenantId} upgraded to ${plan.name} (expires ${expiresAt.toISOString().slice(0, 10)})`);
    return sub;
  }

  async cancelSubscription(tenantId: string) {
    const sub = await this.prisma.tenantSubscription.findUnique({ where: { tenantId } });
    if (!sub) throw new NotFoundException('Subscription not found');

    return this.prisma.tenantSubscription.update({
      where: { tenantId },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
      include: { plan: true },
    });
  }

  // ─── USAGE LIMITS CHECK ───────────────────────────────────────

  async getLimits(tenantId: string): Promise<UsageLimits> {
    const sub = await this.getTenantSubscription(tenantId);
    if (!sub || !sub.plan) {
      // Fallback: minimal limitlar
      return { maxBranches: 1, maxProducts: 100, maxUsers: 2, features: [] };
    }

    return {
      maxBranches: sub.plan.maxBranches,
      maxProducts: sub.plan.maxProducts,
      maxUsers: sub.plan.maxUsers,
      features: sub.plan.features as string[],
    };
  }

  async checkBranchLimit(tenantId: string) {
    const limits = await this.getLimits(tenantId);
    if (limits.maxBranches === -1) return; // unlimited

    const count = await this.prisma.branch.count({ where: { tenantId, isActive: true } });
    if (count >= limits.maxBranches) {
      throw new ForbiddenException(
        `Tarif limiti: maksimal ${limits.maxBranches} ta filial. Rejani yangilang.`,
      );
    }
  }

  async checkProductLimit(tenantId: string) {
    const limits = await this.getLimits(tenantId);
    if (limits.maxProducts === -1) return;

    const count = await this.prisma.product.count({ where: { tenantId, deletedAt: null } });
    if (count >= limits.maxProducts) {
      throw new ForbiddenException(
        `Tarif limiti: maksimal ${limits.maxProducts} ta mahsulot. Rejani yangilang.`,
      );
    }
  }

  async checkUserLimit(tenantId: string) {
    const limits = await this.getLimits(tenantId);
    if (limits.maxUsers === -1) return;

    const count = await this.prisma.user.count({ where: { tenantId, isActive: true } });
    if (count >= limits.maxUsers) {
      throw new ForbiddenException(
        `Tarif limiti: maksimal ${limits.maxUsers} ta foydalanuvchi. Rejani yangilang.`,
      );
    }
  }

  // ─── SUBSCRIPTION STATUS CHECK ────────────────────────────────
  // Cron dan kundalik ishlatiladi

  async checkAndUpdateExpiredSubscriptions() {
    const now = new Date();

    // TRIAL → EXPIRED
    const expiredTrials = await this.prisma.tenantSubscription.updateMany({
      where: {
        status: 'TRIAL',
        trialEndsAt: { lt: now },
      },
      data: { status: 'EXPIRED' },
    });

    // ACTIVE → PAST_DUE (expiresAt o'tgan)
    const gracePeriodEnd = new Date();
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() - GRACE_PERIOD_DAYS);

    const pastDue = await this.prisma.tenantSubscription.updateMany({
      where: {
        status: 'ACTIVE',
        expiresAt: { lt: now },
      },
      data: {
        status: 'PAST_DUE',
        gracePeriodEndsAt: new Date(now.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000),
      },
    });

    // PAST_DUE → EXPIRED (grace period tugagan)
    const expired = await this.prisma.tenantSubscription.updateMany({
      where: {
        status: 'PAST_DUE',
        gracePeriodEndsAt: { lt: now },
      },
      data: { status: 'EXPIRED' },
    });

    if (expiredTrials.count + pastDue.count + expired.count > 0) {
      this.logger.warn(
        `[Billing] Status updates: ${expiredTrials.count} trials expired, ${pastDue.count} past due, ${expired.count} expired`,
      );
    }

    return { expiredTrials: expiredTrials.count, pastDue: pastDue.count, expired: expired.count };
  }

  // ─── USAGE STATS ──────────────────────────────────────────────

  async getUsageStats(tenantId: string) {
    const [limits, branchCount, productCount, userCount] = await Promise.all([
      this.getLimits(tenantId),
      this.prisma.branch.count({ where: { tenantId, isActive: true } }),
      this.prisma.product.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.user.count({ where: { tenantId, isActive: true } }),
    ]);

    return {
      branches: { used: branchCount, max: limits.maxBranches },
      products: { used: productCount, max: limits.maxProducts },
      users: { used: userCount, max: limits.maxUsers },
      features: limits.features,
    };
  }
}
