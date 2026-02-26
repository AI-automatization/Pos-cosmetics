import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { AppLoggerService } from '../logger/logger.service';
import { RequestContextService } from '../logger/request-context.service';

const SENSITIVE_BODY_KEYS = ['password', 'token', 'secret', 'authorization', 'refreshToken'];

function redactBody(body: unknown): unknown {
  if (!body || typeof body !== 'object') return body;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (SENSITIVE_BODY_KEYS.some((s) => key.toLowerCase().includes(s))) {
      result[key] = '[REDACTED]';
    } else {
      result[key] = value;
    }
  }
  return result;
}

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly requestContext: RequestContextService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const startTime = Date.now();

    // Update context with authenticated user info (set by JwtAuthGuard before interceptor)
    const user = (request as unknown as Record<string, unknown>).user as
      | { tenantId?: string; sub?: string }
      | undefined;
    if (user) {
      this.requestContext.setUser(user.tenantId ?? null, user.sub ?? null);
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const response = ctx.getResponse<Response>();
          const durationMs = Date.now() - startTime;
          const isSlow = durationMs > 500;
          const reqCtx = this.requestContext.get();

          this.logger.logWithContext(
            isSlow ? 'warn' : 'info',
            `${request.method} ${request.url} ${response.statusCode} ${durationMs}ms`,
            'HTTP',
            {
              method: request.method,
              url: request.url,
              status: response.statusCode,
              durationMs,
              isSlow,
              ip: reqCtx?.ip ?? request.ip,
              body: request.method !== 'GET' ? redactBody(request.body) : undefined,
            },
          );
        },
        error: (error: unknown) => {
          const durationMs = Date.now() - startTime;
          const reqCtx = this.requestContext.get();

          this.logger.logWithContext('error', `${request.method} ${request.url} ERROR ${durationMs}ms`, 'HTTP', {
            method: request.method,
            url: request.url,
            durationMs,
            ip: reqCtx?.ip ?? request.ip,
            error: error instanceof Error ? { name: error.name, message: error.message } : String(error),
          });
        },
      }),
    );
  }
}
