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
# MOBILE PARITY BACKEND DEPENDENCIES (2026-04-21 audit)
# Mas'ul (hammasi): Ibrat | Manba: T-349..T-353 mobile spec auditlari
# Mobile (Abdulaziz) T-349..T-353 ishlari uchun kerakli backend fix'lar
# ══════════════════════════════════════════════════════════════

---

## T-349-A | P1 | [BACKEND] | /finance/pnl — expensesByCategory + branchId
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/finance/finance.service.ts:102-152`
- **Muammo:** `/finance/pnl` qaytarmaydi `expensesByCategory`. Web `ProfitReport` type'i bu maydonni talab qiladi, frontend adapter default `[]` beradi → P&L sahifasida "Xarajatlar taqsimoti" doimo bo'sh. Shu bilan birga `branchId` filter ham yo'q.
- **Vazifa:** Response shape'ga `expensesByCategory: Array<{category, total, count}>` qo'shish (`expense.groupBy({category})` bilan). `branchId?` query param qabul qilish. `packages/types/src/reports.ts` ga `FinancePnl` shared type chiqarish (web + mobile + Prisma bilan birga).
- **Kutilgan:** Mobile T-349 va web bir xil endpoint'dan to'liq data oladi.

---

## T-350-A | P1 | [BACKEND] | PATCH /finance/expenses/:id — Update endpoint
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/finance/finance.controller.ts` + `finance.service.ts`
- **Muammo:** Expense edit endpoint mavjud emas. Web faqat create+delete, mobile ham edit qila olmaydi.
- **Vazifa:** `PATCH /finance/expenses/:id` + `UpdateExpenseDto` (amount/category/description/date partial). RBAC: OWNER+ADMIN. Tenant isolation. Ledger re-emit (T-350-B bilan birga).
- **Kutilgan:** Mobile T-350 edit flow ishlaydi.

---

## T-350-B | P1 | [BACKEND+LEDGER] | Expense.create → JournalEntry emit (ledger-first)
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/finance/finance.service.ts:15-33` + `apps/api/src/ledger/ledger.service.ts`
- **Muammo:** `createExpense` faqat `expense` jadvaliga yozadi — `JournalEntry` emit qilmaydi. `/finance/pnl` ikki manba'dan xarajat yig'adi (`expense` table + ledger `EXPENSES` account) → dual-count bug. CLAUDE.md "Ledger-first" qoidasi buzilgan.
- **Vazifa:** `expense.create` da `ledgerService.emit({account: 'EXPENSES', type: 'DR', amount})` chaqirish. PATCH va DELETE'da reversal entry. `/finance/pnl` service'dan dual-count olib tashlash (faqat ledger'dan o'qish).
- **Kutilgan:** P&L foyda hisobi to'g'ri, double-count yo'qoladi.

---

## T-350-C | P2 | [BACKEND+MOBILE] | Expense receipt attachment
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat (backend) + Abdulaziz (mobile)
- **Muammo:** Expense schema'da `receiptUrl` field yo'q, file upload endpoint yo'q. Jismoniy chek biriktirib bo'lmaydi.
- **Vazifa:** Prisma migration: `Expense.receiptUrl String?`. `POST /finance/expenses/:id/receipt` multipart upload (S3/MinIO), mime/size validation. Mobile: photo picker + upload (T-350 v1'da placeholder qoldirilgan).
- **Kutilgan:** Kassir chekni telefon bilan olib yuboradi.

---

## T-351-A | P1 | [BACKEND] | EmployeeRole enum — owner/viewer qo'shish
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/employees/dto/*.dto.ts` + migration
- **Muammo:** Mobile `EmployeeRole` faqat `cashier | manager | admin` (3). Backend `UserRole` 6 ta (OWNER/ADMIN/MANAGER/WAREHOUSE/CASHIER/VIEWER). Mobile OWNER yaratib bo'lmaydi.
- **Vazifa:** `EmployeeRole` enum'ni `UserRole` bilan sinxron qilish. Shared types `packages/types/src/auth.ts` ga. Migration yaratish (quyi darajali to'g'ri, lekin baribir `db pull` + generate).
- **Kutilgan:** Mobile T-351 to'liq rol hierarchy bilan ishlaydi.

---

