
# RAOS — BUG REPORT
# Yaratilgan: 2026-03-01
# Format: B-raqam | Topilib: sana | Daraja | Holat | Fayl

---

## QOIDALAR

```
1. Bug topilganda shu yerga yoziladi
2. Fix bo'lgach: Holat → FIXED, sana + qisqa yechim qo'shiladi
3. Bu fayl FAQAT tahlil/arxiv — o'chirmaslik
4. Kritiklik: P0=darhol, P1=1kun, P2=3kun, P3=sprint
```

---

## OCHIQ BUGLAR

| # | Topilib | Daraja | Holat | Fayl | Muammo |
|---|---------|--------|-------|------|--------|
| — | — | — | — | — | _(hali yo'q)_ |

---

## 2026-03-29 TUZATILGAN (Playwright Audit — MANAGER Role 403)

| # | Topilib | Daraja | Tuzatildi | Fayl | Muammo va yechim |
|---|---------|--------|-----------|------|-----------------|
| B-039 | 2026-03-29 | P1 | 2026-03-29 | `reports.controller.ts`, `exchange-rate.controller.ts` | MANAGER роли /reports/profit и /exchange-rate/history эндпоинтлари 403 қайтарарди — @Roles га MANAGER қўшилди |

## 2026-03-28 TUZATILGAN (Backend Audit — Barcha Controllerlar)

| # | Topilib | Daraja | Tuzatildi | Fayl | Muammo va yechim |
|---|---------|--------|-----------|------|-----------------|
| B-032 | 2026-03-28 | P1 | 2026-03-28 | `inventory.controller.ts` | **`@CurrentUser('sub')` → `undefined`** — `approveTransfer`, `shipTransfer`, `receiveTransfer` metodlarida `@CurrentUser('sub')` ishlatilgan. JWT strategy `validate()` `userId` qaytaradi, `sub` emas — shuning uchun `userId` parametri doim `undefined` bo'lgan. **Yechim:** `@CurrentUser('sub')` → `@CurrentUser('userId')` (3 joyda). |
| B-033 | 2026-03-28 | P0 | 2026-03-28 | `support.controller.ts` + migration | **`GET /support/tickets` → 500 PRISMA_P2021** — `support_tickets` jadval production DB da mavjud emas (migration yaratilmagan). T-305 da schema qo'shilgan lekin `prisma migrate deploy` qilinmagan. **Yechim:** `20260328000000_add_support_tickets/migration.sql` yaratildi — `support_tickets` + `ticket_messages` jadvallari, enum'lar, foreign key va index'lar. `prisma migrate deploy` run qilish kerak. |
| B-034 | 2026-03-28 | P2 | 2026-03-28 | `identity-info.controller.ts` | **`@UseGuards` yo'q** — `GET /identity/branches` global APP_GUARD (agar mavjud bo'lsa) orqali himoyalangan, lekin explicit `@UseGuards(JwtAuthGuard)` yo'q edi — defense-in-depth uchun zaif. **Yechim:** `@UseGuards(JwtAuthGuard)` qo'shildi. |
| B-035 | 2026-03-28 | P2 | 2026-03-28 | `audit.controller.ts` | **`@UseGuards` yo'q, faqat `@Roles` bor** — `@Roles('OWNER', 'ADMIN')` decorator qo'yilgan lekin `@UseGuards(JwtAuthGuard, RolesGuard)` yo'q — `RolesGuard` ishlamagan. **Yechim:** `@UseGuards(JwtAuthGuard, RolesGuard)` qo'shildi. |
| B-036 | 2026-03-28 | P2 | 2026-03-28 | `reports.controller.ts` | **`@UseGuards` yo'q** — Endpoint darajasida `@Roles` decoratorlari bor, lekin controller darajasida `@UseGuards(JwtAuthGuard, RolesGuard)` yo'q edi. **Yechim:** `@UseGuards(JwtAuthGuard, RolesGuard)` qo'shildi. |
| B-037 | 2026-03-28 | P2 | 2026-03-28 | `exchange-rate.controller.ts` | **`@UseGuards` yo'q, faqat `@Roles` bor** — `@Roles('OWNER', 'ADMIN')` decorator endpoint darajasida bor, lekin `@UseGuards(JwtAuthGuard, RolesGuard)` yo'q — RolesGuard ishlamagan, `/exchange-rate/sync` (POST) himoyasiz bo'lgan. **Yechim:** `@UseGuards(JwtAuthGuard, RolesGuard)` controller darajasida qo'shildi. |

