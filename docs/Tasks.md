# RAOS — OCHIQ VAZIFALAR (Kosmetika POS MVP)
# Yangilangan: 2026-03-23 (Jamoa qayta tashkil etildi)
# Format: T-XXX | Prioritet | [KAT] | Sarlavha

---

## JAMOA TUZILISHI (2026-03-23 dan)

| Ism | Roli | Zona |
|-----|------|------|
| **AbdulazizYormatov** | Team Lead | Umumiy rahbariyat |
| **Ibrat** | Full-Stack (Web + Backend + DevOps) | `apps/api/`, `apps/web/`, `apps/worker/`, `apps/bot/`, `docker/`, `prisma/` |
| **Abdulaziz** | Mobile (Android + iOS) | `apps/mobile/`, `apps/mobile-owner/` |
| **Bekzod** | PM (Project Manager) | Rejalashtirish, test, arxitektura |

> Polat loyihadan chiqdi (2026-03-23). Barcha uning vazifalari Ibrat ga o'tkazildi.

---

## QOIDALAR

```
1. Har topilgan bug/task -> shu faylga DARHOL yoziladi
2. Sessiya boshida shu faylni O'QIB, oxirgi T-raqamdan DAVOM ettiriladi
3. Takroriy task yaratmaslik — mavjudini yangilash
4. Fix bo'lgach -> shu yerdan O'CHIRISH -> docs/Done.md ga KO'CHIRISH
5. Prioritet: P0=kritik, P1=muhim, P2=o'rta, P3=past
6. Kategoriya: [BACKEND], [FRONTEND], [MOBILE], [DEVOPS], [SECURITY], [IKKALASI]
```

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P0 (KRITIK)
# ══════════════════════════════════════════════════════════════

---

## T-340 | P0 | [SECURITY] | Employees controller — RolesGuard yo'q, har qanday user CRUD qila oladi

- **Sana:** 2026-03-29
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/employees/employees.controller.ts`
- **Muammo:** Controller da faqat `JwtAuthGuard` bor, `RolesGuard` yo'q. Natija: CASHIER, WAREHOUSE — har qanday autentifikatsiya qilingan user xodimlarni yaratishi, o'chirishi, statusini o'zgartirishi mumkin.
- **Kutilgan:**
  - `@UseGuards(JwtAuthGuard, RolesGuard)` qo'shish
  - `@Roles('OWNER', 'ADMIN')` barcha endpointlarga qo'shish
  - `updateStatus()` va `updatePosAccess()` uchun DTO yaratish (`@IsEnum`, `@IsBoolean`)

---

## T-341 | P0 | [BACKEND] | Employees service — N+1 query (getPerformance, getSuspiciousActivity)

- **Sana:** 2026-03-29
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/employees/employees.service.ts:157-213, 263-312`
- **Muammo:** `getPerformance()` — har xodim uchun alohida `findMany` (orders + returns). 50 xodim = 100+ query. `getSuspiciousActivity()` — har user uchun alohida `return.count()`.
- **Kutilgan:**
  - Bitta aggregate SQL query ga o'zgartirish (`$queryRaw` yoki Prisma `groupBy`)
  - `reports.service.ts:getEmployeeActivity()` dagi pattern dan foydalanish

---

## T-342 | P0 | [SECURITY] | Feature flags — tenant isolation bypass (overrideTenantId)

- **Sana:** 2026-03-29
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/common/feature-flags.controller.ts:39-41`
- **Muammo:** `listFlags()` da `overrideTenantId` query parametri mavjud — OWNER/ADMIN boshqa tenant flaglarini ko'rishi mumkin. SuperAdmin guard yo'q.
- **Kutilgan:**
  - `overrideTenantId` ni faqat `SuperAdminGuard` bilan himoyalash
  - Yoki bu parametrni butunlay o'chirish

---

## T-346 | P0 | [SECURITY] | Biometric verify — cross-tenant full table scan + timing attack

- **Sana:** 2026-03-30
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/identity/auth.controller.ts:354-366`
- **Muammo:** Security audit natijasi — `verifyBiometric` endpoint da 3 ta zaiflik:
  1. `@Public()` endpoint `findMany({ where: { isActive: true } })` — tenant_id YO'Q. BARCHA tenantlarning barcha userlarini yuklaydi. Cross-tenant authentication bypass imkoniyati.
  2. Biometric token tekshiruvida oddiy `===` ishlatilgan — timing attack ga moyil. `crypto.timingSafeEqual` kerak.
  3. Input validation DTO yo'q — `{ biometricToken: string; deviceId: string }` inline type, class-validator ishlamaydi.
