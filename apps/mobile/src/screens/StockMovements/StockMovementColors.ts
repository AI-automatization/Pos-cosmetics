// StockMovementColors.ts

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
  red:       '#DC2626',
  redBg:     '#FEF2F2',
  yellow:    '#D97706',
  yellowBg:  '#FFFBEB',
  blue:      '#2563EB',
  blueBg:    '#EFF6FF',
  purple:    '#7C3AED',
  purpleBg:  '#F5F3FF',
  orange:    '#EA580C',
  orangeBg:  '#FFF7ED',
  gray:      '#6B7280',
  grayBg:    '#F3F4F6',
} as const;

export const MOVEMENT_ROLES = ['OWNER', 'ADMIN', 'MANAGER'] as const;
