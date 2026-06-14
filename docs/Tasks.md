# RAOS — OCHIQ VAZIFALAR (Kosmetika POS MVP)
# Yangilangan: 2026-06-04 (40 ta task bajarildi — security, SMS, import, RBAC, logging, polish)
# Format: T-XXX | Prioritet | [KAT] | Sarlavha

---

## JAMOA TUZILISHI (2026-03-23 dan)

| Ism | Roli | Zona |
|-----|------|------|
| **AbdulazizYormatov** | Team Lead | Umumiy rahbariyat |
| **Ibrat** | Full-Stack (Web + Backend + DevOps) | `apps/api/`, `apps/web/`, `apps/worker/`, `apps/bot/`, `docker/`, `prisma/` |
| **Abdulaziz** | Mobile (Android + iOS) | `apps/mobile/`, `apps/mobile-owner/` |
| **Bekzod** | PM (Project Manager) | Rejalashtirish, test, arxitektura |
| **Ziyoda** | Landing Dev (VAQTINCHALIK) | `apps/landing/` |
| **Shuhratov** | Analitik, Kontent & Marketing | `docs/competitive-analysis/`, `docs/content/`, `docs/marketing/`, `docs/outreach/` |

> Polat loyihadan chiqdi (2026-03-23). Barcha uning vazifalari Ibrat ga o'tkazildi.
> Ziyoda va Shuhratov 2026-05-19 dan qo'shildi.

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

## T-426 | P0 | [BACKEND] | OFD.uz Fiscal integratsiya — API, QR-kod, chek yuborish

