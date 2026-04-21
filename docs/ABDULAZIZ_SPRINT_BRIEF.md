# Abdulaziz — Mobile Sprint Brief (2026-04-21)

> **Manba:** Web↔Mobile parity audit natijasi. 35 ta yangi [MOBILE] task `docs/Tasks.md` ga yozildi (T-349..T-383).
> **Zona:** FAQAT `apps/mobile/` + `apps/mobile-owner/`. `apps/api/`, `packages/*` ga teginma — yo'q bo'lsa alohida task sifatida Ibrat'ga yoz.

---

## 🎯 Bugungi sprint — 5 ta P1 task sizdan kutilmoqda

Quyidagi tartibda bajarsangiz, har bitta task keyingisi uchun infratuzilma tayyorlaydi:

### 1️⃣ T-349 — Owner P&L screen
**Branch:** `abdulaziz/feat-owner-pnl-T349`
**Fayl:** `apps/mobile-owner/src/screens/Finance/PnLScreen.tsx` (yangi modul)

**Asosiy qadamlar:**
1. `api/finance.api.ts` + endpoints yangilash
2. `useMeasuredDevice` + `usePnL` + `usePnLPeriod` hooks
3. `PnLKpiGrid` (5 KPI card: Tushum/Tannarx/Yalpi foyda/Xarajat/Sof foyda)
4. `ExpenseBreakdownChart` — mavjud `HorizontalBarChart` wrap
5. `PeriodPickerSheet` (7 preset + custom)
6. Dashboard'ga "Batafsil P&L →" link

**Endpoint qarori:** `/finance/pnl` ishlat (OWNER+ADMIN, expenses+netProfit bor). `expensesByCategory` uchun `/finance/expenses/summary` parallel chaqir.

**⚠️ Diqqat:** web'da latent bug bor — `totalExpenses`/`netProfit`/`expensesByCategory` type'da bor, lekin endpointlar qaytarmaydi. Siz `/finance/pnl` ishlatsangiz bu bug sizga ta'sir qilmaydi.

**Estimate:** 2-3 kun.

---

### 2️⃣ T-350 — Owner Expenses CRUD
**Branch:** `abdulaziz/feat-owner-expenses-T350`
**Fayl:** `apps/mobile-owner/src/screens/Finance/ExpensesScreen.tsx`

**⚠️ SCOPE OGOHLANTIRISH:**
- **PATCH endpoint MAVJUD EMAS** — edit qila olmaysiz. Yoki create+delete bilan chiqaring, yoki backend tayyor bo'lgach edit qo'shing.
- **ExpenseCategory enum faqat 5 ta**: `RENT | SALARY | DELIVERY | UTILITIES | OTHER` (8 ta emas!)
- **branchId YO'Q** — xarajat tenant-global. Branch filter UI ko'rsatmang.
- **Receipt attachment YO'Q** — schema'da field yo'q. Placeholder disabled tugma.
- **Ledger bug**: `createExpense` `JournalEntry` emit qilmaydi — P&L ikki marta hisoblaydi. Sizning muammoyingiz emas, lekin QA'da payqanganingizni yozing.

