import { Logger } from '@nestjs/common';
import type {
  MigrationProvider,
  MigrationData,
  MigrationProduct,
  MigrationCategory,
  MigrationProgress,
} from './migration-provider.interface';

/**
 * 1C (CommerceML XML) provider.
 * 1C exports data as CommerceML XML format — standard for post-Soviet accounting.
 * Merchant exports catalog from 1C → pastes XML here.
 */
export class OneCProvider implements MigrationProvider {
  readonly name = '1c';
  readonly displayName = '1C (CommerceML)';
  private readonly logger = new Logger(OneCProvider.name);

  async validateCredentials(credentials: Record<string, string>): Promise<boolean> {
    const { xmlData } = credentials;
    if (!xmlData) return false;
    return xmlData.includes('<КоммерческаяИнформация') || xmlData.includes('<Каталог') || xmlData.includes('<Товар');
  }

  async fetchData(
    credentials: Record<string, string>,
    onProgress?: (p: MigrationProgress) => void,
  ): Promise<MigrationData> {
    const { xmlData } = credentials;

    onProgress?.({ phase: 'mapping', entity: 'xml', processed: 0, total: 0 });

    const products: MigrationProduct[] = [];
    const categorySet = new Map<string, MigrationCategory>();

    // Parse groups (categories)
    const groupRegex = /<Группа>\s*<Ид>([^<]*)<\/Ид>\s*<Наименование>([^<]*)<\/Наименование>/g;
    let groupMatch: RegExpExecArray | null;
    while ((groupMatch = groupRegex.exec(xmlData)) !== null) {
      const id = groupMatch[1]!;
      const name = groupMatch[2]!;
      categorySet.set(id, { externalId: id, name, parentExternalId: null });
    }

    // Parse products
    const productBlocks = xmlData.split(/<Товар>/g).slice(1);

    onProgress?.({ phase: 'mapping', entity: 'products', processed: 0, total: productBlocks.length });

    for (let i = 0; i < productBlocks.length; i++) {
      const block = productBlocks[i]!;

      const id = this.extractTag(block, 'Ид') ?? `1c-${i}`;
      const name = this.extractTag(block, 'Наименование') ?? `Product ${i}`;
      const sku = this.extractTag(block, 'Артикул');
      const barcode = this.extractTag(block, 'Штрихкод');
      const description = this.extractTag(block, 'Описание');

      // Try to find category reference
      const groupId = this.extractTag(block, 'ИдГруппы');
      const categoryName = groupId ? categorySet.get(groupId)?.name ?? null : null;

      // Price extraction
      const priceMatch = block.match(/<ЦенаЗаЕдиницу>([^<]*)<\/ЦенаЗаЕдиницу>/);
      const sellPrice = priceMatch ? parseFloat(priceMatch[1]!) : 0;

      const unitMatch = block.match(/<БазоваяЕдиница[^>]*>([^<]*)<\/БазоваяЕдиница>/);
      const unit = unitMatch ? unitMatch[1]! : null;

      products.push({
        externalId: id,
        name,
        sku: sku || null,
        barcode: barcode || null,
        costPrice: 0,
        sellPrice,
        unit,
        categoryName,
        description: description || null,
        minStock: 0,
      });

      if ((i + 1) % 100 === 0) {
        onProgress?.({ phase: 'mapping', entity: 'products', processed: i + 1, total: productBlocks.length });
      }
    }

    this.logger.log(`1C XML parsed: ${products.length} products, ${categorySet.size} categories`);

    return {
      provider: this.name,
      products,
      categories: Array.from(categorySet.values()),
      customers: [],
      branches: [],
      fetchedAt: new Date().toISOString(),
    };
  }

  private extractTag(block: string, tag: string): string | null {
    const regex = new RegExp(`<${tag}>([^<]*)</${tag}>`);
    const match = block.match(regex);
    return match ? match[1]!.trim() : null;
  }
}
