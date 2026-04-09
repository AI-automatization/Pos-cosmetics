---
description: Immutable ledger rules — CRITICAL financial data protection
paths:
  - "**/ledger/**"
  - "**/payments/**"
  - "**/finance/**"
---

# Ledger Rules (CRITICAL)

## Double-Entry Journal — IMMUTABLE

### Rules
1. `sum(debit) === sum(credit)` — HAR DOIM
2. UPDATE TAQIQLANGAN
3. DELETE TAQIQLANGAN
4. Xato tuzatish — faqat REVERSAL entry yaratish
5. Har entry snapshot bilan saqlanadi

### Teskari entry (reversal)
```
Original: debit=50000, credit=0
Reversal: debit=0, credit=50000
```

## Payment Intent Lifecycle
```
CREATED → CONFIRMED → SETTLED
                    → FAILED
                    → REVERSED
```

## Financial data conflict resolution
- EVENT-SOURCING — HECH QACHON last-write-wins
- Har transaction uchun idempotency key
- Duplicate rejection

## Fiscal receipts
- Snapshot saqlanadi — o'zgartirib BO'LMAYDI
- Sale ni HECH QACHON block qilma fiscal fail bo'lsa
- Fail → queue → retry (3 attempts, exponential backoff)
