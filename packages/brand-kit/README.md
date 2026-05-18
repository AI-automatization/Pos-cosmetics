# @raos/brand-kit

RAOS canonical design tokens — single source of truth across web, mobile, and content.

## Active palette (2026-05-18 — cyan brand)

| Token | Hex | Usage |
|-------|-----|-------|
| `cyan` | `#24D4F4` | Logo R, CTA, accent |
| `cyanLight` | `#5FEEFB` | Gradient top, glow, hover |
| `cyanDark` | `#0FA8C8` | Gradient bottom, pressed |
| `bgDeep` | `#0E1530` | Main dark navy |
| `bgMain` | `#0F1733` | Default container |
| `bgHighlight` | `#112F4B` | Radial top-left glow |
| `bgElevated` | `#1A2342` | Card, modal |

## Usage

```ts
import { raosColors, raosGradients, raosLogoSvg } from '@raos/brand-kit';

const Button = () => (
  <button style={{ background: raosGradients.ctaButton, color: raosColors.bgDeep }}>
    Buy
  </button>
);
```

## Rules

- **NEVER** inline hex codes for RAOS brand colors. Always import.
- **NEVER** mix with Tezcode parent brand (galson terminal-dark + gold).
- Legacy `raosColorsLegacy` (purple-era) — deprecated, aliased to cyan.
  Migrate any old usage to `raosColors.cyan` / `.bgDeep`.

## Files

- `src/colors.ts` — palette + gradients
- `src/typography.ts` — fonts, sizes, weights
- `src/spacing.ts` — spacing + radius
- `src/logo.ts` — asset paths + inline SVG

## History

- 2026-05-18 — created; cyan rebuild from Bekzod reference (msg 5907)
- See: `memory/raos-brand-color-rule.md`, `memory/raos-final-logo-2026-05-18.md`
