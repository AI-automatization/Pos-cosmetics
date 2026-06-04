# RAOS — OCHIQ VAZIFALAR (Kosmetika POS MVP)
# Yangilangan: 2026-05-20 (T-458..T-468 — 8/11 DONE → Done.md ga ko'chirildi)
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

## T-427 | P1 | [LANDING] | Landing page — RAOS.uz (MASTER TASK)

- **Sana:** 2026-05-17 (yangilangan 2026-05-19)
- **Mas'ul:** Ziyoda (kod) + Shuhratov (kontent/matn)
- **Fayl:** `apps/landing/` (Next.js 15 + Tailwind v4, port 3002)
- **Holat:** Struktura tayyor. Komponentlar yozilishi kerak.
- **Sub-tasklar:** T-438..T-457 (quyida batafsil)
- **Plan:** `docs/LANDING_PAGE_PLAN.md` (to'liq kontent va design)
- **Kutilgan:** raos.uz — live landing, SEO optimized, 3 tilda (UZ/RU/EN)
- **Muddat:** 2 hafta (1 hafta asosiy + 1 hafta polish)

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

# ══════════════════════════════════════════════════════════════
# ZIYODA — LANDING PAGE TASKLARI (T-438..T-457)
# Master task: T-427 | Plan: docs/LANDING_PAGE_PLAN.md
# ══════════════════════════════════════════════════════════════

## T-438 | P1 | [LANDING] | UI komponentlar — Button, Card, Badge, Accordion

- **Sana:** 2026-05-19
- **Mas'ul:** Ziyoda
- **Fayl:** `apps/landing/src/components/ui/`
- **Vazifa:**
  - `Button.tsx` — Primary (yashil), Secondary (ko'k outline), Ghost variantlar
  - `Card.tsx` — Feature/muammo kartasi (icon + sarlavha + tavsif)
  - `Badge.tsx` — "Bepul", "Eng mashhur", "Faqat RAOS da" badge
  - `Accordion.tsx` — FAQ uchun ochiluvchi element (animatsiya bilan)
  - `ComparisonRow.tsx` — Solishtirish jadvalining bitta qatori
- **Dizayn:** Primary #2563EB, Accent #10B981, Inter font
- **Qoida:** Har komponent — TypeScript props interface, Tailwind only, max 100 qator
- **Kutilgan:** Barcha boshqa sectionlar shu komponentlardan foydalanadi
- **Muddat:** 0.5 kun
- **Bog'liq:** Barcha T-439..T-449

---

## T-439 | P1 | [LANDING] | Header — sticky nav + mobile burger menu

- **Sana:** 2026-05-19
- **Mas'ul:** Ziyoda
- **Fayl:** `apps/landing/src/components/layout/Header.tsx`
- **Vazifa:**
  - RAOS logotipi (chapda)
  - Nav linklar: Imkoniyatlar | Narxlar | Taqqoslash | Darsliklar | FAQ
  - CTA tugma: "Bepul boshlash" (yashil, o'ngda)
  - Til o'zgartirish: UZ | RU | EN (T-451 bilan bog'liq)
  - Sticky on scroll (transparent → solid white + shadow)
  - Mobile: hamburger menu (slide-in)
- **Qoida:** "use client" kerak (scroll event + mobile menu state)
- **Kutilgan:** Professional header, mobile-da ham ishlaydi
- **Muddat:** 0.5 kun

---

## T-440 | P1 | [LANDING] | Hero section — bosh ekran, CTA, skrinshot

- **Sana:** 2026-05-19
- **Mas'ul:** Ziyoda (kod) + Shuhratov (matn)
- **Fayl:** `apps/landing/src/components/sections/HeroSection.tsx`
- **Matn manba:** `docs/LANDING_PAGE_PLAN.md` → 2.2 HERO
- **Vazifa:**
  - H1: "Do'koningiz uchun eng oson kassa tizimi"
  - Subtitle: "Internet yo'qmi? Ishlaydi. Soliq cheki? Avtomatik..."
  - CTA katta tugma: "Hoziroq bepul boshlash →" (yashil, pulse animatsiya)
  - Ikkinchi CTA: "Demo ko'rish" (outline)
  - O'ng tomon: POS skrinshot/mockup (planshet + telefon)
  - Social proof mini: "30+ do'kon sinab ko'rmoqda | Soliq.uz bilan rasmiy | 24/7 yordam"
- **Responsive:** Mobile — 1 ustun (matn → CTA → rasm), Desktop — 2 ustun
- **Kutilgan:** Birinchi ekran — eng kuchli taassurot
- **Muddat:** 1 kun

---

## T-441 | P1 | [LANDING] | Pain Points — 3 muammo kartasi

- **Sana:** 2026-05-19
- **Mas'ul:** Ziyoda (kod) + Shuhratov (matn)
- **Fayl:** `apps/landing/src/components/sections/PainPoints.tsx`
- **Matn manba:** `docs/LANDING_PAGE_PLAN.md` → 2.3 PROBLEMS
- **Vazifa:**
  - Sarlavha: "Tanish muammolar? Biz hal qildik."
  - 3 ta kartochka (Card komponentidan foydalanish):
    1. Internet muammosi — offline yechim
    2. Soliq jarima — avtomatik OFD chek
    3. Ko'p do'kon boshqaruvi — bitta dashboard
  - Har kartada: Muammo (qizil fon) → RAOS yechimi (yashil fon) → Oddiy tilda
  - Ikonlar: lucide-react dan (WifiOff, ShieldCheck, Building2)
- **Responsive:** Mobile — 1 ustun stack, Desktop — 3 ustun grid
- **Kutilgan:** Mijoz o'z muammosini ko'radi → yechimga ishonadi
- **Muddat:** 0.5 kun

---

## T-442 | P1 | [LANDING] | How It Works — 3 qadam

- **Sana:** 2026-05-19
- **Mas'ul:** Ziyoda
- **Fayl:** `apps/landing/src/components/sections/HowItWorks.tsx`
- **Matn manba:** `docs/LANDING_PAGE_PLAN.md` → 2.4
- **Vazifa:**
  - Sarlavha: "3 daqiqada boshlang"
  - 3 qadam (raqam + ikon + sarlavha + tavsif):
    1. Ro'yxatdan o'ting (2 daqiqa)
    2. Tovarlarni kiriting (Excel/shtrix-kod)
    3. Sotishni boshlang! (offline ham ishlaydi)
  - Qadamlar orasida chiziq yoki arrow connector
  - Alternativ fon rang (#F8FAFC)
- **Kutilgan:** Oddiy, 3 qadamda tushunarli
- **Muddat:** 0.5 kun

---

## T-443 | P1 | [LANDING] | Features — 6 ta asosiy imkoniyat

- **Sana:** 2026-05-19
- **Mas'ul:** Ziyoda (kod) + Shuhratov (matn)
- **Fayl:** `apps/landing/src/components/sections/Features.tsx`
- **Matn manba:** `docs/LANDING_PAGE_PLAN.md` → 2.5
- **Vazifa:**
  - Sarlavha: "Nima uchun RAOS?"
  - 6 ta feature kartochka (Card + Badge):
    1. Offline Kassa — "Faqat RAOS da" badge
    2. Soliq.uz Avtomatik — "BILLZ da YO'Q" badge
    3. Telefonda Boshqaring — "2 ta ilova" badge
    4. AI Tahlil (Night Cashier) — "Haqiqiy AI" badge
    5. Telegram Bot — "SMS o'rniga" badge
    6. Ko'p turdagi biznes — "6 ta yo'nalish" badge
  - Har kartada: ikon (lucide-react) + sarlavha + 2 qator tavsif + tag/badge
- **Responsive:** Mobile — 1 ustun, Tablet — 2 ustun, Desktop — 3 ustun grid
- **Kutilgan:** Mijoz 6 ta sababni ko'radi nima uchun RAOS
- **Muddat:** 1 kun

---

## T-444 | P1 | [LANDING] | Comparison Table — RAOS vs BILLZ vs YesPOS vs Smart

- **Sana:** 2026-05-19
- **Mas'ul:** Ziyoda (kod) + Shuhratov (ma'lumot tekshiruvi)
- **Fayl:** `apps/landing/src/components/sections/Comparison.tsx`
- **Matn manba:** `docs/LANDING_PAGE_PLAN.md` → 2.6
- **Vazifa:**
  - Sarlavha: "RAOS vs Boshqalar — haqiqiy taqqoslash"
  - 10 parametrli jadval (narx, offline, OFD, mobile, AI...)
  - RAOS ustunliklari — yashil highlight (bg-emerald-50, text-emerald-700)
  - Raqiblar kamchiliklari — qizil/och (text-red-500)
  - Jadval ostida 3 ta xulosa fakt
  - Mobile: horizontal scroll yoki kartochka formatga o'tish
- **Ma'lumot:** `docs/competitive-analysis/comparison-matrix.md` dan tekshirilgan
- **Kutilgan:** Mijoz aniq ko'radi — RAOS arzonroq, kuchliroq
- **Muddat:** 1 kun

---

## T-445 | P1 | [LANDING] | Pricing — 3 tarif (Free / Pro / Scale)

- **Sana:** 2026-05-19
- **Mas'ul:** Ziyoda (kod) + Shuhratov (narx strategiya)
- **Fayl:** `apps/landing/src/components/sections/Pricing.tsx`
- **Matn manba:** `docs/LANDING_PAGE_PLAN.md` → 2.7
- **Vazifa:**
  - Sarlavha: "Oddiy narxlar. Yashirin to'lovlar yo'q."
  - 3 tarif kartochka:
    - Free (0 so'm) — 1 kassa, 100 tovar, asosiy
    - Pro (350,000/oy) — "ENG MASHHUR" badge, 3 kassa, OFD, offline, mobile
    - Scale (700,000/oy) — cheksiz, AI, ko'chmas mulk, API, premium yordam
  - Yillik narx toggle (25% tejash ko'rsatish)
  - Har kartada: narx + xususiyatlar ro'yxat (✓/✗) + CTA tugma
  - Ostida: tejash kalkulyator ("BILLZ 999K vs RAOS 350K = 74% arzon!")
- **Responsive:** Mobile — stack, Desktop — 3 ustun (Pro o'rtada, kattaroq)
- **Kutilgan:** Narx aniq, Pro tavsiya qilingan, bepul variant jalb qiladi
- **Muddat:** 1 kun

---

## T-446 | P1 | [LANDING] | FAQ — 10 savol, accordion

- **Sana:** 2026-05-19
- **Mas'ul:** Ziyoda (kod) + Shuhratov (savollar matni)
- **Fayl:** `apps/landing/src/components/sections/FAQ.tsx`
- **Matn manba:** `docs/LANDING_PAGE_PLAN.md` → 2.9
- **Vazifa:**
  - Sarlavha: "Ko'p beriladigan savollar"
  - 10 ta savol-javob (Accordion komponentidan foydalanish):
    1. RAOS nima? 2. BILLZ dan nimasi yaxshi? 3. Offline qanday ishlaydi?
    4. Soliq cheki qanday? 5. Necha so'm? 6. Telefonda ishlaydimi?
    7. Qanday boshlash? 8. Ma'lumot xavfsizmi? 9. 1C bilan ishlaydi?
    10. Yordam kerak bo'lsa?
  - JSON-LD schema markup (FAQPage) — SEO uchun
  - "use client" — accordion state uchun
- **Kutilgan:** SEO uchun muhim + mijoz savollariga javob
- **Muddat:** 0.5 kun

---

## T-447 | P1 | [LANDING] | CTA section — yakuniy chaqiruv

- **Sana:** 2026-05-19
- **Mas'ul:** Ziyoda
- **Fayl:** `apps/landing/src/components/sections/CTASection.tsx`
- **Matn manba:** `docs/LANDING_PAGE_PLAN.md` → 2.10
- **Vazifa:**
  - Sarlavha: "Hali o'ylayapsizmi?"
  - Tavsif: "Har kuni RAOS siz 1 kun ortda qolasiz..."
  - Katta CTA tugma: "Hoziroq bepul boshlash →" (yashil, pulse)
  - Ostida: "2 daqiqada ro'yxatdan o'ting. Karta kerak emas."
  - Gradient yoki rangli fon (primary → primary-dark)
- **Kutilgan:** Sahifani tugatishdan oldin oxirgi push
- **Muddat:** 0.5 kun

---

## T-448 | P1 | [LANDING] | Footer — kontakt, linklar, copyright

- **Sana:** 2026-05-19
- **Mas'ul:** Ziyoda
- **Fayl:** `apps/landing/src/components/layout/Footer.tsx`
- **Matn manba:** `docs/LANDING_PAGE_PLAN.md` → 2.11
- **Vazifa:**
  - 3 ustunli layout:
    - Chap: RAOS logo + tagline + copyright
    - O'rta: Mahsulot linklar + Yordam linklar + Huquqiy
    - O'ng: Telegram @raos_support, Instagram @raos.uz, email, telefon
  - Dark fon (#0F172A), light matn
  - Ijtimoiy tarmoq ikonlari (lucide-react)
- **Responsive:** Mobile — stack, Desktop — 3 ustun grid
- **Kutilgan:** Professional footer, barcha kontaktlar ko'rinadi
- **Muddat:** 0.5 kun

---

## T-449 | P1 | [LANDING] | Testimonials / Social proof

- **Sana:** 2026-05-19
- **Mas'ul:** Ziyoda (kod) + Shuhratov (sharhlar matni)
- **Fayl:** `apps/landing/src/components/sections/Testimonials.tsx`
- **Vazifa:**
  - Raqamlar bloki: "30+ do'kon", "10,000+ tranzaksiya/kun", "99.9% uptime"
  - 3-4 ta mijoz sharhi kartochka (avval placeholder, keyin real)
  - Har sharhda: ism, do'kon nomi, sharh matni, avatar (placeholder)
  - Carousel yoki grid layout
- **Eslatma:** Hozircha placeholder — real mijozlar keyin qo'shiladi
- **Kutilgan:** Ishonch oshirish, social proof
- **Muddat:** 0.5 kun

---

## T-450 | P1 | [LANDING] | page.tsx — barcha sectionlarni birlashtirish

- **Sana:** 2026-05-19
- **Mas'ul:** Ziyoda
- **Fayl:** `apps/landing/src/app/page.tsx`
- **Vazifa:**
  - Barcha sectionlarni to'g'ri tartibda import qilish:
    Header → Hero → PainPoints → HowItWorks → Features →
    Comparison → Pricing → Testimonials → VideoTutorials →
    FAQ → CTASection → Footer
  - `lib/data.ts` — barcha statik ma'lumotlar (features, pricing, FAQ)
  - `lib/seo.ts` — JSON-LD schema generatorlar (Organization, FAQPage)
- **Bog'liq:** T-438..T-449 BARCHA tayyor bo'lishi kerak
- **Kutilgan:** Landing page to'liq ko'rinadi
- **Muddat:** 0.5 kun

---

## T-451 | P2 | [LANDING] | i18n — UZ/RU/EN tillar o'tkazgich

- **Sana:** 2026-05-19
- **Mas'ul:** Ziyoda (kod) + Shuhratov (RU/EN tarjima)
- **Fayl:** `apps/landing/src/lib/i18n.ts`, `apps/landing/src/components/LanguageSwitcher.tsx`
- **Vazifa:**
  - Barcha matnlar `lib/constants.ts` ga chiqarilgan
  - 3 til: UZ (default), RU, EN
  - LanguageSwitcher komponent (Header da)
  - URL: raos.uz (UZ default), ?lang=ru, ?lang=en
  - SEO: hreflang taglar
- **Kutilgan:** 3 tilda to'liq ishlaydi
- **Muddat:** 2 kun

---

## T-452 | P1 | [LANDING] | Interaktiv obuchalka — /tutorials (Playwright MCP skrinshot)

- **Sana:** 2026-05-19 (yangilangan — YouTube emas, ichki obuchalka)
- **Mas'ul:** Ibrat (Playwright MCP + agent) + Ziyoda (UI sahifalar)
- **Fayl:** `apps/landing/src/app/tutorials/`, `apps/landing/public/tutorials/`
- **Vazifa:**
  ### A. Playwright MCP orqali skrinshot olish (Ibrat):
  - RAOS ni localhost da ochish (web :3001, POS)
  - Har qadam uchun skrinshot olish (Playwright `browser_take_screenshot`)
  - Skrinshot annotatsiya (qizil doira, strelka — qayerga bosish kerak)
  - `apps/landing/public/tutorials/` ga saqlash (step-1.png, step-2.png...)
  - 8 ta tutorial (har biri 5-10 qadam):
    1. Ro'yxatdan o'tish va sozlash
    2. Tovar qo'shish — 3 usul (qo'lda, Excel, shtrix-kod)
    3. Birinchi savdo qilish
    4. Hisobotlar ko'rish
    5. Xodimlarni boshqarish
    6. Inventar boshqaruvi
    7. Ko'p filial boshqaruvi
    8. Soliq cheki va OFD sozlash
  ### B. Agent yaratish — `tutorial-screenshot.md` (Ibrat):
  - Playwright MCP ishlatib avtomatik skrinshot oluvchi agent
  - Bir buyruq bilan barcha 8 tutorial skrinshot yangilanadi
  - RAOS UI o'zgarganda → agent qayta ishga tushiriladi → yangi skrinshot
  ### C. /tutorials sahifalar (Ziyoda):
  - `/tutorials` — 8 ta tutorial kartochkalar (preview + sarlavha)
  - `/tutorials/[slug]` — har tutorial alohida sahifa:
    - Qadam raqami + skrinshot + matn tushuntirish
    - "Keyingi qadam →" / "← Oldingi qadam" navigatsiya
    - Progress bar (3/8 qadam)
    - Mobile responsive (skrinshot zoom qilsa bo'ladi)
  - Landing da "Darsliklar" section → /tutorials ga link
- **Kutilgan:** Mijoz landing da to'liq o'rganadi — tashqi saytga chiqmaydi
- **Muddat:** 2 kun (skrinshot + agent) + 2 kun (UI sahifalar)

---

## T-453 | P2 | [LANDING] | TCO kalkulyator — interaktiv widget

- **Sana:** 2026-05-19
- **Mas'ul:** Ziyoda
- **Fayl:** `apps/landing/src/components/sections/Calculator.tsx`
- **Vazifa:**
  - Interaktiv kalkulyator: "Hozirgi tizimingiz necha turadi?"
  - Input: filial soni (slider), hozirgi POS (YesPOS/BILLZ/Smart/yo'q)
  - Output: yillik xarajat + jarima riski vs RAOS narxi
  - Vizual: bar chart yoki jadval (CSS bilan, chart lib shart emas)
  - "use client" — interaktiv state
- **Kutilgan:** Mijoz RAOS arzonligini o'z ko'zi bilan ko'radi
- **Muddat:** 1 kun
- **Bog'liq:** T-433 (duplikat — T-433 yopiladi)

---

## T-454 | P2 | [LANDING] | SEO — meta tags, JSON-LD, sitemap, robots.txt

- **Sana:** 2026-05-19
- **Mas'ul:** Ziyoda
- **Fayl:** `apps/landing/src/app/layout.tsx`, `apps/landing/public/`
- **Vazifa:**
  - Metadata: title, description, keywords, openGraph, twitter
  - JSON-LD: Organization, Product (SoftwareApplication), FAQPage
  - `robots.txt` — public/ da
  - `sitemap.xml` — next-sitemap yoki static
  - Canonical URL
  - hreflang taglar (UZ/RU/EN)
  - OG image (1200x630) — public/og-image.png
- **Target:** Lighthouse SEO score 95+
- **Kutilgan:** Google da "POS tizimi Uzbekistan" uchun indekslanadi
- **Muddat:** 1 kun

---

## T-455 | P2 | [LANDING] | Performance optimization — Lighthouse 90+

- **Sana:** 2026-05-19
- **Mas'ul:** Ziyoda
- **Fayl:** Barcha `apps/landing/` fayllar
- **Vazifa:**
  - next/image — barcha rasmlar (lazy load, WebP)
  - next/font — Inter local yuklanishi (Google Fonts o'rniga)
  - Dynamic import — og'ir komponentlar uchun (Calculator, FAQ)
  - Minimal "use client" — faqat kerak joyda
  - Bundle analyze — keraksiz kutubxonalar yo'q
  - Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Target:** Lighthouse Performance 90+, Accessibility 90+, SEO 95+
- **Kutilgan:** Tez yuklanadi, mobile da ham
- **Muddat:** 1 kun

---

## T-456 | P2 | [LANDING] | Mobile responsive — barcha breakpointlar polish

- **Sana:** 2026-05-19
- **Mas'ul:** Ziyoda
- **Fayl:** Barcha section komponentlar
- **Vazifa:**
  - 360px (kichik telefon) — barcha sectionlar to'g'ri
  - 768px (planshet) — 2 ustun layout
  - 1024px (noutbuk) — to'liq layout
  - 1280px+ (katta ekran) — max-width container
  - Comparison table: mobile da horizontal scroll yoki kartochka format
  - Pricing: mobile da stack, desktop da 3 ustun
  - Testlash: Chrome DevTools responsive mode
- **Kutilgan:** Barcha ekranlarda professional ko'rinadi
- **Muddat:** 1 kun

---

## T-457 | P3 | [LANDING] | Privacy Policy + Terms sahifalari

- **Sana:** 2026-05-19
- **Mas'ul:** Ziyoda (kod) + Shuhratov (matn)
- **Fayl:** `apps/landing/src/app/privacy/page.tsx`, `apps/landing/src/app/terms/page.tsx`
- **Vazifa:**
  - Maxfiylik siyosati sahifasi (O'RQ-547 ga mos)
  - Foydalanish shartlari sahifasi
  - Footer dan link
  - Oddiy markdown-style layout
- **Kutilgan:** Huquqiy sahifalar bor, professional ko'rinish
- **Muddat:** 0.5 kun

---

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

## T-478 | P2 | [MOBILE] | `expo run:ios` crash — xmldom 0.9.10 + @expo/plist mos kelmasligi

- **Sana:** 2026-06-03
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/` (dependency: `@xmldom/xmldom@0.9.10`, `@expo/plist@0.5.3`)
- **Muammo:** `pnpm --filter mobile run ios` (ya'ni `expo run:ios`) ishga tushganda usbmux qatlamida crash:
  `TypeError: DOMParser.parseFromString: the provided mimeType "undefined" is not valid` —
  `@expo/plist/parse.ts` → `UsbmuxProtocolReader.parseBody`. xmldom 0.9.x `parseFromString` da mimeType MAJBURIY qildi, @expo/plist esa mimetype'siz chaqiradi. xcodebuild bosqichigacha yetmaydi.
- **Vaqtinchalik yechim:** to'g'ridan-to'g'ri `xcodebuild` + `simctl install/launch` (Metro alohida `expo start`).
- **Kutilgan:** `@xmldom/xmldom` ni 0.8.x ga pin qilish YOKI `@expo/plist` ni `parseFromString(xml, 'text/xml')` chaqiradigan versiyaga yangilash → `expo run:ios` qayta ishlasin.

---

*(T-417 — BAJARILDI, Done.md 2026-05-20)*
*(T-479 — BAJARILDI, Done.md 2026-06-03 — `ios:sim` helper skript)*

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

## T-433 | P2 | [LANDING] | TCO kalkulyator — DUPLIKAT → T-453

- **Sana:** 2026-05-17 (yangilangan 2026-05-19)
- **Mas'ul:** Ziyoda (T-453 ga ko'chirildi)
- **Holat:** DUPLIKAT — T-453 ga birlashtirildi

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

## T-469 | P1 | [BACKEND] | Branch.isWarehouse flag — Katta ombor belgisi

- **Sana:** 2026-05-26
- **Mas'ul:** Ibrat
- **Fayl:** `prisma/schema.prisma`, `apps/api/src/identity/identity.service.ts`
- **Muammo:** Hozirda barcha branchlar bir xil — "katta ombor" tushunchasi yo'q. Filial → ombor so'rov funksiyasi uchun zarur.
- **Vazifa:**
  1. `prisma/schema.prisma` → Branch modelga: `isWarehouse Boolean @default(false) @map("is_warehouse")`
  2. Migration: `npx prisma migrate dev --name add-branch-is-warehouse`
  3. Seed da bitta branchni `isWarehouse: true` qilish
- **Kutilgan:** Branch jadvalida `is_warehouse` ustun; API da branch.isWarehouse qaytadi

## T-470 | P1 | [BACKEND] | WAREHOUSE roli — transfer endpointlarga write ruxsat

- **Sana:** 2026-05-26
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/common/guards/warehouse-read-only.guard.ts`
- **Muammo:** WAREHOUSE roli faqat read-only. Transfer yaratish/tasdiqlash uchun write ruxsat kerak.
- **Vazifa:**
  1. WHITELIST ga qo'shish:
     - `{ method: 'POST',  pathIncludes: '/inventory/transfers' }`
     - `{ method: 'PATCH', pathIncludes: '/inventory/transfers' }`
- **Kutilgan:** WAREHOUSE roli transfer CRUD endpointlarga kira oladi

## T-471 | P1 | [BACKEND] | Auth /me javobiga branchId + branch qo'shish

- **Sana:** 2026-05-26
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/identity/identity.service.ts`
- **Muammo:** Mobileda user qaysi filialda ishlashini bilish kerak. Hozir `/me` javobida `branchId` yo'q.
- **Vazifa:**
  1. `getProfile()` select ga qo'shish:
     ```typescript
     branchId: true,
     branch: { select: { id: true, name: true, isWarehouse: true } },
     ```
- **Kutilgan:** `/me` javobida `branchId`, `branch: { id, name, isWarehouse }` qaytadi

---

# ══════════════════════════════════════════════════════════════
# MOBILE AUDIT NATIJALARI (2026-05-31)
# Mas'ul: Abdulaziz | Audit: Claude Code
# ══════════════════════════════════════════════════════════════

*(T-472, T-473, T-474, T-475 — BAJARILDI, Done.md 2026-05-31)*

---

*(T-476 — BAJARILDI, Done.md 2026-05-31)*

---

*(T-477 — BAJARILDI, Done.md 2026-05-31)*

---

# ══════════════════════════════════════════════════════════════
# MOBILE AUDIT NATIJALARI (2026-06-04) — kichik buglar
# Mas'ul: Abdulaziz | Audit: Claude Code (8 parallel mobile-reviewer)
# 31 tasdiqlangan bug (kod o'qib): P0×4, P1×9, P2×13, P3×4, +1 umbrella
# ══════════════════════════════════════════════════════════════

## T-481 | P0 | [BACKEND] | Order idempotency — backend dedup (mobile yarmi BAJARILDI)
- **Sana:** 2026-06-04
- **Mas'ul:** Ibrat (backend)
- **Fayl:** apps/api/ (sales orders create), `Idempotency-Key` header'ni o'qish
- **Mobile yarmi — BAJARILDI (Abdulaziz, 2026-06-04):** har order submission uchun barqaror `Idempotency-Key` HTTP header yuboriladi (`apps/mobile/src/api/sales.api.ts` createOrder), offline retry'da o'sha key qayta ishlatiladi (`OfflineQueueService` + `useSavdoOrder`). `packages/types`ga tegilmagan (header orqali). tsc 0 xato, adversarial review PASS.
- **QOLDI (Ibrat):** backend `Idempotency-Key` header'ni o'qib, takroriy `POST /sales/orders` ni **dedup** qilishi — server allaqachon yaratgan bo'lsa o'sha orderni qaytarish, 2-marta inventar yechimi/ledger YO'Q. Aks holda retry hali ham dublikat beradi (mobile kalit yuborsa ham).

## T-483 | P0 | [MOBILE] | Owner app READ-ONLY buzilgan — mutationlar ulangan
- **Fayl:** apps/mobile-owner/src/api/debts.api.ts:86 (recordPayment), employees.api.ts:114-144 (create/updateStatus/grant/revoke/delete) + tegishli screens
- **Muammo:** Owner App = read-only monitoring bo'lishi kerak (CLAUDE_MOBILE.md), lekin nasiya to'lovi (POST /nasiya/:id/pay) va xodim CRUD/fire/POS-access to'liq UI bilan ulangan — ledger/destruktiv mutationlar.
- **Kutilgan:** Owner faqat o'qishi. Team Lead qarori: ta'rifni yangilash + backend RBAC, YOKI mutationlarni olib tashlash.

## T-511 | P1 | [IKKALASI] | User create/edit e2e buzilgan — backend kontrakt mismatch
- **Sana:** 2026-06-04
- **Mas'ul:** Abdulaziz (mobile) + Ibrat (backend qaror)
- **Fayl:** apps/mobile/src/api/users.api.ts, screens/Settings/{UserFormSheet.tsx, useUserForm.ts}; apps/api Create/UpdateUserDto
- **Muammo:** T-486 routing fix (edit→PATCH) to'g'ri, lekin user create/edit hali backend'да **400** beradi (`forbidNonWhitelisted: true`, main.ts:62):
  1. **phone** — mobile yuboradi (form input + CreateUserBody/UpdateUserBody.phone), lekin backend User model (schema.prisma:74-110) va Create/UpdateUserDto'da `phone` YO'Q → 400 "property phone should not exist" (create VA edit).
  2. **email** — create'da `@IsEmail()` majburiy (create-user.dto.ts:15), lekin mobile formда email input YO'Q, `useUserForm:86` `email: ''` → 400 (create).
  3. **parol** — backend `@MinLength(8)` (create-user.dto.ts:20) vs mobile (qisqaroq).
- **Bo'linish:**
  - **Ibrat/Team Lead QAROR:** `phone` saqlanadimi? HA → backend User model + Create/UpdateUserDto ga `phone`. YO'Q → mobile'dan phone input+body olib tashlash.
  - **Mobile (Abdulaziz, qarordan keyin):** formга email input (create uchun); parol min 8; phone qarorini bajarish.

## T-488 | P1 | [MOBILE] | DebtPaymentForm — to'lov usuli label sifatida yuboriladi
- **Fayl:** apps/mobile/src/screens/Nasiya/DebtPaymentForm.tsx:52, 66
- **Muammo:** `PAYMENT_METHODS` labellari ('Naqd'/'Karta'/'Bank transfer') to'g'ridan `method` sifatida yuboriladi — backend enum (CASH/TERMINAL/TRANSFER) kutadi → 400. (Hozir DebtDetailScreen ulanmagan = dead-code, lekin ulansa barcha to'lov buziladi.)
- **Kutilgan:** label→enum map (PayModal/QuickPaySheet'dagi `METHOD_MAP`ni umumiy util'ga chiqarib qayta ishlatish — DRY).

## T-489 | P1 | [MOBILE] | useOfflineQueue auto-sync ishlamaydi
- **Fayl:** apps/mobile/src/hooks/useOfflineQueue.ts:26-30
- **Muammo:** Auto-process effekti faqat `[isOnline]` ga bog'langan, `status.pending` stale. Internet qaytganda pending order avtomatik yuborilmaydi (faqat qo'lda processQueue ishlaydi).
- **Kutilgan:** `isOnline` true bo'lganda avval `refresh()`, keyin pending tekshirish (idempotency bo'lgach xavfsiz).

## T-490 | P1 | [MOBILE] | useBtPrinter — unmount'da `connect('')` (disconnect emas)
- **Fayl:** apps/mobile/src/hooks/useBtPrinter.ts:75-79
- **Muammo:** Cleanup BT printerni uzish uchun `BtManager.connect('')` (bo'sh MAC) chaqiradi — bu uzish emas. Socket ochiq qoladi → keyingi scan/connect xato ("device busy").
- **Kutilgan:** Interfeysga `disconnect()` qo'shib, cleanup'da haqiqiy `BtManager.disconnect()`.

## T-491 | P1 | [MOBILE] | Owner useAlerts — queryKey'da filter yo'q
- **Fayl:** apps/mobile-owner/src/hooks/useAlerts.ts:20-28, screens/Alerts/index.tsx:42,54
- **Muammo:** queryKey faqat `branchId`, lekin queryFn `statusFilter`/`priorityFilter` yuboradi → filter o'zgarsa refetch bo'lmaydi. Real datada priority/status chiplar UMUMAN ishlamaydi.
- **Kutilgan:** queryKey'ga filterlar qo'shilsin (`[...,statusFilter,priorityFilter]`).

## T-492 | P1 | [MOBILE] | SalesOrderDetail — to'lov usuli labellari to'liqsiz
- **Fayl:** apps/mobile/src/screens/SalesOrders/SalesOrderDetailScreen.tsx:34-38, 91-94
- **Muammo:** `METHOD_LABELS` faqat CASH/CARD/CREDIT'ni biladi; real metodlar NAQD/KARTA/NASIYA/PAYME/CLICK/UZUM → label topilmay xom qiymat ko'rsatiladi (enum case/til mismatch).
- **Kutilgan:** Barcha real metodlar uchun label; kalitni `.toUpperCase()` bilan solishtirish.

## T-493 | P2 | [MOBILE] | PaymentSheet — yolg'on "To'lov tasdiqlandi"
- **Fayl:** apps/mobile/src/screens/Savdo/PaymentSheet.tsx:78-82
- **Muammo:** `handleConfirm` darhol success view'ga o'tadi; `onConfirm` (createOrder) 4xx/5xx fail bo'lsa Alert chiqadi, lekin sheet allaqachon "To'lov tasdiqlandi" ko'rsatadi → yolg'on muvaffaqiyat.
- **Kutilgan:** Success faqat order haqiqatan yaratilgach; xatoda confirm holatiga qaytish (onConfirm Promise + loader).

## T-494 | P2 | [MOBILE] | OnlinePaymentSheet — setTimeout cleanup yo'q
- **Fayl:** apps/mobile/src/screens/Savdo/OnlinePaymentSheet.tsx:68
- **Muammo:** `setTimeout(onSuccess, 1500)` ref'ga saqlanmaydi/tozalanmaydi. 1.5s ichida unmount bo'lsa unmount qilingan komponentda `onSuccess` (cart double-clear).
- **Kutilgan:** `successTimerRef` + cleanup/cancel'da `clearTimeout`.

## T-495 | P2 | [MOBILE] | PaymentSheet — ochiqligida item o'chsa input reset
- **Fayl:** apps/mobile/src/screens/Savdo/PaymentSheet.tsx:63-71
- **Muammo:** reset useEffect deps `[visible, total]`. Sheet ochiq turganda item o'chirilsa `total` o'zgaradi → `received`/`method`/`split` majburan reset (kiritilgan summa yo'qoladi).
- **Kutilgan:** Reset faqat ochilishda (`visible` false→true); `total` deps'dan olib tashlansin.

## T-496 | P2 | [MOBILE] | NewTesterSheet — 1 ombor stsenariysida tugma disabled
- **Fayl:** apps/mobile/src/screens/Ombor/NewTesterSheet.tsx:81-84
- **Muammo:** Ombor 1 ta bo'lsa auto-select effekti `[warehouses.data]` ga bog'langan, `visible`ga emas. Qayta ochilganda data o'zgarmasa auto-select ishlamaydi → `selectedWarehouse` bo'sh, "Tester ochish" doim disabled (picker ham 1 ombor uchun yashirin).
- **Kutilgan:** Auto-select `visible`ga ham bog'lansin.

## T-497 | P2 | [MOBILE] | Deep-link / push navigatsiya buzilgan (umbrella)
- **Fayl:** apps/mobile/src/navigation/linking.ts:49-51, navigation/types.ts:110, notifications/handlers.ts:29-45
- **Muammo:** linking config `SaleDetail`/`AlertDetail`ni root deb belgilaydi, lekin ular nested (yoki ro'yxatda yo'q) → deep link no-op. `SaleDetail` param `saleId` vs ekran `orderId` mismatch. `notifications/handlers.ts` mavjud bo'lmagan tab nomlariga (`InventoryTab`...) yo'naltiradi va listener'ga ulanmagan.
- **Kutilgan:** linking config real nested strukturaga moslansin; bitta param nomi; handlers real tab nomlari + listener ulanishi.

## T-498 | P2 | [MOBILE] | BiometricScreen — unmount guard yo'q + nav stack
- **Fayl:** apps/mobile/src/screens/Auth/BiometricScreen.tsx:34-78, 58
- **Muammo:** `attemptBiometric` async tugagach unmount guardsiz `setState` (prompt ochiqligida fallback bosilsa). `navigate('Login')` Biometric'ni stackда qoldiradi (Android back → qayta Biometric).
- **Kutilgan:** `isMounted`/`active` flag; `navigate('Login')` o'rniga `popToTop()`.

## T-499 | P2 | [MOBILE] | Analytics FlatList — `extraData` yo'q
- **Fayl:** apps/mobile/src/screens/Analytics/MarginAnalysisScreen.tsx:152-154, CashierPerformanceScreen.tsx
- **Muammo:** `renderItem` `maxProfit`/`maxRevenue`ga bog'langan, lekin FlatList'da `extraData` yo'q → sort/filter o'zgarganda bar foizlari stale render bo'lishi mumkin.
- **Kutilgan:** `extraData={maxProfit}` / `extraData={maxRevenue}`.

## T-500 | P2 | [MOBILE] | client.ts — refresh-mutex race + user JSON guard
- **Fayl:** apps/mobile/src/api/client.ts:33-81, 48-51
- **Muammo:** `refreshPromise` `finally`da darhol null — yuqori parallel 401'da nozik oraliqda 2-refresh yuborilishi (token rotation → keraksiz logout). Buzilgan `user` JSON → jim logout (diagnostikasiz).
- **Kutilgan:** Mutex faqat to'liq settle bo'lгач null; user parse alohida guard + diagnostika.

## T-501 | P2 | [MOBILE] | Bottom-sheet — yopilish animatsiyasida kontent flash
- **Fayl:** apps/mobile/src/screens/Ombor/index.tsx:204-211, ProductStockDetailSheet.tsx:104,121
- **Muammo:** Modal (`animationType="slide"`) `onClose`da `item` darhol `null` — yopilish animatsiyasida sarlavha "Mahsulot"/"0 dona"/"MAVJUD" (yashil) ga sakraydi (xato holat flash).
- **Kutilgan:** Yopilishni `onDismiss`/`onModalHide`ga ko'chirish yoki oxirgi `item`ni saqlash. (Bir nechta sheet'da takrorlanadi — pattern.)

## T-502 | P2 | [MOBILE] | Expiry empty-state — til o'zgarganda yangilanmaydi
- **Fayl:** apps/mobile/src/screens/Expiry/index.tsx:106-118
- **Muammo:** `renderEmpty` useCallback deps `[tab]`, ichida `t(...)` — til o'zgarsa empty matn eski tilda qotadi.
- **Kutilgan:** deps `[tab, t]`.

## T-503 | P2 | [MOBILE] | DebtCard — yaroqsiz sana guard yo'q
- **Fayl:** apps/mobile/src/screens/Nasiya/DebtCard.helpers.ts:41
- **Muammo:** `new Date(dueDate)` yaroqsiz backend sanasida `Invalid Date` → UI'da "Invalid Date" matni; `overdueDays`/bucket `NaN`.
- **Kutilgan:** `if (isNaN(d.getTime())) return 'Muddat belgilanmagan'`. (Markaziy `safeDate()` helper tavsiya — bir nechta joyda.)

## T-504 | P2 | [MOBILE] | PayModal — modal/fokus race
- **Fayl:** apps/mobile/src/screens/Nasiya/PayModal.tsx:148-151, DebtDetailSheet.tsx:104
- **Muammo:** "To'lov qilish"da `onClose(); onPay(debt);` ketma-ket — sheet yopilishi va PayModal (`autoFocus`) ochilishi race (ba'zan klaviatura ochilmaydi/modal kech).
- **Kutilgan:** `onPay`ni sheet `onDismiss` ichida yoki `requestAnimationFrame` bilan.

## T-505 | P2 | [MOBILE] | InvoicesScreen — noma'lum status badge'ga sanalmaydi
- **Fayl:** apps/mobile/src/screens/Ombor/InvoicesScreen.tsx:62-68
- **Muammo:** counts faqat ALL/PENDING/RECEIVED/CANCELLED. Backend yangi status (DRAFT/PARTIAL...) qaytarsa hech qaysi badge'ga sanalmaydi, filterdan ham tushadi (ALL ≠ yig'indi).
- **Kutilgan:** Noma'lum status `OTHER` bucket yoki kamida ALL'da; backend enum bilan moslik.

## T-506 | P3 | [MOBILE] | MonthlyProfitCard — `grossProfit` ko'rsatilmaydi
- **Fayl:** apps/mobile/src/screens/Dashboard/MonthlyProfitCard.tsx:13-20, 64-70
- **Muammo:** `grossProfit` prop uzatiladi, lekin destructure qilinmay ko'rsatilmaydi — breakdownда COGS bor, "Yalpi foyda" qatori yo'q.
- **Kutilgan:** COGS'dan keyin "Yalpi foyda" qatori (yoki prop'ni olib tashlash).

## T-507 | P3 | [MOBILE] | formatCompact — manfiy qiymat formatlanmaydi
- **Fayl:** apps/mobile/src/utils/currency.ts (formatCompact)
- **Muammo:** Faqat musbat uchun `>=` tekshiradi; manfiy (`-2500000`) barcha shartdan o'tib `String(Math.round())` — xom chiqadi. RevenueCard/SalesStatsGrid ishlatadi.
- **Kutilgan:** `const sign = amount<0?'-':''; amount=Math.abs(amount)` + natijaga `sign`.

## T-508 | P3 | [MOBILE] | RealEstate MonthlyChart — amount undefined → NaN bar
- **Fayl:** apps/mobile/src/screens/RealEstate/MonthlyChart.tsx:72
- **Muammo:** `payment.amount` null/undefined bo'lsa `barHeight` NaN → bar ko'rinmaydi.
- **Kutilgan:** `Number(p.amount) || 0`.

## T-509 | P3 | [MOBILE] | Owner BiometricScreen — post-login biometrika dekorativ
- **Fayl:** apps/mobile-owner/src/screens/Auth/BiometricScreen.tsx:17-30, LoginScreen.tsx:51-52
- **Muammo:** `login()` darhol `isAuthenticated=true` → RootNavigator Auth tree'ni almashtiradi, `replace('Biometric')` amalda ko'rinmaydi. Biometrik gating ishlamaydi.
- **Kutilgan:** Biometrikni login OLDIDAN (saqlangan token bilan) yoki alohida `isUnlocked` state bilan.

## T-510 | P3 | [MOBILE] | Systemic — 250 qatordan oshgan ~46 komponent fayl
- **Fayl:** apps/mobile/src/screens/Analytics/DeadStockScreen.tsx (341), CashierPerformanceScreen (333), Savdo/PaymentSheet (332), Nasiya/index (328), Nasiya/PayModal (328), SalesOrders/index (327)... (~46 ta)
- **Muammo:** CLAUDE_MOBILE.md max 250 qator/fayl limitini buzadi (refactor, bug emas). i18n/type fayllar bundan mustasno.
- **Kutilgan:** Hooks/sub-component'larga bo'lish (SRP). Bosqichma-bosqich.