- **Sana:** 2026-05-17
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/fiscal/` (yaratish kerak)
- **Muammo:** RAOS da fiscal chek yo'q. Qonun bo'yicha har sotuv = OFD ga yuborilishi SHART. Raqiblar (YesPOS, Smart) allaqachon bor. Demo da birinchi savol: "Fiskal chek chiqadimi?"
- **Vazifa:**
  - OFD.uz bilan API shartnoma (tel: 71-202-32-32 ext.2)
  - `FiscalReceipt` Prisma model (immutable snapshot)
  - `fiscal.adapter.interface.ts` — provider-agnostic
  - `ofd-uz.adapter.ts` — real implementation
  - `fiscal.worker.ts` — BullMQ processor (retry 3x, exponential backoff)
  - QR-kod generatsiya (chekda)
  - Sales hook: orderCreated → fiscal.send()
- **Kutilgan:** Har sotuv → avtomatik fiscal chek → OFD.uz → QR kod chekda
- **Muddat:** 3 hafta
- **Spec:** `docs/competitive-analysis/soliq-integration-spec.md`
- **Bog'liq:** T-416 (KKM qaror)

---

## T-436 | P0 | [DEVOPS] | Trademark "RAOS" — uzpatent.uz ro'yxatdan o'tkazish

- **Sana:** 2026-05-17
- **Mas'ul:** Bekzod (CEO) + AbdulazizYormatov (Team Lead)
- **Muammo:** "RAOS" nomi hali ro'yxatdan O'TMAGAN. Raqib olishi mumkin → nomni o'zgartirish kerak bo'ladi.
- **Vazifa:**
  - uzpatent.uz da 35-sinf (reklama, biznes) + 42-sinf (IT, SaaS) uchun ariza
  - $400-800 xarajat
  - 3-6 oy kutish
- **Kutilgan:** "RAOS" nomi himoyalangan
- **Muddat:** BUGUN ariza berish

---

*(T-393..T-397, T-387..T-389 — BAJARILDI, Done.md 2026-05-14)*

---

*(T-458, T-459 — BAJARILDI, Done.md 2026-05-20)*

*(T-478, T-479 — BAJARILDI, Done.md 2026-06-04 — Product Import PR#211 + DNS flip #207)*

*(T-480, T-481, T-482, T-483, T-473 — BAJARILDI, Done.md 2026-06-04 — Security hardening + health-check)*

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P1 (MUHIM)
# ══════════════════════════════════════════════════════════════

*(T-481, T-482, T-483 — BAJARILDI, Done.md 2026-06-04)*

---

## T-399 | P1 | [IKKALASI] | Global i18n — Faza 2-3 (auto-translate ma'lumotlar)

- **Sana:** 2026-05-02
- **Mas'ul:** Ibrat
- **Holat:** Faza 1 DONE (2026-05-12 — ~1100+ kalit, barcha hardcoded stringlar t() orqali). Faza 2-3 ochiq.
- **Qolgan fazalar:**
  - **Faza 2** — Schema: `Product/Category/Unit` ga `name_uz, name_ru, name_en` qo'shish + migration
  - **Faza 3** — Auto-translate service (Google Translate API yoki LibreTranslate)
- **Kutilgan:** Product yaratishda auto 3-til tarjima

---

## T-415 | P1 | [IKKALASI] | Payme/Click/Uzum — Owner o'zi merchant credentials kiritadi

- **Sana:** 2026-05-12 (yangilangan 2026-05-15)
- **Mas'ul:** Owner (har tenant o'zi) + Ibrat (backend/frontend)
- **Holat:** BACKEND + FRONTEND TAYYOR. Owner merchant.payme.uz / merchant.click.uz da ro'yxatdan o'tishi kerak.
- **Bajarilgan (2026-05-15):**
  - ✅ `PaymentProviderConfig` DB model (per-tenant, AES-256-GCM encrypted)
  - ✅ `EncryptionService` — credential at-rest encryption
  - ✅ `PaymentConfigController` — CRUD + verify endpoints
  - ✅ Owner Panel: Settings → To'lov usullari (Terminal / Payme / Click)
  - ✅ Per-tenant webhook routing (orderId → tenantId → credentials)
  - ✅ POS dynamic payment methods (faqat verified provayderlar ko'rinadi)
  - ✅ Strict format verification (Payme: 24 hex, Click: raqamlar)
  - ✅ i18n (uz, ru, en) — 45+ kalit
- **Qolgan:**
  - Owner merchant.payme.uz da ro'yxatdan o'tishi (1-3 kun moderatsiya)
  - Owner merchant.click.uz da ro'yxatdan o'tishi
  - Real credentials bilan end-to-end test
  - Uzum provider (`uzum.provider.ts`) — kalitlar olingach

---

## T-416 | P1 | [BACKEND] | KKM (Kassoviy apparat) — Virtual KKM sertifikati

- **Sana:** 2026-05-12 (yangilangan 2026-05-17)
- **Mas'ul:** AbdulazizYormatov (qaror) + Bekzod (ariza)
- **Holat:** T-426 bilan birlashtirildi. Texnik qism → T-426. Bu task = rasmiy sertifikat olish.
- **Vazifa:**
  - Virtual KKM sertifikati olish (Soliq qo'mitasi) — 2-6 hafta
  - ECP (elektron imzo) olish: e-imzo.uz
  - OFD.uz dan API shartnoma — T-426 ga bog'liq
- **Kutilgan:** Rasmiy ruxsatnoma qo'lda

---

*(T-427 — BAJARILDI, Done.md 2026-05-26 | raos.uz live, SEO, 3 til, Railway deploy)*

---

*(T-428 — BAJARILDI, Done.md 2026-06-04 — Billing to'liq tayyor)*

---

*(T-429 — BAJARILDI T-466 sifatida, Done.md 2026-05-20)*

---

## T-437 | P1 | [DEVOPS] | Ma'lumotlar UZ serverda — O'RQ-547 compliance

- **Sana:** 2026-05-17
- **Mas'ul:** Ibrat + AbdulazizYormatov (qaror)
- **Muammo:** Qonun bo'yicha shaxsiy ma'lumotlar (FIO, telefon) O'zbekiston serverida saqlanishi SHART. Hozir Railway (EU/US).
- **Vazifa:**
  - Yurist bilan maslahat: business data vs personal data ajratish
  - Variant A: UZ VPS (Uztelecom) faqat PD uchun + Railway logic
  - Variant B: To'liq UZ hosting (Turon Telecom / Uzbektelecom)
  - my.gov.uz — ma'lumot operatori ro'yxatiga kirish (bepul)
- **Kutilgan:** Qonunga mos hosting arxitekturasi
- **Muddat:** Qaror — 1 hafta, migration — 2-4 hafta

---

*(T-438..T-457 — BAJARILDI, Done.md 2026-05-26 | T-427 sub-tasklar)*

*(T-460, T-461, T-462, T-465 — BAJARILDI, Done.md 2026-05-20)*

---

*(T-463 — BAJARILDI, Done.md 2026-06-04 — SMS module backend)*

---

*(T-464 — BAJARILDI, Done.md 2026-06-06 — SMS Campaign Web UI)*

---

*(T-465 — BAJARILDI, Done.md 2026-05-20)*

---

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P2 (O'RTA, MVP dan keyin)
# ══════════════════════════════════════════════════════════════

*(T-417 — BAJARILDI, Done.md 2026-05-20)*

---

## T-380 | P2 | [BACKEND+FRONTEND] | Super Admin — Billing & Monetizatsiya

- **Sana:** 2026-04-21
- **Mas'ul:** Ibrat
- **Holat:** OCHIQ (billing API hali sotib olinmagan)
- **Fayl:** `apps/api/src/admin/admin-billing.controller.ts` (yaratish kerak)
- **Kutilgan:** Admin planlarni boshqara oladi, MRR/ARR ko'ra oladi

---

*(T-430 — BAJARILDI, Done.md 2026-05-20)*

---

*(T-431 — BAJARILDI T-467 sifatida, Done.md 2026-05-20)*

---

## T-432 | P2 | [BACKEND] | Product variant matrix — size/color/volume

- **Sana:** 2026-05-17
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/catalog/variants/`
- **Vazifa:**
  - `ProductVariant` model: product_id, attributes (size, color, volume), sku, barcode
  - Har variant = alohida stock (inventory tracking)
  - Admin UI: variant matritsasi (M/L/XL × Red/Blue/Black)
  - POS: variant tanlash oynasi
  - Import: CSV dan variants batch import
