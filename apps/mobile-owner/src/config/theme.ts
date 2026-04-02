// RAOS Owner Mobile — Design System (Stitch AI generated, 2026-03-12)
// Primary: #1E40AF deep blue | Light theme

export const Colors = {
  // Backgrounds
  bgApp: '#F8FAFC',
  bgSurface: '#FFFFFF',
  bgSubtle: '#F1F5F9',

  // Primary (deep blue)
  primary: '#1E40AF',
  primaryLight: '#EFF6FF',
  primaryMid: '#3B82F6',

  // Semantic
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  info: '#0891B2',
  infoLight: '#E0F2FE',
  purple: '#7C3AED',
  purpleLight: '#EDE9FE',
  orange: '#EA580C',
  orangeLight: '#FFEDD5',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',

  // Borders & separators
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  separator: '#F3F4F6',

  // Unread indicator
  unreadBg: '#EFF6FF',
  unreadDot: '#1E40AF',
} as const;

export const Radii = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const Shadows = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardStrong: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 5,
  },
} as const;

export const Typography = {
  h1: { fontSize: 28, fontWeight: '800' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '700' as const },
  h4: { fontSize: 16, fontWeight: '700' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  bodyMedium: { fontSize: 14, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  captionMedium: { fontSize: 12, fontWeight: '600' as const },
  label: { fontSize: 11, fontWeight: '600' as const },
} as const;
