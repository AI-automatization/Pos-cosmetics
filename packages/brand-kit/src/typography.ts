/**
 * RAOS Typography canonical tokens.
 */

export const raosFonts = {
  heading: 'Inter, system-ui, -apple-system, sans-serif',
  body:    'Inter, system-ui, -apple-system, sans-serif',
  mono:    'JetBrains Mono, ui-monospace, "SF Mono", Consolas, monospace',
  display: 'Inter, system-ui, sans-serif',
} as const;

/** Font sizes (rem). */
export const raosFontSizes = {
  xs:   '0.75rem',   // 12px
  sm:   '0.875rem',  // 14px
  base: '1rem',      // 16px
  lg:   '1.125rem',  // 18px
  xl:   '1.25rem',   // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',     // 48px
} as const;

export const raosFontWeights = {
  regular:  400,
  medium:   500,
  semibold: 600,
  bold:     700,
  black:    900,  // logo R uses black
} as const;
