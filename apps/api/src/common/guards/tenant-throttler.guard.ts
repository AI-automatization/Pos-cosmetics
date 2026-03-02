import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

/**
 * T-077: Per-tenant rate limiting.
 *
 * Authenticated requests → keyed by tenantId (100 req/min shared per tenant).
 * Unauthenticated requests (login, register) → keyed by IP.
 *
 * This prevents a single busy tenant from consuming limits meant for another tenant,
 * and provides tighter IP-based limiting on auth endpoints.
 */
@Injectable()
export class TenantThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const request = req as unknown as Request;
    const user = (request as unknown as { user?: { tenantId?: string } }).user;

    // Authenticated: limit per tenant
    if (user?.tenantId) {
      return `tenant:${user.tenantId}`;
    }

    // Unauthenticated: limit per IP (auth endpoints, health, etc.)
    const forwarded = request.headers?.['x-forwarded-for'];
    const ip =
      (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]) ??
      request.ip ??
      'unknown';

    return String(ip).trim();
  }
}
