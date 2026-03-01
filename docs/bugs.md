
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
