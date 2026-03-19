import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Response } from 'express';
import { Public } from '../common/decorators';
import { MetricsService } from './metrics.service';

// Prometheus scrapes this endpoint — exempt from rate limiting + auth
@SkipThrottle()
@ApiTags('Metrics')
@Controller('metrics')
@Public()
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  /**
   * GET /api/v1/metrics
   * Prometheus-format metrics endpoint.
   * Access should be restricted at nginx level (allow only internal network).
   */
  @Get()
  @ApiExcludeEndpoint() // Don't show in Swagger (internal endpoint)
  @ApiOperation({ summary: 'Prometheus metrics' })
  async getMetrics(@Res() res: Response) {
    const text = await this.metrics.collect();
    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.status(200).end(text);
  }
}
