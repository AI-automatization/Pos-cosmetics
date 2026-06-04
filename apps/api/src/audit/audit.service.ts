import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const SENSITIVE_AUDIT_KEYS = [
  'password', 'token', 'secret', 'authorization', 'refreshtoken',
  'hash', 'pin', 'otp', 'cardnumber', 'cvv', 'apikey', 'privatekey',
];

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SENSITIVE_AUDIT_KEYS.some((s) => lower.includes(s));
}

function redactAuditData(data: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!data) return undefined;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (isSensitiveKey(key)) {
      result[key] = '[REDACTED]';
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = redactAuditData(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export interface LogAuditDto {
  tenantId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(dto: LogAuditDto): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId: dto.tenantId,
          userId: dto.userId,
          action: dto.action,
          entityType: dto.entityType,
          entityId: dto.entityId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          oldData: (redactAuditData(dto.oldData) ?? undefined) as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          newData: (redactAuditData(dto.newData) ?? undefined) as any,
          ip: dto.ip,
          userAgent: dto.userAgent,
        },
      });
    } catch (err) {
      // Audit log hech qachon asosiy operatsiyani to'xtatmasligi kerak
      this.logger.error('Audit log failed', {
        error: (err as Error).message,
        action: dto.action,
        entityType: dto.entityType,
      });
    }
  }

  async getLogs(
    tenantId: string,
    opts: {
      userId?: string;
      action?: string;
      entityType?: string;
      from?: Date;
      to?: Date;
      page?: number;
      limit?: number;
    },
  ) {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 50;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      ...(opts.userId && { userId: opts.userId }),
      ...(opts.action && { action: opts.action }),
      ...(opts.entityType && { entityType: opts.entityType }),
      ...((opts.from || opts.to) && {
        createdAt: {
          ...(opts.from && { gte: opts.from }),
          ...(opts.to && { lte: opts.to }),
        },
      }),
    };

    const [total, rawItems] = await this.prisma.$transaction([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Join user names
    const userIds = [...new Set(rawItems.map((i) => i.userId).filter(Boolean))] as string[];
    const users = userIds.length > 0
      ? await this.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, firstName: true, lastName: true, role: true },
        })
      : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    const items = rawItems.map((item) => {
      const user = item.userId ? userMap.get(item.userId) : null;
      return {
        ...item,
        oldData: redactAuditData(item.oldData as Record<string, unknown> | undefined),
        newData: redactAuditData(item.newData as Record<string, unknown> | undefined),
        userName: user ? `${user.firstName} ${user.lastName ?? ''}`.trim() : null,
        userRole: user?.role ?? null,
      };
    });

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
