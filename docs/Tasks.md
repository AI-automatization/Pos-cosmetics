# RAOS — OCHIQ VAZIFALAR (Kosmetika POS MVP)
# Yangilangan: 2026-03-09
# Format: T-XXX | Prioritet | [KAT] | Sarlavha

---

## 📌 QOIDALAR

```
1. Har topilgan bug/task → shu faylga DARHOL yoziladi
2. Sessiya boshida shu faylni O'QIB, oxirgi T-raqamdan DAVOM ettiriladi
3. Takroriy task yaratmaslik — mavjudini yangilash
4. Fix bo'lgach → shu yerdan O'CHIRISH → docs/Done.md ga KO'CHIRISH
5. Prioritet: P0=kritik, P1=muhim, P2=o'rta, P3=past
6. Kategoriya: [BACKEND], [FRONTEND], [DEVOPS], [SECURITY], [IKKALASI]
```

---

## ✅ T-122 | P1 | [BACKEND] | Eskiz.uz SMS → Telegram + Email (BAJARILDI 2026-03-09)
> Eskiz.uz to'liq olib tashlandi. Telegram Bot API (bepul) + SMTP Email fallback.
> - `sms.service.ts` o'chirildi
> - `telegram-notify.service.ts`, `email-notify.service.ts`, `notify.service.ts` yaratildi
> - Schema: `users.telegram_chat_id`, `customers.telegram_chat_id`, `telegram_link_tokens` jadvali
> - Bot: `/start <token>` deep link qo'llab-quvvatlash
> - API: `POST /notifications/telegram/link-token`, `POST /notifications/telegram/verify`
> - `nodemailer` package qo'shildi; `.env.example` yangilandi

---

## 📅 REJA: 8 haftalik FULL PRODUCTION (Kosmetika do'koni)

| Hafta | Maqsad |
|-------|--------|
| **Week 1** | Catalog + Basic POS sale + Receipt print + Shift |
| **Week 2** | Inventory movements + Low stock + Simple reports |
| **Week 3** | Refund/return + Audit log + Roles/Permissions UI |
| **Week 4** | Expiry module + Expiry report + Staging deploy |
| **Week 5** | ⭐ NASIYA (qarz) + Customer CRM + Ledger integration |
| **Week 6** | ⭐ Offline architecture + Sync engine + Resilience |
| **Week 7** | ⭐ SaaS Owner Dashboard + Security hardening |
| **Week 8** | ⭐ Mobile app + Telegram bot + Performance + Deploy |

### ⚠️ KRITIK TOPILMA: NASIYA (qarz savdo) — MVP da YO'Q edi!
> O'zbekiston do'konlarining **60-70%** nasiyada sotadi. Bu funksiya bo'lmasa tizim ishlatilmaydi.
> T-050 — T-054 DARHOL Week 1-2 ga parallel qo'shilishi kerak!

---

## 🔴 P0 — KRITIK (MVP Day 1 uchun shart)

---

### ═══════════════════════════════════════
### WEEK 1 — Catalog + POS Sale + Shift
### ═══════════════════════════════════════

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

## T-016 | P0 | [FRONTEND] | Admin Panel — Catalog UI (Products CRUD + Categories)
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/Catalog/`
- **Vazifa:**
  - Products list sahifasi: DataTable (sortable, filterable, paginated)
  - Product qo'shish/tahrirlash form: name, barcode, sku, category, cost_price, sell_price, unit, min_stock, image
  - Categories tree view + CRUD
  - Barcode search (text input, barcode scanner ready)
  - React Query hooks: useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct
  - Zod validation: productSchema, categorySchema
  - Loading skeletons, error handling, toast notifications
- **Kutilgan:** Admin paneldan mahsulot va kategoriyalarni boshqarsa bo'ladi

---

## T-017 | P0 | [FRONTEND] | POS Sale Screen — Cart + Barcode + Payment
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/POS/` (MVP da web-based POS, Tauri keyinroq)
- **Vazifa:**
  - **Layout:** Chap — product search/list + cart | O'ng — total, discount, payment
  - **Barcode scan:** input field, barcode scanner (keyboard wedge) support
  - **Cart:** product qo'shish, quantity +/-, item o'chirish, line discount
  - **Discount:** butun orderga discount (% yoki fixed)
  - **Payment panel:** Cash / Card tanlash, summa kiritish, qaytim hisoblash
  - **Split payment:** Cash + Card kombinatsiya
  - **Keyboard shortcuts:** F1=search, F5=cash, F6=card, F10=complete, Esc=cancel
  - **Receipt preview:** sotuvdan keyin chek ko'rinishi
  - Shift status bar (yuqorida): cashier nomi, shift vaqti, savdolar soni
- **Kutilgan:** Tez, keyboard-first POS sale qilsa bo'ladi

