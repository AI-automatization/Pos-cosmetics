# RAOS — OCHIQ VAZIFALAR (Kosmetika POS MVP)
# Yangilangan: 2026-04-03
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

_(hozircha yo'q)_

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P1 (MUHIM)
# ══════════════════════════════════════════════════════════════

---

## T-335 | P1 | [FRONTEND] | Warehouse Low-Stock sahifasi yangi mahsulotlarni ko'rsatmaydi

- **Sana:** 2026-04-05
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/src/app/(warehouse)/warehouse/low-stock/page.tsx`
- **Muammo:** `useStockLevels()` movement-based API ishlatadi — stock harakati bo'lmagan (yangi qo'shilgan) mahsulotlar ko'rinmaydi.
- **Kutilgan:** `useProducts()` ga o'tish, client-side `currentStock <= minStockLevel` filter qo'llash.

---

## T-336 | P1 | [FRONTEND] | Warehouse Suppliers — Edit/Delete funksiyasi yo'q

- **Sana:** 2026-04-05
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/src/app/(warehouse)/warehouse/suppliers/page.tsx`
- **Muammo:** Faqat "+ Qo'shish" bor. Mavjud supplierni tahrirlash yoki o'chirish mumkin emas.
- **Kutilgan:** Har supplier kartaga edit (qalam) tugmasi + `SupplierModal supplier={item}` va delete (trash) tugmasi.

---

## T-337 | P1 | [FRONTEND] | Warehouse Inventory — Mahsulot tahrirlash yo'q

- **Sana:** 2026-04-05
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/src/app/(warehouse)/warehouse/inventory/page.tsx`
- **Muammo:** Faqat yangi mahsulot qo'shish bor. Mavjud mahsulotning narxini, minStockLevel ni o'zgartirish mumkin emas.
- **Kutilgan:** Har qatordagi mahsulotga edit tugmasi + `ProductForm product={p} categories={...}` modal.

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P2 (O'RTA)
# ══════════════════════════════════════════════════════════════

---

## T-338 | P2 | [FRONTEND] | Warehouse Nakladnoy — Detail sahifasi yo'q

- **Sana:** 2026-04-05
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/src/app/(warehouse)/warehouse/invoices/[id]/page.tsx` (yangi)
- **Muammo:** Nakladnoylar ro'yxatidan bitta nakladnoyni ochib tafsilotlarini (mahsulotlar, narxlar, supplier) ko'rish mumkin emas.
- **Kutilgan:** `GET /warehouse/invoices/:id` endpointidan ma'lumot olib ko'rsatish.

---

## T-339 | P2 | [BACKEND] | Demo Seed — Low-stock mahsulot qo'shish (POS toast test uchun)

- **Sana:** 2026-04-05
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/prisma/seed.ts`
- **Muammo:** Demo datada barcha mahsulotlar 130-230 dona. Low-stock toast ni ko'rsatish uchun 120+ dona sotish kerak — bu real test emas.
- **Kutilgan:** Seed ga 1 mahsulot: `currentStock=7, minStockLevel=10` — POS da sotib toast ko'rsatish mumkin bo'lsin.

---

## T-340 | P2 | [FRONTEND] | Warehouse Dashboard — Yangi zapros kelganda signal

- **Sana:** 2026-04-05
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/src/app/(warehouse)/warehouse/page.tsx`
- **Muammo:** Yangi kassir zaprosi 30 soniyada ko'rinadi, lekin hech qanday signal yo'q (sound/badge).
- **Kutilgan:** Yangi zapros soni oshganda browser Notification API yoki audio beep.

---

## T-341 | P2 | [FRONTEND] | POS — Chek print / PDF yuklab olish

- **Sana:** 2026-04-05
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/src/app/(pos)/pos/ReceiptPreview.tsx`
- **Muammo:** ReceiptPreview ko'rsatadi, lekin print qilish yoki PDF yuklab olish yo'q.
- **Kutilgan:** "Chop etish" tugmasi (window.print yoki PDF blob).

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
| **16** | **0** | **3** | **7** | **6** |

### Kategoriya bo'yicha

| Kategoriya | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| [BACKEND] | 0 | 0 | 0 | 5 | **5** |
| [FRONTEND] | 0 | 0 | 0 | 0 | **0** |
| [MOBILE] | 0 | 0 | 3 | 0 | **3** |
| [IKKALASI] | 0 | 0 | 0 | 1 | **1** |

### Mas'uliyat taqsimoti

| Dasturchi | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| **Ibrat** (Full-Stack) | 0 | 0 | 0 | 0 | **0** |
| **Abdulaziz** (Mobile) | 0 | 0 | 3 | 0 | **3** |
| **Belgilanmagan** | 0 | 0 | 0 | 6 | **6** |

> Yangilangan: 2026-04-03 — T-337..T-340, T-306..T-310, T-314 bajarildi → Done.md ga ko'chirildi

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
