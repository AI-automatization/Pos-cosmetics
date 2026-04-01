import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '../common/decorators';
import { MetricsService } from './metrics.service';
import { MetricsSecretGuard } from './metrics-secret.guard';

/**
 * GET /api/v1/metrics
 * Prometheus-format metrics endpoint.
 * T-348: X-Metrics-Secret header bilan himoyalangan.
 * Prometheus config: --header 'X-Metrics-Secret: <METRICS_SECRET>'
 */
@ApiTags('Metrics')
@Controller('metrics')
@Public()
@UseGuards(MetricsSecretGuard)
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @Get()
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Prometheus metrics (X-Metrics-Secret required)' })
  async getMetrics(@Res() res: Response) {
    const text = await this.metrics.collect();
    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.status(200).end(text);
  }
}
