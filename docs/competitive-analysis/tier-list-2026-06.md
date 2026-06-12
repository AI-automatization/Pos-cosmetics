# RAOS Competitor Tier List — Uzbekistan POS Market

**Date:** 2026-06-06
**Author:** Ibrat (Full-Stack) + Claude AI Research
**Sources:** Web research, codebase audit (38 API modules, 60+ tables, 100+ mobile screens), competitor websites, Crunchbase, KPMG Fintech UZ report

---

## TIER LIST

### S-TIER — Direct Threats (Well-Funded, Strong Market Position)

---

#### 1. TBC Uzbekistan Ecosystem (Billz + Payme + OLX + Payme Nasiya)

| | |
|---|---|
| **Threat Level** | **9/10** |
| **Type** | Integrated fintech ecosystem |
| **Funding** | $9M in Billz ($20M valuation), TBC Bank capital |
| **Scale** | 4,000+ businesses (Billz), 17M users (Payme), 1.5M tx/month |

**What they do:** Georgia-based TBC Bank's vertically integrated ecosystem — POS software (Billz) + payments (Payme) + marketplace (OLX) + consumer lending (Payme Nasiya) under one corporate umbrella.

**Strengths vs RAOS:**
- Near-unlimited bank capital for subsidized pricing
- Vertical integration: bank account → POS → payment → consumer credit
- 17M Payme users = built-in customer acquisition channel
- E-commerce module (RAOS lacks this)
- Can cross-subsidize POS pricing using banking revenue
- Active M&A strategy (acquired OLX UZ in 2025)

**Weaknesses vs RAOS:**
- No offline-first architecture — cloud-dependent
- No double-entry ledger — superficial financial reporting
- No real estate module
- No AI analytics / Night Cashier
- Vendor lock-in to TBC banking ecosystem
- No desktop POS app (browser-only = slower for high-volume cashiers)
- No product variant system (color/size/volume per-variant pricing)
- No nasiya module with aging reports

---

#### 2. Billz (standalone product)

| | |
|---|---|
| **Threat Level** | **8/10** |
| **Type** | Cloud POS + CRM + E-commerce |
| **Funding** | TBC acquired 53% for $9M (2025) |
| **Scale** | 4,000+ merchants, 1.5M transactions/month |
| **Pricing** | ~999K UZS/month (Pro) |
| **Website** | billz.io |

**What they do:** All-in-one retail management SaaS — POS, inventory, CRM, e-commerce, financial tools.

**Strengths vs RAOS:**
- Market leader by merchant count among pure POS players
- E-commerce integration (online store builder)
- CRM with customer segmentation
- Retail education resources for merchants
- Strong sales team and physical market presence

**Weaknesses vs RAOS:**
- Cloud-only — no offline capability (critical in regions)
- No double-entry accounting (basic reporting only)
- No real estate module
- No AI-powered analytics
- No Telegram bot integration for alerts
- No product variant pricing at RAOS's granularity
- No stock transfer approval workflow
- 74% more expensive than RAOS Starter (999K vs 249K/mo)
- No mobile owner app (separate analytics app for owners)

---

#### 3. iiko

| | |
|---|---|
| **Threat Level** | **7/10** |
| **Type** | Restaurant ERP |
| **Distributor** | Zetta Group (since 2015), Kafesoft |
| **Scale** | 1,500+ restaurants in Uzbekistan |
| **Pricing** | From 1,295 RUB/month; 30-day trial |
| **Website** | iiko.ru |

**What they do:** ERP-class system for restaurant automation — POS, kitchen management, inventory, staff scheduling, delivery, loyalty.

**Strengths vs RAOS:**
- 1,500+ active installations in UZ — proven and trusted in F&B
- Deep kitchen management (recipe costing, ingredient tracking, KDS)
- Delivery aggregator integrations
- Mature product (10+ years), training academy
- Offline capability exists
- Certified partners in Tashkent

**Weaknesses vs RAOS:**
- Restaurant-only — cannot serve retail, pharmacy, cosmetics, real estate
- Russian-origin software — geopolitical risk in UZ market
- Pricing in RUB — exchange rate volatility for UZ merchants
- No double-entry ledger
- No nasiya/debt module
- No AI analytics
- No Telegram bot ecosystem
- Russian-first interface — not Uzbek-first UX
- No mobile owner app

---

### A-TIER — Significant Competitors (Good Product, Growing)

