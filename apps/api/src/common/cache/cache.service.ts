import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * RAOS Redis Cache Service (T-073)
 *
 * TTL strategiyasi:
 *   - Product catalog:   5 min (300s)
 *   - Stock levels:      1 min (60s)
 *   - Exchange rate:     24h  (86400s)
 *   - User session:      — (Redis auth session store emas, JWT ishlatilmoqda)
 */

export const CACHE_TTL = {
  PRODUCT_CATALOG: 300,    // 5 daqiqa
  STOCK_LEVELS: 60,        // 1 daqiqa
  EXCHANGE_RATE: 86400,    // 24 soat
  REPORT: 120,             // 2 daqiqa (hisobotlar)
} as const;

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client!: Redis;
  private connected = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    // Support REDIS_URL (Railway auto-inject) or REDIS_HOST/PORT (manual config)
    const redisUrl = this.config.get<string>('REDIS_URL');
    const baseOpts = { maxRetriesPerRequest: 3, lazyConnect: true, enableOfflineQueue: false };

    if (redisUrl) {
      this.client = new Redis(redisUrl, baseOpts);
    } else {
      this.client = new Redis({
        ...baseOpts,
        host: this.config.get<string>('REDIS_HOST', 'localhost'),
        port: this.config.get<number>('REDIS_PORT', 6379),
        password: this.config.get<string>('REDIS_PASSWORD') || undefined,
      });
    }

    this.client.on('connect', () => {
      this.connected = true;
      this.logger.log('Redis connected');
    });

    this.client.on('error', (err) => {
      this.connected = false;
      this.logger.warn(`Redis error: ${err.message}`);
    });

    // Ulanishga urinish (xato bo'lsa ham API ishlaydi — cache miss)
    this.client.connect().catch((err) => {
      this.logger.warn(`Redis initial connect failed: ${err.message}. Cache disabled.`);
    });
  }

  async onModuleDestroy() {
    await this.client.quit().catch(() => null);
  }

  // ─── CORE METHODS ─────────────────────────────────────────────

  async get<T>(key: string): Promise<T | null> {
    if (!this.connected) return null;
    try {
      const value = await this.client.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.connected) return;
    try {
      await this.client.setex(key, ttlSeconds, JSON.stringify(value));
    } catch {
      // Cache write xatoligi API ni to'xtatmaydi
    }
  }

  async del(key: string): Promise<void> {
    if (!this.connected) return;
    try {
      await this.client.del(key);
    } catch {
      // silent
    }
  }

  /**
   * Pattern bo'yicha barcha kalitlarni o'chirish.
   * Misol: invalidatePattern('tenant:abc123:products:*')
   */
  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.connected) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
        this.logger.debug(`Cache invalidated ${keys.length} keys: ${pattern}`);
      }
    } catch {
      // silent
    }
  }

  /**
   * Ping — Redis tirik ekanligini tekshirish.
   */
  async ping(): Promise<boolean> {
    if (!this.connected) return false;
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  // ─── CACHE KEY HELPERS ────────────────────────────────────────

  static key = {
    products: (tenantId: string, suffix = '') =>
      `tenant:${tenantId}:products${suffix ? ':' + suffix : ''}`,

    stockLevels: (tenantId: string, warehouseId?: string) =>
      `tenant:${tenantId}:stock${warehouseId ? ':' + warehouseId : ''}`,

    exchangeRate: (currency: string) => `exchange:${currency}:UZS`,

    report: (tenantId: string, type: string, from: string, to: string) =>
      `tenant:${tenantId}:report:${type}:${from}:${to}`,
  };
}
