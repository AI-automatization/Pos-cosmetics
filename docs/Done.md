# RAOS — BAJARILGAN ISHLAR ARXIVI
# Yangilangan: 2026-02-26

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

*docs/Done.md | RAOS*
