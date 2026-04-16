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
## T-220 | P0 | [BACKEND] | Owner Panel — Barcha endpointlar Postman/Swagger test

- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** Swagger: `http://localhost:3000/api`
- **Maqsad:** Mobile-owner panel uchun kerakli barcha endpointlar ishlashini tasdiqlash
- **Checklist:**
  ```
  □ POST /auth/login                → owner@kosmetika.uz / Demo1234! → JWT token
  □ GET  /branches                  → 4 ta filial qaytaradi
  □ GET  /analytics/revenue         → 4 ta metric (today/week/month/year)
  □ GET  /analytics/orders          → total, avgOrderValue, trend
  □ GET  /analytics/sales-trend     → 30 kun grafik ma'lumoti
  □ GET  /analytics/branch-comparison → 4 filial daromad
  □ GET  /analytics/top-products    → top 5 tovar
  □ GET  /analytics/stock-value     → byBranch array
  □ GET  /inventory/stock           → tovarlar ro'yxati (pagination, status filter)
  □ GET  /inventory/low-stock       → kam qolgan tovarlar
  □ GET  /shifts                    → smenalar ro'yxati (pagination, status filter)
  □ GET  /shifts/:id                → smena detail + paymentBreakdown
  □ GET  /debts/summary             → totalDebt, overdueDebt, overdueCount, debtorCount, avgDebt
  □ GET  /debts/customers           → nasiya mijozlar (pagination)
  □ GET  /debts/aging-report        → 4 ta bucket (0_30, 31_60, 61_90, 90_plus)
  □ GET  /employees/performance     → xodimlar statistikasi
  □ GET  /alerts                    → xabarlar (priority, status filter, pagination)
  □ PATCH /alerts/:id/read          → o'qildi belgilash
  □ GET  /system/health             → server status, DB ping, Redis ping
  ```
- **Note:** Har endpoint `branchId` filter qabul qilishi va `tenant_id` JWT dan olib ishlashi kerak

---

## ════════════════════════════════════════════════════════════════
## 🔴 MOBILE-OWNER API CONTRACT (T-221..T-226) — Ibrat tomonidan qo'shildi 2026-03-14
## apps/mobile-owner/src/config/endpoints.ts bilan TO'LIQ MOS KELISHI SHART
## ════════════════════════════════════════════════════════════════

---

## T-011 | P0 | [BACKEND] | Catalog module — Prisma schema (products, categories, units, barcodes)
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/prisma/schema.prisma`
- **Vazifa:**
  - `categories` jadvali: id, tenant_id, name, parent_id (nested), sort_order, is_active, created_at, updated_at, deleted_at
  - `units` jadvali: id, tenant_id, name (dona, kg, litr, quti), short_name, created_at
  - `products` jadvali: id, tenant_id, category_id, name, sku, barcode (unique per tenant), cost_price, sell_price, unit_id, min_stock_level, is_active, image_url, description, expiry_tracking (boolean), created_at, updated_at, deleted_at
  - `product_barcodes` jadvali: id, product_id, barcode, is_primary, created_at (bir product da bir nechta barcode)
  - Indexes: tenant_id, [tenant_id, barcode], [tenant_id, sku], [tenant_id, category_id]
  - `npx prisma migrate dev --name add-catalog-tables`
- **Kutilgan:** Catalog jadvallari DB da tayyor, Prisma client generate bo'lgan

---

## T-012 | P0 | [BACKEND] | Catalog module — CRUD service + controller
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/catalog/`
- **Vazifa:**
  - `CatalogModule`, `CatalogService`, `CatalogController`
  - **Products CRUD:** GET /products (list, filter, search, paginate), GET /products/:id, POST /products, PATCH /products/:id, DELETE /products/:id (soft delete)
  - **Categories CRUD:** GET /categories (tree), POST /categories, PATCH /categories/:id, DELETE /categories/:id
  - **Units CRUD:** GET /units, POST /units
  - **Barcode:** GET /products/barcode/:code — tezkor barcode scan uchun
  - Barcha query da `tenant_id` filter MAJBURIY
  - DTOs: CreateProductDto, UpdateProductDto, CreateCategoryDto, ProductFilterDto (search, category, min/max price, is_active)
  - Pagination: page, limit, sort, order
- **Kutilgan:** API endpointlar ishlaydi, Postman dan test qilsa bo'ladi

---

## T-013 | P0 | [BACKEND] | Sales module — Prisma schema (orders, order_items, shifts)
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/prisma/schema.prisma`
- **Vazifa:**
  - `shifts` jadvali: id, tenant_id, user_id, branch_id, opened_at, closed_at, opening_cash, closing_cash, expected_cash, notes, status (OPEN/CLOSED)
  - `orders` jadvali: id, tenant_id, shift_id, user_id (cashier), branch_id, order_number (auto-increment per tenant), status (COMPLETED/RETURNED/VOIDED), subtotal, discount_amount, discount_type (PERCENT/FIXED), tax_amount, total, notes, fiscal_status (NONE/PENDING/SENT/FAILED), fiscal_id, fiscal_qr, created_at
  - `order_items` jadvali: id, order_id, product_id, product_name (snapshot), quantity, unit_price (snapshot), discount_amount, total, cost_price (snapshot, margin uchun)
  - ⚠️ `orders` va `order_items` — immutable. Return uchun alohida `returns` jadvali
  - `returns` jadvali: id, tenant_id, order_id, user_id, reason, total, status (PENDING/APPROVED), approved_by, created_at
  - `return_items` jadvali: id, return_id, order_item_id, product_id, quantity, amount
  - Indexes: [tenant_id, order_number], [tenant_id, shift_id], [tenant_id, created_at]
- **Kutilgan:** Sales jadvallari DB da tayyor

---

## T-014 | P0 | [BACKEND] | Sales module — Order creation service + shift management
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/sales/`
- **Vazifa:**
  - `SalesModule`, `SalesService`, `SalesController`
  - **Shift:** POST /shifts/open, POST /shifts/close, GET /shifts/current, GET /shifts/:id/report
  - **Orders:** POST /orders (create sale), GET /orders (list, filter by date/shift/status), GET /orders/:id
  - Order yaratishda:
    1. Shift OPEN ekanini tekshir
    2. Product narxlarini DB dan ol (snapshot sifatida saqla)
    3. Discount hisoblash
    4. Order + items yaratish (transaction ichida)
    5. Domain event: `sale.created` emit qilish → inventory deduction, ledger entry
  - Order number: auto-increment per tenant (YYYYMMDD-XXXX format)
  - Smena yopishda: jami savdo, cash, card summary hisoblash
- **Kutilgan:** Savdo qilish va smena boshqarish API tayyor

---

## T-015 | P0 | [BACKEND] | Payments module — Cash + Terminal (card) payment
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/payments/`
- **Vazifa:**
  - `PaymentsModule`, `PaymentsService`, `PaymentsController`
  - Prisma schema: `payment_intents` jadvali: id, tenant_id, order_id, method (CASH/CARD/CLICK/PAYME), amount, status (CREATED/CONFIRMED/SETTLED/FAILED/REVERSED), reference, created_at
  - POST /payments (create payment intent for order)
  - Split payment: bitta order uchun bir nechta payment (cash+card)
  - MVP da faqat CASH va CARD (terminal) — Click/Payme keyinroq
  - Payment yaratishda → `payment.confirmed` event emit
  - PaymentProviderFactory — plugin pattern (CLAUDE_BACKEND.md dagi kabi)
- **Kutilgan:** Cash va card to'lov qilsa bo'ladi, split payment ishlaydi

---

## T-019 | P0 | [BACKEND] | Receipt printing — ESC/POS format endpoint
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/sales/receipt/`
- **Vazifa:**
  - GET /orders/:id/receipt — chek ma'lumotlarini qaytarish (structured JSON)
  - Receipt data: do'kon nomi, manzil, cashier, sana/vaqt, items (name, qty, price), subtotal, discount, tax, total, payment method, fiscal_status
  - Keyinroq ESC/POS binary format ham (Tauri POS uchun)
  - MVP da: HTML receipt template (browser print)
