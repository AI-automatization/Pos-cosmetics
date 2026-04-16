# RAOS — BAJARILGAN ISHLAR ARXIVI
# Yangilangan: 2026-03-23

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
| B-038 | 2026-03-29 | SCHEMA | `warehouse_invoice_items` + `ticket_messages`: `tenant_id NOT NULL` + `@@index` qo'shildi; `onDelete: Restrict`. Railway migrate deploy. | schema.prisma, migration |
| B-040 | 2026-03-29 | FRONTEND | cashierName "--": `user.firstName+lastName → cashierName` mapping | orders.api.ts, shifts.api.ts |
| B-041 | 2026-03-29 | BACKEND | POST /warehouse/invoices 500: items da `tenantId` yo'q → qo'shildi | warehouse-invoice.service.ts |
| B-042 | 2026-03-29 | BACKEND | TS error: `ticketMessage.create` da `tenantId` yo'q → qo'shildi | support.service.ts |
| B-043 | 2026-03-29 | BACKEND/FRONTEND | Xaridor "--" to'lovlar tarixida: `listPayments` include + customerName mapping | payments.service.ts, payments/history/page.tsx |
| B-044 | 2026-03-29 | BACKEND | "Jami qarz" 0: `findAll` `debtRecord.groupBy` aggregation qo'shildi | customers.service.ts |
| B-045 | 2026-03-29 | FRONTEND | POS stock salbiy: `Math.max(0, currentStock)` | ProductSearch.tsx |
| B-046 | 2026-03-29 | FRONTEND | split 400: nol miqdorli to'lovlar filter `p.amount > 0` | sales.api.ts |
| BUG-001 | 2026-03-02 | BACKEND | `::uuid` cast xatosi: Prisma $queryRaw da `${tenantId}::uuid` → DB TEXT type bilan mos kelmaydi. Barcha `::uuid` castlar olib tashlandi | inventory.service.ts |
| BUG-002 | 2026-03-02 | BACKEND | Noto'g'ri ustun nomlari: `oi.total_price` → `oi.total`, `o.total_amount` → `o.total` | ai.service.ts |
| BUG-003 | 2026-03-02 | BACKEND | OrderStatus enum: `CANCELLED` yo'q, raw SQL da `enum::text` cast kerak. `NOT IN ('CANCELLED','VOIDED')` → `::text = 'COMPLETED'` | ai.service.ts, reports.service.ts, cron.service.ts |
| BUG-004 | 2026-03-02 | BACKEND | SQL alias camelCase: `qty_sold` → `"qtySold"`, `cost_total` → `"costTotal"` (PostgreSQL kamelCase alias uchun tirnoq kerak) | ai.service.ts |
| BUG-005 | 2026-03-02 | BACKEND | DATE_TRUNC param muammosi: `${trunc}` 2 marta → `Prisma.raw("'day'")` bilan inject qilindi | ai.service.ts |
| BUG-006 | 2026-03-02 | BACKEND | Cashier-performance: `o.cashier_id`, `r.created_by`, `s.cashier_id` yo'q → `o.user_id`, `r.user_id`, `s.user_id` | ai.service.ts |
| BUG-007 | 2026-03-02 | BACKEND | Users jadvalida `is_active` ustun camelCase: `u.is_active` → `u."isActive"` | ai.service.ts, reports.service.ts |
| BUG-008 | 2026-03-02 | BACKEND | StockMovementType enum: `ADJUSTMENT_IN`, `RETURN_OUT`, `ADJUSTMENT_OUT`, `TESTER` mavjud emas | export.service.ts |
| BUG-009 | 2026-03-02 | BACKEND | Transfer controller: `@CurrentUser('sub')` → `@CurrentUser('userId')` (JWT validate `userId` qaytaradi, `sub` emas) | inventory.controller.ts |
| T-227 | 2026-03-22 | MOBILE | auth.api.ts login() missing slug → `process.env.EXPO_PUBLIC_TENANT_SLUG` dan olib `{ email, password, slug }` yuborildi | auth.api.ts |
| T-228 | 2026-03-22 | MOBILE | LoginResponse format mismatch → `{ accessToken, refreshToken, user }` flat camelCase formatga moslashtrildi; AuthTokens fields renamed | auth.api.ts, auth.store.ts, LoginScreen.tsx |
| T-229 | 2026-03-22 | MOBILE | Refresh body `{token}` → `{userId, refreshToken}`; response `data.access_token` → `data.accessToken`; userId SecureStore da saqlanadi | client.ts, auth.store.ts |
| T-230 | 2026-03-22 | MOBILE | User.name field → firstName + lastName; ProfileScreen `user.name` → `user.firstName + user.lastName`; DEV bypass yangilandi | auth.api.ts, ProfileScreen.tsx, LoginScreen.tsx |
| T-231 | 2026-03-22 | MOBILE | AsyncStorage → expo-secure-store (SecureStore.setItemAsync/getItemAsync/deleteItemAsync) — client.ts va auth.store.ts | client.ts, auth.store.ts |
| T-317 | 2026-03-24 | FRONTEND | Warehouse layout: WarehouseSidebar (amber, 8 nav items) + (warehouse) route group layout + placeholder dashboard page | WarehouseSidebar.tsx, (warehouse)/layout.tsx, warehouse/page.tsx |
| T-318 | 2026-03-24 | BACKEND+FRONTEND | WAREHOUSE role RBAC: WarehouseReadOnlyGuard (non-GET → 403), catalog/inventory controllers, login redirect → /warehouse, middleware role routing (WAREHOUSE ↔ /warehouse) | warehouse-read-only.guard.ts, catalog.controller.ts, inventory.controller.ts, useAuth.ts, middleware.ts |
| T-311 | 2026-03-24 | BACKEND | Notifications enrichment: description/priority/branchId fields added to GET /notifications, /alerts deprecated with @ApiOperation({deprecated:true}) | notifications.controller.ts, alerts.controller.ts |
| T-312 | 2026-03-24 | BACKEND | IP blocking: IpBlockService (Redis 24h TTL, 100 failed attempts threshold), IpBlockMiddleware, POST/DELETE/GET /admin/ip-block endpoints | ip-block.service.ts, ip-block.middleware.ts, admin-auth.controller.ts |
| T-313 | 2026-03-24 | BACKEND | Feature flags: FeatureFlagsService (Redis cache 1min), @FeatureFlag() decorator + FeatureFlagGuard, CRUD endpoints /admin/feature-flags, @Global() module, FeatureFlag Prisma model | feature-flags.service.ts, feature-flag.decorator.ts, feature-flags.controller.ts, schema.prisma |
| T-326 | 2026-03-24 | BACKEND | Path conflict cleanup: analytics.controller.ts — removed 6 dead-code duplicate endpoints (shadowed by ai.controller.ts), kept stock-value + insights; debts.controller.ts marked @deprecated | analytics.controller.ts, debts.controller.ts |
| T-329 | 2026-03-24 | BACKEND | HR invite flow: NotifyService.createInviteTokenForUser() (7-day TTL via TelegramLinkToken), POST /employees auto-generates token + returns inviteLink, EmployeesModule imports NotificationsModule | notify.service.ts, employees.service.ts, employees.module.ts |
| T-303 | 2026-03-24 | BACKEND | PDF export: PdfExportService (HTML→PDF fallback, 4 report types: daily-revenue/pnl/z-report/tax-report), GET /reports/export/pdf/:reportType endpoint, ReportsModule updated | pdf-export.service.ts, reports.controller.ts, reports.module.ts |
| T-125 | 2026-04-16 | BACKEND | Swagger/OpenAPI: `@nestjs/swagger` v11 o'rnatilgan, `SwaggerModule.setup('api/v1/docs')`, `DocumentBuilder` (title+Bearer auth), barcha 41 controller `@ApiTags`, 32/35 DTO `@ApiProperty` bilan — `http://localhost:3000/api/v1/docs` da ishlaydi | main.ts, *.dto.ts |
| T-340 | 2026-03-31 | SECURITY | Employees controller: `RolesGuard` + `@Roles(OWNER, ADMIN)` controller darajasida qo'shildi; `UpdateStatusDto` (`@IsEnum`) + `UpdatePosAccessDto` (`@IsBoolean`) alohida DTO faylda yaratildi; inline `CreateEmployeeDto` alohida `dto/employee.dto.ts` ga ko'chirildi | employees.controller.ts, employees/dto/employee.dto.ts |
| T-341 | 2026-03-31 | BACKEND | N+1 query bartaraf: `getPerformance()` → bitta `$queryRaw` JOIN (users+orders+returns); `getSuspiciousActivity()` → `return.groupBy()` + bitta `user.findMany`. 50 xodim uchun 100+ query → 2 query | employees.service.ts |
| T-342 | 2026-03-31 | SECURITY | Feature flags tenant isolation: (1) `RolesGuard` qo'shildi — `@Roles` endi ishlaydi; (2) `overrideTenantId` param o'chirildi — faqat JWT tenantId; (3) `setFlag`/`deleteFlag` dagi `global` bypass o'chirildi — tenant scope majburiy | feature-flags.controller.ts |
| T-346 | 2026-03-31 | SECURITY | Biometric verify: (1) `tenantId` DTO ga qo'shildi — cross-tenant full scan bartaraf; (2) `crypto.timingSafeEqual` — timing attack bartaraf; (3) `RegisterBiometricDto`+`VerifyBiometricDto` yaratildi — class-validator ishlaydi | auth.controller.ts, identity/dto/biometric.dto.ts |
| T-347 | 2026-03-31 | SECURITY | Refresh token httpOnly cookie: `cookie-parser` o'rnatildi; `login`/`refresh`/`logout`/`verifyBiometric` endpointlari cookie-based flow ga o'tkazildi; `refreshToken` body dan olib tashlandi; mobile backward compat uchun `refresh` da body fallback qoldirildi | main.ts, auth.controller.ts, refresh-token.dto.ts, identity.service.ts |
| T-348 | 2026-03-31 | SECURITY | Metrics endpoint himoya: `MetricsSecretGuard` yaratildi (`X-Metrics-Secret` header vs `METRICS_SECRET` env); `@SkipThrottle()` olib tashlandi; fail-secure (secret yo'q → 403); `.env.example` ga `METRICS_SECRET` qo'shildi | metrics.controller.ts, metrics-secret.guard.ts, metrics.module.ts, .env.example |
| T-302 | 2026-03-24 | BACKEND | Offline sync Outbox pattern: POST /sync/inbound (idempotency+DUPLICATE/PROCESSED/FAILED, ArrayMaxSize 100), GET /sync/outbound (products/categories/prices since timestamp), GET /sync/status, SyncOutbox Prisma model, financial=event-sourcing, non-financial=last-write-wins | sync.service.ts, sync.controller.ts, sync.dto.ts, schema.prisma |
| T-304 | 2026-03-24 | BACKEND | Fiscal integration: FiscalAdapterService real REGOS API (fetch, REGOS_API_URL/KEY env), stub fallback, sendReceipt+sendZReport, Z-report non-blocking fiscal send in createZReport, BullMQ retry 3x, circuit breaker, ReportsModule imports TaxModule | fiscal-adapter.service.ts, reports.service.ts, reports.module.ts |
| T-305 | 2026-03-24 | BACKEND | Support CRM: SupportTicket+TicketMessage Prisma models, SupportService (CRUD+messages+status), POST/GET /support/tickets, GET /support/tickets/:id, POST /support/tickets/:id/messages, PATCH status, GET /admin/support/tickets (pagination) | support.module.ts, support.service.ts, support.controller.ts, schema.prisma |
| T-315 | 2026-03-24 | BACKEND | Finance moliyaviy modul: GET /finance/pnl (revenue-COGS-returns-expenses+margin), GET /finance/balance-sheet (cash+receivables→assets, retainedEarnings→equity), GET /finance/cash-flow (inflow/outflow/net), ledger JournalLines dan hisoblash, fix /expenses → /finance/expenses, sub→userId fix | finance.service.ts, finance.controller.ts, finance.module.ts |
| T-327 | 2026-03-24 | BACKEND+FRONTEND | Warehouse invoices: WarehouseInvoice+WarehouseInvoiceItem Prisma models, POST/GET /warehouse/invoices+/:id (snapshot), stock movements IN auto-create, stock-in page (form: invoiceNumber+items table+purchasePrice+totalCost), useWarehouseInvoices hook | warehouse-invoice.service.ts, warehouse-invoice.controller.ts, stock-in/page.tsx, warehouse.api.ts |
| T-328 | 2026-03-24 | BACKEND+FRONTEND | Write-off: WriteOffReason enum (DAMAGED/EXPIRED/LOST/OTHER), WRITE_OFF StockMovementType, POST /inventory/write-off, write-off page (reason select+items table+confirm badge) | warehouse-invoice.service.ts, write-off/page.tsx, schema.prisma |
| T-330 | 2026-03-24 | FRONTEND | ESC/POS: lib/escpos.ts (buildEscPosReceipt bytes + sendToNetworkPrinter proxy + isPrinterProxyAvailable), printer settings: storeName/inn/address/footerText fields, autoPrint+copies+80mm already exist, fallback=window.print | escpos.ts, settings/printer/page.tsx |
| T-319 | 2026-03-24 | FRONTEND | Warehouse dashboard: stat cards (totalProducts/lowStock/expiry/todayMovements), low stock list, recent movements list, expiry warning list, RefreshCw button, useWarehouseDashboard/useWarehouseAlerts hooks | warehouse/page.tsx, useWarehouseInvoices.ts |
| T-320 | 2026-03-24 | BACKEND | Warehouse API: GET /warehouse/dashboard (stats+lowStockItems+expiryItems+recentMovements), GET /warehouse/movements/today, GET /warehouse/alerts (expired/soonExpiring) | warehouse-invoice.service.ts, warehouse-invoice.controller.ts |
| T-331 | 2026-03-24 | FRONTEND | Web Onboarding wizard: 4-step (branch→employees→products→dashboard), progress bar, localStorage persistence (raos_onboarding_completed), skip button, completion screen | onboarding/page.tsx |
| T-335 | 2026-03-24 | BACKEND | Telegram Bot commands: /expiry+/expiring aliases, /shifts+/shift aliases, debt cron 09:00 (getOverdueDebtSummary + formatDebtSummaryAlert), config.debtCheckCron | commands.ts, alerts.cron.ts, alert.service.ts, formatter.ts, config.ts |
| T-336 | 2026-03-24 | BACKEND+FRONTEND | Warehouse movement history: GET /warehouse/movements (filters: type/from/to/productId/userId, pagination), history/page.tsx (table+filters+CSV export), StockMovement type, useWarehouseMovements hook | warehouse-invoice.service.ts, warehouse-invoice.controller.ts, warehouse.api.ts, useWarehouseInvoices.ts, history/page.tsx |
| T-337 | 2026-03-27 | SECURITY | Auth guard tekshiruvi: WarehouseInvoiceController, WriteOffController, FinanceController hammasi @UseGuards(JwtAuthGuard, RolesGuard) bilan himoyalangan — false positive | warehouse-invoice.controller.ts, finance.controller.ts |
| B-032 | 2026-03-28 | BACKEND | inventory.controller.ts — @CurrentUser('sub') → @CurrentUser('userId') (3 joyda: approveTransfer, shipTransfer, receiveTransfer). JWT strategy userId qaytaradi, sub emas | inventory.controller.ts |
| B-033 | 2026-03-28 | BACKEND | support_tickets jadvali production DB da yo'q edi (migration yaratilmagan). 20260328000000_add_support_tickets migration SQL yaratildi — `prisma migrate deploy` run qilish kerak | prisma/migrations/20260328000000_add_support_tickets/migration.sql |
| B-034 | 2026-03-28 | SECURITY | identity-info.controller.ts — @UseGuards(JwtAuthGuard) qo'shildi | identity-info.controller.ts |
| B-035 | 2026-03-28 | SECURITY | audit.controller.ts — @UseGuards(JwtAuthGuard, RolesGuard) qo'shildi (@Roles bor edi, lekin RolesGuard yo'q edi) | audit.controller.ts |
| B-036 | 2026-03-28 | SECURITY | reports.controller.ts — @UseGuards(JwtAuthGuard, RolesGuard) qo'shildi | reports.controller.ts |
| B-037 | 2026-03-28 | SECURITY | exchange-rate.controller.ts — @UseGuards(JwtAuthGuard, RolesGuard) qo'shildi (@Roles bor edi, lekin RolesGuard yo'q edi — /sync endpoint himoyasiz) | exchange-rate.controller.ts |
| T-338 | 2026-03-27 | SECURITY | Tenant isolation tekshiruvi: listAllTickets AdminSupportController da @UseGuards(JwtAuthGuard, SuperAdminGuard) bilan himoyalangan, tenantId filter yo'qligi intentional (Super Admin barcha tenantlarni ko'radi) | support.service.ts, support.controller.ts |
| T-339 | 2026-03-27 | BACKEND | console.log/error → logger wrapper: alerts.cron.ts allaqachon to'g'ri edi; main.ts, bot.ts, commands.ts (9 joy), auth.service.ts da ham logger ga o'tkazildi | main.ts, bot.ts, commands.ts, auth.service.ts |
| T-340 | 2026-03-27 | BACKEND | SRP refactor: 4 DTO class (InvoiceItemDto, CreateInvoiceDto, WriteOffItemDto, WriteOffDto) allaqachon dto/warehouse-invoice.dto.ts ga ajratilgan; service 357 qator (<400 limit); controller va service import lari to'g'ri — verified | warehouse-invoice.service.ts, dto/warehouse-invoice.dto.ts, warehouse-invoice.controller.ts |
| T-341 | 2026-03-27 | FRONTEND | Stock-in forma: supplier dropdown (useSuppliers hook), batchNumber+expiryDate per-row, searchable product (text filter + select), onSuccess redirect → /warehouse/invoices — barchasi page.tsx da mavjud, TypeScript noEmit 0 xato | stock-in/page.tsx |
| T-342 | 2026-03-27 | BACKEND | getStockLevels() enriched response: product+warehouse JOIN qo'shildi, { name, sku, totalQty, warehouseName, minStockLevel } qaytaradi, cache invalidation saqlanib qoldi | inventory.service.ts |
| T-343 | 2026-04-01 | BACKEND | SRP refactor: inventory.service.ts (597→208 qator) → StockLevelService+ExpiryTrackingService+StockValueService; reports.service.ts (575→59 qator) → RevenueReportsService+ZReportService+EmployeeActivityService; commands.ts (584→10 qator) → login.handler.ts+report.handler.ts+stock.handler.ts. Modul lar yangilangan. | inventory.service.ts, stock-level.service.ts, expiry-tracking.service.ts, stock-value.service.ts, reports.service.ts, revenue-reports.service.ts, z-report.service.ts, employee-activity.service.ts, commands.ts, login.handler.ts, report.handler.ts, stock.handler.ts |
| T-344 | 2026-04-01 | BACKEND | DTO inline → alohida fayl: `finance/dto/expense.dto.ts` (CreateExpenseDto+ExpenseFilterDto); employees/dto/employee.dto.ts allaqachon tayyor edi. Controller ajratish: WriteOffController → write-off.controller.ts; AdminSupportController → admin-support.controller.ts. Module importlar yangilandi. tsc 0 xato. | finance/dto/expense.dto.ts, finance.service.ts, finance.controller.ts, write-off.controller.ts, warehouse-invoice.controller.ts, admin-support.controller.ts, support.controller.ts, inventory.module.ts, support.module.ts |
| T-345 | 2026-04-01 | BACKEND | Branch zona tozalash: ibrat/feat-mobile-app → ibrat/feat-inventory-ui (yangi branch). apps/mobile-owner/ (2 fayl) + apps/mobile/ (20 fayl) origin/main ga restored — git worktree bilan xavfsiz bajarildi. Faqat apps/api+web+bot o'zgarishlari qoldi. Push: origin/ibrat/feat-inventory-ui | ibrat/feat-inventory-ui branch |
| T-339 | 2026-04-01 | BACKEND | Schema composite indexes: @@index([tenantId,invoiceId]) → warehouse_invoice_items; @@index([tenantId,ticketId]) → ticket_messages. Migration 20260401000000_add_composite_indexes_T339 yaratildi. tenant_id+onDelete:Restrict B-038 da allaqachon tuzatilgan edi. BigInt faqat sequenceNumber (ID emas) — OK. tsc 0 xato. | schema.prisma, 20260401000000_add_composite_indexes_T339/migration.sql |
| T-349 | 2026-04-01 | SECURITY | findAllUsers+findOneUser explicit select (passwordHash/refreshToken/refreshTokenExp excluded) — allaqachon to'g'ri edi. RegisterBiometricDto+VerifyBiometricDto — T-346 da yaratilgan, auth.controller.ts ishlatmoqda. dto/index.ts da export qilingan. Hech qanday o'zgarish talab qilinmadi. | identity.service.ts, auth.controller.ts, dto/biometric.dto.ts |
| T-343 | 2026-03-27 | FRONTEND | Dashboard expiryItems: backend product: { name } include qilindi, frontend item.product?.name ko'rsatadi | warehouse/page.tsx, warehouse-invoice.service.ts |
| T-306 | 2026-03-27 | FRONTEND | Promotions UI: promotions/page.tsx yaratildi (DataTable, create/edit modal, type badge, active toggle, rulesLabel); Sidebar Savdo > Aksiyalar href /promotions ga to'g'irlandi | promotions/page.tsx, Sidebar.tsx |
| T-308 | 2026-03-27 | FRONTEND | WebSocket real-time: useRealtimeEvents.ts hook (socket.io-client try/catch fallback, /realtime namespace, sale:completed/shift:changed events, reconnect logic); dashboard da connection dot + yangi savdo badge | useRealtimeEvents.ts, dashboard/page.tsx |
| T-309 | 2026-03-27 | FRONTEND | ExchangeRate UI: exchangeRate.api.ts + useExchangeRate/History/Sync hooks; finance/exchange-rates/page.tsx (stat cards, LineChart 7/30/90 kun, tarix jadval, CBU sync tugma); ExchangeRateWidget dashboard da; Sidebar Moliya > Valyuta kurslari | exchangeRate.api.ts, useExchangeRate.ts, exchange-rates/page.tsx, ExchangeRateWidget.tsx, dashboard/page.tsx, Sidebar.tsx |
| T-307 | 2026-03-27 | FRONTEND | Bundles UI: BundleDetailModal.tsx (komponentlar ro'yxati, componentTotal, savings%, bundle narx); ProductSearch isBundle badge + modal trigger; CartPanel isBundle badge; CartItem.isBundle field; doAddItem isBundle pass | BundleDetailModal.tsx, ProductSearch.tsx, CartPanel.tsx, types/sales.ts |
| T-310 | 2026-03-27 | FRONTEND | POS tablet layout: TabBar komponent (Mahsulotlar/Savat+badge/To'lov); lg+ da 3-column, lg- da tab-based single panel; keyboard shortcuts bar lg+ da yashirildi; portrait/landscape uchun CSS | pos/page.tsx |
| T-314 | 2026-03-27 | FRONTEND | Subscription UI: settings/billing/page.tsx allaqachon mavjud (plan card+status badge+expiry, UsageBar filial/mahsulot/user uchun, PlanCard grid upgrade tugmasi bilan); useBilling.ts hooks; billingApi allaqachon ishlaydi | settings/billing/page.tsx, hooks/settings/useBilling.ts, api/billing.api.ts |
| B-039 | 2026-03-29 | SECURITY | reports.controller.ts, exchange-rate.controller.ts — GET /reports/profit va GET /exchange-rate/history da @Roles('OWNER','ADMIN') edi, MANAGER yo'q edi → 403. @Roles ga 'MANAGER' qo'shildi. Playwright audit (scripts/audit-all-roles.mjs) bilan aniqlandi | reports.controller.ts, exchange-rate.controller.ts |

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
| T-101 | 2026-03-07 | Nasiya management — Qarzkorlar ro'yxati (DebtCard: ism, telefon, jami/to'langan/qoldiq, status badge, overdue kunlar), to'lov qabul qilish (PayModal: DebtSummary, QuickFillButtons 25%/50%/to'liq, API call), "📩 Eslatma" tugmasi (POST /nasiya/:id/remind, loading spinner, i18n), demo fallback data (4 ta qarz: OVERDUE/ACTIVE/PARTIAL/PAID), useNasiyaData (3 query: all/overdue/paid, refetchInterval) | `apps/mobile/src/screens/Nasiya/index.tsx`, `DebtCard.tsx`, `PayModal.tsx`, `DebtSummary.tsx`, `QuickFillButtons.tsx`, `useNasiyaData.ts`, `api/nasiya.api.ts`, `i18n/uz.ts` |
| T-100 | 2026-03-07 | Owner Mobile Dashboard — RevenueCard (bugungi savdo, orders, avgBasket), WeeklyTrendChart (7-kunlik sof RN bar chart, bugungi kun indigo, placeholder bars data yo'q paytda), ActiveShiftCard (faol smena status), AlertsList (low stock + nasiya overdue), TopProductsCard (top 5 mahsulot), useDashboardData hook (barcha querylar refetchInterval bilan real-time), useNotifications (expo push notification setup, token registration), SalesScreen (real-time yangilanuvchi FlatList), TabNavigator (Dashboard/Savdolar/Inventar/Nasiya) | `apps/mobile/src/screens/Dashboard/index.tsx`, `RevenueCard.tsx`, `WeeklyTrendChart.tsx`, `ActiveShiftCard.tsx`, `AlertsList.tsx`, `TopProductsCard.tsx`, `useDashboardData.ts`, `hooks/useNotifications.ts`, `screens/Sales/index.tsx`, `navigation/TabNavigator.tsx` |
| T-102 | 2026-03-07 | Barcode Scanner — CameraView (expo-camera), CameraSection (indigo scan frame, Skanerlash boshlash tugmasi), ProductResultCard (name/price/stock/expiry/category), CountSection (inventar sanash ro'yxati: systemQty vs actualQty, discrepancy), CountQtyModal (haqiqiy miqdor kiritish), useScannerData hook (catalogApi.getByBarcode + inventoryApi.getStockLevels), 2 rejim: "Tovar qidirish" va "Inventar sanash", scanner.adminNote (faqat ko'rish), TabNavigator ga Scanner tab qo'shildi, i18n 30+ kalit, expo-camera package.json ga qo'shildi | `apps/mobile/src/screens/Scanner/index.tsx`, `CameraSection.tsx`, `ProductResultCard.tsx`, `CountSection.tsx`, `CountQtyModal.tsx`, `useScannerData.ts`, `navigation/TabNavigator.tsx`, `navigation/types.ts`, `i18n/uz.ts`, `package.json` |
| T-141 | 2026-03-17 | Kirim — Status filter tabs (Hammasi/Kutilmoqda/Qabul qilingan): 3 ta tab horizontal ScrollView, aktiv tab primary rang, filtered useMemo ga activeTab filter, tab o'zgarganda FlatList yuqori scroll | `apps/mobile/src/screens/Kirim/index.tsx` |
| T-142 | 2026-03-17 | Kirim — useKirimData hook: inventoryApi.getReceipts() real API birinchi, bo'sh/xato bo'lsa demo fallback, createReceipt mutation, queryClient.invalidateQueries(['kirim']) | `apps/mobile/src/screens/Kirim/useKirimData.ts` |
| T-143 | 2026-03-17 | Kirim — NewReceiptSheet (barcode scanner bilan): CameraSection qayta ishlatildi, qo'lda kiritish rejimi, validatsiya (supplier + min 1 mahsulot), createMutation bilan API ulash | `apps/mobile/src/screens/Kirim/NewReceiptSheet.tsx` |
| T-144 | 2026-03-17 | Kirim — i18n kalitlar: uz/ru/en.ts ga kirim namespace qo'shildi (title, newReceipt, supplier, scanBarcode, filterAll/Pending/Accepted va boshqalar) | `apps/mobile/src/i18n/uz.ts`, `ru.ts`, `en.ts` |
| T-145 | 2026-03-17 | Nasiya — index.tsx real API ga ulash: MOCK_DEBTS olib tashlandi, useNasiyaData(activeTab) hook, DebtCard + PayModal + NewDebtSheet import qilindi, SummaryCard real totalDebt/overdueCount/overdueAmount bilan | `apps/mobile/src/screens/Nasiya/index.tsx` |
| T-146 | 2026-03-17 | Nasiya — FAB → NewDebtSheet: + tugma bosilganda bottom sheet ochilyapti, nasiyaApi.create() chaqiriladi, validatsiya (ism + summa > 0), muvaffaqiyatli → refetchAll() | `apps/mobile/src/screens/Nasiya/NewDebtSheet.tsx` |
| T-147 | 2026-03-17 | Nasiya — DebtCard progress bar: paidAmount/totalAmount*100, status bo'yicha rang (OVERDUE qizil / PARTIAL sariq / ACTIVE ko'k / PAID yashil), foiz matni o'ngda | `apps/mobile/src/screens/Nasiya/DebtCard.tsx` |
| T-148 | 2026-03-17 | Nasiya — To'lovlar tarixi expand/collapse: payments.length > 0 bo'lsa toggle ko'rinadi, sana + miqdor + usul (CASH/CARD), qo'shimcha API so'rovsiz | `apps/mobile/src/screens/Nasiya/DebtCard.tsx` |
| T-149 | 2026-03-17 | Nasiya — Telefon call + Telegram reminder: telefon raqami bosilganda Linking.openURL('tel:...'), 📩 tugma → action modal (telefon qilish / Telegram eslatma), nasiyaApi.sendReminder() | `apps/mobile/src/screens/Nasiya/DebtCard.tsx` |
| T-301 | 2026-03-23 | Biometric auth — POST /auth/biometric/register (publicKey+deviceId → biometricToken 30d) + POST /auth/biometric/verify (token → JWT tokens); keys stored in user.botSettings JSON | `apps/api/src/identity/auth.controller.ts` |
| T-321 | 2026-03-23 | Analytics missing endpoints — GET /analytics/orders, /revenue-by-branch, /employee-performance qo'shildi; /sales-trend granularity+period ikkala format qabul qiladi; /revenue real DB dan (demo emas); /branch-comparison real SQL | `apps/api/src/ai/ai.controller.ts`, `ai.service.ts` |
| T-322 | 2026-03-23 | Inventory missing endpoints — GET /inventory/out-of-stock (qty=0 tovarlar) + GET /inventory/stock-value (total stock qty×cost_price), /inventory/low-stock va /inventory/stock/low ikkala path ham mavjud | `apps/api/src/inventory/inventory.controller.ts`, `inventory.service.ts` |
| T-323 | 2026-03-23 | Shifts missing endpoints — GET /shifts/summary (branch_id/from_date/to_date filter) + GET /shifts/:id (to'liq detail, payment breakdown); ShiftsController alohida /shifts/* controller sifatida qo'shildi | `apps/api/src/sales/shifts.controller.ts` |
| T-324 | 2026-03-23 | Employees missing endpoints — GET /employees/performance, GET /employees/:id/performance, GET /employees/suspicious-activity, PATCH /employees/:id/status, PATCH /employees/:id/pos-access — barchasi mavjud | `apps/api/src/employees/employees.controller.ts` |
| T-325 | 2026-03-23 | System missing endpoints — GET /system/sync-status (branch bo'yicha POS sinxronizatsiya holati) + GET /system/errors (notifications dan error_alert formatida) + GET /system/health (mobile format) | `apps/api/src/health/system.controller.ts` |
| T-316 | 2026-03-23 | WAREHOUSE role — Prisma UserRole enum ga WAREHOUSE qo'shildi, migration yaratildi, ROLE_HIERARCHY 2.5 ga belgilandi, packages/types/src/auth.ts yangilandi | `prisma/schema.prisma`, `migrations/20260323000000_add_warehouse_role/`, `identity.service.ts`, `packages/types/src/auth.ts` |
| T-317 | 2026-03-23 | (warehouse) route group — layout.tsx (WarehouseSidebar + main), WarehouseSidebar (amber, 8 nav items: Dashboard/Invoices/Write-off/Inventory/Expiry/Low-stock/History/Suppliers), placeholder warehouse/page.tsx | `apps/web/src/app/(warehouse)/layout.tsx`, `warehouse/page.tsx`, `components/layout/WarehouseSidebar.tsx` |
| T-318 | 2026-03-23 | WAREHOUSE RBAC guards — WarehouseReadOnlyGuard (catalog read-only), inventory @Roles(+WAREHOUSE), sales @Roles(-WAREHOUSE), login redirects WAREHOUSE→/warehouse, middleware restricts WAREHOUSE to /warehouse/* | `warehouse-read-only.guard.ts`, `catalog.controller.ts`, `inventory.controller.ts`, `sales.controller.ts`, `useAuth.ts`, `middleware.ts` |
| T-311 | 2026-03-23 | /alerts vs /notifications unification — /notifications now returns enriched format (description+priority+branchId+entityId); /alerts marked deprecated in Swagger; both return identical format | `notifications.controller.ts`, `alerts.controller.ts` |
| T-312 | 2026-03-24 | IP Manager Redis — IpBlockService (block/unblock/auto-block 100 failed in 1h → 24h ban); IpBlockMiddleware (global, 403 on blocked IP); POST/DELETE/GET /admin/ip-block endpoints (SuperAdmin) | `ip-block.service.ts`, `ip-block.middleware.ts`, `cache.module.ts`, `admin-auth.controller.ts`, `app.module.ts` |
| T-313 | 2026-03-24 | Feature Flags Redis — feature_flags table (key+tenantId unique, ''=global), FeatureFlagsService (Redis 1min cache), GET/PATCH/DELETE /admin/feature-flags/:key, @FeatureFlag() decorator + FeatureFlagGuard | `feature-flags/` (service, controller, module, decorator), `schema.prisma`, migration |
| T-326 | 2026-03-24 | API path conflicts — analytics.controller.ts: removed 6 dead-code duplicates (shadowed by ai.controller.ts), kept stock-value+insights; debts.controller.ts marked @deprecated (canonical path = /nasiya/*) | `analytics.controller.ts`, `debts.controller.ts` |

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

---

## 2026-03-13 SESSIYA — DEVELOPER TOOLING & BACKEND FEATURES

| # | Sana | Kategoriya | Yechim | Fayl(lar) |
|---|------|-----------|--------|-----------|
| T-125 | 2026-03-10 | [BACKEND] | Swagger/OpenAPI — `@nestjs/swagger` DocumentBuilder + SwaggerModule.setup allaqachon `apps/api/src/main.ts` da mavjud edi. `/api/docs` interaktiv API dokumentatsiya ishlayapti | `apps/api/src/main.ts` |
| T-127 | 2026-03-10 | [BACKEND] | Database seed data — `apps/api/prisma/seed.ts` (503 qator) mavjud edi: kosmetika-demo tenant, owner@kosmetika.uz / Demo1234!, 4 filial, kategoriyalar, mahsulotlar, mijozlar. `pnpm --filter api db:seed` ishlaydi | `apps/api/prisma/seed.ts` |
| T-128 | 2026-03-13 | [DEVOPS] | `.gitignore` yangilandi — git conflict tozalandi, test artifacts, mobile logs (`apps/mobile/logs/`), playwright MCP fayllar qo'shildi | `.gitignore` |
| T-126 | 2026-03-13 | [BACKEND] | Jest test infratuzilmasi — `jest.config.js`, `apps/api/src/identity/test/` va `apps/api/src/catalog/test/` spec fayllar, 6/6 PASS | `apps/api/jest.config.js`, `apps/api/src/identity/test/`, `apps/api/src/catalog/test/` |
| T-129 | 2026-03-13 | [BACKEND] | File upload service — MinIO S3 integratsiya. `POST /upload`, `POST /upload/bulk`, `GET /upload/presign`, `DELETE /upload` endpointlari | `apps/api/src/upload/upload.service.ts`, `upload.controller.ts`, `upload.module.ts` |
| T-130 | 2026-03-13 | [BACKEND] | Product bulk import/export — CSV/Excel. `POST /catalog/products/import`, `GET /catalog/products/export?format=xlsx\|csv` | `apps/api/src/catalog/import-export/product-import.service.ts` |
| T-131 | 2026-03-13 | [BACKEND] | Barcode generation — EAN-13. `GET /catalog/products/:id/barcode?format=ean13\|code128\|qrcode` (bwip-js kutubxonasi) | `apps/api/src/catalog/catalog.controller.ts` |
| T-132 | 2026-03-13 | [BACKEND] | Tenant settings — `GET /settings`, `PATCH /settings`; `tenant_settings` jadvali va migration | `apps/api/src/identity/tenant-settings.service.ts`, `apps/api/src/identity/tenant-settings.controller.ts`, `apps/api/prisma/migrations/20260313000000_add_tenant_settings_price_changes/` |
| T-133 | 2026-03-13 | [BACKEND] | Price history — `GET /catalog/price-changes`, `GET /catalog/products/:id/price-changes`; `price_changes` jadvali | `apps/api/src/catalog/price-history.service.ts` |
| T-138 | 2026-03-13 | [BACKEND] | Stock levels bug — snapshot dan keyin qo'shilgan mahsulotlar ko'rinmaydi. UNION ALL pattern qo'shildi: snapshot'da bo'lmagan lekin `stock_movements`da bo'lgan mahsulotlar ham aggregatga qo'shiladi | `apps/api/src/inventory/inventory.service.ts` |
| T-140 | 2026-03-13 | [BACKEND] | Real estate controller — routes bo'sh edi. `getProperties()`, `getStats()`, `getRentalPayments()`, `getAllPayments()` stub endpointlari qo'shildi | `apps/api/src/realestate/realestate.controller.ts` |
| T-241 | 2026-03-13 | [IKKALASI] | packages/types — `TenantSettings`, `PriceChange`, `UploadResult`, `ImportResult` shared typelar qo'shildi | `packages/types/src/settings.ts` |
| T-145 | 2026-03-18 | [BACKEND] | Login email OR login field orqali; JWT da `hasPosAccess`, `hasAdminAccess` qo'shildi | `apps/api/src/identity/dto/login.dto.ts`, `identity.service.ts`, `strategies/jwt.strategy.ts` |
| T-146 | 2026-03-18 | [BACKEND] | Fired/inactive/POS-revoke da sessiyalar + refreshToken avtomatik o'chiriladi | `apps/api/src/employees/employees.service.ts` |

---

| T-133 | 2026-03-12 | Settings Screen iOS — Profil kartasi (primary bg, avatar, ism, rol, filial), til tanlash (UZ/RU/EN segmented), printer sozlamalari (Bluetooth toggle, printer tanlash, avtomatik chop), dastur haqida (versiya, maxfiylik, yordam), Chiqish (red, logout+clearAuth). MenuRow komponent chevron bilan. | `apps/mobile/src/screens/Settings/index.tsx` |
| T-132 | 2026-03-12 | Kirim Tafsilotlari (Detail) iOS — Bottom sheet modal, sheet header (raqam, yetkazib beruvchi), status badge, sana, notes (agar bor), mahsulotlar ro'yxati (idx circle, nom, narx/dona, qty, jami), footer summary (jami miqdor + jami narx). KirimScreen ichida. | `apps/mobile/src/screens/Kirim/index.tsx` |
| T-131 | 2026-03-12 | Kirim Screen iOS — Stats chips (Jami/Kutilmoqda/Qabul qilingan/Jami summa), qidirish (raqam yoki yetkazib beruvchi), ReceiptCard (icon, raqam, supplier, status badge, sana, items soni, summa), FlatList. | `apps/mobile/src/screens/Kirim/index.tsx` |
| T-130 | 2026-03-12 | Smena Screen iOS — Header (sana, Faol/Yopilgan pill), aktiv smena kartasi (yashil chiziq, cashier, vaqt, ochilish naqdi), 2×2 stats grid (Tushum/Naqd/Karta/Nasiya), batafsil hisobot (nasiya, xarajat, sof daromad), smena tarixi, Smena ochish/Yopish tugma. Dashboard tab o'rnini egalladi. | `apps/mobile/src/screens/Smena/index.tsx` |
| T-129 | 2026-03-12 | Nasiya Screen iOS — Summary card (jami qarz, muddati o'tgan), qidirish, tabs (Hammasi/Muddati o'tgan/Faol), DebtCard (progress bar, status badge, To'lov tugma), FAB (yangi qarz), PaymentModal (quick fill 25%/50%/100%, miqdor input). Mock data. Nasiya tab TabNavigator ga qo'shildi. | `apps/mobile/src/screens/Nasiya/index.tsx` |
| T-128 | 2026-03-12 | Sales History (Tarix) Screen iOS — Figma 1:282 ga mos. Header (hamburger, sana, calendar), ShiftCard (yashil chiziq, cashier, Yopish tugma), StatsGrid (3 ustun: TUSHUM/SONI/O'RTACHA), SaleRow (NAQD/KARTA/NASIYA badge), FlatList. | `apps/mobile/src/screens/Sales/index.tsx` |
| T-127 | 2026-03-12 | Payment Sheet iOS — Bottom sheet modal, 3 usul (NAQD/KARTA/NASIYA), Aralash to'lov toggle (Switch), qaytim hisoblash, split naqd+karta, Tasdiqlash tugma. | `apps/mobile/src/screens/Savdo/PaymentSheet.tsx` |
| T-126 | 2026-03-12 | Savdo Screen iOS — Figma ga mos. Mahsulot grid (2 ustun), 4 holat (In Stock/Low Stock/Tugagan/Normal), kategoriya tabs (Hammasi/Yuz/Soch/Tana), qidirish + barcode scanner (CameraSection T-102 dan qayta ishlatildi), cart bar (jami + To'lov tugma). Mock data bilan ishlaydi. | `apps/mobile/src/screens/Savdo/index.tsx`, `ProductCard.tsx`, `ScannerModal.tsx` |
| T-125 | 2026-03-12 | Login Screen iOS — Figma ga 1:1 mos. Logo box (purple R), RAOS subtitle, email/parol inputlar (ikonkalar bilan), eye toggle, "Parolni unutdingizmi?", Kirish tugma, YOKI divider, barmoq izi tugma, til tanlash (UZ/RU/EN). Auto-demo-auth `auth.store.ts` dan olib tashlandi — LoginScreen dagi "Demo kirish" tugmasi orqali kirish. | `apps/mobile/src/screens/Auth/LoginScreen.tsx`, `apps/mobile/src/store/auth.store.ts` |

---
## 2026-03-13 SESSIYA — BACKEND INFRA (T-126, T-129..T-133)

| T-# | Kategoriya | Yechim | Fayl(lar) |
|-----|-----------|--------|-----------|
| T-126 | [BACKEND] | Jest test infra — `jest.config.js` (ts-jest, moduleNameMapper, coverage), unit testlar: `tenant-settings.service.spec.ts`, `price-history.service.spec.ts`. E2E config: `test/jest-e2e.config.js`. 6/6 testlar PASS | `apps/api/jest.config.js`, `apps/api/src/identity/test/tenant-settings.service.spec.ts`, `apps/api/src/catalog/test/price-history.service.spec.ts`, `apps/api/test/jest-e2e.config.js` |
| T-129 | [BACKEND] | MinIO file upload — `UploadModule`, `UploadService` (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`). POST /upload (single, max 5MB), POST /upload/bulk (max 10), GET /upload/presign, DELETE /upload. Bucket: product-images, receipts, certificates, exports. Mimetype+size validation, tenant_id folder isolation. Paketlar: multer, @nestjs/platform-express | `apps/api/src/upload/upload.service.ts`, `upload.controller.ts`, `upload.module.ts` |
| T-130 | [BACKEND] | Product bulk import/export — CSV va XLSX qo'llab-quvvatlaydi. POST /catalog/products/import (upsert by SKU/barcode, validation errors return), GET /catalog/products/export. Paket: exceljs | `apps/api/src/catalog/import-export/product-import.service.ts`, `product-import.controller.ts` |
| T-131 | [BACKEND] | Barcode generation — GET /catalog/products/:id/barcode?format=ean13\|code128\|qrcode. PNG image qaytaradi. Paket: bwip-js | `apps/api/src/catalog/catalog.controller.ts` |
| T-132 | [BACKEND] | Tenant settings — `tenant_settings` jadvali qo'shildi. GET /settings, PATCH /settings (ADMIN/OWNER only). 10 ta sozlama: currency, tax_rate, tax_inclusive, receipt_header/footer, logo_url, shift_required, debt_limit_default, rounding, low_stock_threshold. Migration: 20260313000000_add_tenant_settings_price_changes | `apps/api/src/identity/tenant-settings.service.ts`, `tenant-settings.controller.ts`, `apps/api/prisma/schema.prisma` |
| T-133 | [BACKEND] | Price history — `price_changes` jadvali (immutable). Product narxi o'zgarganda avtomatik log. GET /catalog/price-changes, GET /catalog/products/:id/price-changes. TAQIQLANGAN: UPDATE/DELETE | `apps/api/src/catalog/price-history.service.ts`, `apps/api/prisma/schema.prisma` |

---

## 2026-03-23 SESSIYA — Jamoa qayta tashkil etildi, Tasks.md tozalandi

> Polat loyihadan chiqdi. Barcha bajarilgan tasklar Tasks.md dan shu yerga ko'chirildi.

| T-# | Sana | Kategoriya | Yechim | Fayl(lar) |
|-----|------|-----------|--------|-----------|
| T-201 | 2026-03-15 | [BACKEND] | Owner Dashboard Analytics — revenue, sales-trend, branch-comparison, top-products endpointlar T-226 da qo'shildi | `apps/api/src/ai/` |
| T-202 | 2026-03-15 | [BACKEND] | Low Stock & Inventory Alerts — inventory/low-stock endpoint mavjud | `apps/api/src/inventory/` |
| T-203 | 2026-03-15 | [BACKEND] | Alerts/Notifications feed — alerts.controller.ts T-226 da yaratildi | `apps/api/src/notifications/alerts.controller.ts` |
| T-204 | 2026-03-18 | [BACKEND] | Employee Performance — employees module to'liq yaratildi | `apps/api/src/employees/` |
| T-205 | 2026-03-15 | [BACKEND] | Shift Monitoring — shifts.controller.ts alias T-226 da yaratildi | `apps/api/src/sales/shifts.controller.ts` |
| T-206 | 2026-03-15 | [BACKEND] | Nasiya Aging Report — debts.controller.ts alias T-226 da yaratildi | `apps/api/src/nasiya/debts.controller.ts` |
| T-207 | 2026-03-15 | [BACKEND] | System Health — system.controller.ts T-226 da yaratildi | `apps/api/src/health/system.controller.ts` |
| T-208 | 2026-03-01 | [BACKEND] | Push Notification device token — FCM token registration T-103 da bajarildi | `apps/api/src/notifications/` |
| T-209 | 2026-03-01 | [BACKEND] | Branches endpoint — T-047 da bajarildi | `apps/api/src/branches/` |
| T-210 | 2026-03-15 | [BACKEND] | Analytics orders count — T-226 da qo'shildi | `apps/api/src/ai/ai.controller.ts` |
| T-211 | 2026-03-15 | [BACKEND] | DebtSummary overdueCount — T-226 nasiya.service.ts da qo'shildi | `apps/api/src/nasiya/nasiya.service.ts` |
| T-212 | 2026-03-15 | [BACKEND] | Debts aging-report — T-226 da yaratildi | `apps/api/src/nasiya/` |
| T-213 | 2026-03-15 | [BACKEND] | Alerts priority param — alerts.controller.ts da | `apps/api/src/notifications/alerts.controller.ts` |
| T-214 | 2026-03-15 | [BACKEND] | Shift PaymentBreakdown — shifts alias controller da | `apps/api/src/sales/` |
| T-215 | 2026-03-15 | [BACKEND] | StockValue byBranch — inventory endpoint | `apps/api/src/inventory/` |
| T-216 | 2026-03-15 | [BACKEND] | Demo Seed Data — T-226 da kengaytirilgan seed | `apps/api/prisma/seed.ts` |
| T-217 | 2026-03-15 | [BACKEND] | GET /shifts list — T-226 shifts alias | `apps/api/src/sales/` |
| T-218 | 2026-03-15 | [BACKEND] | GET /inventory/stock list — mavjud | `apps/api/src/inventory/` |
| T-219 | 2026-03-15 | [BACKEND] | GET /inventory/low-stock — mavjud | `apps/api/src/inventory/` |
| T-220 | 2026-03-15 | [BACKEND] | Owner Panel Swagger test — T-226 bilan birga test qilindi | -- |
| T-221 | 2026-03-19 | [BACKEND] | Analytics revenue format fix — web da transformer qo'shildi | `apps/web/src/app/(admin)/analytics/page.tsx` |
| T-222 | 2026-03-15 | [BACKEND] | Inventory out-of-stock — T-226 da qo'shildi | `apps/api/src/inventory/` |
| T-223 | 2026-03-15 | [BACKEND] | Shifts detail + summary — T-226 da qo'shildi | `apps/api/src/sales/` |
| T-224 | 2026-03-18 | [BACKEND] | Employee full CRUD — T-144 da bajarildi | `apps/api/src/employees/` |
| T-225 | -- | [BACKEND] | Biometric auth — hali bajarilmagan, T-301 ga ko'chirildi | -- |
| T-226 | 2026-03-15 | [IKKALASI] | Mobile-Owner full integration — 9 ta fayl, seed, alias controllerlar | `apps/api/src/` (ko'p fayl) |
| T-139 | 2026-03-15 | [IKKALASI] | Mobile branch merge — T-226 doirasida amalga oshirildi | `apps/api/` |

---

*docs/Done.md | RAOS*

## T-062 | 2026-03-19 | [BACKEND] | Outbox pattern — Server-side sync endpoint

- **Yechim:** `SyncModule`, `SyncService`, `SyncController` yaratildi. `POST /sync/inbound` — POS dan kelgan batch events qabul qiladi (idempotency_key orqali duplicate reject). `GET /sync/outbound?since=timestamp` — server dan yangilangan mahsulotlar, narxlar, kategoriyalarni qaytaradi. `GET /sync/status` — pending queue holati.
- **Fayllar:** `apps/api/src/sync/sync.controller.ts`, `apps/api/src/sync/sync.service.ts`, `apps/api/src/sync/sync.module.ts`
- **Commit:** (sessiya 14)

---

## T-061 | 2026-03-19 | [BACKEND] | Real-time events — WebSocket Gateway

- **Yechim:** NestJS WebSocket Gateway (Socket.io) yaratildi. Room-based: tenant_id room (tenant admin), `admin` room (founder). Events: `sale:completed`, `error:new`, `sync:status`, `shift:changed`. JWT auth for WebSocket connections.
- **Fayllar:** `apps/api/src/realtime/realtime.gateway.ts`, `apps/api/src/realtime/realtime.module.ts`
- **Commit:** (sessiya 14)

---

## T-059 | 2026-03-19 | [BACKEND] | Tenant provisioning wizard — One-click setup

- **Yechim:** `POST /admin/tenants/provision` endpointi qo'shildi. Yangi tenant yaratishda: tenant record, owner user (vaqtinchalik parol bilan), default branch, seed kategoriyalar (7 ta kosmetika kategoriyasi), default units (5 ta), default settings (UZS, 12% QQS, fiskal o'chirilgan). Response: tenant slug + owner credentials.
- **Fayllar:** `apps/api/src/admin/admin-auth.controller.ts`
- **Commit:** (sessiya 14)

---

## T-058 | 2026-03-19 | [BACKEND] | Tenant impersonation — "Login as" any tenant

- **Yechim:** `POST /admin/impersonate/:tenantId` endpointi qo'shildi. Vaqtinchalik JWT token (1 soat) qaytaradi. Barcha impersonation audit_logs ga yoziladi (who, when, which tenant). Faqat SUPER_ADMIN roli uchun.
- **Fayllar:** `apps/api/src/admin/admin-auth.controller.ts`
- **Commit:** (sessiya 14)

---

## T-248 | 2026-03-19 | [FRONTEND] | Ko'chmas mulk (Real Estate) moduli UI

- **Yechim:** Real Estate sahifa: mulk kartalari (OFFICE/WAREHOUSE/RETAIL/APARTMENT), status filter, search, stats kartalar (jami mulk, ijarada, oylik ijara, muddati o'tgan). To'lovlar tab — jadval bilan. Backend hali tayyor emas (T-140), ErrorState ko'rsatadi.
- **Fayl:** `types/realestate.ts`, `api/realestate.api.ts`, `hooks/realestate/useRealestate.ts`, `app/(admin)/realestate/page.tsx`, `Sidebar.tsx`

## T-117 | 2026-03-19 | [FRONTEND] | Customer display — 2-ekran (ikkinchi monitor)

- **Yechim:** BroadcastChannel orqali POS → customer display aloqa. Idle, cart, sale-complete ekranlar. window.open() bilan ochiladi. Allaqachon implement qilingan edi.
- **Fayl:** `app/(pos)/pos/customer-display/page.tsx`, `hooks/pos/useCustomerDisplayBroadcast.ts`

## T-122 | 2026-03-19 | [FRONTEND] | Custom report builder — Ad-hoc hisobotlar

- **Yechim:** Report builder sahifa: dimension tanlash (product/category/branch/cashier/date), metric tanlash (revenue/qty/orders/margin), date range. Natija jadvalda tfoot bilan jami. CSV export barcha turlar uchun (sales, order-items, products, inventory, customers, debts).
- **Fayl:** `app/(admin)/reports/builder/page.tsx`, `Sidebar.tsx`

## T-123 | 2026-03-19 | [FRONTEND] | Weight scale integration — Gramm bilan sotish

- **Yechim:** Web Serial API hook (useWeightScale) — USB/Serial tarozi bilan bog'lanish. Chromium browserlarda ishlaydi. WeightScaleWidget — POS uchun kompakt UI. Settings localStorage'da. Type declarations web-serial.d.ts.
- **Fayl:** `hooks/pos/useWeightScale.ts`, `app/(pos)/pos/WeightScaleWidget.tsx`, `types/web-serial.d.ts`

## T-137 | 2026-03-19 | [FRONTEND] | i18n/Localization — O'zbek, Rus, English tillar

- **Yechim:** Lightweight React context + JSON locale files (next-intl o'rniga). 3 til: uz (default), ru, en. LanguageSwitcher dropdown Header'da. Sidebar nav items tKey orqali tarjima. formatDate() va formatLocalPrice() locale-aware. localStorage'da saqlash.
- **Fayl:** `i18n/index.ts`, `i18n/i18n-context.tsx`, `locales/uz.json`, `locales/ru.json`, `locales/en.json`, `providers.tsx`, `Header.tsx`, `Sidebar.tsx`

## T-112 | 2026-03-19 | [FRONTEND] | Label printer — Narx etiketka

- **Yechim:** LabelPrintModal yaxshilandi: 3 ta o'lcham tanlash (30x20, 40x30, 58x40mm), expiryDate ko'rsatish, dinamik font o'lchamlari. 30x20mm compact rejimda SKU yashiriladi. Preview proporsional kartalar bilan. Batch print har mahsulot uchun alohida nusxa soni.
- **Fayl:** `LabelPrintModal.tsx`

## T-110 | 2026-03-19 | [FRONTEND] | Thermal printer — ESC/POS integration (MVP)

- **Yechim:** MVP to'liq: window.print() + 80mm/58mm thermal template. Printer settings (localStorage) va useReceiptPrint hook'i birlashtirildi — yagona `raos_printer_settings` kaliti. 58mm qog'oz CSS qo'llab-quvvatildi (data-paper-width attr). Copies (nusxa soni) ishlaydi. Test print paper width va copies sozlamalarini hurmat qiladi. ReceiptPreview openDrawerOnCash setting'ga ulandi. Tauri ESC/POS — Phase 2.
- **Fayl:** `useReceiptPrint.ts`, `globals.css`, `ReceiptPreview.tsx`, `settings/printer/page.tsx`

## T-243 | 2026-03-18 | [FRONTEND] | Admin Panel vs Founder Panel — dizayn bir xillashtirish

- **Yechim:** Founder Panel dark tema (gray-950) dan light temaga o'tkazildi. Admin = blue accent, Founder = violet accent. 6 fayl o'zgartirildi: layout, FounderSidebar, overview, tenants, tenant detail, errors. Barcha ranglar unified: bg-white kartalar, border-gray-200, text-gray-900 sarlavhalar. Consistent design system.
- **Fayl:** `(founder)/layout.tsx`, `FounderSidebar.tsx`, `overview/page.tsx`, `tenants/page.tsx`, `tenants/[id]/page.tsx`, `errors/page.tsx`

## T-247 | 2026-03-18 | [FRONTEND] | Mahsulot sertifikatlari UI

- **Yechim:** CertificatesSection komponent: sertifikatlar ro'yxati (expiry indikatorlari — qizil/sariq ring + badge), qo'shish form (certNumber, issuingAuthority, issuedAt, expiresAt, fileUrl), o'chirish. ProductForm ga integratsiya qilindi. Types + API methods to'liq.
- **Fayl:** `CertificatesSection.tsx`, `ProductForm.tsx`, `catalog.api.ts`, `catalog.ts`

## T-245 | 2026-03-18 | [FRONTEND] | Bundle (to'plam) mahsulotlar UI

- **Yechim:** BundleSection komponent yaratildi — komponentlar ro'yxati, ProductPicker (search + quantity), total price hisob. API: get/add/remove bundle components. ProductForm ga integratsiya qilindi (VariantsSection yonida).
- **Fayl:** `BundleSection.tsx`, `ProductForm.tsx`, `catalog.api.ts`, `catalog.ts`

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

---

## T-225 | 2026-03-19 | [BACKEND] | Biometric auth — register va verify real implementatsiya

- **Yechim:** `POST /auth/biometric/register` va `POST /auth/biometric/verify` endpointlari real implementatsiya qilindi. `user_biometric_keys` jadvali orqali publicKey + deviceId saqlanadi. Verify da biometric token tekshiriladi va JWT access/refresh token qaytariladi.
- **Fayllar:** `apps/api/src/identity/auth.controller.ts`, `apps/api/src/identity/identity.service.ts`

---

## T-221 | 2026-03-19 | [BACKEND] | Analytics revenue response format to'g'irlandi

- **Yechim:** `GET /analytics/revenue` endi array emas, mobile-owner kutgan `{ today, week, month, year, todayTrend, weekTrend, monthTrend, yearTrend }` object formatida qaytaradi. Real DB dan hisoblangan qiymatlar.
- **Fayllar:** `apps/api/src/ai/analytics.controller.ts`

---

## T-215 | 2026-03-19 | [BACKEND] | Stock value by branch endpoint

- **Yechim:** `GET /inventory/stock-value?period=today|week|month|year` endpointi qo'shildi. `{ total, byBranch: [{ branchId, branchName, value }] }` formatida tovar qiymatini filial bo'yicha qaytaradi.
- **Fayllar:** `apps/api/src/ai/analytics.controller.ts`

---

## T-210 | 2026-03-19 | [BACKEND] | Analytics orders count endpoint

- **Yechim:** `GET /analytics/orders?branchId=&period=today|week|month|year` endpointi qo'shildi. `{ total, avgOrderValue, trend }` formatida buyurtmalar sonini qaytaradi. Dashboard 4-kartasi uchun.
- **Fayllar:** `apps/api/src/ai/analytics.controller.ts`

---

## T-207 | 2026-03-19 | [BACKEND] | System Health endpoint — tasdiqlandi

- **Yechim:** `GET /system/health` endpointi allaqachon mavjud edi va to'g'ri ishlaydi. `{ services, syncStatus, recentErrors }` formatida qaytaradi. Tasdiqlangan va yopildi.
- **Fayllar:** `apps/api/src/system/`

---

## T-201 | 2026-03-19 | [BACKEND] | Owner Dashboard Analytics API endpointlari

- **Yechim:** `GET /analytics/sales-trend`, `GET /analytics/branch-comparison`, `GET /analytics/top-products`, `GET /analytics/revenue-by-branch` endpointlari qo'shildi. Barcha endpointlar mobile-owner `analytics.api.ts` interfeyslari bilan mos formatda qaytaradi.
- **Fayllar:** `apps/api/src/ai/analytics.controller.ts`

---

## T-202 | 2026-03-19 | [BACKEND] | Low Stock & Inventory Alerts endpoint

- **Yechim:** `GET /inventory/low-stock?branchId=&limit=20` va `GET /inventory/items?branchId=&status=&search=&page=&limit=` endpointlari mavjud edi — inventory.service.ts da to'liq implement qilingan. `InventoryItem` type bilan mos holda qaytaradi.
- **Fayllar:** `apps/api/src/inventory/inventory.service.ts`, `apps/api/src/inventory/inventory.controller.ts`

---

## T-203 | 2026-03-19 | [BACKEND] | Alerts / Notifications feed endpoint

- **Yechim:** `GET /alerts`, `PUT /alerts/:id/read`, `PUT /alerts/read-all` endpointlari mavjud — alerts.controller.ts da implement qilingan. Alert types: LOW_STOCK, OUT_OF_STOCK, EXPIRY_WARNING, LARGE_REFUND, SUSPICIOUS_ACTIVITY, SHIFT_CLOSED, SYSTEM_ERROR, NASIYA_OVERDUE.
- **Fayllar:** `apps/api/src/notifications/alerts.controller.ts`, `apps/api/src/notifications/notifications.service.ts`

---

## T-204 | 2026-03-19 | [BACKEND] | Employee Performance endpoint

- **Yechim:** `GET /employees/performance?branchId=&period=today|week|month` va `GET /employees/:id/suspicious-activity` endpointlari mavjud. Real DB queries bilan EmployeePerformance object qaytaradi. Suspicious activity triggers: refund > 3x avg, void after payment, large discount > 30%.
- **Fayllar:** `apps/api/src/employees/employees.service.ts`, `apps/api/src/employees/employees.controller.ts`

---

## T-205 | 2026-03-19 | [BACKEND] | Shift Monitoring endpoint

- **Yechim:** `GET /shifts?branchId=&status=open|closed&page=&limit=` va `GET /shifts/:id` endpointlari mavjud. OWNER role barcha filial smenalarini ko'radi, CASHIER faqat o'zinikini. Shift object: branchName, cashierName, paymentBreakdown qo'shilgan.
- **Fayllar:** `apps/api/src/sales/shifts/shifts.controller.ts`, `apps/api/src/sales/shifts/shifts.service.ts`

---

## T-206 | 2026-03-19 | [BACKEND] | Nasiya (Debt) Aging Report endpoint

- **Yechim:** `GET /debts/summary?branchId=` va `GET /debts/customers?branchId=&status=current|overdue&page=&limit=` endpointlari mavjud. totalDebt, overdueDebt, overdueCount, aging buckets qaytaradi. CustomerDebt object: customerId, customerName, phone, totalDebt, overdueAmount, lastPaymentDate, daysPastDue.
- **Fayllar:** `apps/api/src/nasiya/debts.controller.ts`, `apps/api/src/nasiya/nasiya.service.ts`

---

## T-208 | 2026-03-19 | [BACKEND] | Push Notification device token registration

- **Yechim:** `POST /notifications/device-token` va `DELETE /notifications/device-token` endpointlari mavjud. `user_device_tokens` jadvali: userId, token, platform (android|ios), createdAt, updatedAt. JWT autentifikatsiya orqali ishlaydi.
- **Fayllar:** `apps/api/src/notifications/notifications.controller.ts`, `apps/api/src/notifications/push.service.ts`

---

## T-209 | 2026-03-19 | [BACKEND] | Branches endpoint — mobile-owner uchun filiallar ro'yxati

- **Yechim:** `GET /branches?tenantId=` endpoint mavjud — branches.controller.ts da implement qilingan. Branch object: id, name, address, isActive. tenant_id JWT dan olinadi, OWNER faqat o'z tenant filiallarini ko'radi.
- **Fayllar:** `apps/api/src/branches/branches.controller.ts`, `apps/api/src/branches/branches.service.ts`

---

## T-211 | 2026-03-19 | [BACKEND] | DebtSummary `overdueCount` field qo'shish

- **Yechim:** `GET /debts/summary` response ga `overdueCount` field qo'shildi — muddati o'tgan orders/invoices bor mijozlar soni. nasiya.service.ts da real DB query bilan hisoblanadi.
- **Fayllar:** `apps/api/src/nasiya/nasiya.service.ts`

---

## T-212 | 2026-03-19 | [BACKEND] | `GET /debts/aging-report` — Qarz yoshi hisoboti bucketi

- **Yechim:** `GET /debts/aging-report?branchId=` endpoint mavjud. 4 ta bucket: 0_30, 31_60, 61_90, 90_plus. Har bucket: bucket key, label, amount, customerCount. Mobile-owner AgingBucketChart uchun to'liq format tayyor.
- **Fayllar:** `apps/api/src/nasiya/debts.controller.ts`, `apps/api/src/nasiya/nasiya.service.ts`

---

## T-213 | 2026-03-19 | [BACKEND] | `GET /alerts` — `priority` query param qo'shish

- **Yechim:** alerts.controller.ts ga `priority=high|medium|low` query param qo'shildi. Priority mapping: high = SUSPICIOUS_ACTIVITY/OUT_OF_STOCK/SYSTEM_ERROR/NASIYA_OVERDUE(30+kun), medium = LARGE_REFUND/EXPIRY_WARNING/NASIYA_OVERDUE(7-30kun), low = LOW_STOCK/SHIFT_CLOSED. Berilmasa — hammasi qaytariladi.
- **Fayllar:** `apps/api/src/notifications/alerts.controller.ts`

---

## T-214 | 2026-03-19 | [BACKEND] | Shift PaymentBreakdown — `method` + `percentage` field

- **Yechim:** `GET /shifts/:id` response ga `paymentBreakdown` array qo'shildi. Har element: method (cash|terminal|click|payme|transfer), amount, percentage (amount/totalRevenue * 100 — backend tomonida hisoblanadi). Mobile-owner PaymentBreakdownChart uchun tayyor.
- **Fayllar:** `apps/api/src/sales/sales.service.ts`

---

## T-216 | 2026-03-19 | [BACKEND] | Demo Seed Data — 4 ta filial + owner user + tovarlar + smenalar

- **Yechim:** `apps/api/prisma/seed.ts` 503 qatorda to'liq tayyor: tenant (kosmetika-demo), owner user (owner@kosmetika.uz / Demo1234!), 4 filial (Chilonzor/Yunusabad/Mirzo Ulug'bek/Sergeli), 4 kassir, 10 kosmetika mahsuloti (barcode bilan), stock movements, 10 smena (2 ochiq + 8 yopiq), 6 nasiya mijozi. Idempotent (upsert). `npx prisma db seed` bilan ishlatiladi.
- **Fayllar:** `apps/api/prisma/seed.ts`

---

## T-217 | 2026-03-19 | [BACKEND] | `GET /shifts` — Shifts list endpoint (pagination + filters)

- **Yechim:** `GET /shifts?branchId=&status=open|closed&dateFrom=&dateTo=&page=1&limit=20` endpoint mavjud. Response: items[], total, page, limit. Shift object to'liq: branchName, cashierName, paymentBreakdown, avgOrderValue, totalRefunds, totalVoids, totalDiscounts. Sorting: openedAt DESC.
- **Fayllar:** `apps/api/src/sales/shifts/shifts.controller.ts`

---

## T-218 | 2026-03-19 | [BACKEND] | `GET /inventory/stock` — Inventory list endpoint (filtrlar bilan)

- **Yechim:** `GET /inventory/stock?branchId=&status=normal|low|out_of_stock|expiring|expired|all&page=1&limit=50` endpoint mavjud. InventoryItem format to'liq: productName, barcode, quantity, unit, branchName, branchId, costPrice, stockValue, reorderLevel, expiryDate, status. Status backend tomonida hisoblanadi.
- **Fayllar:** `apps/api/src/inventory/inventory.controller.ts`, `apps/api/src/inventory/inventory.service.ts`

---

## T-219 | 2026-03-19 | [BACKEND] | `GET /inventory/low-stock` — Kam qolgan tovarlar banner uchun

- **Yechim:** `GET /inventory/low-stock?branchId=` endpoint mavjud. InventoryItem[] qaytaradi (status = low yoki out_of_stock). Max 20 ta. Dashboard sariq banner "X ta mahsulot kam qoldi" uchun ishlatiladi.
- **Fayllar:** `apps/api/src/inventory/inventory.controller.ts`

---

## T-222 | 2026-03-19 | [BACKEND] | `GET /inventory/out-of-stock` — Omborda yo'q tovarlar

- **Yechim:** `GET /inventory/out-of-stock?branch_id=` endpoint qo'shildi. quantity = 0 bo'lgan tovarlarni qaytaradi. InventoryItem format T-218 bilan bir xil. Mobile-owner Inventory "Out of Stock" tab uchun.
- **Fayllar:** `apps/api/src/inventory/inventory.controller.ts`

---

## T-223 | 2026-03-19 | [BACKEND] | `GET /shifts/:id` + `GET /shifts/summary` — T-217 ga qo'shimcha

- **Yechim:** `GET /shifts/:id` — smena detallari paymentBreakdown bilan. `GET /shifts/summary?branch_id=&from_date=&to_date=` — umumiy smena statistikasi: totalRevenue, totalOrders, totalShifts, avgRevenuePerShift. Mobile-owner ShiftDetailScreen va ShiftSummary uchun.
- **Fayllar:** `apps/api/src/sales/shifts/shifts.controller.ts`, `apps/api/src/sales/shifts/shifts.service.ts`

---

## T-224 | 2026-03-19 | [BACKEND] | `/employees/*` — Owner panel xodim endpointlari (TO'LIQ SPEC)

- **Yechim:** `/employees` controller yaratildi (T-144 asosida kengaytirildi). GET /employees, GET /employees/:id, POST /employees, PATCH /employees/:id/status, PATCH /employees/:id/pos-access, DELETE /employees/:id. GET /employees/performance, GET /employees/:id/performance, GET /employees/suspicious-activity, GET /employees/:id/suspicious-activity. Employee va EmployeePerformance objectlari to'liq format bilan.
- **Fayllar:** `apps/api/src/employees/employees.controller.ts`, `apps/api/src/employees/employees.service.ts`

---

## T-226 (BACKEND) | 2026-03-19 | [BACKEND] | Path mismatch MAP — Mobile calls vs Backend has

- **Yechim:** Mobile-owner chaqiradigan path'lar va backend mavjud path'lar o'rtasidagi to'liq jadval tuzildi. 4 ta to'g'ridan ishlaydi, 18 ta path/format fix qilindi, 18 ta yangi implementatsiya qilindi. Barcha aliaslar tegishli controller'larda to'g'rilandi.
- **Fayllar:** `apps/api/src/ai/ai.controller.ts`, `apps/api/src/sales/shifts.controller.ts`, `apps/api/src/nasiya/debts.controller.ts`, `apps/api/src/notifications/alerts.controller.ts`, `apps/api/src/health/system.controller.ts`

---

## T-226 (IKKALASI) | 2026-03-19 | [IKKALASI] | Mobile-Owner ↔ Backend full integration — seed + path aliases

- **Yechim:** ai.controller.ts ga `/analytics/orders`, `/analytics/branch-comparison`, `/analytics/revenue-by-branch` qo'shildi. shifts.controller.ts `/shifts/*` alias, debts.controller.ts `/debts/*` alias, alerts.controller.ts `/alerts/*` alias, system.controller.ts `/system/*` alias yaratildi. seed.ts kengaytirildi: 4 filial, 4 kassir, 10 mahsulot, 60+ order, 6 nasiya, 8 alert. tsc clean, PR tayyor.
- **Fayllar:** `apps/api/src/ai/ai.controller.ts`, `apps/api/src/ai/ai.service.ts`, `apps/api/src/sales/shifts.controller.ts`, `apps/api/src/nasiya/debts.controller.ts`, `apps/api/src/notifications/alerts.controller.ts`, `apps/api/src/health/system.controller.ts`, `apps/api/prisma/seed.ts`

---

## T-227 | 2026-03-13 | [IKKALASI] | Integration test checklist — mobile-owner endpoints

- **Yechim:** `scripts/test-mobile-owner-endpoints.sh` skripti yaratildi — 25 endpoint avtomatik test qiladi. Barcha backend endpointlar mavjudligi tasdiqlandi (grep bilan). API ishga tushgach: `bash scripts/test-mobile-owner-endpoints.sh` yoki `BASE_URL=https://api-production-c5b6.up.railway.app bash scripts/test-mobile-owner-endpoints.sh`
- **Fayl:** `scripts/test-mobile-owner-endpoints.sh`

---

## T-332 | P2 | [MOBILE] | Mobile: System Health ekrani
- **Bajarildi:** 2026-03-27
- **Mas'ul:** Abdulaziz
- **Yechim:** SystemHealth screen (ServiceStatusCard, SyncStatusList, RecentErrorsList) + useSystemHealth hook + system.api.ts. TabNavigator ga "SISTEMA" tab qo'shildi. HEALTH_REFETCH_INTERVAL=30_000ms. Commit: a118d59
- **Fayllar:** apps/mobile-owner/src/screens/SystemHealth/, apps/mobile-owner/src/navigation/TabNavigator.tsx, types.ts, constants.ts

---

## T-333 | P2 | [MOBILE] | Mobile: экран просмотра склада (read-only)
- **Bajarildi:** 2026-03-27
- **Mas'ul:** Abdulaziz
- **Yechim:** WarehouseScreen yaratildi — search bar (nomi/barcode), 3 tab (Barchasi / 🔴 Kam qolgan / 🟡 Muddati yaqin), FlatList + pull-to-refresh, demo fallback. inventoryApi.getLowStock + getExpiring + getStock ishlatildi. TabNavigator da "OMBOR" tab WarehouseScreen ga almashtirildi.
- **Fayllar:** apps/mobile-owner/src/screens/Warehouse/index.tsx, useWarehouseData.ts, WarehouseItemRow.tsx, WarehouseList.tsx, apps/mobile-owner/src/navigation/TabNavigator.tsx

---

## T-334 | P2 | [MOBILE] | Mobile: HR экран управления сотрудниками
- **Bajarildi:** 2026-03-27
- **Mas'ul:** Abdulaziz
- **Yechim:** HRScreen yaratildi — xodimlar ro'yxati (rol/status/filial), statistika (jami/faol/nofaol), filter tablar, deaktivatsiya/aktivatsiya (Alert confirm), HRInviteSheet (ism+familiya+telefon+email+rol+filial → invite flow T-329). EmployeesNavigator da EmployeesScreen o'rniga HRScreen o'rnatildi.
- **Fayllar:** apps/mobile-owner/src/screens/HR/index.tsx, HREmployeeRow.tsx, HRInviteSheet.tsx, useHRData.ts, apps/mobile-owner/src/navigation/EmployeesNavigator.tsx

---

## T-317 | P3 | [MOBILE] | Smena/index.tsx — 495 qator, 400 limitdan oshgan, SRP buzilgan

- **Bajarildi:** 2026-03-28
- **Mas'ul:** Abdulaziz
- **Yechim:** StatBox, DetailRow, HistoryCard sub-komponentlari + C colors + ShiftRecord interface + fmt utility SmenaComponents.tsx ga ko'chirildi. `icon as any` cast o'rniga `ComponentProps<typeof MaterialCommunityIcons>['name']` turi ishlatildi. index.tsx 495 → 346 qatorga tushdi.
- **Fayllar:** apps/mobile/src/screens/Smena/index.tsx, apps/mobile/src/screens/Smena/SmenaComponents.tsx

---

## T-316 | P3 | [MOBILE] | DebtCard.tsx — 529 qator, SRP buzilgan

- **Bajarildi:** 2026-03-28
- **Mas'ul:** Abdulaziz
- **Yechim:** Reminder action modal (Modal JSX + 76 qator styles + handlePhoneCall + handleTelegramReminder) alohida ReminderActionSheet.tsx ga chiqarildi. DebtCard.tsx 529 → ~385 qatorga tushdi (400 limit ostida). Modal, ActivityIndicator, Alert, nasiyaApi, extractErrorMessage importlari DebtCard dan olib tashlandi.
- **Fayllar:** apps/mobile/src/screens/Nasiya/DebtCard.tsx, ReminderActionSheet.tsx

---

## T-341 | 2026-03-28 | [MOBILE] | ShiftGuard — Smena ochilmagan ekranlarda overlay

- **Mas'ul:** Abdulaziz
- **Yechim:** `ShiftGuard` komponenti yaratildi — `useShiftStore().isShiftOpen` tekshiradi, smena yopilgan bo'lsa `StyleSheet.absoluteFill` overlay ko'rsatadi (lock icon + "Smena ochilmagan" + "Smena ochish →" tugmasi). Savdo, Nasiya, Kirim, Ombor ekranlariga qo'shildi. Smena, Tarix, Sozlamalar — ochiq qoldi. Commit: a5fb771
- **Fayllar:** apps/mobile/src/components/common/ShiftGuard.tsx (yangi), screens/Savdo/index.tsx, Nasiya/index.tsx, Kirim/index.tsx, Ombor/index.tsx

---

## T-349 | 2026-04-15 | [MOBILE] | ibrat/feat-inventory-ui — apps/mobile/ 20 fayl review

- **Mas'ul:** AbdulazizYormatov (Team Lead review)
- **Yechim:** 20 fayl review qilindi va qabul qilindi:
  - TS fixes: `icon as any` → `ComponentProps` (4 ta fayl)
  - API kengaytmalar: inventory, nasiya, sales, catalog
  - Bugfix: `user.name` → `user.firstName/lastName` (auth.store ga mos)
  - Navigation types: 6 yangi stack param list
  - Infra: tsconfig `@/*` alias, `safeQueryFn`, `SupportedLanguage`
- **Topilgan muammolar → yangi tasklar:**
  - T-346: schema.prisma da modellar o'chirilgan (ProductCertificate, PriceChange)
  - T-347: zonalar aralashgan — mobile/web/api bir PR da
  - T-348: 3 ta stale branch tozalash kerak
  - T-345: CI/CD 13+ kun broken (P0)

---

## T-342 | 2026-03-28 | [MOBILE] | Backend integratsiya — Smena, Kirim, Ombor, Savdo

- **Mas'ul:** Abdulaziz
- **Yechim:** Barcha asosiy ekranlar backend API ga ulandi:
  - `shiftStore.ts` — `openShift`/`closeShift` → real API; `syncWithApi()` app start uchun
  - `sales.api.ts` — `openShiftApi`, `closeShiftApi`, `getShiftById`, `getShifts`, `createOrder` qo'shildi
  - `inventory.api.ts` — `/inventory/receipts` → `/warehouse/invoices` tuzatildi, field mapping
  - `catalog.api.ts` — `getProducts()`, `getCategories()` qo'shildi
  - `SmenaScreen` — mock data o'chirildi, real API ga ulandi
  - `SavdoScreen` — MOCK_PRODUCTS o'chirildi, `catalogApi.getProducts()` + `salesApi.createOrder()` ulandi
  - Commit: 5f42746, 2166f66
- **Fayllar:** store/shiftStore.ts, api/sales.api.ts, api/inventory.api.ts, api/catalog.api.ts, screens/Smena/index.tsx, screens/Savdo/index.tsx

---

