import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from './cache.service';

const IP_BLOCK_PREFIX = 'blocked:ip:';
const IP_FAILED_PREFIX = 'failed_login:ip:';
const BLOCK_TTL = 24 * 60 * 60;   // 24 hours
const TRACK_TTL = 60 * 60;        // 1 hour sliding window
const AUTO_BLOCK_THRESHOLD = 100; // failed logins in 1 hour

@Injectable()
export class IpBlockService {
  private readonly logger = new Logger(IpBlockService.name);

  constructor(private readonly cache: CacheService) {}

  /** Check if an IP is currently blocked */
  async isBlocked(ip: string): Promise<boolean> {
    const val = await this.cache.get<string>(`${IP_BLOCK_PREFIX}${ip}`);
    return val !== null;
  }

  /** Manually block an IP for a given TTL (default 24h) */
  async blockIp(ip: string, ttlSeconds = BLOCK_TTL, reason = 'manual'): Promise<void> {
    await this.cache.set(`${IP_BLOCK_PREFIX}${ip}`, { blockedAt: new Date(), reason }, ttlSeconds);
    this.logger.warn(`IP blocked: ${ip} reason=${reason} ttl=${ttlSeconds}s`);
  }

  /** Manually unblock an IP */
  async unblockIp(ip: string): Promise<void> {
    await this.cache.del(`${IP_BLOCK_PREFIX}${ip}`);
    this.logger.log(`IP unblocked: ${ip}`);
  }

  /**
   * Track a failed login attempt for an IP.
   * Auto-blocks if >= AUTO_BLOCK_THRESHOLD within 1 hour.
   */
  async trackFailedAttempt(ip: string | undefined): Promise<void> {
    if (!ip || ip === '::1' || ip === '127.0.0.1') return; // skip localhost
    const key = `${IP_FAILED_PREFIX}${ip}`;
    const current = await this.cache.get<number>(key);
    const count = (current ?? 0) + 1;
    await this.cache.set(key, count, TRACK_TTL);

    if (count >= AUTO_BLOCK_THRESHOLD) {
      await this.blockIp(ip, BLOCK_TTL, 'auto:failed_login');
      this.logger.warn(`Auto-blocked IP ${ip} after ${count} failed logins in 1h`);
    }
  }

  /** Get current failed attempt count for an IP (for admin visibility) */
  async getFailedCount(ip: string): Promise<number> {
    return (await this.cache.get<number>(`${IP_FAILED_PREFIX}${ip}`)) ?? 0;
  }
}
