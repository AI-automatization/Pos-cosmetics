import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ExportService } from './export.service';
import { PdfExportService } from './pdf-export.service';
import { TaxModule } from '../tax/tax.module';
import { RevenueReportsService } from './revenue-reports.service';
import { ZReportService } from './z-report.service';
import { EmployeeActivityService } from './employee-activity.service';

@Module({
  imports: [EventEmitterModule, TaxModule],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    RevenueReportsService,
    ZReportService,
    EmployeeActivityService,
    ExportService,
    PdfExportService,
  ],
  exports: [ReportsService, ExportService, PdfExportService],
})
export class ReportsModule {}
