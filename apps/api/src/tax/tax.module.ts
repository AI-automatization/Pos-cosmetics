import { Module } from '@nestjs/common';
import { TaxService } from './tax.service';
import { TaxController } from './tax.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueModule } from '../common/queue/queue.module';
import { FiscalAdapterService } from './fiscal-adapter.service';

@Module({
  imports: [PrismaModule, QueueModule],
  controllers: [TaxController],
  providers: [TaxService, FiscalAdapterService],
  exports: [TaxService, FiscalAdapterService],
})
export class TaxModule {}
