import { apiClient } from './client';

export interface ImportSummary {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export interface ImportProgress {
  processed: number;
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export type UploadResult =
  | ({ mode: 'sync' } & ImportSummary)
  | { mode: 'async'; jobId: string; total: number };

export interface ImportJobStatus {
  status: 'completed' | 'failed' | 'active' | 'waiting' | 'delayed' | 'not_found';
  progress: ImportProgress | null;
  result: ImportSummary | null;
  failedReason?: string;
}

export const importApi = {
  uploadFile(file: File): Promise<UploadResult> {
    const form = new FormData();
    form.append('file', file);
    return apiClient
      .post<UploadResult>('/catalog/products/import', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      })
      .then((r) => r.data);
  },

  getImportStatus(jobId: string): Promise<ImportJobStatus> {
    return apiClient
      .get<ImportJobStatus>(`/catalog/products/import/${jobId}`)
      .then((r) => r.data);
  },

  async downloadTemplate(): Promise<void> {
    const res = await apiClient.get('/catalog/products/import/template', {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'RAOS-import-template.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  },

  async exportXlsx(): Promise<void> {
    const res = await apiClient.get('/catalog/products/export', {
      params: { format: 'xlsx' },
      responseType: 'blob',
    });
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  },

  async exportCsv(): Promise<void> {
    const res = await apiClient.get('/catalog/products/export', {
      params: { format: 'csv' },
      responseType: 'blob',
    });
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    URL.revokeObjectURL(url);
  },
};
