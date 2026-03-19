# RAOS — OCHIQ VAZIFALAR (Kosmetika POS MVP)
# Yangilangan: 2026-03-15 (Ibrat — T-226..T-228: mobile-owner↔backend full integration)
# Format: T-XXX | Prioritet | [KAT] | Sarlavha

---

## 📌 QOIDALAR

```
1. Har topilgan bug/task → shu faylga DARHOL yoziladi
2. Sessiya boshida shu faylni O'QIB, oxirgi T-raqamdan DAVOM ettiriladi
3. Takroriy task yaratmaslik — mavjudini yangilash
4. Fix bo'lgach → shu yerdan O'CHIRISH → docs/Done.md ga KO'CHIRISH
5. Prioritet: P0=kritik, P1=muhim, P2=o'rta, P3=past
6. Kategoriya: [BACKEND], [FRONTEND], [DEVOPS], [SECURITY], [IKKALASI]
```

---

## T-220 | P0 | [BACKEND] | Owner Panel — Barcha endpointlar Postman/Swagger test

- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** Swagger: `http://localhost:3000/api`
- **Maqsad:** Mobile-owner panel uchun kerakli barcha endpointlar ishlashini tasdiqlash
- **Checklist:**
  ```
  □ POST /auth/login                → owner@kosmetika.uz / Demo1234! → JWT token
  □ GET  /branches                  → 4 ta filial qaytaradi
  □ GET  /analytics/revenue         → 4 ta metric (today/week/month/year)
  □ GET  /analytics/orders          → total, avgOrderValue, trend
  □ GET  /analytics/sales-trend     → 30 kun grafik ma'lumoti
  □ GET  /analytics/branch-comparison → 4 filial daromad
  □ GET  /analytics/top-products    → top 5 tovar
  □ GET  /analytics/stock-value     → byBranch array
  □ GET  /inventory/stock           → tovarlar ro'yxati (pagination, status filter)
  □ GET  /inventory/low-stock       → kam qolgan tovarlar
  □ GET  /shifts                    → smenalar ro'yxati (pagination, status filter)
  □ GET  /shifts/:id                → smena detail + paymentBreakdown
  □ GET  /debts/summary             → totalDebt, overdueDebt, overdueCount, debtorCount, avgDebt
  □ GET  /debts/customers           → nasiya mijozlar (pagination)
  □ GET  /debts/aging-report        → 4 ta bucket (0_30, 31_60, 61_90, 90_plus)
  □ GET  /employees/performance     → xodimlar statistikasi
  □ GET  /alerts                    → xabarlar (priority, status filter, pagination)
  □ PATCH /alerts/:id/read          → o'qildi belgilash
  □ GET  /system/health             → server status, DB ping, Redis ping
  ```
- **Note:** Har endpoint `branchId` filter qabul qilishi va `tenant_id` JWT dan olib ishlashi kerak

---



## ✅ T-122 | P1 | [BACKEND] | Eskiz.uz SMS → Telegram + Email (BAJARILDI 2026-03-09)
> Eskiz.uz to'liq olib tashlandi. Telegram Bot API (bepul) + SMTP Email fallback.
> - `sms.service.ts` o'chirildi
> - `telegram-notify.service.ts`, `email-notify.service.ts`, `notify.service.ts` yaratildi
> - Schema: `users.telegram_chat_id`, `customers.telegram_chat_id`, `telegram_link_tokens` jadvali
> - Bot: `/start <token>` deep link qo'llab-quvvatlash
> - API: `POST /notifications/telegram/link-token`, `POST /notifications/telegram/verify`
> - `nodemailer` package qo'shildi; `.env.example` yangilandi

---

## 📅 REJA: 8 haftalik FULL PRODUCTION (Kosmetika do'koni)

| Hafta | Maqsad |
|-------|--------|
| **Week 1** | Catalog + Basic POS sale + Receipt print + Shift |
| **Week 2** | Inventory movements + Low stock + Simple reports |
| **Week 3** | Refund/return + Audit log + Roles/Permissions UI |
| **Week 4** | Expiry module + Expiry report + Staging deploy |
| **Week 5** | ⭐ NASIYA (qarz) + Customer CRM + Ledger integration |
| **Week 6** | ⭐ Offline architecture + Sync engine + Resilience |
| **Week 7** | ⭐ SaaS Owner Dashboard + Security hardening |
| **Week 8** | ⭐ Mobile app + Telegram bot + Performance + Deploy |

