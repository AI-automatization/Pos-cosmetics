import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { PriceHistoryService } from './price-history.service';
import { ProductImportService } from './import-export/product-import.service';
import { ProductImportController } from './import-export/product-import.controller';

@Module({
  controllers: [CatalogController, ProductImportController],
  providers: [CatalogService, PriceHistoryService, ProductImportService],
  exports: [CatalogService, PriceHistoryService, ProductImportService],
})
export class CatalogModule {}
