# RAOS — OCHIQ VAZIFALAR (Kosmetika POS MVP)
# Yangilangan: 2026-05-08 (statistika qayta hisoblandi — T-447..T-457 va boshqalar Done.md ga o'tdi)
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

*(T-387, T-388, T-389 — Done.md ga ko'chirildi 2026-04-25)*

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P1 (MUHIM)
# ══════════════════════════════════════════════════════════════

---

*(T-390 — Done.md ga ko'chirildi 2026-04-25)*

---

*(T-391 — Done.md ga ko'chirildi 2026-04-25)*

---

*(T-392 — Done.md ga ko'chirildi 2026-05-01)*

---

*(T-393 — Done.md ga ko'chirildi 2026-05-01)*

---

*(T-396 — Done.md ga ko'chirildi 2026-05-01)*

---

## T-399 | P1 | [IKKALASI] | Global i18n — 3 til (uz/ru/en) + auto-translate ma'lumotlar

- **Sana:** 2026-05-02
- **Mas'ul:** Ibrat
- **Scope:** Owner/Admin panel, POS (Cashier), Warehouse, Manager, Super Admin
- **Muammo:** POS UI ~70-80% hardcoded Uzbek. Admin panel ham hardcoded. Foydalanuvchi Ruscha yozsa product nomi ham 3 tilga auto-translate bo'lishi kerak.
- **Infrastructure:** `apps/web/src/i18n/` mavjud (uz.json, ru.json, en.json) lekin to'liq qo'llanilmagan
- **3 Faza:**
  - **Faza 1** — UI Labels: hardcoded stringlar → `t('key')` (POS + Admin)
  - **Faza 2** — Schema: `Product/Category/Unit` ga `name_uz, name_ru, name_en` qo'shish + migration
  - **Faza 3** — Auto-translate service: `apps/api/src/common/translate/translate.service.ts` (Google Translate API yoki LibreTranslate)
- **Kutilgan:** Til tanlanganda butun UI o'zgaradi; product yaratishda auto 3-til tarjima

---

*(T-384 — Done.md ga ko'chirildi 2026-05-02)*

---

*(T-392 — Done.md ga ko'chirildi 2026-05-02)*

---

*(T-384 — Done.md ga ko'chirildi 2026-05-02)*

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P2 (O'RTA, MVP dan keyin)
# ══════════════════════════════════════════════════════════════

---

*(T-394 — Done.md ga ko'chirildi 2026-05-02)*

---

*(T-395 — Done.md ga ko'chirildi 2026-05-02)*

---

*(T-397 — Done.md ga ko'chirildi 2026-05-02)*

---


*(T-398 — Done.md ga ko'chirildi 2026-05-02)*

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

---











## T-419 | P2 | [BACKEND] | Ko'chmas mulk — POST /real-estate/properties endpoint yo'q

- **Sana:** 2026-04-29
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/realestate/realestate.controller.ts`
- **Muammo:** Backend da faqat GET endpointlar bor. `POST /real-estate/properties` yo'q — yangi mulk yaratib bo'lmaydi.
- **Kutilgan:** `POST /real-estate/properties` — name, address, type, rentAmount, area?, roi? fieldlar bilan
- **Bog'liq:** T-418 (mobile AddPropertyScreen) — backend tayyor bo'lgach faollashtiriladi

---

## ════════════════════════════════════════════════════════════════
## 🔴 MOBILE-OWNER API CONTRACT (T-221..T-226) — 2026-03-14
## apps/mobile-owner/src/config/endpoints.ts bilan TO'LIQ MOS KELISHI SHART
## Mas'ul: Abdulaziz (tekshirish) + Ibrat (backend)
## ════════════════════════════════════════════════════════════════

---

*(T-449 — Done.md ga ko'chirildi 2026-05-06)*

---

*(T-450 — Done.md ga ko'chirildi 2026-05-06)*

---

*(T-452 — Done.md ga ko'chirildi 2026-05-06)*

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P3 (KELAJAK, 6+ oy)
# ══════════════════════════════════════════════════════════════

---

*(T-447 — Done.md ga ko'chirildi 2026-05-06)*

---

*(T-448 — Done.md ga ko'chirildi 2026-05-06)*

---

*(T-451 — Done.md ga ko'chirildi 2026-05-06)*

---

*(T-453 — Done.md ga ko'chirildi 2026-05-07)*

---

---


---


---


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

---

---


---

---

---

---

---

---

---

---

# ══════════════════════════════════════════════════════════════
# STATISTIKA
# ══════════════════════════════════════════════════════════════

---

| Umumiy ochiq | P0 | P1 | P2 | P3 |
|--------------|----|----|----|----|
| **12** | **0** | **2** | **5** | **5** |

### Kategoriya bo'yicha

| Kategoriya | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| [BACKEND] | 0 | 0 | 4 | 4 | **8** |
| [BACKEND+FRONTEND] | 0 | 0 | 1 | 0 | **1** |
| [IKKALASI] | 0 | 2 | 0 | 1 | **3** |

### Mas'uliyat taqsimoti

| Dasturchi | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| **Ibrat** (Full-Stack) | 0 | 1 | 5 | 4 | **10** |
| **Ibrat + Abdulaziz** | 0 | 1 | 0 | 0 | **1** |
| **Belgilanmagan** | 0 | 0 | 0 | 1 | **1** |

> Yangilandi: 2026-05-08 — T-447..T-457 va boshqalar Done.md ga o'tdi; [MOBILE] P2/P3 tasklar bajarildi

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


---

## T-458 | P1 | [BACKEND] | Audit jurnali — auditService.log() hech qayerda chaqirilmaydi, jadval bo'sh

- **Sana:** 2026-05-09
- **Mas'ul:** Ibrat (backend)
- **Fayl:** apps/api/src/audit/audit.service.ts, apps/api/src/identity/identity.service.ts, apps/api/src/sales/sales.service.ts, apps/api/src/catalog/catalog.service.ts, prisma/seed.ts
- **Muammo:** `AuditService.log()` metodi yozilgan va eksport qilingan, lekin hech qayerda chaqirilmaydi. Faqat bir joy: `AdminAuthService.impersonateTenant()` to'g'ridan-to'g'ri Prisma orqali yozadi. Natija: `audit_log` jadvali to'liq bo'sh — mobile Audit jurnali ekrani har doim "Yozuv topilmadi" ko'rsatadi.
- **Kutilgan:** Kamida quyidagi operatsiyalar audit log yozishi kerak:
  - `identity.service.ts` — login, user yaratish/o'chirish, rol o'zgartirish
  - `sales.service.ts` — order yaratish, return
  - `catalog.service.ts` — mahsulot yaratish/o'chirish/tahrirlash
  - `prisma/seed.ts` — demo uchun kamida 20-30 ta audit log record
- **Topildi:** Mobile Audit jurnali ekrani bo'sh — 2026-05-09

---

## T-459 | P1 | [BACKEND] | Order yaratishda shiftId auto-assign — shift statistikasi 0 ko'rsatadi

- **Sana:** 2026-05-09
- **Mas'ul:** Ibrat (backend)
- **Fayl:** apps/api/src/sales/order.service.ts
- **Muammo:** `createOrder()` da `shiftId` faqat DTO dan olinadi (`dto.shiftId`). Agar mobile `shiftId` yubormasa (app crash, store yo'qolishi), order `shiftId: null` bilan yaratiladi. Natija: `getShiftById()` da shift statistikasi (totalRevenue, totalOrders, avgOrderValue, totalRefunds, totalDiscounts) 0 ko'rsatadi chunki orderlar shift ga bog'lanmagan.
- **Kutilgan:** `order.service.ts` → `createOrder()` da fallback qo'shish:
  ```typescript
  let resolvedShiftId = dto.shiftId;
  if (!resolvedShiftId) {
    const currentShift = await tx.shift.findFirst({
      where: { tenantId, userId, status: 'OPEN' },
      select: { id: true },
    });
    resolvedShiftId = currentShift?.id;
  }
  ```
  Shunda `shiftId` yuborilmagan bo'lsa ham, foydalanuvchining ochiq smenasi avtomatik topiladi.
- **Mobile fix:** `apps/mobile/src/screens/Savdo/index.tsx` da `shiftId` bo'lmasa order yaratish bloklandi (Alert ko'rsatiladi). Lekin backend fallback ham kerak xavfsizlik uchun.
- **Topildi:** ShiftsOwner detail ekrani barcha statistikalar 0 — 2026-05-09

---

## T-460 | P2 | [MOBILE] | Analytics — ABC tahlil ekrani (mobile)

- **Sana:** 2026-05-09
- **Mas'ul:** Abdulaziz
- **Fayl:** apps/mobile/src/screens/Analytics/ (yangi)
- **Backend:** `GET /analytics/abc` — tayyor (T-089 da bajarilgan, `ai.controller.ts`)
- **Muammo:** Web da `/analytics` sahifasida ABC tahlil tabi bor (donut chart + A/B/C guruhlash + mahsulot ro'yxati). Mobile da bu funksiya yo'q.
- **Kutilgan:** Mobile da ABC tahlil ekrani:
  - Donut/Pie chart (A/B/C guruhlar bo'yicha revenue ulushi)
  - A guruh (80% revenue), B guruh (15%), C guruh (5%) — kartochkalar
  - Har guruh ichida mahsulotlar ro'yxati (nomi, sotilgan soni, revenue)
  - Branch filter (agar owner)
- **API:** `analyticsApi.getAbcAnalysis(branchId?)` qo'shish kerak

---

## T-461 | P2 | [MOBILE] | Analytics — Marja tahlili ekrani (mobile)

- **Sana:** 2026-05-09
- **Mas'ul:** Abdulaziz
- **Fayl:** apps/mobile/src/screens/Analytics/ (yangi)
- **Backend:** `GET /analytics/margins` — tayyor (T-089 da bajarilgan)
- **Muammo:** Web da marja tahlili tabi bor (top-10 margin % bar chart + jadval: revenue, COGS, gross profit, margin%). Mobile da yo'q.
- **Kutilgan:** Mobile da Marja ekrani:
  - Top-10 mahsulot margin % horizontal bar chart
  - Jadval: mahsulot nomi, sotish narxi, tannarx, foyda, margin%
  - Sortlash: margin% bo'yicha (yuqoridan pastga)
  - Branch filter

---

## T-462 | P2 | [MOBILE] | Analytics — Kassir performance ekrani (mobile)

- **Sana:** 2026-05-09
- **Mas'ul:** Abdulaziz
- **Fayl:** apps/mobile/src/screens/Analytics/ (yangi)
- **Backend:** `GET /analytics/cashier-performance` — tayyor (T-089 da bajarilgan)
- **Muammo:** Web da kassir performance tabi bor (bar chart + reytingli ro'yxat: buyurtmalar soni, revenue, o'rtacha chek, qaytarishlar). Mobile da yo'q.
- **Kutilgan:** Mobile da Kassir performance ekrani:
  - Kassirlar reytingi (ranked list)
  - Har kassir uchun: buyurtmalar soni, jami revenue, o'rtacha chek, qaytarishlar soni
  - Bar chart (top 5-10 kassir bo'yicha revenue)
  - Davr filtri: bugun / hafta / oy

---

## T-463 | P2 | [MOBILE] | Analytics — Dead stock (harakatsiz mahsulotlar) ekrani (mobile)

- **Sana:** 2026-05-09
- **Mas'ul:** Abdulaziz
- **Fayl:** apps/mobile/src/screens/Analytics/ (yangi)
- **Backend:** `GET /analytics/dead-stock` — tayyor (T-089 da bajarilgan)
- **Muammo:** Web da dead stock tabi bor (90+ kun sotilmagan mahsulotlar, carrying cost, idle kunlar soni). Mobile da yo'q.
- **Kutilgan:** Mobile da Dead stock ekrani:
  - 90+ kun sotilmagan mahsulotlar ro'yxati
  - Har mahsulot uchun: oxirgi sotilgan sana, idle kunlar soni, joriy stock qiymati
  - Umumiy "yotgan kapital" summasi (carrying cost)
  - Sortlash: idle kunlar / stock qiymati bo'yicha

---

## T-464 | P2 | [MOBILE] | Settings — Foydalanuvchi parolini tiklash (mobile)

- **Sana:** 2026-05-09
- **Mas'ul:** Abdulaziz
- **Fayl:** apps/mobile/src/screens/Settings/UsersScreen.tsx (kengaytirish)
- **Backend:** `PATCH /users/:id/reset-password` — tayyor (T-135 da bajarilgan)
- **Muammo:** Web da owner/admin boshqa foydalanuvchi parolini tiklashi mumkin (reset password modal). Mobile da UsersScreen faqat ro'yxatni ko'rsatadi, parol tiklash yo'q.
- **Kutilgan:** UsersScreen da har foydalanuvchi uchun "Parol tiklash" tugmasi:
  - Bottom sheet: yangi parol kiritish (min 6 belgi)
  - Show/hide toggle
  - Confirm tugmasi → `PATCH /users/:id/reset-password`
  - Faqat OWNER va ADMIN roli ko'radi
  - O'z parolini tiklash taqiqlangan

---

## T-465 | P2 | [MOBILE] | Ombor — Restock request (kassirdan so'rov) ekrani (mobile)

- **Sana:** 2026-05-09
- **Mas'ul:** Abdulaziz
- **Fayl:** apps/mobile/src/screens/Ombor/ (yangi) yoki apps/mobile/src/screens/Kirim/ (kengaytirish)
- **Backend:** Restock request API — tayyor (T-427 da bajarilgan)
- **Muammo:** Web warehouse dashboard da "Restock requests" bo'limi bor (kassir kam qolgan mahsulot uchun so'rov yuboradi, ombor xodimi real-time ko'radi + beep sound). Mobile da bu funksiya yo'q.
- **Kutilgan:** Ikki tomonlama:
  - **Kassir tomoni:** Kam qolgan mahsulot kartochkasida "So'rov yuborish" tugmasi → restock request yaratish
  - **Ombor tomoni:** Kirim yoki Ombor ekranida "So'rovlar" tabi/badge — yangi so'rovlarni ko'rish, "Qabul qildim" deb belgilash
  - Push notification: yangi so'rov kelganda ombor xodimiga bildirishnoma

---

## T-466 | P2 | [MOBILE] | StockTransferScreen — tanlangan mahsulot sheet ga uzatilmaydi (UX bug)

- **Sana:** 2026-05-09
- **Mas'ul:** Abdulaziz
- **Fayl:** apps/mobile/src/screens/StockTransfer/index.tsx
- **Muammo:** Mahsulot kartochkasiga bosganda `onSelect={() => setSheet(true)}` chaqiriladi, lekin tanlangan mahsulot `NewTransferSheet` ga uzatilmaydi. Sheet har doim bo'sh ochiladi — foydalanuvchi mahsulotni qayta qidirishi kerak.
- **Kutilgan:** `selectedItem` state qo'shish, `onSelect` da set qilish, `NewTransferSheet` ga `selectedItem` prop sifatida uzatish. Sheet ochilganda mahsulot oldindan tanlangan bo'lishi kerak.

---

## T-467 | P2 | [MOBILE] | StockMovementsScreen — pagination yo'q, faqat 50 ta record ko'rinadi

- **Sana:** 2026-05-09
- **Mas'ul:** Abdulaziz
- **Fayl:** apps/mobile/src/screens/StockMovements/index.tsx
- **Muammo:** `GET /inventory/movements?page=1&limit=50` faqat birinchi sahifani yuklaydi. Load more yoki infinite scroll yo'q. Yuqori hajmli do'konlarda eski harakatlar ko'rinmaydi.
- **Kutilgan:** `FlatList` da `onEndReached` + `onEndReachedThreshold` bilan infinite scroll qo'shish. `page` state ni oshirib keyingi sahifani yuklash, `items` ga append qilish.

---

## T-468 | P2 | [MOBILE] | InvoicesScreen — search, filter va Cancel tugmasi yo'q

- **Sana:** 2026-05-09
- **Mas'ul:** Abdulaziz
- **Fayl:** apps/mobile/src/screens/Ombor/InvoicesScreen.tsx, apps/mobile/src/screens/Ombor/InvoiceDetailSheet.tsx
- **Muammo:** 3 ta kamchilik:
  1. Search yo'q — invoice raqami yoki yetkazuvchi nomi bo'yicha qidirish imkoni yo'q
  2. Filter yo'q — sana bo'yicha filtrlash mumkin emas (API `from`/`to` qo'llab-quvvatlaydi)
  3. InvoiceDetailSheet da faqat "Qabul qilish" (Approve) tugmasi bor, "Bekor qilish" (Cancel/Reject) tugmasi yo'q (KirimScreen da ikkisi ham bor)
- **Kutilgan:**
  - Search bar qo'shish (client-side filter: invoice number, supplier name)
  - Status filter tabs: ALL / PENDING / RECEIVED / CANCELLED
  - InvoiceDetailSheet ga "Bekor qilish" tugmasi qo'shish (`PATCH /warehouse/invoices/:id/reject`)

---

## T-469 | P3 | [MOBILE] | LowStockList — rol guard va search yo'q

- **Sana:** 2026-05-09
- **Mas'ul:** Abdulaziz
- **Fayl:** apps/mobile/src/screens/Inventory/LowStockList.tsx
- **Muammo:** 2 ta kamchilik:
  1. Rol guard yo'q — CASHIER va VIEWER ham kirishi mumkin (boshqa ombor ekranlarida Manager+ guard bor)
  2. Search yo'q — mahsulot nomi bo'yicha qidirish imkoni yo'q
- **Kutilgan:**
  - Rol guard qo'shish: faqat OWNER, ADMIN, MANAGER, WAREHOUSE roli kirishi mumkin
  - Search bar qo'shish (client-side: product name filter)

---

## T-470 | P3 | [MOBILE] | StockOutScreen — WAREHOUSE roli kirolmaydi

- **Sana:** 2026-05-09
- **Mas'ul:** Abdulaziz
- **Fayl:** apps/mobile/src/screens/StockOut/index.tsx
- **Muammo:** `ALLOWED_ROLES` ga `WAREHOUSE` kiritilmagan — ombor xodimi hisobdan chiqarish (write-off) qilolmaydi. Lock screen ko'rsatiladi: "Kerakli rol: Manager, Admin, Owner". Lekin amalda ombor xodimi shikastlangan/muddati o'tgan mahsulotlarni chiqarishi kerak.
- **Kutilgan:** `ALLOWED_ROLES` ga `'WAREHOUSE'` qo'shish. Yoki alohida ruxsat tizimi (masalan, WAREHOUSE faqat o'z omboridagi mahsulotlarni chiqarishi mumkin).

---

## T-423 | P1 | [IKKALASI] | PaymentsHistoryScreen — Backend `/sales/orders` `from`/`to` sana filtrini qabul qilmaydi

- **Sana:** 2026-05-05
- **Mas'ul:** Ibrat (backend fix) + Abdulaziz (mobile)
- **Fayl:** apps/mobile/src/screens/Finance/PaymentsHistoryScreen.tsx, apps/api/src/sales/sales.controller.ts, apps/api/src/sales/sales.service.ts
- **Muammo:** `PaymentsHistoryScreen` `salesApi.getOrders({ from, to, limit: 200 })` chaqiradi. Lekin backend `GET /sales/orders` controlleri faqat `page`, `limit`, `shiftId` parametrlarini qabul qiladi; `from` va `to` parametrlari yo'q. `sales.service.ts` `getOrders()` ham `where` shartida sana filtri yo'q. Natija: davr filtri tugmalari (bugun/7 kun/30 kun/90 kun) hech qanday ta'sir qilmaydi — har doim barcha orderlar qaytariladi.
- **Kutilgan:** Backend `from` va `to` query parametrlarini qabul qilib, `order.createdAt` bo'yicha filtrlashi kerak.
- **Topildi:** Manual Code Review — 2026-05-05

---

