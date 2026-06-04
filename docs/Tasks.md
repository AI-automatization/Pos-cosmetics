# RAOS — OCHIQ VAZIFALAR (Kosmetika POS MVP)
# Yangilangan: 2026-06-04 (T-469 — RBAC default-on global APP_GUARD DONE → Done.md ga ko'chirildi)
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

## T-428 | P1 | [BACKEND] | Billing moduli — obuna, trial 30 kun, tariflar

- **Sana:** 2026-05-17
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/billing/` (yaratish kerak)
- **Vazifa:**
  - `Subscription` model: tenant → plan → status → trial_expires_at
  - Plan CRUD: Starter/Growth/Pro (yoki Free/Pro/Scale)
  - Trial logic: sign-up → 30 kun full access → keyin limit
  - Payment integration: Click/Payme recurring (T-415 infra dan foydalanish)
  - Admin panel: MRR/ARR dashboard
  - Webhook: to'lov muvaffaqiyatli → subscription.activate()
- **Kutilgan:** Mijoz sign-up → 30 kun bepul → to'lov → davom
- **Muddat:** 2 hafta
- **Bog'liq:** T-380 (Super Admin Billing)

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

## T-463 | P1 | [BACKEND] | SMS module — backend (gateway + campaign + scheduling)

- **Sana:** 2026-05-19
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/sms/` (yaratish kerak)
- **Vazifa:**
  - `sms.module.ts`, `sms.service.ts` (gateway abstraction), `sms.controller.ts`
  - `adapters/playmobile.adapter.ts` (yoki tanlangan provider)
  - SmsService: sendSingle, sendBulk, getBalance, getDeliveryStatus
  - Campaign: DRAFT → SCHEDULED → SENDING → SENT → COMPLETED
  - Prisma: `sms_campaigns`, `sms_messages` tables
  - Scheduling: BullMQ delayed job
  - Rate limiting: max 100 SMS/min
  - Tenant isolation + cost tracking + unsubscribe ("STOP")
- **Kutilgan:** API orqali SMS yuborish va kampaniya yaratish
- **Muddat:** 1 hafta
- **Hafta:** W23
- **Trek:** B (SMS Campaign)
- **Bog'liq:** T-462 (provider tanlangan bo'lishi kerak)
- **Branch:** `ibrat/feat-sms-campaign`

---

## T-464 | P1 | [FRONTEND] | SMS Campaign Web UI — kampaniya yaratish, yuborish, kuzatish

- **Sana:** 2026-05-19
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/src/app/(admin)/campaigns/` (yaratish kerak)
- **Vazifa:**
  - `/campaigns` — Ro'yxat: nomi, status, audience, yuborildi/yetkazildi, sana
  - `/campaigns/new` — Yaratish: nomi, matn (160 belgi counter), audience segment, vaqt, preview
  - `/campaigns/[id]` — Detail: status bar, statistika, xabar ro'yxati
  - `/campaigns/templates` — Tayyor shablonlar (yangi mahsulot, chegirma, re-engagement)
  - Audience segments: barcha, oxirgi 30 kun xaridorlar, loyalty 100+, 60+ kun churning
  - Variables: [ism], [ballar], [dokon]
- **Kutilgan:** Admin panelda SMS kampaniya yaratish, yuborish, kuzatish
- **Muddat:** 3-4 kun
- **Hafta:** W24 (4-hafta)
- **Trek:** B (SMS Campaign)
- **Bog'liq:** T-463

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

*(T-433 — DUPLIKAT, T-453 sifatida bajarildi)*

---

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
- **Vazifa:**
  - Dashboard: RAOS branding (cyan #24D4F4), logo sidebar, "Powered by RAOS" footer
  - Onboarding wizard: 5 qadam (do'kon, filial, import, kassir, birinchi sotuv)
  - i18n: barcha sahifalarda uz/ru/en to'liq
  - Loading/error states: skeleton, error boundary
- **Kutilgan:** Professional, demo-ready admin panel
- **Muddat:** davomiy
- **Hafta:** W25+
- **Trek:** D (Demo + Security)
- **Branch:** `ibrat/chore-admin-polish`

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

## T-470 | P2 | [BACKEND] | Engine: unit/category resolved by `name`, silently null on miss

- **Sana:** 2026-06-04
- **Fayl:** `packages/catalog-import/src/engine.ts`
- **Muammo:** Import engine Unit va Category ni `name` bo'yicha (case-insensitive) qidiradi. Lekin schema unique kalitlari: `Unit @@unique([tenantId, shortName])` va `Category @@unique([tenantId, name, parentId])`. Noto'g'ri yoki noma'lum unit/category nom kiritilsa — `null` qaytariladi, foydalanuvchi ogohlantirish olmaydi.
- **Izoh:** Bu T-130 xizmatiga nisbatan regressiya emas (xuddi shunday ishlagan) — lekin har qator uchun ogohlantirish berish kerak.
- **Kutilgan:** Topilmagan unit/category → per-row warning xabari (skipped emas, shunchaki ogohlantirish)

---

## T-471 | P3 | [BACKEND] | Import: minStock parsed loosely

- **Sana:** 2026-06-04
- **Fayl:** Task 7 / product-import.service parse helpers
- **Muammo:** `minStock` qiymati `minStockLevel` (Decimal(15,3)) maydoniga o'tkaziladi, lekin parser/engine uni raqam sifatida tekshirmaydi va chegara (bounds) validation qilmaydi.
- **Kutilgan:** Parse qatlamida `minStock` ni raqamga majburlash (coerce) va to'g'ri chegaralarni tekshirish

---

## T-472 | P3 | [BACKEND] | Engine: onProgress throw aborts the whole import

- **Sana:** 2026-06-04
- **Fayl:** `packages/catalog-import/src/engine.ts`
- **Muammo:** `onProgress` callback exception tashlasa (masalan, worker ichida Redis write muvaffaqiyatsiz bo'lsa) — exception tarqaladi va butun import jarayoni to'xtaydi.
- **Kutilgan:** Progress-reporting xatoliklari qator ishlovidan izolyatsiya qilinishi kerak (try/catch onProgress ichida)

---

## T-473 | P1 | [SECURITY] | Import controller has no @Roles — any authenticated user can bulk-overwrite catalog

- **Sana:** 2026-06-04
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/catalog/import-export/product-import.controller.ts`
- **Muammo:** `ProductImportController` da `@Roles(...)` dekoratori yo'q. `RolesGuard` roles metadata bo'lmasa by-default ruxsat beradi — ya'ni `CASHIER` yoki `VIEWER` roli bilan ham autentifikatsiya qilingan har qanday foydalanuvchi katalogni to'liq import orqali yozib tashlashi mumkin. Engine upsert strategiyasi ishlatadi, shuning uchun bu real catalog overwrite xavfi.
- **Kutilgan:** `@Roles('OWNER', 'ADMIN', 'MANAGER')` dekoratorini import yozish (`POST /import`) va status o'qish (`GET /import/:jobId`) handlerlariga qo'shish. Enforce qilishdan oldin: mobile va web klientlar faqat `OWNER`/`ADMIN`/`MANAGER` roli bilan import chaqirishini tekshirish.

