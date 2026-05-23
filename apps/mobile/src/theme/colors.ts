export const colors = {
  // Primary (Blue)
  primary:        '#2563EB',   // blue-600
  primaryDark:    '#1D4ED8',   // blue-700
  primaryLight:   '#EFF6FF',   // blue-50

  // Success (Green)
  success:        '#16A34A',   // green-600
  successLight:   '#F0FDF4',   // green-50

  // Warning (Amber)
  warning:        '#D97706',   // amber-600
  warningLight:   '#FFFBEB',   // amber-50

  // Danger (Red)
  danger:         '#DC2626',   // red-600
  dangerLight:    '#FEF2F2',   // red-50

  // Orange (accent)
  orange:         '#EA580C',   // orange-600
  orangeLight:    '#FFF7ED',   // orange-50

  // Purple (accent)
  purple:         '#7C3AED',   // purple-600
  purpleLight:    '#F5F3FF',   // purple-50

  // Backgrounds
  background:     '#F9FAFB',   // gray-50
  surface:        '#FFFFFF',
  surfaceLow:     '#F3F4F5',   // slightly darker than bg
  surfaceHigh:    '#E7E8E9',   // used for secondary buttons bg

  // Borders
  border:         '#E5E7EB',   // gray-200
  borderFocus:    '#2563EB',   // same as primary

  // Text
  textPrimary:    '#111827',   // gray-900
  textSecond:     '#6B7280',   // gray-500
  textMuted:      '#9CA3AF',   // gray-400
  textDisabled:   '#D1D5DB',   // gray-300
  textInverse:    '#FFFFFF',

  // Header / TabBar
  header:         '#FFFFFF',
  tabBar:         '#FFFFFF',
} as const;

export type ColorKey = keyof typeof colors;
