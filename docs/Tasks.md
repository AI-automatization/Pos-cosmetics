# RAOS — OCHIQ VAZIFALAR (Kosmetika POS MVP)
# Yangilangan: 2026-03-15 (Ibrat — T-226..T-228: mobile-owner↔backend full integration)
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


### ═══════════════════════════════════════
### WEEK 2 — Inventory + Low Stock + Reports
### ═══════════════════════════════════════

---



### ═══════════════════════════════════════
### WEEK 3 — Refund/Return + Audit + Security
### ═══════════════════════════════════════

---


---

### ═══════════════════════════════════════
### WEEK 4 — Expiry + Expenses + Deploy
### ═══════════════════════════════════════

---


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


## 🟡 P1 — MUHIM (funksional xatolik / MVP+)

_(yuqoridagi T-024 — T-037 P1 tasklar ham shu kategoriyada)_

---

## 🔵 P2 — O'RTA (MVP dan keyin, Phase 2)

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



### ═══════════════════════════════════════
### 🖥️ SAAS OWNER (FOUNDER) DASHBOARD
### Barcha tenantlar ustidan monitoring
### ═══════════════════════════════════════

---



---


### ═══════════════════════════════════════
### 🌐 OFFLINE-FIRST ARXITEKTURA
### Internet yo'q paytda savdo davom etadi
### Internet kelganda data avtomatik sync
### ═══════════════════════════════════════

---


---

### ═══════════════════════════════════════
### 🔒 SECURITY HARDENING
### ═══════════════════════════════════════

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

# ════════════════════════════════════════════════════════════════
# TOPILGAN KAMCHILIKLAR — Developer Tooling & DX (T-125+)
# ════════════════════════════════════════════════════════════════

---

### ═══════════════════════════════════════
### 🛠️ DEVELOPER TOOLING & INFRATUZILMA
### ═══════════════════════════════════════

---

## T-125 | P0 | [BACKEND] | Swagger/OpenAPI documentation — API docs setup
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/main.ts`, `apps/api/src/**/*.dto.ts`
- **Vazifa:**
  - `@nestjs/swagger` — SwaggerModule.setup('/api/docs')
  - Barcha DTO larga `@ApiProperty()` decorator
  - Controller larga `@ApiTags()`, `@ApiBearerAuth()`, `@ApiOperation()`, `@ApiResponse()`
  - Swagger JSON export: `/api/docs-json` (frontend client generate uchun)
  - Grouping: Identity, Catalog, Sales, Inventory, Payments, Reports, Admin
  - Auth: Swagger UI da Bearer token kiritish imkoniyati
- **Kutilgan:** `/api/docs` da to'liq interaktiv API dokumentatsiya

---

## T-126 | P0 | [BACKEND] | Test infrastructure — Jest setup + first tests
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `apps/api/jest.config.ts`, `apps/api/src/**/*.spec.ts`
- **Vazifa:**
  - Jest config: `apps/api/jest.config.ts` (ts-jest, moduleNameMapper, coverage)
  - Test DB: `DATABASE_URL_TEST` in .env, test Prisma client
  - Unit test namuna: `identity.service.spec.ts` — register, login, refresh token
  - Integration test namuna: `auth.controller.spec.ts` — POST /auth/login, POST /auth/register
  - Test utilities: `createTestApp()`, `createTestUser()`, `getAuthToken()`
  - Coverage threshold: 50% minimum (boshlang'ich)
  - `pnpm --filter api test` script
- **Kutilgan:** Test infra tayyor, namuna testlar ishlaydi, CI da run bo'ladi

---

## T-127 | P1 | [BACKEND] | Database seed data — Development uchun test data
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `apps/api/prisma/seed.ts`
- **Vazifa:**
  - `prisma db seed` — development uchun sample data yaratish
  - Seed data:
    - 1 tenant (Kosmetika do'koni "Gul Kosmetika")
    - 1 owner user (admin@test.com / password123)
    - 1 cashier user (cashier@test.com / password123)
    - 1 branch (default)
    - 10 categories (Terini parvarish, Soch, Makiyaj, Atir, Tirnoq, ...)
    - 5 units (dona, quti, set, ml, gram)
    - 30+ products (har kategoriyadan, barcode, narx, min_stock bilan)
    - 5 customers (telefon, nasiya bilan)
  - Idempotent: qayta run qilsa xato bermaydi
  - package.json: `"prisma": { "seed": "ts-node prisma/seed.ts" }`
- **Kutilgan:** `pnpm --filter api db:seed` bilan tayyor test muhit

---

## T-128 | P0 | [DEVOPS] | .gitignore yangilash — Keraksiz fayllarni ignore
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `.gitignore`
- **Vazifa:**
  - `tsconfig.tsbuildinfo` — barcha apps da
  - `.claude/settings.local.json` — local Claude config
  - `logs/` — runtime log fayllar
  - `.env.local`, `.env.staging`, `.env.production`
  - `*.tsbuildinfo`
  - `apps/api/dist/`
  - `apps/web/.next/`
- **Kutilgan:** Git status da keraksiz fayllar ko'rinmaydi

---

### ═══════════════════════════════════════
### 📁 FAYL YUKLASH & MEDIA
### ═══════════════════════════════════════

---

## T-129 | P1 | [BACKEND] | File upload service — MinIO S3 integration
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/upload/`
- **Vazifa:**
  - `UploadModule`, `UploadService`
  - MinIO client: `@aws-sdk/client-s3`
  - POST /upload — single file upload (image: jpeg/png/webp, max 5MB)
  - POST /upload/bulk — multiple files (max 10)
  - Buckets: `product-images`, `receipts`, `certificates`, `exports`
  - Auto-resize: thumbnail (200px), medium (800px), original
  - Presigned URL: GET /upload/:key — vaqtinchalik download link
  - Mimetype + size validation, tenant_id folder isolation
