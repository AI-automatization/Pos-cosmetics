import { Global, Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { MetricsSecretGuard } from './metrics-secret.guard';

@Global()
@Module({
  controllers: [MetricsController],
  providers: [MetricsService, MetricsSecretGuard],
  exports: [MetricsService],
})
export class MetricsModule {}