### ⚠️ KRITIK TOPILMA: NASIYA (qarz savdo) — MVP da YO'Q edi!
> O'zbekiston do'konlarining **60-70%** nasiyada sotadi. Bu funksiya bo'lmasa tizim ishlatilmaydi.
> T-050 — T-054 DARHOL Week 1-2 ga parallel qo'shilishi kerak!

---

## 🔴 P0 — KRITIK (MVP Day 1 uchun shart)

---

### ═══════════════════════════════════════
### WEEK 1 — Catalog + POS Sale + Shift
### ═══════════════════════════════════════

---


### ═══════════════════════════════════════
### WEEK 2 — Inventory + Low Stock + Reports
### ═══════════════════════════════════════

---



### ═══════════════════════════════════════
### WEEK 3 — Refund/Return + Audit + Security
### ═══════════════════════════════════════

---


---

### ═══════════════════════════════════════
### WEEK 4 — Expiry + Expenses + Deploy
### ═══════════════════════════════════════

---


---




## 🟡 P1 — MUHIM (funksional xatolik / MVP+)

_(yuqoridagi T-024 — T-037 P1 tasklar ham shu kategoriyada)_

---

## 🔵 P2 — O'RTA (MVP dan keyin, Phase 2)

---


## ⚪ P3 — PAST (Phase 2+, keyinroq)

---

# ════════════════════════════════════════════════════════════════
# PRODUCTION-READY FEATURES (Deep Analysis — T-050+)
# ════════════════════════════════════════════════════════════════

---

### ═══════════════════════════════════════
### 🔥 NASIYA (QARZ SAVDO) — ENG KRITIK!
### O'zbekiston do'konlarining 60-70% nasiyada sotadi
### Bu bo'lmasa tizim ISHLATILMAYDI
### ═══════════════════════════════════════

---



### ═══════════════════════════════════════
### 🖥️ SAAS OWNER (FOUNDER) DASHBOARD
### Barcha tenantlar ustidan monitoring
### ═══════════════════════════════════════

---



---


### ═══════════════════════════════════════
### 🌐 OFFLINE-FIRST ARXITEKTURA
### Internet yo'q paytda savdo davom etadi
### Internet kelganda data avtomatik sync
### ═══════════════════════════════════════

---


---

### ═══════════════════════════════════════
### 🔒 SECURITY HARDENING
### ═══════════════════════════════════════

---


### ═══════════════════════════════════════
### P3 — KELAJAK (6+ oy)
### ═══════════════════════════════════════

---

## T-118 | P3 | [BACKEND] | 1C export — Buxgalteriya integratsiya
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Savdo/xarid datalarini 1C-compatible formatda export (XML). O'zbekistonda ko'p buxgalterlar 1C ishlatadi.

## T-119 | P3 | [BACKEND] | Marketplace sync — Uzum/Sello
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Online sotish: catalog sync, stock sync, order import. Omnichannel.

## T-120 | P3 | [BACKEND] | AI forecasting — Seasonal demand prediction
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Kosmetika seasonal: sunscreen (yoz), moisturizer (qish), gift sets (8-Mart, Yangi yil). O'tgan yil datasi bo'yicha buyurtma tavsiya.

## T-121 | P3 | [BACKEND] | Google Sheets export — Automated daily data
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Scheduled: kunlik savdo data → linked Google Sheet. Ko'p do'kon egalari Sheets da tahlil qiladi.

## T-124 | P3 | [IKKALASI] | Feature flags — Per-tenant feature toggle
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** `feature_flags` jadvali. Admin paneldan enable/disable: loyalty, multi-branch, fiscal, promotions. Gradual rollout.

---

# ════════════════════════════════════════════════════════════════
# TOPILGAN KAMCHILIKLAR — Developer Tooling & DX (T-125+)
# ════════════════════════════════════════════════════════════════

---

### ═══════════════════════════════════════
### 🛠️ DEVELOPER TOOLING & INFRATUZILMA
### ═══════════════════════════════════════

