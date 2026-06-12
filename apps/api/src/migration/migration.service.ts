import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  MigrationProvider,
  MigrationData,
  MigrationSummary,
  MigrationProgress,
} from './providers/migration-provider.interface';
import { BillzProvider } from './providers/billz.provider';
import { YesPosProvider } from './providers/yespos.provider';
import { CsvProvider } from './providers/csv.provider';
import { MoySkladProvider } from './providers/moysklad.provider';
import { PosterProvider } from './providers/poster.provider';
import { IikoProvider } from './providers/iiko.provider';
import { RKeeperProvider } from './providers/rkeeper.provider';
import { JowiProvider } from './providers/jowi.provider';
import { OneCProvider } from './providers/onec.provider';
import { SmartdoProvider } from './providers/smartdo.provider';
import { OptimoProvider } from './providers/optimo.provider';

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);
  private readonly providers: Map<string, MigrationProvider>;

  constructor(private readonly prisma: PrismaService) {
    this.providers = new Map<string, MigrationProvider>([
      ['billz', new BillzProvider()],
      ['yespos', new YesPosProvider()],
      ['moysklad', new MoySkladProvider()],
      ['poster', new PosterProvider()],
      ['iiko', new IikoProvider()],
      ['rkeeper', new RKeeperProvider()],
      ['jowi', new JowiProvider()],
      ['1c', new OneCProvider()],
      ['smartdo', new SmartdoProvider()],
      ['optimo', new OptimoProvider()],
      ['csv', new CsvProvider()],
    ]);
  }

  getAvailableProviders() {
    return Array.from(this.providers.values()).map((p) => ({
      name: p.name,
      displayName: p.displayName,
    }));
  }

  async validateCredentials(provider: string, credentials: Record<string, string>): Promise<boolean> {
    const p = this.getProvider(provider);
    return p.validateCredentials(credentials);
  }

  async runMigration(
    tenantId: string,
    provider: string,
    credentials: Record<string, string>,
    onProgress?: (p: MigrationProgress) => void,
  ): Promise<MigrationSummary> {
    const start = Date.now();
    const p = this.getProvider(provider);

    this.logger.log(`Migration started: provider=${provider} tenant=${tenantId}`);

    // 1. Fetch data from source
    const data = await p.fetchData(credentials, onProgress);

    this.logger.log(
      `Fetched from ${provider}: ${data.products.length} products, ` +
      `${data.categories.length} categories, ${data.customers.length} customers`,
    );

    // 2. Import into RAOS
    const summary = await this.importData(tenantId, data, onProgress);
    summary.durationMs = Date.now() - start;

    this.logger.log(
      `Migration completed: provider=${provider} tenant=${tenantId} ` +
      `products=${summary.products.created}/${summary.products.updated}/${summary.products.skipped} ` +
      `duration=${summary.durationMs}ms`,
    );

    return summary;
  }

  private async importData(
    tenantId: string,
    data: MigrationData,
    onProgress?: (p: MigrationProgress) => void,
  ): Promise<MigrationSummary> {
    const summary: MigrationSummary = {
      provider: data.provider,
      categories: { created: 0, skipped: 0 },
      products: { created: 0, updated: 0, skipped: 0 },
      customers: { created: 0, updated: 0, skipped: 0 },
      branches: { fetched: data.branches.length },
      errors: [],
      durationMs: 0,
    };

    // Phase 1: Categories
    const categoryMap = new Map<string, string>(); // externalName -> RAOS categoryId
    onProgress?.({ phase: 'importing', entity: 'categories', processed: 0, total: data.categories.length });

    for (const cat of data.categories) {
      try {
        const existing = await this.prisma.category.findFirst({
          where: { tenantId, name: cat.name },
        });

        if (existing) {
          categoryMap.set(cat.name, existing.id.toString());
          summary.categories.skipped++;
        } else {
          const created = await this.prisma.category.create({
            data: { tenantId, name: cat.name },
          });
          categoryMap.set(cat.name, created.id.toString());
          summary.categories.created++;
        }
      } catch (err) {
        summary.errors.push(`Category "${cat.name}": ${(err as Error).message}`);
      }
    }

    // Phase 2: Products (upsert by barcode or SKU)
    onProgress?.({ phase: 'importing', entity: 'products', processed: 0, total: data.products.length });

    // Preload existing products for duplicate detection
    const existingProducts = await this.prisma.product.findMany({
      where: { tenantId },
      select: { id: true, sku: true, barcode: true },
    });

    const skuMap = new Map(existingProducts.filter((p) => p.sku).map((p) => [p.sku!, p.id]));
    const barcodeMap = new Map(existingProducts.filter((p) => p.barcode).map((p) => [p.barcode!, p.id]));

    // Get default unit
    const defaultUnit = await this.prisma.unit.findFirst({
      where: { tenantId },
      orderBy: { id: 'asc' },
    });

    for (let i = 0; i < data.products.length; i++) {
      const prod = data.products[i]!;

      try {
        const existingId = (prod.barcode && barcodeMap.get(prod.barcode))
          || (prod.sku && skuMap.get(prod.sku));

        const categoryId = prod.categoryName ? categoryMap.get(prod.categoryName) : null;

        if (existingId) {
          // Update existing product
          await this.prisma.product.update({
            where: { id: existingId },
            data: {
              name: prod.name,
              costPrice: prod.costPrice,
              sellPrice: prod.sellPrice,
              description: prod.description,
              minStockLevel: prod.minStock,
              ...(categoryId ? { categoryId } : {}),
            },
          });
          summary.products.updated++;
        } else {
          // Create new product
          const created = await this.prisma.product.create({
            data: {
              tenantId,
              name: prod.name,
              sku: prod.sku,
              barcode: prod.barcode,
              costPrice: prod.costPrice,
              sellPrice: prod.sellPrice,
              description: prod.description,
              minStockLevel: prod.minStock,
              ...(categoryId ? { categoryId } : {}),
              ...(defaultUnit ? { unitId: defaultUnit.id } : {}),
            },
          });

          // Track for duplicate detection within this import
          if (prod.sku) skuMap.set(prod.sku, created.id);
          if (prod.barcode) barcodeMap.set(prod.barcode, created.id);
          summary.products.created++;
        }
      } catch (err) {
        summary.errors.push(`Product "${prod.name}": ${(err as Error).message}`);
        summary.products.skipped++;
      }

      if ((i + 1) % 50 === 0) {
        onProgress?.({ phase: 'importing', entity: 'products', processed: i + 1, total: data.products.length });
      }
    }

    // Phase 3: Customers (upsert by phone)
    onProgress?.({ phase: 'importing', entity: 'customers', processed: 0, total: data.customers.length });

    for (let i = 0; i < data.customers.length; i++) {
      const cust = data.customers[i]!;

      try {
        if (cust.phone) {
          const existing = await this.prisma.customer.findFirst({
            where: { tenantId, phone: cust.phone },
          });

          if (existing) {
            await this.prisma.customer.update({
              where: { id: existing.id },
              data: { name: cust.name },
            });
            summary.customers.updated++;
          } else {
            await this.prisma.customer.create({
              data: { tenantId, name: cust.name, phone: cust.phone },
            });
            summary.customers.created++;
          }
        } else {
          await this.prisma.customer.create({
            data: { tenantId, name: cust.name },
          });
          summary.customers.created++;
        }
      } catch (err) {
        summary.errors.push(`Customer "${cust.name}": ${(err as Error).message}`);
        summary.customers.skipped++;
      }
    }

    return summary;
  }

  private getProvider(name: string): MigrationProvider {
    const p = this.providers.get(name);
    if (!p) throw new BadRequestException(`Unknown migration provider: ${name}`);
    return p;
  }
}
