import { Logger } from '@nestjs/common';
import type {
  MigrationProvider,
  MigrationData,
  MigrationProduct,
  MigrationCategory,
  MigrationProgress,
} from './migration-provider.interface';

/**
 * R-Keeper Cloud API provider.
 * R-Keeper uses XML-based API with license key auth.
 * Simplified version — works with R-Keeper 7 Cloud API.
 */
export class RKeeperProvider implements MigrationProvider {
  readonly name = 'rkeeper';
  readonly displayName = 'R-Keeper';
  private readonly logger = new Logger(RKeeperProvider.name);

  async validateCredentials(credentials: Record<string, string>): Promise<boolean> {
    const { serverUrl, apiKey } = credentials;
    if (!serverUrl || !apiKey) return false;
    try {
      const res = await fetch(`${serverUrl}/api/v1/menu/categories`, {
        headers: { 'X-Api-Key': apiKey },
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
    const { serverUrl, apiKey } = credentials;
    const headers = { 'X-Api-Key': apiKey };

    onProgress?.({ phase: 'fetching', entity: 'menu', processed: 0, total: 0 });

    const [categoriesRaw, productsRaw] = await Promise.all([
      this.fetchEndpoint<Record<string, unknown>[]>(`${serverUrl}/api/v1/menu/categories`, headers),
      this.fetchEndpoint<Record<string, unknown>[]>(`${serverUrl}/api/v1/menu/items`, headers),
    ]);

    const catMap = new Map<string, string>();
    const categories: MigrationCategory[] = (categoriesRaw ?? []).map((c) => {
      const id = String(c.id ?? c.ident ?? '');
      const name = String(c.name ?? '');
      catMap.set(id, name);
      return { externalId: id, name, parentExternalId: c.parent_id ? String(c.parent_id) : null };
    });

    onProgress?.({ phase: 'mapping', entity: 'products', processed: 0, total: (productsRaw ?? []).length });

    return {
      provider: this.name,
      products: (productsRaw ?? []).map((p): MigrationProduct => ({
        externalId: String(p.id ?? p.ident ?? ''),
        name: String(p.name ?? ''),
        sku: p.code ? String(p.code) : null,
        barcode: p.barcode ? String(p.barcode) : null,
        costPrice: Number(p.cost ?? 0),
        sellPrice: Number(p.price ?? 0),
        unit: p.unit ? String(p.unit) : null,
        categoryName: catMap.get(String(p.category_id ?? p.catIdent ?? '')) ?? null,
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
