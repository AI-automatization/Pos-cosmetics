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

## T-379 | P2 | [MOBILE] | mobile-owner: AddEmployeeScreen — backend qo'llamaydigan fieldlarni tozalash

- **Sana:** 2026-04-21
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile-owner/src/screens/Employees/AddEmployeeScreen.tsx`, `employees.api.ts` `CreateEmployeeDto`
- **Muammo:** `CreateEmployeeDto` da `login`, `dateOfBirth`, `passportId`, `address` bor — backend User modelida yo'q, faqat `{ firstName, lastName, email, password, role, phone }` saqlanadi.
- **Vazifa:** `login` field olib tashlash (login = email). Qolgan extra fieldlarni `botSettings` da saqlash uchun backend endpoint kengaytirish yoki formdan olib tashlash.
- **Kutilgan:** DTO backend bilan mos, form faqat real saqlanadigan fieldlarni so'raydi

---

## T-397 | P2 | [MOBILE] | Staff app — Mijozlar (Customers) ekrani yo'q — web da bor

- **Sana:** 2026-04-26
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Customers/` (yaratilishi kerak)
- **Muammo:** Web da `/customers` sahifasi bor: mijozlar ro'yxati, aloqa ma'lumotlari, sotib olish tarixi, loyalty tracking, mijoz detail sahifasi. Mobile staff appda bu ekran umuman yo'q — na tab da, na Ko'proq menusida.
- **Kutilgan:** Mijozlar ekrani — FlatList (ism, telefon, balans), qidiruv, mijoz detail (sotib olish tarixi, nasiya holati), yangi mijoz qo'shish
- **Topildi:** Web vs Mobile solishtirma — 2026-04-26

---

## T-398 | P2 | [MOBILE] | Staff app — Chegirmalar/Aksiyalar (Promotions) ekrani yo'q — web da bor

- **Sana:** 2026-04-26
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Promotions/` (yaratilishi kerak)
- **Muammo:** Web da `/promotions` sahifasi bor: aktiv aksiyalar, chegirma qoidalari, kuponlar boshqaruvi. Mobile staff appda bu ekran umuman yo'q. Kassir chegirmalarni faqat qo'lda kiritishi mumkin — oldindan belgilangan aksiyalar ro'yxati ko'rinmaydi.
- **Kutilgan:** Aksiyalar ekrani — aktiv chegirmalar ro'yxati (foiz/summa, muddat, shart), kupon qo'llash, avtomatik chegirma ko'rsatish savdo paytida
- **Topildi:** Web vs Mobile solishtirma — 2026-04-26

---

## T-399 | P2 | [MOBILE] | Staff app — Hisobotlar (Reports) hub ekrani yo'q — web da 7 ta hisobot bor

- **Sana:** 2026-04-26
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Finance/ReportsHubScreen.tsx` (tayyor lekin routing yo'q)
- **Muammo:** Web da `/reports` bo'limida 7 ta hisobot mavjud: kunlik daromad, top mahsulotlar, smenalar, filiallar, hisobot yaratish, export. Mobile da `ReportsHubScreen.tsx` tayyor lekin faqat Moliya navigator orqali kirilishi kerak (T-395 bilan bog'liq). Alohida Reports tabi yoki Ko'proq menusidan kirish yo'q.
- **Kutilgan:** Hisobotlar hub ekraniga Ko'proq menusidan yoki Moliya tabi orqali kirish imkoni bo'lishi kerak
- **Topildi:** Web vs Mobile solishtirma — 2026-04-26

---

## T-400 | P3 | [MOBILE] | Staff app — Valyuta kurslari (Exchange Rates) ekrani yo'q — web da bor

