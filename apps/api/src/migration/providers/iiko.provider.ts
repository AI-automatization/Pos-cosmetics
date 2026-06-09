import type {
  MigrationProvider,
  MigrationData,
  MigrationProduct,
  MigrationCategory,
  MigrationProgress,
} from './migration-provider.interface';

/**
 * iiko Cloud API provider.
 * Docs: https://api-ru.iiko.services/
 * Auth: POST /api/1/access_token with apiLogin → returns token (valid 15 min)
 */
export class IikoProvider implements MigrationProvider {
  readonly name = 'iiko';
  readonly displayName = 'iiko';
  private readonly baseUrl = 'https://api-ru.iiko.services/api/1';

  async validateCredentials(credentials: Record<string, string>): Promise<boolean> {
    try {
      const token = await this.getToken(credentials.apiLogin ?? '');
      return !!token;
    } catch {
      return false;
    }
  }

  async fetchData(
    credentials: Record<string, string>,
    onProgress?: (p: MigrationProgress) => void,
  ): Promise<MigrationData> {
    const token = await this.getToken(credentials.apiLogin);
    if (!token) throw new Error('Failed to get iiko access token');

    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    // Get organizations
    onProgress?.({ phase: 'fetching', entity: 'organizations', processed: 0, total: 0 });
    const orgsRes = await fetch(`${this.baseUrl}/organizations`, {
      method: 'POST', headers, body: JSON.stringify({}),
    });
    const orgsBody = await orgsRes.json() as { organizations: Array<{ id: string; name: string }> };
    const orgId = orgsBody.organizations?.[0]?.id;
    if (!orgId) throw new Error('No iiko organization found');

    // Get nomenclature (products + categories)
    onProgress?.({ phase: 'fetching', entity: 'products', processed: 0, total: 0 });
    const nomRes = await fetch(`${this.baseUrl}/nomenclature`, {
      method: 'POST', headers,
      body: JSON.stringify({ organizationId: orgId }),
    });
    const nom = await nomRes.json() as {
      groups: Array<Record<string, unknown>>;
      products: Array<Record<string, unknown>>;
    };

    const groups = nom.groups ?? [];
    const products = nom.products ?? [];

    const groupMap = new Map<string, string>();
    const categories: MigrationCategory[] = groups.map((g) => {
      const id = String(g.id ?? '');
      const name = String(g.name ?? '');
      groupMap.set(id, name);
      return {
        externalId: id,
        name,
        parentExternalId: g.parentGroup ? String(g.parentGroup) : null,
      };
    });

    onProgress?.({ phase: 'mapping', entity: 'products', processed: 0, total: products.length });

    const mappedProducts: MigrationProduct[] = products
      .filter((p) => p.type === 'dish' || p.type === 'good')
      .map((p) => ({
        externalId: String(p.id ?? ''),
        name: String(p.name ?? ''),
        sku: p.code ? String(p.code) : null,
        barcode: null,
        costPrice: 0,
        sellPrice: this.extractIikoPrice(p),
        unit: p.measureUnit ? String(p.measureUnit) : null,
        categoryName: groupMap.get(String(p.parentGroup ?? '')) ?? null,
        description: p.description ? String(p.description) : null,
        minStock: 0,
      }));

    return {
      provider: this.name,
      products: mappedProducts,
      categories,
      customers: [],
      branches: [],
      fetchedAt: new Date().toISOString(),
    };
  }

  private async getToken(apiLogin: string): Promise<string | null> {
    try {
      const res = await fetch(`${this.baseUrl}/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiLogin }),
      });
      if (!res.ok) return null;
      const body = await res.json() as { token: string };
      return body.token;
    } catch {
      return null;
    }
  }

  private extractIikoPrice(p: Record<string, unknown>): number {
    if (Array.isArray(p.sizePrices) && p.sizePrices.length > 0) {
      const first = p.sizePrices[0] as Record<string, unknown>;
      if (first.price && typeof first.price === 'object') {
        return Number((first.price as Record<string, unknown>).currentPrice ?? 0);
      }
    }
    return 0;
  }
}
