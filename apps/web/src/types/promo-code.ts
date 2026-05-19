export type PromoType = 'PERCENT' | 'FIXED';

export interface PromoCode {
  id: string;
  tenantId: string;
  code: string;
  type: PromoType;
  value: string; // Decimal serialized as string from backend
  usageLimit: number;
  usageCount: number;
  minPurchase: string; // Decimal serialized as string
  validFrom: string;
  validTo: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPromoCodes {
  items: PromoCode[];
  total: number;
  page: number;
  limit: number;
}

export interface CreatePromoCodeDto {
  code?: string;
  type: PromoType;
  value: number;
  usageLimit?: number;
  minPurchase?: number;
  validFrom: string;
  validTo?: string;
}

export interface UpdatePromoCodeDto extends Partial<CreatePromoCodeDto> {
  isActive?: boolean;
}

export interface ValidateCodeDto {
  code: string;
  purchaseAmount: number;
}

export interface ValidateResult {
  valid: boolean;
  discount: number;
  type: PromoType | null;
  message: string;
}