- **Kutilgan:** Product image va fayllarni yuklash ishlaydi

---

## T-130 | P1 | [BACKEND] | Product bulk import/export — CSV/Excel
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/catalog/import/`
- **Vazifa:**
  - POST /products/import — CSV/XLSX fayldan bulk import
  - Template: GET /products/import/template — bo'sh Excel template yuklab olish
  - Import flow: upload → validate → preview (errors ko'rsatish) → confirm → save
  - Validation: barcode uniqueness, category exists, price > 0, required fields
  - Duplicate handling: barcode mavjud → update yoki skip (user tanlaydi)
  - GET /products/export — barcha productlarni Excel ga chiqarish
  - BullMQ: 500+ row → async job, tayyor bo'lganda notification
- **Kutilgan:** Do'kon ochishda 500-1000 ta productni tezkor kiritsa bo'ladi

---

## T-131 | P1 | [BACKEND] | Barcode generation — Barcodesiz product uchun
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/catalog/`
- **Vazifa:**
  - Barcode format: EAN-13 (internal), prefix: tenant-specific (e.g. 200XXXXX)
  - Auto-generate: product yaratishda barcode yo'q bo'lsa → internal barcode yaratish
  - GET /products/:id/barcode — barcode image (SVG/PNG) generate qilish
  - Batch barcode generate: POST /products/generate-barcodes — tanlangan products uchun
  - `bwip-js` library
- **Kutilgan:** Barcodesiz productlarga ham barcode berib, etiketka chop etsa bo'ladi

---

### ═══════════════════════════════════════
### ⚙️ TENANT KONFIGURATSIYA
### ═══════════════════════════════════════

---

