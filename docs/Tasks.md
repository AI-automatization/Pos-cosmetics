# RAOS — OCHIQ VAZIFALAR (Kosmetika POS MVP)
# Yangilangan: 2026-05-02
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

*(T-387, T-388, T-389 — Done.md ga ko'chirildi 2026-04-25)*

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P1 (MUHIM)
# ══════════════════════════════════════════════════════════════

---

*(T-390 — Done.md ga ko'chirildi 2026-04-25)*

---

*(T-391 — Done.md ga ko'chirildi 2026-04-25)*

---

*(T-392 — Done.md ga ko'chirildi 2026-05-01)*

---

*(T-393 — Done.md ga ko'chirildi 2026-05-01)*

---

*(T-396 — Done.md ga ko'chirildi 2026-05-01)*

---

## T-399 | P1 | [IKKALASI] | Global i18n — 3 til (uz/ru/en) + auto-translate ma'lumotlar

- **Sana:** 2026-05-02
- **Mas'ul:** Ibrat
- **Scope:** Owner/Admin panel, POS (Cashier), Warehouse, Manager, Super Admin
- **Muammo:** POS UI ~70-80% hardcoded Uzbek. Admin panel ham hardcoded. Foydalanuvchi Ruscha yozsa product nomi ham 3 tilga auto-translate bo'lishi kerak.
- **Infrastructure:** `apps/web/src/i18n/` mavjud (uz.json, ru.json, en.json) lekin to'liq qo'llanilmagan
- **3 Faza:**
  - **Faza 1** — UI Labels: hardcoded stringlar → `t('key')` (POS + Admin)
  - **Faza 2** — Schema: `Product/Category/Unit` ga `name_uz, name_ru, name_en` qo'shish + migration
  - **Faza 3** — Auto-translate service: `apps/api/src/common/translate/translate.service.ts` (Google Translate API yoki LibreTranslate)
- **Kutilgan:** Til tanlanganda butun UI o'zgaradi; product yaratishda auto 3-til tarjima

---

## T-384 | P1 | [FRONTEND] | Founder Panel — to'liq Ruscha tarjima

- **Sana:** 2026-04-21
- **Mas'ul:** Ibrat
- **Fayl:** Barcha `apps/web/src/app/(founder)/` va `apps/web/src/components/layout/FounderSidebar.tsx`
- **Muammo:** 3 til aralashgan — Sidebar: Ruscha, Kontentlar: O'zbekcha, Sarlavhalar: Inglizcha
- **Vazifa:**
  - FounderSidebar.tsx — allaqachon Ruscha (OK)
  - Overview page — "Founder Overview" → "Обзор", "Jami tenantlar" → "Всего тенантов" va h.k.
  - Tenants list — "Barchasi/Faol/Nofaol" → "Все/Активные/Неактивные" va h.k.
  - Tenant detail — tablar "Obzor/Obuna/Foydalanuvchilar" → "Обзор/Подписка/Пользователи"
  - Tenant new wizard — "Kompaniya/Vladelec/Tarif/Tasdiqlash" → "Компания/Владелец/Тариф/Подтверждение"
  - Database Manager — "Jadvallar/Hajm/Ulanishlar" → "Таблицы/Размер/Соединения"
  - Errors page — "Barchasi/Xato topilmadi" → "Все/Ошибок не найдено"
  - Admin Login — "Parol/Kirish" → "Пароль/Войти"
  - Sidebar bottomda: "Admin panelga" → "← В админ-панель", "Chiqish" → "Выйти"
- **Kutilgan:** Butun Founder Panel 100% Ruscha

---

---

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P2 (O'RTA, MVP dan keyin)
# ══════════════════════════════════════════════════════════════

---

*(T-394 — Done.md ga ko'chirildi 2026-05-02)*

---

## T-395 | P2 | [FRONTEND] | Owner panel — Prikhod (Stock-In) OWNER roldan yashirish

- **Sana:** 2026-05-02
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/src/components/layout/Sidebar.tsx`, `apps/web/src/app/(admin)/inventory/page.tsx`
- **Muammo:** OWNER role faqat ko'rishi kerak, kirim (stock-in) yara olmasligi kerak
- **Kutilgan:** OWNER uchun "Kirim qo'shish" button va link ko'rinmaydi

---

## T-397 | P2 | [BACKEND] | Top mahsulotlar — ordersCount backend dan kelmaydigan

- **Sana:** 2026-05-02
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/ai/ai.service.ts`
- **Muammo:** `getTopProducts()` `ordersCount` qaytarmaydi. Frontend kolonnasi bor lekin `undefined`
- **Kutilgan:** SQL ga `COUNT(DISTINCT o.id) as orders_count` qo'shish

---

## T-398 | P2 | [FRONTEND] | Kunlik daromad — sahifa scroll qo'shish

- **Sana:** 2026-05-02
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/src/app/(admin)/reports/daily-revenue/page.tsx`
- **Muammo:** Ko'p ma'lumot bo'lganda sahifa scroll bo'lmaydi
- **Kutilgan:** `overflow-y-auto h-full` wrapper + table scroll

---

## T-380 | P2 | [BACKEND+FRONTEND] | Super Admin — Billing & Monetizatsiya

- **Sana:** 2026-04-21
- **Mas'ul:** Ibrat
- **Holat:** OCHIQ (billing API hali sotib olinmagan)
- **Fayl:** `apps/api/src/admin/admin-billing.controller.ts` (yaratish kerak)
- **Vazifa:**
  - `GET /admin/billing/overview` — MRR, ARR, subscribers, conversion rate, plan distribution
  - `GET /admin/billing/plans` — barcha planlar + subscriber count
  - `POST /admin/billing/plans` — plan yaratish
  - `PATCH /admin/billing/plans/:id` — plan tahrirlash
  - `DELETE /admin/billing/plans/:id` — plan deaktivatsiya
  - `GET /admin/billing/subscriptions` — barcha obunalar + filtrlar
  - `GET /admin/billing/revenue-history` — MRR trend (6 oy)
  - Frontend: `/founder/billing` — KPI kartalar, pie chart, plan CRUD, subscription table
- **Eslatma:** Payme/Click integratsiya hali yo'q (T-107). Hozircha faqat manual subscription management.
- **Kutilgan:** Admin planlarni boshqara oladi, MRR/ARR ko'ra oladi, obunalarni override qila oladi

---

---

## T-097 | P2 | [BACKEND] | Product sertifikat — Kosmetika sifat hujjati

- **Sana:** 2026-02-26
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/catalog/`
- **Vazifa:** `product_certificates` CRUD (cert_number, issuing_authority, issued_at, expires_at, file_url).
  Expired sertifikat → alert.
- **Kutilgan:** Sertifikat ma'lumotlari saqlanadi va kuzatiladi

---

## T-107 | P2 | [BACKEND] | Payme/Click integratsiya — Online to'lov

- **Sana:** 2026-02-26
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/payments/providers/`
- **Vazifa:** Payme adapter (createTransaction, performTransaction, checkTransaction).
  Click adapter (prepare, complete). Webhook handler.
- **Kutilgan:** Online to'lov usullari ishlaydi

---

## T-378 | P2 | [MOBILE] | mobile-owner: EmployeeRole type mismatch — lowercase → UPPERCASE

- **Sana:** 2026-04-21
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile-owner/src/api/employees.api.ts`, `screens/HR/HRInviteSheet.tsx`, `screens/Employees/components/RoleSelector.tsx`
- **Muammo:** `EmployeeRole = 'cashier' | 'manager' | 'admin'` — lowercase. Backend Prisma enum `CASHIER | MANAGER | ADMIN | WAREHOUSE` kutadi. Yaratish Prisma da fail bo'ladi.
- **Vazifa:** `EmployeeRole` type ni UPPERCASE ga o'zgartirish + ROLES array labellarni yangilash
- **Kutilgan:** `POST /employees` muvaffaqiyatli ishlaydi

---

## T-379 | P2 | [MOBILE] | mobile-owner: AddEmployeeScreen — backend qo'llamaydigan fieldlarni tozalash

- **Sana:** 2026-04-21
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile-owner/src/screens/Employees/AddEmployeeScreen.tsx`, `employees.api.ts` `CreateEmployeeDto`
- **Muammo:** `CreateEmployeeDto` da `login`, `dateOfBirth`, `passportId`, `address` bor — backend User modelida yo'q, faqat `{ firstName, lastName, email, password, role, phone }` saqlanadi.
- **Vazifa:** `login` field olib tashlash (login = email). Qolgan extra fieldlarni `botSettings` da saqlash uchun backend endpoint kengaytirish yoki formdan olib tashlash.
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

---

## T-116 | P3 | [BACKEND] | Customer loyalty — Points + tiers
- **Sana:** 2026-02-26
- **Vazifa:** Earn points (1 point/1000 UZS). Tiers: Bronze/Silver/Gold. Birthday bonus. Redeem as payment.

## T-119 | P3 | [BACKEND] | Marketplace sync — Uzum/Sello
- **Sana:** 2026-02-26
- **Vazifa:** Catalog sync, stock sync, order import. Omnichannel.

## T-120 | P3 | [BACKEND] | AI forecasting — Seasonal demand prediction
- **Sana:** 2026-02-26
- **Vazifa:** Kosmetika seasonal (sunscreen yoz, moisturizer qish, gift sets 8-Mart).
  O'tgan yil datasi bo'yicha buyurtma tavsiya.

## T-121 | P3 | [BACKEND] | Google Sheets export — Automated daily data
- **Sana:** 2026-02-26
- **Vazifa:** Kunlik savdo data → linked Google Sheet. Scheduled cron.
