import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * T-348: Metrics endpoint himoyasi.
 * METRICS_SECRET env var orqali himoyalanadi.
 * Prometheus scraper: --header 'X-Metrics-Secret: <secret>'
 * Fail-secure: agar METRICS_SECRET .env da yo'q bo'lsa — HAMMA rad etiladi.
 */
@Injectable()
export class MetricsSecretGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const secret = process.env.METRICS_SECRET;

    if (!secret) {
      throw new ForbiddenException('Metrics endpoint is disabled (METRICS_SECRET not configured)');
    }

    const req = context.switchToHttp().getRequest<Request>();
    const provided = req.headers['x-metrics-secret'];

    if (!provided || provided !== secret) {
      throw new ForbiddenException('Invalid or missing X-Metrics-Secret header');
    }

    return true;
  }
}
