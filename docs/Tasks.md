# RAOS — OCHIQ VAZIFALAR (Kosmetika POS MVP)
# Yangilangan: 2026-04-19 (T-056 yopildi)
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

## T-387 | P0 | [SECURITY] | Super Admin hardening

- **Sana:** 2026-04-24
- **Mas'ul:** Ibrat
- **Topgan:** AbdulazizYormatov (audit)
- **Muammo:**
  - SQL console — whitelist/audit yo'q
  - JWT localStorage da (XSS xavf)
  - DLQ endpoints JwtAuthGuard yo'q
  - Login/bootstrap da rate-limit yo'q
- **Kutilgan:** Deploy oldin barcha xavfsizlik yopilgan bo'lishi SHART

---

## T-388 | P0 | [BACKEND] | Fiscal worker — cross-tenant update, retry yo'q

- **Sana:** 2026-04-24
- **Mas'ul:** Ibrat
- **Topgan:** AbdulazizYormatov (audit)
- **Fayl:** `apps/worker/` (fiscal processor)
- **Muammo:**
  - order.update da tenant_id filter yo'q → cross-tenant update
  - fiscalStatus=FAILED har retry da o'rnatiladi
  - Retry/backoff mexanizm yo'q
  - Idempotency key (jobId) ishlatilmayapti
- **Kutilgan:** Tenant isolation, retry logika, idempotency

---

## T-389 | P0 | [SECURITY] | Cookie namespace collision — super-admin vs web

- **Sana:** 2026-04-24
- **Mas'ul:** Ibrat
- **Topgan:** AbdulazizYormatov (audit)
- **Muammo:** session_active, user_role, access_token nomlari bir xil → *.raos.uz da session leak
- **Kutilgan:** Cookie nomlari prefix bilan ajratilgan (sa_, web_)

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P1 (MUHIM)
# ══════════════════════════════════════════════════════════════

---

## T-390 | P1 | [BACKEND] | Migration 20260421120000 — SKU update bez backup

- **Sana:** 2026-04-24
- **Mas'ul:** Ibrat
- **Topgan:** AbdulazizYormatov (audit)
- **Muammo:** UPDATE products SET sku backup siz → POS scan buzilishi mumkin
- **Kutilgan:** Migration da backup/rollback qo'shish

---

## T-391 | P1 | [SECURITY] | admin-database: SUPPORT role CSV download — tenant leak

- **Sana:** 2026-04-24
- **Mas'ul:** Ibrat
- **Topgan:** AbdulazizYormatov (audit)
- **Muammo:** SUPPORT role barcha tenants CSV yuklay oladi tenantId filtersiz
- **Kutilgan:** tenantId filter MAJBURIY

---

## T-392 | P1 | [BACKEND] | shift-alert listener tenantId yo'q + sales.service 707 qator

- **Sana:** 2026-04-24
- **Mas'ul:** Ibrat
- **Topgan:** AbdulazizYormatov (audit)
- **Fayl:** `apps/api/src/sales/sales.service.ts`
- **Muammo:** shift-alert listener tenantId yo'q; sales.service.ts 707 qator — SRP buzilgan
- **Kutilgan:** tenantId qo'shish; 4 ta fayl ga bo'lish

---

## T-384 | P1 | [FRONTEND] | Founder Panel — to'liq Ruscha tarjima

- **Sana:** 2026-04-21
- **Mas'ul:** Ibrat
- **Fayl:** Barcha `apps/web/src/app/(founder)/` va `apps/web/src/components/layout/FounderSidebar.tsx`
- **Muammo:** 3 til aralashgan — Sidebar: Ruscha, Kontentlar: O'zbekcha, Sarlavhalar: Inglizcha
- **Vazifa:**
  - FounderSidebar.tsx — allaqachon Ruscha (OK)
  - Overview page — "Founder Overview" → "Обзор", "Jami tenantlar" → "Всего тенантов" va h.k.
  - Tenants list — "Barchasi/Faol/Nofaol" → "Все/Активные/Неактивные" va h.k.
  - Tenant detail — tablar "Obzor/Obuna/Foydalanuvchilar" → "Обзор/Подписка/Пользователи"
  - Tenant new wizard — "Kompaniya/Vladelec/Tarif/Tasdiqlash" → "Компания/Владелец/Тариф/Подтверждение"
  - Database Manager — "Jadvallar/Hajm/Ulanishlar" → "Таблицы/Размер/Соединения"
  - Errors page — "Barchasi/Xato topilmadi" → "Все/Ошибок не найдено"
  - Admin Login — "Parol/Kirish" → "Пароль/Войти"
  - Sidebar bottomda: "Admin panelga" → "← В админ-панель", "Chiqish" → "Выйти"
