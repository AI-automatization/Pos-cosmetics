import { Controller, Get, HttpCode, HttpStatus, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../common/decorators';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../common/cache/cache.service';

// T-077: Health endpoints are exempt from rate limiting (monitoring/LB probes)
@SkipThrottle()
@ApiTags('Health')
@Controller('health')
@Public()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  /**
   * GET /health/live — Liveness probe.
   * Process tirik — har doim 200 qaytaradi.
   * Kubernetes: livenessProbe
   */
  @Get('live')
  @ApiOperation({ summary: 'Liveness probe — process alive' })
  live() {
    return { status: 'alive', ts: Date.now() };
  }

  /**
   * GET /health/ping — Simple ping (LB uchun).
   * DB tekshiruvsiz, eng tez.
   */
  @Get('ping')
  @ApiOperation({ summary: 'Simple ping (no checks)' })
  ping() {
    return { pong: true, ts: Date.now() };
  }

  /**
   * GET /health/ready — Readiness probe.
   * DB + Redis tekshiradi. Fail bo'lsa → 503.
   * Kubernetes: readinessProbe
   */
  @Get('ready')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Readiness probe — DB + Redis ready' })
  async ready() {
    const checks: Record<string, { status: 'ok' | 'error'; latencyMs?: number; error?: string }> = {};

    // ─── Database ──────────────────────────────────────────────
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = { status: 'ok', latencyMs: Date.now() - start };
    } catch (err) {
      checks.database = { status: 'error', error: (err as Error).message };
    }

    // ─── Redis ─────────────────────────────────────────────────
    try {
      const start = Date.now();
      const pong = await this.cache.ping();
      checks.redis = pong
        ? { status: 'ok', latencyMs: Date.now() - start }
        : { status: 'error', error: 'Redis ping failed' };
    } catch (err) {
      checks.redis = { status: 'error', error: (err as Error).message };
    }

    const allOk = Object.values(checks).every((c) => c.status === 'ok');

    const result = {
      status: allOk ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION ?? '0.1.0',
      environment: process.env.NODE_ENV ?? 'development',
      services: checks,
    };

    if (!allOk) {
      throw new ServiceUnavailableException(result);
    }

    return result;
  }

  /**
   * GET /health — General health (DB ping + version).
   * Kubernetes startup probe & monitoring.
   */
  @Get()
  @ApiOperation({ summary: 'General health check — DB + version' })
  async check() {
    let dbStatus: 'ok' | 'error' = 'ok';
    let dbLatencyMs: number | null = null;

    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - start;
    } catch {
      dbStatus = 'error';
    }

    return {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION ?? '0.1.0',
      environment: process.env.NODE_ENV ?? 'development',
      uptime: Math.floor(process.uptime()),
      services: {
        database: { status: dbStatus, latencyMs: dbLatencyMs },
        redis: { status: this.cache.isConnected() ? 'ok' : 'disconnected' },
      },
    };
  }
}
