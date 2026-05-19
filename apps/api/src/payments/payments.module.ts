import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentConfigController } from './payment-config.controller';
import { PaymentConfigService } from './payment-config.service';
import { PaymeProvider } from './providers/payme.provider';
import { ClickProvider } from './providers/click.provider';
import { UzumProvider } from './providers/uzum.provider';
import { PaymentReconciliationService } from './payment-reconciliation.service';

@Module({
  controllers: [PaymentsController, PaymentConfigController],
  providers: [
    PaymentsService,
    PaymentConfigService,
    PaymeProvider,
    ClickProvider,
    UzumProvider,
    PaymentReconciliationService,
  ],
  exports: [PaymentsService, PaymentConfigService, PaymeProvider, ClickProvider, UzumProvider],
})
export class PaymentsModule {}
