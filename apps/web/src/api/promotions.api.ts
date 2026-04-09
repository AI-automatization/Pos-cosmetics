import { apiClient } from './client';
import type { Promotion, CreatePromotionDto, UpdatePromotionDto } from '@/types/promotion';

export const promotionsApi = {
  list(): Promise<Promotion[]> {
    return apiClient
      .get<Promotion[] | { items: Promotion[]; total: number }>('/promotions')
      .then((r) => (Array.isArray(r.data) ? r.data : (r.data as { items: Promotion[] }).items ?? []));
  },

  getOne(id: string): Promise<Promotion> {
    return apiClient.get<Promotion>(`/promotions/${id}`).then((r) => r.data);
  },

  create(dto: CreatePromotionDto): Promise<Promotion> {
    return apiClient.post<Promotion>('/promotions', dto).then((r) => r.data);
  },

  update(id: string, dto: UpdatePromotionDto): Promise<Promotion> {
    return apiClient.patch<Promotion>(`/promotions/${id}`, dto).then((r) => r.data);
  },

  remove(id: string): Promise<void> {
    return apiClient.delete<void>(`/promotions/${id}`).then((r) => r.data);
  },
};