---

## T-474 | P2 | [BACKEND] | Engine: bir qatorda sku va barcode turli mavjud mahsulotlarga mos kelsa

- **Sana:** 2026-06-04
- **Fayl:** `packages/catalog-import/src/engine.ts` (find: `(sku && bySku.get(sku)) || (barcode && byBarcode.get(barcode))`)
- **Muammo:** `bySku` va `byBarcode` mustaqil maplar. Agar bitta import qatorining `sku` si P1 mahsulotga, `barcode` si esa BOSHQA P2 mahsulotga mos kelsa — `||` jimgina P1 ni tanlaydi va P2 e'tiborsiz qoladi (yoki create yo'lida `@@unique([tenantId, barcode])` P2002 sirtga chiqadi). Tenant leak emas (ikkalasi ham `tenantId` bilan scoped), lekin identifikator yechimi noaniq.
- **Kutilgan:** `sku` va `barcode` ikkalasi ham hal bo'lsa, ammo TURLI id larga — per-row error ("SKU va barkod turli mahsulotlarga tegishli") + skip. Final review I2.

---

## T-475 | P2 | [BACKEND] | Import/export ko'rinish filtri nomuvofiq (deletedAt:null vs isActive:true)

- **Sana:** 2026-06-04
- **Fayl:** `packages/catalog-import/src/engine.ts:38` (`deletedAt: null`) vs `apps/api/src/catalog/import-export/product-import.service.ts` (export: `isActive: true`)
- **Muammo:** Import preload mavjud mahsulotni `deletedAt: null` bo'yicha topadi — ya'ni soft-inaktiv (`isActive:false`) mahsulotni ham update qiladi. Export esa faqat `isActive:true` chiqaradi. Eksport→import round-trip simmetrik emas: inaktiv mahsulot faylda yo'q, lekin re-import unga narx yozishi mumkin.
- **Kutilgan:** Bitta predikat tanlash (ehtimol import ham `isActive` ni hisobga olishi kerak) — jamoa qarori. Tanlangan xatti-harakatni hujjatlashtirish. Final review I4.

---

## T-476 | P3 | [BACKEND] | getProductImportJobStatus: evict bo'lgan completed job `not_found` qaytaradi

- **Sana:** 2026-06-04
- **Fayl:** `apps/api/src/common/queue/queue.service.ts` (`getProductImportJobStatus`), `apps/web/src/app/(admin)/catalog/import/page.tsx:133`
- **Muammo:** `removeOnComplete: 50` bilan muvaffaqiyatli tugagan job kech polling qilinsa (evict bo'lsa) `not_found` qaytadi, web esa `not_found` ni qattiq xatolik deb ko'rsatadi ("Import jarayoni muvaffaqiyatsiz") — aslida muvaffaqiyatli bo'lgan. 50-chuqurlikda ehtimollik past.
- **Kutilgan:** "completed-but-evicted" ni ajratish yoki bu queue uchun retentionni kengaytirish. Final review M6.

---

## T-477 | P3 | [BACKEND] | CSV parser qo'shtirnoq ichidagi vergulda sinadi

- **Sana:** 2026-06-04
- **Fayl:** `apps/api/src/catalog/import-export/product-import.service.ts` (`line.split(',')`)
- **Muammo:** Sodda `split(',')` parser — `exportToCsv` qo'shtirnoq bilan o'rab chiqargan `"Cream, 50ml"` kabi nom re-import da noto'g'ri parse bo'ladi (qo'shtirnoq ichidagi vergul maydonni bo'lib yuboradi). T-130 dan meros, bu PR scope dan tashqari, lekin export→import round-trip ni vergulli nomlar uchun buzadi.
- **Kutilgan:** RFC-4180 ga mos CSV parser (qo'shtirnoq + escape qo'llab-quvvatlash). Final review M7.
