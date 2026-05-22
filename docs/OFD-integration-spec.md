# OFD Integratsiya Spesifikatsiyasi

**Mas'ul:** Sardor Madaliev
**Sana:** 2026-05-22
**Issue:** M-4 (#67)

---

## 1. OFD Provayderlar solishtirmasi

| Mezon | REGOS | OFD.uz (soliq.uz) | SmartFiscal |
|-------|-------|-------------------|-------------|
| **Sayt** | regos.uz | ofd.soliq.uz | fiscal.uz |
| **API protokol** | JSON-RPC 2.0 | REST | Noma'lum (ochiq doc yo'q) |
| **Authentication** | Base64 (kassa:parol) | Bearer token | — |
| **Sandbox** | Bor (so'rov orqali) | Yo'q (production only) | — |
| **Narx** | Kelishuv bo'yicha | Bepul/minimal | — |
| **Dokumentatsiya** | docs.regos.uz | docs.bmms.uz | — |
| **Node.js paket** | Yo'q (o'z adapter) | @exode-team/ofd-uz | — |
| **Tavsiya** | ✅ TAVSIYA | ✅ Rasmiy | ❌ Ma'lumot yo'q |

**RAOS uchun tavsiya: REGOS** — to'liq API hujjati bor, JSON-RPC, sandbox mavjud.

---

## 2. REGOS API

### 2.1 Authentication
```
JSON-RPC 2.0 protokoli
Header: Authorization: Basic base64(kassa_login:kassa_parol)
```

### 2.2 Asosiy endpointlar

**Chek yuborish:**
```json
POST https://api.regos.uz/v1/receipts
{
  "jsonrpc": "2.0",
  "method": "Receipt.Send",
  "auth": "base64(login:password)",
  "params": {
    "orderId": "uuid",
    "orderNumber": 1234,
    "total": 75000,
    "taxAmount": 8036,
    "taxRate": 0.12,
    "items": [
      {
        "name": "Suv yuvish sabuni",
        "ikpuCode": "62090000001000000",
        "qty": 5,
        "price": 15000,
        "total": 75000,
        "vatRate": 0.12
      }
    ],
    "cashier": "Alisher Karimov",
    "branch": "Asosiy filial",
    "inn": "123456789",
    "time": "2026-05-22T10:30:00Z"
  }
}
```

