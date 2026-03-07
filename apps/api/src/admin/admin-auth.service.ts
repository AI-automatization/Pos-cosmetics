import {
  Injectable,
  Logger,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AdminLoginDto, AdminCreateDto } from './dto/admin-login.dto';

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

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Super Admin tizimga kirishi.
   * JWT payload: { sub, tenantId: null, role: SUPER_ADMIN, isAdmin: true }
   */
  async login(dto: AdminLoginDto) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email: dto.email },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Email yoki parol noto\'g\'ri');
    }

    const passwordValid = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!passwordValid) {
      this.logger.warn(`Failed admin login attempt: ${dto.email}`);
      throw new UnauthorizedException('Email yoki parol noto\'g\'ri');
    }

    const payload = {
      sub: admin.id,
      tenantId: null,
      role: admin.role,
      branchId: null,
      isAdmin: true,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES') ?? '15m',
    } as Parameters<typeof this.jwtService.signAsync>[1]);

    this.logger.log(`Admin login: ${admin.email} (${admin.role})`);

    return {
      accessToken,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  /**
   * Yangi Super Admin yaratish (faqat CLI yoki birinchi setup uchun).
   * Mavjud admin token bilan chaqiriladi.
   */
  /**
   * Bootstrap: birinchi Super Admin yaratish.
   * Faqat admin_users jadvali bo'sh bo'lsa ishlaydi.
   * X-Bootstrap-Secret header: ADMIN_BOOTSTRAP_SECRET env var bilan mos kelishi shart.
   */
  async bootstrapAdmin(dto: AdminCreateDto, secret: string) {
    const expected = this.config.get<string>('ADMIN_BOOTSTRAP_SECRET');
    if (!expected || secret !== expected) {
      throw new ForbiddenException('Bootstrap secret noto\'g\'ri');
    }

    const count = await this.prisma.adminUser.count();
    if (count > 0) {
      throw new ForbiddenException('Admin allaqachon mavjud. Bootstrap faqat bir marta ishlaydi.');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const admin = await this.prisma.adminUser.create({
      data: { name: dto.name, email: dto.email, passwordHash, role: 'SUPER_ADMIN' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    this.logger.log(`Bootstrap: birinchi Super Admin yaratildi: ${admin.email}`);
    return admin;
  }

  async createAdmin(dto: AdminCreateDto) {
    const existing = await this.prisma.adminUser.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException(`${dto.email} allaqachon ro'yxatdan o'tgan`);
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const admin = await this.prisma.adminUser.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: 'SUPER_ADMIN',
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    this.logger.log(`New admin created: ${admin.email}`);
    return admin;
  }

  /**
   * Barcha tenantlar ro'yxati (Super Admin uchun).
   */
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

  /**
   * Bir tenant haqida to'liq ma'lumot.
   */
  async getTenantDetails(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        users: {
          select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
        },
        branches: { select: { id: true, name: true, isActive: true } },
        _count: { select: { orders: true, products: true } },
      },
    });

    if (!tenant) {
      throw new UnauthorizedException('Tenant topilmadi');
    }

    return tenant;
  }

  /**
   * Tenant aktivlashtirish/o'chirish.
   */
  async toggleTenantActive(tenantId: string, isActive: boolean) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: { isActive },
      select: { id: true, name: true, slug: true, isActive: true },
    });
  }

  // ─── T-058: Tenant Impersonation ──────────────────────────────────────────

  /**
   * Super Admin ixtiyoriy tenant OWNER sifatida vaqtinchalik token oladi.
   * Token: 1 soat, isImpersonated: true flag bilan.
   * Barcha impersonation audit_logs ga yoziladi.
   */
  async impersonateTenant(tenantId: string, adminId: string, adminEmail: string) {
    const owner = await this.prisma.user.findFirst({
      where: { tenantId, role: 'OWNER', isActive: true },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    if (!owner) {
      throw new NotFoundException(`Tenant ${tenantId} da active OWNER topilmadi`);
    }

    const payload = {
      sub: owner.id,
      tenantId,
      role: owner.role,
      branchId: null,
      isImpersonated: true,
      impersonatedBy: adminId,
    };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
    } as Parameters<typeof this.jwtService.signAsync>[1]);

    // Audit log — kimligini va qachon ekanini yozamiz
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: owner.id,
        action: 'ADMIN_IMPERSONATION',
        entityType: 'Tenant',
        entityId: tenantId,
        newData: { adminId, adminEmail, impersonatedUserId: owner.id },
      },
    });

    this.logger.warn(`IMPERSONATION: admin=${adminEmail} → tenant=${tenantId} owner=${owner.email}`);

    return {
      accessToken: token,
      expiresIn: 3600,
      impersonatedAs: {
        userId: owner.id,
        email: owner.email,
        tenantId,
      },
      warning: 'This is an impersonation token. All actions are logged.',
    };
  }

  // ─── T-059: Tenant Provisioning Wizard ────────────────────────────────────

  /**
   * Yangi tenant uchun one-click setup:
   * 1. Tenant + slug
   * 2. OWNER user + temp password
   * 3. Default branch
   * 4. Seed categories (Kosmetika)
   * 5. Default units
   */
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

    const tempPassword = randomBytes(6).toString('hex'); // 12 belgili hex
    const passwordHash = await bcrypt.hash(tempPassword, BCRYPT_ROUNDS);

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Tenant
      const tenant = await tx.tenant.create({
        data: { name: dto.tenantName, slug },
      });

      // 2. Owner user
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

      // 3. Default branch
      const branch = await tx.branch.create({
        data: {
          tenantId: tenant.id,
          name: dto.branchName ?? 'Asosiy filial',
          isActive: true,
        },
      });

      // 4. Seed categories
      await tx.category.createMany({
        data: DEFAULT_CATEGORIES.map((name, i) => ({
          tenantId: tenant.id,
          name,
          sortOrder: i,
        })),
      });

      // 5. Default units
      await tx.unit.createMany({
        data: DEFAULT_UNITS.map((u) => ({
          tenantId: tenant.id,
          name: u.name,
          shortName: u.shortName,
        })),
      });

      return { tenant, owner, branch };
    });

    this.logger.log(`Tenant provisioned: ${result.tenant.slug} | owner: ${result.owner.email}`);

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
        tempPassword, // frontend da ko'rsatiladi, bir martali
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
}