---

## T-018 | P0 | [FRONTEND] | Shift management UI — Open/Close shift
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/POS/Shift/`
- **Vazifa:**
  - Shift ochish: opening cash summasini kiritish
  - Shift yopish: closing cash, expected vs actual, notes
  - Shift report: savdolar soni, jami summa, cash/card breakdown
  - POS ekranga kirish uchun shift OPEN bo'lishi shart
- **Kutilgan:** Cashier shift ochib-yopib ishlasa bo'ladi

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

## T-020 | P0 | [FRONTEND] | Receipt print UI — Browser print + template
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/components/Receipt/`
- **Vazifa:**
  - Receipt HTML template (80mm thermal printer o'lchamida)
  - Do'kon nomi, manzil, INN, sana/vaqt
  - Items table: nomi, qty, narx, summa
  - Subtotal, discount, tax, TOTAL
  - Payment method, qaytim
  - Fiscal status (PENDING placeholder)
  - window.print() orqali chop etish
  - Auto-print option (sale complete dan keyin)
- **Kutilgan:** Thermal printer dan chek chiqadi

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

## T-023 | P0 | [FRONTEND] | Inventory UI — Stock levels + Kirim (nakladnoy)
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/Inventory/`
- **Vazifa:**
  - **Stock levels page:** DataTable — product nomi, barcode, current qty, min level, status (OK/LOW/OUT)
  - Color coding: yashil (OK), sariq (LOW), qizil (OUT OF STOCK)
  - **Kirim (Stock In) page:** Form — supplier (text), items (product select + qty + cost_price + expiry_date), notes
  - Items qo'shish: barcode scan yoki product search
  - **Chiqim (Stock Out) page:** Form — reason (DAMAGE/WRITE_OFF/OTHER), items + qty
  - **Low stock alert page:** faqat past bo'lganlar, filterable
  - Barcha sahifalar: React Query hooks, loading, error handling
- **Kutilgan:** Admin paneldan ombor boshqarsa bo'ladi

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

## T-025 | P1 | [FRONTEND] | Reports UI — Dashboard + Daily sales + Top products
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/Dashboard/`, `apps/web/src/pages/Reports/`
- **Vazifa:**
  - **Dashboard:** bugungi savdo, haftalik trend chart, top 5 product, low stock alerts
  - **Daily revenue page:** date range picker, bar chart (Recharts), table
  - **Top products page:** date range, list with qty + revenue
  - **Shift reports:** smena tanlash, details table
  - ResponsiveContainer charts, loading skeletons
- **Kutilgan:** Admin panelda hisobotlar ko'rinadi

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

## T-038 | P0 | [IKKALASI] | Shared types — API contract (request/response DTOs)
- **Sana:** 2026-02-26
- **Mas'ul:** Polat + AbdulazizYormatov
- **Fayl:** `packages/types/`
- **Vazifa:**
  - Product, Category, Unit types
  - Order, OrderItem, Shift types
  - PaymentIntent types
  - StockMovement types
  - Return types
  - Common: PaginatedResponse<T>, ApiError, SortOrder
  - Frontend va Backend bir xil type ishlatishi SHART
- **Kutilgan:** `packages/types` da barcha shared typelar tayyor

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

## T-041 | P2 | [FRONTEND] | Supplier management — CRUD + product linking
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/Catalog/Suppliers/`
- **Vazifa:**
  - Suppliers CRUD: name, phone, company, address
  - Product-supplier linking
  - Kirim (stock-in) da supplier tanlash
- **Kutilgan:** Yetkazib beruvchilarni boshqarsa bo'ladi

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

## T-043 | P3 | [BACKEND] | Loyalty module — Bonus points system
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Xaridor loyalty: points earn (sale), points redeem (discount). Customer card / phone number.

## T-044 | P3 | [FRONTEND] | Loyalty UI — Customer points + redeem
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** POS da customer tanlash, points ko'rsatish, points bilan to'lash.

## T-045 | P3 | [BACKEND] | Bundles/Sets — Kosmetika setlar (skincare set, gift set)
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Bundle product: bir nechta product ni bitta narxda sotish. Stock deduction har component dan.

## T-046 | P3 | [BACKEND] | Serial number tracking — Qimmat brendlar uchun
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Product variant-level serial number. Kirimda serial qo'shish, sotishda serial tanlash.

## T-047 | P3 | [IKKALASI] | Multi-branch support — Filiallar
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Branch CRUD, branch-level stock, branch-level reports, stock transfer between branches.

## T-048 | P3 | [BACKEND] | Supplier order automation — Auto-reorder
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Min stock level ga yetganda supplier ga avtomatik buyurtma (notification yoki draft order).

## T-049 | P3 | [IKKALASI] | POS Desktop — Tauri + SQLite offline-first
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Web POS → Tauri desktop app. SQLite local DB, outbox sync, ESC/POS printer. CLAUDE_FRONTEND.md dagi offline-first arxitektura.

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

## T-052 | P0 | [FRONTEND] | Nasiya UI — POS da qarzga sotish
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/POS/`
- **Vazifa:**
  - POS payment panelda "Nasiya" tugmasi (F7)
  - Nasiya tanlanganda: customer search modal (telefon orqali)
  - Customer topilmasa: tezkor yaratish (name + phone)
  - Customer debt limit va status ko'rsatish (qancha qarzi bor, limit qancha)
  - Overdue customer → qizil ogohlantirish "Bu xaridor muddati o'tgan qarzga ega!"
  - Nasiya savdo tasdiqlash → order yaratiladi + debt record
- **Kutilgan:** Kassir nasiyaga sotsa bo'ladi, customer tezkor topiladi

---

## T-053 | P0 | [FRONTEND] | Nasiya management UI — Qarzlar ro'yxati + to'lov qabul
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/Customers/`
- **Vazifa:**
  - **Customers list:** DataTable — name, phone, total debt, last visit, status
  - **Customer profile:** purchase history, debt history, to'lovlar
  - **Debt list:** DataTable — customer, amount, remaining, due_date, status, age (days)
  - Color coding: yashil (current), sariq (0-30 overdue), qizil (30+ overdue)
  - **Debt payment form:** customer tanlash → amount kiritish → method → confirm
  - **Aging report page:** 4 bucket (0-30, 31-60, 61-90, 90+), jami summalar, pie chart
  - **Dashboard widget:** "Jami nasiya: X so'm | Overdue: Y so'm"
- **Kutilgan:** Admin/manager nasiyalarni to'liq boshqarsa bo'ladi

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

## T-057 | P0 | [FRONTEND] | Founder Dashboard UI — Main monitoring panel
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/Admin/`
- **Vazifa:**
  - **Alohida layout** /admin/* — SaaS owner uchun (tenant admin paneldan farqli)
  - **Overview page:**
    - Card grid: jami tenantlar, active tenants, bugungi jami savdo, jami orders
    - Live sales ticker (so'nggi 10 ta savdo real-time)
    - Revenue chart (barcha tenantlar aggregated, daily)
    - Top 5 tenants by revenue (bar chart)
  - **Tenants list page:**
    - DataTable: name, slug, sales today, revenue today, errors 24h, last activity, status
    - Traffic light: yashil (active, no errors), sariq (active, errors), qizil (inactive > 24h)
    - Search, filter by status
  - **Tenant detail page:**
    - Savdo chart, top products, error list, active users, shift history
    - "Login as" tugmasi (impersonation)
  - **Error log page:**
    - Barcha tenantlardan centralized errors
    - Filter: tenant, type (API/client/sync), severity, date
    - Error detail: stack trace, user, request info
  - **Real-time notifications:**
    - Browser notification: yangi error, tenant down, big refund
- **Kutilgan:** Founder bitta ekrandan BARCHA do'konlarni monitoring qiladi

---

## T-058 | P1 | [BACKEND] | Tenant impersonation — "Login as" any tenant
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/admin/`
- **Vazifa:**
  - POST /admin/impersonate/:tenantId — vaqtinchalik token (1 soat, read-only option)
  - Barcha impersonation audit log ga yoziladi: who, when, which tenant
  - Impersonated session da banner: "Siz [tenant] sifatida kirgansiz"
  - Faqat SUPER_ADMIN roli
- **Kutilgan:** SaaS owner debug uchun har qanday tenant ga kirsa bo'ladi

---

## T-059 | P1 | [BACKEND] | Tenant provisioning wizard — One-click setup
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/admin/`
- **Vazifa:**
  - POST /admin/tenants/provision — yangi tenant yaratish:
    1. Tenant record
    2. Owner user (phone + temp password)
    3. Default branch
    4. Seed categories (Kosmetika: Terini parvarish, Soch, Makiyaj, Atir, Tirnoq, Tana parvarish, Aksessuarlar)
    5. Default units (dona, quti, set, ml, gram)
    6. Default settings (currency: UZS, tax: 12%, fiscal: disabled)
  - Response: tenant slug, owner credentials
- **Kutilgan:** Yangi do'konni 1 klikda tayyorlab bersa bo'ladi

---

---

## T-061 | P1 | [BACKEND] | Real-time events — WebSocket/SSE for live data
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/realtime/`
- **Vazifa:**
  - NestJS WebSocket Gateway (Socket.io)
  - Events: `sale:completed`, `error:new`, `sync:status`, `shift:changed`
  - Room-based: tenant_id room (tenant admin), `admin` room (founder)
  - JWT auth for WebSocket connections
  - Founder: barcha tenantlardan event oladi
  - Tenant admin: faqat o'z tenant eventlari
- **Kutilgan:** Real-time data update frontend da ishlaydi

---

### ═══════════════════════════════════════
### 🌐 OFFLINE-FIRST ARXITEKTURA
### Internet yo'q paytda savdo davom etadi
### Internet kelganda data avtomatik sync
### ═══════════════════════════════════════

---

## T-062 | P0 | [BACKEND] | Outbox pattern — Server-side sync endpoint
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/sync/`
- **Vazifa:**
  - `SyncModule`, `SyncService`, `SyncController`
  - POST /sync/inbound — POS dan kelgan batch data qabul qilish
    - Body: array of events [{type, payload, idempotency_key, timestamp}]
    - Har event uchun: idempotency check → process → ack
  - GET /sync/outbound?since=timestamp — server dan o'zgarishlarni olish (products, prices, categories)
  - **Idempotency:** duplicate event reject (409), already processed = skip
  - **Ordering:** sequence_number orqali tartib saqlash
  - **Batch processing:** 100 ta event bitta request da
  - **Conflict resolution:**
    - Financial (sale, payment, stock movement): event-sourcing, reject true duplicates
    - Non-financial (product name, category): last-write-wins + timestamp
- **Kutilgan:** POS offline ishlagan data serverga to'g'ri sync bo'ladi

---

## T-063 | P0 | [IKKALASI] | Sync engine package — Core offline logic
- **Sana:** 2026-02-26
- **Mas'ul:** Polat + AbdulazizYormatov
- **Fayl:** `packages/sync-engine/`
- **Vazifa:**
  - `sync_outbox` table schema (for SQLite and PostgreSQL)
  - OutboxManager: append event, process queue (FIFO), mark sent/failed
  - SyncWorker: background process, exponential backoff (1s→2s→4s→8s, max 5min)
  - ConflictResolver: strategy pattern (event-sourcing vs last-write-wins)
  - IdempotencyKeyGenerator: UUID v4 + tenant + timestamp
  - ConnectivityDetector: active ping every 30s, degrade detection (latency > 5s)
  - SyncStatus: online/offline/syncing/error states
- **Kutilgan:** Offline-first core logic tayyor, POS va server ishlatsa bo'ladi

---

## T-064 | P0 | [FRONTEND] | Sync status UI — Persistent status bar
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/components/SyncStatus/`
- **Vazifa:**
  - POS ekranda persistent status bar:
    - 🟢 "Online — synced" (hammasi yaxshi)
    - 🔵 "Online — syncing (14 pending)" (yuborilmoqda)
    - 🔴 "Offline — 47 unsynced" (internet yo'q)
    - 🟡 "Slow connection" (latency > 5s)
  - Click → pending queue details (qaysi savdolar sync bo'lmagan)
  - Auto-retry indicator
  - Last sync timestamp
- **Kutilgan:** Kassir doim sync holatini ko'radi

---

---

### ═══════════════════════════════════════
### 🔒 SECURITY HARDENING
### ═══════════════════════════════════════

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

## T-109 | P2 | [FRONTEND] | Billing UI — Plan tanlash, to'lov
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/Settings/Billing/`
- **Vazifa:**
  - Current plan info, usage stats (products used / limit)
  - Plan comparison table
  - Upgrade/downgrade flow
  - Invoice history, PDF download
  - Payment method management
- **Kutilgan:** Tenant o'z subscriptionni boshqarsa bo'ladi

---

### ═══════════════════════════════════════
### 🔧 HARDWARE INTEGRATION
### ═══════════════════════════════════════

---

## T-110 | P0 | [FRONTEND] | Thermal printer — ESC/POS integration
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/print/` (MVP: browser print, Tauri: native ESC/POS)
- **Vazifa:**
  - MVP: window.print() bilan 80mm template
  - Tauri: ESC/POS binary commands, USB va network printer
  - Auto-print on sale complete (setting)
  - Test print button
  - Common printers: Epson TM-T20, XPrinter XP-80, RONGTA RP80
- **Kutilgan:** Thermal printer dan chek chiqadi

---

---

## T-112 | P2 | [FRONTEND] | Label printer — Narx etiketka
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/print/`
- **Vazifa:**
  - Product label: name, barcode, price, expiry
  - Label sizes: 30x20mm, 40x30mm, 58x40mm
  - Batch print: selected products uchun
  - Printers: Zebra, TSC, XPrinter label
- **Kutilgan:** Narx etikekasi chop etsa bo'ladi

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

## T-117 | P3 | [FRONTEND] | Customer display — 2-ekran (ikkinchi monitor)
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** POS da ikkinchi ekran: scan qilingan tovar, running total, reklama. VFD yoki monitor.

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

## T-122 | P3 | [FRONTEND] | Custom report builder — Ad-hoc hisobotlar
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Dimension (product, category, date, branch, cashier) + metrics (revenue, qty, margin) tanlash → custom report. Excel export.

## T-123 | P3 | [FRONTEND] | Weight scale integration — Gramm bilan sotish
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** USB/Serial tarozi → og'irlik o'qish → narx hisoblash. Kamdan-kam kosmetika uchun (aralash do'konlar).

## T-124 | P3 | [IKKALASI] | Feature flags — Per-tenant feature toggle
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** `feature_flags` jadvali. Admin paneldan enable/disable: loyalty, multi-branch, fiscal, promotions. Gradual rollout.

---

## 🔌 MOBILE iOS — Backend API Talablari (2026-03-12)
> Mobile ekranlar kod ko'rib chiqildi. Quyidagi backend endpointlar KERAK.
> Mas'ul: Polat (Backend)

---

## T-134 | P0 | [BACKEND] | API URL alignment — Mobile endpoint mosligi
- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/inventory/`, `apps/api/src/customers/nasiya/`
- **Muammo:** Mobile app da ishlatilayotgan URL lar backend task larda belgilangan URL lardan farq qiladi:
  - `GET /inventory/products/:id/stock` (mobile) ≠ `GET /inventory/stock/:id` (T-022)
  - `GET /inventory/levels?lowStock=true` (mobile) ≠ `GET /inventory/low-stock` (T-022)
  - `GET /nasiya`, `POST /nasiya/:id/pay` (mobile) ≠ `GET /debts`, `POST /debts/:id/pay` (T-051)
- **Vazifa:**
  - Inventory controller da endpoint URL larni mobile bilan moslashtirish:
    - `GET /inventory/products/:productId/stock` → `ProductStockLevel[]` qaytaradi: `[{ warehouseId, warehouseName, stock, nearestExpiry }]`
    - `GET /inventory/levels?lowStock=true` → `LowStockItem[]`
  - Nasiya controller da `/nasiya` prefix ishlatish (T-051 da `/debts` o'rniga):
    - `GET /nasiya?status=&limit=&page=`
    - `GET /nasiya/overdue`
    - `GET /nasiya/:id`
    - `POST /nasiya/:id/pay`
    - `POST /nasiya/:id/remind` → Telegram/SMS reminder yuborish
  - `GET /catalog/products/barcode/:code` response ga `nearestExpiry: string | null` field qo'shish
- **Kutilgan:** Mobile app ni backend bilan moslashtirish uchun URL lar standarti aniqlangan

---

## T-135 | P0 | [BACKEND] | GET /auth/me — Tenant va branch info bilan
- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/`
- **Muammo:** Settings ekrani `user.tenant.name` ishlatadi, lekin hozirgi `/auth/me` response da tenant info yo'q
- **Vazifa:**
  - `GET /auth/me` response ni kengaytirish:
    ```json
    {
      "id": "...",
      "firstName": "...",
      "lastName": "...",
      "email": "...",
      "role": "CASHIER",
      "tenant": { "id": "...", "name": "Xurmo Cosmetics", "slug": "xurmo" },
      "branch": { "id": "...", "name": "Asosiy filial" }
    }
    ```
  - `@raos/types` da `AuthUser` type yangilanishi kerak (T-038 ga bog'liq)
- **Kutilgan:** Settings ekrani: profil ismi, email, tenant nomi to'g'ri ko'rinadi

---

## T-136 | P0 | [BACKEND] | GET /catalog/products — Mobile POS uchun product ro'yxati
- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/catalog/`
- **Muammo:** Savdo ekrani hozir MOCK data ishlatadi. `GET /catalog/products` mobile uchun optimallashtirilmagan.
- **Vazifa:**
  - `GET /catalog/products` endpointiga qo'shimcha filter va response field lar qo'shish:
    - Query params: `categoryId`, `search`, `is_active` (default: true), `page`, `limit` (default: 20)
    - Response item: `{ id, name, sellPrice, categoryId, categoryName, stockQty, minStockLevel, barcode, imageUrl }`
    - `stockQty` — real-time current stock (inventory dan calculated)
  - `GET /catalog/categories` — oddiy list: `[{ id, name, parentId }]`
  - ⚠️ `stockQty` uchun stock_movements yoki stock_snapshots dan SUM — n+1 query bo'lmasin
  - Redis cache (5 daqiqa TTL) — catalog har savdoda so'raladi
- **Kutilgan:** Savdo ekrani real mahsulotlar ko'rsatadi, qidiruv va kategori filter ishlaydi

---

## T-137 | P0 | [BACKEND] | POST /sales/orders — Mobile savdo yaratish (Naqd/Karta/Nasiya)
- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/sales/`
- **Muammo:** Mobile Savdo ekranida PaymentSheet `onConfirm` hech qanday API chaqirmaydi — backend endpoint tayyor emas yoki mobile bilan kelishuv yo'q.
- **Vazifa:**
  - `POST /sales/orders` request body:
    ```json
    {
      "items": [{ "productId": "...", "quantity": 2, "unitPrice": 85000 }],
      "paymentMethod": "NAQD | KARTA | NASIYA",
      "receivedAmount": 100000,
      "splitPayment": { "naqd": 50000, "karta": 50000 },
      "customerId": "...",
      "discountAmount": 0,
      "notes": "..."
    }
    ```
  - Response:
    ```json
    {
      "id": "...",
      "orderNumber": 10245,
      "total": 85000,
      "change": 15000,
      "status": "COMPLETED"
    }
    ```
  - **NASIYA case:** `customerId` MAJBURIY. Debt record avtomatik yaratiladi (T-051)
  - **Split payment:** `splitPayment` field da naqd + karta yig'indisi `total` ga teng bo'lishi shart
  - `shiftId` — JWT dan current shift avtomatik olinadi (cashier faqat o'z shiftida savdo qila oladi)
  - Shift OPEN emasligini tekshirish → 400 error
  - `sale.created` event emit (T-039)
- **Kutilgan:** Mobile da savdo qilganda order + payment + inventory deduction ishlaydi

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

## 📱 MOBILE iOS — Kirim Screen Davomi (2026-03-15)
> Abdulaziz tahlili: mock data → real flow. Yangi kirim yaratish + filter + API ulash.
> Mas'ul: Abdulaziz (iOS Mobile)

---

## T-141 | P1 | [MOBILE] | Kirim — Status filter tabs (Hammasi / Kutilmoqda / Qabul qilingan)
- **Sana:** 2026-03-15
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Kirim/index.tsx`
- **Vazifa:**
  - Qidiruv qatoridan keyin 3 ta tab qo'shish: `Hammasi` | `Kutilmoqda` | `Qabul qilingan`
  - Aktiv tab → `C.primary` rang, qolgan → `C.muted`
  - `filtered` useMemo ga `activeTab` filter qo'shish
  - Tab o'zgarganda FlatList yuqoriga scroll qilishi
- **Kutilgan:** Foydalanuvchi statusga qarab kirimlarni tezda filterlaydi

---

## T-142 | P1 | [MOBILE] | Kirim — `useKirimData` hook (mock → real API)
- **Sana:** 2026-03-15
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Kirim/useKirimData.ts`
- **Vazifa:**
  - `useKirimData` hook yaratish (React Query):
    ```ts
    export function useKirimData() {
      const list    = useQuery({ queryKey: ['kirim'], queryFn: () => inventoryApi.getReceipts() });
      const create  = useMutation({ mutationFn: inventoryApi.createReceipt, onSuccess: () => queryClient.invalidateQueries(['kirim']) });
      return { list, create };
    }
    ```
  - `inventory.api.ts` ga qo'shish:
    - `getReceipts(params?)` → `GET /inventory/receipts`
    - `getReceiptById(id)` → `GET /inventory/receipts/:id`
    - `createReceipt(body)` → `POST /inventory/stock-in` (T-140 backend)
  - KirimScreen ichida MOCK_RECEIPTS o'rniga `useKirimData` ishlatish
  - Loading → skeleton, Error → `<ErrorView onRetry />`
- **Kutilgan:** Screen real backend bilan ishlaydi (T-140 tayyor bo'lgach)

---

## T-143 | P0 | [MOBILE] | Kirim — Yangi kirim yaratish sheet (barcode scanner bilan)
- **Sana:** 2026-03-15
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Kirim/NewReceiptSheet.tsx`
- **Vazifa:**
  - `+ tugma` bosilganda bottom sheet ochiladi (`NewReceiptSheet`)
  - **Sheet tuzilishi:**
    1. Yetkazib beruvchi ismi (TextInput)
    2. Hujjat raqami (TextInput, ixtiyoriy)
    3. Mahsulot qo'shish — 2 usul:
       - 📷 **Barcode scan** → `CameraSection` qayta ishlatiladi (`apps/mobile/src/screens/Scanner/CameraSection.tsx`)
       - 🔍 **Qo'lda qidirish** → mahsulot nomi bo'yicha
    4. Qo'shilgan har mahsulot uchun: miqdor + tannarx + muddat (faqat `expiryTracking=true` bo'lsa)
    5. **Qabul qilish** tugmasi → `useKirimData.create.mutate(body)`
  - Validatsiya: yetkazib beruvchi bo'sh bo'lmasin, kamida 1 mahsulot
  - Muvaffaqiyatli → sheet yopiladi, ro'yxat yangilanadi
- **Kutilgan:** Cashier mobildan to'liq yangi kirim qo'sha oladi

---

## T-144 | P2 | [MOBILE] | Kirim — i18n kalitlar qo'shish
- **Sana:** 2026-03-15
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/i18n/uz.ts`, `ru.ts`, `en.ts`
- **Vazifa:**
  - `kirim` namespace ga qo'shish:
    ```ts
    kirim: {
      title: 'Kirim',
      newReceipt: 'Yangi kirim',
      supplier: 'Yetkazib beruvchi',
      docNumber: 'Hujjat raqami',
      addProduct: 'Mahsulot qo\'shish',
      scanBarcode: 'Barcode skan',
      searchProduct: 'Mahsulot qidirish',
      qty: 'Miqdor',
      costPrice: 'Tannarx',
      expiryDate: 'Muddat',
      confirm: 'Qabul qilish',
      filterAll: 'Hammasi',
      filterPending: 'Kutilmoqda',
      filterAccepted: 'Qabul qilingan',
    }
    ```
  - KirimScreen va NewReceiptSheet ichida `t('kirim.*')` ishlatish
- **Kutilgan:** UZ/RU/EN til qo'llab-quvvatlash

---

## 📱 MOBILE iOS — Nasiya Screen To'g'rilash (2026-03-15)
> Tahlil: index.tsx mock data ishlatadi, mavjud komponentlar (DebtCard.tsx, PayModal.tsx, useNasiyaData.ts) ulanmagan.
> Mas'ul: Abdulaziz (iOS Mobile)

---

## T-145 | P0 | [MOBILE] | Nasiya — index.tsx ni real API ga ulash
- **Sana:** 2026-03-15
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Nasiya/index.tsx`
- **Muammo:** `index.tsx` MOCK_DEBTS ishlatadi, inline `DebtCard` va `PaymentModal` bor lekin `DebtCard.tsx`, `PayModal.tsx`, `useNasiyaData.ts` ishlatilmayapti.
- **Vazifa:**
  - `index.tsx` dan MOCK_DEBTS, inline DebtCard, inline PaymentModal O'CHIRISH
  - `useNasiyaData(activeTab)` hook ulash
  - Mavjud `DebtCard.tsx` va `PayModal.tsx` import qilish
  - Tab kalitlarini `useNasiyaData` bilan moslashtirish: `ALL | OVERDUE | PAID`
  - Loading holat: `<LoadingSpinner />`
  - Error holat: `<ErrorView onRetry={refetchAll} />`
  - `SummaryCard` ga `totalDebt`, `overdueCount`, `overdueAmount` props uzatish
- **Kutilgan:** Screen real API (yoki demo fallback) bilan ishlaydi, To'lov bosilganda `nasiyaApi.pay()` chaqiriladi

---

## T-146 | P0 | [MOBILE] | Nasiya — FAB → Yangi nasiya sheet
- **Sana:** 2026-03-15
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Nasiya/NewDebtSheet.tsx`
- **Vazifa:**
  - FAB (`+`) bosilganda `NewDebtSheet` bottom sheet ochiladi
  - **Sheet tuzilishi:**
    1. Mijoz ismi (TextInput + qidiruv — `GET /customers?search=`)
    2. Summa (numeric TextInput)
    3. Muddat sanasi (DatePicker yoki matn input `YYYY-MM-DD`)
    4. Izoh (TextInput, ixtiyoriy)
    5. **Saqlash** tugmasi → `POST /nasiya` (nasiyaApi.create)
  - `nasiya.api.ts` ga `create` metod qo'shish:
    ```ts
    create: async (body: { customerId: string; totalAmount: number; dueDate: string; notes?: string }) => void
    ```
  - Muvaffaqiyatli → sheet yopiladi, `refetchAll()` chaqiriladi
  - Validatsiya: mijoz tanlangan, summa > 0, muddat bo'sh emas
- **Kutilgan:** Mobildan to'g'ridan yangi nasiya qo'shsa bo'ladi

---

## T-147 | P1 | [MOBILE] | Nasiya — DebtCard ga progress bar qo'shish
- **Sana:** 2026-03-15
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Nasiya/DebtCard.tsx`
- **Vazifa:**
  - Amounts qatoridan keyin progress bar qo'shish:
    ```
    [████████░░░░] 57% to'langan
    ```
  - `paidPercent = paidAmount / totalAmount * 100`
  - Progress bar rangi: OVERDUE → qizil, PARTIAL → sariq, ACTIVE → ko'k, PAID → yashil
  - Foiz matni o'ngda ko'rsatiladi
  - `View` + `StyleSheet` (tashqi kutubxona yo'q)
- **Kutilgan:** Foydalanuvchi bir qarashda qancha to'langanini ko'radi

---

## T-148 | P1 | [MOBILE] | Nasiya — To'lovlar tarixini ko'rsatish
- **Sana:** 2026-03-15
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Nasiya/DebtCard.tsx`
- **Vazifa:**
  - DebtCard bosilganda ichidagi `payments[]` ro'yxati kengayadi (expand/collapse)
  - `payments.length > 0` bo'lsa "To'lovlar tarixi (N ta)" toggle button ko'rsatiladi
  - Har payment: sana + miqdor + usul (NAQD/KARTA)
  - `DebtRecord.payments` allaqachon API dan keladi — qo'shimcha so'rov kerak emas
- **Kutilgan:** Cashier kimning qachon qancha to'laganini ko'radi

---

## T-149 | P2 | [MOBILE] | Nasiya — Telefon raqam bosilsa call qilish
- **Sana:** 2026-03-15
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Nasiya/DebtCard.tsx`
- **Vazifa:**
  - `debt.customer.phone` bosilganda `Linking.openURL('tel:+998...')` chaqiriladi
  - Telefon raqam qatoriga `📞` ikonka + underline qo'shish
  - `phone === null` bo'lsa ko'rsatilmaydi
- **Kutilgan:** Bir teginishda mijozga qo'ng'iroq qilsa bo'ladi

---

---

## 📊 STATISTIKA

| Umumiy | P0 | P1 | P2 | P3 |
|--------|----|----|----|----|
| **130** | **38** | **55** | **17** | **20** |

### MVP (T-011 — T-049): 39 task
### Production Features (T-050 — T-124): 75 task
### Mobile iOS Backend API (T-134 — T-140): 7 task
### Mobile iOS Figma Screens: ✅ HAMMASI BAJARILDI (T-125 — T-133)
### Mobile iOS Kirim Screen (T-141 — T-144): 4 task
### Mobile iOS Nasiya Screen (T-145 — T-149): 5 task

---

### Kategoriya bo'yicha

| Kategoriya | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| [BACKEND] | 18 | 32 | 8 | 7 | **65** |
| [FRONTEND] | 7 | 11 | 3 | 4 | **25** |
| [MOBILE] | — | 11 | 2 | — | **13** |
| [DEVOPS] | 2 | 2 | — | — | **4** |
| [IKKALASI] | 3 | 3 | — | 2 | **8** |
| [SECURITY] | — | — | — | — | **(guards ichida)** |

---

### Mas'uliyat taqsimoti

| Dasturchi | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| **Polat** (Backend & DevOps) | 18 | 33 | 7 | — | **58** |
| **AbdulazizYormatov** (Frontend) | 9 | 9 | 3 | — | **21** |
| **Ibrat + Abdulaziz** (Mobile) | 3 | 15 | 4 | — | **22** |
| **Birgalikda** | 3 | 3 | — | — | **6** |
| **Belgilanmagan** | — | — | 3 | 20 | **23** |

---

### ⚠️ TOPILGAN KRITIK KAMCHILIKLAR

```
1. NASIYA YO'Q EDI — O'zbekiston bozoridagi eng muhim funksiya (T-050—T-054)
2. CUSTOMER CRM YO'Q — nasiya va loyalty uchun zarur (T-050)
3. OFFLINE SYNC BO'SH — packages/sync-engine hozir export {} (T-062—T-066)
4. FRONTEND 0% — faqat default Next.js sahifa mavjud
5. DOCKER CONFIGS YO'Q — docker/ papka bo'sh (.gitkeep)
6. UZS YAXLITLASH YO'Q — real hayotda tiyin yo'q (T-080)
7. VALYUTA SUPPORT YO'Q — import kosmetika USD da narxlanadi (T-082)
8. SAAS OWNER PANEL YO'Q — founder monitoring (T-055—T-061)
```

---

### 🏆 TAVSIYA ETILGAN SPRINT TARTIBI

```
Sprint 1 (Hafta 1-2):  Prisma schema HAMMA jadvali + Catalog + Customer + Nasiya
Sprint 2 (Hafta 2-3):  Sales + Shifts + Payments — asosiy savdo loop
Sprint 3 (Hafta 3-4):  Inventory + Nasiya payments + Ledger — pul oqimi
Sprint 4 (Hafta 4-5):  Frontend POS + Receipt + Shift UI — minimal UI
Sprint 5 (Hafta 5-6):  Offline sync + IndexedDB + Outbox — real do'konga deploy
Sprint 6 (Hafta 6-7):  Reports + Audit + Expiry + Security — ishonchlilik
Sprint 7 (Hafta 7-8):  SaaS Dashboard + Subscription + Monitoring + Deploy
Sprint 8 (Hafta 8+):   Mobile app + Telegram bot + Analytics + Polish
```

---

*docs/Tasks.md | RAOS Kosmetika POS — Full Production v2.0 | 2026-03-12*
