import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { SaleEventListener } from '../events/sale-event.listener';
import { TransferService } from './transfer.service';
import { WarehouseInvoiceService } from './warehouse-invoice.service';
import { WarehouseInvoiceController } from './warehouse-invoice.controller';
import { WriteOffController } from './write-off.controller';
import { StockLevelService } from './stock-level.service';
import { ExpiryTrackingService } from './expiry-tracking.service';
import { StockValueService } from './stock-value.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [InventoryController, WarehouseInvoiceController, WriteOffController],
  providers: [
    InventoryService,
    StockLevelService,
    ExpiryTrackingService,
    StockValueService,
    SaleEventListener,
    TransferService,
    WarehouseInvoiceService,
  ],
  exports: [InventoryService, TransferService, WarehouseInvoiceService],
})
export class InventoryModule {}
