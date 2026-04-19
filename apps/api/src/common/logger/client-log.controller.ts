import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../decorators';
import { AppLoggerService } from './logger.service';
import { ClientLogDto } from './client-log.dto';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Logs')
@Controller('logs')
export class ClientLogController {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('client-error')
  @Public()
  @Throttle({ default: { ttl: 60000, limit: 30 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Report client-side error (web/mobile/pos)' })
  @ApiResponse({ status: 204, description: 'Error logged successfully' })
  async reportError(@Body() dto: ClientLogDto): Promise<void> {
    this.logger.logClientError({
      source: dto.source,
      error: dto.error,
      stack: dto.stack,
      url: dto.url,
      userAgent: dto.userAgent,
      tenantId: dto.tenantId,
      userId: dto.userId,
    });

    // Persist to DB for founder dashboard analytics (fire-and-forget)
    this.prisma.clientErrorLog.create({
      data: {
        source: dto.source,
        type: 'CLIENT',
        severity: 'ERROR',
        message: dto.error,
        stack: dto.stack ?? null,
        url: dto.url ?? null,
        userAgent: dto.userAgent ?? null,
        tenantId: dto.tenantId ?? null,
        userId: dto.userId ?? null,
      },
    }).catch(() => { /* ignore DB errors — file log is primary */ });
  }
}