---

#### 4. MoySklad

| | |
|---|---|
| **Threat Level** | **7/10** |
| **Type** | Cloud ERP for SMBs |
| **Scale** | 96,000+ users (RU/KZ/UZ) |
| **Pricing** | Free tier available |
| **Website** | moysklad.uz |

**What they do:** Cloud-based ERP for sales, warehouse, and order management with marketplace integrations.

**Strengths vs RAOS:**
- Massive user base (96K+) — proven at scale
- Strong inventory with serial numbers and batch tracking
- Marketplace integrations (Wildberries, Ozon)
- 100+ API integrations ecosystem
- Free tier for entry

**Weaknesses vs RAOS:**
- Cloud-only, no offline mode
- Russian-centric — UZ localization is secondary
- No fiscal integration with Soliq.uz (designed for Russian OFD)
- No real estate module, no AI analytics
- No desktop POS app — browser-only
- No Telegram bots, no loyalty system
- No double-entry ledger
- Geopolitical risk (Russian origin)

---

#### 5. Arca Group

| | |
|---|---|
| **Threat Level** | **7/10** |
| **Type** | Cash register manufacturer + ERA Market software |
| **Scale** | 85,000+ devices produced, 64,000 active |
| **Presence** | 20+ service centers across Uzbekistan |
| **Website** | arca.uz |

**What they do:** Uzbekistan's largest cash register manufacturer (Pax A930), expanding into ERA Market software platform.

**Strengths vs RAOS:**
- Hardware dominance — 85,000+ cash registers = massive installed base
- 20+ service centers — unmatched physical presence in regions
- Government relationships (fiscal hardware certification)
- Brand recognition among traditional merchants
- Can bundle software free with hardware purchase

**Weaknesses vs RAOS:**
- Software is secondary to hardware — less sophisticated
- ERA Market platform is basic compared to RAOS's 38 modules
- No AI analytics, no real estate, no loyalty system
- No mobile apps
- No double-entry accounting, no multi-tenant architecture
- Legacy tech stack

---

#### 6. R-Keeper

| | |
|---|---|
| **Threat Level** | **6/10** |
| **Type** | Restaurant POS (premium) |
| **Partner** | BUSOFT + UZCARD |
| **Scale** | 21,000 installations globally, 30 countries |
| **Website** | rkeeper.uz |

**What they do:** Full-function restaurant and retail automation with UZCARD terminal integration.

**Strengths vs RAOS:**
- Global brand (20+ years maturity)
- UZCARD partnership for payment processing
- Deep restaurant features (table management, kitchen routing)
- Large partner network

**Weaknesses vs RAOS:**
- Restaurant-only vertical
- Expensive enterprise pricing — excludes SMBs
- Russian origin — geopolitical risk
- Dated interface, no modern UX
- No offline-first, no AI, no ledger, no real estate
- Requires specialized hardware

---

#### 7. Poster POS

| | |
|---|---|
| **Threat Level** | **6/10** |
| **Type** | Cloud POS (simple) |
| **Pricing** | From $14/month; 15-day trial |
| **Fiscal** | Multikassa integration |
| **Website** | joinposter.com |

**What they do:** Cloud-based POS with restaurant management focus, simple UX, tablet-friendly.

**Strengths vs RAOS:**
- Low entry price ($14/mo)
- Clean, simple UX — low learning curve
- Works on tablets (iPad/Android)
- Kitchen display system for restaurants
- Multikassa fiscal integration for UZ

**Weaknesses vs RAOS:**
- Cloud-dependent — no true offline mode
- Limited feature depth — no ledger, no AI, no real estate
- No multi-tenant architecture
- No nasiya/debt module, no Telegram bots
- No stock transfer workflows
- No mobile staff/owner apps
- Ukrainian origin — limited local support

---

#### 8. Smartdo

| | |
|---|---|
| **Threat Level** | **6/10** |
| **Type** | Offline-first POS (Android tablets) |
| **Setup** | 30-minute claim |
| **Website** | smartdo.uz |

**What they do:** Offline-first POS on Android tablets with AI analytics via Telegram, targeting bazaar merchants.

**Strengths vs RAOS:**
- Offline-first (same paradigm as RAOS — validates the approach)
- AI analytics via Telegram (similar concept to Night Cashier)
- 30-minute setup — fast onboarding
- Targets underserved bazaar segment
- Android tablet-based (cheap hardware)
- Local team, Uzbek-first

