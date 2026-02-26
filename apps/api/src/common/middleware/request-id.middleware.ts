import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { RequestContextService } from '../logger/request-context.service';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  constructor(private readonly requestContext: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = (req.headers['x-request-id'] as string) || randomUUID();
    res.setHeader('X-Request-Id', requestId);

    const user = (req as unknown as Record<string, unknown>).user as
      | { tenant_id?: string; sub?: string }
      | undefined;

    this.requestContext.run(
      {
        requestId,
        tenantId: user?.tenant_id ?? null,
        userId: user?.sub ?? null,
        ip: req.ip ?? req.socket.remoteAddress ?? 'unknown',
      },
      () => next(),
    );
  }
}
