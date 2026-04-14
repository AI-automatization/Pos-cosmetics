export const borderRadius = {
  xs:    4,
  sm:    6,
  md:    10,
  lg:    14,
  xl:    18,
  '2xl': 24,
  full:  9999,
} as const;

export type BorderRadiusKey = keyof typeof borderRadius;