**Response (muvaffaqiyatli):**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "id": "FISCAL-ID-001",
    "qr": "https://ofd.soliq.uz/epi?t=EZ000000001&r=1234&c=20260522103000&s=311010881435",
    "terminalId": "EZ000000001",
    "fiscalSign": "311010881435"
  }
}
```

**QR kod tekshiruv:**
```json
POST https://api.regos.uz/v1/receipts/check
{
  "jsonrpc": "2.0",
  "method": "Receipt.CheckQRCodeUrl",
  "auth": "base64(login:password)",
  "params": {
    "QRCodeURL": "https://ofd.soliq.uz/epi?t=...&r=...&c=...&s=..."
  }
}
```

**Z-hisobot:**
```json
POST https://api.regos.uz/v1/z-reports
{
  "jsonrpc": "2.0",
  "method": "ZReport.Send",
  "auth": "base64(login:password)",
  "params": {
    "sequenceNumber": 1,
    "date": "2026-05-22",
    "totalRevenue": 1500000,
    "totalTax": 160714,
    "totalOrders": 25,
    "cashAmount": 800000,
    "terminalAmount": 700000
  }
}
```

---

## 3. OFD QR kod formati

```
https://ofd.soliq.uz/epi?t={terminalId}&r={receiptId}&c={timestamp}&s={fiscalSign}
```

| Parametr | Format | Misol |
|----------|--------|-------|
| `t` | Terminal ID | `EZ000000000031` |
| `r` | Chek raqami | `20` |
| `c` | Timestamp (YYYYMMDDHHmmss) | `20260522103000` |
| `s` | Fiskal imzo | `311010881435` |

---

## 4. Fiskal chek majburiy maydonlar (VMQ 943)

O'zbekiston qonuni bo'yicha har bir chekda bo'lishi shart:

| Maydon | Nima | RAOS dan |
|--------|------|----------|
| INN | Korxona soliq raqami | `tenant.inn` |
| Terminal ID | Kassa raqami | REGOS dan keladi |
| Chek raqami | Unikal raqam | `order.orderNumber` |
| Sana va vaqt | ISO format | `order.createdAt` |
| Kassir | To'liq ism | `user.firstName + lastName` |
| Filial | Do'kon nomi | `branch.name` |
| Tovarlar | Ro'yxat | `orderItems` |
| IKPU kod | Har bir tovar uchun | `product.ikpuCode` (qo'shish kerak) |
| QQS 12% | Har bir tovar uchun | `order.taxAmount` |
| Jami summa | | `order.total` |
| Fiskal ID | REGOS dan | `order.fiscalId` |
| QR kod | ofd.soliq.uz URL | `order.fiscalQr` |

---

## 5. IKPU kod muammosi

**IKPU** = Ishlab chiqarish va xizmatlar klassifikatori (tovar/xizmat kodi).

2023 yil 1 yanvardan **har bir tovar uchun IKPU kodi majburiy**.

**Hozir RAOS da IKPU yo'q** — `Product` modeliga qo'shish kerak:
```prisma
model Product {
  ...
  ikpuCode String? @map("ikpu_code")  // qo'shish kerak — Ibrat zonasi
}
```

IKPU katalogi: `tasnif.soliq.uz`

> ⚠️ Bu Ibrat zonasi (Prisma migration) — u bilan kelishib qo'shiladi.

---

## 6. Error handling

| Xato | Sabab | Yechim |
|------|-------|--------|
| `401 Unauthorized` | Noto'g'ri auth | Credentials tekshirish |
| `400 Bad Request` | IKPU kodi noto'g'ri | tasnif.soliq.uz dan tekshirish |
| `429 Too Many Requests` | Rate limit | Exponential backoff |
| `503 Service Unavailable` | REGOS server | Circuit breaker, retry 3x |
| Timeout (>10s) | Sekin javob | Sale bloklama, PENDING qoldir |

**MUHIM:** Fiscal xato bo'lsa sale **HECH QACHON bloklanmaydi** — PENDING qoladi, BullMQ orqali retry.

---

## 7. Node.js adapter rejasi (M-5 uchun)

```
apps/api/src/tax/
  adapters/
    regos.adapter.ts       ← M-5 da yoziladi
    ofd-stub.adapter.ts    ← Hozir mavjud (fiscal-adapter.service.ts)
  interfaces/
    fiscal-adapter.interface.ts
```

**Env variables:**
```env
OFD_PROVIDER=REGOS          # REGOS | STUB
OFD_API_URL=https://api.regos.uz/v1
OFD_API_KEY=base64(login:password)
OFD_TERMINAL_ID=EZ000000001
```

---

## 8. Sandbox / Test muhit

| Provaydar | Sandbox | Qanday olish |
|-----------|---------|-------------|
| REGOS | Bor | (71) 202-32-32 ext.2 ga qo'ng'iroq (M-1) |
| OFD.uz | Yo'q | Production only |
| SmartFiscal | Noma'lum | — |

**REGOS sandbox olish uchun:** M-1 (#61) — Bekzod qo'ng'iroq qiladi.

---

## 9. Amalga oshirish ketma-ketligi

| Qadam | Issue | Nima | Holat |
|-------|-------|------|-------|
| 1 | M-1 (#61) | REGOS bilan shartnoma | ⏳ Bekzod |
| 2 | M-2 (#63) | E-IMZO olish | ⏳ Bekzod |
| 3 | M-3 (#62) | KKM ro'yxatdan o'tish | ⏳ Bekzod |
| 4 | M-4 (#67) | OFD API research | ✅ DONE |
| 5 | M-5 (#68) | REGOS adapter yozish | ⏳ Sardor |
| 6 | M-6 (#114) | Chek shabloni | ⏳ Sardor |

---

*Research: Sardor Madaliev | 2026-05-22 | M-4 (#67)*
