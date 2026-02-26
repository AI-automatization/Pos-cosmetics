import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLoggerService } from '../logger/logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as { message?: string }).message || exception.message;
      code = `HTTP_${status}`;
    }

    const errorData = {
      method: request.method,
      url: request.url,
      status,
      error:
        exception instanceof Error
          ? { name: exception.name, message: exception.message, stack: exception.stack }
          : { message: String(exception) },
    };

    if (status >= 500) {
      this.logger.logWithContext('error', `${request.method} ${request.url} ${status}`, 'Exception', errorData);
    } else {
      this.logger.logWithContext('warn', `${request.method} ${request.url} ${status}`, 'Exception', errorData);
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