**Weaknesses vs RAOS:**
- Android tablet only — no desktop POS, no web admin panel
- ~10% of RAOS feature set (no 38 modules)
- No double-entry ledger, no real estate
- No multi-tenant isolation
- No payment provider integrations (Payme/Click/Uzum)
- No e-commerce / marketplace integration
- No mobile owner app, no subscription billing
- Small team, limited scale

---

### B-TIER — Moderate Competitors (Niche or Limited Features)

---

#### 9. SmartPOS (smartpos.uz)
- **Threat: 5/10** | UZKASSA hardware + free Web-Kassa software
- **vs RAOS:** Hardware-first, basic software, no inventory depth, no AI/ledger/real estate/mobile

#### 10. Jowi
- **Threat: 5/10** | Cafe/restaurant POS with Jowi Club customer app
- **vs RAOS:** Restaurant-only, no ledger/AI/real estate, limited inventory

#### 11. YesPOS (yespos.uz)
- **Threat: 5/10** | 3,200+ entrepreneurs, QPOS fiscal, cashback, QR promos
- **vs RAOS:** Limited features, no offline, no ledger/AI/real estate, no mobile apps

#### 12. 1C:Roznitsa
- **Threat: 5/10** | Enterprise retail module of 1C ecosystem
- **Strengths:** Accountants know 1C, deep accounting, government reporting
- **vs RAOS:** Extremely heavy/expensive, 1990s UX, no mobile/offline POS, no AI, requires consultant, not SaaS

#### 13. Regos / EasyTrade
- **Threat: 5/10** | 5,000+ stores, 7+ years, two-currency (UZS+USD)
- **vs RAOS:** Legacy tech, no AI/ledger/real estate, no mobile, no offline sync

#### 14. Optimo
- **Threat: 4/10** | Georgian POS, ~3,000 merchants, expanding to UZ
- **vs RAOS:** New to UZ, no offline, no fiscal Soliq.uz, no Uzbek localization depth

#### 15. Alfapos (alfapos.uz)
- **Threat: 4/10** | Multi-device POS, multi-currency, loyalty, SaaS
- **vs RAOS:** Limited traction, no offline, no ledger/AI/real estate

#### 16. Rahmat POS (rhmt.uz)
- **Threat: 4/10** | 3-in-1 payment device, QR (12+ services), NFC, marking
- **vs RAOS:** Payment-terminal-first, POS features secondary, no inventory depth

---

### C-TIER — Minor Players (Limited Scope)

---

| # | Конкурент | Threat | Description |
|---|-----------|--------|-------------|
| 17 | **U-POS** (u-pos.uz) | 3/10 | 1,000+ clients, hardware+software, Tashkent/Samarkand |
| 18 | **OSON Kassa** (oson.com) | 3/10 | First e-money operator in UZ, QR payments, PCI DSS |
| 19 | **Hippo POS** (hippo.uz) | 2/10 | Virtual cash register, gov approved since 2024 |
| 20 | **Multikassa** | 2/10 | Smartphone = cash register, OFD.uz registered |
| 21 | **E-POS** (uzpos.uz) | 2/10 | Simple virtual cash register |
| 22 | **POSSS** (posss.uz) | 2/10 | Basic POS + analytics |

---

### D-TIER — Adjacent Players (Not Direct Competitors)

---

| # | Player | Threat | Role |
|---|--------|--------|------|
| 23 | **PayMe Business** | 3/10 | Payment super-app (17M users) — integration partner, not POS competitor |
| 24 | **Click Business** | 2/10 | Payment super-app — integration partner, not POS competitor |

> RAOS already integrates both Payme and Click as payment providers. They are partners, not competitors — unless they build POS features into their merchant apps.

---

## FEATURE COMPARISON MATRIX

**Y** = Yes, **P** = Partial, **N** = No

