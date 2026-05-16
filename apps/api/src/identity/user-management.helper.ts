import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { USER_CREATED, USER_DEACTIVATED, USER_UPDATED } from '../events';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { EmailNotifyService } from '../notifications/email-notify.service';
import { CreateUserDto, UpdateUserDto } from './dto';

const BCRYPT_ROUNDS = 12;

const ROLE_HIERARCHY: Record<UserRole, number> = {
  OWNER: 5,
  ADMIN: 4,
  MANAGER: 3,
  WAREHOUSE: 2.5,
  CASHIER: 2,
  VIEWER: 1,
};

@Injectable()
export class UserManagementHelper {
  private readonly logger = new Logger(UserManagementHelper.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly auditService: AuditService,
    private readonly emailService: EmailNotifyService,
    private readonly config: ConfigService,
  ) {}

  enforceRoleHierarchy(callerRole: UserRole, targetRole: UserRole): void {
    const callerLevel = ROLE_HIERARCHY[callerRole];
    const targetLevel = ROLE_HIERARCHY[targetRole];

    if (targetLevel >= callerLevel) {
      throw new ForbiddenException(
        `Cannot assign or modify role ${targetRole}. Your role (${callerRole}) must be higher.`,
      );
    }
  }

  async createUser(
    dto: CreateUserDto,
    callerRole: UserRole,
    tenantId: string,
  ) {
    this.enforceRoleHierarchy(callerRole, dto.role);

    const existing = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: dto.email } },
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

    void this.auditService.log({
      tenantId,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: user.id,
      newData: { email: user.email, role: user.role },
    });

    // Send welcome email with credentials (non-blocking)
    void this.emailService.sendEmployeeWelcome({
      email: user.email,
      firstName: user.firstName,
      password: dto.password,
      role: user.role,
      loginUrl: this.config.get('APP_URL', 'https://kosmetika.uz') + '/login',
    });

    return user;
  }

  async updateUser(
    id: string,
    dto: UpdateUserDto,
    callerRole: UserRole,
    tenantId: string,
  ) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });

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

    void this.auditService.log({
      tenantId,
      action: 'USER_UPDATED',
      entityType: 'User',
      entityId: id,
      oldData: { email: user.email, role: user.role },
      newData: { updatedFields: Object.keys(data) },
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

    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false, refreshToken: null, refreshTokenExp: null },
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

    void this.auditService.log({
      tenantId,
      userId: callerUserId,
      action: 'USER_DEACTIVATED',
      entityType: 'User',
      entityId: id,
      oldData: { email: user.email, role: user.role },
    });
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

    if (targetId !== callerId) {
      this.enforceRoleHierarchy(callerRole, user.role);
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await this.prisma.user.update({
      where: { id: targetId },
      data: { passwordHash },
    });

    this.logger.log(`Password reset for user ${targetId} by ${callerId}`);

    void this.auditService.log({
      tenantId,
      userId: callerId,
      action: 'PASSWORD_RESET',
      entityType: 'User',
      entityId: targetId,
      newData: { resetBy: callerId, selfReset: targetId === callerId },
    });

    return { message: 'Password updated successfully' };
  }
}
