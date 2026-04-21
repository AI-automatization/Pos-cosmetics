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

## T-348 | P1 | [DEVOPS] | ibrat/feat-backend-updates — merge yoki close qaror

- **Sana:** 2026-04-15 | **Yangilangan:** 2026-04-20
- **Mas'ul:** Ibrat
- **Holat:** `ibrat/feat-frontend-updates` va `ibrat/chore-tasks-sync` — O'CHIRILDI ✅
- **Qolgan:** `ibrat/feat-backend-updates` — 2 ta nesmerj commit:
  - `feat(api): backend updates — inventory approve/reject, employees, nasiya, tasks, notifications`
  - `fix(lint): remove unused LoadingSkeleton import in promotions/page.tsx`
- **Qaror kerak:** Bu commitlar main da allaqachon boshqa commit orqali kiritilganmi?
  Agar ha → `git push origin --delete ibrat/feat-backend-updates`
  Agar yo'q → main ga merge qilish kerak

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

---

# ══════════════════════════════════════════════════════════════
# WEB ↔ MOBILE PARITY (2026-04-21 audit)
# Mas'ul (hammasi): Abdulaziz | Zona: apps/mobile/ + apps/mobile-owner/
# Manba: docs/ auditi — web'da mavjud, mobile'da yo'q/cheklangan
# ══════════════════════════════════════════════════════════════

---

## T-349 | P1 | [MOBILE] | Owner — Finance P&L screen
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile-owner/src/screens/Finance/PnLScreen.tsx` (yangi)
- **Web referansi:** `apps/web/src/app/(admin)/finance/pnl/page.tsx`
- **Vazifa:** Revenue / COGS / Expense breakdown + period picker (Today/7d/30d/Custom). `GET /finance/pnl?from&to` dan foydalanish.
- **Kutilgan:** Owner telefondan pul oqimini ko'ra oladi. Empty/loading/error statelar bilan.

## T-350 | P1 | [MOBILE] | Owner — Expenses CRUD
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile-owner/src/screens/Finance/ExpensesScreen.tsx` (yangi)
- **Web referansi:** `apps/web/src/app/(admin)/finance/expenses/page.tsx`
- **Vazifa:** Kategoriya bo'yicha xarajatlar ro'yxati + add/edit/delete sheet. Pie chart (Victory Native).
- **Kutilgan:** Xarajatni telefondan kiritish mumkin, kategoriyaga ajratiladi.

## T-351 | P1 | [MOBILE] | Owner — Users & RBAC CRUD
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile-owner/src/screens/Settings/UsersScreen.tsx` (yangi)
- **Web referansi:** `apps/web/src/app/(admin)/settings/users/page.tsx`
- **Vazifa:** Foydalanuvchilar ro'yxati + role belgilash + filial biriktirish + activate/deactivate. Hozirgi HR invite to'liq RBAC emas.
- **Kutilgan:** Owner xodimga to'liq rol va zona bera oladi.

## T-352 | P1 | [MOBILE] | Staff — Sales Returns flow
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Sales/ReturnsScreen.tsx` + `NewReturnSheet.tsx`
- **Web referansi:** `apps/web/src/app/(admin)/sales/returns/page.tsx`
- **Vazifa:** Order tanlash → qaytariladigan itemlarni belgilash → sabab → approve. RBAC: Cashier create, Manager approve.
- **Kutilgan:** Kassir mijoz qaytarishini to'liq telefonda yopa oladi.

## T-353 | P1 | [MOBILE] | Staff — Warehouse Invoice detail
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Kirim/InvoiceDetailScreen.tsx` (yangi)
- **Web referansi:** `apps/web/src/app/(warehouse)/warehouse/invoices/[id]/page.tsx`
- **Vazifa:** Kirim invoice to'liq detail: items, supplier, total, approve/reject. Hozir faqat NewReceiptSheet bor.
- **Kutilgan:** Omborchi avval yaratilgan invoicelarni ko'radi va statusni boshqaradi.

## T-354 | P1 | [MOBILE] | Staff — Warehouse Write-off
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Ombor/WriteOffSheet.tsx` (yangi)
- **Web referansi:** `apps/web/src/app/(warehouse)/warehouse/write-off/page.tsx`
- **Vazifa:** Brak/yo'qolish/expired uchun chiqim akti: items + miqdor + sabab (enum WriteOffReason). Inventory movement type=WRITE_OFF.
- **Kutilgan:** Stock to'g'ri kamaytiriladi, ledger entry avtomatik.

