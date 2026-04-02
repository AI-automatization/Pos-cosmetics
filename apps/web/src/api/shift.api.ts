import { apiClient } from './client';
import type { Shift, OpenShiftDto, CloseShiftDto } from '@/types/shift';

export const shiftApi = {
  openShift(dto: OpenShiftDto) {
    // Backend DTO only accepts openingCash, branchId?, notes? (forbidNonWhitelisted)
    const { openingCash, branchId, notes } = dto as OpenShiftDto & { branchId?: string; notes?: string };
    return apiClient.post<Shift>('/sales/shifts/open', { openingCash, branchId, notes }).then((r) => r.data);
  },

  closeShift(shiftId: string, dto: CloseShiftDto) {
    return apiClient
      .post<Shift>(`/sales/shifts/${shiftId}/close`, dto)
      .then((r) => r.data);
  },

  getShift(shiftId: string) {
    return apiClient.get<Shift>(`/sales/shifts/${shiftId}`).then((r) => r.data);
  },

  getActiveShift() {
    return apiClient.get<Shift | null>('/sales/shifts/current').then((r) => r.data);
  },
};
