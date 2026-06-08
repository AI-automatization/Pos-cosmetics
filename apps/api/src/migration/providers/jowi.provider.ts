import { Logger } from '@nestjs/common';
import type {
  MigrationProvider,
  MigrationData,
  MigrationProduct,
  MigrationCategory,
  MigrationProgress,
} from './migration-provider.interface';

/**
 * Jowi POS provider (Uzbekistan restaurant POS).
 * API docs: partner API with API key + secret.
 */
export class JowiProvider implements MigrationProvider {
  readonly name = 'jowi';
  readonly displayName = 'Jowi';
  private readonly logger = new Logger(JowiProvider.name);

  async validateCredentials(credentials: Record<string, string>): Promise<boolean> {
    const { apiKey, apiSecret } = credentials;
    if (!apiKey || !apiSecret) return false;
    try {
      const res = await fetch('https://api.jowi.club/v010/menu', {
        headers: { 'Api-Key': apiKey, 'Api-Secret': apiSecret },
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
    const headers = { 'Api-Key': credentials.apiKey, 'Api-Secret': credentials.apiSecret };

    onProgress?.({ phase: 'fetching', entity: 'menu', processed: 0, total: 0 });

    const menuData = await this.fetchEndpoint<{
      categories: Array<Record<string, unknown>>;
      products: Array<Record<string, unknown>>;
    }>('https://api.jowi.club/v010/menu', headers);

    const cats = menuData?.categories ?? [];
    const prods = menuData?.products ?? [];

    const catMap = new Map<string, string>();
    const categories: MigrationCategory[] = cats.map((c) => {
      const id = String(c.id ?? '');
      const name = String(c.title ?? c.name ?? '');
      catMap.set(id, name);
      return { externalId: id, name, parentExternalId: null };
    });

    onProgress?.({ phase: 'mapping', entity: 'products', processed: 0, total: prods.length });

    return {
      provider: this.name,
      products: prods.map((p): MigrationProduct => ({
        externalId: String(p.id ?? ''),
        name: String(p.title ?? p.name ?? ''),
        sku: null,
        barcode: null,
        costPrice: Number(p.cost_price ?? 0),
        sellPrice: Number(p.price ?? 0),
        unit: null,
        categoryName: catMap.get(String(p.category_id ?? '')) ?? null,
        description: p.description ? String(p.description) : null,
        minStock: 0,
      })),
      categories,
      customers: [],
      branches: [],
      fetchedAt: new Date().toISOString(),
    };
  }

  private async fetchEndpoint<T>(url: string, headers: Record<string, string>): Promise<T | null> {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      return null;
    }
  }
}
