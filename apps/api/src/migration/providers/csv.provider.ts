import { Logger } from '@nestjs/common';
import type {
  MigrationProvider,
  MigrationData,
  MigrationProduct,
  MigrationCategory,
  MigrationProgress,
} from './migration-provider.interface';

/**
 * Universal CSV/Excel provider for systems without API (1C, Regos, SmartPOS, etc.)
 * Merchant exports data from old system as CSV → uploads to RAOS.
 */
export class CsvProvider implements MigrationProvider {
  readonly name = 'csv';
  readonly displayName = 'CSV / Excel (universal)';
  private readonly logger = new Logger(CsvProvider.name);

  async validateCredentials(credentials: Record<string, string>): Promise<boolean> {
    return !!credentials.csvData;
  }

  async fetchData(
    credentials: Record<string, string>,
    onProgress?: (p: MigrationProgress) => void,
  ): Promise<MigrationData> {
    const csvData = credentials.csvData ?? '';
    const lines = csvData.split('\n').filter((l) => l.trim());

    if (lines.length < 2) {
      return { provider: this.name, products: [], categories: [], customers: [], branches: [], fetchedAt: new Date().toISOString() };
    }

    const headerLine = lines[0]!;
    const headers = this.parseCsvLine(headerLine).map((h) => h.toLowerCase().trim());

    onProgress?.({ phase: 'mapping', entity: 'products', processed: 0, total: lines.length - 1 });

    const products: MigrationProduct[] = [];
    const categorySet = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i]!);
      const row = Object.fromEntries(headers.map((h, idx) => [h, values[idx] ?? '']));

      const categoryName = row['category'] || row['kategoriya'] || row['категория'] || null;
      if (categoryName) categorySet.add(categoryName);

      products.push({
        externalId: `csv-${i}`,
        name: row['name'] || row['nomi'] || row['наименование'] || row['товар'] || `Product ${i}`,
        sku: row['sku'] || row['artikul'] || row['артикул'] || null,
        barcode: row['barcode'] || row['shtrixkod'] || row['штрихкод'] || null,
        costPrice: parseFloat(row['cost'] || row['tannarx'] || row['себестоимость'] || '0') || 0,
        sellPrice: parseFloat(row['price'] || row['narx'] || row['цена'] || '0') || 0,
        unit: row['unit'] || row['birlik'] || row['ед'] || null,
        categoryName,
        description: row['description'] || row['tavsif'] || row['описание'] || null,
        minStock: parseInt(row['min_stock'] || row['min'] || '0', 10) || 0,
      });

      if (i % 100 === 0) {
        onProgress?.({ phase: 'mapping', entity: 'products', processed: i, total: lines.length - 1 });
      }
    }

    const categories: MigrationCategory[] = Array.from(categorySet).map((name, idx) => ({
      externalId: `csv-cat-${idx}`,
      name,
      parentExternalId: null,
    }));

    this.logger.log(`CSV parsed: ${products.length} products, ${categories.length} categories`);

    return {
      provider: this.name,
      products,
      categories,
      customers: [],
      branches: [],
      fetchedAt: new Date().toISOString(),
    };
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if ((char === ',' || char === ';') && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }
}
