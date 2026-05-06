# RAOS — OCHIQ VAZIFALAR (Kosmetika POS MVP)
# Yangilangan: 2026-05-06 (T-447..T-457 qo'shildi — web→mobile parity gap tasklar)
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

## T-449 | P2 | [MOBILE] | Mijozlar — Nasiya limiti (debtLimit) formada va profilida ko'rsatish

- **Sana:** 2026-05-06
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Customers/CustomersScreen.tsx`, `CustomerDetailScreen.tsx`
- **Muammo:** Web da CreateCustomerModal da "Nasiya limiti (so'm)" field bor. Customer detail da qarz limit progress bar bor. Mobile da CustomersScreen/CustomerDetailScreen da bu yo'q.
- **Kutilgan:** Customer yaratish/tahrirlash formada debtLimit fieldi. Profil sahifada qarz limit progress bar.
- **Topildi:** Web → Mobile parity audit — 2026-05-06

---

## T-450 | P2 | [MOBILE] | Mijoz profili — Faol qarzlar ro'yxati + To'lash modal

- **Sana:** 2026-05-06
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Customers/CustomerDetailScreen.tsx`
- **Muammo:** Web da `/customers/[id]` da debtlar ro'yxati, DebtAgeBadge (CURRENT/30/60/90+), PayDebtModal bor. Mobile da CustomerDetail da qarz detallari yo'q.
- **Kutilgan:** Qarzlar ro'yxati (summa, sana, aging badge) + to'lash modal (qisman/to'liq)
- **Topildi:** Web → Mobile parity audit — 2026-05-06

---

## T-452 | P2 | [MOBILE] | Yetkazib beruvchilar — CRUD (Create/Update/Delete)

- **Sana:** 2026-05-06
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Catalog/SuppliersScreen.tsx`
- **Muammo:** Web da SupplierModal bilan to'liq CRUD (nom, kompaniya, telefon, manzil). Mobile da faqat ro'yxat view.
- **Kutilgan:** Supplier yaratish, tahrirlash, o'chirish (swipe yoki menu orqali). BottomSheet forma.
- **Topildi:** Web → Mobile parity audit — 2026-05-06

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P3 (KELAJAK, 6+ oy)
# ══════════════════════════════════════════════════════════════

---

## T-447 | P3 | [MOBILE] | PaymentsHistoryScreen — Stat kartalar (Naqd/Karta/Nasiya jami)

- **Sana:** 2026-05-06
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Finance/PaymentsHistoryScreen.tsx`
- **Muammo:** Web da 3 ta stat card bor (METHOD_LABEL bo'yicha guruhlangan jami summalar). Mobile da faqat ro'yxat bor, stat kartalar yo'q.
- **Kutilgan:** Ekran tepasida stat kartalar: Naqd, Karta, Nasiya — har birining jami summasi
- **Topildi:** Web → Mobile parity audit — 2026-05-06

---

## T-448 | P3 | [MOBILE] | PaymentsHistoryScreen — Order detail modal (bosilganda)

- **Sana:** 2026-05-06
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Finance/PaymentsHistoryScreen.tsx`
- **Muammo:** Web da row bosilganda OrderDetailModal ochiladi (items, discount, tax, notes). Mobile da SaleDetail bor lekin PaymentsHistory dan bog'lanmagan.
- **Kutilgan:** To'lov qatoriga bosilganda order detallari ochiladi (BottomSheet yoki navigate)
- **Topildi:** Web → Mobile parity audit — 2026-05-06

---

## T-451 | P3 | [MOBILE] | Kategoriyalar — Ierarhik (tree) view

- **Sana:** 2026-05-06
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Catalog/CategoriesScreen.tsx`
- **Muammo:** Web da buildTree() + recursive CategoryRow (depth indentation: depth*20px). Mobile da flat list (parent-child aloqasi ko'rinmaydi).
- **Kutilgan:** Kategoriyalar daraxt ko'rinishida — parent ostida childlar indentatsiya bilan
- **Topildi:** Web → Mobile parity audit — 2026-05-06

---

## T-453 | P3 | [MOBILE] | Etiketka chop — Bluetooth/AirPrint printer support

- **Sana:** 2026-05-06
- **Mas'ul:** Abdulaziz
- **Fayl:** yangi `apps/mobile/src/screens/Catalog/LabelPrintSheet.tsx`
- **Muammo:** Web da LabelPrintModal (30x20, 40x30, 58x40 mm, nusxa soni, barcode, narx). Mobile da printer integratsiya yo'q.
- **Kutilgan:** Bluetooth/AirPrint printer topish, label size tanlash, chop etish
- **Topildi:** Web → Mobile parity audit — 2026-05-06

---

## T-454 | P3 | [MOBILE] | Warehouse — Nakladnoy/Invoice ko'rish va detail

- **Sana:** 2026-05-06
- **Mas'ul:** Abdulaziz
- **Fayl:** yangi `apps/mobile/src/screens/Ombor/InvoicesScreen.tsx`
- **Muammo:** Web da `/warehouse/invoices` (list + `[id]/page.tsx` detail). Mobile da warehouse role uchun invoice ko'rish yo'q.
- **Kutilgan:** Invoice ro'yxati + detail sahifasi (mahsulotlar, summa, sana, status)
- **Topildi:** Web → Mobile parity audit — 2026-05-06

---

## T-455 | P3 | [MOBILE] | Dashboard — Oylik moliyaviy xulosa karta

- **Sana:** 2026-05-06
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Dashboard/DashboardScreen.tsx`
- **Muammo:** Web da oylik summary (daromad, tannarx, xarajatlar, sof foyda). Mobile DashboardScreen da bu yo'q.
- **Kutilgan:** Dashboard da oylik moliyaviy xulosa karta (4 ta ko'rsatkich)
- **Topildi:** Web → Mobile parity audit — 2026-05-06

---

## T-456 | P3 | [MOBILE] | Dashboard — Filiallar daromadi (30 kunlik trend)

- **Sana:** 2026-05-06
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Dashboard/DashboardScreen.tsx`
- **Muammo:** Web da branch revenue bar chart (30 kun). Mobile da filial trend ko'rinmaydi.
- **Kutilgan:** Dashboard da filial bo'yicha daromad grafigi (30 kunlik bar chart)
- **Topildi:** Web → Mobile parity audit — 2026-05-06

---

## T-457 | P3 | [MOBILE] | Dashboard — Real-time savdo badge/push notification

- **Sana:** 2026-05-06
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Dashboard/DashboardScreen.tsx`
- **Muammo:** Web da yangi savdo bo'lganda badge yangilanadi. Mobile da push notification yoki badge yo'q.
- **Kutilgan:** Yangi savdo bo'lganda push notification + dashboard da badge counter
- **Topildi:** Web → Mobile parity audit — 2026-05-06

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
| **28** | **3** | **4** | **10** | **14** |

### Kategoriya bo'yicha

| Kategoriya | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| [BACKEND] | 1 | 2 | 5 | 4 | **12** |
| [FRONTEND] | 0 | 1 | 0 | 0 | **1** |
| [MOBILE] | 0 | 0 | 5 | 12 | **17** |
| [SECURITY] | 2 | 1 | 0 | 0 | **3** |
| [IKKALASI] | 0 | 1 | 0 | 1 | **2** |
| [BACKEND+FRONTEND] | 0 | 0 | 1 | 0 | **1** |

### Mas'uliyat taqsimoti

| Dasturchi | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| **Ibrat** (Full-Stack) | 3 | 3 | 5 | 0 | **11** |
| **Abdulaziz** (Mobile) | 0 | 0 | 5 | 12 | **17** |
| **Belgilanmagan** | 0 | 0 | 0 | 2 | **2** |
| **Ibrat + Abdulaziz** | 0 | 1 | 0 | 0 | **1** |

> Yangilandi: 2026-05-06 — T-447..T-457 qo'shildi (web→mobile parity gap)

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

