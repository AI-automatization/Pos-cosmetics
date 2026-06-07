import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { TENANT_REGISTERED, USER_LOGGED_IN } from '../events';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  CreateUserDto,
  LoginDto,
  RegisterTenantDto,
  UpdateTenantInfoDto,
  UpdateUserDto,
} from './dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { TokenHelper, AuthTokens } from './token.helper';
import { LockoutHelper } from './lockout.helper';
import { UserManagementHelper } from './user-management.helper';
import { TenantInfoHelper } from './tenant-info.helper';

export { AuthTokens };

const BCRYPT_ROUNDS = 12;

@Injectable()
export class IdentityService {
  private readonly logger = new Logger(IdentityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly tokenHelper: TokenHelper,
    private readonly lockoutHelper: LockoutHelper,
    private readonly auditService: AuditService,
    private readonly userManagement: UserManagementHelper,
    private readonly tenantInfo: TenantInfoHelper,
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

    const tokens = await this.tokenHelper.generateTokens({
      sub: result.user.id,
      tenantId: result.tenant.id,
      role: UserRole.OWNER,
      branchId: null,
    });

    await this.tokenHelper.saveRefreshToken(result.user.id, tokens.refreshToken);

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

  async login(dto: LoginDto): Promise<AuthTokens> {
    const ip = 'unknown';
    const loginEmail = dto.email ?? dto.login ?? '';

    let tenant: { id: string; isActive: boolean; slug: string } | null = null;
    let user: Awaited<ReturnType<typeof this.prisma.user.findUnique>> = null;

    if (dto.slug) {
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
      const candidates = await this.prisma.user.findMany({
        where: { email: loginEmail, isActive: true },
        include: {
          tenant: { select: { id: true, isActive: true, slug: true } },
        },
      });

      const active = candidates.filter((u) => u.tenant.isActive);

      if (active.length === 0) {
        await this.lockoutHelper.recordAttempt(null, loginEmail, ip, false);
        throw new UnauthorizedException('Invalid credentials');
      }

      if (active.length > 1) {
        throw new UnauthorizedException('SLUG_REQUIRED');
      }

      user = active[0]!;
      tenant = active[0]!.tenant;
    }

    if (!user || !user.isActive) {
      await this.lockoutHelper.recordAttempt(null, loginEmail, ip, false);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.lockoutHelper.checkLock(user.id);

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      await this.lockoutHelper.recordAttempt(user.id, loginEmail, ip, false);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.lockoutHelper.recordAttempt(user.id, loginEmail, ip, true);

    const hasPosAccess = ['CASHIER', 'MANAGER', 'OWNER'].includes(user.role);
    const hasAdminAccess = ['OWNER', 'ADMIN', 'MANAGER'].includes(user.role);

    const tokens = await this.tokenHelper.generateTokens({
      sub: user.id,
      tenantId: tenant.id,
      role: user.role,
      branchId: null,
      hasPosAccess,
      hasAdminAccess,
    });

    await this.tokenHelper.saveRefreshToken(user.id, tokens.refreshToken, {
      lastLogin: new Date(),
    });

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
    const tokens = await this.tokenHelper.generateTokens({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      branchId: null,
    } as JwtPayload);
    await this.tokenHelper.saveRefreshToken(user.id, tokens.refreshToken, {
      lastLogin: new Date(),
    });
    return tokens;
  }

  /** Admin tomonidan foydalanuvchi lockini ochish (T-067) */
  async unlockUser(adminUserId: string, targetUserId: string): Promise<void> {
    await this.lockoutHelper.unlockUser(adminUserId, targetUserId);
  }

  async refreshTokens(dto: {
    userId: string;
    refreshToken: string;
  }): Promise<AuthTokens> {
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

    const tokens = await this.tokenHelper.generateTokens({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      branchId: null,
    });

    await this.tokenHelper.saveRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async loginWithSession(
    dto: LoginDto,
    sessionParams: {
      ip?: string;
      userAgent?: string;
      sessionService: {
        createSession: (p: {
          userId: string;
          tenantId: string;
          ip?: string;
          userAgent?: string;
        }) => Promise<string>;
      };
    },
  ): Promise<AuthTokens> {
    const tokens = await this.login(dto);

    // Create session if possible — slug may be undefined when user has single tenant
    if (dto.slug) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { slug: dto.slug },
      });
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
    }
    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null, refreshTokenExp: null },
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
        tenant: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // ─── User CRUD delegated to UserManagementHelper ──────────────

  createUser(dto: CreateUserDto, callerRole: UserRole, tenantId: string) {
    return this.userManagement.createUser(dto, callerRole, tenantId);
  }

  updateUser(
    id: string,
    dto: UpdateUserDto,
    callerRole: UserRole,
    tenantId: string,
  ) {
    return this.userManagement.updateUser(id, dto, callerRole, tenantId);
  }

  deleteUser(id: string, callerUserId: string, tenantId: string) {
    return this.userManagement.deleteUser(id, callerUserId, tenantId);
  }

  findAllUsers(tenantId: string, page = 1, limit = 20, branchId?: string) {
    return this.userManagement.findAllUsers(tenantId, page, limit, branchId);
  }

  findOneUser(id: string, tenantId: string) {
    return this.userManagement.findOneUser(id, tenantId);
  }

  resetUserPassword(
    targetId: string,
    newPassword: string,
    callerId: string,
    callerRole: UserRole,
    tenantId: string,
  ) {
    return this.userManagement.resetUserPassword(
      targetId,
      newPassword,
      callerId,
      callerRole,
      tenantId,
    );
  }

  // ─── T-079: Tenant soliq ma'lumotlari ─────────────────────────

  getTenantInfo(tenantId: string) {
    return this.tenantInfo.getTenantInfo(tenantId);
  }

  updateTenantInfo(tenantId: string, dto: UpdateTenantInfoDto) {
    return this.tenantInfo.updateTenantInfo(tenantId, dto);
  }

  getBranches(tenantId: string) {
    return this.tenantInfo.getBranches(tenantId);
  }
}
