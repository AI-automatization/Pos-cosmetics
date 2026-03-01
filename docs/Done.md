# RAOS — BAJARILGAN ISHLAR ARXIVI
# Yangilangan: 2026-02-28

---

## 📌 QOIDALAR

```
1. docs/Tasks.md dagi task FIX bo'lgach → shu yerga ko'chiriladi
2. Format: T-raqam | sana | tur | qisqa yechim | fayl nomi
3. Bu fayl FAQAT arxiv — o'chirmaslik, o'zgartirmaslik
```

---

## TUZATILGAN BUGLAR

| # | Sana | Tur | Muammo va yechim | Fayl |
|---|------|-----|-----------------|------|
| — | — | — | _(hali yo'q)_ | — |

---

## YARATILGAN FEATURELAR

| # | Sana | Feature | Fayl(lar) |
|---|------|---------|-----------|
| T-001 | 2026-02-26 | Identity & RBAC module — JWT auth (access 15min + refresh 7d), @Public/@Roles decorators, global guards (JwtAuth, Roles, Tenant) | `apps/api/src/identity/` (auth.controller, users.controller, identity.service, identity.module, dto/*, guards/*, strategies/*) |
| T-002 | 2026-02-26 | Auth endpoints — POST /auth/register, login, refresh, logout, GET /auth/me | `apps/api/src/identity/auth.controller.ts` |
| T-003 | 2026-02-26 | Users CRUD — GET/POST/PATCH/DELETE /users with role hierarchy enforcement (OWNER>ADMIN>MANAGER>CASHIER>VIEWER) | `apps/api/src/identity/users.controller.ts` |
| T-004 | 2026-02-26 | Multi-tenant isolation — tenant_id filtering on all user queries, slug-based login | `apps/api/src/identity/identity.service.ts`, `apps/api/src/identity/guards/tenant.guard.ts` |
| T-005 | 2026-02-26 | Prisma migration — refresh_token + refresh_token_exp fields to users table | `apps/api/prisma/migrations/20260226112310_add_refresh_token_to_user/` |
| T-006 | 2026-02-26 | Identity domain events — TENANT_REGISTERED, USER_LOGGED_IN, USER_CREATED, USER_UPDATED, USER_DEACTIVATED | `apps/api/src/events/domain-events.ts` |
| T-016 | 2026-02-28 | Admin Panel Catalog UI — Products CRUD (DataTable, sortable/filterable/paginated), ProductForm (Zod validation), Categories tree view, barcode search, React Query hooks (useProducts, useCategories, useCreateProduct, useUpdateProduct, useDeleteProduct), loading skeletons, toast notifications | `apps/web/src/app/(admin)/catalog/products/page.tsx`, `ProductsTable.tsx`, `ProductForm.tsx`, `apps/web/src/app/(admin)/catalog/categories/page.tsx`, `apps/web/src/hooks/catalog/useProducts.ts`, `useCategories.ts`, `apps/web/src/api/catalog.api.ts`, `apps/web/src/types/catalog.ts` |
| T-017 | 2026-02-28 | POS Sale Screen — 3-column layout (ProductSearch 42% \| CartPanel 33% \| PaymentPanel 25%), barcode scanner (keyboard-wedge, <80ms detection), cart management (add/remove/qty/line discount), order discount (% yoki fixed), split payment (cash+card), keyboard shortcuts (F1/F5/F6/F7/F10/Esc), Zustand POS store, useCompleteSale mutation, ReceiptPreview modal | `apps/web/src/app/(pos)/pos/page.tsx`, `ProductSearch.tsx`, `CartPanel.tsx`, `PaymentPanel.tsx`, `ReceiptPreview.tsx`, `apps/web/src/store/pos.store.ts`, `apps/web/src/hooks/pos/useBarcodeScanner.ts`, `usePOSKeyboard.ts`, `useCompleteSale.ts`, `apps/web/src/types/sales.ts` |
| T-018 | 2026-02-28 | Shift Management UI — ShiftOpenModal (fullscreen gate, cashier name + opening cash, quick amounts: 0/100K/200K/500K/1M), ShiftCloseModal (closing cash input, ShiftReport: savdolar soni, jami, cash/card breakdown, discrepancy badge), ShiftBar (live clock, cashier, sales count, "Smenani yopish"), useOpenShift/useCloseShift hooks (API + demo fallback) | `apps/web/src/app/(pos)/pos/shift/ShiftOpenModal.tsx`, `ShiftCloseModal.tsx`, `ShiftReport.tsx`, `apps/web/src/app/(pos)/pos/ShiftBar.tsx`, `apps/web/src/hooks/pos/useShift.ts`, `apps/web/src/api/shift.api.ts`, `apps/web/src/types/shift.ts` |
| T-020 | 2026-02-28 | Receipt Print UI — ReceiptTemplate (80mm thermal: do'kon header, order № va sana, items qty×narx+chegirma, subtotal, QQS 12%, JAMI, payment method, qaytim, fiskal placeholder, footer), useReceiptPrint hook (autoPrint localStorage, toggleAutoPrint, window.print()), useAutoTriggerPrint, @media print CSS (hides UI, shows #receipt-print-area, @page 80mm), auto-print toggle (ToggleLeft/Right) | `apps/web/src/components/Receipt/ReceiptTemplate.tsx`, `useReceiptPrint.ts`, `apps/web/src/app/(pos)/pos/ReceiptPreview.tsx`, `apps/web/src/app/globals.css` |
| T-023 | 2026-02-28 | Inventory UI — Stock levels page (DataTable: mahsulot, barcode, SKU, kategoriya, zaxira, min, holat; OK/LOW/OUT color coding), Kirim/Nakladnoy page (supplier + dynamic items table: product select, qty, cost_price, batch №, expiry date, summary), Chiqim page (reason DAMAGE/WRITE_OFF/OTHER + dynamic items), Kam zaxira page (sorted OUT→LOW, shortage column, alert banner), useStock/useLowStock/useStockIn/useStockOut hooks, Sidebar Inventar links updated | `apps/web/src/app/(admin)/inventory/page.tsx`, `inventory/stock-in/page.tsx`, `inventory/stock-out/page.tsx`, `inventory/low-stock/page.tsx`, `apps/web/src/hooks/inventory/useInventory.ts`, `apps/web/src/api/inventory.api.ts`, `apps/web/src/types/inventory.ts` |
| T-025 | 2026-03-01 | Reports UI — Dashboard (bugungi savdo, sof daromad, o'rtacha chek, kam zaxira stat cards; haftalik bar chart Recharts; top 5 products; low stock alert banner; demo mode when backend not ready), Kunlik savdo page (date range picker, quick 7/30/90 kun, ResponsiveContainer BarChart, summary cards, data table), Top mahsulotlar page (date range, inline mini progress bars), Smena hisobotlari page (collapsible cards: naqd/karta/farq breakdown), recharts o'rnatildi | `apps/web/src/app/(admin)/dashboard/page.tsx`, `reports/page.tsx`, `reports/daily-revenue/page.tsx`, `reports/top-products/page.tsx`, `reports/shifts/page.tsx`, `apps/web/src/hooks/reports/useReports.ts`, `apps/web/src/api/reports.api.ts`, `apps/web/src/types/reports.ts` |
| T-052 | 2026-03-01 | Nasiya UI — POS da qarzga sotish: PaymentPanel ga 4-chi "Nasiya" tugmasi (F8, orange accent, 2×2 grid), CustomerSearchModal (telefon raqam orqali qidirish, auto-format +998, auto-search 9 raqamdan, found/not-found holat, tezkor yaratish formi Zod validation bilan, bloklangan xaridor taqiqlash, muddati o'tgan ogohlantirish), selected customer card (joriy qarz, yangi qarz, overdue warning), useCompleteSale nasiya uchun NASIYA payment + customerId, canComplete blocked xaridorni taqiqlaydi, pos.store selectedCustomer state, types/customer.ts, api/customer.api.ts, hooks/customers/useCustomer.ts | `apps/web/src/app/(pos)/pos/PaymentPanel.tsx`, `CustomerSearchModal.tsx`, `page.tsx`, `apps/web/src/store/pos.store.ts`, `apps/web/src/hooks/pos/useCompleteSale.ts`, `apps/web/src/hooks/customers/useCustomer.ts`, `apps/web/src/api/customer.api.ts`, `apps/web/src/types/customer.ts`, `apps/web/src/types/sales.ts` |
| T-057 | 2026-03-01 | Founder Dashboard UI — alohida (founder) route group qora tema layout, FounderSidebar (violet accent), Overview: 4 stat card, 14-kunlik BarChart (Recharts), Top 5 tenants inline bars, Live sales ticker (3.5s interval, animatsiyali dot), CRITICAL xatolar banner; Tenants page: traffic light badge (yashil/sariq/qizil), DataTable qidirish+filter, so'nggi faollik; Tenant detail: 7-kunlik chart, xatolar ro'yxati, "Login as" tugma; Error log page: severity/type/search filter, stack trace expand, tenantga link; demo fallback hooks (useFounderStats/Revenue/Tenants/TopTenants/Errors); types/founder.ts, api/founder.api.ts, hooks/founder/useFounder.ts | `apps/web/src/app/(founder)/founder/overview/page.tsx`, `tenants/page.tsx`, `tenants/[id]/page.tsx`, `errors/page.tsx`, `apps/web/src/components/layout/FounderSidebar.tsx`, `apps/web/src/hooks/founder/useFounder.ts`, `apps/web/src/api/founder.api.ts`, `apps/web/src/types/founder.ts` |
| T-064 | 2026-03-01 | Sync Status UI — SyncStatusBar komponenti (POS ShiftBar ichida, persistent), 4 holat: online-synced (yashil ping), online-syncing (ko'k spin), offline (qizil), slow (sariq >5s); click → dropdown panel: last sync vaqt, pending queue ro'yxati (order/payment/stock type), auto-retry info; navigator.onLine + /api/health ping (10s interval); Zustand sync.store (state/pendingCount/pendingItems/latencyMs); | `apps/web/src/components/SyncStatus/SyncStatusBar.tsx`, `apps/web/src/store/sync.store.ts`, `apps/web/src/app/(pos)/pos/ShiftBar.tsx` |
| T-110 | 2026-03-01 | Thermal Printer settings UI — /settings/printer page: toggle (enabled/autoPrint/openDrawerOnCash), qog'oz kengligi (58/80mm), nusxa soni (1-3), printer modeli dropdown (Epson TM-T20/88/XPrinter/RONGTA), ulanish turi (browser/USB/network), tarmoq IP+port; Test print button (window.open → HTML receipt → print()); localStorage saqlash; Sidebar: Sozlamalar → Printer sublink; | `apps/web/src/app/(admin)/settings/printer/page.tsx`, `apps/web/src/components/layout/Sidebar.tsx` |
| T-053 | 2026-03-01 | Nasiya management UI — Xaridorlar ro'yxati (DataTable: ism, telefon, jami qarz, limit, holat badge, so'nggi tashrif), summary cards (jami nasiya/overdue/yig'ilgan), Nasiya boshqaruv page (qarzlar DataTable: status color coding CURRENT/OVERDUE_30/60/90/90+, tab filter, search, overdue alert banner, tez to'lov modal 50%/to'liq), Aging hisobot (PieChart Recharts + 4 bucket progress bars: 0-30/31-60/61-90/90+), Customer profile page (qarz tarixi, to'lov qabul modal: miqdor/method/izoh, qarz limiti progress bar), useCustomersList/useDebts/useNasiyaSummary/useAgingReport/usePayDebt hooks (demo fallback), types/debt.ts, api/debt.api.ts, Sidebar: Nasiya va Xaridorlar menyu qo'shildi (HandCoins, Users ikonalar) | `apps/web/src/app/(admin)/customers/page.tsx`, `customers/[id]/page.tsx`, `nasiya/page.tsx`, `nasiya/aging/page.tsx`, `apps/web/src/hooks/customers/useDebts.ts`, `apps/web/src/api/debt.api.ts`, `apps/web/src/types/debt.ts`, `apps/web/src/components/layout/Sidebar.tsx` |

---

## ARXITEKTURA TUZATISHLARI

| # | Sana | Vazifa | Holat |
|---|------|--------|-------|
| T-007 | 2026-02-26 | @Public() decorator — global JwtAuthGuard bypass uchun, HealthController ga qo'shildi | Bajarildi |
| T-008 | 2026-02-26 | APP_GUARD orqali global guards (JwtAuth → Roles → Tenant) zanjiri o'rnatildi | Bajarildi |

---

## DEVOPS ISHLAR

| # | Sana | Vazifa | Holat |
|---|------|--------|-------|
| T-009 | 2026-02-26 | RAOS monorepo bootstrap — Docker (PostgreSQL, Redis, MinIO), NestJS API, Next.js admin, shared packages | Bajarildi |
| T-010 | 2026-02-26 | Auth dependencies o'rnatildi — @nestjs/jwt, @nestjs/passport, passport-jwt, bcryptjs | Bajarildi |

---

*docs/Done.md | RAOS*