| # | Feature | RAOS | Billz | iiko | MoySklad | Arca | Poster | Smartdo | 1C |
|---|---------|------|-------|------|----------|------|--------|---------|-----|
| 1 | Offline-first POS | **Y** | N | P | N | N | N | **Y** | P |
| 2 | Double-entry ledger (GAAP) | **Y** | N | N | N | N | N | N | **Y** |
| 3 | AI analytics (Night Cashier) | **Y** | N | N | N | N | N | P | N |
| 4 | Fiscal Soliq.uz integration | **Y** | Y | P | N | Y | P | Y | P |
| 5 | Multi-tenant isolation | **Y** | ? | N | Y | N | N | N | N |
| 6 | Product variants (color/size/volume) | **Y** | P | N | Y | N | P | N | Y |
| 7 | Nasiya (debt + aging reports) | **Y** | P | N | N | N | N | P | N |
| 8 | Loyalty (points + expiry) | **Y** | P | N | N | N | P | N | N |
| 9 | Real estate module | **Y** | N | N | N | N | N | N | N |
| 10 | Mobile staff app (100+ screens) | **Y** | P | N | P | N | P | N | N |
| 11 | Mobile owner app | **Y** | N | N | N | N | N | N | N |
| 12 | Telegram bots (3 specialized) | **Y** | N | N | N | N | N | P | N |
| 13 | Multi-branch + stock transfers | **Y** | Y | P | Y | N | P | N | P |
| 14 | Payme + Click + Uzum payments | **Y** | P | N | N | P | N | P | N |
| 15 | SMS campaigns | **Y** | P | N | N | N | N | N | N |
| 16 | SaaS subscription billing | **Y** | Y | Y | Y | N | Y | ? | N |
| 17 | WebSocket real-time updates | **Y** | ? | P | N | N | N | N | N |
| 18 | Batch/expiry tracking | **Y** | P | P | Y | N | N | N | Y |
| 19 | 6-role RBAC system | **Y** | P | P | P | N | P | N | Y |
| 20 | Super Admin panel | **Y** | ? | N | N | N | N | N | N |
| 21 | Marketplace integration | **Y** | Y | N | Y | P | N | N | N |
| 22 | P&L / financial reports | **Y** | P | P | P | N | P | N | **Y** |
| 23 | Exchange rate tracking (CBU) | **Y** | N | N | P | N | N | N | Y |
| 24 | Background workers (8 types) | **Y** | ? | P | P | N | N | N | P |
| 25 | E-commerce / online store | **N** | **Y** | N | Y | P | N | N | N |

### Score Summary

| System | Features (of 25) | Coverage |
|--------|-------------------|----------|
| **RAOS** | **24** | **96%** |
| 1C:Roznitsa | 10 | 40% |
| Billz | 10 | 40% |
| MoySklad | 9 | 36% |
| iiko | 6 | 24% |
| Poster POS | 6 | 24% |
| Smartdo | 5 | 20% |
| Arca | 3 | 12% |

**RAOS leads in 22/25 features. Only gap: e-commerce (Billz, MoySklad have it).**

---

## 7 COMPETITIVE MOATS OF RAOS

### MOAT 1: Offline-First Architecture (Tauri + SQLite + Outbox Pattern)
**Why it matters:** Internet reliability outside Tashkent is poor. Bazaar merchants, pharmacies in regions NEED offline.
**Only competitor:** Smartdo (Android tablet only, ~10% of RAOS features).
**Defensibility:** HIGH. Retrofitting offline-first into cloud-only (Billz, Poster, MoySklad) = 12-18 month rewrite.

### MOAT 2: Double-Entry Ledger (GAAP-Compliant)
**Why it matters:** Only 1C has comparable accounting, but costs 10x more + requires consultant.
**RAOS embeds accounting into every transaction** — sales, payments, inventory, rental income.
**Defensibility:** VERY HIGH. 6-12 months of specialized engineering to replicate correctly.

### MOAT 3: Multi-Vertical Platform (6+ Verticals + Real Estate)
**Why it matters:** iiko/R-Keeper = restaurants. Billz = retail. Nobody does real estate.
**Target persona:** Uzbek investor with 2 shops + cafe + 3 rental apartments = only RAOS.
**Defensibility:** MEDIUM-HIGH. Real estate module is entirely unique in UZ market.

### MOAT 4: AI Analytics (Night Cashier)
**Why it matters:** No UZ competitor has AI analytics. Smartdo claims "AI via Telegram" but lacks depth.
**RAOS:** Workflow orchestration + token ledger + incident management (P0-P3).
**Defensibility:** MEDIUM. AI can be replicated, but integration depth with domain events creates compound value.

### MOAT 5: 3 Telegram Bots + SMS Campaigns
**Why it matters:** Telegram = 20M+ users in UZ. Three specialized bots (alerts, support, AI/TezCode).
**Defensibility:** MEDIUM. Bots are easy to build, but domain event integration adds value.

