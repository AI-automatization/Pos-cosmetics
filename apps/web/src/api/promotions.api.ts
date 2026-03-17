import { apiClient } from './client';
import type { Promotion, CreatePromotionDto, UpdatePromotionDto } from '@/types/promotion';

export const promotionsApi = {
  list() {
    return apiClient
      .get<Promotion[] | { items: Promotion[]; total: number }>('/promotions')
      .then((r) => (Array.isArray(r.data) ? r.data : (r.data as { items: Promotion[] }).items ?? []));
  },
  create(dto: CreatePromotionDto) {
    return apiClient.post<Promotion>('/promotions', dto).then((r) => r.data);
  },
  update(id: string, dto: UpdatePromotionDto) {
    return apiClient.patch<Promotion>(`/promotions/${id}`, dto).then((r) => r.data);
  },
  remove(id: string) {
    return apiClient.delete<void>(`/promotions/${id}`).then((r) => r.data);
  },
};
