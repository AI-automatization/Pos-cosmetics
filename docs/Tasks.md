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

## T-301 | P0 | [BACKEND] | Biometric auth — POST /auth/biometric/register + verify

- **Sana:** 2026-03-23
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/identity/auth.controller.ts`
- **Muammo:** Mobile-owner biometric login (fingerprint/face) ishlatadi. Backend da bu endpointlar yo'q. T-225 da spec bor edi lekin hali implement qilinmagan.
- **Kutilgan:**
  - `POST /auth/biometric/register` — { publicKey, deviceId } -> biometricToken
  - `POST /auth/biometric/verify` — { biometricToken, deviceId } -> access_token + refresh_token
  - `user_biometric_keys` jadvali: (userId, publicKey, deviceId, createdAt)
  - Biometric token 30 kunlik, har verify da yangilanadi

---

## T-302 | P0 | [BACKEND] | Offline sync engine — Outbox pattern to'liq implementatsiya

- **Sana:** 2026-03-23
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/sync/`
- **Muammo:** `sync.service.ts` mavjud lekin minimal. POS uchun to'liq Outbox pattern kerak: idempotency keys, sequence numbers, conflict resolution (financial = event-sourcing, non-financial = last-write-wins), batch processing.
- **Kutilgan:**
  - POST /sync/inbound — POS dan batch data qabul qilish (100 events/request)
  - GET /sync/outbound?since=timestamp — server o'zgarishlarni berish
  - Idempotency check: duplicate event reject (409)
  - Financial data: event-sourcing, HECH QACHON last-write-wins
  - Non-financial: last-write-wins + timestamp

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P1 (MUHIM)
# ══════════════════════════════════════════════════════════════

---

## T-303 | P1 | [BACKEND] | PDF export — pdfmake/exceljs buxgalter hisobotlari uchun

