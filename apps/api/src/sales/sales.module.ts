import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { ShiftsController } from './shifts.controller';

@Module({
  controllers: [SalesController, ShiftsController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}

