import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
          oldData: (dto.oldData ?? undefined) as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          newData: (dto.newData ?? undefined) as any,
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

    const [total, items] = await this.prisma.$transaction([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
