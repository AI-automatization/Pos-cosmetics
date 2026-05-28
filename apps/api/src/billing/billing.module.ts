import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingPaymentService } from './billing-payment.service';
import { BillingInvoiceService } from './billing-invoice.service';
import { BillingController } from './billing.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BillingService, BillingPaymentService, BillingInvoiceService],
  controllers: [BillingController],
  exports: [BillingService, BillingPaymentService, BillingInvoiceService],
})
export class BillingModule {}
