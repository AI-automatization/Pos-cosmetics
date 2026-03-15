# RAOS Backend API — Frontend Uchun To'liq Qo'llanma

> **Production URL:** `https://api-production-c5b6.up.railway.app/api/v1`
> **Swagger (local):** `http://localhost:3003/api/v1/docs`
> **Barcha so'rovlar:** `Content-Type: application/json`
> **Auth:** `Authorization: Bearer <accessToken>` (barcha endpoint, @Public bo'lmaganlar)

---

## 🆕 SO'NGGI QOSHILGANLAR (Session bu oyda)

| Task | Endpoint | Tavsif |
|------|----------|--------|
| T-221 | `GET /analytics/revenue` | Revenue today/week/month/year + trend foizlari |
| T-222 | `GET /inventory/out-of-stock` | Nol qoldiqli mahsulotlar ro'yxati |
| T-223 | `GET /sales/shifts/summary` | Umumiy smena statistikasi |
| T-223 | `GET /sales/shifts/:id` | Bitta smena detail (payment breakdown) |
| T-224 | `GET /employees` | Xodimlar ro'yxati (User jadvalidan) |
| T-224 | `GET /employees/performance` | Xodimlar samaradorligi (order/return stats) |
| T-224 | `GET /employees/suspicious-activity` | Ko'p qaytarish qilgan xodimlar |
| T-224 | `GET/POST/PATCH/DELETE /employees/:id` | Xodim CRUD |
| T-225 | `POST /auth/biometric/register` | Biometric ID ro'yxatdan o'tkazish (stub) |
| T-225 | `POST /auth/biometric/verify` | Biometric tekshirish (stub) |
| T-226 | `GET /reports/daily` | Bugungi kunlik hisobot (mobile alias) |

**Bug Fixlar:**
- ✅ Admin login qilgach `/admin/metrics` ga kirish 403 qaytarardi → TenantGuard fix
- ✅ Web frontendda "server xatosi" — `NEXT_PUBLIC_API_URL` Dockerfile ga beka qilindi
- ✅ POS sahifada "Offline" ko'rinardi — SyncStatusBar endi backend `/health` ni ping qiladi

---

## 🔐 AUTH

### Tenant (Oddiy foydalanuvchi) Login
```
POST /auth/login
Body: { "email": "...", "password": "...", "slug": "tenant-slug" }
Response: { "accessToken": "eyJ...", "refreshToken": "..." }

⚠️ slug MAJBURIY — tenant slug bo'lmasa login ishlamaydi!
```

### Token yangilash
```
POST /auth/refresh
Body: { "refreshToken": "..." }
Response: { "accessToken": "eyJ...", "refreshToken": "..." }
```

### Profil
```
GET /auth/me
Headers: Authorization: Bearer <token>
Response: { "id", "email", "firstName", "lastName", "role", "tenantId" }
```

### Logout
```
POST /auth/logout
Headers: Authorization: Bearer <token>
Response: { "message": "Logged out successfully" }
```

### Yangi tenant ro'yxatdan o'tkazish
```
POST /auth/register
Body: {
  "email": "owner@shop.uz",
  "password": "Min8chars",
  "slug": "my-shop",        ← unikal, URL uchun
  "name": "Mening Do'konim"
}
```

### PIN (kassa blokirovkasi uchun)
```
POST /auth/pin/set         Body: { "pin": "1234", "oldPin": "..." }
POST /auth/pin/verify      Body: { "pin": "1234", "action": "open_shift" }
GET  /auth/pin/status      Response: { "hasPinSet": true }
```

### Sessiyalar
```
GET    /auth/sessions            — joriy foydalanuvchi sessiylari
DELETE /auth/sessions/all        — barcha sessiyalarni o'chirish (logout everywhere)
DELETE /auth/sessions/:id        — bitta sessionni o'chirish
GET    /auth/sessions/all        — OWNER/ADMIN: tenant sessiyalari
DELETE /auth/sessions/user/:userId — xodimni force-logout
```

### Biometric (T-225 — Stub, WebAuthn keyinroq)
```
POST /auth/biometric/register
Headers: Authorization: Bearer <token>
Body: { "biometricId": "device-uuid-001", "deviceInfo": "iPhone 15" }
Response: { "success": true, "biometricRegistered": true }

POST /auth/biometric/verify   ← @Public, token shart emas
Body: { "biometricId": "device-uuid-001", "userId": "user-uuid" }
Response: { "success": true, "verified": true }
```

### API Keys (POS sync uchun)
```
POST   /auth/api-keys          — yangi API key yaratish (OWNER/ADMIN)
GET    /auth/api-keys          — API keylar ro'yxati
GET    /auth/api-keys/scopes   — mavjud scope'lar
DELETE /auth/api-keys/:id/revoke — key ni o'chirish
DELETE /auth/api-keys/:id        — key ni butunlay o'chirish
```

---

## 👤 USERS (Foydalanuvchi boshqaruvi)

```
GET    /users              — tenant foydalanuvchilari ro'yxati (OWNER/ADMIN/MANAGER)
GET    /users/:id          — bitta foydalanuvchi
POST   /users              — yangi foydalanuvchi yaratish
PATCH  /users/:id          — foydalanuvchini yangilash
DELETE /users/:id          — o'chirish (soft)
POST   /users/:id/unlock   — blokirovkadan chiqarish
```

**Rollar:** `OWNER` | `ADMIN` | `MANAGER` | `CASHIER` | `VIEWER`

---

## 👨‍💼 EMPLOYEES (T-224 — Xodim boshqaruvi)

```
GET /employees                    — barcha xodimlar
  Query: ?branch_id=uuid

GET /employees/performance        — xodimlar samaradorligi
  Query: ?branch_id= &from_date= &to_date= &period=

GET /employees/suspicious-activity — shubhali faoliyat (ko'p qaytarish)
  Query: ?branch_id= &from_date= &to_date= &severity=low|medium|high

GET /employees/:id                — bitta xodim
GET /employees/:id/performance    — bitta xodim samaradorligi
GET /employees/:id/suspicious-activity — bitta xodim shubhali faoliyati

POST /employees                   — yangi xodim yaratish
Body: { "firstName", "lastName", "email", "password", "role?", "phone?" }

PATCH /employees/:id/status
Body: { "status": "active" | "inactive" }

PATCH /employees/:id/pos-access
Body: { "hasPosAccess": true | false }

DELETE /employees/:id             — soft delete (isActive = false)
```

**Employee Response formati:**
```json
{
  "id": "uuid",
  "firstName": "Aziz",
  "lastName": "Karimov",
  "fullName": "Aziz Karimov",
  "email": "aziz@shop.uz",
  "phone": null,
  "role": "cashier",
  "status": "active",
  "hasPosAccess": true,
  "hasAdminAccess": false,
  "hasReportsAccess": false,
  "hireDate": "2026-01-15",
  "branchId": null,
  "branchName": null
}
```

**Performance Response:**
```json
{
  "employeeId": "uuid",
  "employeeName": "Aziz Karimov",
  "totalOrders": 150,
  "totalRevenue": 12500000,
  "avgOrderValue": 83333,
  "totalRefunds": 3,
  "refundRate": 2.0,
  "totalDiscounts": 10,
  "discountRate": 6.7,
  "suspiciousActivityCount": 0,
  "alerts": []
}
```

---

## 📦 CATALOG (Mahsulot katalogi)

### Kategoriyalar
```
GET    /catalog/categories           — tree ko'rinishida qaytaradi [ {...}, {...} ]
POST   /catalog/categories           Body: { "name", "parentId?" }
PATCH  /catalog/categories/:id
DELETE /catalog/categories/:id
```

### Birliklar (dona, kg, l va h.k.)
```
GET    /catalog/units                — [ {"id", "name", "abbreviation"} ]
POST   /catalog/units                Body: { "name", "abbreviation" }
```

### Mahsulotlar
```
GET /catalog/products                — { "items": [...], "total", "page", "limit" }
  Query: ?page= &limit= &search= &categoryId= &supplierId= &lowStock=true

GET /catalog/products/barcode/:code  — barkod bo'yicha qidirish
GET /catalog/products/:id            — bitta mahsulot (id yoki sku)

POST /catalog/products
Body: {
  "name": "Krem",
  "sku": "KRM-001",
  "barcode": "4600001234567",
  "categoryId": "uuid",
  "unitId": "uuid",
  "sellPrice": 25000,
  "costPrice": 15000,
  "minStockLevel": 5,
  "isActive": true
}

PATCH  /catalog/products/:id
DELETE /catalog/products/:id    — soft delete

GET  /catalog/products/:id/variants
POST /catalog/products/:id/variants      Body: { "name", "sku", "sellPrice", "attributes" }
PATCH /catalog/products/:id/variants/:variantId
DELETE /catalog/products/:id/variants/:variantId

GET  /catalog/products/:id/prices          — narx tarixi
POST /catalog/products/:id/prices          — yangi narx
PATCH /catalog/products/:id/prices/:priceId
DELETE /catalog/products/:id/prices/:priceId
GET  /catalog/products/:id/prices/resolve  — joriy narx (query: ?qty= &customerId=)

GET  /catalog/products/:id/components      — bundle tarkibi
POST /catalog/products/:id/components      Body: { "componentProductId", "quantity" }
DELETE /catalog/products/:id/components/:componentId

GET  /catalog/products/:id/certificates    — mahsulot sertifikatlari
POST /catalog/products/:id/certificates    Body: { "certNumber", "issuingAuthority", "issuedAt", "expiresAt?" }
DELETE /catalog/products/:id/certificates/:certId
GET  /catalog/certificates/expiring?days=30 — muddat yaqinlashayotgan sertifikatlar
```

### Ta'minotchilar
```
GET    /catalog/suppliers           — ro'yxat (?active=true/false)
GET    /catalog/suppliers/:id
POST   /catalog/suppliers           Body: { "name", "phone?", "email?", "address?" }
PATCH  /catalog/suppliers/:id
DELETE /catalog/suppliers/:id

POST   /catalog/suppliers/:id/products    — mahsulotni ta'minotchiga bog'lash
DELETE /catalog/suppliers/:id/products/:productId
```

---

## 🏭 INVENTORY (Inventar)

### Omborlar
```
GET  /inventory/warehouses          — omborlar ro'yxati
POST /inventory/warehouses          Body: { "name", "branchId?", "isDefault?" }
```

### Harakatlar (stock movements)
```
POST /inventory/movements
Body: {
  "productId": "uuid",
  "warehouseId": "uuid",
  "type": "IN" | "OUT" | "ADJUSTMENT" | "RETURN_IN" | "TESTER",
  "quantity": 10,
  "costPrice?": 15000,
  "note?": "sabab"
}

GET /inventory/movements
  Query: ?warehouseId= &productId= &page= &limit=
  Response: { "items": [...], "total", "page", "limit" }
```

### Qoldiqlar
```
GET /inventory/levels
  Query: ?warehouseId= &productId= &lowStock=true
  Response: [ { "productId", "warehouseId", "stock" } ]

GET /inventory/out-of-stock          — T-222: nol qoldiqli mahsulotlar
  Response: [ { "id", "productName", "barcode", "quantity": 0, ... } ]

GET /inventory/expiring?days=30      — muddat tugaydigan mahsulotlar
GET /inventory/expired               — muddati o'tgan mahsulotlar
GET /inventory/testers               — tester harakatlar (?from= &to=)
```

### Transferlar
```
POST  /inventory/transfers            — transfer yaratish
GET   /inventory/transfers            — transferlar ro'yxati (?status= &from= &to=)
PATCH /inventory/transfers/:id/approve
PATCH /inventory/transfers/:id/ship
PATCH /inventory/transfers/:id/receive
PATCH /inventory/transfers/:id/cancel
```

---

## 🛒 SALES (Sotuv)

### Smenalar
```
POST /sales/shifts/open
Body: { "openingCash": 500000, "branchId?": "uuid" }

POST /sales/shifts/:id/close
Body: { "closingCash": 450000, "note?": "..." }

GET /sales/shifts/current       — joriy ochiq smena (yoki null)
GET /sales/shifts               — smena tarixi (?page= &limit= &branchId=)
GET /sales/shifts/summary       — T-223: umumiy statistika
  Response: { "totalRevenue", "totalOrders", "totalShifts", "avgRevenuePerShift" }

GET /sales/shifts/:id           — T-223: bitta smena (payment breakdown bilan)
  Response: {
    "id", "cashierId", "cashierName", "totalRevenue", "totalOrders",
    "openingCash", "closingCash", "openedAt", "closedAt",
    "paymentBreakdown": [ {"method": "CASH", "amount": 300000}, ... ]
  }
```

### Buyurtmalar
```
POST /sales/orders
Body: {
  "shiftId": "uuid",
  "customerId?": "uuid",
  "items": [
    { "productId": "uuid", "quantity": 2, "price?": 25000 }
  ],
  "discountAmount?": 5000,
  "note?": "..."
}
Response: { "id", "total", "subtotal", "discountAmount", "taxAmount", ... }

GET /sales/orders
  Query: ?page= &limit= &shiftId= &customerId= &from= &to=
  Response: { "items": [...], "total", "page", "limit" }

GET /sales/orders/:id           — bitta buyurtma (items bilan)
GET /sales/orders/:id/receipt   — chek (print uchun)
```

### Qaytarishlar
```
POST /sales/returns
Body: { "orderId": "uuid", "items": [{"orderItemId": "uuid", "quantity": 1}], "reason?": "..." }

PATCH /sales/returns/:id/approve   — qaytarishni tasdiqlash (MANAGER/OWNER)
```

---

## 💳 PAYMENTS (To'lovlar)

```
POST /payments/intent
Body: { "orderId": "uuid", "method": "CASH|TERMINAL|CLICK|PAYME|TRANSFER|DEBT", "amount": 25000 }

POST /payments/split
Body: { "orderId": "uuid", "payments": [ {"method": "CASH", "amount": 10000}, {"method": "TERMINAL", "amount": 15000} ] }

PATCH /payments/:id/confirm    — tasdiqlash
PATCH /payments/:id/settle     — hisob-kitob yakunlash
PATCH /payments/:id/reverse    — qaytarish

GET /payments/order/:orderId   — buyurtma to'lovlari
GET /payments/:id              — bitta to'lov
```

**To'lov holatlari:** `PENDING` → `CONFIRMED` → `SETTLED` | `FAILED` | `REVERSED`

---

## 🏦 NASIYA (Qarzlar)

```
POST /nasiya
Body: {
  "customerId": "uuid",
  "totalAmount": 500000,
  "downPayment?": 100000,
  "installments?": 3,
  "dueDate?": "2026-06-01"
}

GET /nasiya                    — qarzlar ro'yxati (?page= &limit= &status= &customerId=)
GET /nasiya/overdue            — muddati o'tgan qarzlar
GET /nasiya/:id                — bitta qarz
GET /nasiya/customer/:customerId/summary  — mijoz qarz xulosasi

POST /nasiya/:id/pay
Body: { "amount": 100000, "method": "CASH|TERMINAL|CLICK|PAYME" }
```

---

## 👥 CUSTOMERS (Mijozlar)

```
GET    /customers              — ro'yxat (?search= &page= &limit=)
GET    /customers/:id          — bitta mijoz
GET    /customers/:id/stats    — mijoz statistikasi (total orders, nasiya va h.k.)
POST   /customers              Body: { "firstName", "lastName", "phone?", "email?" }
PATCH  /customers/:id
DELETE /customers/:id          — soft delete
```

---

## 📊 ANALYTICS (T-221)

```
GET /analytics/revenue          — T-221: Asosiy dashboard kartochkalari
  Query: ?branch_id=
  Response: {
    "today": 250000,
    "week": 1500000,
    "month": 6000000,
    "year": 72000000,
    "todayTrend": 12.5,    ← kecha bilan solishtirish (%)
    "weekTrend": -3.2,
    "monthTrend": 8.1,
    "yearTrend": 25.0
  }

GET /analytics/sales-trend      — grafik uchun
  Query: ?period=daily|weekly|monthly &from= &to=
  Response: [ {"date": "2026-03-15", "revenue": 250000, "orderCount": 12} ]

GET /analytics/top-products     — eng ko'p sotilgan mahsulotlar
  Query: ?from= &to= &limit=10 &sortBy=revenue|qty
  Response: [ {"productId", "productName", "totalQty", "totalRevenue"} ]

GET /analytics/dead-stock       — harakatsiz tovarlar
  Query: ?days=90
  Response: [ {"productId", "productName", "stock", "lastMovedAt"} ]

GET /analytics/margin           — marja tahlili
  Query: ?from= &to= &categoryId=
  Response: [ {"productId", "productName", "revenue", "cogs", "margin", "marginPct"} ]

GET /analytics/abc              — ABC tahlil
  Query: ?from= &to=
  Response: { "A": [...], "B": [...], "C": [...] }

GET /analytics/cashier-performance — kassirlar samaradorligi
  Query: ?from= &to=
  Response: [ {"userId", "name", "completedOrders", "totalRevenue", "avgTransaction"} ]

GET /analytics/hourly-heatmap   — soat/kun bo'yicha issiqlik xaritasi
  Query: ?from= &to=
  Response: [ {"dayOfWeek": 1, "hour": 10, "orderCount": 5, "revenue": 125000} ]
```

---

## 📋 REPORTS (Hisobotlar)

```
GET /reports/daily              — T-226: bugungi kunlik hisobot
  Response: { "date": "2026-03-15", "orders": 45, "revenue": 1250000, "returns": 2, "netRevenue": 1230000 }

GET /reports/daily-revenue      — kunlik daromad grafigi uchun
  Query: ?from=2026-03-01 &to=2026-03-31
  Response: [ {"date": "2026-03-01", "revenue": 500000, "orderCount": 20} ]

GET /reports/top-products       — yuqori daromadli mahsulotlar
  Query: ?from= &to= &limit=10

GET /reports/sales-summary      — savdo xulosasi (kvartal/oy uchun)
  Query: ?from= &to=
  Response: { "orders": {...}, "returns": {...}, "netRevenue", "paymentBreakdown": [...] }

GET /reports/profit             — foyda (Revenue - COGS - Returns)
  Query: ?from= &to=
  Response: { "revenue", "cogs", "returns", "grossProfit", "grossMarginPct" }

GET /reports/shift/:shiftId     — smena hisoboti (detalhli)

POST /reports/z-report          — Z-report yaratish (kunlik fiskal yakunlash, IMMUTABLE)
  Query: ?date=2026-03-15
GET  /reports/z-reports         — Z-reportlar tarixi (?limit=30)

GET /reports/employee-activity  — xodim faoliyati va fraud detection
  Query: ?from= &to= &userId=

EXPORT (CSV yoki Excel fayl yuklanadi):
GET /reports/export/sales           — savdolar
GET /reports/export/order-items     — buyurtma tarkibi
GET /reports/export/products        — mahsulotlar
GET /reports/export/inventory       — inventar
GET /reports/export/customers       — mijozlar
GET /reports/export/debts           — nasiyalar
  Query: ?from= &to= &format=csv|xlsx
```

---

## 💰 FINANCE (Xarajatlar)

```
POST /expenses
Body: { "amount": 50000, "category": "RENT|SALARY|DELIVERY|UTILITIES|OTHER", "description?", "date?" }

GET /expenses                  — ro'yxat (?from= &to= &category=)
  Response: { "items": [...], "total", "page", "limit" }

GET /expenses/summary          — kategoriya bo'yicha umumiy
  Response: { "total", "byCategory": { "RENT": 200000, "SALARY": 500000, ... } }

DELETE /expenses/:id
```

---

## 💱 EXCHANGE RATE (Valyuta kursi)

```
GET /exchange-rate/latest      — joriy kurs (CBU dan avtomatik)
  Response: { "rate": 12800, "usd": 12800, "updatedAt": "..." }

GET /exchange-rate/history     — kurs tarixi
POST /exchange-rate/sync       — qo'lda yangilash (admin)
```

---

## 🏢 BRANCHES (Filiallar)

```
GET    /branches               — filiallar ro'yxati
GET    /branches/:id
GET    /branches/:id/stats     — filial statistikasi
POST   /branches               Body: { "name", "address?", "phone?" }
PATCH  /branches/:id
DELETE /branches/:id           — soft delete
```

---

## 🔔 NOTIFICATIONS (Bildirnomalar)

```
GET   /notifications                    — bildirnomalar (?page= &limit= &unreadOnly=true)
GET   /notifications/unread-count       — { "count": 5 }
PATCH /notifications/:id/read           — o'qilgan deb belgilash
PATCH /notifications/read-all           — barchasini o'qilgan deb belgilash

POST  /notifications/fcm-token          — FCM push token ro'yxatdan o'tkazish
DELETE /notifications/fcm-token/:token  — FCM token o'chirish (logout da)

GET  /notifications/debt-reminders/due-soon  — 3 kun ichida to'lov muddati
GET  /notifications/debt-reminders/overdue   — muddati o'tgan qarzlar
GET  /notifications/reminder-logs            — yuborilgan eslatmalar tarixi
```

---

## ⭐ LOYALTY (Bonus tizim)

```
GET   /loyalty/config                   — bonus konfiguratsiyasi
PATCH /loyalty/config                   Body: { "pointsPerUzs": 0.01, "redeemRate": 100 }
GET   /loyalty/accounts/:customerId     — mijoz bonus balansi
POST  /loyalty/earn                     Body: { "customerId", "orderId", "amount" }
POST  /loyalty/redeem                   Body: { "customerId", "points", "orderId" }
POST  /loyalty/adjust                   Body: { "customerId", "points", "reason" }
```

---

## 💸 BILLING (Tariflar)

```
GET /billing/plans              — tarif rejalari
GET /billing/plans/:slug
GET /billing/subscription       — joriy obuna holati
GET /billing/limits             — cheklovlar (products, users va h.k.)
GET /billing/usage              — joriy foydalanish statistikasi
POST /billing/upgrade           Body: { "planSlug": "pro" }
POST /billing/trial             — bepul sinov boshlash
DELETE /billing/cancel          — obunani bekor qilish
```

---

## 🔍 AUDIT LOGS

```
GET /audit-logs                — audit log (?page= &limit= &userId= &action= &from= &to=)
  Response: { "items": [...], "total", "page", "limit" }
  Item: { "id", "userId", "action", "entity", "entityId", "oldData", "newData", "ip", "createdAt" }
```

---

## 🏥 HEALTH

```
GET /health                    — to'liq holat tekshiruvi
  Response: { "status": "ok", "database": "ok", "redis": "ok", "uptime": 12345 }

GET /health/live               — Kubernetes liveness probe
GET /health/ready              — readiness probe
GET /health/ping               — oddiy ping
```

---

## 🚨 XATO KODLARI

```
HTTP_400 — Noto'g'ri so'rov (validation xato)
HTTP_401 — Token yo'q yoki muddati o'tgan
HTTP_403 — Ruxsat yo'q (rol yetarli emas)
HTTP_404 — Topilmadi
HTTP_409 — Conflict (masalan, slug band)
HTTP_429 — Rate limit (100 req/min per tenant, login uchun 10 req/min)
HTTP_500 — Server xatosi
```

**Xato response formati:**
```json
{
  "success": false,
  "error": {
    "code": "HTTP_401",
    "message": "Unauthorized"
  },
  "requestId": "uuid",
  "timestamp": "2026-03-15T10:00:00Z"
}
```

---

## 📋 UMUMIY QOIDALAR

### Paginatsiya (barcha list endpointlar)
```
Query params: ?page=1 &limit=20
Response: { "items": [...], "total": 150, "page": 1, "limit": 20 }
```

### To'g'ridan array qaytaradigan endpointlar (items wrapper YO'Q)
```
GET /catalog/categories     → [ {...}, {...} ]
GET /catalog/units          → [ {...}, {...} ]
GET /customers              → [ {...}, {...} ]
GET /inventory/levels       → [ { "productId", "warehouseId", "stock" } ]
GET /inventory/out-of-stock → [ {...} ]
GET /inventory/expiring     → [ {...} ]
GET /employees              → [ {...} ]
GET /employees/performance  → [ {...} ]
```

### Rol hierarxiyasi
```
OWNER > ADMIN > MANAGER > CASHIER > VIEWER
```

### Pul birligi
```
Barcha summa maydonlari UZS tiyin (integer) emas, balki float/Decimal
Masalan: sellPrice = 25000 → 25,000 UZS
```

### Soft Delete
```
Hech qanday ma'lumot bazadan o'chirilmaydi — faqat isActive = false yoki deletedAt = now()
```

---

## 🔗 Foydali linklar

- **Production API:** https://api-production-c5b6.up.railway.app/api/v1
- **Swagger (mahalliy):** http://localhost:3003/api/v1/docs
- **Production Web:** https://web-production-5b0b7.up.railway.app
- **Test skript:** `bash scripts/full-test.sh` — 43/43 test o'tadi