- **Kutilgan:** Chek print qilsa bo'ladi (browser print)

---

### ═══════════════════════════════════════
### WEEK 2 — Inventory + Low Stock + Reports
### ═══════════════════════════════════════

---

## T-021 | P0 | [BACKEND] | Inventory module — Prisma schema (stock_movements, warehouses)
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/prisma/schema.prisma`
- **Vazifa:**
  - `warehouses` jadvali: id, tenant_id, name, address, is_default, is_active, created_at
  - `stock_movements` jadvali: id, tenant_id, product_id, warehouse_id, type (IN/OUT/ADJUSTMENT/RETURN/TRANSFER), quantity (always positive, sign = type), reference_type (PURCHASE/SALE/MANUAL/DAMAGE/RETURN), reference_id, batch_number, expiry_date, cost_price, notes, user_id, created_at
  - ⚠️ stock_movements — IMMUTABLE (updated_at yo'q, delete yo'q)
  - Current stock = SUM of movements (IN = +, OUT = -)
  - `stock_snapshots` jadvali (optional, performance uchun): id, tenant_id, product_id, warehouse_id, quantity, calculated_at
  - Indexes: [tenant_id, product_id, warehouse_id], [tenant_id, created_at]
- **Kutilgan:** Inventory jadvallari DB da tayyor

---

## T-022 | P0 | [BACKEND] | Inventory module — Stock movement service + kirim/chiqim
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/inventory/`
- **Vazifa:**
  - `InventoryModule`, `InventoryService`, `InventoryController`
  - **Stock In (Kirim/Nakladnoy):** POST /inventory/stock-in — supplier dan tovar qabul qilish (items array: product_id, quantity, cost_price, batch_number, expiry_date)
  - **Stock Out (Chiqim):** POST /inventory/stock-out — zarar/yo'qotish (items + reason)
  - **Current Stock:** GET /inventory/stock — product lar ro'yxati + current quantity
  - **Stock by Product:** GET /inventory/stock/:productId — movement history
  - **Low Stock Alert:** GET /inventory/low-stock — min_stock_level dan past bo'lganlar
  - `sale.created` event listener → automatic stock deduction
  - Stock valuation: average cost method (MVP)
- **Kutilgan:** Kirim, chiqim, avtomatik savdo deduction ishlaydi

---

## T-024 | P1 | [BACKEND] | Reports module — Daily revenue, top products, basic finance
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/reports/`
- **Vazifa:**
  - `ReportsModule`, `ReportsService`, `ReportsController`
  - **Daily revenue:** GET /reports/daily-revenue?from=&to= — kunlik savdo summalari
  - **Top products:** GET /reports/top-products?from=&to=&limit= — eng ko'p sotilganlar
  - **Sales summary:** GET /reports/sales-summary?from=&to= — jami savdo, qaytarishlar, sof daromad
  - **Profit estimate:** GET /reports/profit?from=&to= — sales - COGS (avg cost) - expenses
  - **Shift report:** GET /reports/shift/:shiftId — smena hisoboti
  - Barcha reportlarda tenant_id filter MAJBURIY
- **Kutilgan:** Asosiy hisobotlar API tayyor

---

### ═══════════════════════════════════════
### WEEK 3 — Refund/Return + Audit + Security
### ═══════════════════════════════════════

---

## T-026 | P1 | [BACKEND] | Returns/Refund — service + admin PIN verification
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/sales/`
- **Vazifa:**
  - POST /orders/:id/return — qaytarish yaratish (items, reason, admin_pin)
  - Admin PIN tekshirish: faqat ADMIN yoki MANAGER roli bilan tasdiqlash
  - Cashier faqat so'rov yuboradi, ADMIN/MANAGER tasdiqlaydi
  - Return yaratishda:
    1. Original order mavjudligini tekshir
    2. Qaytarilayotgan qty <= original qty
    3. Return record yaratish
    4. `return.created` event → stock return (IN), payment reversal
  - GET /returns — qaytarishlar ro'yxati
  - Discount limit: Cashier max 5%, MANAGER max 15%, ADMIN unlimited
- **Kutilgan:** Qaytarish + fraud prevention ishlaydi

---

## T-027 | P1 | [BACKEND] | Audit log — Barcha CRUD operatsiyalar log qilinadi
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/interceptors/audit.interceptor.ts`
- **Vazifa:**
  - `audit_logs` jadvali: id, tenant_id, user_id, action (CREATE/UPDATE/DELETE/VOID/RETURN/LOGIN/SHIFT_OPEN/SHIFT_CLOSE), entity_type, entity_id, old_data (JSON), new_data (JSON), ip, user_agent, created_at
  - Global AuditInterceptor: POST/PATCH/DELETE requestlarni avtomatik log qilish
  - Sensitive operatsiyalar: refund, void, discount > 5%, shift close — alohida belgilanadi
  - GET /audit-logs — admin uchun filter (user, action, entity, date)
- **Kutilgan:** Barcha o'zgarishlar izlanadi, admin ko'ra oladi

---

---

### ═══════════════════════════════════════
### WEEK 4 — Expiry + Expenses + Deploy
### ═══════════════════════════════════════

---

## T-031 | P1 | [BACKEND] | Expiry tracking — Expiring soon report + alerts
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/inventory/`
- **Vazifa:**
  - GET /inventory/expiring?days=30 — yaroqlilik muddati 30/60/90 kun ichida tugaydigan productlar
  - Expiry data stock_movements.expiry_date dan olinadi (batch level)
  - Response: product name, barcode, batch, expiry_date, remaining_qty, days_left
  - Sort by expiry_date ASC (eng yaqin birinchi)
  - Expired items: alohida endpoint GET /inventory/expired
  - ⚠️ Kosmetika uchun expiry ENG MUHIM — bu report aniq bo'lishi shart
- **Kutilgan:** Yaroqlilik muddati bo'yicha hisobot ishlaydi

---

