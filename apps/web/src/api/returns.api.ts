import { apiClient } from './client';
import type { Return, ReturnListResponse, CreateReturnDto } from '@/types/returns';

export interface ShiftCashBalance {
  availableCash: number;
  shiftId: string;
}

export const returnsApi = {
  listReturns(params?: { page?: number; limit?: number; status?: string }) {
    return apiClient.get<ReturnListResponse>('/sales/returns', { params }).then((r) => r.data);
  },
  createReturn(dto: CreateReturnDto) {
    return apiClient.post<Return>('/sales/returns', dto).then((r) => r.data);
  },
  approveReturn(id: string) {
    return apiClient.patch<Return>(`/sales/returns/${id}/approve`).then((r) => r.data);
  },
  getShiftAvailableCash(shiftId: string) {
    return apiClient
      .get<ShiftCashBalance>(`/sales/shifts/${shiftId}/available-cash`)
      .then((r) => r.data);
  },
};
