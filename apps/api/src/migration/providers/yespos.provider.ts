import { Logger } from '@nestjs/common';
import type {
  MigrationProvider,
  MigrationData,
  MigrationProduct,
  MigrationCategory,
  MigrationCustomer,
  MigrationProgress,
} from './migration-provider.interface';

const YESPOS_API_BASE = 'https://app.yespos.uz/api/v1';

export class YesPosProvider implements MigrationProvider {
  readonly name = 'yespos';
  readonly displayName = 'YesPOS';
  private readonly logger = new Logger(YesPosProvider.name);

  async validateCredentials(credentials: Record<string, string>): Promise<boolean> {
    const { apiKey } = credentials;
    if (!apiKey) return false;

    try {
      const res = await fetch(`${YESPOS_API_BASE}/products?limit=1`, {
        headers: { Authorization: `Bearer ${apiKey}` },
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
    const { apiKey } = credentials;
    const headers = { Authorization: `Bearer ${apiKey}` };

    onProgress?.({ phase: 'fetching', entity: 'products', processed: 0, total: 0 });

    const [productsRaw, categoriesRaw, customersRaw] = await Promise.all([
      this.fetchEndpoint<Record<string, unknown>>('/products', headers),
      this.fetchEndpoint<Record<string, unknown>>('/categories', headers),
      this.fetchEndpoint<Record<string, unknown>>('/clients', headers),
    ]);

    onProgress?.({ phase: 'mapping', entity: 'all', processed: 0, total: productsRaw.length });

    return {
      provider: this.name,
      products: productsRaw.map((p): MigrationProduct => ({
        externalId: String(p.id ?? ''),
        name: String(p.name ?? ''),
        sku: p.sku ? String(p.sku) : null,
        barcode: p.barcode ? String(p.barcode) : null,
        costPrice: Number(p.cost_price ?? 0),
        sellPrice: Number(p.sell_price ?? p.price ?? 0),
        unit: p.unit ? String(p.unit) : null,
        categoryName: p.category_name ? String(p.category_name) : null,
        description: p.description ? String(p.description) : null,
        minStock: Number(p.min_stock ?? 0),
      })),
      categories: categoriesRaw.map((c): MigrationCategory => ({
        externalId: String(c.id ?? ''),
        name: String(c.name ?? ''),
        parentExternalId: c.parent_id ? String(c.parent_id) : null,
      })),
      customers: customersRaw.map((c): MigrationCustomer => ({
        externalId: String(c.id ?? ''),
        name: String(c.name ?? ''),
        phone: c.phone ? String(c.phone) : null,
        debt: Math.abs(Number(c.balance ?? 0)),
      })),
      branches: [],
      fetchedAt: new Date().toISOString(),
    };
  }

  private async fetchEndpoint<T>(endpoint: string, headers: Record<string, string>): Promise<T[]> {
    try {
      const res = await fetch(`${YESPOS_API_BASE}${endpoint}?limit=1000`, { headers });
      if (!res.ok) {
        this.logger.warn(`YesPOS API error: ${endpoint} status=${res.status}`);
        return [];
      }
      const body = await res.json();
      return Array.isArray(body) ? body : (body.data ?? []);
    } catch (err) {
      this.logger.warn(`YesPOS fetch failed: ${endpoint}`, err);
      return [];
    }
  }
}