- **Kutilgan:** Butun Founder Panel 100% Ruscha

---

## T-350 | P1 | [MOBILE] | Login ekrani — "Tashkilot kodi" (slug) maydoni ko'rinmaydi, login ishlamaydi

- **Sana:** 2026-04-25
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Auth/LoginScreen.tsx`
- **Muammo:** Simulatorda o'rnatilgan app eski bundle ishlatyapti. Yangi `LoginScreen.tsx` kodida `Tashkilot kodi` (slug) maydoni bor, lekin eski bundle da yo'q. API `POST /auth/login` uchun `slug` majburiy — form yubormagani sababli `"Kutilmagan xato"` chiqmoqda, login qilib bo'lmaydi.
- **Kutilgan:** Login formida `Tashkilot kodi` maydoni ko'rinadi, foydalanuvchi slug kiritib muvaffaqiyatli login qiladi.
- **Yechim:** `expo run:ios` bilan to'liq rebuild va yangi bundle o'rnatish. Simulator da yangi build ishga tushirilishi kerak.
- **Topildi:** Visual QA sessiyasi (Abdulaziz, 2026-04-25)

---
# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P2 (O'RTA, MVP dan keyin)
# ══════════════════════════════════════════════════════════════

---

## T-380 | P2 | [BACKEND+FRONTEND] | Super Admin — Billing & Monetizatsiya

- **Sana:** 2026-04-21
- **Mas'ul:** Ibrat
- **Holat:** OCHIQ (billing API hali sotib olinmagan)
- **Fayl:** `apps/api/src/admin/admin-billing.controller.ts` (yaratish kerak)
- **Vazifa:**
  - `GET /admin/billing/overview` — MRR, ARR, subscribers, conversion rate, plan distribution
  - `GET /admin/billing/plans` — barcha planlar + subscriber count
  - `POST /admin/billing/plans` — plan yaratish
  - `PATCH /admin/billing/plans/:id` — plan tahrirlash
  - `DELETE /admin/billing/plans/:id` — plan deaktivatsiya
  - `GET /admin/billing/subscriptions` — barcha obunalar + filtrlar
  - `GET /admin/billing/revenue-history` — MRR trend (6 oy)
  - Frontend: `/founder/billing` — KPI kartalar, pie chart, plan CRUD, subscription table
- **Eslatma:** Payme/Click integratsiya hali yo'q (T-107). Hozircha faqat manual subscription management.
- **Kutilgan:** Admin planlarni boshqara oladi, MRR/ARR ko'ra oladi, obunalarni override qila oladi

---

## T-351 | P2 | [MOBILE] | Login ekrani — "DEV: Skip Login" tugmasi production da ko'rinmasligi kerak

- **Sana:** 2026-04-25
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Auth/LoginScreen.tsx`
- **Muammo:** "DEV: Skip Login" tugmasi login ekranida ko'rinib turibdi. Agar `__DEV__` guard bilan himoyalanmagan bo'lsa, release build da ham ko'rinadi — xavfsizlik xatari.
- **Kutilgan:** Tugma faqat `__DEV__ === true` bo'lganda render qilinishi kerak. Production/release build da mutlaqo ko'rinmasin.
- **Topildi:** Visual QA sessiyasi (Abdulaziz, 2026-04-25)

---

## T-339 | P2 | [BACKEND] | Demo Seed — Low-stock mahsulot qo'shish (POS toast test uchun)

## T-097 | P2 | [BACKEND] | Product sertifikat — Kosmetika sifat hujjati

- **Sana:** 2026-02-26
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/catalog/`
- **Vazifa:** `product_certificates` CRUD (cert_number, issuing_authority, issued_at, expires_at, file_url).
  Expired sertifikat → alert.
- **Kutilgan:** Sertifikat ma'lumotlari saqlanadi va kuzatiladi

---

## T-107 | P2 | [BACKEND] | Payme/Click integratsiya — Online to'lov

- **Sana:** 2026-02-26
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/payments/providers/`
- **Vazifa:** Payme adapter (createTransaction, performTransaction, checkTransaction).
  Click adapter (prepare, complete). Webhook handler.
- **Kutilgan:** Online to'lov usullari ishlaydi

---

## T-378 | P2 | [MOBILE] | mobile-owner: EmployeeRole type mismatch — lowercase → UPPERCASE

