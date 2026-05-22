# Finance & Ledger Module Audit

**Mas'ul:** Sardor Madaliev
**Sana:** 2026-05-22
**Issue:** M-7 (#69)

---

## 1. Mavjud modullar

### `apps/api/src/finance/`
| Fayl | Vazifa |
|------|--------|
| `finance.service.ts` | Xarajatlar (Expense), P&L, Balance Sheet, Cash Flow |
| `finance.controller.ts` | REST endpointlar |
| `dto/expense.dto.ts` | Xarajat DTO |

### `apps/api/src/ledger/`
| Fayl | Vazifa |
|------|--------|
| `ledger.service.ts` | Double-entry journal yozuvlari |
| `ledger.module.ts` | Modul |

---

## 2. Hozirgi arxitektura

### Double-entry Ledger
```
JournalEntry (immutable)
  ├── id, tenantId, referenceType, referenceId, description
  └── JournalLine[]
        ├── account: LedgerAccount
        ├── type: DEBIT | CREDIT
        └── amount
```

### Hisob turlari (LedgerAccount)
| Account | Nima |
|---------|------|
| `CASH` | Naqd pul |
| `ACCOUNTS_RECEIVABLE` | Nasiya (mijoz qarzi) |
| `REVENUE` | Daromad |
| `SALES_RETURN` | Qaytarilgan sotuv |
| `COST_OF_GOODS_SOLD` | Tovar tannarxi |
| `EXPENSES` | Xarajatlar |

### Jornal yozuv turlari (JournalRefType)
| Tur | Qachon |
|-----|--------|
| `SALE` | Sotuv yaratilganda |
| `PAYMENT` | To'lov amalga oshganda |
| `RETURN` | Qaytarish tasdiqlanganda |
| `ADJUSTMENT` | Qo'lda tuzatish |

### Avtomatik event → ledger oqimi
```
sale.created   → DEBIT: ACCOUNTS_RECEIVABLE / CREDIT: REVENUE
payment.settled → DEBIT: CASH / CREDIT: ACCOUNTS_RECEIVABLE
return.approved → DEBIT: SALES_RETURN / CREDIT: ACCOUNTS_RECEIVABLE
```

---

## 3. Nima bor ✅

- [x] Double-entry journal (immutable)
- [x] P&L hisoboti (revenue, cogs, expenses, netProfit, margin)
- [x] Balance Sheet (assets, equity)
- [x] Cash Flow (inflow, outflow, net)
- [x] Expense CRUD (category, description, amount, date)
- [x] Expense summary by category
- [x] Event-driven: sale/payment/return → avtomatik journal
- [x] Multi-tenant isolation (tenant_id har yozuvda)
- [x] Ledger immutable (updatedAt yo'q)

---

## 4. Nima yo'q / Muammolar ❌

### 4.1 Rasmiy/Norasmiy ajratish yo'q
Hozir barcha sotuvlar bir xil yoziladi. O'zbekistonda ko'p do'konlarda:
- **Rasmiy sotuv** → OFD ga yuboriladi, fiskal chek chiqadi
- **Ichki/norasmiy sotuv** → faqat ichki hisob uchun

`JournalEntry` da `isOfficial: boolean` maydoni yo'q.

### 4.2 Naqd sotuv to'g'ri yozilmayapti
`sale.created` da `ACCOUNTS_RECEIVABLE` ga debit qilinadi.
Lekin naqd sotuvda AR emas, to'g'ridan `CASH` debit bo'lishi kerak.
Hozir bu faqat `payment.settled` eventida tuzatiladi — bu to'g'ri, lekin
naqd sotuvda ikki qadam kerak (AR → CASH), nasiyada esa faqat AR qoladi.

### 4.3 COGS journal yozuvi yo'q
`COST_OF_GOODS_SOLD` account bor, lekin hech qayerda yozilmaydi.
Inventory deduction bo'lganda COGS journal entry yaratilmaydi.
P&L da COGS doim 0 chiqadi.

### 4.4 `EXPENSES` journal account ishlatilmaydi
Xarajatlar faqat `expense` jadvalida saqlanadi.
Ledger da `EXPENSES` account uchun journal entry yaratilmaydi.
P&L da `ledgerExpenses` doim 0, faqat `directExpenses` (expense table) hisoblanadi.

### 4.5 `ADJUSTMENT` ref type ishlatilmaydi
`JournalRefType.ADJUSTMENT` bor lekin hech qayerda ishlatilmaydi.
Qo'lda tuzatish (reversal) mexanizmi yo'q.

### 4.6 Fiscal status bilan bog'lanmagan
`Order.fiscalStatus` (PENDING/SENT/FAILED) va ledger orasida bog'liqlik yo'q.
Rasmiy P&L faqat OFD ga yuborilgan sotuvlarni hisoblamasligi kerak — bu imkoniyat yo'q.

---

## 5. Tavsiyalar (M-8 uchun)

### Variant A — `isOfficial` flag qo'shish (TAVSIYA ETILADI)
```prisma
model JournalEntry {
  ...
  isOfficial Boolean @default(true) @map("is_official")
}
```
- Rasmiy P&L: `WHERE is_official = true`
- Ichki P&L: `WHERE is_official = false`
- Migratsiya minimal

### Variant B — Ikki alohida ledger
- `official_journal_entries` va `internal_journal_entries`
- Murakkabroq, lekin to'liq ajratilgan

### Variant C — Hammasi rasmiy
- Hamma sotuv OFD ga yuboriladi
- Norasmiy hisob yo'q
- Eng oddiy, lekin O'zbekiston realligi bilan mos emas

---

## 6. Keyingi qadam

| Issue | Nima | Kim |
|-------|------|-----|
| M-8 (#70) | `isOfficial` flag arxitekturasi | Sardor + Ibrat (migration) |
| M-5 (#68) | OFD Adapter → fiscal status → ledger bog'lanishi | Sardor |
| — | COGS journal entry (inventory deduction bilan) | Ibrat + Sardor |

---

*Audit: Sardor Madaliev | 2026-05-22 | M-7 (#69)*
