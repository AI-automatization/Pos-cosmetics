import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AdminSubscriptionHelper {
  private readonly logger = new Logger(AdminSubscriptionHelper.name);

  constructor(private readonly prisma: PrismaService) {}

  async getTenantUsage(tenantId: string) {
    const [branchCount, productCount, userCount, subscription] =
      await this.prisma.$transaction([
        this.prisma.branch.count({ where: { tenantId, isActive: true } }),
        this.prisma.product.count({ where: { tenantId } }),
        this.prisma.user.count({ where: { tenantId, isActive: true } }),
        this.prisma.tenantSubscription.findUnique({
          where: { tenantId },
          include: { plan: true },
        }),
      ]);

    const plan = subscription?.plan;
    return {
      branches: { used: branchCount, max: plan?.maxBranches ?? -1 },
      products: { used: productCount, max: plan?.maxProducts ?? -1 },
      users: { used: userCount, max: plan?.maxUsers ?? -1 },
      plan: plan ? { name: plan.name, slug: plan.slug } : null,
      subscriptionStatus: subscription?.status ?? null,
    };
  }

  async getTenantSubscription(tenantId: string) {
    const sub = await this.prisma.tenantSubscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });
    if (!sub) return null;
    return {
      id: sub.id,
      status: sub.status,
      plan: {
        id: sub.plan.id,
        name: sub.plan.name,
        slug: sub.plan.slug,
        priceMonthly: Number(sub.plan.priceMonthly),
      },
      startedAt: sub.startedAt,
      expiresAt: sub.expiresAt,
      trialEndsAt: sub.trialEndsAt,
    };
  }

  async overrideSubscription(
    tenantId: string,
    dto: { planSlug?: string; expiresAt?: string; status?: string },
  ) {
    const sub = await this.prisma.tenantSubscription.findUnique({
      where: { tenantId },
    });
    if (!sub) throw new NotFoundException('Подписка не найдена');

    const updateData: Record<string, unknown> = {};

    if (dto.planSlug) {
      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { slug: dto.planSlug },
      });
      if (!plan) throw new NotFoundException(`План "${dto.planSlug}" не найден`);
      updateData.planId = plan.id;
    }
    if (dto.expiresAt) updateData.expiresAt = new Date(dto.expiresAt);
    if (dto.status) updateData.status = dto.status;

    const updated = await this.prisma.tenantSubscription.update({
      where: { tenantId },
      data: updateData,
      include: { plan: true },
    });

    this.logger.log(`Subscription override: tenant=${tenantId}`, dto);
    return updated;
  }

  async getTenantAuditLog(
    tenantId: string,
    opts: { page: number; limit: number },
  ) {
    const skip = (opts.page - 1) * opts.limit;

    const [total, items] = await this.prisma.$transaction([
      this.prisma.auditLog.count({ where: { tenantId } }),
      this.prisma.auditLog.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: opts.limit,
        select: {
          id: true,
          userId: true,
          action: true,
          entityType: true,
          entityId: true,
          oldData: true,
          newData: true,
          ip: true,
          createdAt: true,
        },
      }),
    ]);

    return { items, total, page: opts.page, limit: opts.limit };
  }

  async getTenantUsers(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        branch: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resetTenantUserPassword(tenantId: string, userId: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
      select: { id: true, email: true },
    });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found in tenant ${tenantId}`);
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    this.logger.log(`Password reset by Super Admin: userId=${userId} tenantId=${tenantId}`);
    return { success: true, userId, email: user.email };
  }

  async addOwnerToTenant(
    tenantId: string,
    dto: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      password?: string;
    },
  ) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant topilmadi');

    const existingUser = await this.prisma.user.findFirst({
      where: { tenantId, email: dto.email },
    });
    if (existingUser) throw new ConflictException(`${dto.email} allaqachon mavjud`);

    const tempPassword = dto.password || randomBytes(6).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, BCRYPT_ROUNDS);

    const owner = await this.prisma.user.create({
      data: {
        tenantId,
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: 'OWNER',
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    this.logger.log(`Owner added to ${tenant.slug}: ${owner.email}`);

    return { owner, tempPassword };
  }
}
