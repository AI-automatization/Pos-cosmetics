# RAOS — OCHIQ VAZIFALAR (Kosmetika POS MVP)
# Yangilangan: 2026-05-15 (T-415 yangilandi, T-418 qo'shildi)
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

*(T-388 — BAJARILDI, Done.md ga ko'chirildi 2026-05-14)*

---

*(T-389 — BAJARILDI, Done.md ga ko'chirildi 2026-05-14)*

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
