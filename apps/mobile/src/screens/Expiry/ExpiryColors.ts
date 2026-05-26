// ExpiryColors.ts — rang konstantlari

export const C = {
  bg:        '#F8F9FA',
  white:     '#FFFFFF',
  primary:   '#7C3AED',
  text:      '#111827',
  secondary: '#6B7280',
  muted:     '#9CA3AF',
  border:    '#E5E7EB',
  green:     '#16A34A',
  greenBg:   '#F0FDF4',
  orange:    '#D97706',
  orangeBg:  '#FFFBEB',
  red:       '#DC2626',
  redBg:     '#FEF2F2',
  yellow:    '#CA8A04',
  yellowBg:  '#FEFCE8',
} as const;

export const EXPIRY_ROLES = ['OWNER', 'ADMIN', 'MANAGER', 'WAREHOUSE'] as const;
