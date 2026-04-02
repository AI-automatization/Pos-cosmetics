import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../decorators';
import { AppLoggerService } from './logger.service';
import { ClientLogDto } from './client-log.dto';

@ApiTags('Logs')
@Controller('logs')
export class ClientLogController {
  constructor(private readonly logger: AppLoggerService) {}

  @Post('client-error')
  @Public()
  @Throttle({ default: { ttl: 60000, limit: 30 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Report client-side error (web/mobile/pos)' })
  @ApiResponse({ status: 204, description: 'Error logged successfully' })
  reportError(@Body() dto: ClientLogDto): void {
    this.logger.logClientError({
      source: dto.source,
      error: dto.error,
      stack: dto.stack,
      url: dto.url,
      userAgent: dto.userAgent,
      tenantId: dto.tenantId,
      userId: dto.userId,
    });
  }
}
