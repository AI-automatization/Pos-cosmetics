import { CanActivate, ExecutionContext, Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * Validates webhook caller IP against provider-specific allowlists.
 * Configure via env: PAYME_ALLOWED_IPS, CLICK_ALLOWED_IPS, UZUM_ALLOWED_IPS (comma-separated).
 * If the env var is not set, the guard allows all IPs (permissive mode for dev).
 */
@Injectable()
export class WebhookIpGuard implements CanActivate {
  private readonly logger = new Logger(WebhookIpGuard.name);

  private readonly allowedIps: Map<string, Set<string>>;

  constructor(private readonly config: ConfigService) {
    this.allowedIps = new Map([
      ['payme', this.parseIps('PAYME_ALLOWED_IPS')],
      ['click', this.parseIps('CLICK_ALLOWED_IPS')],
      ['uzum', this.parseIps('UZUM_ALLOWED_IPS')],
    ]);
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const path = req.path;

    let provider: string | null = null;
    if (path.includes('/webhooks/payme')) provider = 'payme';
    else if (path.includes('/webhooks/click')) provider = 'click';
    else if (path.includes('/webhooks/uzum')) provider = 'uzum';

    if (!provider) return true;

    const allowed = this.allowedIps.get(provider);
    if (!allowed || allowed.size === 0) return true; // permissive if not configured

    const clientIp = this.extractIp(req);
    if (allowed.has(clientIp)) return true;

    this.logger.warn(`Webhook IP rejected: provider=${provider} ip=${clientIp}`);
    throw new ForbiddenException('IP not allowed');
  }

  private parseIps(envKey: string): Set<string> {
    const raw = this.config.get<string>(envKey, '');
    if (!raw) return new Set();
    return new Set(raw.split(',').map((ip) => ip.trim()).filter(Boolean));
  }

  private extractIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
    return req.ip ?? '';
  }
}
