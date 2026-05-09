import {
  Injectable,
  Logger,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AdminLoginDto, AdminCreateDto } from './dto/admin-login.dto';
import { AdminTenantHelper } from './admin-tenant.helper';
import { AdminSubscriptionHelper } from './admin-subscription.helper';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly tenantHelper: AdminTenantHelper,
    private readonly subscriptionHelper: AdminSubscriptionHelper,
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
      throw new UnauthorizedException("Email yoki parol noto'g'ri");
    }

    const passwordValid = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!passwordValid) {
      this.logger.warn(`Failed admin login attempt: ${dto.email}`);
      throw new UnauthorizedException("Email yoki parol noto'g'ri");
    }

    const payload = {
      sub: admin.id,
      tenantId: null,
      role: admin.role,
      branchId: null,
      isAdmin: true,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '24h',
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
   */
  async bootstrap(dto: AdminCreateDto, secret: string) {
    const expected = this.config.get<string>('ADMIN_BOOTSTRAP_SECRET');
    if (!expected || secret !== expected) {
      throw new UnauthorizedException("Noto'g'ri bootstrap secret");
    }
    return this.createAdmin(dto);
  }

  async resetUserPassword(email: string, newPassword: string, secret: string) {
    const expected = this.config.get<string>('ADMIN_BOOTSTRAP_SECRET');
    if (!expected || secret !== expected) {
      throw new UnauthorizedException("Noto'g'ri bootstrap secret");
    }

    const user = await this.prisma.user.findFirst({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User topilmadi: ${email}`);
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    this.logger.log(`Password reset for user: ${email}`);
    return { success: true, message: `${email} parol yangilandi` };
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

  // ─── T-058: Tenant Impersonation ──────────────────────────────

  async impersonateTenant(tenantId: string, adminId: string, adminEmail: string) {
    const owner = await this.prisma.user.findFirst({
      where: { tenantId, role: 'OWNER', isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!owner) {
      throw new NotFoundException(
        `Tenant ${tenantId} da active OWNER topilmadi`,
      );
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

    this.logger.warn(
      `IMPERSONATION: admin=${adminEmail} → tenant=${tenantId} owner=${owner.email}`,
    );

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

  // ─── Delegated to AdminTenantHelper ───────────────────────────

  getAllTenants(opts: { page?: number; limit?: number; search?: string }) {
    return this.tenantHelper.getAllTenants(opts);
  }

  getTenantDetails(tenantId: string) {
    return this.tenantHelper.getTenantDetails(tenantId);
  }

  toggleTenantActive(tenantId: string, isActive: boolean) {
    return this.tenantHelper.toggleTenantActive(tenantId, isActive);
  }

  provisionTenant(dto: {
    tenantName: string;
    ownerEmail: string;
    ownerFirstName: string;
    ownerLastName: string;
    branchName?: string;
  }) {
    return this.tenantHelper.provisionTenant(dto);
  }

  createTenantFull(dto: {
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
    return this.tenantHelper.createTenantFull(dto);
  }

  editTenant(tenantId: string, data: Record<string, unknown>) {
    return this.tenantHelper.editTenant(tenantId, data);
  }

  deleteTenant(tenantId: string) {
    return this.tenantHelper.deleteTenant(tenantId);
  }

  getTenantUsers(tenantId: string) {
    return this.subscriptionHelper.getTenantUsers(tenantId);
  }

  addOwnerToTenant(
    tenantId: string,
    dto: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      password?: string;
    },
  ) {
    return this.subscriptionHelper.addOwnerToTenant(tenantId, dto);
  }

  getTenantUsage(tenantId: string) {
    return this.subscriptionHelper.getTenantUsage(tenantId);
  }

  getTenantSubscription(tenantId: string) {
    return this.subscriptionHelper.getTenantSubscription(tenantId);
  }

  overrideSubscription(
    tenantId: string,
    dto: { planSlug?: string; expiresAt?: string; status?: string },
  ) {
    return this.subscriptionHelper.overrideSubscription(tenantId, dto);
  }

  getTenantAuditLog(tenantId: string, opts: { page: number; limit: number }) {
    return this.subscriptionHelper.getTenantAuditLog(tenantId, opts);
  }
}
