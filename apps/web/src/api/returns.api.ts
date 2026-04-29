import { apiClient } from './client';
import type { Return, CreateReturnDto } from '@/types/returns';

export interface ShiftCashBalance {
  availableCash: number;
  shiftId: string;
}

export const returnsApi = {
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
