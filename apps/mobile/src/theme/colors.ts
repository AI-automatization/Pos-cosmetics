export const colors = {
  primary:      '#6366F1',
  secondary:    '#8B5CF6',
  success:      '#10B981',
  warning:      '#F59E0B',
  danger:       '#EF4444',
  background:   '#F8FAFC',
  surface:      '#FFFFFF',
  surfaceHigh:  '#F1F5F9',
  border:       '#E2E8F0',
  textPrimary:  '#0F172A',
  textSecond:   '#64748B',
  textDisabled: '#CBD5E1',
} as const;

export type ColorKey = keyof typeof colors;