## T-132 | P1 | [BACKEND] | Tenant settings — Configurable per-tenant sozlamalar
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/settings/`
- **Vazifa:**
  - `tenant_settings` jadvali: id, tenant_id, key, value (JSON), updated_at
  - Settings:
    - `currency` — UZS (default), USD
    - `tax_rate` — 12 (default QQS)
    - `tax_inclusive` — true/false (narxga QQS kirganmi)
    - `receipt_header` — do'kon nomi, manzil, INN, telefon
    - `receipt_footer` — "Xaridingiz uchun rahmat!"
    - `logo_url` — receipt va admin panel uchun
    - `shift_required` — savdo qilish uchun shift ochish shartmi
    - `debt_limit_default` — yangi customer uchun default nasiya limit
    - `rounding` — 100 yoki 1000 ga yaxlitlash
    - `low_stock_threshold` — default min_stock_level
  - GET /settings — tenant sozlamalari
  - PATCH /settings — yangilash (faqat ADMIN/OWNER)
  - Default values: birinchi marta o'qilganda avtomatik yaratiladi
- **Kutilgan:** Har do'kon o'zi uchun sozlama qilsa bo'ladi

---

## T-133 | P1 | [BACKEND] | Price history — Narx o'zgarishi tarixi
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/catalog/`
- **Vazifa:**
  - `price_changes` jadvali: id, tenant_id, product_id, old_cost_price, new_cost_price, old_sell_price, new_sell_price, changed_by (user_id), reason, created_at
  - Product update qilinganda narx o'zgargan bo'lsa → avtomatik log
  - GET /products/:id/price-history — narx o'zgarish tarixi
  - Margin tahlili: cost va sell price trend chart uchun data
  - ⚠️ Immutable — price_changes UPDATE/DELETE TAQIQLANGAN
- **Kutilgan:** Narx o'zgarishi izlanadi, margin trend ko'rinadi

---

### ═══════════════════════════════════════
### 🖥️ FRONTEND INFRATUZILMA
### ═══════════════════════════════════════

---

---

## T-138 | P1 | [BACKEND] | Stock levels — Snapshot dan keyin qo'shilgan mahsulotlar ko'rinmaydi

- **Sana:** 2026-03-08
- **Mas'ul:** Polat / Bekzod
- **Fayl:** `apps/api/src/inventory/inventory.service.ts` → `getStockLevels()`
- **Muammo:** `getStockLevels()` snapshot mavjud bo'lsa `stock_snapshots` + delta yondashuvi ishlatadi. Ammo snapshot DAN KEYIN qo'shilgan yangi mahsulotlar faqat `stock_movements`da bo'ladi, `stock_snapshots`da yo'q. Natijada LEFT JOIN orqali ular ko'rinmaydi.
- **Kutilgan:** Snapshot'dan keyingi yangi mahsulotlar ham `GET /api/v1/inventory/levels`da ko'rinishi kerak.
- **Taklif:** SQL'ga UNION ALL qo'shing — snapshot'da bo'lmagan, lekin `stock_movements`da (snapshot vaqtidan keyin) bo'lgan mahsulotlarni ham qo'shsin.
- **Workaround (hozircha):** `stock_snapshots` jadvali bo'sh bo'lsa, full aggregate mode ishlaydi va barcha mahsulotlar ko'rinadi.

---

## T-139 | P1 | [IKKALASI] | ibrat/feat-mobile-app → main merge va Railway deploy

- **Sana:** 2026-03-09
- **Mas'ul:** Polat (merge review) + Ibrat (mobile test after deploy)
- **Muammo:** Mobile-specific backend routes faqat `ibrat/feat-mobile-app` branchida, `main`da yo'q → Railway da 404:
  - `GET /inventory/stock` — mobile alias (safeQueryFn bilan 404 ushlanadi)
  - `GET /inventory/stock/low` — mobile alias
  - `GET /sales/quick-stats` — dashboard uchun kritik
  - `GET /sales/shifts/active` — dashboard uchun kritik
  - `GET /analytics/revenue` + `/branches/comparison` + `/insights` — analytics controller yo'q
- **Kutilgan:** PR yaratib `main`ga merge qilish → Railway auto-deploy → mobile app real data ko'radi
- **Eslatma:** Mobile app hozircha 404 larni `safeQueryFn` bilan ushlab, empty state ko'rsatadi (crash yo'q)

---

## T-140 | P1 | [BACKEND] | Real estate controller — routes bo'sh