---

## T-125 | P0 | [BACKEND] | Swagger/OpenAPI documentation — API docs setup
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/main.ts`, `apps/api/src/**/*.dto.ts`
- **Vazifa:**
  - `@nestjs/swagger` — SwaggerModule.setup('/api/docs')
  - Barcha DTO larga `@ApiProperty()` decorator
  - Controller larga `@ApiTags()`, `@ApiBearerAuth()`, `@ApiOperation()`, `@ApiResponse()`
  - Swagger JSON export: `/api/docs-json` (frontend client generate uchun)
  - Grouping: Identity, Catalog, Sales, Inventory, Payments, Reports, Admin
  - Auth: Swagger UI da Bearer token kiritish imkoniyati
- **Kutilgan:** `/api/docs` da to'liq interaktiv API dokumentatsiya

---

## T-126 | P0 | [BACKEND] | Test infrastructure — Jest setup + first tests
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `apps/api/jest.config.ts`, `apps/api/src/**/*.spec.ts`
- **Vazifa:**
  - Jest config: `apps/api/jest.config.ts` (ts-jest, moduleNameMapper, coverage)
  - Test DB: `DATABASE_URL_TEST` in .env, test Prisma client
  - Unit test namuna: `identity.service.spec.ts` — register, login, refresh token
  - Integration test namuna: `auth.controller.spec.ts` — POST /auth/login, POST /auth/register
  - Test utilities: `createTestApp()`, `createTestUser()`, `getAuthToken()`
  - Coverage threshold: 50% minimum (boshlang'ich)
  - `pnpm --filter api test` script
- **Kutilgan:** Test infra tayyor, namuna testlar ishlaydi, CI da run bo'ladi

---

## T-127 | P1 | [BACKEND] | Database seed data — Development uchun test data
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `apps/api/prisma/seed.ts`
- **Vazifa:**
  - `prisma db seed` — development uchun sample data yaratish
  - Seed data:
    - 1 tenant (Kosmetika do'koni "Gul Kosmetika")
    - 1 owner user (admin@test.com / password123)
    - 1 cashier user (cashier@test.com / password123)
    - 1 branch (default)
    - 10 categories (Terini parvarish, Soch, Makiyaj, Atir, Tirnoq, ...)
    - 5 units (dona, quti, set, ml, gram)
    - 30+ products (har kategoriyadan, barcode, narx, min_stock bilan)
    - 5 customers (telefon, nasiya bilan)
  - Idempotent: qayta run qilsa xato bermaydi
  - package.json: `"prisma": { "seed": "ts-node prisma/seed.ts" }`
- **Kutilgan:** `pnpm --filter api db:seed` bilan tayyor test muhit

---

## T-128 | P0 | [DEVOPS] | .gitignore yangilash — Keraksiz fayllarni ignore
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `.gitignore`
- **Vazifa:**
  - `tsconfig.tsbuildinfo` — barcha apps da
  - `.claude/settings.local.json` — local Claude config
  - `logs/` — runtime log fayllar
  - `.env.local`, `.env.staging`, `.env.production`
  - `*.tsbuildinfo`
  - `apps/api/dist/`
  - `apps/web/.next/`
- **Kutilgan:** Git status da keraksiz fayllar ko'rinmaydi

---

### ═══════════════════════════════════════
### 📁 FAYL YUKLASH & MEDIA
### ═══════════════════════════════════════

---

## T-129 | P1 | [BACKEND] | File upload service — MinIO S3 integration
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/upload/`
- **Vazifa:**
  - `UploadModule`, `UploadService`
  - MinIO client: `@aws-sdk/client-s3`
  - POST /upload — single file upload (image: jpeg/png/webp, max 5MB)
  - POST /upload/bulk — multiple files (max 10)
  - Buckets: `product-images`, `receipts`, `certificates`, `exports`
  - Auto-resize: thumbnail (200px), medium (800px), original
  - Presigned URL: GET /upload/:key — vaqtinchalik download link
  - Mimetype + size validation, tenant_id folder isolation
- **Kutilgan:** Product image va fayllarni yuklash ishlaydi

---

