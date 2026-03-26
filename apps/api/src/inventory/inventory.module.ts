import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { SaleEventListener } from '../events/sale-event.listener';
import { TransferService } from './transfer.service';
import { WarehouseInvoiceService } from './warehouse-invoice.service';
import { WarehouseInvoiceController, WriteOffController } from './warehouse-invoice.controller';

@Module({
  controllers: [InventoryController, WarehouseInvoiceController, WriteOffController],
  providers: [InventoryService, SaleEventListener, TransferService, WarehouseInvoiceService],
  exports: [InventoryService, TransferService, WarehouseInvoiceService],
})
export class InventoryModule {}