- **Kutilgan:** Kiyim do'konlari 1 mahsulotning 10+ variantini boshqara oladi
- **Muddat:** 2 hafta
- **Segment:** Kiyim butik (113 lead), Parfumeriya (33 lead)

---

*(T-433 — DUPLIKAT, T-453 ga birlashtirilgan)*

---

*(T-097 — BAJARILDI, Done.md 2026-06-06 — Product certificates CRUD backend + frontend)*

---

## T-107 | P2 | [BACKEND] | Payme/Click integratsiya — Uzum provider qo'shish

- **Sana:** 2026-02-26 (yangilangan 2026-05-12)
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/payments/providers/`
- **Holat:** Payme/Click providerlar TAYYOR. POS routing TAYYOR. Uzum provider yozish kerak.
- **Vazifa:** `uzum.provider.ts` yaratish — API kalitlar olingach
- **Kutilgan:** Uzum to'lov usuli ishlaydi

---

## T-378 | P2 | [MOBILE] | mobile-owner: EmployeeRole type mismatch — lowercase → UPPERCASE

- **Sana:** 2026-04-21
- **Mas'ul:** Abdulaziz
- **Kutilgan:** `POST /employees` muvaffaqiyatli ishlaydi

---

## T-379 | P2 | [MOBILE] | mobile-owner: AddEmployeeScreen — backend DTO mos emas

- **Sana:** 2026-04-21
- **Mas'ul:** Abdulaziz
- **Kutilgan:** DTO backend bilan mos, form faqat real saqlanadigan fieldlarni so'raydi

---

## ════════════════════════════════════════════════════════════════
## 🔴 MOBILE-OWNER API CONTRACT (T-221..T-226) — 2026-03-14
## apps/mobile-owner/src/config/endpoints.ts bilan TO'LIQ MOS KELISHI SHART
## Mas'ul: Abdulaziz (tekshirish) + Ibrat (backend)
## ════════════════════════════════════════════════════════════════

*(T-466, T-467 — BAJARILDI, Done.md 2026-05-20)*

---

## T-468 | P2 | [FRONTEND] | Web Admin Polish — branding, onboarding wizard, i18n

- **Sana:** 2026-05-19
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/src/`
- **Bajarilgan (2026-06-04):**
  - ✅ Sidebar: "Powered by RAOS" footer, cyan branding, logo (icon.png qo'shildi)
  - ✅ Onboarding wizard: 5 qadam (filial, xodim, import, birinchi sotuv, dashboard)
  - ✅ i18n: onboarding step4/step5 kalitlari uz/ru/en
  - ✅ Loading/error: LoadingSkeleton, ErrorBoundary allaqachon mavjud
- **Qolgan:**
  - i18n: barcha sahifalarda to'liq audit (kamchilik bormi?)
  - Dashboard: qo'shimcha polish (davomiy)
- **Muddat:** davomiy
- **Hafta:** W25+
- **Trek:** D (Demo + Security)

---

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P3 (KELAJAK, 6+ oy)
# ══════════════════════════════════════════════════════════════

*(T-116 — BAJARILDI T-460/461/466 sifatida. Tiers: keyingi fase)*

## T-119 | P3 | [BACKEND] | Marketplace sync — Uzum/Sello
- **Sana:** 2026-02-26
- **Vazifa:** Catalog sync, stock sync, order import. Omnichannel.

## T-120 | P3 | [BACKEND] | AI forecasting — Seasonal demand prediction
- **Sana:** 2026-02-26
- **Vazifa:** Kosmetika seasonal (sunscreen yoz, moisturizer qish, gift sets 8-Mart).
- **Raqobat:** Hech bir raqibda haqiqiy AI yo'q. Bu RAOS unique feature (Phase 3).

## T-121 | P3 | [BACKEND] | Google Sheets export — Automated daily data
- **Sana:** 2026-02-26
- **Vazifa:** Kunlik savdo data → linked Google Sheet. Scheduled cron.

## T-434 | P3 | [BACKEND] | 1C CommerceML export — buxgalteriya integratsiya

- **Sana:** 2026-05-17
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/integrations/one-c/`
- **Vazifa:**
  - CommerceML 2.1 XML format da export (products, sales, payments)
  - Endpoint: GET /api/v1/integrations/1c/export?type=catalog|sales
  - Cron: kunlik avtomatik export (ixtiyoriy)
  - 1C tomonidan import qilish uchun tayyor XML
- **Kutilgan:** Buxgalter 1C da ishlaydi, RAOS dan ma'lumot avtomatik keladi
- **Muddat:** 3-4 hafta
- **Raqib:** BILLZ ✅, YesPOS ✅ (PRO), Smart ✅. RAOS da YO'Q — gap.

## T-435 | P3 | [BACKEND] | Product database — 700K+ tovar import tool

- **Sana:** 2026-05-17
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/catalog/import/`
- **Vazifa:**
  - CSV/Excel import tool (bulk upload)
  - Open barcode database lookup (EAN-13 → product name, category)
  - Template: "Kosmetika 5000 tovar" starter pack (popular brands)
  - Onboarding wizard: "Tovarlaringizni tez qo'shing"
- **Kutilgan:** Mijoz 5 daqiqada 1000+ tovar qo'sha oladi
- **Muddat:** 2 hafta
- **Raqib:** YesPOS 700K+ tayyor baza — RAOS javob: smart import tool

---

*(T-470..T-477 — BAJARILDI, Done.md 2026-06-04 — 7 ta import engine bug fix)*

---

# ══════════════════════════════════════════════════════════════
# FULL AUDIT NATIJALARI (2026-06-13) — 10 agent, 86 model, 411 endpoint
# ══════════════════════════════════════════════════════════════

## T-484 | P0 | [SECURITY] | Billing IDOR — tenant_id filter yo'q payments/invoices da

- **Sana:** 2026-06-13
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/billing/billing-payment.service.ts:287`, `billing-invoice.service.ts:53`
- **Muammo:** `GET /billing/payments/:id` va `/invoices/:id` endpointlari tenantId bo'yicha filter qilmaydi. Har qanday avtorizatsiya qilingan user boshqa tenant invoiceni UUID orqali o'qiy oladi.
- **Kutilgan:** `where: { id, tenantId }` — barcha billing GET-by-id metodlarda
- **Holat:** IN PROGRESS

---

## T-485 | P0 | [SECURITY] | Admin panel — journal_entries/journal_lines UPDATE/DELETE bloklash

- **Sana:** 2026-06-13
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/admin/admin-database.service.ts`, `admin-db-constants.ts`
- **Muammo:** TABLE_WHITELIST ga `journal_entries` va `journal_lines` kiritilgan. Super Admin admin panel orqali immutable ledger yozuvlarini o'zgartirishi/o'chirishi mumkin. Bu CLAUDE.md dagi "Ledger entry — IMMUTABLE, faqat reversal" qoidasini buzadi.
- **Kutilgan:** IMMUTABLE_TABLES set yaratish va write operatsiyalarni (update/delete/bulk) bloklash. Read ruxsat etiladi.
- **Holat:** IN PROGRESS

---

## T-486 | P0 | [SECURITY] | tezcode-bot RCE — guruhda barcha foydalanuvchilarga ruxsat

- **Sana:** 2026-06-13
- **Mas'ul:** Ibrat
- **Fayl:** `apps/tezcode-bot/src/telegram.handler.ts:21`, `claude.service.ts:206`
- **Muammo:** `isAllowed()` funksiyasi Telegram guruhlarida BARCHA ishtirokchilarga `true` qaytaradi. `--dangerously-skip-permissions` flag bilan Claude CLI ishga tushiriladi. Natija: guruhning har qanday a'zosi serverda ixtiyoriy buyruqlar bajarishi mumkin (RCE).
- **Kutilgan:** Guruhlarda ham `allowedUsers` yoki `OWNER_IDS` tekshiruvi. `/api/send` endpoint ga bearer token qo'shish.
- **Holat:** IN PROGRESS

---

## T-487 | P0 | [SECURITY] | SQL Console — production da to'liq bloklash

- **Sana:** 2026-06-13
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/admin/admin-sql-console.service.ts:70`, controller
- **Muammo:** `$queryRawUnsafe` orqali ixtiyoriy SQL (SELECT) bajariladi. Buzilgan Super Admin akkaunt = butun bazaga to'liq read-access (barcha tenantlar, parollar).
- **Kutilgan:** Production muhitda SQL Console to'liq o'chiriladi (`ForbiddenException`). Dev/staging da ishlaydi.
- **Holat:** IN PROGRESS

---

## T-488 | P0 | [INFRA] | Rate limiting ishlamaydi — Throttler tekshirish

- **Sana:** 2026-06-13
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/app.module.ts`, `common/guards/throttler*`
- **Muammo:** Production da 70 ta so'rov soniyalar ichida yuborildi — bitta ham 429 qaytmadi. ThrottlerGuard ishlamayapti yoki Railway proxy client IP ni to'g'ri o'tkazmayapti.
- **Kutilgan:** X-Forwarded-For orqali real IP olish, ThrottlerGuard `getTracker` metodini override qilish. 60 req/min limit ishlashi kerak.
- **Holat:** IN PROGRESS

---

## T-489 | P1 | [SECURITY] | ledger.service.ts — return.approved da tenantId yo'q

- **Sana:** 2026-06-13
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/ledger/ledger.service.ts:163`
- **Muammo:** `return.approved` event handler da `prisma.return.findFirst({ where: { id: payload.returnId } })` — tenantId filter yo'q.
- **Kutilgan:** `where: { id: payload.returnId, tenantId: payload.tenantId }`

---

## T-490 | P1 | [FRONTEND] | useDebtDetail noto'g'ri URL — /debts/ o'rniga /nasiya/

- **Sana:** 2026-06-13
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/src/hooks/customers/useDebts.ts:69`
- **Muammo:** Hook `/debts/${debtId}` ga so'rov yuboradi, lekin backend da bunday endpoint yo'q. To'g'ri endpoint: `/nasiya/:id`.
- **Kutilgan:** URL ni `/api/v1/nasiya/${debtId}` ga o'zgartirish

---

## T-491 | P1 | [FRONTEND] | 402 billing interceptor yo'q — client.ts

- **Sana:** 2026-06-13
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/src/api/client.ts`
- **Muammo:** CLAUDE_FULLSTACK.md da 402 interceptor talab qilingan (subscription expired → /settings/billing redirect). Kodda yo'q.
- **Kutilgan:** 402 response da `window.dispatchEvent(new CustomEvent('billing:due'))` yoki redirect

---

## T-492 | P1 | [FRONTEND] | Loyalty hooks dublikatlari — 3 ta hook 2 ta faylda

- **Sana:** 2026-06-13
- **Mas'ul:** Ibrat
- **Fayl:** `hooks/customers/useLoyalty.ts` vs `hooks/loyalty/useLoyalty.ts`
- **Muammo:** `useLoyaltyConfig`, `useLoyaltyAccount`, `useRedeemPoints` — har biri 2 ta faylda turli invalidation logikasi bilan aniqlangan. Import paytida noto'g'ri fayl olinishi mumkin.
- **Kutilgan:** Bitta fayl (loyalty/) qoldirish, ikkinchisini re-export qilish

---

## T-493 | P1 | [SCHEMA] | ProductBarcode, OrderItem, DebtPayment — tenantId yo'q

- **Sana:** 2026-06-13
- **Mas'ul:** Ibrat
- **Fayl:** `prisma/schema.prisma`
- **Muammo:** 3 ta muhim jadvalda tenantId yo'q: ProductBarcode (barcode search cross-tenant), OrderItem (hisobot aggregatsiyalari), DebtPayment (moliyaviy ma'lumotlar). Direct query da data leak xavfi.
- **Kutilgan:** tenantId + @@index qo'shish, migration yaratish

---

## T-494 | P1 | [CI/CD] | railway.toml web — SESSION_SIGNING_SECRET yuklanmaydi

- **Sana:** 2026-06-13
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/railway.toml:14`
- **Muammo:** Dockerfile CMD `. /app/sess.env` qiladi, lekin Railway startCommand buni override qiladi va sess.env yuklanmaydi. Finance/settings sahifalari OWNER/ADMIN uchun ishlamasligi mumkin.
- **Kutilgan:** startCommand ni `. /app/sess.env && node apps/web/server.js` ga o'zgartirish

---

## T-495 | P1 | [WORKER] | sms-campaign.worker — tenantId yo'q + failed handler yo'q

- **Sana:** 2026-06-13
- **Mas'ul:** Ibrat
- **Fayl:** `apps/worker/src/workers/sms-campaign.worker.ts:62-64`
- **Muammo:** `prisma.smsCampaign.update({ where: { id } })` — tenantId filter yo'q. `worker.on('failed')` handler yo'q — xatolar loglanmaydi.
- **Kutilgan:** tenantId qo'shish, failed handler qo'shish

---

## T-496 | P1 | [WORKER] | migration.worker — credentials Redis da ochiq, header himoyasiz

- **Sana:** 2026-06-13
- **Mas'ul:** Ibrat
- **Fayl:** `apps/worker/src/workers/migration.worker.ts`
- **Muammo:** Job data da credentials ochiq Redis ga yoziladi. `X-Internal-Worker: true` header hech qanday secret bilan tekshirilmaydi.
- **Kutilgan:** Credentials o'rniga credentialId yuborish va DB/vault dan o'qish. Header ga secret qo'shish.

---

## T-497 | P1 | [FRONTEND] | POS — CASHIER roliga promotions/customers 403

- **Sana:** 2026-06-14
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/sales/promotions/promotions.controller.ts`, `apps/api/src/customers/customers.controller.ts`
- **Muammo:** CASHIER roli @Roles() da yo'q → POS da nasiya/bonus yaratishda 403 Forbidden
- **Kutilgan:** CASHIER GET/POST promotions + GET/POST customers ga kirishi kerak
- **Status:** ✅ BAJARILDI (2026-06-14)

---

## T-498 | P2 | [FRONTEND] | POS — ShiftOpenModal miltillashi (hydration flicker)

- **Sana:** 2026-06-14
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/src/app/(pos)/pos/page.tsx`
- **Muammo:** skipHydration=true → shiftId null → modal ko'rinadi → rehydrate → modal yo'qoladi (miltillash)
- **Kutilgan:** hydrated state qo'shib, rehydrate tugaguncha modal ko'rsatmaslik
- **Status:** ✅ BAJARILDI (2026-06-14)

---

## T-499 | P2 | [BACKEND] | shift.changed event — WebSocket real-time shift status

- **Sana:** 2026-06-14
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/sales/shift.service.ts`
- **Muammo:** shift.service faqat shift.closed emit qiladi, lekin realtime.gateway shift.changed kutadi → WebSocket ishlamaydi
- **Kutilgan:** openShift va closeShift da shift.changed emit qilish → Web/Owner panel real-time yangilanadi
- **Status:** ✅ BAJARILDI (2026-06-14)

---

## T-500 | P2 | [FRONTEND] | POS ShiftBar — responsive layout

- **Sana:** 2026-06-14
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/src/app/(pos)/pos/ShiftBar.tsx`
- **Muammo:** Barcha elementlar fixed gap/text — kichik ekranda siqilib ko'rinmay qoladi
- **Kutilgan:** Responsive Tailwind: hidden sm:inline, truncate, icons-only on mobile
- **Status:** ✅ BAJARILDI (2026-06-14)

---

## T-501 | P2 | [FRONTEND] | POS Cash Drawer — USB va Browser rejimi zaglushka edi

- **Sana:** 2026-06-14
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/src/lib/cashDrawer.ts`
- **Muammo:** usb va browser rejimlarida return false — hech narsa qilmas edi. Toast yolg'on ko'rsatar edi.
- **Kutilgan:** USB → Web Serial API, Browser → window.print fallback, toast haqiqiy natijani ko'rsatsin
- **Status:** ✅ BAJARILDI (2026-06-14)

---

## T-502 | P1 | [OFFLINE] | ARCUS 2.1 — Bank terminal (pin-pad) integratsiyasi

- **Sana:** 2026-06-14
- **Mas'ul:** Ibrat
- **Fayl:** `apps/pos/` (Tauri), `C:\Arcus2\ArcCom.dll`
- **Muammo:** Terminal tugmasi POS da bor, lekin fizik terminal bilan hech qanday aloqa yo'q. Kasser qo'lda terminal da summa kiritadi.
- **Kutilgan:** Tauri Rust FFI → ArcCom.dll → ITPosRun(1) → auto-pay. COM-port auto-reconnect.
- **Docs:** `docs/INTEGRATIONS_MAP.md` (ARCUS section), Obsidian `PROJECTS/RAOS/arcus-integration.md`
- **Kontakt:** +998 99 885 43 45 (@ef4345) — bankdagi tanish

---

## T-503 | P2 | [BACKEND] | REGOS OFD — fiscal QR chekda ko'rsatish

- **Sana:** 2026-06-14
- **Mas'ul:** Ibrat (+ Sardor fiscal zona)
- **Fayl:** `apps/web/src/components/Receipt/ReceiptTemplate.tsx`, `apps/api/src/tax/adapters/regos.adapter.ts`
- **Muammo:** REGOS adapter tayyor (fiscalQr, fiscalId, fiscalSign qaytaradi), lekin chek shabloni placeholder ko'rsatadi ("⏳ Fiscal Pending")
- **Kutilgan:** Order da fiscal ma'lumot bo'lsa → chekda QR, fiscal ID, imzo ko'rsatish
- **Bog'liq:** T-081
