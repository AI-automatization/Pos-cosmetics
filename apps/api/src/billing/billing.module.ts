import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingPaymentService } from './billing-payment.service';
import { BillingController } from './billing.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BillingService, BillingPaymentService],
  controllers: [BillingController],
  exports: [BillingService, BillingPaymentService],
})
export class BillingModule {}
