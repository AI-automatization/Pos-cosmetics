import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailNotifyService } from '../notifications/email-notify.service';

const BCRYPT_ROUNDS = 12;

// T-059: Kosmetika do'koni uchun standart kategoriyalar
const DEFAULT_CATEGORIES = [
  'Terini parvarish',
  'Soch mahsulotlari',
  'Makiyaj',
  'Atir va parfyumeriya',
  'Tirnoq parvarishi',
  'Tana parvarishi',
  'Aksessuarlar',
];

// T-059: Standart o'lchov birliklari
const DEFAULT_UNITS = [
  { name: 'Dona', shortName: 'don' },
  { name: 'Quti', shortName: 'qut' },
  { name: 'Set', shortName: 'set' },
  { name: 'Millilitr', shortName: 'ml' },
  { name: 'Gram', shortName: 'g' },
];

const APP_LOGIN_URL = 'https://web-production-5b0b7.up.railway.app/login';

@Injectable()
export class AdminTenantHelper {
  private readonly logger = new Logger(AdminTenantHelper.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailNotify: EmailNotifyService,
  ) {}

  async getAllTenants(opts: { page?: number; limit?: number; search?: string }) {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = opts.search
      ? {
          OR: [
            { name: { contains: opts.search, mode: 'insensitive' as const } },
            { slug: { contains: opts.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [total, items] = await this.prisma.$transaction([
      this.prisma.tenant.count({ where }),
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          createdAt: true,
          _count: { select: { users: true, orders: true } },
        },
      }),
    ]);

    return { items, total, page, limit };
  }

  async getTenantDetails(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
          },
        },
        branches: { select: { id: true, name: true, isActive: true } },
        _count: { select: { orders: true, products: true } },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant topilmadi');
    }

    return tenant;
  }

  async toggleTenantActive(tenantId: string, isActive: boolean) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: { isActive },
      select: { id: true, name: true, slug: true, isActive: true },
    });
  }

  async provisionTenant(dto: {
    tenantName: string;
    ownerEmail: string;
    ownerFirstName: string;
    ownerLastName: string;
    branchName?: string;
  }) {
    const slug = dto.tenantName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 50);

    const existing = await this.prisma.tenant.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Slug "${slug}" allaqachon band`);
    }

    const tempPassword = randomBytes(6).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, BCRYPT_ROUNDS);

    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name: dto.tenantName, slug },
      });

      const owner = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: dto.ownerEmail,
          passwordHash,
          firstName: dto.ownerFirstName,
          lastName: dto.ownerLastName,
          role: 'OWNER',
        },
        select: { id: true, email: true, firstName: true, lastName: true, role: true },
      });

      const branch = await tx.branch.create({
        data: {
          tenantId: tenant.id,
          name: dto.branchName ?? 'Asosiy filial',
          isActive: true,
        },
      });

      await tx.category.createMany({
        data: DEFAULT_CATEGORIES.map((name, i) => ({
          tenantId: tenant.id,
          name,
          sortOrder: i,
        })),
      });

      await tx.unit.createMany({
        data: DEFAULT_UNITS.map((u) => ({
          tenantId: tenant.id,
          name: u.name,
          shortName: u.shortName,
        })),
      });

      return { tenant, owner, branch };
    });

    this.logger.log(
      `Tenant provisioned: ${result.tenant.slug} | owner: ${result.owner.email}`,
    );

    return {
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        slug: result.tenant.slug,
      },
      owner: {
        id: result.owner.id,
        email: result.owner.email,
        firstName: result.owner.firstName,
        lastName: result.owner.lastName,
        tempPassword,
      },
      branch: {
        id: result.branch.id,
        name: result.branch.name,
      },
      seeded: {
        categories: DEFAULT_CATEGORIES.length,
        units: DEFAULT_UNITS.length,
      },
    };
  }

  async createTenantFull(dto: {
    tenantName: string;
    slug: string;
    phone?: string;
    city?: string;
    businessType?: string;
    legalName?: string;
    inn?: string;
    stir?: string;
    oked?: string;
    legalAddress?: string;
    ownerFirstName: string;
    ownerLastName: string;
    ownerEmail: string;
    ownerPhone?: string;
    ownerPassword?: string;
    planSlug?: string;
    trialDays?: number;
    branchName?: string;
  }) {
    const existing = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException(`Slug "${dto.slug}" allaqachon band`);
    }

    const tempPassword = dto.ownerPassword || randomBytes(6).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, BCRYPT_ROUNDS);

    const planSlug = dto.planSlug ?? 'free';
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { slug: planSlug },
    });

    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.tenantName,
          slug: dto.slug,
          inn: dto.inn,
          stir: dto.stir,
          oked: dto.oked,
          legalName: dto.legalName,
          legalAddress: dto.legalAddress,
        },
      });

      const owner = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: dto.ownerEmail,
          passwordHash,
          firstName: dto.ownerFirstName,
          lastName: dto.ownerLastName,
          role: 'OWNER',
        },
        select: { id: true, email: true, firstName: true, lastName: true, role: true },
      });

      const branch = await tx.branch.create({
        data: {
          tenantId: tenant.id,
          name: dto.branchName ?? 'Asosiy filial',
          isActive: true,
        },
      });

      await tx.category.createMany({
        data: DEFAULT_CATEGORIES.map((name, i) => ({
          tenantId: tenant.id,
          name,
          sortOrder: i,
        })),
      });

      await tx.unit.createMany({
        data: DEFAULT_UNITS.map((u) => ({
          tenantId: tenant.id,
          name: u.name,
          shortName: u.shortName,
        })),
      });

      let subscription = null;
      if (plan) {
        const trialDays = dto.trialDays ?? plan.trialDays;
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

        subscription = await tx.tenantSubscription.create({
          data: {
            tenantId: tenant.id,
            planId: plan.id,
            status: 'TRIAL',
            trialEndsAt,
            expiresAt: trialEndsAt,
          },
        });
      }

      await tx.tenantSettings.create({
        data: {
          tenantId: tenant.id,
          currency: 'UZS',
          language: 'uz',
          timezone: 'Asia/Tashkent',
        },
      });

      return { tenant, owner, branch, subscription };
    });

    this.logger.log(
      `Tenant FULL created: ${result.tenant.slug} | owner: ${result.owner.email}`,
    );

    const emailSent = await this.emailNotify.sendOwnerWelcome({
      email: result.owner.email,
      firstName: result.owner.firstName ?? '',
      lastName: result.owner.lastName ?? '',
      password: tempPassword,
      slug: result.tenant.slug,
      tenantName: result.tenant.name,
      loginUrl: APP_LOGIN_URL,
    });

    if (emailSent) {
      this.logger.log(`Welcome email sent to ${result.owner.email}`);
    } else {
      this.logger.warn(
        `Welcome email NOT sent to ${result.owner.email} — SMTP not configured?`,
      );
    }

    return {
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        slug: result.tenant.slug,
      },
      owner: {
        id: result.owner.id,
        email: result.owner.email,
        firstName: result.owner.firstName,
        lastName: result.owner.lastName,
        tempPassword,
      },
      branch: { id: result.branch.id, name: result.branch.name },
      subscription: result.subscription
        ? {
            id: result.subscription.id,
            status: result.subscription.status,
            planSlug,
            expiresAt: result.subscription.expiresAt,
          }
        : null,
      emailSent,
    };
  }

  async editTenant(tenantId: string, data: Record<string, unknown>) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant topilmadi');

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: data as { name?: string; slug?: string; isActive?: boolean },
    });

    this.logger.log(`Tenant edited: ${updated.slug}`);
    return updated;
  }

  async deleteTenant(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant topilmadi');

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { isActive: false },
    });

    this.logger.warn(`Tenant DELETED (soft): ${updated.slug}`);
    return { deleted: true, id: tenantId, name: updated.name };
  }

}
