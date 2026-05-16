# RAOS — OCHIQ VAZIFALAR (Kosmetika POS MVP)
# Yangilangan: 2026-05-16 (CASHIER QA audit: T-489..T-495 qo'shildi)
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

## T-393 | P0 | [BACKEND] | Payme provider — zaglushka o'rniga real logika

- **Sana:** 2026-05-13
- **Mas'ul:** Ibrat
- **Manba:** Team Lead audit (AbdulazizYormatov), `payme.provider.ts` to'liq tekshiruv
- **Fayl:**
  - `apps/api/src/payments/providers/payme.provider.ts`
  - `apps/api/src/payments/payments.controller.ts`
  - `apps/api/src/payments/payments.service.ts`
- **Muammo:** `handleMethod` barcha 5 ta JSON-RPC method uchun mock qaytaradi (`state: 1`, `state: 2`, `allow: true`). Real ishlamaydi:
  - Buyurtma tekshiruvi YO'Q (orderId mavjudligi, amount mosligi)
  - `CheckTransaction` har doim `state=2` qaytaradi — tranzaktsiya bo'lmagan paytda ham (firibgarlik vektori)
  - `PaymentsService` bilan bog'lanish YO'Q — Payment Intent yangilanmaydi
  - Ledger entry yaratilmaydi (double-entry buzilgan)
  - Idempotency YO'Q — `PerformTransaction` ikki marta kelsa ikki marta o'tadi
  - JSON-RPC 2.0 response da `jsonrpc: "2.0"` va `id` field YO'Q — Payme protokolni rad etadi
- **Vazifa:**
  - `PaymentsService` ni DI orqali inject qilish
  - Har method da: orderId borligi → tenantId aniqlash → amount sverka → PaymentIntent.update
  - `payment_webhook_events` jadval qo'shish (uniqueIndex `provider + external_tx_id`)
  - `PerformTransaction` da `ledgerService.recordPayment()` chaqirish
  - Response: `{ jsonrpc: '2.0', id: body.id, result: {...} }`
- **Test:** Payme sandbox test transaction — 5 ta method full flow

---

## T-394 | P0 | [SECURITY] | Click webhooks — verifySignature umuman chaqirilmaydi

- **Sana:** 2026-05-13
- **Mas'ul:** Ibrat
- **Manba:** Team Lead audit
- **Fayl:**
  - `apps/api/src/payments/payments.controller.ts:139-150`
  - `apps/api/src/payments/providers/click.provider.ts`