- **Sana:** 2026-03-09
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/realestate/realestate.controller.ts`
- **Muammo:** Controller `@Controller('real-estate')` deklaratsiya qilingan lekin HECH QANDAY route yo'q. Mobile app `/real-estate/properties`, `/real-estate/stats`, `/real-estate/payments` ga murojaat qiladi — hammasi 404. `safeQueryFn` ushlab turadi.
- **Kutilgan:** `getProperties()`, `getStats()`, `getRentalPayments()`, `getAllPayments()` endpointlari qo'shilsin

---

## 📊 STATISTIKA

| Umumiy | P0 | P1 | P2 | P3 |
|--------|----|----|----|----|
| **127** | **34** | **58** | **15** | **20** |

### MVP (T-011 — T-049): 39 task
### Production Features (T-050 — T-124): 75 task
### Topilgan kamchiliklar (T-125 — T-137): 13 task

---

### Kategoriya bo'yicha

| Kategoriya | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| [BACKEND] | 20 | 38 | 8 | 7 | **73** |
| [FRONTEND] | 10 | 11 | 4 | 4 | **29** |
| [MOBILE] | — | 3 | 1 | — | **4** |
| [DEVOPS] | 3 | 2 | — | — | **5** |
| [IKKALASI] | 3 | 3 | — | 2 | **8** |
| [SECURITY] | — | — | — | — | **(guards ichida)** |

---

### Mas'uliyat taqsimoti

| Dasturchi | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| **Polat** (Backend & DevOps) | 21 | 39 | 7 | — | **67** |
| **AbdulazizYormatov** (Frontend) | 12 | 9 | 4 | — | **25** |
| **Ibrat + Abdulaziz** (Mobile) | — | 3 | 1 | — | **4** |
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

---

### ═══════════════════════════════════════
### 🔍 FRONTEND QA & DEPLOY (Ibrat — 2026-03-09)
### ═══════════════════════════════════════

---

---

### ═══════════════════════════════════════
### 🔧 OWNER MOBILE — Employee Management Backend (Ibrat — 2026-03-14)
### ═══════════════════════════════════════

---

## T-144 | P1 | [BACKEND] | Employee full CRUD endpointlari (Owner Mobile uchun)

- **Sana:** 2026-03-14
- **Mas'ul:** Polat (Backend)
- **Fayl:** `apps/api/src/employees/employees.controller.ts`
- **Muammo:** Owner mobile app uchun xodimlarni boshqarish API yo'q
- **Kerakli endpointlar:**
  ```
  GET    /employees                        → Employee[]  (branch_id filter)
  GET    /employees/:id                    → Employee (full bio profile)
  POST   /employees                        → create employee + login + password
  PATCH  /employees/:id/status             → { status: 'active'|'inactive'|'fired' }
  PATCH  /employees/:id/pos-access         → { hasPosAccess: boolean }
  DELETE /employees/:id                    → delete employee permanently
  GET    /employees/:id/performance        → EmployeePerformance (exists — verify)
  GET    /employees/:id/suspicious-activity → SuspiciousActivityAlert[]
  ```
- **Employee model yangi fieldlar:**
  ```
  firstName, lastName, fullName, phone, email
  dateOfBirth, passportId, address, hireDate
  role: 'cashier'|'manager'|'admin'
  status: 'active'|'inactive'|'fired'
  login (unique), passwordHash
  hasPosAccess, hasAdminAccess, hasReportsAccess (boolean)
  emergencyContactName, emergencyContactPhone
  photoUrl (nullable)
  ```
- **Kutilgan:** Owner `/employees` CRUD orqali xodim qo'sha, statusini o'zgartira, o'chira oladi

---

## T-145 | P1 | [BACKEND] | Login orqali auth — Employee va Admin uchun

- **Sana:** 2026-03-14
- **Mas'ul:** Polat (Backend)
- **Fayl:** `apps/api/src/auth/auth.service.ts`
- **Muammo:** Xodim yaratilganda login+password beriladi, lekin u bilan login qilib bo'lmaydi
- **Vazifa:**
  - `POST /auth/login` — `{ login, password }` qabul qilsin (email OR login)
  - JWT da `hasPosAccess`, `hasAdminAccess`, `role` fieldlari bo'lsin
  - POS mobile app login: login + password → JWT (hasPosAccess check)
  - Admin web login: email + password → JWT (hasAdminAccess check)
- **Kutilgan:** Kassir o'z login/paroli bilan POS ga kira oladi; admin o'z login/paroli bilan web ga kira oladi

---

## T-146 | P2 | [BACKEND] | Employee status o'zgarishida POS token ni invalidate qilish

- **Sana:** 2026-03-14
- **Mas'ul:** Polat (Backend)
- **Fayl:** `apps/api/src/auth/auth.service.ts`, `apps/api/src/employees/employees.service.ts`
- **Muammo:** Xodim "fired" yoki POS access olinganda, uning aktiv JWT tokenlar hali ishlaydi
- **Vazifa:**
  - `updateStatus(fired)` yoki `revokePosAccess` chaqirilganda → employee refresh token larni blacklist qilish
  - Redis ga token blacklist saqlash (yoki DB da `tokenVersion` field)
  - JWT middleware: tokenVersion tekshirish
- **Kutilgan:** Ishdan chiqarilgan kassir darhol POS ga kira olmaydi (token expired → force logout)

---


## T-227 | P1 | [IKKALASI] | Integration test checklist — mobile-owner endpoints

- **Sana:** 2026-03-15
- **Mas'ul:** Ibrat (Mobile) + Bekzod (Test)
- **Vazifa:**
  - [ ] Login: `POST /auth/login` (owner@kosmetika.uz / Demo1234! / kosmetika-demo)
  - [ ] `GET /analytics/revenue` — today/week/month/year + trends
  - [ ] `GET /analytics/orders` — total, avgOrderValue, trend
  - [ ] `GET /analytics/branch-comparison` — 4 filial
  - [ ] `GET /analytics/revenue-by-branch` — 4 filial
  - [ ] `GET /analytics/sales-trend` — kunlik grafik
  - [ ] `GET /analytics/top-products` — top 10
  - [ ] `GET /shifts` — paginated list
  - [ ] `GET /shifts/summary` — total revenue, orders
  - [ ] `GET /shifts/active` — ochiq smenalar
  - [ ] `GET /shifts/:id` — smena detali
  - [ ] `GET /debts/summary` — totalDebt, overdueDebt
  - [ ] `GET /debts/aging-report` — buckets
  - [ ] `GET /debts/customers` — paginated
  - [ ] `GET /alerts` — paginated
  - [ ] `GET /alerts/unread-count`
  - [ ] `PATCH /alerts/:id/read`
  - [ ] `GET /system/health` — DB + Redis
  - [ ] `GET /system/sync-status` — filiallar
  - [ ] `GET /employees` — list
  - [ ] `GET /inventory/out-of-stock`
  - [ ] Seed data: `npx ts-node prisma/seed.ts`

---

## T-228 | P1 | [BACKEND] | Duplicate migrations — bot_settings conflict

- **Sana:** 2026-03-15
- **Mas'ul:** Polat (Backend)
- **Fayl:** `apps/api/prisma/migrations/`
- **Muammo:** Ikkita migration fayli bir xil ALTER TABLE bajaradi:
  - `20260310000001_add_bot_settings/migration.sql`
  - `20260313000001_add_bot_settings/migration.sql`
- **Xavf:** `prisma migrate deploy` birinchi marta ishlaganda `IF NOT EXISTS` tufayli muammo chiqmasligi mumkin, lekin `prisma migrate status` noto'g'ri ko'rinadi
- **Yechim:** Eski (20260310) ni o'chirib, 20260313 ni qoldirish. Yoki squash migration yaratish.

---

*docs/Tasks.md | RAOS Kosmetika POS — Full Production v2.1 | 2026-03-15*

---

## 🔴 ABDULAZIZ — FRONTEND WEB AUDIT TASKLARI (2026-03-18) — T-236..T-249

---

---

---

---

---

---

## T-241 | P2 | [IKKALASI] | packages/types — etishmayotgan shared typelar

- **Sana:** 2026-03-18
- **Mas'ul:** AbdulazizYormatov + Polat (kelishib)
- **Fayl:** `packages/types/src/`
- **Muammo:** `ProductVariant`, `Bundle`, `LoyaltyAccount`, `Promotion` typelar yo'q shared package da
- **Kutilgan:** packages/types ga qo'shish: `ProductVariant`, `Bundle`, `LoyaltyAccount`, `Promotion`

---

---

---

*docs/Tasks.md | RAOS Kosmetika POS — Full Production v2.2 | 2026-03-18 (AbdulazizYormatov audit)*