- **Sana:** 2026-03-23
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/reports/`
- **Muammo:** Buxgalter uchun professional PDF hisobotlar eksport qilish imkoniyati yo'q. CSV/Excel bor (T-087), lekin PDF formatda rasmiy hisobotlar kerak.
- **Kutilgan:**
  - GET /reports/export/pdf/:reportType — daily-revenue, pnl, z-report, tax-report
  - `pdfmake` yoki `@react-pdf/renderer` kutubxonasi
  - Shablon: do'kon logosi, INN/STIR, jadvallar, jami

---

## T-304 | P1 | [BACKEND] | Fiscal integration — O'zbekiston real fiskal operator

- **Sana:** 2026-03-23
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/tax/fiscal-adapter.service.ts`
- **Muammo:** Hozir faqat placeholder/stub mavjud (T-081). Real fiskal operator (REGOS yoki boshqa) ulanmagan. Soliq idorasiga chek yuborilmaydi.
- **Kutilgan:**
  - Real fiskal operator API adapter (REGOS yoki O'z DYQ talab qilgan operator)
  - Receipt yuborish -> fiscal_id + QR code olish
  - Queue orqali: savdo -> fiscal queue -> retry (3x, exponential)
  - Z-report fiskal operatorga yuborish

---

## T-305 | P1 | [BACKEND] | Support CRM — tiket-sistema mijozlar uchun

- **Sana:** 2026-03-23
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/support/` (yangi modul)
- **Muammo:** Mijozlar (tenant egalari) texnik muammo yoki savol bilan murojaat qilish tizimi yo'q.
- **Kutilgan:**
  - `support_tickets` jadvali: id, tenant_id, user_id, subject, description, status (OPEN/IN_PROGRESS/RESOLVED/CLOSED), priority, created_at
  - `ticket_messages` jadvali: id, ticket_id, sender_type (USER/SUPPORT), message, created_at
  - CRUD: POST /support/tickets, GET /support/tickets, GET /support/tickets/:id
  - Admin: GET /admin/support/tickets — barcha tenantlardan

---

## T-306 | P1 | [FRONTEND] | Promotions UI — Backend bor, UI yo'q

- **Sana:** 2026-03-23
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/app/(admin)/promotions/page.tsx` (yangi)
- **Muammo:** Promotions engine backend da tayyor (T-099): PERCENT/FIXED/BUY_X_GET_Y/BUNDLE. Lekin admin panelda aksiyalar boshqarish UI yo'q.
- **Kutilgan:**
  - Aksiyalar ro'yxati (DataTable: nomi, turi, holati, muddati)
  - Aksiya yaratish/tahrirlash formi (type tanlash, rules JSON, valid_from/to)
  - Active/inactive toggle
  - Sidebar ga "Aksiyalar" link

---

## T-307 | P1 | [FRONTEND] | Bundles UI — Backend bor, UI to'liq emas

- **Sana:** 2026-03-23
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/app/(admin)/catalog/products/`
- **Muammo:** BundleSection komponent yaratilgan (T-245), lekin to'plam narxi avtomatik hisoblanishi, POS da to'plam tanlash va maxsus chegirma qo'llash UI kerak.
- **Kutilgan:**
  - POS da bundle mahsulot tanlaganda komponentlar ko'rsatish
  - Bundle narx = komponentlar narxi - chegirma (avtomatik hisob)

---

## T-308 | P1 | [FRONTEND] | Real-time updates UI — WebSocket/SSE integratsiya

- **Sana:** 2026-03-23
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/hooks/realtime/`
- **Muammo:** Backend da `realtime.gateway.ts` (Socket.io) mavjud. Lekin frontend da WebSocket ulanish va real-time data yangilanishi yo'q.
- **Kutilgan:**
  - useRealtimeEvents hook (Socket.io client)
  - Dashboard: yangi savdo real-time ko'rsatish
  - Notifications: real-time push
  - Shift status: real-time yangilanish

---

## T-309 | P1 | [FRONTEND] | ExchangeRate UI — valyuta kursi ko'rsatish

- **Sana:** 2026-03-23
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/app/(admin)/finance/` yoki dashboard
- **Muammo:** Backend da CBU exchange rate service bor (T-082/T-105). Lekin admin panelda valyuta kursi ko'rsatilmaydi.
- **Kutilgan:**
  - Dashboard yoki header da bugungi USD/UZS kursi
  - Kurs tarixi grafik (line chart)
  - Product import narxi USD -> UZS avtomatik konvert ko'rsatish

---

## T-311 | P1 | [BACKEND] | /alerts vs /notifications — path unifikatsiyasi

- **Sana:** 2026-03-23
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/notifications/alerts.controller.ts`, `notifications.controller.ts`
- **Muammo:** Ikkita controller bir xil ma'lumotni beradi: `/alerts` (mobile uchun) va `/notifications` (web uchun). Path va format konflikt bor.
- **Kutilgan:**
  - Bitta yagona path tanlash (masalan `/notifications` asosiy, `/alerts` deprecated alias)
  - Yoki router middleware bilan birlashtirish
  - Mobile va web bir xil format olishi kerak


## T-312 | P1 | [BACKEND] | IP Manager — Redis integratsiya tezkor bloklash

- **Sana:** 2026-03-23
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/common/guards/`
- **Muammo:** IP bloklash hozir DB orqali. Redis integratsiya qilsa — tezkor bloklash va DDoS himoya yaxshilanadi.
- **Kutilgan:**
  - Redis set: blocked IPs (TTL bilan)
  - Middleware: har request da Redis dan IP tekshirish (O(1))
  - Admin API: POST /admin/ip-block, DELETE /admin/ip-unblock
  - Auto-block: 100+ failed login 1 soatda -> 24h block

---

## T-313 | P1 | [BACKEND] | Feature Flags — Redis orqali, deploy siz qo'llash

- **Sana:** 2026-03-23
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/common/feature-flags/` (yangi)
- **Muammo:** Feature flags hozir yo'q. Yangi funksiyalarni tenant bo'yicha gradual rollout qilish imkoniyati kerak.
- **Kutilgan:**
  - `feature_flags` jadvali + Redis cache
  - GET /admin/feature-flags — ro'yxat
  - PATCH /admin/feature-flags/:key — enable/disable per tenant
  - @FeatureFlag('loyalty') decorator — endpoint yoki service da ishlatish
  - Redis cache: 1 min TTL, deploy kerak emas

---

## T-315 | P1 | [BACKEND] | Accountant moliyaviy modul — to'liq implementatsiya

- **Sana:** 2026-03-23
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/finance/`
- **Muammo:** Finance moduli hozir faqat expenses CRUD bor. Buxgalter uchun to'liq moliyaviy hisobotlar kerak: balans, P&L, cash flow.
- **Kutilgan:**
  - GET /finance/balance-sheet — aktiv/passiv/kapital
  - GET /finance/cash-flow — kirim/chiqim oqimi
  - GET /finance/pnl — daromad - xarajat = foyda (davriy)
  - Ledger entries dan avtomatik hisoblash
  - 1C export format (T-118 bilan bog'liq)

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P2 (O'RTA)
# ══════════════════════════════════════════════════════════════

---

## T-310 | P2 | [FRONTEND] | POS tablet layout — iPad/Android tablet uchun adaptiv

- **Sana:** 2026-03-23
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/app/(pos)/pos/`
- **Muammo:** POS sahifasi faqat desktop uchun mo'ljallangan (3-column layout). Tablet da foydalanish qiyin.
- **Kutilgan:**
  - iPad (1024x768) va Android tablet (800x1280) uchun responsive layout
  - Touch-friendly UI elementlari (kattaroq tugmalar, swipe gesturelar)
  - Portrait/landscape mode qo'llab-quvvatlash

---

## T-314 | P2 | [FRONTEND] | Subscription upgrade/downgrade UI — owner uchun

- **Sana:** 2026-03-23
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/app/(admin)/settings/subscription/page.tsx` (yangi)
- **Muammo:** Billing backend tayyor (T-108). Lekin owner admin panelda o'z obunasini ko'rish, upgrade/downgrade qilish UI yo'q.
- **Kutilgan:**
  - Hozirgi plan ko'rsatish (limits, usage bar charts)
  - Planlar taqqoslash jadvali (Free/Basic/Pro/Enterprise)
  - Upgrade/downgrade tugmasi -> Payme/Click to'lov
  - Billing tarixi

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
| **21** | **2** | **11** | **2** | **6** |

### Kategoriya bo'yicha

| Kategoriya | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| [BACKEND] | 2 | 7 | 0 | 5 | **14** |
| [FRONTEND] | 0 | 4 | 2 | 0 | **6** |
| [IKKALASI] | 0 | 0 | 0 | 1 | **1** |

### Mas'uliyat taqsimoti

| Dasturchi | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| **Ibrat** (Full-Stack) | 2 | 7 | 0 | 0 | **9** |
| **AbdulazizYormatov** (Team Lead, Frontend) | 0 | 4 | 2 | 0 | **6** |
| **Belgilanmagan** | 0 | 0 | 0 | 6 | **6** |

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
