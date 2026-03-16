import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AnalyticsController } from './analytics.controller';

@Module({
  controllers: [AiController, AnalyticsController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