## 2026-03-05 TUZATILGAN (5-sessiya — Live API tour)

| # | Topilib | Daraja | Tuzatildi | Fayl | Muammo va yechim |
|---|---------|--------|-----------|------|-----------------|
| B-028 | 2026-03-05 | P1 | 2026-03-05 | `apps/web/src/api/debt.api.ts` | **Nasiya crash — `.filter is not a function`** — `/nasiya` paginated `{items:[],total:0}` qaytaradi, lekin frontend `Debt[]` kutardi. **Yechim:** `listDebts`/`listOverdue` normalizer qo'shildi: `Array.isArray(d) ? d : d?.items ?? []`. |
| B-029 | 2026-03-05 | P1 | 2026-03-05 | `apps/web/src/api/finance.api.ts`, `finance/expenses/page.tsx` | **Expenses crash — `Cannot read properties of undefined (reading 'map')`** — (1) `/expenses` paginated qaytaradi; (2) `/reports/profit` `expensesByCategory` bermaydi. **Yechim:** `listExpenses` normalizer; `getProfitReport` missing fields qo'shildi (`?? []`); `profit?.expensesByCategory?.map` guard. |

## 2026-03-05 OCHIQ (Backend endpoint mavjud emas)

| # | Topilib | Daraja | Holat | Fayl | Muammo |
|---|---------|--------|-------|------|--------|
| B-030 | 2026-03-05 | P2 | OPEN | `apps/web/src/api/returns.api.ts` | **Returns 404** — `/api/v1/sales/returns` endpoint backendda yo'q. UI error boundary bilan ko'rsatadi, lekin ma'lumot kelmaydi. |
| B-031 | 2026-03-05 | P2 | OPEN | `apps/web/src/api/payments.api.ts` | **Payments 404** — `/api/v1/payments` endpoint backendda yo'q. |

## 2026-03-05 TUZATILGAN (4-sessiya — Full tour)

| # | Topilib | Daraja | Tuzatildi | Fayl | Muammo va yechim |
|---|---------|--------|-----------|------|-----------------|
| B-020b | 2026-03-05 | P2 | 2026-03-05 | `apps/web/src/app/(admin)/finance/expenses/page.tsx:24` | **expenses modal SSR hydration** — `new Date()` to'g'ridan `CreateExpenseModal` defaultValues ichida. **Yechim:** `todayDate` prop sifatida yuborildi, `useMemo` ichidan. |
| B-026 | 2026-03-05 | P2 | 2026-03-05 | `apps/web/src/app/(admin)/settings/users/page.tsx:125` | **Loading state title yo'q** — `if (isLoading) return <LoadingSkeleton>` — sahifa nomi ko'rinmadi. **Yechim:** Loading wrapperi sarlavha bilan qo'shildi. |
| B-027 | 2026-03-05 | P2 | 2026-03-05 | `apps/web/src/app/(admin)/sales/returns/page.tsx:113` | **Returns loading state title yo'q** — xuddi B-026 kabi. **Yechim:** Loading wrapperi sarlavha bilan qo'shildi. |

## 2026-03-04 TUZATILGAN (3-sessiya — Production 10/10)

| # | Topilib | Daraja | Tuzatildi | Fayl | Muammo va yechim |
|---|---------|--------|-----------|------|-----------------|
| B-019 | 2026-03-04 | P1 | 2026-03-04 | `apps/web/src/app/(admin)/dashboard/page.tsx:119` | **Hydration warning — date SSR mismatch** — `new Date().toLocaleDateString()` JSX ichida. **Yechim:** `useState('')` + `useEffect` bilan faqat clientda o'rnatish. |
| B-020 | 2026-03-04 | P2 | 2026-03-04 | `apps/web/src/app/(admin)/finance/expenses/page.tsx:15-16` | **Hydration warning — module-level Date.now()** — `today`/`monthAgo` modul darajasida hisoblangan. **Yechim:** `useMemo(() => ..., [])` bilan komponent ichiga ko'chirildi. |
| B-021 | 2026-03-04 | P1 | 2026-03-04 | `apps/web/src/app/(admin)/analytics/page.tsx` | **Analytics faqat demo ma'lumotlar va Math.random() hydration warning** — TREND_DATA/HOURLY Math.random() ishlatgan. **Yechim:** `useDailyRevenue`, `useTopProducts`, `useProfitReport` hooklari ulandi; kassirlar/soatlik/harakatsiz tovar uchun "tez kunda" holati. |
| B-022 | 2026-03-04 | P1 | 2026-03-04 | `apps/web/src/app/error.tsx` (yangi), `(admin)/error.tsx` (yangi), `(pos)/error.tsx` (yangi) | **Error boundaries yo'q** — sahifa crash bo'lganda butun ilova ishlamay qolardi. **Yechim:** Next.js App Router `error.tsx` fayllari yaratildi (global, admin, pos). |
| B-023 | 2026-03-04 | P2 | 2026-03-04 | `apps/web/src/app/(admin)/loading.tsx` (yangi), `(pos)/loading.tsx` (yangi) | **Loading states yo'q** — route o'tishlarida hech qanday vizual javob yo'q edi. **Yechim:** `loading.tsx` fayllari yaratildi. |
| B-024 | 2026-03-04 | P3 | 2026-03-04 | `apps/web/src/app/not-found.tsx` (yangi) | **Brending 404 sahifasi yo'q** — standart Next.js 404. **Yechim:** Brandli `not-found.tsx` yaratildi. |
| B-025 | 2026-03-04 | P2 | 2026-03-04 | `apps/web/src/hooks/customers/useCustomer.ts` | **useCreateCustomer demo fallback** — `onError` da eski demo xaridor qaytarardi. **Yechim:** Demo fallback olib tashlandi, real API xatosi to'g'ri ko'rsatiladi. |

