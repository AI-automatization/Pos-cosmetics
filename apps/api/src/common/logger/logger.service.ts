import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { RequestContextService } from './request-context.service';

const SENSITIVE_KEYS = ['password', 'token', 'secret', 'authorization', 'cookie', 'refreshToken'];

function redactSensitive(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return obj;
  if (Array.isArray(obj)) return obj.map(redactSensitive);
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s))) {
        result[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        result[key] = redactSensitive(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }
  return obj;
}

@Injectable()
export class AppLoggerService implements NestLoggerService {
  private readonly winston: winston.Logger;
  private readonly clientLogger: winston.Logger;

  constructor(private readonly requestContext: RequestContextService) {
    const isProduction = process.env.NODE_ENV === 'production';

    const transports: winston.transport[] = [];

    // Console transport (always, but simpler in production)
    transports.push(
      new winston.transports.Console({
        format: isProduction
          ? winston.format.combine(winston.format.timestamp(), winston.format.json())
          : winston.format.combine(
              winston.format.colorize(),
              winston.format.timestamp({ format: 'HH:mm:ss' }),
              winston.format.printf(({ timestamp, level, message, module, ...rest }) => {
                const mod = module ? `[${module}]` : '';
                const extra = Object.keys(rest).length ? ` ${JSON.stringify(rest)}` : '';
                return `${timestamp} ${level} ${mod} ${message}${extra}`;
              }),
            ),
      }),
    );

    // File transports (all logs)
    transports.push(
      new DailyRotateFile({
        filename: 'logs/api-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      }),
    );

    // File transports (errors only)
    transports.push(
      new DailyRotateFile({
        filename: 'logs/errors-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      }),
    );

    this.winston = winston.createLogger({
      level: isProduction ? 'info' : 'debug',
      defaultMeta: { app: 'raos-api' },
      transports,
    });

    // Dedicated client error logger (web/mobile/pos errors)
    this.clientLogger = winston.createLogger({
      level: 'error',
      defaultMeta: { app: 'raos-client' },
      transports: [
        new DailyRotateFile({
          filename: 'logs/client-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
      ],
    });
  }

  private buildMeta(context?: string, extra?: Record<string, unknown>): Record<string, unknown> {
    const reqCtx = this.requestContext.get();
    const redacted = (extra ? redactSensitive(extra) : {}) as Record<string, unknown>;
    return {
      module: context ?? 'App',
      requestId: reqCtx?.requestId ?? null,
      tenantId: reqCtx?.tenantId ?? null,
      userId: reqCtx?.userId ?? null,
      ...redacted,
    };
  }

  log(message: string, context?: string): void;
  log(message: string, extra?: Record<string, unknown>, context?: string): void;
  log(message: string, contextOrExtra?: string | Record<string, unknown>, context?: string): void {
    if (typeof contextOrExtra === 'string') {
      this.winston.info(message, this.buildMeta(contextOrExtra));
    } else {
      this.winston.info(message, this.buildMeta(context, contextOrExtra ?? undefined));
    }
  }

  error(message: string, trace?: string, context?: string): void;
  error(message: string, extra?: Record<string, unknown>, context?: string): void;
  error(
    message: string,
    traceOrExtra?: string | Record<string, unknown>,
    context?: string,
  ): void {
    if (typeof traceOrExtra === 'string') {
      this.winston.error(message, this.buildMeta(context, { stack: traceOrExtra }));
    } else {
      this.winston.error(message, this.buildMeta(context, traceOrExtra ?? undefined));
    }
  }

  warn(message: string, context?: string): void;
  warn(message: string, extra?: Record<string, unknown>, context?: string): void;
  warn(message: string, contextOrExtra?: string | Record<string, unknown>, context?: string): void {
    if (typeof contextOrExtra === 'string') {
      this.winston.warn(message, this.buildMeta(contextOrExtra));
    } else {
      this.winston.warn(message, this.buildMeta(context, contextOrExtra ?? undefined));
    }
  }

  debug(message: string, context?: string): void;
  debug(message: string, extra?: Record<string, unknown>, context?: string): void;
  debug(
    message: string,
    contextOrExtra?: string | Record<string, unknown>,
    context?: string,
  ): void {
    if (typeof contextOrExtra === 'string') {
      this.winston.debug(message, this.buildMeta(contextOrExtra));
    } else {
      this.winston.debug(message, this.buildMeta(context, contextOrExtra ?? undefined));
    }
  }

  verbose(message: string, context?: string): void;
  verbose(message: string, extra?: Record<string, unknown>, context?: string): void;
  verbose(
    message: string,
    contextOrExtra?: string | Record<string, unknown>,
    context?: string,
  ): void {
    if (typeof contextOrExtra === 'string') {
      this.winston.verbose(message, this.buildMeta(contextOrExtra));
    } else {
      this.winston.verbose(message, this.buildMeta(context, contextOrExtra ?? undefined));
    }
  }

  /** Log with explicit extra data — preferred for structured logging in services */
  logWithContext(
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    module: string,
    extra?: Record<string, unknown>,
  ): void {
    this.winston.log(level, message, this.buildMeta(module, extra));
  }

  /** Log a client-side error to dedicated client log file */
  logClientError(data: Record<string, unknown>): void {
    const redacted = redactSensitive(data) as Record<string, unknown>;
    this.clientLogger.error('Client error', {
      module: 'ClientError',
      ...redacted,
    });
  }

  /** Get the underlying winston instance for advanced use */
  getWinstonInstance(): winston.Logger {
    return this.winston;
  }
}