## T-355 | P1 | [MOBILE] | Staff — Inventory Transfer approve flow
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Ombor/TransferInboxScreen.tsx` (yangi)
- **Web referansi:** `apps/web/src/app/(admin)/inventory/transfer/page.tsx`
- **Vazifa:** Hozir staff'da faqat request yuborish bor. Kelgan so'rovlarni approve/reject/ship oqimi yo'q. Manager/Warehouse role uchun inbox screen.
- **Kutilgan:** Filialaro transfer mobile'da to'liq ishlaydi.

## T-356 | P1 | [MOBILE] | Staff — Catalog Products CRUD (full)
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Catalog/ProductsScreen.tsx` + `ProductFormSheet.tsx`
- **Web referansi:** `apps/web/src/app/(admin)/catalog/products/`
- **Vazifa:** Hozir faqat ko'rish. Create/edit/archive + variant + barcode + supplier link + price edit.
- **Kutilgan:** Catalog menejer telefondan mahsulot boshqara oladi.

## T-357 | P1 | [MOBILE] | Staff POS — Bundle sotish
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Savdo/BundleDetailSheet.tsx` (yangi)
- **Web referansi:** `apps/web/src/app/(pos)/pos/BundleDetailModal.tsx`
- **Vazifa:** BundleItem'larni savatga qo'shish, komponent narxini ko'rsatish, to'plam narxi.
- **Kutilgan:** Kassir telefondan komplekt mahsulot sota oladi.

## T-358 | P1 | [MOBILE] | Staff POS — Weight Scale integratsiya
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Savdo/WeightScaleSheet.tsx` + native module
- **Web referansi:** `apps/web/src/app/(pos)/pos/WeightScaleWidget.tsx`
- **Vazifa:** Web Serial o'rniga mobile'da Bluetooth tarozi. Mos native bridge yoki 3rd-party scale lib. Savat item'ga g yoki kg miqdorda qo'shish.
- **Kutilgan:** Oziq-ovqat retail'da telefon POS ishlay oladi.