- **Kutilgan:**
  - `BiometricDevice` alohida jadval yaratish — `tenantId` + `deviceId` bo'yicha indexed lookup
  - `crypto.timingSafeEqual` ishlatish
  - `VerifyBiometricDto` class yaratish (`@IsString()`, `@MaxLength()`)
  - `RegisterBiometricDto` ham yaratish (auth.controller.ts:319 da ham inline type)
- **Xavf:** Attacker biometric token ni topsa, boshqa tenant foydalanuvchisi nomidan JWT oladi

---


# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P1 (MUHIM)
# ══════════════════════════════════════════════════════════════

---

## T-347 | P1 | [SECURITY] | Refresh token body da qaytariladi, httpOnly cookie emas

- **Sana:** 2026-03-30
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/identity/auth.controller.ts:393`
- **Muammo:** Refresh token JSON response body da qaytariladi. CLAUDE.md standarti: "Refresh token (7d, httpOnly cookie)". XSS orqali token o'g'irlash imkoniyati.
- **Kutilgan:**
  - `res.cookie('refreshToken', token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7*24*3600*1000 })`
  - Response body dan `refresh_token` field ni olib tashlash
  - Frontend/Mobile da cookie-based refresh flow ga o'tish

---

## T-348 | P1 | [SECURITY] | Metrics endpoint autentifikatsiyasiz ochiq

- **Sana:** 2026-03-30
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/metrics/metrics.controller.ts`
- **Muammo:** `@Public()` + `@SkipThrottle()` — Prometheus metrikalari (memory, CPU, request count, error rate) hech qanday himoyasiz. Ichki system ma'lumotlari expose qilinadi.
- **Kutilgan:**
  - IP-based whitelist guard (faqat internal network) YOKI
  - Secret header (`X-Metrics-Secret` from .env) YOKI
  - Basic auth (Prometheus scraper uchun)
  - `@SkipThrottle()` ni olib tashlash yoki alohida rate limit qo'yish

---

## T-345 | P1 | [BACKEND] | Branch zona buzilishi — ibrat/feat-mobile-app da Abdulaziz zonasiga tegilgan

- **Sana:** 2026-03-29
- **Mas'ul:** Ibrat
- **Fayl:** `origin/ibrat/feat-mobile-app` branch
- **Muammo:** PR review natijasi — CLAUDE.md zona qoidasi buzilgan:
  1. Ibrat `apps/mobile-owner/` ga teggan (2 fayl) — bu Abdulaziz zonasi
  2. Branch nomi `ibrat/feat-mobile-app` — mobile = Abdulaziz zonasi, nom noto'g'ri
  3. Foydali kod bor: `apps/web/src/app/(admin)/inventory/` — inventory UI refactoring (Ibrat zonasi, OK)
- **Kutilgan:**
  - `apps/mobile-owner/` o'zgarishlarini olib tashlash (revert yoki cherry-pick faqat web+api)
  - Branch nomini `ibrat/feat-inventory-ui` ga o'zgartirish
  - Faqat web + api o'zgarishlarni PR qilish
  - Kelajakda: boshqa zona fayllariga tegmaslik (CLAUDE.md qoidasi)

---

## T-343 | P1 | [BACKEND] | SRP: 400+ qatorli fayllarni bo'lish (inventory, reports, bot commands)

- **Sana:** 2026-03-29
- **Mas'ul:** Ibrat
- **Fayl:** 3 ta fayl
- **Muammo:** CLAUDE.md qoidasi: 400+ qatorli fayl TAQIQLANGAN. Backend review natijasi:
  1. `apps/api/src/inventory/inventory.service.ts` — 597 qator → `StockLevelService`, `ExpiryTrackingService`, `StockValueService`
  2. `apps/api/src/reports/reports.service.ts` — 575 qator → `ZReportService`, `EmployeeActivityService`, `RevenueReportsService`
  3. `apps/bot/src/handlers/commands.ts` — 584 qator → `login.handler.ts`, `report.handler.ts`, `stock.handler.ts`
- **Kutilgan:** Har fayl 400 qatordan kam, SRP prinsipi saqlansin

---

## T-344 | P1 | [BACKEND] | DTO inline — finance va employees da DTO alohida faylga chiqarish