## T-130 | P1 | [BACKEND] | Product bulk import/export — CSV/Excel
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/catalog/import/`
- **Vazifa:**
  - POST /products/import — CSV/XLSX fayldan bulk import
  - Template: GET /products/import/template — bo'sh Excel template yuklab olish
  - Import flow: upload → validate → preview (errors ko'rsatish) → confirm → save
  - Validation: barcode uniqueness, category exists, price > 0, required fields
  - Duplicate handling: barcode mavjud → update yoki skip (user tanlaydi)
  - GET /products/export — barcha productlarni Excel ga chiqarish
  - BullMQ: 500+ row → async job, tayyor bo'lganda notification
- **Kutilgan:** Do'kon ochishda 500-1000 ta productni tezkor kiritsa bo'ladi

---

## T-131 | P1 | [BACKEND] | Barcode generation — Barcodesiz product uchun
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/catalog/`
- **Vazifa:**
  - Barcode format: EAN-13 (internal), prefix: tenant-specific (e.g. 200XXXXX)
  - Auto-generate: product yaratishda barcode yo'q bo'lsa → internal barcode yaratish
  - GET /products/:id/barcode — barcode image (SVG/PNG) generate qilish
  - Batch barcode generate: POST /products/generate-barcodes — tanlangan products uchun
  - `bwip-js` library
- **Kutilgan:** Barcodesiz productlarga ham barcode berib, etiketka chop etsa bo'ladi

---

### ═══════════════════════════════════════
### ⚙️ TENANT KONFIGURATSIYA
### ═══════════════════════════════════════

---

## T-132 | P1 | [BACKEND] | Tenant settings — Configurable per-tenant sozlamalar
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/settings/`
- **Vazifa:**
  - `tenant_settings` jadvali: id, tenant_id, key, value (JSON), updated_at
  - Settings:
    - `currency` — UZS (default), USD
    - `tax_rate` — 12 (default QQS)
    - `tax_inclusive` — true/false (narxga QQS kirganmi)
    - `receipt_header` — do'kon nomi, manzil, INN, telefon
    - `receipt_footer` — "Xaridingiz uchun rahmat!"
    - `logo_url` — receipt va admin panel uchun
    - `shift_required` — savdo qilish uchun shift ochish shartmi
    - `debt_limit_default` — yangi customer uchun default nasiya limit
    - `rounding` — 100 yoki 1000 ga yaxlitlash
    - `low_stock_threshold` — default min_stock_level
  - GET /settings — tenant sozlamalari
  - PATCH /settings — yangilash (faqat ADMIN/OWNER)
  - Default values: birinchi marta o'qilganda avtomatik yaratiladi
- **Kutilgan:** Har do'kon o'zi uchun sozlama qilsa bo'ladi

---

## T-133 | P1 | [BACKEND] | Price history — Narx o'zgarishi tarixi
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/catalog/`
- **Vazifa:**
  - `price_changes` jadvali: id, tenant_id, product_id, old_cost_price, new_cost_price, old_sell_price, new_sell_price, changed_by (user_id), reason, created_at
  - Product update qilinganda narx o'zgargan bo'lsa → avtomatik log
  - GET /products/:id/price-history — narx o'zgarish tarixi
  - Margin tahlili: cost va sell price trend chart uchun data
  - ⚠️ Immutable — price_changes UPDATE/DELETE TAQIQLANGAN
- **Kutilgan:** Narx o'zgarishi izlanadi, margin trend ko'rinadi

---

### ═══════════════════════════════════════
### 🖥️ FRONTEND INFRATUZILMA
### ═══════════════════════════════════════

---

---

## T-138 | P1 | [BACKEND] | Stock levels — Snapshot dan keyin qo'shilgan mahsulotlar ko'rinmaydi

- **Sana:** 2026-03-08
- **Mas'ul:** Polat / Bekzod
- **Fayl:** `apps/api/src/inventory/inventory.service.ts` → `getStockLevels()`
- **Muammo:** `getStockLevels()` snapshot mavjud bo'lsa `stock_snapshots` + delta yondashuvi ishlatadi. Ammo snapshot DAN KEYIN qo'shilgan yangi mahsulotlar faqat `stock_movements`da bo'ladi, `stock_snapshots`da yo'q. Natijada LEFT JOIN orqali ular ko'rinmaydi.
- **Kutilgan:** Snapshot'dan keyingi yangi mahsulotlar ham `GET /api/v1/inventory/levels`da ko'rinishi kerak.
- **Taklif:** SQL'ga UNION ALL qo'shing — snapshot'da bo'lmagan, lekin `stock_movements`da (snapshot vaqtidan keyin) bo'lgan mahsulotlarni ham qo'shsin.
- **Workaround (hozircha):** `stock_snapshots` jadvali bo'sh bo'lsa, full aggregate mode ishlaydi va barcha mahsulotlar ko'rinadi.

