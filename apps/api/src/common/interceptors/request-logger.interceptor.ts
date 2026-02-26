import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = ctx.getResponse<Response>();
        const duration = Date.now() - startTime;
        const isSlow = duration > 500;

        this.logger.log({
          method: request.method,
          url: request.url,
          status: response.statusCode,
          duration_ms: duration,
          is_slow: isSlow,
          ip: request.ip,
        });

        if (isSlow) {
          this.logger.warn(`Slow request: ${request.method} ${request.url} took ${duration}ms`);
        }
      }),
    );
  }
}