- **Sana:** 2026-04-26
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Finance/` (qo'shilishi kerak)
- **Muammo:** Web da `/finance/exchange-rates` sahifasi bor: USD/UZS va boshqa kurslar, kurs tarixi, qo'lda kurs kiritish, konvertatsiya. Mobile da bu funksiya yo'q.
- **Kutilgan:** Valyuta kurslari ekrani Moliya bo'limida — joriy kurslar, kurs tarixi
- **Topildi:** Web vs Mobile solishtirma — 2026-04-26

---

## T-402 | P3 | [MOBILE] | Staff app — Ko'proq menusida Foydalanuvchilar disabled — routing ulanmagan

- **Sana:** 2026-04-26
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/MoreMenu/index.tsx`
- **Muammo:** Ko'proq menusida "Foydalanuvchilar" bandi "Tez orada" badge bilan disabled holda. Lekin `screens/Settings/UsersScreen.tsx` (416 qator) allaqachon tayyor va Sozlamalar orqali kirish mumkin. Ko'proq menusidan to'g'ridan-to'g'ri navigatsiya yo'q.
- **Kutilgan:** Ko'proq menusidagi Foydalanuvchilar → UsersScreen ga navigatsiya ishlashi kerak
- **Topildi:** Visual QA + codebase tahlil — 2026-04-26

---

## T-403 | P2 | [MOBILE] | Staff app — Role-based UI: ADMIN roli uchun kengaytirilgan menular