### MOAT 6: Nasiya (Debt) Module with Aging Reports + Telegram Reminders
**Why it matters:** Credit sales are deeply embedded in Uzbek retail culture.
**RAOS:** Debt tracking + aging reports + payment reminders via Telegram. Ledger integration (receivables in double-entry).
**Defensibility:** MEDIUM. Feature is simple, but ledger + bot integration creates compound value.

### MOAT 7: Dual Mobile Apps (Staff + Owner)
**Why it matters:** 100+ screens in staff app, separate owner app for oversight.
**No competitor** has dual-app approach.
**Defensibility:** MEDIUM. 12+ months of mobile development to replicate.

---

## STRATEGIC RECOMMENDATIONS

### 1. Against TBC/Billz — Position on Independence
> "Your business data shouldn't live inside a bank's ecosystem."

RAOS integrates ALL payment providers (Payme, Click, Uzum) — the merchant chooses. Billz locks merchants into TBC Bank.

### 2. Regional Expansion — Offline-First as Killer Feature
Target merchants outside Tashkent: Samarkand, Bukhara, Fergana, Namangan. Demo POS working without internet. Billz/Poster/MoySklad literally cannot replicate this demo.

### 3. "Investor Persona" — Multi-Asset Owner
Marketing message: **"One system for all your businesses and properties."**
The owner with shops + cafe + rentals has zero alternatives. Only RAOS.

### 4. Close the E-Commerce Gap (PRIORITY: HIGH)
ZZone marketplace integration already exists in codebase. Extend to built-in online store to eliminate RAOS's single meaningful feature disadvantage vs Billz/MoySklad.

### 5. Kill 1C for SMBs
> "RAOS replaces 1C — accountant-ready reports without paying for a consultant."

Merchants currently pay for POS + 1C consultant. RAOS's ledger means they need neither.

### 6. Nasiya as Wedge Feature for Bazaar Merchants
Offer simplified "Bazaar Mode" onboarding: nasiya + inventory + fiscal receipt. Then upsell to full platform.

### 7. Pricing — Total Cost of Ownership
| System | Monthly Cost | Includes |
|--------|-------------|----------|
| **RAOS Starter** | **249K UZS** | POS + Accounting + Mobile + AI + Real Estate |
| Billz Pro | 999K UZS | POS + CRM + E-commerce (no accounting, no AI) |
| iiko + 1C | ~2M UZS | Restaurant POS + accounting (two systems!) |
| 1C:Roznitsa + consultant | ~3M UZS | Accounting + POS + monthly consultant fee |

### 8. Monitor Smartdo
Only competitor with same offline-first philosophy. RAOS advantage: feature depth (38 modules vs basic) + platform breadth (desktop + web + 2 mobile apps vs Android tablet only). If Smartdo gains traction, consider Android tablet POS mode.

---

## POSITIONING STATEMENT

> **For Uzbek multi-branch retailers and mixed-asset investors** who need a single system that works everywhere — online and offline, shop and rental property, Tashkent and Fergana —
>
> **RAOS is the only business operating system** that combines offline-first POS, GAAP-compliant accounting, AI analytics, real estate management, and 6-vertical support in one platform.
>
> **Unlike Billz** (cloud-only, bank-locked), **iiko** (restaurants-only), or **1C** (expensive, requires consultants),
>
> **RAOS works without internet, replaces your accountant's 1C, and manages all your assets from one dashboard** — starting at 249,000 UZS/month.

---

## THREAT MATRIX VISUALIZATION

```
THREAT LEVEL (1-10)
10 |
 9 | [TBC Ecosystem]
 8 | [Billz]
 7 | [iiko] [MoySklad] [Arca]
 6 | [R-Keeper] [Poster] [Smartdo]
 5 | [SmartPOS] [Jowi] [YesPOS] [1C] [Regos]
 4 | [Optimo] [Alfapos] [Rahmat]
 3 | [U-POS] [OSON] [PayMe*]
 2 | [Hippo] [Multikassa] [E-POS] [Click*]
 1 |
   +------------------------------------------
     D-Tier    C-Tier    B-Tier   A-Tier  S-Tier

* = integration partner, not direct competitor
```

---

_Last updated: 2026-06-06 | Next review: 2026-07-06_
