# RAOS — OCHIQ VAZIFALAR (Kosmetika POS MVP)
# Yangilangan: 2026-05-13 (T-393..T-397 qo'shildi — Payment providers audit)
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

*(T-393, T-394, T-395, T-396 — BAJARILDI, Done.md ga ko'chirildi 2026-05-14)*

---

*(T-397 — BAJARILDI, Done.md ga ko'chirildi 2026-05-14)*

---

*(T-387 — BAJARILDI, Done.md ga ko'chirildi 2026-05-14)*

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

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P3 (KELAJAK, 6+ oy)
# ══════════════════════════════════════════════════════════════

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
- **Vazifa:** Kunlik savdo data → linked Google Sheet. Scheduled cron.
