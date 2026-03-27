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


# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P1 (MUHIM)
# ══════════════════════════════════════════════════════════════

---
























# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P2 (O'RTA)
# ══════════════════════════════════════════════════════════════

---


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
| **9** | **0** | **0** | **3** | **6** |

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
| **AbdulazizYormatov** (Team Lead, Frontend) | 0 | 0 | 0 | 0 | **0** |
| **Abdulaziz** (Mobile) | 0 | 0 | 3 | 0 | **3** |
| **Belgilanmagan** | 0 | 0 | 0 | 6 | **6** |

> Yangilangan: 2026-03-27 — T-314, T-306, T-307, T-308, T-309, T-310 va boshqalar bajarildi. P0/P1 tasklar 0 ga tushdi.

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
