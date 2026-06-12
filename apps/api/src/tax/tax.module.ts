import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TaxService } from './tax.service';
import { TaxController } from './tax.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueModule } from '../common/queue/queue.module';
import { FiscalAdapterService } from './fiscal-adapter.service';
import { ReceiptTemplateService } from './receipt-template.service';
import { FISCAL_ADAPTER, type FiscalAdapter } from './adapters/fiscal-adapter.interface';
import { RegosAdapter } from './adapters/regos.adapter';
import { StubAdapter } from './adapters/stub.adapter';

@Module({
  imports: [PrismaModule, QueueModule],
  controllers: [TaxController],
  providers: [
    TaxService,
    FiscalAdapterService,
    ReceiptTemplateService,
    {
      provide: FISCAL_ADAPTER,
      inject: [ConfigService],
      useFactory: (config: ConfigService): FiscalAdapter => {
        const logger = new Logger('FiscalAdapterFactory');
        const provider = config.get<string>('OFD_PROVIDER', 'STUB').toUpperCase();

        if (provider === 'REGOS' && config.get<string>('OFD_API_URL') && config.get<string>('OFD_API_KEY')) {
          logger.log('Fiscal adapter: REGOS (real OFD)');
          return new RegosAdapter(config);
        }

        if (provider === 'REGOS') {
          logger.warn('OFD_PROVIDER=REGOS but OFD_API_URL/KEY missing — falling back to STUB');
        } else {
          logger.log('Fiscal adapter: STUB (dev/test)');
        }
        return new StubAdapter();
      },
    },
  ],
  exports: [TaxService, FiscalAdapterService, ReceiptTemplateService],
})
export class TaxModule {}
