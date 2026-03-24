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


## T-326 | P1 | [BACKEND] | API path conflicts унификация (кроме T-311)

- **Sana:** 2026-03-23
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/`
- **Muammo:** Несколько endpoints дублируются под разными путями — путаница между мобилкой и вебом.
- **Kutilgan:**
  - `/inventory/low-stock` vs `/inventory/stock/low` → один путь, второй deprecated alias
  - `/employees` vs `/users` → унифицировать (один путь + alias)
  - `/debts/*` vs `/nasiya/*` → унифицировать (одна коллекция endpoints)
  - `/system/health` vs `/health` → выбрать один (предпочтительно `/health`)
  - `/analytics/branches/comparison` vs `/analytics/branch-comparison` → унифицировать

---

## T-327 | P1 | [FRONTEND] | Warehouse: Приход товара с накладной (invoice snapshot)

- **Sana:** 2026-03-23
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/src/app/(warehouse)/warehouse/stock-in/`, `apps/api/src/inventory/`
- **Muammo:** Текущий stock-in (T-320) — simplified DTO. Нужна полноценная накладная как неизменяемый snapshot-документ.
- **Kutilgan:**
  - Форма приёма: филиал + поставщик + таблица товаров (штрихкод, кол-во, цена закупки)
  - После сохранения накладная = snapshot (не редактируется — только reversal)
  - `POST /warehouse/invoices` — создать накладную (создаёт stock-in движения)
  - `GET /warehouse/invoices` — список накладных с фильтром по дате/поставщику
  - `GET /warehouse/invoices/:id` — детали накладной
  - Цена закупки → событие Finance модуля (расход) через domain event

---

## T-328 | P1 | [FRONTEND] | Warehouse: Списание (write-off) с причиной

- **Sana:** 2026-03-23
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/src/app/(warehouse)/warehouse/write-off/` (yangi), `apps/api/src/inventory/`
- **Muammo:** Нет страницы и API для списания товара с причиной.
- **Kutilgan:**
  - Страница `/warehouse/write-off` — форма списания
  - Причины: `DAMAGED` (повреждён) / `EXPIRED` (просрочен) / `LOST` (потерян) / `OTHER`
  - `POST /inventory/write-off` — `{ productId, qty, reason, note, warehouseId }`
  - Создаёт stock movement типа `OUT` с reference_type = `WRITE_OFF`
  - История: кто, когда, причина — в stock history

---

## T-329 | P1 | [BACKEND] | HR invite flow: email → invite link → Telegram привязка

- **Sana:** 2026-03-23
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/identity/`, `apps/bot/src/`
- **Muammo:** Owner создаёт сотрудника, но нет автоматической привязки Telegram через invite link.
- **Kutilgan:**
  - `POST /employees` создаёт invite token (UUID, 7 дней TTL)
  - Email сотруднику: `t.me/raos_bot?start=TOKEN`
  - Bot: `/start TOKEN` → ищет invite token в БД → привязывает `telegram_chat_id`
  - После привязки: все уведомления идут в Telegram (birlamchi kanal)
  - `user_invites` jadvali: `{ id, token, user_id, expires_at, used_at }`

---

## T-330 | P1 | [FRONTEND] | POS: 80мм термопринтер ESC/POS интеграция

- **Sana:** 2026-03-23
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/src/app/(admin)/settings/printer/`, `apps/web/src/hooks/pos/`
- **Muammo:** POS должен автоматически печатать чек на 80мм термопринтере после оплаты. Сейчас только browser print.
- **Kutilgan:**
  - `/settings/printer` — выбор порта принтера (USB / сетевой IP:Port)
  - Автопечать после успешной оплаты (не блокирует завершение продажи)
  - ESC/POS команды (библиотека `escpos` или `node-escpos`)
  - Fallback: браузерная печать если принтер недоступен
  - Настройка: логотип магазина, INN/STIR, footer текст

---




# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P2 (O'RTA)
# ══════════════════════════════════════════════════════════════

---

## T-319 | P2 | [FRONTEND] | Warehouse dashboard sahifasi

- **Sana:** 2026-03-23
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/src/app/(warehouse)/warehouse/page.tsx`
- **Muammo:** WAREHOUSE panel uchun asosiy dashboard sahifasi yo'q.
- **Kutilgan:**
  - Bugungi stock holati (stat kartalar)
  - Kam qolgan mahsulotlar ro'yxati
  - Muddati o'tayotgan mahsulotlar
  - So'nggi stock harakatlari (in/out)
  - Transfer kutayotganlar

---

## T-320 | P2 | [BACKEND] | Warehouse API endpoints — ombor uchun maxsus

- **Sana:** 2026-03-23
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/inventory/`, `apps/api/src/sync/`
- **Muammo:** WAREHOUSE roli uchun maxsus API endpointlar kerak (dashboard stats, quick actions).
- **Kutilgan:**
  - `GET /warehouse/dashboard` — stock summary (total products, low stock count, expiry count, today's movements)
  - `GET /warehouse/movements/today` — bugungi harakatlar
  - `POST /warehouse/stock-in` — tezkor qabul qilish (simplified DTO)
  - `POST /warehouse/stock-out` — tezkor chiqarish
  - `GET /warehouse/alerts` — kritik ogohlantirishlar

---

## T-331 | P2 | [FRONTEND] | Web Onboarding для Owner: первый вход в CRM

- **Sana:** 2026-03-23
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/src/app/(admin)/onboarding/` (yangi)
- **Muammo:** Новый Owner после регистрации видит пустую страницу. Нет guided setup.
- **Kutilgan:**
  - Шаги: 1) Создать филиал → 2) Добавить сотрудников → 3) Добавить товары → 4) Готово
  - Прогресс-бар (stepper component)
  - Пропуск любого шага → /dashboard
  - Статус onboarding сохраняется в tenant settings

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

## T-335 | P2 | [BACKEND] | Telegram Bot: команды /stock, /lowstock, /expiry, /debt, /shifts

- **Sana:** 2026-03-23
- **Mas'ul:** Ibrat
- **Fayl:** `apps/bot/src/`
- **Muammo:** Telegram бот имеет базовые команды. Нет команд для проверки склада, долгов и смен.
- **Kutilgan:**
  - `/stock ШТРИХКОД` — остаток товара по штрихкоду (Warehouse, Manager)
  - `/lowstock` — список low stock товаров (Warehouse, Manager)
  - `/expiry` — товары с истекающим сроком ≤ 30 дней (Warehouse, Manager)
  - `/debt ТЕЛЕФОН` — долг клиента по номеру (Cashier, Manager)
  - `/shifts` — активные смены по всем филиалам (Manager, Owner)
  - `/logout` — выход из аккаунта (все роли)
  - Авто-уведомления: low stock каждый час, сроки в 08:00, долги в 09:00

---

## T-336 | P2 | [FRONTEND] | Warehouse: история движений товара (stock history)

- **Sana:** 2026-03-23
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/src/app/(warehouse)/warehouse/history/` (yangi)
- **Muammo:** Нет страницы с подробной историей движений по товарам для warehouse.
- **Kutilgan:**
  - Страница `/warehouse/history` — список всех движений
  - Фильтр: товар / тип (IN/OUT/TRANSFER/WRITE_OFF) / дата / пользователь
  - Колонки: дата, товар, тип, количество (+/-), кто, причина/источник
  - Экспорт в CSV

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
| **36** | **1** | **13** | **10** | **6** |

### Kategoriya bo'yicha

| Kategoriya | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| [BACKEND] | 1 | 11 | 2 | 5 | **19** |
| [FRONTEND] | 0 | 6 | 4 | 0 | **10** |
| [MOBILE] | 0 | 0 | 3 | 0 | **3** |
| [IKKALASI] | 0 | 0 | 0 | 1 | **1** |

### Mas'uliyat taqsimoti

| Dasturchi | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| **Ibrat** (Full-Stack) | 1 | 13 | 3 | 0 | **17** |
| **AbdulazizYormatov** (Team Lead, Frontend) | 0 | 4 | 2 | 0 | **6** |
| **Abdulaziz** (Mobile) | 0 | 0 | 3 | 0 | **3** |
| **Belgilanmagan** | 0 | 0 | 0 | 6 | **6** |

> Yangilangan: 2026-03-23 — Miro доска tahlilidan 16 ta yangi vazifa qo'shildi (T-321…T-336)

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
