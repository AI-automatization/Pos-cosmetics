import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { CatalogCategoryHelper } from './catalog-category.helper';
import { CatalogProductHelper } from './catalog-product.helper';
import { CatalogSupplierHelper } from './catalog-supplier.helper';
import { CatalogVariantPriceHelper } from './catalog-variant-price.helper';
import { PriceHistoryService } from './price-history.service';
import { ProductImportService } from './import-export/product-import.service';
import { ProductImportController } from './import-export/product-import.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [CatalogController, ProductImportController],
  providers: [
    CatalogService,
    CatalogCategoryHelper,
    CatalogProductHelper,
    CatalogSupplierHelper,
    CatalogVariantPriceHelper,
    PriceHistoryService,
    ProductImportService,
  ],
  exports: [CatalogService, PriceHistoryService, ProductImportService],
})
export class CatalogModule {}