## T-359 | P1 | [MOBILE] | Staff POS — Split / mixed payments
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/screens/Savdo/PaymentSheet.tsx` (kengaytirish)
- **Web referansi:** `apps/web/src/app/(pos)/pos/PaymentPanel.tsx`
- **Vazifa:** Bitta orderda bir nechta payment method (cash+card, qisman nasiya). `PaymentIntent` split lifecycle'ga mos kelishi kerak.
- **Kutilgan:** Murakkab to'lovlarni telefondan yopish mumkin.

━━━━ P2 vazifalar ━━━━

## T-360 | P2 | [MOBILE] | Owner — Analytics (web 7-tab) to'liq
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Web referansi:** `apps/web/src/app/(admin)/analytics/page.tsx`
- **Vazifa:** Trend/Products/Margin/Cashiers/Heatmap/ABC/Stock — 7 tab. Hozir owner'da asosiy metrika bor, detallar yo'q.

## T-361 | P2 | [MOBILE] | Owner — Reports Builder
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Web referansi:** `apps/web/src/app/(admin)/reports/builder/page.tsx`
- **Vazifa:** Custom dimension × metric tanlash + chart turi.

## T-362 | P2 | [MOBILE] | Owner — Reports Export (CSV/Excel → Share)
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Web referansi:** `apps/web/src/app/(admin)/reports/export/page.tsx`
- **Vazifa:** Sales/Products/Inventory/Customers/Debts CSV. Mobile'da native Share sheet orqali.

## T-363 | P2 | [MOBILE] | Owner — Exchange Rates management
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Web referansi:** `apps/web/src/app/(admin)/finance/exchange-rates/page.tsx`
- **Vazifa:** CBU API'dan yangilash + qo'lda override + tarix chart.

## T-364 | P2 | [MOBILE] | Staff POS — Promotions/Aksiyalar
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Web referansi:** `apps/web/src/app/(admin)/promotions/page.tsx`
- **Vazifa:** Aktiv aksiyalarni ko'rish + POS savatida avtomatik qo'llanishi (BOGO/percent/gift).

## T-365 | P2 | [MOBILE] | Staff POS — Chegirma (manual discount)
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Web referansi:** `apps/web/src/app/(admin)/chegirma/page.tsx`
- **Vazifa:** Item-level va order-level chegirma qo'llash (percent yoki fixed). RBAC: Manager+ approve >10%.

## T-366 | P2 | [MOBILE] | Staff — Onboarding wizard
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Web referansi:** `apps/web/src/app/(admin)/onboarding/page.tsx`
- **Vazifa:** Staff app'da yangi xodim uchun 3-4 qadamli tanishtirish (Owner'da bor, staff'da yo'q).

## T-367 | P2 | [MOBILE] | Staff — Printer Settings
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Web referansi:** `apps/web/src/app/(admin)/settings/printer/page.tsx`
- **Vazifa:** Bluetooth/Wi-Fi printer tanlash, paper width, autoprint, model.

## T-368 | P2 | [MOBILE] | Owner — Billing / Subscription
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Web referansi:** `apps/web/src/app/(admin)/settings/billing/page.tsx`
- **Vazifa:** TRIAL/ACTIVE status, plan upgrade, invoice tarixi.

## T-369 | P2 | [MOBILE] | Owner — Reports: branches compare
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Web referansi:** `apps/web/src/app/(admin)/reports/branches/page.tsx`
- **Vazifa:** Filiallar bo'yicha revenue/orders/stock bar chart.

## T-370 | P2 | [MOBILE] | Owner — Reports: daily-revenue
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Web referansi:** `apps/web/src/app/(admin)/reports/daily-revenue/page.tsx`
- **Vazifa:** Kunlik savdo dinamikasi bar chart + period picker.

## T-371 | P2 | [MOBILE] | Owner — Reports: top-products
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Web referansi:** `apps/web/src/app/(admin)/reports/top-products/page.tsx`
- **Vazifa:** Eng ko'p sotilgan mahsulotlar (hozir Dashboard'da qisman bor).

## T-372 | P2 | [MOBILE] | Owner — Reports: shifts to'liq
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Web referansi:** `apps/web/src/app/(admin)/reports/shifts/page.tsx`
- **Vazifa:** Smena hisobotlari filter + aggregated metrics (hozir ShiftDetailScreen alohida-alohida bor).

## T-373 | P2 | [MOBILE] | Staff + Owner — Payments History
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Web referansi:** `apps/web/src/app/(admin)/payments/history/page.tsx`
- **Vazifa:** cash/card/transfer filter, reconciliation badge.

## T-374 | P2 | [MOBILE] | Staff — Nasiya Aging report
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Web referansi:** `apps/web/src/app/(admin)/nasiya/aging/page.tsx`
- **Vazifa:** 0-30/30-60/60-90/90+ pie chart (hozir owner'da bor, staff'da yo'q).

## T-375 | P2 | [MOBILE] | Owner — Settings/branches CRUD
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Web referansi:** `apps/web/src/app/(admin)/settings/branches/page.tsx`
- **Vazifa:** Filial yaratish/tahrirlash/o'chirish + user transfer. Hozir faqat BranchSelector bor.

## T-376 | P2 | [MOBILE] | Staff — Warehouse Expiry to'liq
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Web referansi:** `apps/web/src/app/(warehouse)/warehouse/expiry/page.tsx`
- **Vazifa:** Batch/expiry filter + qisqa muddatda tugaydigan mahsulotlar alerti.

## T-377 | P2 | [MOBILE] | Staff — Catalog Categories CRUD
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Web referansi:** `apps/web/src/app/(admin)/catalog/categories/page.tsx`
- **Vazifa:** Ierarxik daraxt: create/rename/move/delete (empty category).

## T-378 | P2 | [MOBILE] | Staff — Catalog Suppliers CRUD (full)
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Web referansi:** `apps/web/src/app/(admin)/catalog/suppliers/page.tsx`
- **Vazifa:** Hozir Kirim ichida mini form bor. Alohida screen: detail, contactlar, invoicelar.

## T-379 | P2 | [MOBILE] | Staff — Customer Detail page
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Web referansi:** `apps/web/src/app/(admin)/customers/[id]/page.tsx`
- **Vazifa:** Order tarixi, nasiya, loyalty, kontakt. Hozir faqat Nasiya orqali qisman.

## T-380 | P2 | [MOBILE] | Staff POS — Customer Display (ikkinchi ekran)
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Web referansi:** `apps/web/src/app/(pos)/pos/customer-display/page.tsx`
- **Vazifa:** Tablet POS uchun ikkinchi ekran broadcast. Mobile'da qo'shimcha monitor yo'q bo'lsa ham iPad use-case uchun foydali.

## T-381 | P2 | [MOBILE] | Staff + Owner — Inventory Movements filter
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Web referansi:** `apps/web/src/app/(admin)/inventory/movements/page.tsx`
- **Vazifa:** IN/OUT/TRANSFER/WRITE_OFF filter + date range + product filter.

━━━━ P3 vazifalar ━━━━

## T-382 | P3 | [MOBILE] | Owner — Audit Log viewer
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Web referansi:** `apps/web/src/app/(admin)/settings/audit-log/page.tsx`
- **Vazifa:** CREATE/UPDATE/DELETE/LOGIN filter. Kelajak — security compliance uchun.

## T-383 | P3 | [MOBILE] | Owner — Real Estate module
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile-owner/src/screens/RealEstate/` (yangi — staff'da bor, owner'da YO'Q)
- **Vazifa:** Mulklar ro'yxati, ijarachi, to'lovlar, ROI. Staff app'da mavjud ekranlarni owner app'ga port qilish.