## T-351-B | P1 | [BACKEND+SECURITY] | POST /users/:id/reset-password
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/identity/users.controller.ts`
- **Muammo:** Password reset endpoint yo'q. Web modal'da parol inline kiritiladi va bcrypt'lanadi — bu xavfsizlik riski (parol bundle'da transit). Mobile **hech qachon** parol tutib bo'lmaydi.
- **Vazifa:** `POST /users/:id/reset-password` — invite token generatsiya qilib, Telegram/email orqali yuborish (NotifyService). Body'da parol **YO'Q**. Token expires 24h, bir martalik.
- **Kutilgan:** Mobile T-351 parolni ko'rsatmasdan reset qiladi.

---

## T-351-C | P1 | [BACKEND+SECURITY] | POST /users/:id/force-logout
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/identity/users.controller.ts`
- **Muammo:** Manager xodimni force-logout qila olmaydi. Fired employee tokenlari aktiv qoladi.
- **Vazifa:** `POST /users/:id/force-logout` — refresh token revoke + session invalidate. RBAC: OWNER+ADMIN. Audit log yoziladi.
- **Kutilgan:** Ishdan ketgan xodim darhol tizimdan chiqariladi.

---

## T-351-D | P1 | [BACKEND+SECURITY] | Last-OWNER delete guard
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/identity/identity.service.ts:510` (`deleteUser`)
- **Muammo:** Oxirgi aktiv OWNER'ni o'chirib bo'ladi — tenant egasiz qoladi. Invariant yo'q.
- **Vazifa:** `deleteUser`/`updateUser(isActive:false)` da tekshirish: `count(activeOwners) > 1` yoki target rol OWNER emas. 409 Conflict qaytarish.
- **Kutilgan:** Oxirgi egani o'chirishga urinish bloklanadi.

---

## T-351-E | P1 | [BACKEND+SECURITY] | Refresh token rotation on role change
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/identity/identity.service.ts` (updateUser)
- **Muammo:** Rol o'zgarganda eski JWT token'lar aktiv qolaveradi. Demoted user 15 daqiqa ichida ADMIN huquqlari bilan so'rov yuborishi mumkin.
- **Vazifa:** `updateUser` da `role` o'zgarsa `refreshToken` revoke + force re-login. `/users/:id/force-logout` ni ichkaridan chaqirish.
- **Kutilgan:** Rol o'zgarishi darhol kuchga kiradi.

---

## T-351-F | P2 | [BACKEND] | User.lastLoginAt field
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/prisma/schema.prisma` (User) + `auth.service.ts` (login handler)
- **Muammo:** Web va mobile `lastLoginAt` ko'rsatadi lekin backend select'da yo'q — doimo "—" ko'rinadi.
- **Vazifa:** Migration: `User.lastLoginAt DateTime?`. Login muvaffaqiyatli bo'lganda update. `findAllUsers` select'ga qo'shish.
- **Kutilgan:** Oxirgi kirish vaqti ko'rinadi.

---

## T-351-G | P2 | [BACKEND+SECURITY] | deleteUser — hierarchy enforce
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/identity/identity.service.ts:510`
- **Muammo:** `deleteUser` `enforceRoleHierarchy` chaqirmaydi. OWNER boshqa OWNER'ni deactivate qila oladi (hierarchy'da target >= caller bo'lsa ham).
- **Vazifa:** `deleteUser` boshida `enforceRoleHierarchy(caller, target)`. Self-delete allaqachon bloklangan.
- **Kutilgan:** Hierarchy buzilishi oldini olinadi.

---

## T-351-H | P2 | [MOBILE] | AddEmployeeScreen bio fields cleanup
- **Sana:** 2026-04-21 | **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile-owner/src/screens/Employees/AddEmployeeScreen.tsx`
- **Muammo:** Form 7 ta bio field qabul qiladi (passport, DoB, emergency contact) — backend barchasini silently drop qiladi (`employees.service.ts:61-87`).
- **Vazifa:** Ikki variantdan biri:
  (a) Mobile'dan bu fieldlarni olib tashlash (sodda yo'l)
  (b) Backend schema'ga qo'shish + Ibrat'ga T-351-H2 yozish
- **Kutilgan:** Form yolg'on va'da bermaydi.

---

## T-352-A | P1 | [BACKEND+SECURITY] | approveReturn — RBAC tuzatish
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/sales/sales.controller.ts:196`
- **Muammo:** Class-level `@Roles('OWNER','ADMIN','MANAGER','CASHIER')`. CASHIER o'z return'ini o'zi tasdiqlashi mumkin — fraud riski.
- **Vazifa:** Method-level `@Roles('OWNER','ADMIN','MANAGER')` qo'shish `approveReturn`'ga.
- **Kutilgan:** Separation of duties qoidasi tiklanadi.

---

