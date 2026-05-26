export const typography = {
  // Sizes (fontSize only, apply fontWeight separately)
  sizes: {
    xs:    11,
    sm:    13,
    base:  15,
    md:    16,
    lg:    18,
    xl:    20,
    '2xl': 24,
    '3xl': 28,
  },

  // Weights
  weights: {
    regular:  '400' as const,
    medium:   '500' as const,
    semibold: '600' as const,
    bold:     '700' as const,
  },

  // Presets (convenient combinations)
  screenTitle:  { fontSize: 20, fontWeight: '700' as const },
  sectionTitle: { fontSize: 16, fontWeight: '600' as const },
  cardTitle:    { fontSize: 15, fontWeight: '600' as const },
  body:         { fontSize: 15, fontWeight: '400' as const },
  bodySmall:    { fontSize: 13, fontWeight: '400' as const },
  caption:      { fontSize: 12, fontWeight: '400' as const },
  label:        { fontSize: 13, fontWeight: '600' as const },
  labelSmall:   { fontSize: 11, fontWeight: '600' as const },
  price:        { fontSize: 16, fontWeight: '700' as const },
  priceSmall:   { fontSize: 14, fontWeight: '700' as const },
  stat:         { fontSize: 22, fontWeight: '700' as const },
  mono:         { fontSize: 14, fontWeight: '400' as const, fontVariant: ['tabular-nums'] as const },
} as const;
