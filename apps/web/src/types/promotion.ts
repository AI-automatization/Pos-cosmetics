export type PromotionType = 'PERCENT' | 'FIXED' | 'BUY_X_GET_Y' | 'BUNDLE';

export interface Promotion {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  type: PromotionType;
  value: number;
  minOrderAmount: number | null;
  maxUsageCount: number | null;
  usageCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreatePromotionDto {
  name: string;
  description?: string;
  type: PromotionType;
  value: number;
  minOrderAmount?: number;
  maxUsageCount?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
}

export type UpdatePromotionDto = Partial<CreatePromotionDto>;

export const PROMO_TYPE_LABELS: Record<PromotionType, string> = {
  PERCENT: 'Foiz chegirma',
  FIXED: "Belgilangan chegirma",
  BUY_X_GET_Y: 'N ta olsang M ta bepul',
  BUNDLE: 'Paket narx',
};

export const PROMO_TYPE_COLORS: Record<PromotionType, string> = {
  PERCENT: 'bg-blue-100 text-blue-700',
  FIXED: 'bg-green-100 text-green-700',
  BUY_X_GET_Y: 'bg-purple-100 text-purple-700',
  BUNDLE: 'bg-orange-100 text-orange-700',
};
