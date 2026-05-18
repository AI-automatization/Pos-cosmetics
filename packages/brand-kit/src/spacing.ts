/**
 * RAOS Spacing + Radius canonical tokens.
 */

export const raosSpacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const raosRadius = {
  sm:   4,
  md:   8,
  lg:   16,
  full: 9999,
  /** iOS classic squircle ratio — for app icon / avatar */
  appIconRatio: 0.2237,
} as const;
