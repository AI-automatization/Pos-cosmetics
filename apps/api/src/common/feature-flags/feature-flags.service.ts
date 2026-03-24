import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

const FLAG_CACHE_TTL = 60; // 1 min — no deploy needed for toggles
const FLAG_CACHE_PREFIX = 'feature_flag:';
const GLOBAL_TENANT = ''; // empty string = global default in DB

export interface FeatureFlagDto {
  key: string;
  enabled: boolean;
  tenantId: string; // '' means global
  description?: string | null;
  updatedAt: Date;
}

@Injectable()
export class FeatureFlagsService {
  private readonly logger = new Logger(FeatureFlagsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  /** Check if a flag is enabled for a specific tenant (falls back to global) */
  async isEnabled(key: string, tenantId: string): Promise<boolean> {
    const cacheKey = `${FLAG_CACHE_PREFIX}${tenantId}:${key}`;
    const cached = await this.cache.get<boolean>(cacheKey);
    if (cached !== null) return cached;

    // Tenant-specific flag first, then global default ('')
    const flag = await this.prisma.featureFlag.findFirst({
      where: {
        key,
        tenantId: { in: [tenantId, GLOBAL_TENANT] },
      },
      orderBy: { tenantId: 'desc' }, // non-empty (tenant-specific) sorts after ''
    });

    const enabled = flag?.enabled ?? false;
    await this.cache.set(cacheKey, enabled, FLAG_CACHE_TTL);
    return enabled;
  }

  /** List all flags — optionally scoped to a tenant + global */
  async listFlags(tenantId?: string): Promise<FeatureFlagDto[]> {
    const where = tenantId
      ? { tenantId: { in: [tenantId, GLOBAL_TENANT] } }
      : {};
    const flags = await this.prisma.featureFlag.findMany({
      where,
      orderBy: [{ key: 'asc' }, { tenantId: 'asc' }],
    });
    return flags.map((f) => ({
      key: f.key,
      enabled: f.enabled,
      tenantId: f.tenantId,
      description: f.description,
      updatedAt: f.updatedAt,
    }));
  }

  /** Create or update a flag for a tenant (or globally if tenantId='') */
  async setFlag(
    key: string,
    enabled: boolean,
    tenantId: string,
    description?: string,
  ): Promise<FeatureFlagDto> {
    const flag = await this.prisma.featureFlag.upsert({
      where: { key_tenantId: { key, tenantId } },
      create: { key, enabled, tenantId, description },
      update: { enabled, description, updatedAt: new Date() },
    });

    // Invalidate cache
    if (tenantId !== GLOBAL_TENANT) {
      await this.cache.del(`${FLAG_CACHE_PREFIX}${tenantId}:${key}`);
    } else {
      await this.cache.invalidatePattern(`${FLAG_CACHE_PREFIX}*:${key}`);
    }

    this.logger.log(`Feature flag [${key}] = ${enabled} (tenant=${tenantId || 'GLOBAL'})`);
    return {
      key: flag.key,
      enabled: flag.enabled,
      tenantId: flag.tenantId,
      description: flag.description,
      updatedAt: flag.updatedAt,
    };
  }

  /** Delete a flag (reverts to default) */
  async deleteFlag(key: string, tenantId: string): Promise<void> {
    await this.prisma.featureFlag.deleteMany({ where: { key, tenantId } });
    await this.cache.del(`${FLAG_CACHE_PREFIX}${tenantId}:${key}`);
  }
}