## T-032 | P1 | [BACKEND] | Expenses module — Simple expense tracking
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/finance/`
- **Vazifa:**
  - `expenses` jadvali: id, tenant_id, category (RENT/SALARY/DELIVERY/UTILITIES/OTHER), description, amount, date, user_id, created_at
  - `FinanceModule`, `FinanceService`, `FinanceController`
  - POST /expenses — xarajat qo'shish
  - GET /expenses — ro'yxat (filter: category, date range)
  - GET /expenses/summary?from=&to= — kategoriya bo'yicha jami
  - Profit hisoblash: revenue - COGS - expenses
- **Kutilgan:** Oddiy xarajatlarni kiritish va hisobot olsa bo'ladi

---

---

## T-035 | P1 | [BACKEND] | Ledger module — Double-entry journal (MVP — basic)
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/ledger/`
- **Vazifa:**
  - `LedgerModule`, `LedgerService` (Controller YO'Q — faqat internal)
  - Prisma schema: `journal_entries` + `ledger_lines` (CLAUDE_BACKEND.md dagi kabi)
  - `sale.created` → debit Cash/Receivable, credit Revenue
  - `payment.confirmed` → debit Cash, credit Sales
  - `return.created` → reversal entries
  - sum(debit) === sum(credit) validation MAJBURIY
  - ⚠️ IMMUTABLE — update/delete TAQIQLANGAN
- **Kutilgan:** Har savdo, to'lov, qaytarishda ledger entry avtomatik yaratiladi

---

## T-036 | P1 | [BACKEND] | Fiscal adapter — "Ready" dizayn (placeholder)
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/tax/`
- **Vazifa:**
  - `TaxModule`, `FiscalAdapterService`
  - Order da: fiscal_status field (NONE/PENDING/SENT/FAILED)
  - Placeholder adapter: hozir faqat status ni PENDING qiladi
  - Keyinroq real provider (REGOS va boshqa) adapter qo'shiladi
  - Receipt da fiscal_status ko'rsatish
  - ⚠️ Sale ni HECH QACHON block qilma fiscal fail bo'lsa
- **Kutilgan:** Fiscal dizayn tayyor, keyinroq plug-in qilsa bo'ladi

---

## T-037 | P1 | [DEVOPS] | Staging deploy — Docker + CI/CD basic
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `docker/`, `.github/workflows/`
- **Vazifa:**
  - Production-ready Dockerfile (API + Web)
  - docker-compose.staging.yml (PostgreSQL, Redis, API, Web)
  - GitHub Actions: lint → type-check → test → build → deploy
  - Environment variables management (.env.staging)
  - Basic health check endpoint
  - SSL/HTTPS setup
- **Kutilgan:** Staging server da ishlaydi, auto-deploy PR merge dan keyin

---

## T-039 | P0 | [BACKEND] | Domain events setup — EventEmitter2 integration
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/events/`
- **Vazifa:**
  - NestJS EventEmitter2 integratsiya
  - Events: `sale.created`, `payment.confirmed`, `return.created`, `stock.low`, `shift.opened`, `shift.closed`
  - EventLogService: barcha eventlarni `event_log` jadvaliga yozish (immutable)
  - Event handler pattern: CLAUDE_BACKEND.md dagi kabi
  - Sale → Inventory deduction, Ledger entry, Fiscal queue avtomatik
- **Kutilgan:** Modul aro aloqa event-driven ishlaydi

---

## 🟡 P1 — MUHIM (funksional xatolik / MVP+)

_(yuqoridagi T-024 — T-037 P1 tasklar ham shu kategoriyada)_

---

## 🔵 P2 — O'RTA (MVP dan keyin, Phase 2)

---

## T-040 | P2 | [BACKEND] | Telegram notifications — Low stock, shift close, suspicious refund
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/bot/`
- **Vazifa:**
  - grammY bot setup
  - Admin Telegram chat ga alert yuborish
  - Triggerlar: low stock, shift close report, refund > threshold, expired stock
  - `/report` command — bugungi savdo summary
- **Kutilgan:** Admin Telegram dan alertlar oladi

---

## T-042 | P2 | [BACKEND] | Supplier module — CRUD service
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/catalog/`
- **Vazifa:**
  - `suppliers` jadvali: id, tenant_id, name, phone, company, address, is_active
  - `product_suppliers` jadvali: product_id, supplier_id, supply_price
  - CRUD endpoints: /suppliers
- **Kutilgan:** Supplier API tayyor

---

## ⚪ P3 — PAST (Phase 2+, keyinroq)

---

# ════════════════════════════════════════════════════════════════
# PRODUCTION-READY FEATURES (Deep Analysis — T-050+)
# ════════════════════════════════════════════════════════════════

---

### ═══════════════════════════════════════
### 🔥 NASIYA (QARZ SAVDO) — ENG KRITIK!
### O'zbekiston do'konlarining 60-70% nasiyada sotadi
### Bu bo'lmasa tizim ISHLATILMAYDI
### ═══════════════════════════════════════

---

## T-050 | P0 | [BACKEND] | Customer module — Prisma schema + CRUD
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/prisma/schema.prisma`, `apps/api/src/customers/`
- **Vazifa:**
  - `customers` jadvali: id, tenant_id, name, phone (UNIQUE per tenant — O'zbekistonda asosiy identifikator), telegram_username, address, notes, debt_balance (calculated), total_purchases, visit_count, last_visit_at, debt_limit, is_blocked, created_at, updated_at, deleted_at
  - `CustomerModule`, `CustomerService`, `CustomerController`
  - POST /customers — yangi xaridor
  - GET /customers — ro'yxat (search by phone/name, filter by has_debt)
  - GET /customers/:id — profil + purchase history + debt history
  - GET /customers/phone/:phone — tezkor telefon orqali topish (POS uchun)
  - PATCH /customers/:id — tahrirlash
  - Indexes: [tenant_id, phone], [tenant_id, name]
- **Kutilgan:** Xaridorlar bazasi tayyor, telefon orqali tezkor topsa bo'ladi

---

## T-051 | P0 | [BACKEND] | Nasiya (qarz) module — Qarz yaratish + to'lash
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/customers/nasiya/`
- **Vazifa:**
  - `debts` jadvali: id, tenant_id, customer_id, order_id, amount, paid_amount, remaining, due_date, status (ACTIVE/PARTIALLY_PAID/PAID/OVERDUE/WRITTEN_OFF), notes, created_at
  - `debt_payments` jadvali: id, debt_id, tenant_id, amount, method (CASH/CARD/TRANSFER), received_by (user_id), notes, created_at
  - POST /orders — nasiya bilan savdo: payment_method = NASIYA, customer_id MAJBURIY
  - POST /debts/:id/pay — qarz to'lash (to'liq yoki qisman)
  - GET /debts — ro'yxat (filter: customer, status, overdue)
  - GET /debts/overdue — muddati o'tganlar
  - GET /debts/summary — jami qarz, overdue summa, yig'ilgan summa
  - **Qoidalar:**
    - Nasiyaga sotishda: customer.debt_limit tekshirish
    - Overdue customer ga yangi nasiya BLOCK qilish
    - debt_payment yaratishda: Ledger entry (debit Cash, credit Accounts Receivable)
    - Partial payment: eng eski qarzga birinchi (FIFO)
  - **Aging report:** GET /debts/aging — 0-30, 31-60, 61-90, 90+ kun bucketlar
- **Kutilgan:** Nasiyaga sotish, qarz to'lash, overdue tracking ishlaydi

---

## T-054 | P1 | [BACKEND] | Nasiya reminders — SMS/Telegram orqali eslatish
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/notifications/`
- **Vazifa:**
  - Due date dan 3 kun oldin: avtomatik Telegram/SMS reminder
  - Overdue bo'lganda: kunlik reminder (max 3 kun, keyin haftalik)
  - Template: "Hurmatli [ism], [do'kon] da [X] so'm qarzingiz bor. Muddati: [sana]"
  - Reminder history log
  - Tenant settings: reminder enabled/disabled, channel (SMS/Telegram/both)
- **Kutilgan:** Xaridorga avtomatik qarz eslatish yuboriladi

---

### ═══════════════════════════════════════
### 🖥️ SAAS OWNER (FOUNDER) DASHBOARD
### Barcha tenantlar ustidan monitoring
### ═══════════════════════════════════════

---

## T-055 | P0 | [BACKEND] | Super Admin auth — Cross-tenant access
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/`
- **Vazifa:**
  - `admin_users` jadvali: id, email, password_hash, name, role (SUPER_ADMIN/SUPPORT), is_active, created_at
  - Alohida login endpoint: POST /admin/auth/login
  - Super Admin JWT: tenant_id = null, role = SUPER_ADMIN
  - Cross-tenant query: TenantGuard bypass for SUPER_ADMIN
  - Barcha admin actions audit log ga yoziladi
- **Kutilgan:** SaaS owner barcha tenantlarni ko'ra oladi

---

