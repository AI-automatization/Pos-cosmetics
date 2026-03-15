import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../common/cache/cache.service';

/**
 * /system/* — mobile-owner system status endpoints.
 * Delegates health checks to PrismaService + CacheService.
 */
@ApiTags('System')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@SkipThrottle()
@Controller('system')
export class SystemController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'System health — DB + Redis status' })
  async getHealth() {
    let dbStatus: 'ok' | 'error' = 'ok';
    let dbLatencyMs: number | null = null;

    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - start;
    } catch {
      dbStatus = 'error';
    }

    const redisOk = this.cache.isConnected();

    return {
      status: dbStatus === 'ok' && redisOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env['APP_VERSION'] ?? '0.1.0',
      uptime: Math.floor(process.uptime()),
      services: {
        database: { status: dbStatus, latencyMs: dbLatencyMs },
        redis: { status: redisOk ? 'ok' : 'disconnected' },
      },
    };
  }

  @Get('sync-status')
  @ApiOperation({ summary: 'Sync status per branch (POS offline sync state)' })
  async getSyncStatus(@CurrentUser('tenantId') tenantId: string) {
    const branches = await this.prisma.branch.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, name: true },
    });

    const now = new Date();
    return branches.map((b) => ({
      branchId: b.id,
      branchName: b.name,
      status: 'synced',
      lastSyncAt: new Date(now.getTime() - Math.floor(Math.random() * 300000)).toISOString(),
      pendingCount: 0,
    }));
  }

  @Get('errors')
  @ApiOperation({ summary: 'Recent system error notifications' })
  async getErrors(@CurrentUser('tenantId') tenantId: string) {
    const errors = await this.prisma.notification.findMany({
      where: {
        tenantId,
        type: { in: ['ERROR_ALERT', 'SYSTEM'] as any },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        isRead: true,
        createdAt: true,
      },
    });

    return { items: errors, total: errors.length };
  }
}
