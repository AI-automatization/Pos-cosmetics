# RAOS — OCHIQ VAZIFALAR (Kosmetika POS MVP)
# Yangilangan: 2026-04-19 (T-056 yopildi)
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

## T-078 | P0 | [BACKEND] | НДС 12% hisoblanmayapti — taxAmount har doim 0

- **Sana:** 2026-04-19
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/sales/sales.service.ts:334`
- **Muammo:** Buyurtma yaratishda `taxAmount: 0` hardcoded.
  ```typescript
  taxAmount: 0,  // ← HECH QACHON o'zgartirilmaydi
  ```
  `fiscal-adapter.service.ts` da `vatRate: 0.12` bor, lekin faqat REGOS ga yuboriladi.
  Aslida har buyurtmada: `taxAmount = total * 0.12 / 1.12` (tax-inclusive narxlar uchun).
- **Natija:** Barcha cheklar noto'g'ri — soliq 0 ko'rsatiladi. Z-report ham noto'g'ri.
- **Kutilgan:** Har product uchun `is_taxable` flag va order da to'g'ri NDS hisoblash.

---

## T-350 | P0 | [BACKEND] | Real estate controller — barcha routelar bo'sh

- **Sana:** 2026-03-09 | **Yangilangan:** 2026-04-19
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/realestate/realestate.controller.ts`
- **Muammo:** `@Controller('real-estate')` bor, lekin ichida route yo'q.
  Frontend `/realestate` sahifasi ishlamaydi (stub response bor, real CRUD yo'q).
- **Kerakli endpointlar:**
  ```
  GET  /real-estate/properties        → mulklar ro'yxati
  GET  /real-estate/stats             → RealEstateStats (occupancy, ROI, income)
  GET  /real-estate/rental-payments   → ijara to'lovlari
  GET  /real-estate/payments          → barcha to'lovlar
  ```
- **Kutilgan:** Frontend `/realestate` sahifasi real data ko'rsatadi

---

## T-138 | P0 | [BACKEND] | GET /sales/shifts/current — smena statistikasi yo'q

- **Sana:** 2026-03-12
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/sales/sales.service.ts`
- **Muammo:** `GET /sales/shifts/current` smena qaytaradi, lekin `stats` field yo'q.
  Mobile Sales ekrani smena kartasida: TUSHUM, SONI, O'RTACHA ko'rsatishi kerak.
- **Kerakli response:**
  ```json
  {
    "id": "...",
    "cashierName": "Azamat",
    "openedAt": "...",
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

---

## T-139 | P0 | [BACKEND] | GET /sales/orders — paymentMethod field tekshirish

- **Sana:** 2026-03-12 | **Yangilangan:** 2026-04-19
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/sales/sales.service.ts`
- **Muammo:** Mobile `paymentMethod` fieldini kutadi. `fix(sales)` commitda `payments[]` dan
  extract qilindi — lekin mobile da to'g'ri ko'rsatilishini verify qilish kerak.
- **Kutilgan:** `{ id, orderNumber, createdAt, itemsCount, total, paymentMethod }` — `paymentMethod` NAQD/KARTA/NASIYA

---

## T-140 | P0 | [BACKEND] | POST /inventory/stock-in — mobile contract moslashtirish

- **Sana:** 2026-03-12
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/inventory/warehouse-invoice.service.ts`
- **Muammo:** Mobile Kirim ekrani yuboradigan format:
  ```json
  { "supplierId": "...", "supplierName": "...", "invoiceNumber": "...",
    "items": [{ "productId": "...", "quantity": 50, "costPrice": 40000,
                "batchNumber": "B001", "expiryDate": "2027-01-01" }] }
  ```
  Backend `POST /warehouse/invoices` bilan format mos kelishi kerak.
- **Kutilgan:** Response: `{ id, receiptNumber, date, totalCost, itemsCount, status: "RECEIVED" }`

---

## T-220 | P0 | [BACKEND] | Owner Panel — barcha endpointlar Postman/Swagger test

- **Sana:** 2026-03-12
- **Mas'ul:** Ibrat
- **Fayl:** Swagger: `http://localhost:3000/api/v1/docs`
- **Vazifa:** `apps/mobile-owner` panel uchun kerakli barcha endpointlar ishlashini tasdiqlash:
  ```
  □ GET /analytics/revenue          → 4 ta metric
  □ GET /analytics/sales-trend      → 30 kun grafik
  □ GET /analytics/branch-comparison→ filiallar
  □ GET /analytics/top-products     → top 5
  □ GET /analytics/stock-value      → byBranch
  □ GET /inventory/stock            → pagination, status filter
  □ GET /shifts/:id                 → paymentBreakdown bilan
  □ GET /debts/summary              → totalDebt, overdueDebt
  □ GET /debts/aging-report         → 4 bucket
  □ GET /employees/performance
  □ GET /alerts
  □ GET /system/health
  ```

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P1 (MUHIM)
# ══════════════════════════════════════════════════════════════

---

## T-054 | P1 | [BACKEND] | Nasiya reminders — Telegram/SMS eslatmalar

- **Sana:** 2026-02-26
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/notifications/`
- **Vazifa:**
  - Muddatdan 3 kun oldin: Telegram reminder
  - Overdue bo'lganda: kunlik eslatma (max 3 kun, keyin haftalik)
  - Template: "Hurmatli [ism], [do'kon]da [X] so'm qarzingiz bor. Muddat: [sana]"
  - Tenant settings: enabled/disabled toggle
- **Kutilgan:** Xaridorga avtomatik qarz eslatmasi yuboriladi

---

## T-081 | P1 | [BACKEND] | REGOS fiskal — real credentials va prod test

- **Sana:** 2026-02-26 | **Yangilangan:** 2026-04-19
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/tax/fiscal-adapter.service.ts`
- **Holat:** Kod tayyor — `isReal` flag `REGOS_API_URL` env bo'lsa real API chaqiradi.
  Yo'q bo'lsa stub ishlaydi (prod da ham stub ishlaydi!).
- **Kerak:**
  - `REGOS_API_URL` va `REGOS_API_KEY` production `.env` ga qo'yish
  - Real chek yuborish testi (staging da)
  - Muvaffaqiyatsiz holatda queue retry ishlashini tekshirish
- **Kutilgan:** Prod da har savdoda soliq idorasiga chek ketadi

---

## T-344 | P1 | [BACKEND] | POST /warehouse/invoices — supplierName ixtiyoriy emas

- **Sana:** 2026-03-28
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/inventory/dto/warehouse-invoice.dto.ts`
- **Muammo:** Mobile Kirim ekrani `supplierName` yuborilmasa 400/422 xato beradi.
  Kладовщик har doim yetkazuvchi nomini bilmaydi.
- **Yechim:** `supplierName` da `@IsOptional()` + default `null` yoki `"Noma'lum"`
- **Kutilgan:** `supplierName` siz ham nakladnoy yaratiladi

---

## T-347 | P1 | [IKKALASI] | ibrat/feat-backend-updates — zona buzilishi

- **Sana:** 2026-04-15 | **Yangilangan:** 2026-04-19
- **Mas'ul:** Ibrat
- **Muammo:** `ibrat/feat-backend-updates` branchida Abdulaziz zonasidagi fayllar o'zgargan:
  - `apps/mobile/src/api/inventory.api.ts` — type interfeyslari o'chirib `any` qo'shilgan ❌
  - `apps/mobile/src/screens/Smena/index.tsx` — eslint-disable comment qo'shilgan
  - `any` type CLAUDE.md da TAQIQLANGAN
- **Yechim:**
  1. `apps/mobile/` o'zgarishlarini bu branchdan revert qilish
  2. Abdulazizga alohida task ochib topshirish
- **Risk:** Merge bo'lsa TypeScript strict buziladi + zona qoidasi buziladi

---

## T-348 | P1 | [DEVOPS] | Stale branchlarni tozalash

- **Sana:** 2026-04-15 | **Yangilangan:** 2026-04-19
- **Mas'ul:** Ibrat
- **Muammo:** Remote branchlarda keraksizlar:
  - `ibrat/feat-backend-updates` — T-347 hal bo'lgach merge yoki close
  - `ibrat/feat-frontend-updates` — tekshirib merge qilish
  - `ibrat/chore-tasks-sync` — allaqachon merge, o'chirish kerak
- **Yechim:** `git push origin --delete <branch>`

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P2 (O'RTA, MVP dan keyin)
# ══════════════════════════════════════════════════════════════

---

## T-040 | P2 | [BACKEND] | Telegram bot — Low stock, shift close, refund alertlar

- **Sana:** 2026-02-26
- **Mas'ul:** Ibrat
- **Fayl:** `apps/bot/`
- **Vazifa:** Triggerlar: low stock alert, shift yopilish hisoboti, refund > threshold, expired stock
  `/report` command — bugungi savdo summary
- **Kutilgan:** Admin Telegram dan alertlar oladi

---

## T-096 | P2 | [BACKEND] | Tester/sample tracking — Ochilgan tester hisobi

- **Sana:** 2026-02-26
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/inventory/`
- **Vazifa:** `stock_movement` type = TESTER. Tester cost expense sifatida.
  `GET /inventory/testers` — qaysi productlardan tester ochilgan.
- **Kutilgan:** Tester xarajati to'g'ri hisoblanadi

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

## T-118 | P3 | [BACKEND] | 1C export — Buxgalteriya integratsiya
- **Sana:** 2026-02-26
- **Vazifa:** Savdo/xarid datalarini 1C-compatible XML formatda export.

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