## T-352-B | P1 | [BACKEND+CORRECTNESS] | Return qty — double-refund guard
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/sales/sales.service.ts:491-544` (createReturn)
- **Muammo:** `sum(alreadyReturnedQty) + newQty ≤ originalQty` validation yo'q. Bitta order cheksiz marta qaytarilishi mumkin.
- **Vazifa:** `createReturn` da har item uchun `sum(existing returns for this orderItemId) + newQty ≤ orderItem.quantity` tekshirish. 400 BadRequest qaytarish aksincha.
- **Kutilgan:** Double-refund fraud bloklanadi.

---

## T-352-C | P1 | [BACKEND+CORRECTNESS] | Order.status — PARTIAL_RETURNED/RETURNED update
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/prisma/schema.prisma:833` (OrderStatus enum) + `sales.service.ts` (approveReturn)
- **Muammo:** Approve'dan keyin `Order.status` hech qachon `RETURNED`'ga o'zgarmaydi. Web'dagi "RETURNED" tab to'lmaydi. `PARTIAL_RETURNED` enum qiymati umuman yo'q.
- **Vazifa:** Migration: `OrderStatus` ga `PARTIAL_RETURNED` qo'shish. `approveReturn` da tekshirish: agar hamma items qaytarilgan → `RETURNED`, qisman → `PARTIAL_RETURNED`.
- **Kutilgan:** Order status haqiqiy holatni aks ettiradi.

---

## T-352-D | P1 | [BACKEND] | Return — warehouse to'g'ri tanlash
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/events/sale-event.listener.ts:70-73`
- **Muammo:** Inventory reversal `first active warehouse`ga yoziladi — order'ning haqiqiy warehouse'iga emas. Multi-warehouse dukonlarda stock noto'g'ri filialga qaytadi.
- **Vazifa:** `order.branchId` dan warehouse'ni aniqlash (`Branch.defaultWarehouseId` yoki birinchi warehouse of branch).
- **Kutilgan:** Stock to'g'ri warehouse'ga qaytariladi.

---

## T-352-E | P1 | [BACKEND+LEDGER] | Return ledger — cash leg tuzatish
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/ledger/ledger.service.ts:161-196`
- **Muammo:** Original sale: `CASH → SALES_REVENUE`. Return: `SALES_RETURN → AR` (AR'ga 0 balance'ga qaytaradi). Cash hech qayerga qaytarilmaydi → ledger nomutanosib.
- **Vazifa:** Cash return uchun qo'shimcha entry: `CASH → SALES_RETURN` DR/CR (symmetric reversal).
- **Kutilgan:** Ledger to'g'ri balansda qoladi.

---

## T-352-F | P1 | [BACKEND+PAYMENTS] | Return approve → auto refund PaymentIntent
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/sales/sales.service.ts` (approveReturn)
- **Muammo:** Approve PaymentIntent yaratmaydi. Kassa pulni qaytarganmi — bilinmaydi. Reconciliation ishlamaydi.
- **Vazifa:** Approve'da original payment method'larni oladi, proporsional refund `PaymentIntent[]` yaratadi (status=SETTLED for cash, CREATED for card/digital).
- **Kutilgan:** Refund audit trail'i saqlanadi.

---

## T-352-G | P2 | [BACKEND] | PATCH /sales/returns/:id/reject endpoint
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/sales/sales.controller.ts`
- **Muammo:** `ReturnStatus` enum'da `REJECTED` bor, handler yo'q. Mobile/web reject UI qura olmaydi.
- **Vazifa:** `PATCH /sales/returns/:id/reject` — `{reason: string}` body. Status `PENDING → REJECTED`. Inventory/ledger o'zgarishsiz.
- **Kutilgan:** Reject oqimi to'liq ishlaydi.

---

## T-352-H | P2 | [BACKEND+FISCAL] | Return fiscal receipt emission
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/sales/sales.service.ts` + `fiscal.service.ts`
- **Muammo:** Return approve'da fiscal receipt emit qilinmaydi. Soliq nuqtai nazaridan qaytarish ro'yxatdan o'tmaydi.
- **Vazifa:** Approve'da `fiscalService.emit({type: 'RETURN', orderId, amount, items})`.
- **Kutilgan:** Soliq compliance saqlanadi.

---

## T-352-I | P2 | [BACKEND] | returnWindowDays constraint
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/sales/sales.service.ts` (createReturn)
- **Muammo:** 6 oy oldingi order'ni qaytarish mumkin. Vaqt chegarasi yo'q.
- **Vazifa:** `TenantSettings.returnWindowDays` (default 14). `createReturn` da `now - order.createdAt ≤ windowDays` tekshirish.
- **Kutilgan:** Eski qaytarishlar bloklanadi.

---

