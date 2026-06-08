import { apiClient } from './client';

export interface MigrationProviderInfo {
  name: string;
  displayName: string;
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

export interface MigrationProgress {
  phase: 'fetching' | 'mapping' | 'importing';
  entity: string;
  processed: number;
  total: number;
}

export const migrationApi = {
  getProviders(): Promise<MigrationProviderInfo[]> {
    return apiClient.get<{ data: MigrationProviderInfo[] }>('/migration/providers').then((r) => r.data.data);
  },

  validateCredentials(provider: string, credentials: Record<string, string>): Promise<boolean> {
    return apiClient
      .post<{ data: { valid: boolean } }>('/migration/validate', { provider, credentials })
      .then((r) => r.data.data.valid);
  },

  startMigration(provider: string, credentials: Record<string, string>): Promise<{ jobId: string }> {
    return apiClient
      .post<{ data: { jobId: string } }>('/migration/start', { provider, credentials })
      .then((r) => r.data.data);
  },

  startMigrationSync(provider: string, credentials: Record<string, string>): Promise<MigrationSummary> {
    return apiClient
      .post<{ data: MigrationSummary }>('/migration/start/sync', { provider, credentials }, { timeout: 300000 })
      .then((r) => r.data.data);
  },
};