## 2026-03-04 TUZATILGAN (2-sessiya)

| # | Topilib | Daraja | Tuzatildi | Fayl | Muammo va yechim |
|---|---------|--------|-----------|------|-----------------|
| B-013 | 2026-03-04 | P1 | 2026-03-04 | `apps/web/src/app/(admin)/payments/history/page.tsx` (yangi) | **`/payments/history` sahifasi 404 edi** — Sidebar `To'lovlar` linki mavjud bo'lmagan route ga yo'naltirardi. **Yechim:** `(admin)/payments/history/page.tsx` yaratildi — to'lovlar jadvali, method icon/label, status badge bilan. |
| B-014 | 2026-03-04 | P2 | 2026-03-04 | `apps/web/src/app/(admin)/settings/users/page.tsx:171`, `types/user.ts` | **Settings/Users jadvalida "Ism" ustuni bo'sh edi** — `user.name` ishlatilgan, backend `firstName`+`lastName` qaytaradi. **Yechim:** `User` tipiga `firstName?`, `lastName?`, `email?` qo'shildi; sahifada `firstName + lastName \|\| email` ko'rsatiladi. |
| B-015 | 2026-03-04 | P1 | 2026-03-04 | `apps/web/src/api/reports.api.ts:32-42` | **Dashboard stat cards `NaN so'm` va `undefined ta buyurtma`** — `getDashboard()` backend `{ orders: { count, grossRevenue, totalDiscount }, netRevenue }` ni to'g'ridan o'tkazar edi. Dashboard `today.totalRevenue`, `today.ordersCount` kutardi. **Yechim:** `getDashboard()` da normalizatsiya qatlami qo'shildi. |
| B-016 | 2026-03-04 | P3 | 2026-03-04 | `apps/web/src/components/SyncStatus/SyncStatusBar.tsx:24` | **SyncStatusBar har sahifada `/api/health` 404 xatosi** — Next.js `api/health` route yo'q edi. **Yechim:** `fetch('/api/health')` → `fetch('http://localhost:3000/api/v1/health/ping')`. |
| B-017 | 2026-03-04 | P1 | 2026-03-04 | `apps/web/src/api/debt.api.ts` | **Nasiya/Xaridorlar 404** — `/debts*` ga murojaat qilinar edi, backend `@Controller('nasiya')`. **Yechim:** Barcha URL'lar `/debts` → `/nasiya` ga o'zgartirildi. |
| B-018 | 2026-03-04 | P2 | 2026-03-04 | `apps/web/src/api/finance.api.ts` | **Finance/Xarajatlar 404** — `/finance/expenses` va `/finance/profit` backend route'lariga mos kelmadi. **Yechim:** `/finance/expenses` → `/expenses`, `/finance/profit` → `/reports/profit`. |

## 2026-03-04 TUZATILGAN

