import { Logger } from '@nestjs/common';
import type {
  MigrationProvider,
  MigrationData,
  MigrationProduct,
  MigrationCategory,
  MigrationCustomer,
  MigrationProgress,
} from './migration-provider.interface';

const MOYSKLAD_API = 'https://api.moysklad.ru/api/remap/1.2';

export class MoySkladProvider implements MigrationProvider {
  readonly name = 'moysklad';
  readonly displayName = 'МойСклад';
  private readonly logger = new Logger(MoySkladProvider.name);

  async validateCredentials(credentials: Record<string, string>): Promise<boolean> {
    const { token } = credentials;
    if (!token) return false;
    try {
      const res = await fetch(`${MOYSKLAD_API}/entity/product?limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async fetchData(
    credentials: Record<string, string>,
    onProgress?: (p: MigrationProgress) => void,
  ): Promise<MigrationData> {
    const headers = { Authorization: `Bearer ${credentials.token}` };

    onProgress?.({ phase: 'fetching', entity: 'categories', processed: 0, total: 0 });
    const categories = await this.fetchPaginated<Record<string, unknown>>(
      '/entity/productfolder', headers,
    );

    onProgress?.({ phase: 'fetching', entity: 'products', processed: 0, total: 0 });
    const products = await this.fetchPaginated<Record<string, unknown>>(
      '/entity/product', headers, onProgress,
    );

    onProgress?.({ phase: 'fetching', entity: 'customers', processed: 0, total: 0 });
    const customers = await this.fetchPaginated<Record<string, unknown>>(
      '/entity/counterparty', headers,
    );

    const categoryIdMap = new Map<string, string>();
    const mappedCategories: MigrationCategory[] = categories.map((c) => {
      const id = this.extractId(c);
      categoryIdMap.set(String(c.meta && typeof c.meta === 'object' ? (c.meta as Record<string, unknown>).href : ''), String(c.name ?? ''));
      return {
        externalId: id,
        name: String(c.name ?? ''),
        parentExternalId: null,
      };
    });

    onProgress?.({ phase: 'mapping', entity: 'all', processed: 0, total: products.length });

    return {
      provider: this.name,
      products: products.map((p): MigrationProduct => {
        const folderHref = p.productFolder && typeof p.productFolder === 'object'
          ? ((p.productFolder as Record<string, unknown>).meta as Record<string, unknown>)?.href
          : null;
        return {
          externalId: this.extractId(p),
          name: String(p.name ?? ''),
          sku: p.article ? String(p.article) : null,
          barcode: this.extractBarcode(p),
          costPrice: this.extractPrice(p, 'buyPrice'),
          sellPrice: this.extractPrice(p, 'salePrices'),
          unit: null,
          categoryName: folderHref ? categoryIdMap.get(String(folderHref)) ?? null : null,
          description: p.description ? String(p.description) : null,
          minStock: Number(p.minimumBalance ?? 0),
        };
      }),
      categories: mappedCategories,
      customers: customers.map((c): MigrationCustomer => ({
        externalId: this.extractId(c),
        name: String(c.name ?? ''),
        phone: c.phone ? String(c.phone) : null,
        debt: 0,
      })),
      branches: [],
      fetchedAt: new Date().toISOString(),
    };
  }

  private extractId(obj: Record<string, unknown>): string {
    return String(obj.id ?? '');
  }

  private extractBarcode(p: Record<string, unknown>): string | null {
    if (Array.isArray(p.barcodes) && p.barcodes.length > 0) {
      const first = p.barcodes[0] as Record<string, unknown>;
      return String(first.ean13 ?? first.ean8 ?? first.code128 ?? '');
    }
    return null;
  }

  private extractPrice(p: Record<string, unknown>, field: string): number {
    if (field === 'salePrices' && Array.isArray(p.salePrices) && p.salePrices.length > 0) {
      return Number((p.salePrices[0] as Record<string, unknown>).value ?? 0) / 100;
    }
    if (field === 'buyPrice' && p.buyPrice && typeof p.buyPrice === 'object') {
      return Number((p.buyPrice as Record<string, unknown>).value ?? 0) / 100;
    }
    return 0;
  }

  private async fetchPaginated<T>(
    endpoint: string,
    headers: Record<string, string>,
    onProgress?: (p: MigrationProgress) => void,
  ): Promise<T[]> {
    const all: T[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const url = `${MOYSKLAD_API}${endpoint}?limit=${limit}&offset=${offset}`;
      const res = await fetch(url, { headers });
      if (!res.ok) break;

      const body = await res.json() as { rows: T[]; meta: { size: number } };
      all.push(...body.rows);

      const entity = endpoint.split('/').pop() ?? '';
      onProgress?.({ phase: 'fetching', entity, processed: all.length, total: body.meta.size });

      if (all.length >= body.meta.size) break;
      offset += limit;
    }
    return all;
  }
}
