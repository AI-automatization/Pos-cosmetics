import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import {
  TENANT_REGISTERED,
  USER_CREATED,
  USER_DEACTIVATED,
  USER_LOGGED_IN,
  USER_UPDATED,
} from '../events';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateUserDto,
  LoginDto,
  RegisterTenantDto,
  UpdateTenantInfoDto,
  UpdateUserDto,
} from './dto';
import { JwtPayload } from './strategies/jwt.strategy';

const BCRYPT_ROUNDS = 12;

const ROLE_HIERARCHY: Record<UserRole, number> = {
  OWNER: 5,
  ADMIN: 4,
  MANAGER: 3,
  WAREHOUSE: 2.5,
  CASHIER: 2,
  VIEWER: 1,
};

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class IdentityService {
  private readonly logger = new Logger(IdentityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async register(dto: RegisterTenantDto): Promise<AuthTokens> {
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug },
    });

    if (existingTenant) {
      throw new ConflictException('Tenant with this slug already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.tenantName,
          slug: dto.slug,
          // T-079: Soliq ma'lumotlari (ixtiyoriy)
          ...(dto.inn && { inn: dto.inn }),
          ...(dto.legalName && { legalName: dto.legalName }),
          ...(dto.legalAddress && { legalAddress: dto.legalAddress }),
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: UserRole.OWNER,
        },
      });

      return { tenant, user };
    });

    const tokens = await this.generateTokens({
      sub: result.user.id,
      tenantId: result.tenant.id,
      role: UserRole.OWNER,
      branchId: null,
    });

    await this.saveRefreshToken(result.user.id, tokens.refreshToken);

    this.eventEmitter.emit(TENANT_REGISTERED, {
      eventId: randomUUID(),
      eventType: TENANT_REGISTERED,
      aggregateId: result.tenant.id,
      tenantId: result.tenant.id,
      payload: {
        tenantName: result.tenant.name,
        slug: result.tenant.slug,
        ownerEmail: result.user.email,
      },
      occurredAt: new Date(),
    });

    this.logger.log(
      `Tenant registered: ${result.tenant.slug} (${result.tenant.id})`,
    );

    return tokens;
  }

  // ─── LOGIN LOCKOUT CONSTANTS (T-067) ──────────────────────────
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_MINUTES = 15;

  private async checkLock(userId: string): Promise<void> {
    const lock = await this.prisma.userLock.findUnique({ where: { userId } });
    if (lock && lock.lockedUntil > new Date()) {
      const remainMin = Math.ceil((lock.lockedUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(
        `Hisob ${remainMin} daqiqa uchun bloklangan. Keyinroq urinib ko'ring.`,
      );
    }
    // Lock muddati o'tgan bo'lsa — o'chiramiz
    if (lock) {
      await this.prisma.userLock.delete({ where: { userId } }).catch(() => null);
    }
  }

  private async recordAttempt(
    userId: string | null,
    email: string,
    ip: string,
    success: boolean,
  ): Promise<void> {
    try {
      await this.prisma.loginAttempt.create({
        data: { userId, email, ip, success },
      });

      if (!success && userId) {
        // So'nggi 15 daqiqa ichida muvaffaqiyatsiz urinishlar
        const since = new Date(Date.now() - this.LOCKOUT_MINUTES * 60 * 1000);
        const failCount = await this.prisma.loginAttempt.count({
          where: { userId, success: false, createdAt: { gte: since } },
        });

        if (failCount >= this.MAX_FAILED_ATTEMPTS) {
          const lockedUntil = new Date(Date.now() + this.LOCKOUT_MINUTES * 60 * 1000);
          await this.prisma.userLock.upsert({
            where: { userId },
            create: { userId, lockedUntil },
            update: { lockedUntil, lockedAt: new Date() },
          });
          this.logger.warn(`User locked for ${this.LOCKOUT_MINUTES}min: ${email}`);
        }
      }
    } catch {
      // Attempt log xatoligi asosiy loginni to'xtatmaydi
    }
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const ip = 'unknown'; // Controller dan uzatilsa kengaytirish mumkin

    // T-145: email YOKI login (username) bilan kirish
    const loginEmail = dto.email ?? dto.login ?? '';

    // T-372: slug ixtiyoriy — berilsa slug bo'yicha, berilmasa avtomatik aniqlash
    let tenant: { id: string; isActive: boolean; slug: string } | null = null;
    let user: Awaited<ReturnType<typeof this.prisma.user.findUnique>> = null;

    if (dto.slug) {
      // Slug berilgan — oddiy yo'l
      tenant = await this.prisma.tenant.findUnique({
        where: { slug: dto.slug },
        select: { id: true, isActive: true, slug: true },
      });

      if (!tenant || !tenant.isActive) {
        throw new UnauthorizedException('Invalid credentials');
      }

      user = await this.prisma.user.findUnique({
        where: { tenantId_email: { tenantId: tenant.id, email: loginEmail } },
      });
    } else {
      // Slug berilmagan — email bo'yicha avtomatik aniqlash
      const candidates = await this.prisma.user.findMany({
        where: { email: loginEmail, isActive: true },
        include: { tenant: { select: { id: true, isActive: true, slug: true } } },
      });

      const active = candidates.filter((u) => u.tenant.isActive);

      if (active.length === 0) {
        await this.recordAttempt(null, loginEmail, ip, false);
        throw new UnauthorizedException('Invalid credentials');
      }

      if (active.length > 1) {
        // Bir nechta tenant — slug talab qilish
        throw new UnauthorizedException('SLUG_REQUIRED');
      }

      user = active[0]!;
      tenant = active[0]!.tenant;
    }

    if (!user || !user.isActive) {
      await this.recordAttempt(null, loginEmail, ip, false);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Lock tekshirish
    await this.checkLock(user.id);

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      await this.recordAttempt(user.id, loginEmail, ip, false);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Muvaffaqiyatli kirish → attempt log
    await this.recordAttempt(user.id, loginEmail, ip, true);

    // T-145: JWT da hasPosAccess va hasAdminAccess
    const hasPosAccess = ['CASHIER', 'MANAGER', 'OWNER'].includes(user.role);
    const hasAdminAccess = ['OWNER', 'ADMIN', 'MANAGER'].includes(user.role);

    const tokens = await this.generateTokens({
      sub: user.id,
      tenantId: tenant.id,
      role: user.role,
      branchId: null,
      hasPosAccess,
      hasAdminAccess,
    });

    await this.saveRefreshToken(user.id, tokens.refreshToken);

    this.eventEmitter.emit(USER_LOGGED_IN, {
      eventId: randomUUID(),
      eventType: USER_LOGGED_IN,
      aggregateId: user.id,
      tenantId: tenant.id,
      payload: { email: user.email },
      occurredAt: new Date(),
    });

    this.logger.log(`User logged in: ${user.email} (tenant: ${tenant.slug})`);

    return tokens;
  }

  /** T-225: Biometric verify dan keyin userId bo'yicha token yaratish */
  async loginById(userId: string): Promise<AuthTokens> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, tenantId: true, role: true, isActive: true },
    });
    if (!user.isActive) throw new UnauthorizedException('User inactive');
    const tokens = await this.generateTokens({
      sub: user.id, tenantId: user.tenantId, role: user.role,
      branchId: null,
    } as Parameters<typeof this.generateTokens>[0]);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  /** Admin tomonidan foydalanuvchi lockini ochish (T-067) */
  async unlockUser(adminUserId: string, targetUserId: string): Promise<void> {
    await this.prisma.userLock.delete({ where: { userId: targetUserId } }).catch(() => null);
    this.logger.log(`User unlocked by admin: target=${targetUserId}, admin=${adminUserId}`);
  }

  async refreshTokens(dto: { userId: string; refreshToken: string }): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: {
        id: true,
        tenantId: true,
        role: true,
        isActive: true,
        refreshToken: true,
        refreshTokenExp: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!user.refreshToken || !user.refreshTokenExp) {
      throw new UnauthorizedException('No refresh token stored');
    }

    if (new Date() > user.refreshTokenExp) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const isRefreshValid = await bcrypt.compare(
      dto.refreshToken,
      user.refreshToken,
    );

    if (!isRefreshValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      branchId: null,
    });

    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async loginWithSession(
    dto: LoginDto,
    sessionParams: { ip?: string; userAgent?: string; sessionService: { createSession: (p: { userId: string; tenantId: string; ip?: string; userAgent?: string }) => Promise<string> } },
  ): Promise<AuthTokens> {
    const tokens = await this.login(dto);
    // Login muvaffaqiyatli bo'lgandan keyin session yaratish
    // JWT dan userId/tenantId olish uchun tenantni qayta topamiz
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: dto.slug } });
    if (tenant) {
      const loginEmail = dto.email ?? dto.login ?? '';
      const user = await this.prisma.user.findUnique({
        where: { tenantId_email: { tenantId: tenant.id, email: loginEmail } },
        select: { id: true, tenantId: true },
      });
      if (user) {
        sessionParams.sessionService
          .createSession({
            userId: user.id,
            tenantId: user.tenantId,
            ip: sessionParams.ip,
            userAgent: sessionParams.userAgent,
          })
          .catch(() => null);
      }
    }
    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: null,
        refreshTokenExp: null,
      },
    });

    this.logger.log(`User logged out: ${userId}`);
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        tenantId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async createUser(
    dto: CreateUserDto,
    callerRole: UserRole,
    tenantId: string,
  ) {
    this.enforceRoleHierarchy(callerRole, dto.role);

    const existing = await this.prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId,
          email: dto.email,
        },
      },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        tenantId,
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        branchId: dto.branchId ?? null,
      },
      select: {
        id: true,
        tenantId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        branchId: true,
        branch: { select: { id: true, name: true } },
      },
    });

    this.eventEmitter.emit(USER_CREATED, {
      eventId: randomUUID(),
      eventType: USER_CREATED,
      aggregateId: user.id,
      tenantId,
      payload: { email: user.email, role: user.role },
      occurredAt: new Date(),
    });

    this.logger.log(`User created: ${user.email} (role: ${user.role})`);

    return user;
  }

  async updateUser(
    id: string,
    dto: UpdateUserDto,
    callerRole: UserRole,
    tenantId: string,
  ) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.role) {
      this.enforceRoleHierarchy(callerRole, dto.role);
    }

    this.enforceRoleHierarchy(callerRole, user.role);

    const data: Record<string, unknown> = {};
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.branchId !== undefined) data.branchId = dto.branchId || null;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        tenantId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        branchId: true,
        branch: { select: { id: true, name: true } },
      },
    });

    this.eventEmitter.emit(USER_UPDATED, {
      eventId: randomUUID(),
      eventType: USER_UPDATED,
      aggregateId: id,
      tenantId,
      payload: { updatedFields: Object.keys(data) },
      occurredAt: new Date(),
    });

    return updated;
  }

  async deleteUser(
    id: string,
    callerUserId: string,
    tenantId: string,
  ): Promise<void> {
    if (id === callerUserId) {
      throw new ForbiddenException('Cannot deactivate yourself');
    }

    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        refreshToken: null,
        refreshTokenExp: null,
      },
    });

    this.eventEmitter.emit(USER_DEACTIVATED, {
      eventId: randomUUID(),
      eventType: USER_DEACTIVATED,
      aggregateId: id,
      tenantId,
      payload: { email: user.email },
      occurredAt: new Date(),
    });

    this.logger.log(`User deactivated: ${user.email}`);
  }

  async findAllUsers(
    tenantId: string,
    page = 1,
    limit = 20,
    branchId?: string,
  ) {
    const skip = (page - 1) * limit;
    const where = { tenantId, ...(branchId ? { branchId } : {}) };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          branchId: true,
          branch: { select: { id: true, name: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneUser(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        tenantId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        branchId: true,
        branch: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async generateTokens(payload: JwtPayload): Promise<AuthTokens> {
    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = randomUUID();

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(
    userId: string,
    rawRefreshToken: string,
  ): Promise<void> {
    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const days = parseInt(refreshExpiresIn, 10) || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    const hashedToken = await bcrypt.hash(rawRefreshToken, BCRYPT_ROUNDS);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: hashedToken,
        refreshTokenExp: expiresAt,
      },
    });
  }

  // ─── T-079: Tenant soliq ma'lumotlari ─────────────────────────

  async getTenantInfo(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        inn: true,
        stir: true,
        oked: true,
        legalName: true,
        legalAddress: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async updateTenantInfo(tenantId: string, dto: UpdateTenantInfoDto) {
    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.inn !== undefined && { inn: dto.inn }),
        ...(dto.stir !== undefined && { stir: dto.stir }),
        ...(dto.oked !== undefined && { oked: dto.oked }),
        ...(dto.legalName !== undefined && { legalName: dto.legalName }),
        ...(dto.legalAddress !== undefined && { legalAddress: dto.legalAddress }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        inn: true,
        stir: true,
        oked: true,
        legalName: true,
        legalAddress: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Tenant info updated: ${tenantId}`);
    return tenant;
  }

  async getBranches(tenantId: string) {
    return this.prisma.branch.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, address: true, isActive: true },
    });
  }

  async resetUserPassword(
    targetId: string,
    newPassword: string,
    callerId: string,
    callerRole: UserRole,
    tenantId: string,
  ) {
    const user = await this.prisma.user.findFirst({
      where: { id: targetId, tenantId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Allow self-reset; otherwise enforce role hierarchy
    if (targetId !== callerId) {
      this.enforceRoleHierarchy(callerRole, user.role);
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await this.prisma.user.update({
      where: { id: targetId },
      data: { passwordHash },
    });

    this.logger.log(`Password reset for user ${targetId} by ${callerId}`);
    return { message: 'Password updated successfully' };
  }

  private enforceRoleHierarchy(
    callerRole: UserRole,
    targetRole: UserRole,
  ): void {
    const callerLevel = ROLE_HIERARCHY[callerRole];
    const targetLevel = ROLE_HIERARCHY[targetRole];

    if (targetLevel >= callerLevel) {
      throw new ForbiddenException(
        `Cannot assign or modify role ${targetRole}. Your role (${callerRole}) must be higher.`,
      );
    }
  }
}