## T-056 | P0 | [BACKEND] | Founder Dashboard API — Aggregated metrics
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/admin/`
- **Vazifa:**
  - `AdminModule`, `AdminService`, `AdminController`
  - GET /admin/tenants — barcha tenantlar ro'yxati (name, slug, created_at, status, user_count, last_activity, subscription_status)
  - GET /admin/metrics — aggregated: jami savdo bugun/hafta/oy, jami orders, active tenants, active users online
  - GET /admin/tenants/:id/sales — tenant ning savdo tarixi (real-time)
  - GET /admin/tenants/:id/errors — tenant ning error loglari
  - GET /admin/tenants/:id/health — tenant health: last sync, last sale, error count 24h, active users
  - GET /admin/errors — BARCHA tenantlardan error log (filter: tenant, severity, date)
  - GET /admin/sales/live — real-time savdo stream (WebSocket yoki SSE)
- **Kutilgan:** Founder barcha do'konlarning real-time datalarini ko'radi

---

## T-067 | P0 | [BACKEND] | Failed login lockout — Brute-force himoya
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/`
- **Vazifa:**
  - 5 muvaffaqiyatsiz urinish → 15 daqiqa lock
  - `login_attempts` jadvali: user_id, ip, success, created_at
  - Lock status: GET /auth/me da ko'rsatish
  - Admin unlock: POST /users/:id/unlock
  - Barcha failed login lar audit log ga
- **Kutilgan:** Brute-force hujumdan himoya

---

## T-068 | P0 | [BACKEND] | Admin PIN — Sensitive operatsiyalar uchun
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/`
- **Vazifa:**
  - User jadvaliga: `pin_hash` field (4-6 raqam, bcrypt)
  - PIN kerak operatsiyalar: refund, void, discount > 5%, price change, shift close, cash drawer open
  - POST /auth/verify-pin — PIN tekshirish (request body: pin, action_type)
  - Noto'g'ri PIN 3 marta → 5 daqiqa lock
  - PIN almashtirishda eski PIN kerak
- **Kutilgan:** Fraud prevention — sensitive ops faqat PIN bilan

---

## T-069 | P1 | [BACKEND] | Session management — Active sessions tracking
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/`
- **Vazifa:**
  - `sessions` jadvali: id, user_id, tenant_id, device_info, ip, last_active, created_at
  - GET /auth/sessions — foydalanuvchi ning active sessions
  - DELETE /auth/sessions/:id — sessionni tugatish
  - Max 3 concurrent session (configurable per tenant)
  - Admin: force logout any user
- **Kutilgan:** Kim qayerdan kirganini ko'rsa bo'ladi

---

