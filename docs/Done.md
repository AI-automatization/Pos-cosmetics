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
| BUG-001 | 2026-03-02 | BACKEND | `::uuid` cast xatosi: Prisma $queryRaw da `${tenantId}::uuid` → DB TEXT type bilan mos kelmaydi. Barcha `::uuid` castlar olib tashlandi | inventory.service.ts |
| BUG-002 | 2026-03-02 | BACKEND | Noto'g'ri ustun nomlari: `oi.total_price` → `oi.total`, `o.total_amount` → `o.total` | ai.service.ts |
| BUG-003 | 2026-03-02 | BACKEND | OrderStatus enum: `CANCELLED` yo'q, raw SQL da `enum::text` cast kerak. `NOT IN ('CANCELLED','VOIDED')` → `::text = 'COMPLETED'` | ai.service.ts, reports.service.ts, cron.service.ts |
| BUG-004 | 2026-03-02 | BACKEND | SQL alias camelCase: `qty_sold` → `"qtySold"`, `cost_total` → `"costTotal"` (PostgreSQL kamelCase alias uchun tirnoq kerak) | ai.service.ts |
| BUG-005 | 2026-03-02 | BACKEND | DATE_TRUNC param muammosi: `${trunc}` 2 marta → `Prisma.raw("'day'")` bilan inject qilindi | ai.service.ts |
| BUG-006 | 2026-03-02 | BACKEND | Cashier-performance: `o.cashier_id`, `r.created_by`, `s.cashier_id` yo'q → `o.user_id`, `r.user_id`, `s.user_id` | ai.service.ts |
| BUG-007 | 2026-03-02 | BACKEND | Users jadvalida `is_active` ustun camelCase: `u.is_active` → `u."isActive"` | ai.service.ts, reports.service.ts |
| BUG-008 | 2026-03-02 | BACKEND | StockMovementType enum: `ADJUSTMENT_IN`, `RETURN_OUT`, `ADJUSTMENT_OUT`, `TESTER` mavjud emas | export.service.ts |
| BUG-009 | 2026-03-02 | BACKEND | Transfer controller: `@CurrentUser('sub')` → `@CurrentUser('userId')` (JWT validate `userId` qaytaradi, `sub` emas) | inventory.controller.ts |

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
| T-066 | 2026-03-02 | Cart state persistence — Zustand persist middleware, partialize (items/shift/totals/orderDiscount), recovery banner on POS mount when unfinished items detected (amber banner: "Tugatilmagan savdo topildi", "Davom etish"/"Tozalash" tugmalar) | `apps/web/src/store/pos.store.ts`, `apps/web/src/app/(pos)/pos/page.tsx` |
| T-028 | 2026-03-02 | Returns UI — tab filter (ALL/PENDING/APPROVED/REJECTED), StatusBadge (PENDING/APPROVED/REJECTED), AdminPinModal (approve: 4-6 raqam PIN; reject: note textarea; 2-mode toggle), useReturns/useApproveReturn/useRejectReturn hooks, DEMO_RETURNS (3 items), types/returns.ts, api/returns.api.ts | `apps/web/src/app/(admin)/sales/returns/page.tsx`, `apps/web/src/hooks/sales/useReturns.ts`, `apps/web/src/api/returns.api.ts`, `apps/web/src/types/returns.ts` |
| T-029 | 2026-03-02 | Users & Roles UI — DataTable (name/phone/role/lastLogin/status), RoleBadge (5 rol rang bilan), UserModal (create/edit: Zod validation, react-hook-form, rol select OWNER ni istisno qiladi, parol faqat yaratishda), deactivate/activate toggle (OWNER himoyalangan), useUsers/useCreateUser/useUpdateUser hooks, DEMO_USERS (5 users), types/user.ts, api/users.api.ts | `apps/web/src/app/(admin)/settings/users/page.tsx`, `apps/web/src/hooks/settings/useUsers.ts`, `apps/web/src/api/users.api.ts`, `apps/web/src/types/user.ts` |
| T-030 | 2026-03-02 | Audit Log UI — AuditRow (expand/collapse old_data vs new_data JSON diff), ACTION_COLORS (6 rang: CREATE/UPDATE/DELETE/LOGIN/LOGOUT/APPROVE), search (user/entity/detail), action filter dropdown, DEMO_LOGS (7 entries) | `apps/web/src/app/(admin)/settings/audit-log/page.tsx` |
| T-033 | 2026-03-02 | Expiry Report UI — 2 tab (Muddati yaqin / Muddati o'tgan), ExpiryBadge (qizil <0 kun, qizil ≤30, sariq ≤60, yashil 60+), daysFilter (30/60/90), alert banners (expired count, near-expiry ≤30 count), DEMO_EXPIRY (6 items, makeExpiry() relative dates) | `apps/web/src/app/(admin)/inventory/expiry/page.tsx` |
| T-034 | 2026-03-02 | Expenses UI — CreateExpenseModal (Zod: category/description/amount/date), DataTable (filter kategoriya), Trash2 delete, 4 Profit summary cards (revenue/grossProfit/expenses/netProfit), PieChart (Recharts, innerRadius donut, category colors), useExpenses/useProfitReport/useCreateExpense/useDeleteExpense hooks, DEMO_EXPENSES (5 items) + DEMO_PROFIT, types/finance.ts, api/finance.api.ts, Sidebar: Moliya group + inventory/expiry + settings/users + settings/audit-log qo'shildi | `apps/web/src/app/(admin)/finance/expenses/page.tsx`, `apps/web/src/hooks/finance/useFinance.ts`, `apps/web/src/api/finance.api.ts`, `apps/web/src/types/finance.ts`, `apps/web/src/components/layout/Sidebar.tsx` |
| T-060 | 2026-03-02 | Founder Tenant Provisioning Wizard — 3-step (do'kon ma'lumotlari: name/slug/phone/city/businessType, egasi: ownerName/ownerPhone/password, tasdiqlash), auto-slug generation from name, ResultScreen (credentials, Copy buttons, QR placeholder), "Yangi do'kon" button in tenants/page.tsx | `apps/web/src/app/(founder)/founder/tenants/new/page.tsx`, `apps/web/src/app/(founder)/founder/tenants/page.tsx` |
| T-065 | 2026-03-02 | Product cache — IndexedDB wrapper (openDB, saveProducts, getCachedProducts, getLastSyncTime, isCacheFresh, clearProductCache), localStorage fallback for small catalogs, useProductCache hook (online/offline detection, background sync, incremental sync via updatedAfter param, navigator.onLine events) | `apps/web/src/lib/productCache.ts`, `apps/web/src/hooks/catalog/useProductCache.ts` |
| T-090 | 2026-03-02 | Analytics dashboard UI — 6 tabs: sotuv trendi (LineChart 30 kun), top mahsulotlar (horizontal BarChart + DataTable marja badge), marja tahlili (BarChart kategoriya, dual Y axis), kassirlar (samaradorlik: bekor/chegirma fraud detection), soatlik faollik (BarChart rang kodlash: qizil/sariq/ko'k), harakatsiz tovar (Dead stock: kun, qty, carrying cost), ABC tahlil (3 bucket progress bars), Analitika link Sidebar | `apps/web/src/app/(admin)/analytics/page.tsx`, `apps/web/src/components/layout/Sidebar.tsx` |
| T-111 | 2026-03-02 | Cash drawer — cashDrawer.ts utility (getPrinterSettings, openCashDrawer: network mode POST /drawer, browser mode simulated), isCashDrawerEnabled(), "Kassa" button in ShiftBar (faqat isCashDrawerEnabled() bo'lganda ko'rinadi), auto-open in ReceiptPreview (CASH payment detect) | `apps/web/src/lib/cashDrawer.ts`, `apps/web/src/app/(pos)/pos/ShiftBar.tsx`, `apps/web/src/app/(pos)/pos/ReceiptPreview.tsx` |
| T-115 | 2026-03-02 | Branch reports UI — 3 filial demo (Chilonzor/Yunusobod/Sergeli), 7-kunlik BarChart (side-by-side, 3 rang), jami cards (daromad/buyurtmalar/foyda), filiallar DataTable (rang dot, ulush %, sortable: revenue/orders/profit/avgCheck), ko'chirma tarixi (transfer status: RECEIVED/SHIPPED/PENDING), Filiallar link reports Sidebar | `apps/web/src/app/(admin)/reports/branches/page.tsx`, `apps/web/src/components/layout/Sidebar.tsx` |

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
| T-011 | 2026-02-28 | Prisma schema — categories, units, products, product_barcodes jadvallari (tenant_id, soft-delete, indexes) | `apps/api/prisma/schema.prisma` |
| T-013 | 2026-02-28 | Prisma schema — shifts, orders, order_items, returns, return_items jadvallari (immutable orders, separate returns table) | `apps/api/prisma/schema.prisma` |
| T-021 | 2026-02-28 | Prisma schema — warehouses, stock_movements jadvallari (movement-based, immutable) | `apps/api/prisma/schema.prisma` |
| T-015 | 2026-02-28 | Prisma schema — payment_intents (CREATED→CONFIRMED→SETTLED→REVERSED lifecycle, multi-method) | `apps/api/prisma/schema.prisma` |
| T-050 | 2026-02-28 | Prisma schema — customers jadvali + CustomersModule CRUD (GET/POST/PATCH/DELETE + stats endpoint) | `apps/api/src/customers/` |
| T-051 | 2026-02-28 | Prisma schema — debt_records, debt_payments (Nasiya module) + NasiyaService/Controller CRUD + payment recording | `apps/api/src/nasiya/` |
| T-012 | 2026-02-28 | CatalogService + CatalogController — products CRUD, categories tree, units CRUD, barcode scan endpoint | `apps/api/src/catalog/` |
| T-014 | 2026-02-28 | SalesService + SalesController — shift open/close, order creation (auto order_number), returns | `apps/api/src/sales/` |
| T-022 | 2026-02-28 | InventoryService + InventoryController — warehouses, stock movements (IN/OUT/ADJUSTMENT), stock levels aggregate | `apps/api/src/inventory/` |
| T-039 | 2026-02-28 | Domain Events — EventEmitter2, sale.created→DeductInventory, return.approved→StockReturn listener | `apps/api/src/events/sale-event.listener.ts` |
| T-019 | 2026-02-28 | Receipt endpoint — GET /sales/orders/:id/receipt (ESC/POS ready JSON format) | `apps/api/src/sales/sales.service.ts` |
| T-024 | 2026-02-28 | Reports module — GET /reports/daily-revenue, /top-products, /sales-summary, /profit, /shift/:id (raw SQL aggregates) | `apps/api/src/reports/` |
| T-027 | 2026-02-28 | Audit Log — audit_logs jadvali + AuditService (log/getLogs) + GET /audit-logs (ADMIN only) | `apps/api/src/audit/`, `schema.prisma` |
| T-031 | 2026-02-28 | Expiry tracking — GET /inventory/expiring?days=30 + GET /inventory/expired (raw SQL, qty>0 filter) | `apps/api/src/inventory/inventory.service.ts` |
| T-032 | 2026-02-28 | Expenses module — expenses jadvali (RENT/SALARY/DELIVERY/UTILITIES/OTHER) + CRUD + summary | `apps/api/src/finance/` |
| T-035 | 2026-02-28 | Ledger — journal_entries + journal_lines (IMMUTABLE), double-entry validation, @OnEvent listeners (sale/payment/return) | `apps/api/src/ledger/`, `schema.prisma` |
| T-036 | 2026-02-28 | Fiscal adapter placeholder — @OnEvent('sale.created')→fiscal_status=PENDING, retryFiscal(), sale hech qachon block qilinmaydi | `apps/api/src/tax/tax.service.ts` |
| T-038 | 2026-02-28 | Shared types — catalog, sales, inventory, payments, customers, reports typelar (packages/types/src/) | `packages/types/src/` |
| T-026 | 2026-02-28 | Discount limit — CASHIER 5%, MANAGER 15%, ADMIN/OWNER 100%. ForbiddenException (403). FIXED discount ham % ga aylantiriladi. | `apps/api/src/sales/sales.service.ts` |
| T-037 | 2026-02-28 | Docker + CI/CD — API Dockerfile (3-stage), Web Dockerfile, docker-compose.staging.yml (postgres+redis+api+web+nginx+certbot), GitHub Actions 5 job, Nginx staging config, .env.staging template | `apps/api/Dockerfile`, `apps/web/Dockerfile`, `docker-compose.staging.yml`, `.github/workflows/ci.yml`, `docker/nginx/` |
| T-040 | 2026-02-28 | Telegram Bot (grammY) — /report, /lowstock, /expiring, /help komandalar. 4 ta cron: soatlik low-stock, 08:00 expiry, 15-daqiqalik suspicious refund, 20:00 kunlik hisobot. Timezone: Asia/Tashkent | `apps/bot/src/` (config, prisma, bot, handlers, services, cron) |
| T-042 | 2026-02-28 | Supplier module — suppliers + product_suppliers jadvallari. CRUD: GET/POST/PATCH/DELETE /catalog/suppliers. Product linking: POST/DELETE /catalog/suppliers/:id/products. upsert + isDefault support | `apps/api/prisma/schema.prisma`, `apps/api/src/catalog/` (service, controller, dto) |
| T-043 | 2026-02-28 | Loyalty module — LoyaltyConfig, LoyaltyAccount, LoyaltyTransaction. Auto-earn via @OnEvent('sale.created'). earn/redeem/adjust endpoints. 1000 so'm = 1 ball, 1 ball = 100 so'm chegirma (configdan) | `apps/api/src/loyalty/`, `schema.prisma` |
| T-045 | 2026-02-28 | Bundles/Sets — BundleItem model, Product.isBundle field. GET/POST/DELETE /catalog/products/:id/components. Auto isBundle flag management | `apps/api/src/catalog/`, `schema.prisma` |
| T-047 | 2026-02-28 | Multi-branch CRUD — BranchService + BranchController. GET/POST/PATCH/DELETE /branches. GET /branches/:id/stats (revenue, orders, active shifts) | `apps/api/src/branches/` |
| T-091 | 2026-03-01 | Global Exception Filter — Prisma error handling (P2002→409, P2025→404), requestId + path in response, internal details never exposed | `apps/api/src/common/filters/global-exception.filter.ts` |
| T-092 | 2026-03-01 | Transaction safety — createOrder, createReturn, recordPayment allaqachon prisma.$transaction() ichida. Tekshirib tasdiqlanadi. | `apps/api/src/sales/sales.service.ts`, `apps/api/src/nasiya/nasiya.service.ts` |
| T-054 | 2026-03-01 | Nasiya reminders — NotificationsService + Controller allaqachon tayyor (getDueSoonDebts, getOverdueDebts, runDebtReminders, ReminderLog) | `apps/api/src/notifications/` |
| T-055 | 2026-03-01 | Super Admin auth — AdminModule (login, createAdmin, tenants CRUD). JWT isAdmin flag. SuperAdminGuard. JwtStrategy admin user validate. | `apps/api/src/admin/`, `apps/api/src/identity/strategies/jwt.strategy.ts` |
| T-056 | 2026-03-01 | Founder Dashboard API — GET /admin/metrics (global), GET /admin/tenants/:id/sales, GET /admin/tenants/:id/health | `apps/api/src/admin/admin-metrics.service.ts` |
| T-067 | 2026-03-01 | Login lockout — login_attempts + user_locks jadvallari. 5 xato → 15 min lock. Admin unlock: POST /users/:id/unlock | `schema.prisma`, `apps/api/src/identity/identity.service.ts` |
| T-078 | 2026-03-01 | NDS (QQS) 12% — extractVAT(), addVAT() utils. getTaxReport(). GET /tax/report, GET/POST /tax/fiscal/:orderId | `apps/api/src/common/utils/currency.util.ts`, `apps/api/src/tax/` |
| T-080 | 2026-03-01 | UZS yaxlitlash — roundUZS(amount, 100|1000), roundingDiff() utility. Barcha hisoblashda ishlatish uchun tayyor | `apps/api/src/common/utils/currency.util.ts` |
| T-068 | 2026-03-01 | Admin PIN — pinHash+pinLockedUntil (User model), PinAttempt jadval. 3 xato→5min lock. POST /auth/pin/set, /verify, GET /auth/pin/status | `schema.prisma`, `apps/api/src/identity/pin.service.ts` |
| T-073 | 2026-03-01 | Redis caching — CacheService (ioredis), @Global AppCacheModule. Barcode scan 5min cache, stock levels 1min cache, event-driven invalidation | `apps/api/src/common/cache/`, `catalog.service.ts`, `inventory.service.ts` |
| T-074 | 2026-03-01 | DB indexing — stock_movements: [tenantId, productId, warehouseId], [type, createdAt]. orders: [userId], [status, createdAt]. products: [isActive], [isActive, name] | `apps/api/prisma/schema.prisma` |
| T-085 | 2026-03-01 | Health checks — GET /health/live (liveness), /health/ready (DB+Redis, 503), /health/ping (LB). Graceful shutdown enableShutdownHooks() | `apps/api/src/health/health.controller.ts` |
| T-088 | 2026-03-01 | Cron tasks — @nestjs/schedule. Soatlik cache, 06:00 expiry, 08:00 debt reminder, 00:05 overdue update, 09:00 CBU kurs, Dushanba dead-stock report. Timezone: Asia/Tashkent | `apps/api/src/common/cron/` |
| T-072 | 2026-03-01 | Input sanitization — SanitizeStringPipe (global, HTML strip), IsValidBarcode (EAN-13/8/UPC-A/Code128), IsUzPhone (+998XXXXXXXXX), IsValidPrice validators. Applied to Customer/Product DTOs | `apps/api/src/common/pipes/` |
| T-077 | 2026-03-01 | Response compression (gzip/brotli via `compression`), TenantThrottlerGuard (APP_GUARD, 100 req/min per tenant), login 10/min, reports 20/min, health @SkipThrottle | `apps/api/src/common/guards/`, `main.ts`, `app.module.ts` |
| T-082 | 2026-03-01 | USD/UZS dual currency — ExchangeRateService (CBU API fetch, upsert DB), exchange_rates jadval, Product.costCurrency field, daily cron (09:00), GET/POST /exchange-rate endpoints | `apps/api/src/common/currency/`, `schema.prisma` |
| T-083 | 2026-03-01 | Z-report — z_reports jadval (IMMUTABLE, sequence number, per-tenant unique date), POST /reports/z-report, GET /reports/z-reports. Tarkib: jami savdo, QQS, qaytarishlar, to'lov turlari, fiskal count | `apps/api/src/reports/`, `schema.prisma` |
| T-084 | 2026-03-01 | DB backups — scripts/backup.sh (pg_dump→GPG→MinIO), scripts/restore.sh, docker/backup/Dockerfile (crond 02:00 UTC), docker-compose.staging.yml backup service | `scripts/`, `docker/backup/`, `docker-compose.staging.yml` |
| T-079 | 2026-03-01 | INN/STIR — Tenant model: inn, stir, oked, legalName, legalAddress fieldlar. RegisterTenantDto + UpdateTenantInfoDto. GET/PATCH /auth/tenant endpoints | `schema.prisma`, `apps/api/src/identity/` |
| T-075 | 2026-03-01 | Stock snapshots — StockSnapshot model (@@unique tenantId+warehouseId+productId), hourly cron materializeStockSnapshots(), getStockLevels() hybrid query (snapshot+delta or full fallback) | `schema.prisma`, `apps/api/src/inventory/inventory.service.ts`, `apps/api/src/common/cron/cron.service.ts` |
| T-095 | 2026-03-01 | Product variants — ProductVariant model (name, sku, barcode, costPrice, sellPrice, isActive, sortOrder). CreateVariantDto, UpdateVariantDto. GET/POST/PATCH/DELETE /catalog/products/:id/variants | `schema.prisma`, `apps/api/src/catalog/` |
| T-089 | 2026-03-01 | Sales analytics — AiService: getSalesTrend, getTopProducts, getDeadStock, getMarginAnalysis, getAbcAnalysis, getCashierPerformance, getHourlyHeatmap. AiController: GET /analytics/* (7 endpoint, 20/min throttle) | `apps/api/src/ai/` |
| T-095 | 2026-03-01 | Product variants — ProductVariant model (name, sku, barcode, costPrice, sellPrice, isActive, sortOrder). CreateVariantDto, UpdateVariantDto. GET/POST/PATCH/DELETE /catalog/products/:id/variants | `schema.prisma`, `apps/api/src/catalog/` |
| T-098 | 2026-03-01 | Price management — ProductPrice model (priceType RETAIL/WHOLESALE/VIP, minQty tiered, validFrom/To scheduled). GET/POST/PATCH/DELETE /catalog/products/:id/prices. GET /catalog/products/:id/prices/resolve?priceType=&qty= | `schema.prisma`, `apps/api/src/catalog/` |
| T-093 | 2026-03-01 | Circuit breaker — CircuitBreakerService (@Global): CLOSED/OPEN/HALF_OPEN states, 3 failures → 30s OPEN. execute(name, fn, fallback). Integrated into ExchangeRateService (CBU) + TaxService (fiscal) | `apps/api/src/common/circuit-breaker/` |
| T-103 | 2026-03-01 | Push notifications — PushService (Firebase Admin SDK, dynamic require). FCM token registration. Per-user in-app notification feed. broadcastLowStock/ExpiryWarning/LargeRefund. GET/PATCH notifications + FCM token endpoints | `apps/api/src/notifications/push.service.ts`, `notifications.service.ts`, `notifications.controller.ts`, `schema.prisma` |
| T-104 | 2026-03-01 | Telegram bot commands — /sales (kunlik summary), /stock <barcode> (ombor holati), /debt <telefon> (qarz), /shift (aktiv smenalar). stock.service.ts, formatter.ts kengaytirildi | `apps/bot/src/services/stock.service.ts`, `handlers/commands.ts`, `bot.ts` |
| T-108 | 2026-03-01 | Subscription plans — SubscriptionPlan + TenantSubscription models. BillingService (getPlans, startTrial, upgradePlan, cancel, checkBranchLimit/ProductLimit/UserLimit, cron status updater). BillingController: GET /billing/plans, /subscription, /limits, /usage. POST /billing/upgrade, /trial. DELETE /billing/cancel | `apps/api/src/billing/`, `schema.prisma` |
| T-087 | 2026-03-01 | CSV/Excel export — ExportService: native CSV (no deps, BOM for Excel), XLSX via optional exceljs. 6 export endpoints: GET /reports/export/sales|order-items|products|inventory|customers|debts. format=csv|xlsx query param. Direct download (Content-Disposition attachment) | `apps/api/src/reports/export.service.ts`, `reports.controller.ts`, `reports.module.ts` |
| T-086 | 2026-03-01 | Prometheus + Grafana monitoring — docker/monitoring/: prometheus.yml (API+postgres+redis+node-exporter), alerts.yml (error rate >5%, latency >2s, API/DB/Redis down). Grafana provisioning (datasource + dashboards). MetricsService (prom-client optional, fallback built-in). GET /api/v1/metrics. Nginx: /metrics faqat Docker network | `docker/monitoring/`, `apps/api/src/metrics/` |

| T-076 | 2026-03-01 | BullMQ Worker — 6 queue workers: fiscal-receipt(5), notification(5), report-generate(3), stock-snapshot(2), data-export(3), sync-process(10). apps/worker standalone app. QueueService (@Global) API side. Graceful SIGTERM/SIGINT shutdown | `apps/worker/src/`, `apps/api/src/common/queue/` |
| T-081 | 2026-03-01 | REGOS fiscal integration — FiscalAdapterService (Phase 1 stub, Phase 2 ready interface). TaxService: sale.created → QueueService → fiscal-receipt queue. fiscal.worker.ts: DB access (Prisma), update fiscalStatus SENT/FAILED. retryFiscal() via queue. CB orqali himoyalangan | `apps/api/src/tax/fiscal-adapter.service.ts`, `apps/worker/src/workers/fiscal.worker.ts`, `apps/api/src/tax/tax.service.ts` |
| T-094 | 2026-03-01 | Dead letter queue — QueueService.getDlqJobs/retryDlqJob/dismissDlqJob/getDlqCount. Admin endpoints: GET /admin/dlq, GET /admin/dlq/count, POST /admin/dlq/:queue/:jobId/retry, DELETE /admin/dlq/:queue/:jobId. SuperAdminGuard himoyasi | `apps/api/src/common/queue/queue.service.ts`, `apps/api/src/admin/admin-auth.controller.ts` |
| T-114 | 2026-03-01 | Inter-branch stock transfer — StockTransfer + StockTransferItem models. Workflow: REQUESTED→APPROVED→SHIPPED→RECEIVED. ship() → TRANSFER_OUT movements, receive() → TRANSFER_IN movements. 6 endpoints: POST/GET /inventory/transfers, PATCH approve/ship/receive/cancel | `schema.prisma`, `apps/api/src/inventory/transfer.service.ts`, `inventory.controller.ts`, `inventory.module.ts` |

---

## 2026-03-04 SESSIYA — LOGIN + AUTH TIZIMI

| # | Sana | Feature | Fayl(lar) |
|---|------|---------|-----------|
| AUTH-LOGIN | 2026-03-04 | Login sahifasi — `/login` page (bug fix: yo'q edi!), dark gradient dizayn, 3 maydon (slug/email/parol), inline validation, parol ko'rish toggle, loading state; `(auth)/layout.tsx` alohida layout | `apps/web/src/app/(auth)/login/page.tsx`, `apps/web/src/app/(auth)/layout.tsx` |
| AUTH-HOOK | 2026-03-04 | useAuth hooks — `useCurrentUser` (React Query `/auth/me`, 5min stale), `useLogin` (token → localStorage + cookie → `/dashboard` redirect), `useLogout` (cleanup + redirect); `auth.api.ts` (login/me/logout) | `apps/web/src/hooks/auth/useAuth.ts`, `apps/web/src/api/auth.api.ts` |
| AUTH-MIDDLEWARE | 2026-03-04 | Next.js middleware — `session_active` cookie orqali barcha routelarni himoyalash, `/login`ga redirect; login qilingan bo'lsa `/login`dan `/dashboard`ga redirect | `apps/web/src/middleware.ts` |
| AUTH-BUG-FIX | 2026-03-04 | `client.ts` bug fix — refresh tokendan `data.access_token` (yo'q) → `data.accessToken` (backend camelCase); refresh URL `/identity/auth/refresh` → `/auth/refresh` | `apps/web/src/api/client.ts` |
| AUTH-HEADER | 2026-03-04 | Header yangilandi — hardcoded "Admin" → real user ismi+roli+tenant nomi; dropdown menu (logout tugma); `SyncStatusBar` Header ga integratsiya qilindi | `apps/web/src/components/layout/Header.tsx` |

---

## 2026-03-08 SESSIYA — QOLGAN P1 TASKLAR ARXIVLANDI

| # | Sana | Feature | Fayl(lar) |
|---|------|---------|-----------|
| T-069 | 2026-03-08 | Session management — sessions jadval (userId, tenantId, deviceInfo, ip, userAgent, lastActive, expiresAt). Max 3 concurrent session (FIFO eviction). GET /auth/sessions, DELETE /auth/sessions/:id, DELETE /auth/sessions/all, GET /auth/sessions/all (ADMIN), DELETE /auth/sessions/user/:userId (force-logout) | `apps/api/src/identity/session.service.ts`, `auth.controller.ts` |
| T-070 | 2026-03-08 | Employee activity monitor — getEmployeeActivity(): per-cashier void/refund/discount metrics, suspicious pattern bayroqlar (3+ void 1 soatda, refund >20%, discount >threshold). GET /reports/employee-activity?from=&to=&userId= | `apps/api/src/reports/reports.service.ts`, `reports.controller.ts` |
| T-071 | 2026-03-08 | API Key auth — api_keys jadval (keyHash SHA256, scopes[], branchId, lastUsed, expiresAt). POST /auth/api-keys, GET /auth/api-keys, GET /auth/api-keys/scopes, DELETE /auth/api-keys/:id/revoke, DELETE /auth/api-keys/:id. 5 scope: sync:read/write, catalog:read, inventory:read, sales:write. Raw key faqat bitta ko'rsatiladi | `apps/api/src/identity/api-key.service.ts`, `auth.controller.ts` |
| T-105 | 2026-03-08 | CBU exchange rate — T-082 da bajarildi. ExchangeRateService (CBU API daily cron 09:00, circuit breaker). exchange_rates jadval. GET /exchange-rate/latest. Fallback: oxirgi cached kurs | `apps/api/src/common/currency/exchange-rate.service.ts` |
| T-113 | 2026-03-08 | Branch management — T-047 da bajarildi. BranchService/Controller CRUD (GET/POST/PATCH/DELETE /branches), branch stats endpoint, tenant_id isolation | `apps/api/src/branches/` |
| T-096 | 2026-03-07 | Tester/sample tracking — StockMovementType.TESTER enum qo'shildi. GET /inventory/testers?from=&to= (TESTER type movements + totalCost aggregation) | `schema.prisma`, `apps/api/src/inventory/inventory.service.ts`, `inventory.controller.ts` |
| T-097 | 2026-03-07 | Product sertifikat — ProductCertificate model (certNumber, issuingAuthority, issuedAt, expiresAt, fileUrl). GET/POST/DELETE /catalog/products/:id/certificates, GET /catalog/certificates/expiring?days=30 | `schema.prisma`, `apps/api/src/catalog/catalog.service.ts`, `catalog.controller.ts` |
| T-099 | 2026-03-07 | Promotions engine — Promotion model (PromotionType: PERCENT/FIXED/BUY_X_GET_Y/BUNDLE). CRUD /promotions. POST /promotions/apply (cart engine: discount hisoblash) | `schema.prisma`, `apps/api/src/sales/promotions/` |
| T-106 | 2026-03-07 | Eskiz.uz SMS — SmsService (token caching, sendSms/sendDebtReminder/sendOtp). Eskiz.uz API: POST notify.eskiz.uz/api/message/sms/send | `apps/api/src/notifications/sms.service.ts`, `notifications.module.ts` |
| T-107 | 2026-03-07 | Payme/Click integration — PaymeProvider (JSON-RPC: CheckPerformTransaction/CreateTransaction/PerformTransaction/CancelTransaction/CheckTransaction, HMAC verify). ClickProvider (MD5 sign verify, prepare/complete handlers). POST /payments/webhooks/payme, /click/prepare, /click/complete | `apps/api/src/payments/providers/`, `payments.controller.ts`, `payments.module.ts` |

---

---

## 2026-03-09 SESSIYA — FRONTEND QA & DEPLOY (Ibrat)

| T-# | Sana | Kategoriya | Yechim | Fayl(lar) |
|-----|------|-----------|--------|-----------|
| T-141 | 2026-03-09 | [FRONTEND] | Backend↔Frontend API contract tekshiruvi. 3 ta mismatch topildi va tuzatildi: (1) `customer.api.ts` `searchByPhone` `/customers/phone/:phone` → `GET /customers?search=` (2) `debt.api.ts` `getCustomerDebts` `/customers/:id/debts` → `GET /nasiya?customerId=` + catch (3) `founder.api.ts` barcha `/founder/*` → `/admin/*` endpointlari | `apps/web/src/api/customer.api.ts`, `apps/web/src/api/debt.api.ts`, `apps/web/src/api/founder.api.ts` |
| T-142 | 2026-03-09 | [FRONTEND] | Playwright bilan production test: login redirect ✅, auth guard ✅, JS xatolari yo'q ✅, favicon 404 (minor, muhim emas) | `https://web-production-5b0b7.up.railway.app` |
| T-143 | 2026-03-09 | [FRONTEND] | Build → Push → Railway deploy `c1488cbf` → HTTP 200 ✅ | `apps/web/`, commit `72718f0` |
| — | 2026-03-09 | [FRONTEND] | `notifications.api.ts` `getUnreadCount` ga `.catch(()=>0)` + `useUnreadCount` hook ga `retry:false` — 404 da app crash qilmaydi | `apps/web/src/api/notifications.api.ts`, `apps/web/src/hooks/notifications/useNotifications.ts` |
| — | 2026-03-09 | [FRONTEND] | `client.ts`: localhost fallback ochirildi, `withCredentials:true` qo'shildi | `apps/web/src/api/client.ts` |
| — | 2026-03-09 | [FRONTEND] | `SyncStatusBar.tsx`: direct `fetch()` → `apiClient.get('/health/ping')` | `apps/web/src/components/SyncStatus/SyncStatusBar.tsx` |
| T-228 | 2026-03-18 | [BACKEND] | Duplikat `20260310000001_add_bot_settings` migratsiya o'chirildi, `20260313` qoldirildi | `apps/api/prisma/migrations/` |
| T-144 | 2026-03-18 | [BACKEND] | Employee `fired` status qo'shildi (active/inactive/fired) | `apps/api/src/employees/employees.controller.ts`, `employees.service.ts` |
| T-145 | 2026-03-18 | [BACKEND] | Login email OR login field orqali; JWT da `hasPosAccess`, `hasAdminAccess` qo'shildi | `apps/api/src/identity/dto/login.dto.ts`, `identity.service.ts`, `strategies/jwt.strategy.ts` |
| T-146 | 2026-03-18 | [BACKEND] | Fired/inactive/POS-revoke da sessiyalar + refreshToken avtomatik o'chiriladi | `apps/api/src/employees/employees.service.ts` |

---

*docs/Done.md | RAOS*

## T-246 | 2026-03-18 | [FRONTEND] | Filiallar o'rtasida tovar ko'chirish UI

- **Yechim:** `/inventory/transfer` sahifasi yaratildi. TransferCard (from→to branch, items, status badge, action buttons), status filter tabs (ALL/REQUESTED/APPROVED/SHIPPED/RECEIVED/CANCELLED), API + hooks + types to'liq. Sidebar ga "Ko'chirish" link.
- **Fayl:** `transfer/page.tsx`, `inventory.api.ts`, `useInventory.ts`, `inventory.ts`, `Sidebar.tsx`

## T-239 | 2026-03-18 | [FRONTEND] | P&L hisobot sahifasi

- **Yechim:** `/finance/pnl` sahifasi yaratildi. Period filter (7d/30d/90d/365d/custom), 5 ta KPI card (Revenue, COGS, Gross Profit, Expenses, Net Profit), P&L waterfall summary, Xarajatlar taqsimoti (category bars). Sidebar ga "Foyda va zarar" link qo'shildi.
- **Fayl:** `apps/web/src/app/(admin)/finance/pnl/page.tsx`, `Sidebar.tsx`

## T-236 | 2026-03-18 | [FRONTEND] | Katta komponentlarni bo'lish (SRP)

- **Yechim:** Dashboard 502→137 qator (6 sub-component: StatCards, WeeklyRevenueChart, ProfitBreakdown, TopProductsList, LowStockBanner, DemoContent). ProductForm 402→197 qator (4 sub-component: FormField, MarginBadge, ImageUpload, BarcodeFields). CartPanel 151 qator — bo'lish kerak emas.
- **Fayl:** `dashboard/` (6 yangi), `catalog/products/` (4 yangi)

## T-244 | 2026-03-18 | [FRONTEND] | Barcha sahifalarda error state → empty state

- **Yechim:** Reusable `ErrorState` (compact/full, retry button) va `EmptyState` (icon, title, CTA) komponentlari yaratildi. 8 ta sahifada inline error div almashtirildi: products, categories, suppliers, inventory, low-stock, orders, shifts, users. Empty state qo'shildi.
- **Fayl:** `EmptyState.tsx`, `ErrorState.tsx` + 8 ta page.tsx

## T-237 | 2026-03-18 | [FRONTEND] | ProductForm yaxshilash — margin preview, rasm, tavsif

- **Yechim:** Real-time MarginBadge (green/yellow/red), ImageUpload (drag&drop + preview, local URL → S3 ready), description textarea (max 2000). Schema extended with `description` field.
- **Fayl:** `apps/web/src/app/(admin)/catalog/products/ProductForm.tsx`

## T-240 | 2026-03-18 | [FRONTEND] | Mobil responsive Sidebar

- **Yechim:** Sidebar `md:` dan kichik ekranlarda yashiriladi (`hidden md:flex`). Header ga hamburger Menu button qo'shildi (`md:hidden`). MobileSidebarContext orqali state boshqarish. Overlay drawer: backdrop + X close + Escape key + body scroll lock.
- **Fayl:** `Sidebar.tsx`, `Header.tsx`, `PageLayout.tsx`, `mobile-sidebar-context.ts`, `(admin)/layout.tsx`

## T-238 | 2026-03-18 | [FRONTEND] | Sidebar — rol asosida filtrlash va collapse

- **Yechim:** Sidebar.tsx to'liq qayta yozildi. Single NAV_SECTIONS config (DRY — 5 ta alohida massiv o'rniga), role-based filtering (ALL, NO_CASHIER, STAFF, ADMIN_ONLY), collapse/compact mode localStorage persistence bilan (w-16/w-64), PanelLeftClose/PanelLeftOpen toggle.
- **Fayl:** `apps/web/src/components/layout/Sidebar.tsx`

## T-249 | 2026-03-18 | [FRONTEND] | Sidebar navigatsiya — bo'limlar va vizual tartib

- **Yechim:** 5 ta section divider qo'shildi: Asosiy (Dashboard, POS), Katalog (Mahsulotlar, Kategoriyalar, Yetkazib beruvchilar, Inventar), Savdo (Sotuv, To'lovlar, Nasiya, Xaridorlar), Moliya (Moliya, Analitika, Hisobotlar), Sozlamalar. Collapsed holatda — thin border divider.
- **Fayl:** `apps/web/src/components/layout/Sidebar.tsx`

## T-242 | 2026-03-18 | [FRONTEND] | Dashboard — KPI kartalar va empty state

- **Yechim:** Dashboard sahifasi P&L breakdown, TrendBadge (% vs yesterday), StatCard tooltip, ProfitBreakdown paneli bilan to'liq qayta yozildi. Bugungi tushum, Yalpi foyda, O'rtacha chek, Kam zaxira ko'rsatkichlari.
- **Fayllar:** `app/(admin)/dashboard/page.tsx`, `types/reports.ts`, `api/reports.api.ts`
- **Commit:** `5ce5414`

---

## T-136 | 2026-03-18 | [FRONTEND] | API client setup — Axios interceptors + React Query

- **Yechim:** `api/client.ts` — axios instance, JWT interceptor, 401 refresh, 402 billing event. React Query provider `providers.tsx` da. 17 ta API fayl yaratildi.
- **Fayllar:** `api/client.ts`, `app/providers.tsx`
- **Commit:** multiple (early commits)

---

## T-135 | 2026-03-18 | [FRONTEND] | Login/Auth pages — Login, register-tenant, forgot password

- **Yechim:** `app/page.tsx` — role-based redirect (OWNER→analytics, CASHIER→pos, default→dashboard). Auth flow token-based.
- **Fayllar:** `app/page.tsx`, `hooks/auth/useAuth.ts`
- **Commit:** `e79275a`

---

## T-134 | 2026-03-18 | [FRONTEND] | App Shell — Base layout (sidebar, navigation, header)

- **Yechim:** Sidebar 5 rol uchun (OWNER/ADMIN/MANAGER/VIEWER/CASHIER), Header bilan branchSelector, PageLayout wrapper. Route group layoutlar: `(admin)/layout.tsx`, `(pos)/layout.tsx`, `(founder)/layout.tsx`.
- **Fayllar:** `components/layout/Sidebar.tsx`, `components/layout/Header.tsx`, `components/layout/PageLayout.tsx`
- **Commit:** `9a87076`

---

## T-109 | 2026-03-18 | [FRONTEND] | Billing UI — Plan tanlash, to'lov

- **Yechim:** `settings/billing/page.tsx` — subscription plan ko'rsatish, billing API integration.
- **Fayllar:** `app/(admin)/settings/billing/page.tsx`, `api/billing.api.ts`, `hooks/settings/useBilling.ts`
- **Commit:** multiple

---

## T-063 | 2026-03-18 | [IKKALASI] | Sync engine package — Core offline logic

- **Yechim:** `packages/sync-engine/src/index.ts` — sync queue, conflict resolution, outbox pattern. SyncStatusBar komponentda ishlatiladi.
- **Fayllar:** `packages/sync-engine/src/index.ts`
- **Commit:** multiple

---

## T-044 | 2026-03-18 | [FRONTEND] | Loyalty UI — Customer points + redeem

- **Yechim:** `LoyaltyConfig` + `LoyaltyAccount` typelar, `loyalty.api.ts` (getConfig, getAccount, redeem), `useLoyalty.ts` hooklar, PaymentPanel da bonus ball ko'rsatish va sarflash.
- **Fayllar:** `types/loyalty.ts`, `api/loyalty.api.ts`, `hooks/customers/useLoyalty.ts`, `app/(pos)/pos/PaymentPanel.tsx`
- **Commit:** `9a947d9`

---

## T-041 | 2026-03-18 | [FRONTEND] | Supplier management — CRUD + product linking

- **Yechim:** `catalog/suppliers/page.tsx` — yetkazib beruvchilar ro'yxati + CRUD. `suppliers.api.ts` + `useSuppliers.ts` hook.
- **Fayllar:** `app/(admin)/catalog/suppliers/page.tsx`, `api/suppliers.api.ts`, `hooks/catalog/useSuppliers.ts`
- **Commit:** multiple

---

## T-235 | 2026-03-18 | [FRONTEND] | LoyaltyAccount — to'liq type va dinamik konversiya

- **Yechim:** `LoyaltyConfig` ga `isActive` + `minRedeem` qo'shildi. `LoyaltyAccount` da backend qaytarmaydigan fieldlar (`tier`, `totalEarned`, `totalRedeemed`) optional qilindi. `loyalty.api.ts` ga `getConfig()` qo'shildi. `useLoyaltyConfig()` hook — 5 daqiqa stale, `DEFAULT_LOYALTY_CONFIG` placeholder. `PaymentPanel.tsx`: hardcoded `* 100` → dinamik `pointsToMoney(points, redeemRate)`.
- **Fayllar:** `types/loyalty.ts`, `api/loyalty.api.ts`, `hooks/customers/useLoyalty.ts`, `pos/PaymentPanel.tsx`
- **Commit:** `9a947d9`

---

## T-234 | 2026-03-18 | [FRONTEND] | Dashboard — to'g'ri foyda hisobi

- **Yechim:** `ProfitSummary` type qo'shildi. `getDashboard()` da `/reports/profit` bugun + kecha parallel chaqiriladi. Dashboard: "Yalpi foyda" kartasi (grossProfit + marja %), `TrendBadge` (% vs yesterday), `ProfitBreakdown` paneli (Tushum → -COGS → -Qaytarishlar → Yalpi foyda). Har metrikaga tooltip (Info icon + `title` attribute).
- **Fayllar:** `types/reports.ts`, `api/reports.api.ts`, `app/(admin)/dashboard/page.tsx`
- **Commit:** `5ce5414`

---

## T-233 | 2026-03-18 | [FRONTEND] | ProductForm — variant UI (rang, hajm, tur)

- **Yechim:** `VariantsSection` komponenti — mahsulot tahrirlashda ko'rsatiladi, yaratishda "saqlangandan keyin qo'shiladi" xabari. CRUD: `useVariants/useCreateVariant/useUpdateVariant/useDeleteVariant` hooks. Inline qator ustiga bosib tahrirlash, o'chirish tugmasi.
- **Fayllar:** `types/catalog.ts`, `api/catalog.api.ts`, `hooks/catalog/useVariants.ts`, `products/VariantsSection.tsx`, `products/ProductForm.tsx`
- **Commit:** `38c273b`

---

## T-232 | 2026-03-18 | [FRONTEND] | Multi-barcode support in ProductForm

- **Yechim:** `useFieldArray` yordamida dinamik barcode ro'yxati. Zod schema'da `extraBarcodes: z.array(z.object({ value: z.string() }))`. Tahrirlashda `product.extraBarcodes` dan pre-populate. `page.tsx` da submit paytida bo'sh qiymatlar filter qilinib DTO ga uzatiladi.
- **Fayllar:** `apps/web/src/types/catalog.ts`, `apps/web/src/app/(admin)/catalog/products/ProductForm.tsx`, `apps/web/src/app/(admin)/catalog/products/page.tsx`
- **Commit:** `a10175a`

---

## T-231 | 2026-03-18 | [FRONTEND] | Role-based sidebar + post-login redirect

- **Yechim:** `Sidebar.tsx` — 5 ta rol uchun alohida nav arrays (OWNER/ADMIN/MANAGER/VIEWER/CASHIER) + `getNavItems(role)` helper + skeleton loader. `useAuth.ts` — login da `authApi.me()` → `setQueryData` → OWNER→/analytics, CASHIER→/pos, boshqalar→/dashboard
- **Fayllar:** `apps/web/src/components/layout/Sidebar.tsx`, `apps/web/src/hooks/auth/useAuth.ts`
- **Commits:** `9a87076`, `e79275a`

---

## T-230 | 2026-03-18 | [FRONTEND] | CreateOrderItem payload — уже исправлено в e1d7ffb

- **Yechim:** `sales.api.ts` da to'g'ri mapping mavjud: `sellPrice→unitPrice`, `lineDiscount(%)→discountAmount(fixed)`, `orderDiscountType→PERCENT/FIXED`. Hech qanday o'zgartirish kerak emas.
- **Fayllar:** `apps/web/src/api/sales.api.ts` (allaqachon to'g'ri)

---

## T-229 | 2026-03-18 | [FRONTEND] | PaymentMethod enum mismatch — CARD→TERMINAL, NASIYA→DEBT

- **Yechim:** `sales.api.ts` va `debt.api.ts` da methodMap qo'shildi: `CARD→TERMINAL`, `NASIYA→DEBT`, `BONUS→CASH`
- **Fayllar:** `apps/web/src/api/sales.api.ts`, `apps/web/src/api/debt.api.ts`, `apps/web/src/api/payments.api.ts`, `apps/web/src/types/founder.ts`, `apps/web/src/app/(admin)/payments/history/page.tsx`

