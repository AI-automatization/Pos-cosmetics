import { Logger } from '@nestjs/common';
import type {
  MigrationProvider,
  MigrationData,
  MigrationProduct,
  MigrationCategory,
  MigrationCustomer,
  MigrationBranch,
  MigrationProgress,
} from './migration-provider.interface';

const BILLZ_API_BASE = 'https://api.billz.uz/v2';

interface BillzProduct {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  cost: number;
  price: number;
  measurement_name: string;
  category_id: string;
  description: string;
  min_quantity: number;
}

interface BillzCategory {
  id: string;
  name: string;
  parent_id: string | null;
}

interface BillzClient {
  id: string;
  name: string;
  phone: string;
  balance: number;
}

interface BillzShop {
  id: string;
  name: string;
  address: string;
}

interface BillzPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export class BillzProvider implements MigrationProvider {
  readonly name = 'billz';
  readonly displayName = 'Billz POS';
  private readonly logger = new Logger(BillzProvider.name);

  async validateCredentials(credentials: Record<string, string>): Promise<boolean> {
    const { secretKey } = credentials;
    if (!secretKey) return false;

    try {
      const res = await fetch(`${BILLZ_API_BASE}/shops?limit=1`, {
        headers: { 'Secret-Key': secretKey },
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
    const { secretKey } = credentials;
    const headers: Record<string, string> = { 'Secret-Key': secretKey ?? '' };

    // 1. Fetch categories
    onProgress?.({ phase: 'fetching', entity: 'categories', processed: 0, total: 0 });
    const categories = await this.fetchAll<BillzCategory>('/categories', headers);
    onProgress?.({ phase: 'fetching', entity: 'categories', processed: categories.length, total: categories.length });

    // 2. Fetch products
    onProgress?.({ phase: 'fetching', entity: 'products', processed: 0, total: 0 });
    const products = await this.fetchAll<BillzProduct>('/products', headers, onProgress);

    // 3. Fetch customers
    onProgress?.({ phase: 'fetching', entity: 'customers', processed: 0, total: 0 });
    const customers = await this.fetchAll<BillzClient>('/clients', headers);
    onProgress?.({ phase: 'fetching', entity: 'customers', processed: customers.length, total: customers.length });

    // 4. Fetch shops/branches
    onProgress?.({ phase: 'fetching', entity: 'branches', processed: 0, total: 0 });
    const shops = await this.fetchAll<BillzShop>('/shops', headers);

    // Map to universal format
    onProgress?.({ phase: 'mapping', entity: 'all', processed: 0, total: products.length + customers.length });

    return {
      provider: this.name,
      products: products.map((p): MigrationProduct => ({
        externalId: p.id,
        name: p.name,
        sku: p.sku || null,
        barcode: p.barcode || null,
        costPrice: p.cost ?? 0,
        sellPrice: p.price ?? 0,
        unit: p.measurement_name || null,
        categoryName: categories.find((c) => c.id === p.category_id)?.name ?? null,
        description: p.description || null,
        minStock: p.min_quantity ?? 0,
      })),
      categories: categories.map((c): MigrationCategory => ({
        externalId: c.id,
        name: c.name,
        parentExternalId: c.parent_id,
      })),
      customers: customers.map((c): MigrationCustomer => ({
        externalId: c.id,
        name: c.name,
        phone: c.phone || null,
        debt: Math.abs(c.balance ?? 0),
      })),
      branches: shops.map((s): MigrationBranch => ({
        externalId: s.id,
        name: s.name,
        address: s.address || null,
      })),
      fetchedAt: new Date().toISOString(),
    };
  }

  private async fetchAll<T>(
    endpoint: string,
    headers: Record<string, string>,
    onProgress?: (p: MigrationProgress) => void,
  ): Promise<T[]> {
    const PAGE_SIZE = 100;
    const all: T[] = [];
    let page = 1;
    let total = 0;

    let hasMore = true;
    while (hasMore) {
      const url = `${BILLZ_API_BASE}${endpoint}?page=${page}&limit=${PAGE_SIZE}`;
      const res = await fetch(url, { headers });

      if (!res.ok) {
        this.logger.warn(`Billz API error: ${endpoint} page=${page} status=${res.status}`);
        break;
      }

      const body = (await res.json()) as BillzPaginatedResponse<T>;
      all.push(...body.data);
      total = body.total;

      const entityName = endpoint.replace('/', '');
      onProgress?.({ phase: 'fetching', entity: entityName, processed: all.length, total });

      hasMore = all.length < total;
      page++;
    }

    return all;
  }
}