| # | Topilib | Daraja | Tuzatildi | Fayl | Muammo va yechim |
|---|---------|--------|-----------|------|-----------------|
| B-010 | 2026-03-04 | P0 | 2026-03-04 | `apps/web/src/app/(auth)/login/page.tsx` (yangi) | **Login sahifasi umuman yo'q edi** — `/login` route mavjud emas edi. `client.ts` 401 da redirect qilardi lekin sahifa yo'q edi. **Yechim:** `(auth)/login/page.tsx` yaratildi, `(auth)/layout.tsx` alohida layout, middleware himoya. |
| B-011 | 2026-03-04 | P0 | 2026-03-04 | `apps/web/src/api/client.ts:28` | **Auth token camelCase mismatch** — `client.ts` refresh tokendan `data.access_token` o'qirdi, lekin backend `data.accessToken` qaytaradi. Barcha token refresh ishlamagan. **Yechim:** `data.access_token` → `data.accessToken`, URL ham tuzatildi `/identity/auth/refresh` → `/auth/refresh`. |
| B-012 | 2026-03-04 | P1 | 2026-03-04 | `apps/web/src/middleware.ts` (yangi) | **Route himoyasi yo'q edi** — har kim (login qilmasdan) admin panel, POS, founder dashboard ga kira olar edi. **Yechim:** Next.js middleware yaratildi — `session_active` cookie tekshiradi, yo'q bo'lsa `/login` ga redirect. |

## TUZATILGAN (shu sessiya)

---

## TUZATILGAN BUGLAR

