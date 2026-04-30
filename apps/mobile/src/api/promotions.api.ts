import { api } from './client';

export type PromotionType = 'PERCENT' | 'FIXED' | 'BUY_X_GET_Y' | 'BUNDLE';

export interface Promotion {
  id: string;
  name: string;
  type: PromotionType;
  rules: Record<string, unknown>;
  validFrom: string;
  validTo: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ApplyPromotionsDto {
  subtotal: number;
  items: Array<{ productId: string; quantity: number; unitPrice: number }>;
}

export interface ApplyPromotionsResult {
  discountAmount: number;
  appliedPromotions: Array<{ promotionId: string; name: string; discount: number }>;
}

export const promotionsApi = {
  getAll: async (activeOnly?: boolean): Promise<Promotion[]> => {
    const { data } = await api.get<Promotion[]>('/promotions', {
      params: activeOnly ? { activeOnly: true } : undefined,
    });
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: string): Promise<Promotion> => {
    const { data } = await api.get<Promotion>(`/promotions/${id}`);
    return data;
  },

  apply: async (dto: ApplyPromotionsDto): Promise<ApplyPromotionsResult> => {
    const { data } = await api.post<ApplyPromotionsResult>('/promotions/apply', dto);
    return data;
  },
};
