// apps/mobile/src/screens/Kirim/components/types.ts

// Constants
export const CAMERA_MARGIN_TOP    = 60;
export const SHEET_PADDING        = 24;
export const SHEET_PADDING_BOTTOM = 40;
export const SHEET_BORDER_RADIUS  = 24;
export const SHEET_MAX_HEIGHT     = '92%' as const;

// Colors
export const C = {
  bg:        '#F9FAFB',
  white:     '#FFFFFF',
  text:      '#111827',
  muted:     '#9CA3AF',
  secondary: '#6B7280',
  border:    '#E5E7EB',
  primary:   '#2563EB',
  red:       '#DC2626',
  green:     '#16A34A',
  label:     '#374151',
};

// Types
export interface LineItem {
  key: string;
  productId: string;
  productName: string;
  quantity: string;
  costPrice: string;
  expiryDate: string;
}

export type AddMode = 'none' | 'manual' | 'scanned';

export interface ScanResult {
  productId: string;
  productName: string;
  costPrice: string;
}

export interface FormState {
  supplierName: string;
  invoiceNumber: string;
  notes: string;
}

export const EMPTY_FORM: FormState = {
  supplierName:  '',
  invoiceNumber: '',
  notes:         '',
};

export const EMPTY_LINE: Omit<LineItem, 'key'> = {
  productId:   '',
  productName: '',
  quantity:    '',
  costPrice:   '',
  expiryDate:  '',
};
