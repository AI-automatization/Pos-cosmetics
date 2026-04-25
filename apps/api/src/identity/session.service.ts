import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const MAX_SESSIONS_PER_USER = 5;
const SESSION_DURATION_DAYS = 30;

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createSession(params: {
    userId: string;
    tenantId: string;
    deviceInfo?: string;
    ip?: string;
    userAgent?: string;
  }): Promise<string> {
    const { userId, tenantId, deviceInfo, ip, userAgent } = params;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

    // Eski, muddati o'tgan sessiyalarni tozalash
    await this.prisma.session.deleteMany({
      where: { userId, expiresAt: { lt: new Date() } },
    });

    // Max sessiya limitini tekshirish
    const activeCount = await this.prisma.session.count({
      where: { userId, expiresAt: { gte: new Date() } },
    });

    if (activeCount >= MAX_SESSIONS_PER_USER) {
      // Eng eski sessiyani o'chirish (FIFO)
      const oldest = await this.prisma.session.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });
      if (oldest) {
        await this.prisma.session.delete({ where: { id: oldest.id } });
        this.logger.warn(
          `[Session] Max limit reached for user ${userId} — evicted oldest session`,
        );
      }
    }

    const session = await this.prisma.session.create({
      data: {
        userId,
        tenantId,
        deviceInfo,
        ip,
        userAgent,
        expiresAt,
      },
    });

    this.logger.log(
      `[Session] Created for user=${userId} ip=${ip ?? 'unknown'} device=${deviceInfo ?? 'unknown'}`,
    );

    return session.id;
  }

  async touchSession(sessionId: string): Promise<void> {
    await this.prisma.session
      .update({
        where: { id: sessionId },
        data: { lastActive: new Date() },
      })
      .catch(() => null); // sessiya yo'q bo'lsa ignore
  }

  async getSessions(userId: string, tenantId: string) {
    return this.prisma.session.findMany({
      where: {
        userId,
        tenantId,
        expiresAt: { gte: new Date() },
      },
      orderBy: { lastActive: 'desc' },
      select: {
        id: true,
        deviceInfo: true,
        ip: true,
        userAgent: true,
        lastActive: true,
        createdAt: true,
        expiresAt: true,
      },
    });
  }

  async deleteSession(
    sessionId: string,
    userId: string,
    tenantId: string,
  ): Promise<void> {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, tenantId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Faqat o'z sessionini yoki ADMIN/OWNER boshqa usernikini o'chirishi mumkin
    if (session.userId !== userId) {
      throw new ForbiddenException('Cannot delete another user session');
    }

    await this.prisma.session.delete({ where: { id: sessionId } });
    this.logger.log(`[Session] Deleted: ${sessionId}`);
  }

  /** ADMIN: istalgan userning sessionini force-logout qilish */
  async forceLogoutUser(
    targetUserId: string,
    tenantId: string,
    callerRole: UserRole,
  ): Promise<{ count: number }> {
    if (!['OWNER', 'ADMIN', 'MANAGER'].includes(callerRole)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const { count } = await this.prisma.session.deleteMany({
      where: { userId: targetUserId, tenantId },
    });

    this.logger.warn(
      `[Session] Force-logout: target=${targetUserId}, sessions_deleted=${count}`,
    );

    return { count };
  }

  /** Tenant dagi barcha sessiyalarni ko'rish (ADMIN) */
  async getAllSessions(tenantId: string, callerRole: UserRole) {
    if (!['OWNER', 'ADMIN'].includes(callerRole)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.prisma.session.findMany({
      where: { tenantId, expiresAt: { gte: new Date() } },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { lastActive: 'desc' },
    });
  }

  async deleteAllMySessions(userId: string, tenantId: string): Promise<{ count: number }> {
    const { count } = await this.prisma.session.deleteMany({
      where: { userId, tenantId },
    });
    return { count };
  }
}
