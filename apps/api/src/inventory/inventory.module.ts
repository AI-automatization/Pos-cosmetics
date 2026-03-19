import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { SaleEventListener } from '../events/sale-event.listener';
import { TransferService } from './transfer.service';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService, SaleEventListener, TransferService],
  exports: [InventoryService, TransferService],
})
export class InventoryModule {}