- **Muammo:** `clickPrepare()` va `clickComplete()` controller body ni to'g'ridan-to'g'ri `handlePrepare`/`handleComplete` ga uzatadi. `verifySignature()` HECH QAYERDA chaqirilmaydi. Soxta webhook = bepul mahsulot.
- **Vazifa:**
  - Controller da `verifySignature()` chaqirish — fail bo'lsa 401
  - `crypto.timingSafeEqual` ishlatish (timing attack)
  - `handleComplete` da error code logikasini to'g'rilash: `-1` cancelled, `-4` already paid — har biri uchun alohida response
  - PII redaction logging da (`body` da karta raqami bo'lishi mumkin)
- **Test:** noto'g'ri sign string → 401 qaytishi; to'g'ri sign + cancelled order → cancel flow

---

## T-395 | P0 | [BACKEND] | Payment webhooks — Idempotency + Ledger entries

- **Sana:** 2026-05-13
- **Mas'ul:** Ibrat
- **Manba:** Team Lead audit
- **Fayl:**
  - `apps/api/src/payments/providers/payme.provider.ts`
  - `apps/api/src/payments/providers/click.provider.ts`
  - `prisma/schema.prisma` (yangi jadval)
- **Muammo:** Webhook handler lar PaymentIntent ni yangilamaydi, ledger entries yaratmaydi, takroriy webhookni ushlab qolmaydi. Natija: pul kelmoqda, lekin DB da status YO'Q — yo'qotilgan to'lovlar, ikki marta hisoblash.
- **Vazifa:**
  - Yangi model `PaymentWebhookEvent { id, provider, externalTxId, tenantId, payload, processedAt }` — `@@unique([provider, externalTxId])`
  - Har webhook kelishida: tekshirish → mavjud bo'lsa 200 idempotent qaytish → yangi bo'lsa process qilish
  - Settle flow da `ledgerService.recordPayment(tenantId, paymentIntentId)` — double-entry (Cash/Bank ↔ AR)
  - Ledger immutable qoidasi: revоka faqat reversal entry orqali
- **Test:** bir xil `externalTxId` 5 marta yuborish — ledger da faqat 1 ta entry

---

## T-396 | P0 | [BACKEND] | Payment webhooks — tenant resolution orderId orqali

- **Sana:** 2026-05-13
- **Mas'ul:** Ibrat
- **Manba:** Team Lead audit
- **Fayl:**
  - `apps/api/src/payments/payments.controller.ts:121-150`
  - `apps/api/src/payments/providers/*.provider.ts`
- **Muammo:** Webhook public endpoint, `@CurrentUser('tenantId')` mavjud emas. `merchant_trans_id` (orderId) tashqaridan keladi. tenantId ni aniqlash logikasi YO'Q — multi-tenant ishlamaydi.
- **Vazifa:**
  - Webhook handler: `orderId` → `prisma.order.findUnique({ where: { id }, select: { tenantId, totalAmount } })`
  - tenantId topilmasa → reject (Payme: `-31050`, Click: error code)
  - Amount sverka: webhook'dagi summa ↔ DB dagi `totalAmount` — mos kelmasa reject
  - Topilgan tenantId orqali keyingi PaymentIntent va Ledger operatsiyalar
- **Test:** noto'g'ri orderId → reject; boshqa tenantning orderId → reject

---

## T-397 | P1 | [SECURITY] | Webhooks — rate limit + timing-safe compare

- **Sana:** 2026-05-13
- **Mas'ul:** Ibrat
- **Manba:** Team Lead audit
- **Fayl:**
  - `apps/api/src/payments/payments.controller.ts`
  - `apps/api/src/payments/providers/payme.provider.ts:61`
- **Muammo:**
  - Webhook endpointlarda `@Throttle` YO'Q — DDoS va brute-force vektori
  - Payme `verifyWebhook` `===` ishlatadi (timing attack)
  - `authHeader.replace('Basic ', '')` null bo'lsa TypeError → 500
  - IP logging YO'Q (forensics imkonsiz)
- **Vazifa:**
  - `@Throttle({ default: { limit: 120, ttl: 60000 } })` har 3 webhook'ga
  - `crypto.timingSafeEqual(Buffer.from(key), Buffer.from(secret))` Payme da
  - `authHeader ?? ''` to'liq guard + `startsWith('Basic ')` tekshiruvi
  - Webhook logger ga `req.ip` va `req.headers['x-request-id']` qo'shish
- **Test:** 121 ta request/min → 429; bo'sh auth header → 401 (TypeError emas)

---

## T-387 | P0 | [SECURITY] | Super Admin panel — hardening (DEPLOY BLOKER)

- **Sana:** 2026-04-24
- **Mas'ul:** Ibrat
- **Manba:** Team Lead audit (AbdulazizYormatov), merge 018de20..6e4bad7
- **Fayl:**
  - `apps/api/src/admin/admin-database.service.ts`
  - `apps/api/src/admin/admin-auth.controller.ts`
  - `apps/super-admin/src/api/client.ts`
  - `apps/super-admin/src/app/login/page.tsx`
- **Muammo:** Super Admin panelida 4 ta kritik xavfsizlik teshigi — prod ga deploy qilinmasin.
- **Vazifa:**
  1. **SQL console whitelist + audit log** (`admin-database.service.ts:390-438`):
     - Regex bilan bloklash: `DROP|TRUNCATE|ALTER SCHEMA|DELETE FROM <t>(?!.*WHERE)`
     - Destructive SQL uchun `x-confirm-destructive: yes` header talab qilish
     - Yangi `admin_audit_log` jadvali yaratish (immutable) — har SQL query + adminId + timestamp yozilishi shart
     - `$queryRawUnsafe` o'rniga `;` belgisini o'rta qatorda man qilish (multi-statement bloklash)
  2. **JWT localStorage → httpOnly cookie** (`super-admin/src/api/client.ts:13-17`, `app/login/page.tsx:56-58`):
     - accessToken'ni `httpOnly; Secure; SameSite=Strict` cookie'ga ko'chirish
     - axios: `withCredentials: true`
     - Middleware faqat server cookie'dan o'qisin (client-set `session_active` bekor qilinsin)
  3. **DLQ endpoints — JwtAuthGuard qo'shish** (`admin-auth.controller.ts:310-348`):
     - 4 ta endpoint'da `@UseGuards(SuperAdminGuard)` → `@UseGuards(JwtAuthGuard, SuperAdminGuard)`
  4. **Rate-limit `/admin/auth/login` + `/admin/auth/bootstrap`** (`admin-auth.controller.ts:42-67`):
     - `@Throttle({ default: { limit: 5, ttl: 60_000 } })`
     - `IpBlockService.recordFailed()` integratsiya
     - `bootstrap` endpoint'iga IP logging qo'shish
- **Kutilgan:** Prod ga super-admin deploy qilinishi mumkin bo'ladi. Barcha 4 qator audit trail orqali kuzatiladi.

---

## T-388 | P0 | [BACKEND] | Fiscal worker — tenantId + retry + idempotency

- **Sana:** 2026-04-24
- **Mas'ul:** Ibrat
- **Manba:** Team Lead backend review, merge 018de20..6e4bad7
- **Fayl:**
  - `apps/worker/src/workers/fiscal.worker.ts`
  - `apps/api/src/sales/sales.service.ts` (sale.created listener qismi)
- **Muammo:** Fiscal worker refactor'da 3 ta kritik xato — cross-tenant write, noto'g'ri FAILED status, idempotency yo'q.
- **Vazifa:**
  1. **tenantId without in `order.update`** (`fiscal.worker.ts:138-141`):
     - `prisma.order.update({ where: { id: orderId } })` → `updateMany({ where: { id: orderId, tenantId } })`
     - Cross-tenant write risk yo'qotish
  2. **`fiscalStatus='FAILED'` faqat final attempt'da** (`fiscal.worker.ts:151-159`):
     - `worker.on('failed')` ichida tekshirish: `if (job.attemptsMade >= job.opts.attempts)` — faqat shunda FAILED
     - Aks holda retry paytida status rassinxronlashadi
  3. **Retry + exponential backoff** (`createFiscalWorker`):
     - `defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }`
     - Hozir 1 attempt (BullMQ default) — CLAUDE.md fiscal retry qoidasi buzilgan
  4. **Idempotency key**:
     - `sales.service.ts` da `sale.created` event listener'ida `queue.add('fiscal', data, { jobId: \`fiscal:${orderId}\` })`
     - Double publish = 2 chek REGOS'ga — shu orqali bloklanadi
  5. **Enum filter tekshiruvi** (`fiscal.worker.ts:73`):
     - `findFirst` ga qo'shish: `AND status: 'COMPLETED', fiscalStatus: { in: ['PENDING', 'FAILED'] }`
     - REVERSED/CANCELLED sale'larga chek yuborilmasin
  6. **TypeScript build xatoligi** (`fiscal.worker.ts:116`) — **hozir tsc fail bo'lyapti**:
     - `qty: Prisma.Decimal` REGOS payload'iga `number` sifatida yuborilmoqda
     - Fix: `qty: item.qty.toNumber()` yoki `Number(item.qty)`
     - Shu bilan birga P2 eslatma: `isTaxable=false` mahsulotlar uchun `vatRate: 0` yuborish
- **Kutilgan:** Fiscal worker prod-ready — tenant isolation, to'g'ri retry, idempotent.

---

## T-389 | P0 | [IKKALASI] | Cookie namespace isolation super-admin ↔ web

- **Sana:** 2026-04-24
- **Mas'ul:** Ibrat
- **Manba:** Team Lead architecture review, merge 018de20..6e4bad7
- **Fayl:**
  - `apps/super-admin/src/middleware.ts`
  - `apps/super-admin/src/api/client.ts`
  - `apps/super-admin/src/hooks/auth/useAuth.ts`
  - `apps/super-admin/src/app/login/page.tsx`
- **Muammo:** Super-admin va web bir xil cookie/localStorage kalit ishlatadi:
  - Cookie: `session_active`, `user_role`
  - localStorage: `access_token`
  - Production'da `*.raos.uz` domen ostida deploy qilinsa → session collision, founder ↔ tenant OWNER orasida auth leak
- **Vazifa:**
  - Super-admin'ga `sa_` prefiks joriy qilish:
    - Cookie: `sa_session_active`, `sa_user_role`
    - localStorage: `sa_access_token` (T-387 bajarilgach localStorage umuman olib tashlanadi)
  - `middleware.ts` shu prefiksni o'qisin
  - `useAuth.ts`, `client.ts`, `login/page.tsx` — barcha cookie/storage operatsiyalar yangi kalitlarga o'tsin
- **Kutilgan:** Super-admin va web mustaqil auth — bir domain ostida ham collision yo'q.

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P1 (MUHIM)
# ══════════════════════════════════════════════════════════════

## T-399 | P1 | [IKKALASI] | Global i18n — Faza 2-3 (auto-translate ma'lumotlar)

- **Sana:** 2026-05-02
- **Mas'ul:** Ibrat
- **Holat:** Faza 1 DONE (2026-05-12 — ~1100+ kalit, barcha hardcoded stringlar t() orqali). Faza 2-3 ochiq.
- **Qolgan fazalar:**
  - **Faza 2** — Schema: `Product/Category/Unit` ga `name_uz, name_ru, name_en` qo'shish + migration
  - **Faza 3** — Auto-translate service (Google Translate API yoki LibreTranslate)
- **Kutilgan:** Product yaratishda auto 3-til tarjima

*(T-384, T-392 — Done.md ga ko'chirildi 2026-05-02)*

---

## T-415 | P1 | [BACKEND] | Payme/Click/Uzum — API kalitlarni olish va ulash

- **Sana:** 2026-05-12
- **Mas'ul:** AbdulazizYormatov (Team Lead — ro'yxatdan o'tish + kalitlar)
- **Holat:** KUTILMOQDA — merchant ro'yxatdan o'tish + moderatsiya
- **Vazifa:**
  - merchant.payme.uz → ro'yxatdan o'tish → PAYME_MERCHANT_ID, PAYME_SECRET_KEY
  - merchant.click.uz → ro'yxatdan o'tish → CLICK_SERVICE_ID, CLICK_MERCHANT_ID, CLICK_SECRET_KEY
  - business.uzum.uz → ro'yxatdan o'tish → UZUM kalitlar
  - Webhook URL lar sozlash (backend endpoint lar tayyor)
- **Backend tayyor:** `payme.provider.ts`, `click.provider.ts`, webhook endpoints
- **Kutilgan:** Test kalitlar olingach → .env ga qo'shish → real integratsiya ishlaydi

---

## T-416 | P1 | [BACKEND] | KKM (Kassoviy apparat) — Fiskalizatsiya integratsiyasi

- **Sana:** 2026-05-12
- **Mas'ul:** AbdulazizYormatov (qaror) + Ibrat (integratsiya)
- **Holat:** QAROR KUTILMOQDA
- **Vazifa:**
  - Virtual KKM tanlash: SmartFiscal (fiscal.uz) yoki my.soliq.uz
  - ECP (elektron imzo) olish: e-imzo.uz
  - Backend: `apps/api/src/fiscal/` modul yaratish — async chek yuborish, retry queue
- **Kutilgan:** Har sotuv → fiscal chek → Soliq qo'mitasiga yuboriladi

---
# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P2 (O'RTA, MVP dan keyin)
# ══════════════════════════════════════════════════════════════

## T-417 | P2 | [SECURITY] | Audit topilgan o'rta masalalar

- **Sana:** 2026-05-12
- **Mas'ul:** Ibrat
- **Vazifa:**
  - MinIO default creds (`minioadmin`) fallback olib tashlash → `getOrThrow` (`upload.service.ts:38-39`)
  - Seed password `ChangeMeNow!` fallback → hard fail (`prisma/seed.ts:32`)
  - Payment webhook endpoints ga qo'shimcha rate-limit (`payments.controller.ts`)
- **Kutilgan:** O'rta xavfli muammolar yopiladi

---

## T-380 | P2 | [BACKEND+FRONTEND] | Super Admin — Billing & Monetizatsiya

- **Sana:** 2026-04-21
- **Mas'ul:** Ibrat
- **Holat:** OCHIQ (billing API hali sotib olinmagan)
- **Fayl:** `apps/api/src/admin/admin-billing.controller.ts` (yaratish kerak)
- **Kutilgan:** Admin planlarni boshqara oladi, MRR/ARR ko'ra oladi

---

## T-339 | P2 | [BACKEND] | Demo Seed — Low-stock mahsulot qo'shish (POS toast test uchun)

## T-097 | P2 | [BACKEND] | Product sertifikat — Kosmetika sifat hujjati

- **Sana:** 2026-02-26
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/catalog/`
- **Vazifa:** `product_certificates` CRUD (cert_number, issuing_authority, issued_at, expires_at, file_url).
- **Kutilgan:** Sertifikat ma'lumotlari saqlanadi va kuzatiladi

---

## T-107 | P2 | [BACKEND] | Payme/Click integratsiya — Uzum provider qo'shish

- **Sana:** 2026-02-26 (yangilangan 2026-05-12)
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/payments/providers/`
- **Holat:** Payme/Click providerlar TAYYOR. POS routing TAYYOR. Uzum provider yozish kerak.
- **Vazifa:** `uzum.provider.ts` yaratish — API kalitlar olingach
- **Kutilgan:** Uzum to'lov usuli ishlaydi

---

## T-419 | P2 | [BACKEND] | Ko'chmas mulk — POST /real-estate/properties endpoint yo'q

- **Sana:** 2026-04-29
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/realestate/realestate.controller.ts`
- **Muammo:** Backend da faqat GET endpointlar bor. `POST /real-estate/properties` yo'q — yangi mulk yaratib bo'lmaydi.
- **Kutilgan:** `POST /real-estate/properties` — name, address, type, rentAmount, area?, roi? fieldlar bilan
- **Bog'liq:** T-418 (mobile AddPropertyScreen) — backend tayyor bo'lgach faollashtiriladi

---

*(T-378, T-379 — Done.md ga ko'chirildi 2026-05-16)*

---

## ════════════════════════════════════════════════════════════════
## ✅ MOBILE-OWNER API CONTRACT (T-221..T-226) — BAJARILDI
## Mas'ul: Abdulaziz + Ibrat
## ════════════════════════════════════════════════════════════════

*(T-449, T-450, T-452 — Done.md ga ko'chirildi 2026-05-06)*

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P3 (KELAJAK, 6+ oy)
# ══════════════════════════════════════════════════════════════

*(T-447, T-448, T-451, T-453 — Done.md ga ko'chirildi)*

## T-116 | P3 | [BACKEND] | Customer loyalty — Points + tiers
- **Sana:** 2026-02-26
- **Vazifa:** Earn points (1 point/1000 UZS). Tiers: Bronze/Silver/Gold. Birthday bonus. Redeem as payment.

## T-119 | P3 | [BACKEND] | Marketplace sync — Uzum/Sello
- **Sana:** 2026-02-26
- **Vazifa:** Catalog sync, stock sync, order import. Omnichannel.

## T-120 | P3 | [BACKEND] | AI forecasting — Seasonal demand prediction
- **Sana:** 2026-02-26
- **Vazifa:** Kosmetika seasonal (sunscreen yoz, moisturizer qish, gift sets 8-Mart).

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
| **39** | **7** | **11** | **13** | **8** |

### Kategoriya bo'yicha

| Kategoriya | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| [BACKEND] | 4 | 5 | 4 | 4 | **17** |
| [SECURITY] | 2 | 1 | 1 | 0 | **4** |
| [MOBILE] | 0 | 4 | 7 | 3 | **14** |
| [IKKALASI] | 1 | 1 | 0 | 1 | **3** |
| [BACKEND+FRONTEND] | 0 | 0 | 1 | 0 | **1** |

### Mas'uliyat taqsimoti

| Dasturchi | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| **Ibrat** (Full-Stack) | 7 | 5 | 6 | 0 | **18** |
| **Abdulaziz** (Mobile) | 0 | 4 | 7 | 3 | **14** |
| **AbdulazizYormatov** (Team Lead) | 0 | 2 | 0 | 0 | **2** |
| **Belgilanmagan** | 0 | 0 | 0 | 5 | **5** |

> Yangilandi: 2026-05-16 — CASHIER ROL UI AUDIT (T-489..T-495) BAJARILDI. T-496, T-497 ochiq (so'rov + qabul qilish).

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

## T-458 | P1 | [BACKEND] | Audit jurnali — auditService.log() hech qayerda chaqirilmaydi, jadval bo'sh

- **Sana:** 2026-05-09
- **Mas'ul:** Ibrat (backend)
- **Fayl:** apps/api/src/audit/audit.service.ts, apps/api/src/identity/identity.service.ts, apps/api/src/sales/sales.service.ts, apps/api/src/catalog/catalog.service.ts, prisma/seed.ts
- **Muammo:** `AuditService.log()` metodi yozilgan va eksport qilingan, lekin hech qayerda chaqirilmaydi. Faqat bir joy: `AdminAuthService.impersonateTenant()` to'g'ridan-to'g'ri Prisma orqali yozadi. Natija: `audit_log` jadvali to'liq bo'sh — mobile Audit jurnali ekrani har doim "Yozuv topilmadi" ko'rsatadi.
- **Kutilgan:** Kamida quyidagi operatsiyalar audit log yozishi kerak:
  - `identity.service.ts` — login, user yaratish/o'chirish, rol o'zgartirish
  - `sales.service.ts` — order yaratish, return
  - `catalog.service.ts` — mahsulot yaratish/o'chirish/tahrirlash
  - `prisma/seed.ts` — demo uchun kamida 20-30 ta audit log record
- **Topildi:** Mobile Audit jurnali ekrani bo'sh — 2026-05-09

---

## T-459 | P1 | [BACKEND] | Order yaratishda shiftId auto-assign — shift statistikasi 0 ko'rsatadi

- **Sana:** 2026-05-09
- **Mas'ul:** Ibrat (backend)
- **Fayl:** apps/api/src/sales/order.service.ts
- **Muammo:** `createOrder()` da `shiftId` faqat DTO dan olinadi (`dto.shiftId`). Agar mobile `shiftId` yubormasa (app crash, store yo'qolishi), order `shiftId: null` bilan yaratiladi. Natija: `getShiftById()` da shift statistikasi (totalRevenue, totalOrders, avgOrderValue, totalRefunds, totalDiscounts) 0 ko'rsatadi chunki orderlar shift ga bog'lanmagan.
- **Kutilgan:** `order.service.ts` → `createOrder()` da fallback qo'shish:
  ```typescript
  let resolvedShiftId = dto.shiftId;
  if (!resolvedShiftId) {
    const currentShift = await tx.shift.findFirst({
      where: { tenantId, userId, status: 'OPEN' },
      select: { id: true },
    });
    resolvedShiftId = currentShift?.id;
  }
  ```
  Shunda `shiftId` yuborilmagan bo'lsa ham, foydalanuvchining ochiq smenasi avtomatik topiladi.
- **Mobile fix:** `apps/mobile/src/screens/Savdo/index.tsx` da `shiftId` bo'lmasa order yaratish bloklandi (Alert ko'rsatiladi). Lekin backend fallback ham kerak xavfsizlik uchun.
- **Topildi:** ShiftsOwner detail ekrani barcha statistikalar 0 — 2026-05-09

---

*(T-460..T-470 — Done.md ga ko'chirildi 2026-05-12)*

---

## T-423 | P1 | [BACKEND] | PaymentsHistoryScreen — Backend `/sales/orders` `from`/`to` sana filtrini qabul qilmaydi

- **Sana:** 2026-05-05
- **Mas'ul:** Ibrat (backend fix)
- **Fayl:** apps/api/src/sales/sales.controller.ts, apps/api/src/sales/sales.service.ts
- **Muammo:** Backend `GET /sales/orders` controlleri faqat `page`, `limit`, `shiftId` parametrlarini qabul qiladi; `from` va `to` parametrlari yo'q. `order.service.ts` `getOrders()` da `createdAt` bo'yicha filter yo'q.
- **Kutilgan:** Backend `from` va `to` query parametrlarini qabul qilib, `order.createdAt` bo'yicha filtrlashi kerak.
- **Mobile holat:** ✅ Client-side sana filtri qo'shildi (2026-05-12) — davr tugmalari ishlaydi. Backend fix ham kerak (katta hajmda client-side filter sekin bo'ladi).
- **Topildi:** Manual Code Review — 2026-05-05

---

## ════════════════════════════════════════════════════════════════
## ✅ MOBILE WAREHOUSE GAPLAR (T-471..T-480) — TO'LIQ BAJARILDI 2026-05-16
## Barcha 10 ta task Done.md ga ko'chirildi (T-477 Label Print — P3, kelajak)
## Mas'ul: Abdulaziz
## ════════════════════════════════════════════════════════════════

*(T-471, T-472, T-473, T-474, T-475, T-476, T-478, T-479, T-480 — Done.md ga ko'chirildi 2026-05-16)*

---

## T-477 | P3 | [MOBILE] | Label Print — Bluetooth printer orqali

- **Sana:** 2026-05-14
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Ombor/` (yangi feature kerak)
- **Muammo:** Web da inventory list da `LabelPrintModal` bor — narx yorlig'i chop etish. Mobile da yo'q. Kosmetika do'konida Bluetooth printer orqali label chop etish juda kerak.
- **Kutilgan:** Bluetooth printer bilan ulanish + mahsulot narx yorlig'ini chop etish. Avval research kerak (react-native-ble-plx yoki expo-print).

---

## ════════════════════════════════════════════════════════════════
## ✅ WAREHOUSE ROL UI AUDIT (T-481..T-488) — TO'LIQ BAJARILDI 2026-05-16
## Barcha 8 ta task Done.md ga ko'chirildi
## Mas'ul: Abdulaziz
## ════════════════════════════════════════════════════════════════

*(T-481, T-482, T-483, T-484, T-485, T-486, T-487, T-488 — Done.md ga ko'chirildi 2026-05-16)*

---

## ════════════════════════════════════════════════════════════════
## ✅ CASHIER ROL UI AUDIT (T-489..T-495) — TO'LIQ BAJARILDI 2026-05-16
## Barcha 7 ta task Done.md ga ko'chirildi
## Mas'ul: Abdulaziz
## ════════════════════════════════════════════════════════════════

*(T-489, T-490, T-491, T-492, T-493, T-494, T-495 — Done.md ga ko'chirildi 2026-05-16)*

---

*(T-496 — Done.md ga ko'chirildi 2026-05-16, T-478 da allaqachon bajarilgan)*

---

*(T-497 — Done.md ga ko'chirildi 2026-05-16)*
