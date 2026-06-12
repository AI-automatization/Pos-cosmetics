/**
 * Universal interface for migrating data from external POS systems.
 * Each provider (Billz, YesPOS, 1C, etc.) implements this interface.
 */

export interface MigrationProduct {
  externalId: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  costPrice: number;
  sellPrice: number;
  unit: string | null;
  categoryName: string | null;
  description: string | null;
  minStock: number;
  variants?: MigrationVariant[];
}

export interface MigrationVariant {
  externalId: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  costPrice: number;
  sellPrice: number;
  stock: number;
}

export interface MigrationCategory {
  externalId: string;
  name: string;
  parentExternalId: string | null;
}

export interface MigrationCustomer {
  externalId: string;
  name: string;
  phone: string | null;
  debt: number;
}

export interface MigrationBranch {
  externalId: string;
  name: string;
  address: string | null;
}

export interface MigrationData {
  provider: string;
  products: MigrationProduct[];
  categories: MigrationCategory[];
  customers: MigrationCustomer[];
  branches: MigrationBranch[];
  fetchedAt: string;
}

export interface MigrationProgress {
  phase: 'fetching' | 'mapping' | 'importing';
  entity: string;
  processed: number;
  total: number;
}

export interface MigrationSummary {
  provider: string;
  categories: { created: number; skipped: number };
  products: { created: number; updated: number; skipped: number };
  customers: { created: number; updated: number; skipped: number };
  branches: { fetched: number };
  errors: string[];
  durationMs: number;
}

export interface MigrationProvider {
  readonly name: string;
  readonly displayName: string;

  /** Validate credentials before fetching */
  validateCredentials(credentials: Record<string, string>): Promise<boolean>;

  /** Fetch all data from external system */
  fetchData(
    credentials: Record<string, string>,
    onProgress?: (p: MigrationProgress) => void,
  ): Promise<MigrationData>;
}
