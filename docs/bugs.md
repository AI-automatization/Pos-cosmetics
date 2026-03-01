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

## TUZATILGAN BUGLAR

| # | Topilib | Daraja | Tuzatildi | Fayl | Muammo va yechim |
|---|---------|--------|-----------|------|-----------------|
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
