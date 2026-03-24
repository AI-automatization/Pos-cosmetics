import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymeProvider } from './providers/payme.provider';
import { ClickProvider } from './providers/click.provider';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymeProvider, ClickProvider],
  exports: [PaymentsService, PaymeProvider, ClickProvider],
})
export class PaymentsModule {}
