import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { ShiftService } from './shift.service';
import { OrderService } from './order.service';
import { ReturnService } from './return.service';
import { SalesController } from './sales.controller';
import { ShiftsController } from './shifts.controller';

@Module({
  controllers: [SalesController, ShiftsController],
  providers: [SalesService, ShiftService, OrderService, ReturnService],
  exports: [SalesService],
})
export class SalesModule {}

