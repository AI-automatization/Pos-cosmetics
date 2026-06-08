import { Logger } from '@nestjs/common';
import type {
  MigrationProvider,
  MigrationData,
  MigrationProduct,
  MigrationCategory,
  MigrationProgress,
} from './migration-provider.interface';

/**
 * Smartdo POS provider.
 * Smartdo uses CSV/Excel export. Merchant exports from Smartdo app → uploads here.
 * Column format: Nomi, Shtrixkod, Narxi, Tan narxi, Kategoriya, Birlik
 */
export class SmartdoProvider implements MigrationProvider {
  readonly name = 'smartdo';
  readonly displayName = 'Smartdo';
  private readonly logger = new Logger(SmartdoProvider.name);

  async validateCredentials(credentials: Record<string, string>): Promise<boolean> {
    return !!credentials.csvData && credentials.csvData.trim().length > 10;
  }

  async fetchData(
    credentials: Record<string, string>,
    onProgress?: (p: MigrationProgress) => void,
  ): Promise<MigrationData> {
    const { csvData } = credentials;
    const lines = csvData.split('\n').filter((l) => l.trim());
    if (lines.length < 2) {
      return { provider: this.name, products: [], categories: [], customers: [], branches: [], fetchedAt: new Date().toISOString() };
    }

    const headers = this.parseLine(lines[0]!).map((h) => h.toLowerCase().trim());

    const products: MigrationProduct[] = [];
    const categorySet = new Set<string>();

    onProgress?.({ phase: 'mapping', entity: 'products', processed: 0, total: lines.length - 1 });

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseLine(lines[i]!);
      const row = Object.fromEntries(headers.map((h, idx) => [h, values[idx] ?? '']));

      const cat = row['kategoriya'] || row['category'] || row['категория'] || null;
      if (cat) categorySet.add(cat);

      products.push({
        externalId: `smartdo-${i}`,
        name: row['nomi'] || row['name'] || row['наименование'] || `Product ${i}`,
        sku: row['artikul'] || row['sku'] || null,
        barcode: row['shtrixkod'] || row['barcode'] || row['штрихкод'] || null,
        costPrice: parseFloat(row['tan narxi'] || row['cost'] || row['себестоимость'] || '0') || 0,
        sellPrice: parseFloat(row['narxi'] || row['price'] || row['цена'] || '0') || 0,
        unit: row['birlik'] || row['unit'] || null,
        categoryName: cat,
        description: null,
        minStock: 0,
      });
    }

    const categories: MigrationCategory[] = Array.from(categorySet).map((name, idx) => ({
      externalId: `smartdo-cat-${idx}`, name, parentExternalId: null,
    }));

    this.logger.log(`Smartdo parsed: ${products.length} products, ${categories.length} categories`);

    return { provider: this.name, products, categories, customers: [], branches: [], fetchedAt: new Date().toISOString() };
  }

  private parseLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; }
      else if ((char === ',' || char === ';' || char === '\t') && !inQuotes) { result.push(current.trim()); current = ''; }
      else { current += char; }
    }
    result.push(current.trim());
    return result;
  }
}