- **Sana:** 2026-03-29
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/finance/finance.service.ts:7-52`, `apps/api/src/employees/employees.controller.ts:11-18`
- **Muammo:** DTO lar service/controller fayl ichida aniqlangan. Arxitektura qoidasi: DTO = alohida fayl.
- **Kutilgan:**
  - `finance/dto/expense.dto.ts` ga `CreateExpenseDto`, `ExpenseFilterDto` ko'chirish
  - `employees/dto/employee.dto.ts` ga `CreateEmployeeDto` ko'chirish
  - `updateStatus` uchun yangi DTO — `@IsEnum(['active', 'inactive', 'fired'])`
  - `updatePosAccess` uchun yangi DTO — `@IsBoolean()`
  - Bitta faylda 2 ta controller: `warehouse-invoice.controller.ts`, `support.controller.ts` — ajratish

---

## T-339 | P1 | [BACKEND] | Schema: tenant_id yo'q child jadvallar + Cascade financial data da

- **Sana:** 2026-03-29
- **Mas'ul:** Ibrat
- **Fayl:** `prisma/schema.prisma`, migrations `20260327`, `20260328`
- **Muammo:** Schema review natijasi — 3 ta kritik muammo:
  1. `warehouse_invoice_items` da `tenant_id` yo'q — tenant isolation buziladi
  2. `ticket_messages` da `tenant_id` yo'q — tenant isolation buziladi
  3. `WarehouseInvoiceItem.onDelete: Cascade` — financial data uchun Cascade TAQIQLANGAN (audit trail yo'qoladi)
  4. ID type inconsistency — UUID (TEXT) vs BigInt convention tekshirilmagan
- **Kutilgan:**
  - `warehouse_invoice_items` ga `tenant_id TEXT NOT NULL` + composite index `[tenant_id, invoice_id]`
  - `ticket_messages` ga `tenant_id TEXT NOT NULL` + composite index
  - `WarehouseInvoiceItem.onDelete` → `Restrict` ga o'zgartirish
  - ID type convention ni loyiha bo'ylab yagona standartga keltirish
- **Qo'shimcha (P2):** FK constraints (`branch_id`, `supplier_id`, `product_id`, `warehouse_id`, `user_id`, `sender_id`), `WarehouseInvoice` ga `status` enum (DRAFT/CONFIRMED)

---
























# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P2 (O'RTA)
# ══════════════════════════════════════════════════════════════

---


---

## T-349 | P2 | [SECURITY] | Biometric + Users — password exposure va DTO validatsiya yo'qligi

- **Sana:** 2026-03-30
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/identity/auth.controller.ts:319`, `apps/api/src/identity/users.controller.ts`
- **Muammo:** Security audit natijasi — 3 ta o'rta darajali muammo:
  1. `findAllUsers`/`findOneUser` da `passwordHash`, `refreshToken` fieldlari response da qaytarilishi mumkin — `select`/`omit` tekshirish kerak
  2. `registerBiometric` (auth.controller.ts:319) — inline type, DTO yo'q
  3. `verifyBiometric` — inline type, DTO yo'q (T-346 bilan birgalikda tuzatish mumkin)
- **Kutilgan:**
  - Users service da `passwordHash`, `refreshToken`, `refreshTokenExp` ni `select` dan chiqarish
  - `RegisterBiometricDto` yaratish (`@IsString()`, `@MaxLength()`)

---

## T-332 | P2 | [MOBILE] | Mobile: экран System Health (мониторинг инфраструктуры)

- **Sana:** 2026-03-23
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile-owner/src/screens/SystemHealth/` (yangi)
- **Muammo:** Owner/Manager не видит статус инфраструктуры с телефона.
- **Kutilgan:**
  - Статусы: 🟢/🟡/🔴 API / DB / Worker / Fiscal
  - Статус синхронизации POS по каждому филиалу (pending_count, last_sync_at)
  - Последние ошибки (GET /system/errors)
  - Pull-to-refresh + автообновление каждые 30 сек

---

## T-333 | P2 | [MOBILE] | Mobile: экран просмотра склада (read-only)

- **Sana:** 2026-03-23
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile-owner/src/screens/Warehouse/` (yangi)
- **Muammo:** Owner/Manager не может проверить остатки склада с мобильного.
- **Kutilgan:**
  - Список товаров с остатками, поиск по названию/штрихкоду
  - Вкладка 🔴 Low stock — товары ниже минимума
  - Вкладка 🟡 Истекающие сроки — предупреждение за 30 дней
  - Только просмотр — изменения только через Warehouse ERP (веб)

---

## T-334 | P2 | [MOBILE] | Mobile: HR экран управления сотрудниками

