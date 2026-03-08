import { apiClient } from './client';
import type { Return, CreateReturnDto } from '@/types/returns';
import { AxiosError } from 'axios';

export const returnsApi = {
  // Backend has no GET /sales/returns list endpoint — returns empty array gracefully
  listReturns(params?: { status?: string; from?: string; to?: string }): Promise<Return[]> {
    return apiClient
      .get<Return[]>('/sales/returns', { params })
      .then((r) => {
        const data = r.data as unknown;
        return (Array.isArray(data) ? data : (data as { items?: Return[] }).items ?? []) as Return[];
      })
      .catch((err: unknown) => {
        // 404 = endpoint not implemented yet — return empty list
        if (err instanceof AxiosError && err.response?.status === 404) return [];
        return Promise.reject(err);
      });
  },
  getReturn(id: string) {
    return apiClient.get<Return>(`/sales/returns/${id}`).then((r) => r.data);
  },
  createReturn(dto: CreateReturnDto) {
    return apiClient.post<Return>('/sales/returns', dto).then((r) => r.data);
  },
  // Backend: PATCH /sales/returns/:id/approve (not POST)
  approveReturn(id: string, adminPin: string) {
    return apiClient.patch<Return>(`/sales/returns/${id}/approve`, { adminPin }).then((r) => r.data);
  },
  // Backend has no reject endpoint — throw informative error
  rejectReturn(id: string, note: string) {
    return apiClient
      .post<Return>(`/sales/returns/${id}/reject`, { note })
      .then((r) => r.data)
      .catch((err: unknown) => {
        if (err instanceof AxiosError && err.response?.status === 404) {
          return Promise.reject(new Error('Rad etish funksiyasi hali qo\'shilmagan'));
        }
        return Promise.reject(err);
      });
  },
};