**Asosiy qadamlar:**
1. `api/expenses.api.ts` + types
2. `useExpenses` + `useExpenseMutations` (create + delete v1)
3. `CategoryChipPicker` (5 kategoriya)
4. `ExpensePieChart` — Victory Native, **top 6 + "Boshqa"** bucket
5. `ExpenseRow` Swipeable + ConfirmDialog
6. `ExpenseFormSheet` (create only, edit PATCH bo'lsa)
7. `ExpensesScreen` + FAB

**Optimistic delete + rollback on error** majburiy.

**Estimate:** 2-3 kun (edit'siz), 3-4 kun (edit bilan).

---

### 3️⃣ T-351 — Owner Users & RBAC
**Branch:** `abdulaziz/feat-owner-users-rbac-T351`

**🚨 BU YANGI SCREEN EMAS.** Mavjud `Employees/` + `HR/` screenlarni KUCHAYTIRILADI. Parallel UsersScreen qurmang — ikki source of truth bo'ladi.

**KRITIK XAVFSIZLIK FIX'LARI** (kod'dan DARHOL olib tashlash):
1. `HRInviteSheet.tsx:37,46` — `Math.random()` password generatsiyasi ❌
2. `AddEmployeeScreen.tsx` — `password` + `passwordConfirm` plain text input ❌
3. `CredentialsSection.tsx` — password input'lar ❌

**Almashtirish:**
- Invite = backend invite token → Telegram/email (Eskiz SMS taqiqlangan, NotifyService ishlatiladi)
- Reset password = server endpoint chaqirish, parol clientga qaytmaydi

**Asosiy qadamlar:**
1. `utils/rbacGuard.ts` + unit tests (5 roles × matrix)
2. `EmployeeRole` enum kengaytirish (3→6: owner/admin/manager/warehouse/cashier/viewer) — backend tasdiqlangach
3. `RoleSelector` RBAC-filtered (faqat role ≤ current user)
4. **Password inputlarni OLIB TASHLASH** (yuqoriga qarang)
5. `DangerActions` (reset-password, force-logout, delete)
6. `FilterBar` (role × branch × status)
7. `Settings/index.tsx` "Foydalanuvchilar" link RBAC-gated

**Review MAJBURIY:** AbdulazizYormatov (Team Lead) + Bekzod (PM) — RBAC sensitive.

**Estimate:** 4-5 kun.

---

### 4️⃣ T-352 — Staff Sales Returns flow
**Branch:** `abdulaziz/feat-staff-returns-T352`
**Fayl:** `apps/mobile/src/screens/Sales/ReturnsScreen.tsx` + `NewReturnSheet.tsx`

**⚠️ BACKEND BUG'LAR — SCOPE TORAYTIRISH:**
- **Reject endpoint YO'Q** — REJECT UI qurmang (enum'da REJECTED bor, handler yo'q)
- **Refund PaymentIntent yaratilmaydi** — UI'da "Pul qaytaring" ko'rsatma ber, auto-refund kutmang
- **Fiscal receipt YO'Q** — fiscal QR ko'rsatmang
- **Order.status yangilanmaydi** — "RETURNED" badge ishlatmang
- **Double-refund riski** — `sum(returnedQty) ≤ originalQty` client'da majburiy validate (backend tekshirmaydi)

**Asosiy qadamlar:**
1. `api/returns.api.ts`
2. `useReturns` + `useReturnMutations`
3. `useReturnWizard` state machine (reducer, 5 step)
4. `returnMath.ts` — **faqat "Taxminiy" preview**, ledger uchun emas
5. 5 ta step component (OrderPicker/ItemPicker/Reason/RefundMethod/Review)
6. `NewReturnSheet` wizard shell
7. `ReturnsScreen` list + filter
8. `ReturnDetailScreen` — approve (Manager+ client-side RBAC enforce)

**MUHIM:** Mobile SERVER-computed summani ko'rsatadi. Clientda pul hisoblash ledger uchun **taqiqlangan**.

**Idempotency-Key header** har create mutation'ga (UUID).

**Estimate:** 4-5 kun.

---

### 5️⃣ T-353 — Staff Warehouse Invoice detail
**Branch:** `abdulaziz/feat-staff-warehouse-invoice-detail-T353`
**Fayl:** `apps/mobile/src/screens/Kirim/InvoiceDetailScreen.tsx` (+ `InvoicesListScreen`)

**⚠️ SCOPE O'ZGARTIRISH — KUTMAGANIDEK:**
- **Status enum FAQAT 3 ta**: `PENDING | RECEIVED | CANCELLED` (spec'dagi 5 emas)
- **Stock aslida CREATE paytida debit qilinadi**, approve'da emas! Approve = audit-only
- **Reject stock'ni rollback qilmaydi** — silent over-count. UI copy'da "Tasdiqlash" ishlat (Qabul qilish EMAS)
- **Edit endpoint YO'Q** — invoice immutable after creation
- **Partial receive YO'Q** — `receivedQty` field mavjud emas
- **Duplicate migration** bor (fresh DB crash)

**Asosiy qadamlar:**
1. `api/warehouseInvoices.api.ts` + query keys
2. `invoicePermissions.ts` — 3 status × 5 role matrix (90 test)
3. `useInvoices` + `useInvoiceMutations` (approve + reject only)
4. `InvoiceStatusBadge`, `SupplierCard`, `InvoiceItemRow`, `InvoiceActionsBar`, `RejectReasonSheet`
5. `InvoicesListScreen` (3 status tab + search + date filter)
6. `InvoiceDetailScreen` (header + supplier + items + totals + metadata + actions)
7. `KirimNavigator` yangi stack
8. `screens/Kirim/index.tsx` **515→~200 qator SRP fix** (MAJBURIY)
9. **`inventory.api.ts:184-195` FIX** — `supplierName` silently dropped bug

**Estimate:** 3-4 kun.

---

## 📋 UMUMIY QOIDALAR

### Branch & Commit
- **Branch format**: `abdulaziz/feat-{feature}-T{number}`
- **Commit format**: Conventional Commits + atomic (1 commit = 1 mantiqiy o'zgarish)
- **Review**: Team Lead + Bekzod tasdig'i majburiy (T-351 — security-sensitive)

### Taqiqlangan
- ❌ `any` type, `console.log` prod, 400+ qator fayl, inline styles
- ❌ `Math.random()` password yoki secret generation
- ❌ Plaintext password UI input
- ❌ `apps/api/`, `packages/*` ga teginish
- ❌ Pul hisoblari clientda (ledger uchun)

### Majburiy
- ✅ TypeScript strict, Zod validation
- ✅ `Idempotency-Key` header har mutation'ga
- ✅ React Query invalidation role/status o'zgarishida
- ✅ i18n uz/ru/en har UI string
- ✅ StyleSheet.create (inline styles yo'q)
- ✅ ShiftGuard staff create/edit flow'larda

### Test
- Har task uchun unit test (pure utils) + integration test (RNTL)
- Manual QA ssenariylari task spec'da berilgan

---

## 🔙 T-354..T-383 (30 ta qolgan task)

P1 qolgan (6 ta):
- T-354 Warehouse Write-off
- T-355 Inventory Transfer approve
- T-356 Catalog Products CRUD
- T-357 POS Bundle sotish
- T-358 POS Weight Scale
- T-359 POS Split payments

P2 (22 ta) — Analytics, Reports, Exchange rates, Promotions, Chegirma, Onboarding, Printer, Billing, Customer Display, va h.k.

P3 (2 ta) — Audit Log, Real Estate (owner port)

Har biri uchun to'liq spec bor — `docs/Tasks.md`'da T-349..T-383 bo'limiga qarang.

---

## 🚨 OCHIQ BACKEND BOG'LIQLIKLAR

Mobile ishlari uchun Ibrat'dan kutiladigan endpointlar (Tasks.md'da T-35X-A..I formatida yoziladi):

- **T-349-A** — `/finance/pnl` ga `expensesByCategory` + `branchId`
- **T-350-A** — `PATCH /finance/expenses/:id`
- **T-350-B** — expense ledger integration
- **T-351-A..H** — RBAC endpoints (reset-password, force-logout, last-owner guard, role rotation, lastLoginAt, etc.)
- **T-352-A..I** — returns fixes (RBAC, double-refund guard, order status, warehouse, refund PaymentIntent, reject endpoint, fiscal)
- **T-353-A..I** — invoice fixes (duplicate migration, ledger, stock rollback, idempotency, FK constraints, edit endpoint)

**Jami 30+ kritik backend task.** Bular hal bo'lguncha mobile'da soddalashtirilgan variantlar chiqaring va Tasks.md'ga mobile-side TODO comment qoldiring.

---

_Ushbu brief Bekzod (PM) va Mirzaev tomonidan auditdan keyin yangilangan: 2026-04-21. Har yangi task qo'shilganda qayta yangilanadi._
