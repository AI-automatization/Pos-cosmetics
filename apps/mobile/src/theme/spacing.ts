export const spacing = {
  1:   2,
  2:   4,
  3:   6,
  4:   8,
  5:   12,
  6:   16,
  7:   20,
  8:   24,
  9:   32,
  10:  40,
  11:  48,
  // Named aliases (backwards compat)
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
} as const;

export type SpacingKey = keyof typeof spacing;
