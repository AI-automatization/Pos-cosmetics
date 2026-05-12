import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiEnginesHelper } from './ai-engines.helper';
import { AiDashboardHelper } from './ai-dashboard.helper';
import { AiController } from './ai.controller';
import { AnalyticsController } from './analytics.controller';

@Module({
  controllers: [AiController, AnalyticsController],
  providers: [AiService, AiEnginesHelper, AiDashboardHelper],
  exports: [AiService],
})
export class AiModule {}