## T-353-A | P0 | [BACKEND+DEVOPS] | Duplicate migration — add_warehouse_invoice_status
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/prisma/migrations/20260414101941_add_warehouse_invoice_status/` + `20260416150000_add_warehouse_invoice_status/`
- **Muammo:** Ikkita byte-identical migration. Fresh DB'da `prisma migrate deploy` ikkinchisida `CREATE TYPE "WarehouseInvoiceStatus" already exists` xatolik bilan crash qiladi. **Production deploy bloklanadi**.
- **Vazifa:** Ikkinchi migratsiyani (`20260416150000_...`) noop qilish — SQL bo'shaltirish `-- noop: duplicate of 20260414...`. `_prisma_migrations` jadvalidagi hash to'g'riligini saqlash SHART.
- **Kutilgan:** Yangi muhitga deploy qilish mumkin bo'ladi.

---

## T-353-B | P1 | [BACKEND+LEDGER] | WarehouseInvoice → JournalEntry emit
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/inventory/warehouse-invoice.service.ts`
- **Muammo:** Invoice create stock movement yaratadi lekin `JournalEntry` emit qilmaydi. `DR INVENTORY / CR ACCOUNTS_PAYABLE` yozilmaydi — ledger-first buzilgan.
- **Vazifa:** Create'da `ledgerService.emit([{DR INVENTORY}, {CR ACCOUNTS_PAYABLE}])`. Reject'da reversal.
- **Kutilgan:** Inventory + AP ledger'da to'g'ri kuzatiladi.

---

## T-353-C | P1 | [BACKEND+CORRECTNESS] | Reject warehouse invoice — stock rollback
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/inventory/warehouse-invoice.service.ts:206-221`
- **Muammo:** Reject status'ni `CANCELLED` qiladi, lekin stock allaqachon yozilgan — silent over-count.
- **Vazifa:** Reject'da compensating `StockMovement type='WRITE_OFF'` yaratish har invoice item uchun. Ledger reversal (T-353-B bilan).
- **Kutilgan:** Rejected invoice stock'ni to'g'ri nolga tushiradi.

---

## T-353-D | P1 | [BACKEND] | Warehouse invoice — stock on APPROVE, not CREATE
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/inventory/warehouse-invoice.service.ts:66-86`
- **Muammo:** Stock create paytida debit qilinadi. Bu semantik noto'g'ri — `PENDING` statusdagi invoice uchun stock increment qilinmasligi kerak edi. Approve informational bo'lib qolgan.
- **Vazifa:** `createInvoice` stock yozmasin. `approveInvoice` event'ida stock + ledger yozilsin (T-353-B bilan birga). Migration talab qilinmaydi, faqat service logikasi.
- **Kutilgan:** Stock faqat tasdiqlangan invoice'lar uchun yoziladi.

---

## T-353-E | P1 | [BACKEND] | Idempotency-Key header support
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/common/interceptors/` + global interceptor
- **Muammo:** Mobile flaky network'da double-submit = duplicate invoice/return/order/expense. Idempotency key support yo'q.
- **Vazifa:** `Idempotency-Key` header reader interceptor. Redis'da `key → response` 24h cache. Write-mutation'larda majburiy.
- **Kutilgan:** Mobile network qayta urinishi duplicate yaratmaydi.

---

## T-353-F | P2 | [BACKEND] | WarehouseInvoice — @@unique([tenantId, invoiceNumber])
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/prisma/schema.prisma:1447`
- **Muammo:** Takroriy `invoiceNumber` per tenant mumkin — accounting noaniqligi.
- **Vazifa:** Migration: `@@unique([tenantId, invoiceNumber])` (NULL'lar ruxsat, partial unique index).
- **Kutilgan:** Invoice raqami unique.

---

## T-353-G | P2 | [BACKEND] | WarehouseInvoice — FK constraints
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Fayl:** `apps/api/prisma/schema.prisma:1447-1469`
- **Muammo:** `supplierId`, `branchId`, `createdBy` — plain String ref. FK constraint yo'q. Orphan possible.
- **Vazifa:** Migration: `@relation` qo'shish (Supplier, Branch, User). `onDelete: Restrict`.
- **Kutilgan:** Referential integrity saqlanadi.

---

## T-353-H | P2 | [BACKEND] | PATCH /warehouse/invoices/:id — DRAFT edit
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Muammo:** Invoice immutable after creation. Xato ma'lumot tuzatish uchun cancel + qayta create kerak.
- **Vazifa:** `PATCH /warehouse/invoices/:id` — faqat `status === PENDING` uchun items/totalCost/note tahrirlash. Audit log.
- **Kutilgan:** Xato invoice tuzatilishi mumkin.

---

## T-353-I | P2 | [BACKEND] | WarehouseInvoiceItem — receivedQty + partial receive
- **Sana:** 2026-04-21 | **Mas'ul:** Ibrat
- **Muammo:** Ordered qty = received qty. Real holatda 10 ta buyurtma qilinib 8 ta kelishi bo'ladi.
- **Vazifa:** Migration: `WarehouseInvoiceItem.receivedQty Decimal(15,3)?`. `POST /warehouse/invoices/:id/receive` body: `lines: [{itemId, receivedQty}]`. Stock = receivedQty.
- **Kutilgan:** Partial receive qo'llab-quvvatlanadi.
