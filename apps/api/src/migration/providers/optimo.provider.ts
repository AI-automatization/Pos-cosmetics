import { Logger } from '@nestjs/common';
import type {
  MigrationProvider,
  MigrationData,
  MigrationProduct,
  MigrationCategory,
  MigrationCustomer,
  MigrationProgress,
} from './migration-provider.interface';

/**
 * Optimo POS provider (Georgian, expanding to UZ).
 * API: REST with bearer token.
 */
export class OptimoProvider implements MigrationProvider {
  readonly name = 'optimo';
  readonly displayName = 'Optimo';
  private readonly logger = new Logger(OptimoProvider.name);

  async validateCredentials(credentials: Record<string, string>): Promise<boolean> {
    const { apiUrl, token } = credentials;
    if (!apiUrl || !token) return false;
    try {
      const res = await fetch(`${apiUrl}/api/v1/products?limit=1`, {
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
    const { apiUrl, token } = credentials;
    const headers = { Authorization: `Bearer ${token}` };

    onProgress?.({ phase: 'fetching', entity: 'products', processed: 0, total: 0 });

    const [productsRaw, categoriesRaw, customersRaw] = await Promise.all([
      this.fetchEndpoint<Record<string, unknown>[]>(`${apiUrl}/api/v1/products`, headers),
      this.fetchEndpoint<Record<string, unknown>[]>(`${apiUrl}/api/v1/categories`, headers),
      this.fetchEndpoint<Record<string, unknown>[]>(`${apiUrl}/api/v1/customers`, headers),
    ]);

    const catMap = new Map<string, string>();
    const categories: MigrationCategory[] = (categoriesRaw ?? []).map((c) => {
      const id = String(c.id ?? '');
      const name = String(c.name ?? '');
      catMap.set(id, name);
      return { externalId: id, name, parentExternalId: c.parent_id ? String(c.parent_id) : null };
    });

    onProgress?.({ phase: 'mapping', entity: 'all', processed: 0, total: (productsRaw ?? []).length });

    return {
      provider: this.name,
      products: (productsRaw ?? []).map((p): MigrationProduct => ({
        externalId: String(p.id ?? ''),
        name: String(p.name ?? ''),
        sku: p.sku ? String(p.sku) : null,
        barcode: p.barcode ? String(p.barcode) : null,
        costPrice: Number(p.cost_price ?? 0),
        sellPrice: Number(p.price ?? 0),
        unit: p.unit ? String(p.unit) : null,
        categoryName: catMap.get(String(p.category_id ?? '')) ?? null,
        description: p.description ? String(p.description) : null,
        minStock: Number(p.min_stock ?? 0),
      })),
      categories,
      customers: (customersRaw ?? []).map((c): MigrationCustomer => ({
        externalId: String(c.id ?? ''),
        name: String(c.name ?? ''),
        phone: c.phone ? String(c.phone) : null,
        debt: Math.abs(Number(c.balance ?? 0)),
      })),
      branches: [],
      fetchedAt: new Date().toISOString(),
    };
  }

  private async fetchEndpoint<T>(url: string, headers: Record<string, string>): Promise<T | null> {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) return null;
      const body = await res.json();
      return (Array.isArray(body) ? body : body.data ?? []) as T;
    } catch {
      return null;
    }
  }
}
