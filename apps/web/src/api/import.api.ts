import { apiClient } from './client';

export const importApi = {
  uploadFile(
    file: File,
  ): Promise<{ created: number; updated: number; errors: string[] }> {
    const form = new FormData();
    form.append('file', file);
    return apiClient
      .post<{ created: number; updated: number; errors: string[] }>(
        '/catalog/products/import',
        form,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 120000,
        },
      )
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