## T-070 | P1 | [BACKEND] | Employee activity monitor — Fraud detection
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/reports/`
- **Vazifa:**
  - Per-cashier metrics: void count, refund count, discount total, avg transaction value
  - Suspicious patterns: 3+ void in 1 hour, refund > 20% of sales, discount > threshold
  - GET /reports/employee-activity — filter by user, date range
  - Alert trigger: suspicious activity → Telegram notification to owner
- **Kutilgan:** Xodim firibgarligi aniqlanadi

---

## T-071 | P1 | [BACKEND] | API Key auth — POS sync uchun long-lived token
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/`
- **Vazifa:**
  - `api_keys` jadvali: id, tenant_id, branch_id, key_hash, name, scopes, last_used, is_active, created_at, expires_at
  - POS-to-server sync: API key (expire qilmaydi, JWT o'rniga)
  - Scoped: faqat sync endpoints ga access
  - Revocable: admin paneldan o'chirish mumkin
  - Rate limit: per API key
- **Kutilgan:** POS offline dan serverga xavfsiz sync

---

## T-072 | P1 | [BACKEND] | Input sanitization — XSS/injection himoya
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/pipes/`
- **Vazifa:**
  - Global pipe: HTML strip from all text inputs
  - Barcode format validation (EAN-13, EAN-8, Code128, UPC-A)
  - Phone format validation (+998XXXXXXXXX)
  - Price validation: positive number, max 2 decimal
  - File upload: mimetype whitelist (image/jpeg, image/png, image/webp)
- **Kutilgan:** Barcha kiritilgan data xavfsiz

---

### ═══════════════════════════════════════
### ⚡ PERFORMANCE & SCALABILITY
### ═══════════════════════════════════════

---

## T-073 | P0 | [BACKEND] | Redis caching layer — Product catalog + stock cache
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/cache/`
- **Vazifa:**
  - NestJS CacheModule + Redis adapter
  - Cache strategiyasi:
    - Product catalog: 5 min TTL, invalidate on product update
    - Current stock levels: 1 min TTL, invalidate on stock movement
    - User sessions: until logout
    - Exchange rate: 24h TTL
  - Cache decorator: `@Cacheable(key, ttl)`
  - Cache invalidation: event-driven (product.updated → clear cache)
- **Kutilgan:** API response 3-5x tezroq (cache hit)

---

## T-074 | P0 | [BACKEND] | Database indexing — Critical query optimization
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/prisma/schema.prisma`
- **Vazifa:**
  - Composite indexes: [tenant_id, created_at] on orders, [tenant_id, barcode] on products, [tenant_id, product_id, warehouse_id] on stock_movements
  - Partial indexes: `WHERE is_active = true` on products
  - Pagination: barcha list endpoint da MAJBURIY (default 20, max 100)
  - Global interceptor: paginate qilinmagan list so'rovni reject
- **Kutilgan:** Katta data bilan ham tez ishlaydi

---

## T-075 | P1 | [BACKEND] | Stock snapshot materialization — Hourly recalculation
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/inventory/`
- **Vazifa:**
  - `@Cron('0 * * * *')` — har soat stock snapshot hisoblash
  - `stock_snapshots` jadvaliga: tenant_id, product_id, warehouse_id, quantity, calculated_at
  - Stock query: snapshot + recent movements (snapshot dan keyingilar) = current stock
  - 10x tezroq (10000+ movement bor product uchun)
- **Kutilgan:** Stock query tez, katta inventar bilan ham ishlaydi

---

## T-076 | P1 | [BACKEND] | BullMQ worker — Background job processing
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/worker/`
- **Vazifa:**
  - Queue lar: `fiscal-receipt`, `notification`, `report-generate`, `stock-snapshot`, `data-export`, `sync-process`
  - Job patterns: retry (3x, exponential), DLQ (dead letter), timeout
  - Admin UI: BullMQ Board (optional) — job status ko'rish
  - Cron jobs: stock snapshot (hourly), expiry check (daily), exchange rate (daily)
- **Kutilgan:** Background tasklar xavfsiz va kuzatiladigan tarzda ishlaydi

---

## T-077 | P1 | [BACKEND] | Response compression + rate limiting per tenant
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/`
- **Vazifa:**
  - gzip/brotli compression middleware (catalog 1000+ items uchun muhim)
  - Per-tenant rate limit: 100 req/min default, configurable per plan
  - Per-endpoint rate limit: login = 10/min, sync = 30/min, reports = 20/min
  - Graceful 429 response with Retry-After header
- **Kutilgan:** API tez va himoyalangan

---

### ═══════════════════════════════════════
### 🇺🇿 MOLIYAVIY COMPLIANCE (O'zbekiston)
### ═══════════════════════════════════════

---

## T-078 | P0 | [BACKEND] | NDS (QQS) hisoblash — 12% VAT
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/tax/`
- **Vazifa:**
  - UZ QQS: 12% standart stavka
  - Per-product tax config: taxable/exempt
  - Narx formatlar: tax-inclusive (default UZ) vs tax-exclusive
  - Tax hisoblash: order level summary (subtotal, tax_amount, total)
  - Tax report: GET /reports/tax?from=&to= — davriy QQS hisobot
- **Kutilgan:** Har savdoda QQS to'g'ri hisoblanadi

---

## T-079 | P0 | [BACKEND] | INN va STIR validatsiya — Soliq identifikator
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/`
- **Vazifa:**
  - Tenant jadvaliga: inn (9 yoki 14 raqam), stir, oked, legal_name, legal_address
  - INN format validatsiya
  - Receipt da INN chiqarish (qonuniy talab)
  - Tenant registration da INN MAJBURIY
- **Kutilgan:** Soliq ma'lumotlari to'g'ri saqlanadi va chekda ko'rinadi

---

## T-080 | P0 | [BACKEND] | UZS yaxlitlash — Tiyinsiz hisoblash
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/utils/`
- **Vazifa:**
  - UZ da amalda tiyin yo'q. Yaxlitlash: 100 yoki 1000 ga (configurable)
  - Yaxlitlash farqi ledger da alohida account ga yoziladi
  - Round function: `roundUZS(amount, precision)` — utils package da
  - Barcha narx/summa hisoblashda ishlatiladi
- **Kutilgan:** Narxlar real hayotdagi kabi yaxlitlanadi

---

## T-081 | P1 | [BACKEND] | REGOS fiskal integratsiya — Elektron chek
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/tax/fiscal/`
- **Vazifa:**
  - REGOS API adapter: receipt yuborish → fiscal_id + QR code olish
  - Queue orqali: savdo → fiscal queue → retry (3x, exponential)
  - Fail bo'lsa: savdo DAVOM etadi, fiscal_status = PENDING → retry
  - Receipt snapshot: immutable saqlanadi
  - Z-report: kunlik fiskal yakuniy hisobot
- **Kutilgan:** Soliq idorasiga elektron chek yuboriladi

---

## T-082 | P1 | [BACKEND] | Valyuta support — USD/UZS dual currency
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/currency/`
- **Vazifa:**
  - Import kosmetikalar USD da narxlanadi, UZS da sotiladi
  - `exchange_rates` jadvali: date, usd_uzs, source (CBU)
  - Cron: har kuni CBU API dan kurs olish (https://cbu.uz/oz/arkhiv-kursov-valyut/json/)
  - Product da: cost_currency (USD/UZS), auto-convert to UZS
  - Margin hisoblashda valyuta kursi hisobga olinadi
- **Kutilgan:** Import tovar narxi USD da, foyda to'g'ri hisoblanadi

---

## T-083 | P1 | [BACKEND] | Z-report — Kunlik fiskal yakuniy hisobot
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/reports/`
- **Vazifa:**
  - POST /reports/z-report — kunlik yakuniy hisobot yaratish
  - Tarkibi: jami savdo, jami QQS, jami qaytarishlar, payment method breakdown, fiscal receipt count
  - Immutable: yaratilgandan keyin o'zgartirib BO'LMAYDI
  - Sequence number: auto-increment
  - Soliq tekshiruvida talab qilinadi
- **Kutilgan:** Kunlik Z-hisobot soliq uchun tayyor

---

### ═══════════════════════════════════════
### 🔧 OPERATSION FEATURES
### ═══════════════════════════════════════

---

## T-084 | P0 | [DEVOPS] | Automated database backups — Daily to S3/MinIO
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `docker/`, `scripts/`
- **Vazifa:**
  - Kunlik pg_dump → S3/MinIO (encrypted GPG)
  - Retention: 30 kun
  - Restore test: oylik avtomatik
  - Backup notification: success/fail → Telegram
- **Kutilgan:** Data hech qachon yo'qolmaydi

---

## T-085 | P0 | [BACKEND] | Health checks — Readiness + liveness
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/health/`
- **Vazifa:**
  - GET /health/live — process alive (200)
  - GET /health/ready — DB + Redis + MinIO connected (200/503)
  - GET /health/startup — app fully initialized
  - Graceful shutdown: `enableShutdownHooks()`, in-flight request finish, DB close
- **Kutilgan:** Deploy va monitoring to'g'ri ishlaydi

---

## T-086 | P1 | [DEVOPS] | Monitoring — Prometheus + Grafana
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `docker/monitoring/`
- **Vazifa:**
  - Prometheus metrics: request latency, error rate, active connections, queue depth, DB connection pool
  - Grafana dashboard: API performance, error trends, resource usage
  - Alert rules: error rate > 5%, latency > 2s, queue depth > 100
  - Uptime monitoring: external ping → Telegram alert
- **Kutilgan:** System performance real-time ko'rinadi

---

## T-087 | P1 | [BACKEND] | Data export — CSV/Excel
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/reports/`
- **Vazifa:**
  - Har report va list: "Export" tugmasi
  - BullMQ job: generate file → S3 → download URL
  - Formats: CSV, XLSX
  - Large exports (10k+ rows): async, ready notification
  - Export history: tenant admin ko'rsa bo'ladi
- **Kutilgan:** Hisobotlarni Excel ga chiqarsa bo'ladi

---

## T-088 | P1 | [BACKEND] | Scheduled tasks (Cron) — Daily/hourly jobs
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/cron/`
- **Vazifa:**
  - @Cron tasks:
    - Hourly: stock snapshot recalculation
    - Daily 00:00: exchange rate update (CBU)
    - Daily 06:00: expiry report generation
    - Daily 08:00: nasiya reminder (due today/overdue)
    - Weekly: dead stock report
    - Monthly: subscription billing check
  - Cron log: har run audit qilinadi
- **Kutilgan:** Avtomatik kunlik/haftalik tasklar ishlaydi

---

### ═══════════════════════════════════════
### 📊 ANALYTICS & BUSINESS INTELLIGENCE
### ═══════════════════════════════════════

---

## T-089 | P1 | [BACKEND] | Sales analytics — Trend, top products, margin
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/ai/`
- **Vazifa:**
  - GET /analytics/sales-trend?period=daily|weekly|monthly — sales trend chart data
  - GET /analytics/top-products?from=&to=&limit= — eng foydali/eng ko'p sotilgan
  - GET /analytics/dead-stock?days=30|60|90 — harakatsiz tovarlar
  - GET /analytics/margin — per-product margin analysis
  - GET /analytics/abc — ABC classification (A=top 20%, B=30%, C=50%)
  - GET /analytics/cashier-performance — per-cashier metrics
  - GET /analytics/hourly-heatmap — soatlik savdo heatmap
- **Kutilgan:** Business intelligence endpointlar tayyor

---

---

### ═══════════════════════════════════════
### ⚙️ ERROR HANDLING & RESILIENCE
### ═══════════════════════════════════════

---

## T-091 | P0 | [BACKEND] | Global exception filter — Consistent error responses
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/filters/`
- **Vazifa:**
  - AllExceptionsFilter: barcha handled va unhandled errorlarni ushlash
  - Standard response format: `{ statusCode, message, error, timestamp, path, requestId }`
  - Internal details HECH QACHON client ga yuborilmaydi
  - 5xx errors → error log file + Sentry/alert
  - Prisma errors → user-friendly message (unique constraint, not found, etc.)
- **Kutilgan:** Barcha errorlar bir xil formatda, xavfsiz

---

## T-092 | P0 | [BACKEND] | Transaction safety — Prisma $transaction everywhere
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/` (barcha service lar)
- **Vazifa:**
  - Barcha multi-step write operations: `prisma.$transaction([...])` ichida
  - Order yaratish: order + items + payment + event = 1 transaction
  - Stock in: movements + snapshot update = 1 transaction
  - Nasiya: order + debt + event = 1 transaction
  - Har qanday step fail → FULL rollback
- **Kutilgan:** Data hech qachon yarim-yarti holatda qolmaydi

---

## T-093 | P1 | [BACKEND] | Circuit breaker — External service himoya
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/circuit-breaker/`
- **Vazifa:**
  - External services uchun: fiscal API, SMS gateway, payment provider, exchange rate API
  - 3 consecutive fail → circuit OPEN (30s) → half-open test → close
  - `opossum` library
  - Fallback: fiscal fail → queue, SMS fail → retry later, exchange rate fail → use cached
- **Kutilgan:** External service fail butun tizimni buzolmaydi

---

## T-094 | P1 | [BACKEND] | Dead letter queue — Failed job management
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/worker/`
- **Vazifa:**
  - BullMQ: 3 retry dan keyin → DLQ ga ko'chirish
  - Admin endpoint: GET /admin/dlq — failed jobs list
  - POST /admin/dlq/:id/retry — qayta urinish
  - DELETE /admin/dlq/:id — dismiss
  - Alert: DLQ da 10+ job → Telegram notification
- **Kutilgan:** Failed jobs kuzatiladi va boshqariladi

---

### ═══════════════════════════════════════
### 🏢 KOSMETIKA-SPECIFIC FEATURES
### ═══════════════════════════════════════

---

## T-095 | P1 | [BACKEND] | Product variants — Rang/hajm/tur
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/catalog/`
- **Vazifa:**
  - `product_variants` jadvali: id, product_id, tenant_id, name (e.g. "Qizil", "50ml"), sku, barcode, cost_price, sell_price, is_active
  - Kosmetikada: lipstick 20 ta rangda, krem 3 ta hajmda
  - Har variant o'z barcode, stock, price
  - POS da: product tanlash → variant tanlash
  - Stock: variant level da tracking
- **Kutilgan:** Kosmetika variantlari (rang, hajm) boshqariladi

---

## T-096 | P2 | [BACKEND] | Tester/sample tracking — Ochilgan tester hisobi
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/inventory/`
- **Vazifa:**
  - Tester ochish: stock_movement type = TESTER
  - Tester cost: expense sifatida hisoblanadi
  - Tester list: GET /inventory/testers — qaysi productlardan tester ochilgan
  - Monthly tester cost report
- **Kutilgan:** Tester xarajati to'g'ri hisoblanadi

---

## T-097 | P2 | [BACKEND] | Product sertifikat — Kosmetika sifat hujjati
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/catalog/`
- **Vazifa:**
  - `product_certificates` jadvali: id, product_id, cert_number, issuing_authority, issued_at, expires_at, file_url
  - Expired sertifikat → alert
  - Soliq tekshiruvida talab qilinishi mumkin
- **Kutilgan:** Sertifikat ma'lumotlari saqlanadi va kuzatiladi

---

## T-098 | P1 | [BACKEND] | Price management — Wholesale/retail + tiered
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/catalog/`
- **Vazifa:**
  - `product_prices` jadvali: id, product_id, price_type (RETAIL/WHOLESALE), min_qty, price, valid_from, valid_to
  - POS da: customer group ga qarab narx (wholesale customer → wholesale price)
  - Tiered: 1-5 dona = X, 6-10 = Y, 11+ = Z
  - Price history: narx o'zgarishi log qilinadi
  - Scheduled price: kelajakda boshlanadigan narx
- **Kutilgan:** Narxlarni moslashuvchan boshqarsa bo'ladi

---

## T-099 | P2 | [BACKEND] | Promotions engine — Discount, buy-X-get-Y
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/sales/promotions/`
- **Vazifa:**
  - `promotions` jadvali: id, tenant_id, name, type (PERCENT/FIXED/BUY_X_GET_Y/BUNDLE), rules (JSON), valid_from, valid_to, is_active
  - POS da: auto-apply matching promotions
  - Types: % chegirma, fixed summa, 2+1, happy hour (vaqtga bog'liq)
  - Stackable rules config
  - Promotion analytics: qancha ishlatildi, qancha tejaldi
- **Kutilgan:** Aksiya/chegirma tizimi ishlaydi

---

### ═══════════════════════════════════════
### 📱 MOBILE APP (Owner uchun)
### ═══════════════════════════════════════

---

---

---

## T-103 | P1 | [BACKEND] | Push notifications — Firebase + notification service
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/notifications/`
- **Vazifa:**
  - Firebase Cloud Messaging integration
  - Notification types: sale_completed, shift_changed, error_alert, low_stock, expiry_warning, large_refund, nasiya_overdue
  - Per-user notification preferences
  - `notifications` jadvali: id, user_id, type, title, body, data, is_read, created_at
  - GET /notifications — user ning notifications
  - PATCH /notifications/:id/read
- **Kutilgan:** Mobile va web da push notification ishlaydi

---

### ═══════════════════════════════════════
### 🔌 3RD PARTY INTEGRATIONS
### ═══════════════════════════════════════

---

## T-104 | P1 | [BACKEND] | Telegram bot — Owner alert va commands
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/bot/`
- **Vazifa:**
  - grammY framework setup
  - Commands: `/sales` (bugungi savdo), `/stock <barcode>` (stock check), `/debt <phone>` (qarz check), `/shift` (smena status), `/report` (kunlik hisobot)
  - Auto-alerts: low stock, expiry, large refund, system error, shift close report
  - Multi-tenant: bot tenant ga bog'lanadi (setup via web panel)
  - Message templates: O'zbek tilida
- **Kutilgan:** Do'kon egasi Telegram dan barcha ma'lumotni oladi

---

## T-105 | P1 | [BACKEND] | CBU exchange rate — Kunlik USD/UZS kurs
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/currency/`
- **Vazifa:**
  - Daily cron: https://cbu.uz/oz/arkhiv-kursov-valyut/json/ dan kurs olish
  - `exchange_rates` jadvali: date, currency_pair, rate, source
  - Fallback: API fail → oxirgi cached kurs ishlatiladi
  - GET /exchange-rates/current — hozirgi kurs
  - Product cost convert: USD cost × today rate = UZS cost
- **Kutilgan:** Import kosmetika narxi avtomatik UZS ga convert

---


## T-107 | P2 | [BACKEND] | Payme/Click integration — Online to'lov
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/payments/providers/`
- **Vazifa:**
  - Payme API adapter: createTransaction, performTransaction, checkTransaction
  - Click API adapter: prepare, complete
  - Webhook handler: payment confirmation callback
  - POS da: QR code ko'rsatish → customer telefondan to'laydi
  - Subscription billing ham Payme/Click orqali
- **Kutilgan:** Online to'lov usullari ishlaydi

---

### ═══════════════════════════════════════
### 💰 SUBSCRIPTION & BILLING (SaaS Model)
### ═══════════════════════════════════════

---

## T-108 | P1 | [BACKEND] | Subscription plans — SaaS billing
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/billing/`
- **Vazifa:**
  - `subscription_plans` jadvali: id, name, price_monthly, max_branches, max_products, max_users, features (JSON)
  - `tenant_subscriptions` jadvali: id, tenant_id, plan_id, status (TRIAL/ACTIVE/PAST_DUE/CANCELLED), started_at, expires_at, trial_ends_at
  - Plans: Free trial (14 kun) → Basic (1 filial, 1000 product, 2 user) → Pro (5 filial, unlimited, 10 user) → Enterprise
  - Usage limit middleware: product/user/branch count check
  - Grace period: to'lov fail → 3 kun (read-only mode)
- **Kutilgan:** SaaS subscription tizimi ishlaydi

---

### ═══════════════════════════════════════
### 🔧 HARDWARE INTEGRATION
### ═══════════════════════════════════════

---

---

---

### ═══════════════════════════════════════
### 🏪 MULTI-BRANCH (Filiallar)
### ═══════════════════════════════════════

---

## T-113 | P1 | [BACKEND] | Branch management — Full CRUD + permissions
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/`
- **Vazifa:**
  - Branch CRUD: GET/POST/PATCH/DELETE /branches
  - User-branch assignment: user faqat belgilangan branch(lar) ga access
  - Branch-level data isolation: orders, stock, shifts — branch_id filter
  - Default branch per user
- **Kutilgan:** Filiallar tizimi ishlaydi

---

## T-114 | P1 | [BACKEND] | Inter-branch stock transfer
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/inventory/`
- **Vazifa:**
  - `stock_transfers` jadvali: id, tenant_id, from_branch, to_branch, status (REQUESTED/APPROVED/SHIPPED/RECEIVED/CANCELLED), items, requested_by, approved_by, notes, created_at
  - Workflow: Request → Approve → Ship → Receive
  - Stock: OUT from source, IN to destination
  - In-transit stock tracking
- **Kutilgan:** Filiallar orasida tovar ko'chirsa bo'ladi

---

---

### ═══════════════════════════════════════
### P3 — KELAJAK (6+ oy)
### ═══════════════════════════════════════

---

## T-116 | P3 | [BACKEND] | Customer loyalty — Points + tiers
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Earn points (1 point/1000 UZS). Tiers: Bronze/Silver/Gold. Birthday bonus. Redeem as payment.

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
- **Vazifa:** Scheduled: kunlik savdo data → linked Google Sheet. Ko'p do'kon egalari Sheets da tahlil qiladi.

## T-124 | P3 | [IKKALASI] | Feature flags — Per-tenant feature toggle
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** `feature_flags` jadvali. Admin paneldan enable/disable: loyalty, multi-branch, fiscal, promotions. Gradual rollout.

---

## 🔌 MOBILE iOS — Backend API Talablari (2026-03-12)
> Mobile ekranlar kod ko'rib chiqildi. Quyidagi backend endpointlar KERAK.
> Mas'ul: Polat (Backend)

---

## T-138 | P0 | [BACKEND] | GET /sales/shifts/current — Stats bilan (Mobile Sales ekrani)
- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/sales/`
- **Muammo:** Mobile Sales ekrani shift kartasida `cashier nomi`, `boshlanish vaqti` va stats (TUSHUM, SONI, O'RTACHA) ko'rsatadi. Hozir MOCK data.
- **Vazifa:**
  - `GET /sales/shifts/current` response ni kengaytirish:
    ```json
    {
      "id": "...",
      "cashierName": "Azamat Akhmedov",
      "openedAt": "2026-03-12T08:30:00Z",
      "status": "OPEN",
      "stats": {
        "totalRevenue": 4200000,
        "ordersCount": 48,
        "avgOrderValue": 87500,
        "naqdAmount": 2100000,
        "kartaAmount": 1500000,
        "nasiyaAmount": 600000
      }
    }
    ```
  - Stats — faqat current shift ning orderlaridan calculated (real-time)
  - Shift yo'q bo'lsa (smena ochilmagan) → `null` qaytarish (hozir ham shunday, OK)
- **Kutilgan:** Mobile Sales ekranida shift statistikasi real data bilan ko'rinadi

---

## T-139 | P0 | [BACKEND] | GET /sales/orders — Mobile orders tarixi (filter + pagination)
- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/sales/`
- **Muammo:** Mobile Sales History ekrani orders ro'yxatini ko'rsatadi. T-014 da endpoint bor, lekin mobile `salesApi.getOrders({ from, to, page, limit })` chaqiradi.
- **Vazifa:**
  - `GET /sales/orders` query params: `from` (ISO date), `to` (ISO date), `page`, `limit`, `shiftId`
  - Response item: `{ id, orderNumber, createdAt, itemsCount, total, paymentMethod }`
  - `paymentMethod` — primary payment (NAQD/KARTA/NASIYA)
  - `from`/`to` filter: `createdAt` field bo'yicha (tenant_id filter MAJBURIY)
  - Default: bugungi kun
  - `GET /sales/orders/:id` — SaleDetailScreen uchun full order + items
- **Kutilgan:** Mobile Sales History to'g'ri tartibda, filterlangan order ro'yxatini ko'rsatadi

---

## T-140 | P0 | [BACKEND] | POST /inventory/stock-in — Mobile Kirim (nakladnoy qabul)
- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/inventory/`
- **Muammo:** Mobile Kirim ekrani placeholder. Backend `POST /inventory/stock-in` (T-022) bor, lekin mobile bilan kelishuv yo'q.
- **Vazifa:**
  - `POST /inventory/stock-in` request body:
    ```json
    {
      "supplierId": "...",
      "supplierName": "Tayyor LLC",
      "invoiceNumber": "INV-2024-001",
      "items": [
        { "productId": "...", "quantity": 50, "costPrice": 40000, "batchNumber": "B001", "expiryDate": "2027-01-01" }
      ],
      "notes": "..."
    }
    ```
  - Response: `{ id, receiptNumber, date, totalCost, itemsCount, status: "RECEIVED" }`
  - `GET /inventory/receipts?page=&limit=&from=&to=` — Kirim tarixi ro'yxati
    - Response item: `{ id, receiptNumber, date, supplierName, itemsCount, totalCost, status }`
  - `GET /inventory/receipts/:id` — detail (items bilan)
  - stock_movements da type=IN yozuv yaratiladi (T-022 bilan mos)
- **Kutilgan:** Mobile dan kirim qabul qilsa bo'ladi, kirimlar tarixi ko'rinadi

---
# ════════════════════════════════════════════════════════════════
# TOPILGAN KAMCHILIKLAR — Developer Tooling & DX (T-125+)
# ════════════════════════════════════════════════════════════════

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P0 (KRITIK)
# ══════════════════════════════════════════════════════════════

---


## T-126 | P0 | [BACKEND] | Test infrastructure — Jest setup + first tests

- **Sana:** 2026-02-28
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/jest.config.ts`, `apps/api/src/**/*.spec.ts`
- **Muammo:** Test infra hali to'liq sozlanmagan. Unit va integration testlar yo'q.
- **Kutilgan:** Jest config tayyor, namuna testlar ishlaydi, CI da run bo'ladi. Coverage 50%+.

---

## T-350 | P0 | [BACKEND] | Real estate controller — routes bo'sh

- **Sana:** 2026-03-09
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/realestate/realestate.controller.ts`
- **Muammo:** Controller `@Controller('real-estate')` deklaratsiya qilingan lekin HECH QANDAY route yo'q. Frontend UI tayyor (T-248), lekin backend 404 qaytaradi.
- **Kutilgan:** `getProperties()`, `getStats()`, `getRentalPayments()`, `getAllPayments()` endpointlari qo'shilsin

---

_(hozircha yo'q)_

---

## T-351 | P0 | [BACKEND] | Customer API — `GET /customers?search=` va `POST /customers` tekshirish

- **Sana:** 2026-03-28 (T-351: renamed from T-342 — ID conflict with Mobile Done)
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/customers/customers.controller.ts`
- **Muammo:** Mobile Nasiya ekrani `GET /customers?search=<ism>` va `POST /customers { name, phone }` endpointlarini chaqiradi. Agar bu endpointlar noto'g'ri response qaytarsa yoki yo'q bo'lsa — Nasiya ekrani `customerId` ola olmaydi va har bir nasiya yaratishda xato beradi.
- **Kutilgan:**
  - `GET /customers?search=Ali` → `[{ id: "uuid", name: "Ali", phone: "+998..." }]` (array)
  - `POST /customers { name: "Ali", phone: "+998..." }` → `{ id: "uuid", name: "Ali", phone: "+998..." }`
  - Ikkala endpoint ham JWT bilan himoyalangan bo'lsin
- **Topildi:** Mobile backend integratsiya sessiyasi (Abdulaziz, 2026-03-28)

---

## T-343 | P0 | [BACKEND] | Dashboard report endpointlari ishlamayapti — demo data ko'rsatyapti

- **Sana:** 2026-03-28
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/reports/reports.controller.ts`
- **Muammo:** Mobile Dashboard (`useDashboardData.ts`) quyidagi 3 ta endpointni chaqiradi. Ular xato bersa `try/catch` ichida demo (soxta) raqamlar ko'rsatiladi. Hozir foydalanuvchi **real bo'lmagan statistika** ko'ryapti.
- **Endpointlar:**
  ```
  GET /reports/sales-summary?from=2026-03-28&to=2026-03-28
  GET /reports/daily-revenue?from=2026-03-22&to=2026-03-28
  GET /reports/top-products?from=2026-03-28&to=2026-03-28&limit=5
  ```
- **Kutilgan response formatlar** (`@raos/types` dan):
  - `SalesSummary`: `{ period, orders: { count, grossRevenue, subtotal, totalDiscount, totalTax }, returns, netRevenue, paymentBreakdown }`
  - `DailyRevenue[]`: `{ date, revenue, orderCount }[]`
  - `TopProduct[]`: `{ productId, productName, totalQty, totalRevenue }[]`
- **Kutilgan:** Endpointlar to'g'ri ishlasa demo fallback avtomatik chiqib ketadi.
- **Topildi:** Mobile backend integratsiya sessiyasi (Abdulaziz, 2026-03-28)

---

## T-344 | P1 | [BACKEND] | `POST /warehouse/invoices` — `supplierName` ixtiyoriy bo'lishi kerak

- **Sana:** 2026-03-28
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/inventory/warehouse-invoice.service.ts` (DTO)
- **Muammo:** Mobile Kirim ekrani `POST /warehouse/invoices` ga `{ invoiceNumber?, items[], note? }` yuboradi — `supplierName` yuborilmaydi (foydalanuvchi har doim tashuvchi nomini bilmaydi). Agar backend DTO da `supplierName` required bo'lsa — 400/422 xato beradi.
- **Kutilgan:** `supplierName` DTO da `@IsOptional()` bo'lishi kerak. Yo'q bo'lsa `null` yoki `"Noma'lum"` default qo'yilsin.
- **Topildi:** Mobile backend integratsiya sessiyasi (Abdulaziz, 2026-03-28)

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P1 (MUHIM)
# ══════════════════════════════════════════════════════════════

---

## ~~T-335~~ | ✅ DONE | Warehouse Low-Stock sahifasi yangi mahsulotlarni ko'rsatmaydi

- **Sana:** 2026-04-05
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/src/app/(warehouse)/warehouse/low-stock/page.tsx`
- **Muammo:** `useStockLevels()` movement-based API ishlatadi — stock harakati bo'lmagan (yangi qo'shilgan) mahsulotlar ko'rinmaydi.
- **Kutilgan:** `useProducts()` ga o'tish, client-side `currentStock <= minStockLevel` filter qo'llash.

---

## ~~T-336~~ | ✅ DONE | Warehouse Suppliers — Edit/Delete funksiyasi yo'q

- **Sana:** 2026-04-05
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/src/app/(warehouse)/warehouse/suppliers/page.tsx`
- **Muammo:** Faqat "+ Qo'shish" bor. Mavjud supplierni tahrirlash yoki o'chirish mumkin emas.
- **Kutilgan:** Har supplier kartaga edit (qalam) tugmasi + `SupplierModal supplier={item}` va delete (trash) tugmasi.

---

## ~~T-337~~ | ✅ DONE | Warehouse Inventory — Mahsulot tahrirlash yo'q

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

## ~~T-338~~ | ✅ DONE | Warehouse Nakladnoy — Detail sahifasi yo'q

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

## T-345 | P0 | [DEVOPS] | CI/CD BROKEN — Lint fail, prod deploy 13+ kun ishlamayapti

- **Sana:** 2026-04-15
- **Mas'ul:** Ibrat
- **Muammo:** 2 apreldan beri barcha CI/CD pipeline FAILURE. Prod deploy bo'lmayapti. 3 ta app lint fail:
  1. `apps/mobile` — `@typescript-eslint/no-explicit-any` + `react-hooks/exhaustive-deps` rule not found
  2. `apps/web` — `next lint` deprecated Next.js 16 da, ESLint config migration kerak
  3. `apps/api` — `eslint src/` fail
- **Kutilgan:**
  - Mobile: qolgan `as any` ni fix + eslint config da `react-hooks` plugin tekshirish
  - Web: `npx @next/codemod@canary next-lint-to-eslint-cli .` migratsiya
  - API: lint xatoliklarni tuzatish
  - Pipeline yashil bo'lishi — deploy ishlashi
- **Risk:** 13+ kun prod yangilanmagan. Security fixlar deploy bo'lmagan!

---

## T-346 | P1 | [BACKEND] | feat-inventory-ui — schema.prisma dan o'chirilgan modellarni tiklash

- **Sana:** 2026-04-15
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/prisma/schema.prisma` — `ibrat/feat-inventory-ui` branch
- **Muammo:** PR da quyidagi modellar o'chirilgan:
  1. `ProductCertificate` (T-097) — `products` + `tenants` relation, `certificates` table
  2. `PriceChange` — `priceChanges` table, price history
  3. `Tenant` da: `productCertificates`, `promotions`, `telegramLinkTokens`, `settings`, `priceChanges` relation lari o'chirilgan
  4. `Customer.telegramChatId` field o'chirilgan
- **Ishlatilishi (main da):**
  - `ProductCertificate` → `catalog.service.ts` (5 ta Prisma call: CRUD + expiring certs)
  - `PriceChange` → `price-history.service.ts` (3 ta call: history, create, listRecent)
  - `TelegramLinkToken` → `notify.service.ts` (5 ta call: create, find, update)
- **Kutilgan:**
  - O'chirilgan modellar va relation larni tiklash
  - Agar o'chirish kerak bo'lsa — alohida task ochib, migration plan bilan kelish
- **Risk:** Merge bo'lsa → `PrismaClientValidationError` runtime crash. 3 ta service ishlamay qoladi.

---

## T-347 | P1 | [BACKEND] | feat-inventory-ui PR — apps/mobile/ ajratib alohida PR ochish

- **Sana:** 2026-04-15
- **Mas'ul:** Ibrat
- **Muammo:** `ibrat/feat-inventory-ui` branchida `apps/web/` + `apps/api/` + `apps/mobile/` (20 fayl) aralashgan. `ibrat/feat-mobile-app` da ham `apps/mobile-owner/` (2 fayl). PR qoidasi: bir PR = bir zona.
- **Kutilgan:**
  - `apps/mobile/` o'zgarishlarini alohida branch ga ko'chirish
  - `apps/mobile-owner/` ham alohida
  - `feat-inventory-ui` da faqat `apps/web/` + `apps/api/` qolsin
  - `feat-ui-overhaul-searchable-dropdown` stale branch — o'chirish
- **Qoida:** Har yangi PR ochishdan oldin `git diff main --name-only` bilan zonalarni tekshirish

---

## T-348 | P1 | [BACKEND] | Ibrat — 3 ta stale branch tozalash

- **Sana:** 2026-04-15
- **Mas'ul:** Ibrat
- **Fayl:** remote branches
- **Muammo:** 3 ta remote branch ochiq:
  1. `ibrat/feat-inventory-ui` — T-346, T-347 hal bo'lgach merge yoki close
  2. `ibrat/feat-mobile-app` — `feat-inventory-ui` bilan deyarli bir xil, cleanup kerak
  3. `ibrat/feat-ui-overhaul-searchable-dropdown` — allaqachon merge bo'lgan, o'chirish kerak

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P3 (KELAJAK, 6+ oy)
# ══════════════════════════════════════════════════════════════

---

