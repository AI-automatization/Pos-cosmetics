import { apiClient } from './client';
import type { Shift, OpenShiftDto, CloseShiftDto } from '@/types/shift';

export const shiftApi = {
  openShift(dto: OpenShiftDto) {
    return apiClient.post<Shift>('/sales/shifts', dto).then((r) => r.data);
  },

  closeShift(shiftId: string, dto: CloseShiftDto) {
    return apiClient
      .patch<Shift>(`/sales/shifts/${shiftId}/close`, dto)
      .then((r) => r.data);
  },

  getShift(shiftId: string) {
    return apiClient.get<Shift>(`/sales/shifts/${shiftId}`).then((r) => r.data);
  },

  getActiveShift() {
    return apiClient.get<Shift | null>('/sales/shifts/active').then((r) => r.data);
  },
};
