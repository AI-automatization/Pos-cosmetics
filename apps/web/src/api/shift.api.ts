import { apiClient } from './client';
import type { Shift, OpenShiftDto, CloseShiftDto } from '@/types/shift';

export const shiftApi = {
  // Backend: @Post('shifts/open') — not POST /sales/shifts
  openShift(dto: OpenShiftDto) {
    return apiClient.post<Shift>('/sales/shifts/open', dto).then((r) => r.data);
  },

  // Backend: @Post('shifts/:id/close') — POST not PATCH
  closeShift(shiftId: string, dto: CloseShiftDto) {
    return apiClient
      .post<Shift>(`/sales/shifts/${shiftId}/close`, dto)
      .then((r) => r.data);
  },

  // Backend has no GET /sales/shifts/:id — use current shift endpoint instead
  getShift(_shiftId: string) {
    return apiClient.get<Shift>('/sales/shifts/current').then((r) => r.data);
  },

  // Backend: @Get('shifts/active') → returns Shift[] (array)
  getActiveShift(): Promise<Shift | null> {
    return apiClient
      .get<Shift[] | Shift>('/sales/shifts/active')
      .then((r) => (Array.isArray(r.data) ? (r.data[0] ?? null) : r.data))
      .catch(() => null);
  },
};
