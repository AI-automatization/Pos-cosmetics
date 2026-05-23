/**
 * RAOS Brand Color Palette — Active 2026-05-18
 *
 * Source: Bekzod-approved cyan R + dark navy radial reference,
 * extracted via Desktop/screenshots/RAOS/Final-Logo-2026-05-18/extract_colors.py
 *
 * RULE: All RAOS UI (web + mobile + content) MUST import from here.
 * NEVER inline hex codes for RAOS brand colors.
 *
 * @example
 *   import { raosColors } from '@raos/brand-kit';
 *   const bg = raosColors.bgDeep;
 */

export const raosColors = {
  // Primary — logo R, CTA, accent
  cyan:      '#24D4F4',
  cyanLight: '#5FEEFB',  // R-gradient top, glow, hover
  cyanDark:  '#0FA8C8',  // R-gradient bottom, pressed

  // Background — dark navy family
  bgDeep:      '#0E1530',  // Main bg (logo bg, hero)
  bgMain:      '#0F1733',  // Default container
  bgHighlight: '#112F4B',  // Radial top-left blue glow
  bgElevated:  '#1A2342',  // Card, modal, dropdown
  bgOverlay:   '#0A0F1C',  // Modal scrim
  bgHover:     '#1F2D52',  // Card hover

  // Text
  textPrimary:   '#FFFFFF',
  textSecondary: '#C0C8D8',
  textMuted:     '#8090B0',
  textDisabled:  '#6E7891',
  textAccent:    '#24D4F4',  // = cyan

  // Semantic (kept consistent across brand era)
  success: '#22C55E',
  warning: '#FBBF24',
  error:   '#EF4444',
  info:    '#24D4F4',  // = cyan

  // Borders
  border:       'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(36,212,244,0.30)',  // cyan-tinted
} as const;

/**
 * Gradient compositions (CSS string values).
 */
export const raosGradients = {
  /** R-letter gradient (top → bottom) — for logo treatments */
  rLetter:        `linear-gradient(180deg, ${raosColors.cyanLight} 0%, ${raosColors.cyan} 50%, ${raosColors.cyanDark} 100%)`,
  /** Hero background — radial highlight at top-left */
  heroBgRadial:   `radial-gradient(circle at 25% 25%, ${raosColors.bgHighlight} 0%, ${raosColors.bgDeep} 70%)`,
  /** CTA button gradient */
  ctaButton:      `linear-gradient(180deg, ${raosColors.cyanLight} 0%, ${raosColors.cyan} 100%)`,
  /** Card subtle (top → bottom) */
  cardSubtle:     `linear-gradient(180deg, ${raosColors.bgElevated} 0%, ${raosColors.bgMain} 100%)`,
} as const;

/**
 * Deprecated purple-era tokens (2026-05-16) — aliased to cyan for legacy compat.
 * DO NOT use in new code. Migrate to raosColors.cyan / .bgDeep.
 *
 * @deprecated since 2026-05-18 — RAOS rebuilt to cyan brand
 */
export const raosColorsLegacy = {
  purple:      raosColors.cyan,       // was #8D60EE
  purpleLight: raosColors.cyanLight,  // was #A080FF
  purpleDark:  raosColors.cyanDark,   // was #6040D0
  bgPrimary:   raosColors.bgDeep,     // was #0F1628
} as const;

export type RaosColorToken = keyof typeof raosColors;
export type RaosGradientToken = keyof typeof raosGradients;
