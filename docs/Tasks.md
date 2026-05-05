# RAOS — OCHIQ VAZIFALAR (Kosmetika POS MVP)
# Yangilangan: 2026-05-05 (T-433..T-446 qo'shildi — web/mobile parity gap tasklar)
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

---

---


---

---

---

---

---

## T-445 | P3 | [MOBILE] | Billing/Obuna boshqaruvi — mobileda yo'q

- **Sana:** 2026-05-05
- **Mas'ul:** Abdulaziz
- **Rol:** OWNER (faqat)
- **Fayl:** `apps/mobile/src/screens/Settings/` (kengaytirish)
- **Muammo:** Web da `/settings/billing` orqali OWNER obuna holatini ko'ra oladi. Mobileda `Ko'proq → Settings` da billing bo'limi yo'q.
- **Kutilgan:** Settings da obuna holati, joriy plan, muddati. `GET /billing/subscription` API.
- **Bog'liq:** Web: `apps/web/src/app/(admin)/settings/billing/`, T-380

---

## T-446 | P3 | [MOBILE] | Task boshqaruvi — mobileda yo'q

- **Sana:** 2026-05-05
- **Mas'ul:** Abdulaziz
- **Rol:** OWNER, ADMIN, MANAGER
- **Fayl:** `apps/mobile/src/screens/` (yangi screen)
- **Muammo:** Web da `/tasks` orqali ichki vazifalar yaratish va kuzatish mumkin. Mobileda yo'q.
- **Kutilgan:** `Ko'proq` menyusida "Vazifalar" — CRUD, status, mas'ul belgilash.
- **Bog'liq:** Web: `apps/web/src/app/(admin)/tasks/`

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
| **17** | **3** | **4** | **7** | **6** |

### Kategoriya bo'yicha

| Kategoriya | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| [BACKEND] | 1 | 2 | 5 | 4 | **12** |
| [FRONTEND] | 0 | 1 | 0 | 0 | **1** |
| [MOBILE] | 0 | 0 | 2 | 4 | **6** |
| [SECURITY] | 2 | 1 | 0 | 0 | **3** |
| [IKKALASI] | 0 | 1 | 0 | 1 | **2** |
| [BACKEND+FRONTEND] | 0 | 0 | 1 | 0 | **1** |

### Mas'uliyat taqsimoti

| Dasturchi | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| **Ibrat** (Full-Stack) | 3 | 3 | 5 | 0 | **11** |
| **Abdulaziz** (Mobile) | 0 | 0 | 2 | 4 | **6** |
| **Belgilanmagan** | 0 | 0 | 0 | 2 | **2** |
| **Ibrat + Abdulaziz** | 0 | 1 | 0 | 0 | **1** |

> Yangilandi: 2026-05-05 — T-420..T-422, T-425..T-429, T-432..T-436, T-441 Done.md ga ko'chirildi

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

---

## T-423 | P1 | [IKKALASI] | PaymentsHistoryScreen — Backend `/sales/orders` `from`/`to` sana filtrini qabul qilmaydi

- **Sana:** 2026-05-05
- **Mas'ul:** Ibrat (backend fix) + Abdulaziz (mobile)
- **Fayl:** apps/mobile/src/screens/Finance/PaymentsHistoryScreen.tsx, apps/api/src/sales/sales.controller.ts, apps/api/src/sales/sales.service.ts
- **Muammo:** `PaymentsHistoryScreen` `salesApi.getOrders({ from, to, limit: 200 })` chaqiradi. Lekin backend `GET /sales/orders` controlleri faqat `page`, `limit`, `shiftId` parametrlarini qabul qiladi; `from` va `to` parametrlari yo'q. `sales.service.ts` `getOrders()` ham `where` shartida sana filtri yo'q. Natija: davr filtri tugmalari (bugun/7 kun/30 kun/90 kun) hech qanday ta'sir qilmaydi — har doim barcha orderlar qaytariladi.
- **Kutilgan:** Backend `from` va `to` query parametrlarini qabul qilib, `order.createdAt` bo'yicha filtrlashi kerak.
- **Topildi:** Manual Code Review — 2026-05-05

---

## T-424 | P2 | [MOBILE] | PaymentsHistoryScreen — To'lov usuli filtri (Naqd/Karta/Nasiya/Click/Payme) ishlamaydi

- **Sana:** 2026-05-05
- **Mas'ul:** Abdulaziz
- **Fayl:** apps/mobile/src/screens/Finance/PaymentsHistoryScreen.tsx
- **Muammo:** Ekranda 6 ta to'lov usuli filtri ko'rsatiladi (Barchasi, Naqd, Karta, Nasiya, Click, Payme). Tugmalar bosiladi va `method` state o'zgaradi, lekin `filtered` massivni hisoblashda bu filtr hech qachon qo'llanilmaydi — kodda `// method filter — placeholder: Order type has no paymentMethod field yet` deb izohlangan (175-177 qatorlar). Natija: barcha to'lov usuli tugmalari dekorativ, funksionalligi yo'q.
- **Kutilgan:** T-423 fix bo'lgandan so'ng `order.paymentMethod` bo'yicha filtr qo'llanishi kerak. Hozircha tugmalar disabled yoki "tez orada" label bilan ko'rsatilishi kerak.
- **Topildi:** Manual Code Review — 2026-05-05

---
