import { apiClient } from './client';
import type { Return, CreateReturnDto } from '@/types/returns';

export const returnsApi = {
  listReturns(params?: { status?: string; from?: string; to?: string }) {
    return apiClient.get<Return[]>('/sales/returns', { params }).then((r) => r.data);
  },
  getReturn(id: string) {
    return apiClient.get<Return>(`/sales/returns/${id}`).then((r) => r.data);
  },
  createReturn(dto: CreateReturnDto) {
    return apiClient.post<Return>('/sales/returns', dto).then((r) => r.data);
  },
  approveReturn(id: string, adminPin: string) {
    return apiClient.post<Return>(`/sales/returns/${id}/approve`, { adminPin }).then((r) => r.data);
  },
  rejectReturn(id: string, note: string) {
    return apiClient.post<Return>(`/sales/returns/${id}/reject`, { note }).then((r) => r.data);
  },
};
