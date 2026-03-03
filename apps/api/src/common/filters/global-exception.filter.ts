import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLoggerService } from '../logger/logger.service';
import { RequestContextService } from '../logger/request-context.service';
import { Prisma } from '@prisma/client';

// Prisma error code → HTTP status + user-friendly message
const PRISMA_ERROR_MAP: Record<string, { status: number; message: string }> = {
  P2002: { status: 409, message: 'Bu ma\'lumot allaqachon mavjud (unique constraint)' },
  P2025: { status: 404, message: 'Ma\'lumot topilmadi' },
  P2003: { status: 400, message: 'Bog\'liq ma\'lumot topilmadi (foreign key)' },
  P2014: { status: 400, message: 'Munosabat o\'zgartirib bo\'lmaydi' },
  P2016: { status: 400, message: 'So\'rovda xatolik' },
  P2021: { status: 500, message: 'Jadval topilmadi. Migration kerak bo\'lishi mumkin.' },
  P2024: { status: 503, message: 'DB ulanish vaqti tugadi. Keyinroq urinib ko\'ring.' },
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly requestContext: RequestContextService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = this.requestContext.getRequestId() ?? request.headers['x-request-id'] as string ?? 'unknown';
    const path = request.url;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Ichki server xatoligi';
    let code = 'INTERNAL_ERROR';

    // ─── HttpException (NestJS, class-validator) ───────────────
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        // class-validator produces { message: string[] }
        message = (resp.message as string | string[]) ?? exception.message;
      }

      code = `HTTP_${status}`;
    }
    // ─── Prisma Known Request Error ────────────────────────────
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = PRISMA_ERROR_MAP[exception.code];
      if (mapped) {
        status = mapped.status;
        message = mapped.message;
        code = `PRISMA_${exception.code}`;
      } else {
        message = 'Bazaviy xatolik yuz berdi';
        code = `PRISMA_${exception.code}`;
      }
    }
    // ─── Prisma Validation Error ───────────────────────────────
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Ma\'lumot formati noto\'g\'ri';
      code = 'PRISMA_VALIDATION';
    }
    // ─── Prisma Initialization Error ──────────────────────────
    else if (exception instanceof Prisma.PrismaClientInitializationError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Bazaga ulanishda xatolik';
      code = 'PRISMA_INIT';
    }

    // ─── Logging ───────────────────────────────────────────────
    const logData = {
      requestId,
      method: request.method,
      path,
      status,
      code,
      error:
        exception instanceof Error
          ? { name: exception.name, message: exception.message, stack: exception.stack }
          : { message: String(exception) },
    };

    if (status >= 500) {
      this.logger.logWithContext('error', `${request.method} ${path} ${status}`, 'Exception', logData);
    } else {
      this.logger.logWithContext('warn', `${request.method} ${path} ${status}`, 'Exception', logData);
    }

    // ─── Response (internal details NEVER exposed) ─────────────
    response.status(status).json({
      success: false,
      error: {
        code,
        message,
      },
      requestId,
      path,
      timestamp: new Date().toISOString(),
    });
  }
}