| # | Topilib | Daraja | Tuzatildi | Fayl | Muammo va yechim |
|---|---------|--------|-----------|------|-----------------|
| B-009 | 2026-03-01 | P1 | 2026-03-01 | `apps/web/src/hooks/inventory/useInventory.ts` | **Inventory sahifasi "Ma'lumotlarni yuklashda xato"** — `useStock` va `useLowStock` da demo fallback yo'q edi. **Yechim:** `DEMO_STOCK` array (12 mahsulot, LOW/OUT status bilan) qo'shildi, har ikkala queryFn try/catch bilan o'raldi, `retry: 0`. |
| B-008 | 2026-03-01 | P1 | 2026-03-01 | `apps/web/src/hooks/reports/useReports.ts` | **Dashboard stat cards ko'rinmaydi** — `useDashboard` da demo fallback yo'q edi. API xato berganda `isError=true` bo'lib, stat cards o'rniga faqat "Backend hali tayyor emas" banner ko'rinarydi. **Yechim:** `DEMO_DASHBOARD` const qo'shildi, `queryFn` try/catch bilan o'raldi, `retry: 0` — demo data bilan to'liq dashboard ko'rinadi. |
| B-007 | 2026-03-01 | P2 | 2026-03-01 | `apps/web/src/app/(founder)/founder/errors/page.tsx` | **`errors/page.tsx` noto'g'ri yo'lga yozildi** — Latin 'aziz' (C:/Абдулaziz/) Kirill o'rniga (C:/Абдулазиз/). Sahifa 404 ko'rsatardi. **Yechim:** `cp` orqali to'g'ri yo'lga ko'chirildi. |
| B-006 | 2026-03-01 | P1 | 2026-03-01 | `apps/web/src/hooks/pos/useCompleteSale.ts` | **`demoOrder` ob'ektida `Order` tipidagi majburiy maydonlar yo'q edi** (`items, subtotal, discountAmount, payments, status`). TypeScript build xatosi. **Yechim:** Barcha majburiy maydonlar qo'shildi. |
| B-005 | 2026-03-01 | P1 | 2026-03-01 | `apps/web/src/hooks/catalog/useProducts.ts` | **`useProducts` demo fallback `Product[]` qaytarardi**, lekin komponentlar `PaginatedResponse<Product>.items` kutardi. `ProductSearch`, `stock-in`, `stock-out` larda `.items` TypeScript xatosi. **Yechim:** Demo fallback `{ items, meta }` formatiga o'zgartirildi. |
| B-004 | 2026-03-01 | P1 | 2026-03-01 | `apps/web/src/hooks/catalog/useProducts.ts` | **`DEMO_PRODUCTS` da `categoryName` field ishlatilgan**, lekin `Product` tipida `category: { id, name }` mavjud. Shuningdek `image/tenantId/createdAt/updatedAt` etishmayotgan edi. TypeScript build xatosi. **Yechim:** `categoryName` → `category: { id, name }` ga o'zgartirildi, etishmayotgan maydonlar qo'shildi. |
| B-003 | 2026-03-01 | P0 | 2026-03-01 | `apps/web/src/hooks/pos/useShift.ts`, `useCompleteSale.ts`, `useProducts.ts` | **Demo fallback umuman ishlamadi** — backend offline bo'lganda "Server xatosi" toast chiqardi, smena/mahsulot/sotuv ishlamadi. Sabab: `extractErrorMessage()` `AxiosError` ni "Server xatosi" ga aylantiradi, eski kod esa `msg.includes('connect')` tekshirardi — mos kelmadi. `useProducts` da demo data umuman yo'q edi. **Yechim:** `isNetworkError()` helper yaratildi (`AxiosError && !err.response` yoki `status 404/5xx` to'g'ridan tekshiradi), `DEMO_PRODUCTS` array qo'shildi, `useCompleteSale` ga demo `Order` yaratish qo'shildi. |
| B-001 | 2026-03-01 | P1 | 2026-03-01 | `apps/web/src/hooks/pos/useShift.ts:26` | **Demo rejim form qiymatlarini o'qimaydi.** `onError` handlerida `openShift(demoId, 'Kassir', 0)` hardcode edi — foydalanuvchi kiritgan `cashierName` va `openingCash` e'tiborga olinmasdi. **Yechim:** TanStack Query v5 `onError(err, variables)` signaturasidan `variables` (ya'ni `dto`) olib `dto.cashierName` va `dto.openingCash` ishlatildi. |
| B-002 | 2026-03-01 | P2 | 2026-03-01 | `apps/web/src/app/(pos)/pos/PaymentPanel.tsx:32-33` | **Chegirma input sotuvdan keyin eski qiymatni saqlab qoladi.** `discountInput` va `discountType` local statei store `clearCart()` chaqirilganda reset bo'lmasdi — keyingi savdoda eski chegirma qiymati ko'rinib qolardi. **Yechim:** `useEffect` qo'shildi — store `orderDiscount` va `orderDiscountType` o'zgarganda local state ham sync bo'ladi. |

---

## TAHLIL NATIJALARI (KOD REVIEW)

Quyidagi fayllar to'liq ko'rib chiqildi:

| Fayl | Holat | Izoh |
|------|-------|------|
| `pos.store.ts` | ✅ Toza | `totals()`, `clearCart()`, `recordSale()` to'g'ri |
| `useCompleteSale.ts` | ✅ Toza | `canComplete` logikasi, payment routing to'g'ri |
| `CartPanel.tsx` | ✅ Toza | `lineDiscount` (%) CartItemRow va store bilan mos |
| `PaymentPanel.tsx` | ⚠️ B-002 tuzatildi | Local state sync muammo tuzatildi |
| `ProductSearch.tsx` | ✅ Toza | Barcode scanner integratsiyasi to'g'ri |
| `ShiftOpenModal.tsx` | ✅ Toza | Zod validation, quick amounts to'g'ri |
| `ShiftCloseModal.tsx` | ✅ Toza | `closingCash` input → `showReport` to'g'ri |
| `ShiftBar.tsx` | ✅ Toza | Live clock `useEffect` cleanup to'g'ri |
| `ShiftReport.tsx` | ✅ Toza | `discrepancy = closingCash - expectedCash` to'g'ri |
| `useShift.ts` | ⚠️ B-001 tuzatildi | Demo fallback form qiymatlari tuzatildi |
| `useBarcodeScanner.ts` | ✅ Toza | 80ms threshold, Enter flush to'g'ri |
| `client.ts` | ✅ Toza | JWT interceptor, 401→refresh→retry to'g'ri |
| `lib/utils.ts` | ✅ Toza | `formatPrice`, `cn`, `extractErrorMessage` to'g'ri |
| `pos/page.tsx` | ✅ Toza | 3-ustunli layout, keyboard hooks to'g'ri |
| `ReceiptPreview.tsx` | ✅ Toza | Auto-print toggle, print area to'g'ri |
| `ProductsTable.tsx` | ✅ Toza | StockBadge, StatusBadge to'g'ri |
| `ProductForm.tsx` | ✅ Toza | Zod schema, React Hook Form to'g'ri |
| `catalog/products/page.tsx` | ✅ Toza | CRUD flow, pagination to'g'ri |
| `inventory/page.tsx` | ✅ Toza | StatusBadge, search to'g'ri |
| `dashboard/page.tsx` | ✅ Toza | StatCard, DemoContent to'g'ri |
| `reports/daily-revenue/page.tsx` | ✅ Toza | BarChart, summary cards to'g'ri |
| `reports/top-products/page.tsx` | ✅ Toza | Mini progress bars, table to'g'ri |
| `reports/shifts/page.tsx` | ✅ Toza | Collapsible cards, discrepancy to'g'ri |

---

*docs/bugs.md | RAOS*
    