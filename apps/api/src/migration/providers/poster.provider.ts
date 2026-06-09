import { Logger } from '@nestjs/common';
import type {
  MigrationProvider,
  MigrationData,
  MigrationProduct,
  MigrationCategory,
  MigrationCustomer,
  MigrationProgress,
} from './migration-provider.interface';

export class PosterProvider implements MigrationProvider {
  readonly name = 'poster';
  readonly displayName = 'Poster POS';
  private readonly logger = new Logger(PosterProvider.name);

  async validateCredentials(credentials: Record<string, string>): Promise<boolean> {
    const { token } = credentials;
    if (!token) return false;
    try {
      const res = await fetch(
        `https://joinposter.com/api/menu.getCategories?token=${token}&format=json`,
      );
      return res.ok;
    } catch {
      return false;
    }
  }

  async fetchData(
    credentials: Record<string, string>,
    onProgress?: (p: MigrationProgress) => void,
  ): Promise<MigrationData> {
    const { token } = credentials;
    const base = `https://joinposter.com/api`;

    onProgress?.({ phase: 'fetching', entity: 'categories', processed: 0, total: 0 });
    const categoriesRaw = await this.fetchApi<Record<string, unknown>[]>(
      `${base}/menu.getCategories?token=${token}&format=json`,
    );

    onProgress?.({ phase: 'fetching', entity: 'products', processed: 0, total: 0 });
    const productsRaw = await this.fetchApi<Record<string, unknown>[]>(
      `${base}/menu.getProducts?token=${token}&format=json`,
    );

    onProgress?.({ phase: 'fetching', entity: 'customers', processed: 0, total: 0 });
    const customersRaw = await this.fetchApi<Record<string, unknown>[]>(
      `${base}/clients.getClients?token=${token}&format=json`,
    );

    const catMap = new Map<string, string>();
    const categories: MigrationCategory[] = (categoriesRaw ?? []).map((c) => {
      const id = String(c.category_id ?? c.menu_category_id ?? '');
      const name = String(c.category_name ?? '');
      catMap.set(id, name);
      return { externalId: id, name, parentExternalId: c.parent_category ? String(c.parent_category) : null };
    });

    onProgress?.({ phase: 'mapping', entity: 'all', processed: 0, total: (productsRaw ?? []).length });

    return {
      provider: this.name,
      products: (productsRaw ?? []).map((p): MigrationProduct => ({
        externalId: String(p.product_id ?? ''),
        name: String(p.product_name ?? ''),
        sku: p.product_code ? String(p.product_code) : null,
        barcode: p.barcode ? String(p.barcode) : null,
        costPrice: Number(p.cost ?? p.product_production_description ?? 0) / 100,
        sellPrice: Number(p.price && typeof p.price === 'object' ? Object.values(p.price as Record<string, unknown>)[0] : p.price ?? 0) / 100,
        unit: p.unit ? String(p.unit) : null,
        categoryName: catMap.get(String(p.menu_category_id ?? p.category_id ?? '')) ?? null,
        description: null,
        minStock: 0,
      })),
      categories,
      customers: (customersRaw ?? []).map((c): MigrationCustomer => ({
        externalId: String(c.client_id ?? ''),
        name: [c.firstname, c.lastname].filter(Boolean).join(' ') || String(c.client_name ?? 'Unknown'),
        phone: c.phone ? String(c.phone) : null,
        debt: Math.abs(Number(c.bonus ?? 0)),
      })),
      branches: [],
      fetchedAt: new Date().toISOString(),
    };
  }

  private async fetchApi<T>(url: string): Promise<T | null> {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        this.logger.warn(`Poster API error: status=${res.status}`);
        return null;
      }
      const body = await res.json();
      return (body.response ?? body) as T;
    } catch (err) {
      this.logger.warn(`Poster fetch failed`, err);
      return null;
    }
  }
}
