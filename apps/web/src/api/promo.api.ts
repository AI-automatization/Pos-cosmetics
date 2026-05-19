import { apiClient } from './client';
import type {
  PromoCode,
  PaginatedPromoCodes,
  CreatePromoCodeDto,
  UpdatePromoCodeDto,
  ValidateCodeDto,
  ValidateResult,
} from '@/types/promo-code';

const BASE = '/promotions/codes';

export const promoApi = {
  list(params?: { page?: number; limit?: number }): Promise<PaginatedPromoCodes> {
    return apiClient.get<PaginatedPromoCodes>(BASE, { params }).then((r) => r.data);
  },

  getOne(id: string): Promise<PromoCode> {
    return apiClient.get<PromoCode>(`${BASE}/${id}`).then((r) => r.data);
  },

  create(dto: CreatePromoCodeDto): Promise<PromoCode> {
    return apiClient.post<PromoCode>(BASE, dto).then((r) => r.data);
  },

  update(id: string, dto: UpdatePromoCodeDto): Promise<PromoCode> {
    return apiClient.patch<PromoCode>(`${BASE}/${id}`, dto).then((r) => r.data);
  },

  remove(id: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`${BASE}/${id}`).then((r) => r.data);
  },

  validate(dto: ValidateCodeDto): Promise<ValidateResult> {
    return apiClient.post<ValidateResult>(`${BASE}/validate`, dto).then((r) => r.data);
  },

  apply(dto: ValidateCodeDto): Promise<ValidateResult> {
    return apiClient.post<ValidateResult>(`${BASE}/apply`, dto).then((r) => r.data);
  },
};