- **Sana:** 2026-04-26
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/navigation/TabNavigator.tsx`, `apps/mobile/src/screens/MoreMenu/index.tsx`
- **Muammo:** Staff app hozir barcha rollar uchun bir xil UI ko'rsatadi. Web da ADMIN roli to'liq boshqaruv imkoniyatiga ega: mahsulot CRUD, inventar, xodimlar, moliya (P&L, xarajatlar), sozlamalar, hisobotlar. Mobile da ADMIN login qilsa ham kassir bilan bir xil cheklangan menyu ko'rinadi.
- **Yechim:** `apps/mobile` da role-based UI — login qilganda user role tekshiriladi, ADMIN rolida qo'shimcha menular va ekranlar ko'rsatiladi:
  - Katalog CRUD (mahsulot qo'shish/tahrirlash — kassirda faqat ko'rish)
  - Xodimlar boshqaruvi (role, PIN, commission)
  - Moliya (P&L, xarajatlar)
  - Hisobotlar (to'liq)
  - Sozlamalar (users, branches, printer, audit log)
- **Kutilgan:** ADMIN login → kengaytirilgan tab/menyular; CASHIER login → hozirgi ko'rinish saqlanadi
- **Topildi:** Web vs Mobile solishtirma — 2026-04-26

---

## T-404 | P2 | [MOBILE] | Staff app — Role-based UI: MANAGER roli uchun o'rta darajali menular

- **Sana:** 2026-04-26
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/navigation/TabNavigator.tsx`, `apps/mobile/src/screens/MoreMenu/index.tsx`
- **Muammo:** Web da MANAGER soddalashtirilgan admin ko'rinishga ega: dashboard, katalog (ko'rish), inventar (ko'rish), sotuvlar, nasiya, xodimlar (ko'rish), hisobotlar. Mobile da Manager login qilsa kassir bilan bir xil ko'rinish — qo'shimcha imkoniyatlar yo'q.
- **Yechim:** MANAGER rolida qo'shimcha ko'rinadigan ekranlar (READ-ONLY):
  - Hisobotlar (ko'rish)
  - Nasiya (ko'rish)
  - Xodimlar (ko'rish, tahrirlamasdan)
  - Inventar kengaytirilgan (low stock, expiry)
- **Kutilgan:** MANAGER login → CASHIER dan ko'proq, ADMIN dan kam menyular ko'rinadi
- **Topildi:** Web vs Mobile solishtirma — 2026-04-26

---

## T-405 | P2 | [MOBILE] | Staff app — Role-based UI: WAREHOUSE roli uchun ombor ekranlari

- **Sana:** 2026-04-26
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/navigation/TabNavigator.tsx`, `apps/mobile/src/screens/MoreMenu/index.tsx`
- **Muammo:** Web da Warehouse xodimi uchun alohida bo'lim (7 ta ekran): stock-in, write-off, stock count, expiry, low stock, movement history, suppliers. Mobile da faqat Kirim va Ombor (2 ta ekran) bor. WAREHOUSE roli login qilganda savdo emas, ombor ekranlari ko'rinishi kerak.
- **Yechim:** WAREHOUSE rolida tab bar va menyular o'zgaradi:
  - Savdo tabi → **Kirim** (stock-in) ga almashadi
  - Katalog tabi → **Inventarizatsiya** (stock count) ga almashadi
  - Ko'proq menusida: Write-Off, Expiry, Movement History, Low Stock, Suppliers
  - Barcode scanner barcha ombor ekranlarida ishlashi kerak
- **Kutilgan:** WAREHOUSE login → ombor-focused UI; savdo/kassa ekranlari yashirinadi
- **Topildi:** Web vs Mobile solishtirma — 2026-04-26

---

## T-406 | P1 | [MOBILE] | Staff app — nasiyaApi.recordPayment URL path mismatch

- **Sana:** 2026-04-28
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/api/nasiya.api.ts:80`
- **Muammo:** `nasiyaApi.recordPayment` `POST /nasiya/debtors/:debtorId/pay` URL ishlatmoqda, lekin backend controller `@Post(':id/pay')` — ya'ni `POST /nasiya/:id/pay`. URL path noto'g'ri, to'lov so'rovi 404 qaytaradi.
- **Kutilgan:** `POST /nasiya/:id/pay` — backend bilan mos bo'lishi kerak
- **Topildi:** Visual QA + kodni tahlil — 2026-04-28

---

## T-407 | P2 | [MOBILE] | Staff app — Finance ekranlar: error va empty state yo'q

- **Sana:** 2026-04-28
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Finance/PnLScreen.tsx`, `PaymentsHistoryScreen.tsx`, `DailyRevenueScreen.tsx`, `TopProductsScreen.tsx`, `ShiftReportsScreen.tsx`, `NasiyaAgingScreen.tsx`
- **Muammo:** Backend unavailable bo'lganda yuqoridagi 6 ta ekran cheksiz loading spinner ko'rsatadi — xato xabari ham, "Qayta urinish" button ham yo'q. Ma'lumot bo'lmasa (empty) ham bo'sh joy qoladi, foydalanuvchi nima qilish kerakligini bilmaydi.
- **Kutilgan:** Har ekranda:
  1. Error state: `isError` true bo'lganda "Ma'lumotlarni yuklashda xatolik" + "Qayta urinish" button
  2. Empty state: data `[]` bo'lganda kontekstli xabar (masalan "Bu davr uchun ma'lumot yo'q")
- **Izoh:** `ExpensesScreen` da bu allaqachon bor — shu patternni qolgan ekranlarga ham qo'llash kerak
- **Topildi:** Visual QA (iOS Simulator) — 2026-04-28

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
| **27** | **3** | **5** | **11** | **8** |

### Kategoriya bo'yicha

| Kategoriya | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| [BACKEND] | 1 | 2 | 3 | 3 | **9** |
| [FRONTEND] | 0 | 1 | 0 | 0 | **1** |
| [MOBILE] | 0 | 2 | 7 | 3 | **12** |
| [SECURITY] | 2 | 1 | 0 | 0 | **3** |
| [IKKALASI] | 0 | 0 | 0 | 1 | **1** |

### Mas'uliyat taqsimoti

| Dasturchi | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| **Ibrat** (Full-Stack) | 3 | 3 | 4 | 0 | **10** |
| **Abdulaziz** (Mobile) | 0 | 2 | 7 | 3 | **12** |
| **Belgilanmagan** | 0 | 0 | 0 | 5 | **5** |

> Yangilandi: 2026-04-26 — T-403..T-405 qo'shildi: Admin Panel, Manager Panel, Warehouse mobile applar yo'q

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
