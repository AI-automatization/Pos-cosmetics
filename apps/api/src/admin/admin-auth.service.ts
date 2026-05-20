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
import { timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AdminLoginDto, AdminCreateDto } from './dto/admin-login.dto';
import { AdminTenantHelper } from './admin-tenant.helper';
import { AdminSubscriptionHelper } from './admin-subscription.helper';

const BCRYPT_ROUNDS = 12;
const ADMIN_MAX_ATTEMPTS = 5;
const ADMIN_LOCKOUT_MS = 15 * 60 * 1000; // 15 min

interface AdminLockEntry {
  attempts: number;
  lockedUntil: number | null;
}

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);
  private readonly lockMap = new Map<string, AdminLockEntry>();

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
    this.checkAdminLock(dto.email);

    const admin = await this.prisma.adminUser.findUnique({
      where: { email: dto.email },
    });

    if (!admin || !admin.isActive) {
      this.recordAdminFailure(dto.email);
      throw new UnauthorizedException("Email yoki parol noto'g'ri");
    }

    const passwordValid = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!passwordValid) {
      this.recordAdminFailure(dto.email);
      this.logger.warn(`Failed admin login attempt: ${dto.email}`);
      throw new UnauthorizedException("Email yoki parol noto'g'ri");
    }

    this.lockMap.delete(dto.email);

    const payload = {
      sub: admin.id,
      tenantId: null,
      role: admin.role,
      branchId: null,
      isAdmin: true,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '30m',
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
    if (!expected || !this.secretsEqual(secret, expected)) {
      throw new UnauthorizedException("Noto'g'ri bootstrap secret");
    }
    return this.createAdmin(dto);
  }

  async resetUserPassword(email: string, newPassword: string, secret: string) {
    const expected = this.config.get<string>('ADMIN_BOOTSTRAP_SECRET');
    if (!expected || !this.secretsEqual(secret, expected)) {
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
      expiresIn: '30m',
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

  resetTenantUserPassword(tenantId: string, userId: string, newPassword: string) {
    return this.subscriptionHelper.resetTenantUserPassword(tenantId, userId, newPassword);
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

  // ─── ZZONE CONFIG ────────────────────────────────────────────────────

  async getZzoneConfig(tenantId: string) {
    const config = await this.prisma.integrationConfig.findUnique({
      where: { tenantId_provider: { tenantId, provider: 'ZZONE' } },
    });

    if (!config) return { exists: false, isActive: false, token: '', productCount: 0 };

    const zzoneConfig = (config.config ?? {}) as { token?: string; productMappings?: Record<string, string> };
    const productCount = Object.keys(zzoneConfig.productMappings ?? {}).length;

    return {
      exists: true,
      isActive: config.isActive,
      token: zzoneConfig.token ? '***' + zzoneConfig.token.slice(-4) : '',
      productCount,
      createdAt: config.createdAt,
    };
  }

  async updateZzoneConfig(tenantId: string, data: { token?: string; isActive?: boolean }) {
    const config = await this.prisma.integrationConfig.findUnique({
      where: { tenantId_provider: { tenantId, provider: 'ZZONE' } },
    });

    if (!config) {
      // Create if doesn't exist
      await this.prisma.integrationConfig.create({
        data: {
          tenantId,
          provider: 'ZZONE',
          config: { token: data.token ?? '', productMappings: {} },
          isActive: data.isActive ?? false,
        },
      });
      return { success: true, created: true };
    }

    const currentConfig = (config.config ?? {}) as Record<string, unknown>;
    if (data.token !== undefined) currentConfig.token = data.token;

    await this.prisma.integrationConfig.update({
      where: { id: config.id },
      data: {
        config: currentConfig as object,
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return { success: true, updated: true };
  }

  async triggerZzoneSync(tenantId: string) {
    const products = await this.prisma.product.findMany({
      where: { tenantId, isActive: true, deletedAt: null },
      select: { id: true, name: true },
    });

    // Note: actual sync happens via ZzoneSyncListener on product events
    return {
      success: true,
      message: `Sync triggered for ${products.length} products`,
      productCount: products.length,
    };
  }

  // ─── Security helpers ──────────────────────────────────────────────────

  private secretsEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  }

  private checkAdminLock(email: string): void {
    const entry = this.lockMap.get(email);
    if (!entry?.lockedUntil) return;
    if (Date.now() < entry.lockedUntil) {
      const remainMin = Math.ceil((entry.lockedUntil - Date.now()) / 60000);
      throw new UnauthorizedException(
        `Admin hisob ${remainMin} daqiqa bloklangan. Keyinroq urinib ko'ring.`,
      );
    }
    this.lockMap.delete(email);
  }

  private recordAdminFailure(email: string): void {
    const entry = this.lockMap.get(email) ?? { attempts: 0, lockedUntil: null };
    entry.attempts += 1;
    if (entry.attempts >= ADMIN_MAX_ATTEMPTS) {
      entry.lockedUntil = Date.now() + ADMIN_LOCKOUT_MS;
      this.logger.warn(`Admin locked for 15min: ${email} (${entry.attempts} failed attempts)`);
    }
    this.lockMap.set(email, entry);
  }
}
