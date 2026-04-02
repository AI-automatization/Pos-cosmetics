// ─── TENANT SETTINGS TYPES (T-132) ────────────────────────────

export interface TenantSettings {
  currency: string;         // 'UZS' | 'USD'
  language: string;         // 'uz' | 'ru' | 'en'
  timezone: string;         // 'Asia/Tashkent'
  taxRate: number;          // percent, e.g. 12 = 12%
  receiptHeader: string | null;
  receiptFooter: string | null;
  lowStockThreshold: number;  // default 5
  expiryAlertDays: number;    // default 30
  extra: Record<string, unknown>;
}

export type UpdateTenantSettingsPayload = Partial<TenantSettings>;

// ─── PRICE HISTORY TYPES (T-133) ──────────────────────────────

export interface PriceChange {
  id: string;
  productId: string;
  productName?: string;   // present in listRecent
  field: string;          // 'sellPrice' | 'costPrice' | 'wholesalePrice'
  oldValue: number;
  newValue: number;
  reason: string | null;
  userId: string | null;
  createdAt: Date;
}

// ─── FILE UPLOAD TYPES (T-129) ────────────────────────────────

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

export type BulkUploadResult = UploadResult[];

// ─── IMPORT/EXPORT TYPES (T-130) ──────────────────────────────

export interface ImportResult {
  created: number;
  updated: number;
  errors: string[];
}
