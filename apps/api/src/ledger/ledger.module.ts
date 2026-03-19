import { Module } from '@nestjs/common';
import { LedgerService } from './ledger.service';

// Controller YO'Q — faqat internal service
// Event listeners @OnEvent orqali ishlaydi
@Module({
  providers: [LedgerService],
  exports: [LedgerService],
})
export class LedgerModule {}