- **Sana:** 2026-03-23
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile-owner/src/screens/HR/` (yangi)
- **Muammo:** Owner/Manager не может управлять сотрудниками с мобильного.
- **Kutilgan:**
  - Список сотрудников по филиалу (роль, статус, last active)
  - Создание аккаунта (имя, роль, email → invite flow T-329)
  - Деактивировать/активировать аккаунт
  - Статистика сотрудника: продажи за месяц, количество смен

---

---

---


---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P3 (KELAJAK, 6+ oy)
# ══════════════════════════════════════════════════════════════

---

## T-116 | P3 | [BACKEND] | Customer loyalty — Points + tiers

- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Earn points (1 point/1000 UZS). Tiers: Bronze/Silver/Gold. Birthday bonus. Redeem as payment. Backend da LoyaltyModule mavjud (T-043) — UI va to'liq integratsiya kerak.

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
- **Vazifa:** Scheduled: kunlik savdo data -> linked Google Sheet. Ko'p do'kon egalari Sheets da tahlil qiladi.

## T-124 | P3 | [IKKALASI] | Feature flags — Per-tenant feature toggle (kengaytirilgan)

- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** T-313 da asosiy feature flags yaratiladi. Bu task — gradual rollout, A/B testing, analytics integratsiya kabi kengaytirilgan funksiyalar.

---

# ══════════════════════════════════════════════════════════════
# STATISTIKA
# ══════════════════════════════════════════════════════════════

---

| Umumiy ochiq | P0 | P1 | P2 | P3 |
|--------------|----|----|----|----|
| **19** | **4** | **6** | **4** | **6** |

### Kategoriya bo'yicha

| Kategoriya | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| [BACKEND] | 1 | 4 | 0 | 5 | **10** |
| [SECURITY] | 3 | 2 | 1 | 0 | **6** |
| [FRONTEND] | 0 | 0 | 0 | 0 | **0** |
| [MOBILE] | 0 | 0 | 3 | 0 | **3** |
| [IKKALASI] | 0 | 0 | 0 | 1 | **1** |

### Mas'uliyat taqsimoti

| Dasturchi | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| **Ibrat** (Full-Stack) | 4 | 6 | 1 | 0 | **11** |
| **AbdulazizYormatov** (Team Lead, Frontend) | 0 | 0 | 0 | 0 | **0** |
| **Abdulaziz** (Mobile) | 0 | 0 | 3 | 0 | **3** |
| **Belgilanmagan** | 0 | 0 | 0 | 6 | **6** |

> Yangilangan: 2026-03-30 — Security audit: T-346 (P0 biometric), T-347 (P1 refresh token), T-348 (P1 metrics), T-349 (P2 password/DTO). + Schema: T-339. Backend: T-340..T-344. PR: T-345.

---

# ══════════════════════════════════════════════════════════════
# BAJARILGAN MODULLAR (allaqachon kodda mavjud)
# Bu yerda ko'rsatilgan narsalar Done.md da yoki kodda tayyor
# ══════════════════════════════════════════════════════════════

```
Quyidagi modullar apps/api/src/ da mavjud va ishlaydi:

  identity/     — Auth, JWT, Users, Sessions, RBAC, API keys, PIN
  catalog/      — Products, Categories, Units, Suppliers, Variants, Certificates, Prices
  inventory/    — Stock movements, Warehouses, Transfers, Testers, Snapshots
  sales/        — Orders, Shifts, Returns, Promotions
  payments/     — Cash, Terminal, Click, Payme providers
  ledger/       — Double-entry journal (immutable)
  tax/          — Fiscal adapter (stub), VAT 12%, fiscal worker
  customers/    — CRUD, stats
  nasiya/       — Debts, payments, aging report, debt aliases
  notifications/ — Push (FCM), Alerts, Telegram notify, Email notify
  ai/           — Analytics (7 endpoints), revenue, sales-trend, etc.
  billing/      — Subscription plans, limits, usage
  branches/     — CRUD, stats
  employees/    — CRUD, performance, fired status
  audit/        — Logs
  reports/      — Daily, top products, Z-report, export CSV/Excel
  finance/      — Expenses CRUD
  admin/        — Super admin, metrics, DLQ
  health/       — Live, ready, ping, system health
  realtime/     — WebSocket gateway (Socket.io)
  sync/         — Basic sync controller (needs expansion -> T-302)
  realestate/   — Module shell (empty controller -> T-140)
  loyalty/      — LoyaltyConfig, Account, Transaction
  metrics/      — Prometheus endpoint
  events/       — Domain events, EventEmitter2
  common/       — Cache, cron, guards, pipes, filters, circuit breaker, currency

  apps/worker/  — 6 queue workers (fiscal, notification, report, snapshot, export, sync)
  apps/bot/     — Telegram bot (grammY) — commands, cron alerts
```

---

*docs/Tasks.md | RAOS Kosmetika POS | v3.0 | 2026-03-23 (jamoa qayta tashkil etildi)*
