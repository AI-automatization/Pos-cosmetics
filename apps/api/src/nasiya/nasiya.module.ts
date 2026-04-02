import { Module } from '@nestjs/common';
import { NasiyaService } from './nasiya.service';
import { NasiyaController } from './nasiya.controller';
import { DebtsController } from './debts.controller';

@Module({
  controllers: [NasiyaController, DebtsController],
  providers: [NasiyaService],
  exports: [NasiyaService],
})
export class NasiyaModule {}