- **Sana:** 2026-04-21
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile-owner/src/api/employees.api.ts`, `screens/HR/HRInviteSheet.tsx`, `screens/Employees/components/RoleSelector.tsx`
- **Muammo:** `EmployeeRole = 'cashier' | 'manager' | 'admin'` — lowercase. Backend Prisma enum `CASHIER | MANAGER | ADMIN | WAREHOUSE` kutadi. Yaratish Prisma da fail bo'ladi.
- **Vazifa:** `EmployeeRole` type ni UPPERCASE ga o'zgartirish + ROLES array labellarni yangilash
- **Kutilgan:** `POST /employees` muvaffaqiyatli ishlaydi

---

## T-379 | P2 | [MOBILE] | mobile-owner: AddEmployeeScreen — backend qo'llamaydigan fieldlarni tozalash

- **Sana:** 2026-04-21
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile-owner/src/screens/Employees/AddEmployeeScreen.tsx`, `employees.api.ts` `CreateEmployeeDto`
- **Muammo:** `CreateEmployeeDto` da `login`, `dateOfBirth`, `passportId`, `address` bor — backend User modelida yo'q, faqat `{ firstName, lastName, email, password, role, phone }` saqlanadi.
- **Vazifa:** `login` field olib tashlash (login = email). Qolgan extra fieldlarni `botSettings` da saqlash uchun backend endpoint kengaytirish yoki formdan olib tashlash.
- **Kutilgan:** DTO backend bilan mos, form faqat real saqlanadigan fieldlarni so'raydi

---

## ════════════════════════════════════════════════════════════════
## 🔴 MOBILE-OWNER API CONTRACT (T-221..T-226) — 2026-03-14
## apps/mobile-owner/src/config/endpoints.ts bilan TO'LIQ MOS KELISHI SHART
## Mas'ul: Abdulaziz (tekshirish) + Ibrat (backend)
## ════════════════════════════════════════════════════════════════

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P3 (KELAJAK, 6+ oy)
# ══════════════════════════════════════════════════════════════

---

## T-116 | P3 | [BACKEND] | Customer loyalty — Points + tiers
- **Sana:** 2026-02-26
- **Vazifa:** Earn points (1 point/1000 UZS). Tiers: Bronze/Silver/Gold. Birthday bonus. Redeem as payment.

## T-119 | P3 | [BACKEND] | Marketplace sync — Uzum/Sello
- **Sana:** 2026-02-26
- **Vazifa:** Catalog sync, stock sync, order import. Omnichannel.

## T-120 | P3 | [BACKEND] | AI forecasting — Seasonal demand prediction
- **Sana:** 2026-02-26
- **Vazifa:** Kosmetika seasonal (sunscreen yoz, moisturizer qish, gift sets 8-Mart).
  O'tgan yil datasi bo'yicha buyurtma tavsiya.

## T-121 | P3 | [BACKEND] | Google Sheets export — Automated daily data
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Kunlik savdo data → linked Google Sheet. Ko'p do'kon egalari Sheets da tahlil qiladi. Scheduled cron.


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
| **14** | **0** | **1** | **7** | **6** |

### Kategoriya bo'yicha

| Kategoriya | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| [BACKEND] | 0 | 0 | 0 | 5 | **5** |
| [FRONTEND] | 0 | 0 | 2 | 0 | **2** |
| [MOBILE] | 0 | 1 | 1 | 0 | **2** |
| [IKKALASI] | 0 | 0 | 0 | 1 | **1** |

### Mas'uliyat taqsimoti

| Dasturchi | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| **Ibrat** (Full-Stack) | 0 | 0 | 3 | 0 | **3** |
| **Abdulaziz** (Mobile) | 0 | 1 | 1 | 0 | **2** |
| **Belgilanmagan** | 0 | 0 | 0 | 6 | **6** |

> Yangilandi: 2026-04-25 — T-350 (P1, login slug), T-351 (P2, DEV button) qo'shildi; B-047, B-048 Done.md ga ko'chirildi

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
  finance/      — Expenses CRUD + P&L + Balance Sheet + Cash Flow
  admin/        — Super admin, metrics, DLQ, IP block, feature flags
  health/       — Live, ready, ping, system health
  realtime/     — WebSocket gateway (Socket.io)
  sync/         — Outbox pattern + conflict resolution (T-302)
  realestate/   — Module shell (empty controller -> T-140)
  loyalty/      — LoyaltyConfig, Account, Transaction
  metrics/      — Prometheus endpoint (MetricsSecretGuard)
  events/       — Domain events, EventEmitter2
  common/       — Cache, cron, guards, pipes, filters, circuit breaker, currency
  support/      — Tickets, messages, status (T-305)

  apps/worker/  — 6 queue workers (fiscal, notification, report, snapshot, export, sync)
  apps/bot/     — Telegram bot (grammY) — commands, cron alerts (5 cron)
```

---

*docs/Tasks.md | RAOS Kosmetika POS | v3.0 | 2026-04-03 (tozalandi)*
