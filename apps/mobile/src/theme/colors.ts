export const colors = {
  primary:      '#6366F1',
  secondary:    '#8B5CF6',
  success:      '#10B981',
  warning:      '#F59E0B',
  danger:       '#EF4444',
  background:   '#0F0F14',
  surface:      '#1A1A24',
  surfaceHigh:  '#232333',
  border:       '#2D2D3D',
  textPrimary:  '#F1F5F9',
  textSecond:   '#94A3B8',
  textDisabled: '#475569',
} as const;

export type ColorKey = keyof typeof colors;
