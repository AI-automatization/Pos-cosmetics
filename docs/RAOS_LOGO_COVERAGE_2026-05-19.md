# RAOS Logo Coverage — Cyan Brand Migration (Web)

**Sana / Date:** 2026-05-19
**Scope:** `apps/web/src/` — brand-context logo and brand-color migration
**Canonical asset / asosiy belgi:** `apps/web/public/icon.png` (1024×1024 rounded cyan R + dark navy radial, Real-ESRGAN upscale)
**Canonical tokens:** `bg-raos-cyan` (#24D4F4), `bg-raos-cyan-light` (#5FEEFB), `bg-raos-cyan-dark` (#0FA8C8), `bg-raos-bg-deep` (#0E1530), `bg-raos-bg-main` (#0F1733), `bg-raos-bg-highlight` (#112F4B)
**Previous commits this scope:** `4c5762c` (auth pages), `5448bc9` (brand-kit + CSS tokens), `29ccc5e` (canonical assets across web/iOS/mobile)

## What is brand context here?

Brand-context = visual surfaces where the user reads "this is RAOS" — the logo mark, sidebar header, top navbar identity, auth screens, error/empty fallbacks, onboarding hero, primary CTAs sitting under a RAOS heading. Functional accents (POS bonus violet, promotions violet, warehouse amber role label, info banners, focus rings on random forms, lucide category icons) are intentionally NOT migrated — those are role/category colors, not the brand primary.

## Files updated (12)

### Sidebars and shell

| # | File | What changed | Brand context evidence |
|---|------|--------------|------------------------|
| 1 | `apps/web/src/components/layout/Sidebar.tsx` | Replaced `<Store>` lucide icon inside a `bg-gradient-to-br from-blue-600 to-blue-700` rounded square with `<Image src="/icon.png" />` cyan canonical mark; migrated active-nav highlight `bg-blue-50 text-blue-700 ring-blue-100` → `bg-raos-cyan/10 text-raos-cyan-dark ring-raos-cyan/20` across `NavLink`, collapsed `NavGroup`, expanded `NavGroup` button, and child link active state; user-avatar gradient `from-blue-500 to-violet-500 text-white` → `from-raos-cyan to-raos-cyan-dark text-raos-bg-deep`. Removed unused `Store` import. | Sidebar header is the primary brand mark of the Admin/Owner shell, mounted in `app/(admin)/layout.tsx`. Active-nav blue was the legacy brand accent before cyan canonicalization. |
| 2 | `apps/web/src/components/layout/ManagerSidebar.tsx` | Replaced `<BriefcaseBusiness>` lucide on `bg-blue-600` square with `<Image src="/icon.png" />`; migrated active-nav `bg-blue-50 text-blue-700` → `bg-raos-cyan/10 text-raos-cyan-dark`. Removed unused `BriefcaseBusiness` import. | Manager-role sidebar — same brand-mark role as Admin sidebar in `app/(manager)/layout.tsx`. |
| 3 | `apps/web/src/components/layout/WarehouseSidebar.tsx` | Replaced `<Warehouse>` lucide on `bg-amber-600` square with `<Image src="/icon.png" />`; kept amber color on the role label (`{t('nav.warehousePanel')}` is now `text-amber-600 font-medium`) so the role identity stays visible without losing brand mark. | Brand mark must stay consistent across role-shells; amber is the role accent (functional), cyan is the brand (architectural). |
| 4 | `apps/web/src/components/layout/TopNavbar.tsx` | ChangePasswordModal submit `bg-blue-600 hover:bg-blue-700 text-white` → `bg-raos-cyan hover:bg-raos-cyan-light text-raos-bg-deep shadow-raos-cyan/30`; password input focus `focus:border-blue-500 focus:ring-blue-500/20` → `focus:border-raos-cyan focus:ring-raos-cyan/20`; lang-switcher active `bg-white text-blue-700` → `text-raos-cyan-dark`; user-menu avatar `bg-blue-100 + text-blue-600` → `bg-raos-cyan/15 ring-raos-cyan/30 + text-raos-cyan-dark`; tenant name `text-blue-600` → `text-raos-cyan-dark`. | TopNavbar mounted in `app/(admin)/layout.tsx`; the modal submit + lang switcher + user identity pill are all brand-anchored CTA surfaces. |
| 5 | `apps/web/src/components/layout/Header.tsx` | Same three migrations as TopNavbar (avatar, tenant text, lang-switcher active) for the legacy Header component (currently unused in shell, kept consistent for any future wiring). | Defensive consistency — file ships in the bundle and may be wired into future role layouts. |
| 6 | `apps/web/src/app/(manager)/layout.tsx` | Added mobile-only `<Image src="/icon.png" width={28} height={28} />` brand mark next to "RAOS Manager" page title in the inline header (sidebar is hidden on mobile, so without this the brand mark disappears below `md:` breakpoint). | Brand parity with `(admin)/layout.tsx` which has a sidebar logo always visible. |

### Auth shell

| # | File | What changed | Brand context evidence |
|---|------|--------------|------------------------|
| 7 | `apps/web/src/app/(auth)/layout.tsx` | Gradient backdrop `from-slate-900 via-blue-950 to-slate-900` → `from-raos-bg-deep via-raos-bg-main to-raos-bg-deep` (canonical RAOS dark navy palette). | Auth shell wraps login + forgot-password (commit `4c5762c` already migrated those page bodies); shell backdrop was last remaining legacy blue here. |

### Error / 404 / loading

| # | File | What changed | Brand context evidence |
|---|------|--------------|------------------------|
| 8 | `apps/web/src/app/error.tsx` | Added `<Image src="/icon.png" />` (48×48 rounded with `shadow-raos-cyan/30 ring-raos-cyan/20`) above the error icon; retry button `bg-violet-600 hover:bg-violet-700` → `bg-raos-cyan hover:bg-raos-cyan-light text-raos-bg-deep`. | Root-level error boundary — first thing user sees when the app crashes; brand mark anchors identity, retry is the primary CTA. |
| 9 | `apps/web/src/app/(admin)/error.tsx` | Same pattern as root error: added brand mark + cyan retry CTA. | Admin route-group error boundary. |
| 10 | `apps/web/src/app/(pos)/error.tsx` | Added brand mark; changed dark background `bg-gray-950` → `bg-raos-bg-deep` (canonical RAOS dark navy); retry CTA `bg-violet-600` → `bg-raos-cyan text-raos-bg-deep`. | POS error screen on touch devices for cashiers; brand mark keeps shop identity even on crash. |
| 11 | `apps/web/src/app/not-found.tsx` | Added 56×56 brand mark above the 404 card; "Go home" link CTA `bg-violet-600 hover:bg-violet-700` → `bg-raos-cyan hover:bg-raos-cyan-light text-raos-bg-deep`. | 404 page is a brand-context surface; primary CTA = back to dashboard. |
| 12 | `apps/web/src/app/(pos)/loading.tsx` | Added brand mark above the spinner; changed background `bg-gray-950` → `bg-raos-bg-deep`; spinner border `border-gray-700 border-t-violet-500` → `border-raos-bg-highlight border-t-raos-cyan`. | POS loading screen — first-paint identity for cashier; spinner color is brand cue. |

### Onboarding wizard

| # | File | What changed | Brand context evidence |
|---|------|--------------|------------------------|
| 13 | `apps/web/src/app/(admin)/onboarding/page.tsx` | Added 48×48 brand mark next to "Welcome" hero (`sm:inline-flex` so it shows from tablet up); migrated CTAs and active-step indicator from indigo to cyan: progress bar `bg-indigo-600` → `bg-raos-cyan`; active step border `border-indigo-300` → `border-raos-cyan/40`; active step icon background `bg-indigo-600 text-white` → `bg-raos-cyan text-raos-bg-deep shadow-raos-cyan/30`; action button + completion CTA `bg-indigo-600 hover:bg-indigo-700` → `bg-raos-cyan hover:bg-raos-cyan-light text-raos-bg-deep`. | Onboarding is the first guided RAOS experience for a new tenant — brand mark + CTA chain anchors trust. |

## NOT TARGETS (intentionally left)

- `apps/web/src/components/Receipt/ReceiptTemplate.tsx` — pure text thermal receipt (80mm); only `RAOS · raos.uz` footer text. No raster logo because thermal printers render bitmaps poorly and the shop name is `user?.tenant?.name ?? 'RAOS'` (multi-tenant context).
- `apps/web/src/app/(pos)/pos/ShiftBar.tsx`, `ShiftReport.tsx` — `ShoppingBag` is the pre-bag action (functional), not brand.
- `apps/web/src/app/(admin)/customers/[id]/page.tsx` — `ShoppingBag` = purchase indicator (functional).
- `apps/web/src/app/(admin)/chegirma/*`, `promotions/*`, `(pos)/pos/BonusSection.tsx` — violet is the discount/loyalty category color (functional).
- `apps/web/src/app/(admin)/analytics/page.tsx` — indigo is the analytics chart palette (functional).
- `apps/web/src/app/(warehouse)/warehouse/history/page.tsx` form focus rings — generic input focus, not brand.
- `apps/web/src/components/common/EmptyState.tsx` — CTA `bg-blue-600` is a generic action button on a generic empty state (not a brand surface); changing it would cascade across all empty states regardless of context.
- `apps/web/src/components/common/ErrorState.tsx` — uses red/gray only, no brand color.
- Mobile (`apps/mobile/`, `apps/mobile-owner/`) — out of scope this iteration.

## Visual test coverage (Rule 12)

Web dev runs on port 3001 in parallel; visual QA agent (computer-control MCP, Rule 5) verifies live surfaces:

- `/login`, `/forgot-password` — already verified in commit `4c5762c`
- `/dashboard` (Admin shell) — sidebar header logo, active-nav cyan, user-avatar cyan gradient
- `/manager-dashboard` — Manager sidebar cyan logo + mobile header brand mark
- `/warehouse` — Warehouse sidebar cyan logo above amber role label
- `/onboarding` — brand mark + cyan progress + cyan step CTAs
- Error / 404 — force a thrown route or `/nonexistent` to see cyan brand mark + cyan retry
- POS error / POS loading — dark navy + cyan spinner + brand mark

## Pattern reference (canonical, reuse for future surfaces)

```tsx
// Big logo (header / auth / hero)
<div className="inline-flex h-16 w-16 overflow-hidden rounded-2xl shadow-lg shadow-raos-cyan/30 ring-1 ring-raos-cyan/20">
  <Image src="/icon.png" alt="RAOS" width={64} height={64} priority />
</div>

// Sidebar collapsed / small inline
<div className="flex h-8 w-8 overflow-hidden rounded-xl shadow-sm shadow-raos-cyan/30 ring-1 ring-raos-cyan/20">
  <Image src="/icon.png" alt="RAOS" width={32} height={32} priority />
</div>

// Primary CTA on light surface
className="bg-raos-cyan hover:bg-raos-cyan-light text-raos-bg-deep shadow-md shadow-raos-cyan/30"

// Primary CTA on dark surface (POS, auth)
className="bg-raos-cyan hover:bg-raos-cyan-light text-raos-bg-deep shadow-lg shadow-raos-cyan/30"

// Active nav link on light surface
className="bg-raos-cyan/10 text-raos-cyan-dark ring-1 ring-raos-cyan/20"

// Focus ring on inputs (brand-adjacent forms)
className="focus:border-raos-cyan focus:ring-2 focus:ring-raos-cyan/20"

// Link text
className="text-raos-cyan hover:text-raos-cyan-light"
```

## References

- Brand kit module: `packages/brand-kit/` (`@raos/brand-kit` — `raosColors`, `raosGradients`, `raosLogoSvg`)
- CSS tokens: `apps/web/src/app/globals.css` (`@theme` + `:root` definitions)
- Canonical icon: `apps/web/public/icon.png` (1024×1024, generated commit `29ccc5e`)
- PWA: `apps/web/public/manifest.json` (cyan theme)
- Previous auth migration: commit `4c5762c` — login + forgot-password page bodies
