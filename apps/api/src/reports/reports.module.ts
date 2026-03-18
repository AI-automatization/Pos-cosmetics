import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ExportService } from './export.service';

@Module({
  imports: [EventEmitterModule],
  controllers: [ReportsController],
  providers: [ReportsService, ExportService],
  exports: [ReportsService, ExportService],
})
export class ReportsModule {}