---

## T-139 | P1 | [IKKALASI] | ibrat/feat-mobile-app → main merge va Railway deploy

- **Sana:** 2026-03-09
- **Mas'ul:** Polat (merge review) + Ibrat (mobile test after deploy)
- **Muammo:** Mobile-specific backend routes faqat `ibrat/feat-mobile-app` branchida, `main`da yo'q → Railway da 404:
  - `GET /inventory/stock` — mobile alias (safeQueryFn bilan 404 ushlanadi)
  - `GET /inventory/stock/low` — mobile alias
  - `GET /sales/quick-stats` — dashboard uchun kritik
  - `GET /sales/shifts/active` — dashboard uchun kritik
  - `GET /analytics/revenue` + `/branches/comparison` + `/insights` — analytics controller yo'q
- **Kutilgan:** PR yaratib `main`ga merge qilish → Railway auto-deploy → mobile app real data ko'radi
- **Eslatma:** Mobile app hozircha 404 larni `safeQueryFn` bilan ushlab, empty state ko'rsatadi (crash yo'q)

---

## T-140 | P1 | [BACKEND] | Real estate controller — routes bo'sh

- **Sana:** 2026-03-09
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/realestate/realestate.controller.ts`
- **Muammo:** Controller `@Controller('real-estate')` deklaratsiya qilingan lekin HECH QANDAY route yo'q. Mobile app `/real-estate/properties`, `/real-estate/stats`, `/real-estate/payments` ga murojaat qiladi — hammasi 404. `safeQueryFn` ushlab turadi.
- **Kutilgan:** `getProperties()`, `getStats()`, `getRentalPayments()`, `getAllPayments()` endpointlari qo'shilsin

---

## 📊 STATISTIKA

| Umumiy | P0 | P1 | P2 | P3 |
|--------|----|----|----|----|
| **127** | **34** | **58** | **15** | **20** |

### MVP (T-011 — T-049): 39 task
### Production Features (T-050 — T-124): 75 task
### Topilgan kamchiliklar (T-125 — T-137): 13 task

---

### Kategoriya bo'yicha

| Kategoriya | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| [BACKEND] | 20 | 38 | 8 | 7 | **73** |
| [FRONTEND] | 10 | 11 | 4 | 4 | **29** |
| [MOBILE] | — | 3 | 1 | — | **4** |
| [DEVOPS] | 3 | 2 | — | — | **5** |
| [IKKALASI] | 3 | 3 | — | 2 | **8** |
| [SECURITY] | — | — | — | — | **(guards ichida)** |

---

### Mas'uliyat taqsimoti

| Dasturchi | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| **Polat** (Backend & DevOps) | 21 | 39 | 7 | — | **67** |
| **AbdulazizYormatov** (Frontend) | 12 | 9 | 4 | — | **25** |
| **Ibrat + Abdulaziz** (Mobile) | — | 3 | 1 | — | **4** |
| **Birgalikda** | 3 | 3 | — | — | **6** |
| **Belgilanmagan** | — | — | 3 | 20 | **23** |

---

### ⚠️ TOPILGAN KRITIK KAMCHILIKLAR

```
1. NASIYA YO'Q EDI — O'zbekiston bozoridagi eng muhim funksiya (T-050—T-054)
2. CUSTOMER CRM YO'Q — nasiya va loyalty uchun zarur (T-050)
3. OFFLINE SYNC BO'SH — packages/sync-engine hozir export {} (T-062—T-066)
4. FRONTEND 0% — faqat default Next.js sahifa mavjud
5. DOCKER CONFIGS YO'Q — docker/ papka bo'sh (.gitkeep)
6. UZS YAXLITLASH YO'Q — real hayotda tiyin yo'q (T-080)
7. VALYUTA SUPPORT YO'Q — import kosmetika USD da narxlanadi (T-082)
8. SAAS OWNER PANEL YO'Q — founder monitoring (T-055—T-061)
```

---

### 🏆 TAVSIYA ETILGAN SPRINT TARTIBI

```
Sprint 1 (Hafta 1-2):  Prisma schema HAMMA jadvali + Catalog + Customer + Nasiya
Sprint 2 (Hafta 2-3):  Sales + Shifts + Payments — asosiy savdo loop
Sprint 3 (Hafta 3-4):  Inventory + Nasiya payments + Ledger — pul oqimi
Sprint 4 (Hafta 4-5):  Frontend POS + Receipt + Shift UI — minimal UI
Sprint 5 (Hafta 5-6):  Offline sync + IndexedDB + Outbox — real do'konga deploy
Sprint 6 (Hafta 6-7):  Reports + Audit + Expiry + Security — ishonchlilik
Sprint 7 (Hafta 7-8):  SaaS Dashboard + Subscription + Monitoring + Deploy
Sprint 8 (Hafta 8+):   Mobile app + Telegram bot + Analytics + Polish
```

---

---

### ═══════════════════════════════════════
### 🔍 FRONTEND QA & DEPLOY (Ibrat — 2026-03-09)
### ═══════════════════════════════════════

---

---

### ═══════════════════════════════════════
### 🔧 OWNER MOBILE — Employee Management Backend (Ibrat — 2026-03-14)
### ═══════════════════════════════════════

---



## T-227 | P1 | [IKKALASI] | Integration test checklist — mobile-owner endpoints

- **Sana:** 2026-03-15
- **Mas'ul:** Ibrat (Mobile) + Bekzod (Test)
- **Vazifa:**
  - [ ] Login: `POST /auth/login` (owner@kosmetika.uz / Demo1234! / kosmetika-demo)
  - [ ] `GET /analytics/revenue` — today/week/month/year + trends
  - [ ] `GET /analytics/orders` — total, avgOrderValue, trend
  - [ ] `GET /analytics/branch-comparison` — 4 filial
  - [ ] `GET /analytics/revenue-by-branch` — 4 filial
  - [ ] `GET /analytics/sales-trend` — kunlik grafik
  - [ ] `GET /analytics/top-products` — top 10
  - [ ] `GET /shifts` — paginated list
  - [ ] `GET /shifts/summary` — total revenue, orders
  - [ ] `GET /shifts/active` — ochiq smenalar
  - [ ] `GET /shifts/:id` — smena detali
  - [ ] `GET /debts/summary` — totalDebt, overdueDebt
  - [ ] `GET /debts/aging-report` — buckets
  - [ ] `GET /debts/customers` — paginated
  - [ ] `GET /alerts` — paginated
  - [ ] `GET /alerts/unread-count`
  - [ ] `PATCH /alerts/:id/read`
  - [ ] `GET /system/health` — DB + Redis
  - [ ] `GET /system/sync-status` — filiallar
  - [ ] `GET /employees` — list
  - [ ] `GET /inventory/out-of-stock`
  - [ ] Seed data: `npx ts-node prisma/seed.ts`

---


*docs/Tasks.md | RAOS Kosmetika POS — Full Production v2.1 | 2026-03-15*

---

## 🔴 ABDULAZIZ — FRONTEND WEB AUDIT TASKLARI (2026-03-18) — T-236..T-249

---

---

---

---

---

---

## T-241 | P2 | [IKKALASI] | packages/types — etishmayotgan shared typelar

- **Sana:** 2026-03-18
- **Mas'ul:** AbdulazizYormatov + Polat (kelishib)
- **Fayl:** `packages/types/src/`
- **Muammo:** `ProductVariant`, `Bundle`, `LoyaltyAccount`, `Promotion` typelar yo'q shared package da
- **Kutilgan:** packages/types ga qo'shish: `ProductVariant`, `Bundle`, `LoyaltyAccount`, `Promotion`

---

---

---

*docs/Tasks.md | RAOS Kosmetika POS — Full Production v2.2 | 2026-03-18 (AbdulazizYormatov audit)*
