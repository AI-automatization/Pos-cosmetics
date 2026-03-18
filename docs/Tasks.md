<<<<<<< Updated upstream
# RAOS — OCHIQ VAZIFALAR (Kosmetika POS MVP)
# Yangilangan: 2026-03-15 (Ibrat — T-226..T-228: mobile-owner↔backend full integration)
# Format: T-XXX | Prioritet | [KAT] | Sarlavha

---

## 📌 QOIDALAR

```
1. Har topilgan bug/task → shu faylga DARHOL yoziladi
2. Sessiya boshida shu faylni O'QIB, oxirgi T-raqamdan DAVOM ettiriladi
3. Takroriy task yaratmaslik — mavjudini yangilash
4. Fix bo'lgach → shu yerdan O'CHIRISH → docs/Done.md ga KO'CHIRISH
5. Prioritet: P0=kritik, P1=muhim, P2=o'rta, P3=past
6. Kategoriya: [BACKEND], [FRONTEND], [DEVOPS], [SECURITY], [IKKALASI]
```

---

## T-200 | P1 | [MOBILE] | mobile-owner — Stitch AI dizayn stilini implement qilish ✅ DONE

- **Sana:** 2026-03-12
- **Mas'ul:** Ibrat
- **Stitch link:** https://stitch.withgoogle.com/projects/7549251643181014276
- **Bajarilgan o'zgarishlar (2026-03-12):**
  - ✅ `ScreenLayout.tsx` — `logoMode` prop: RAOS icon + center branch pill + bell badge
  - ✅ `HeaderBranchSelector.tsx` — rounded-full pill, #1E40AF text
  - ✅ `LowStockAlertList.tsx` — amber banner "#FEF3C7", count + chevron
  - ✅ `Dashboard/index.tsx` — lowStock banner first, logoMode enabled
  - ✅ `RevenueSummaryGrid.tsx` — cards without accent bar, amount formatted (14,250,000 UZS)
  - ✅ `DebtSummaryCards.tsx` — 3 full-width stacked cards (Stitch nasiya layout)
  - ✅ `TabNavigator.tsx` — 5 tabs: DASHBOARD | ANALITIKA | XABARLAR | XODIMLAR | SOZLAMALAR
  - ✅ `navigation/types.ts` — TabParamList 5 tab
  - ✅ `i18n/uz|en|ru.json` — `lowStockCount`, `orderCount`, `statusNormal/Low/Out`, `persons`
  - ✅ `debts.api.ts` — `DebtSummary.overdueCount` field qo'shildi

---

## 🔴 POLAT UCHUN — OWNER PANEL BACKEND VAZIFALAR (T-201 dan T-208)
## Backend tayyor bo'lmasa owner panel ishlaydi faqat mock data bilan!

---

## T-201 | P1 | [BACKEND] | Owner Dashboard Analytics API endpointlari

- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/analytics/`
- **Muammo:** `apps/mobile-owner` dashboard ekrani quyidagi endpointlarni talab qiladi, lekin ular to'liq emas yoki yo'q
- **Kerakli endpointlar:**
  - `GET /analytics/revenue?period=today|week|month|year&branchId=` → `{ today, week, month, year, todayTrend, weekTrend, monthTrend, yearTrend }`
  - `GET /analytics/sales-trend?period=7d|30d&branchId=` → `{ labels: string[], values: number[] }`
  - `GET /analytics/branch-comparison?metric=revenue|orders` → `{ branches: [{ branchId, branchName, value }] }`
  - `GET /analytics/top-products?limit=10&branchId=` → `{ products: [{ productId, name, quantity, revenue }] }`
- **Kutilgan:** Response format `apps/mobile-owner/src/api/analytics.api.ts` bilan mos bo'lsin
- **Auth:** JWT Bearer — faqat `OWNER` role

---

## T-202 | P1 | [BACKEND] | Low Stock & Inventory Alerts endpoint

- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/inventory/`
- **Muammo:** Mobile-owner dashboard `lowStock` section uchun endpoint kerak
- **Kerakli endpointlar:**
  - `GET /inventory/low-stock?branchId=&limit=20` → `{ items: [{ productId, productName, quantity, unit, threshold, status }] }`
  - `GET /inventory/items?branchId=&status=normal|low|out_of_stock|expiring|expired&search=&page=&limit=` → paginated list for Inventory screen
- **Kutilgan:** `InventoryItem` type bilan mos (productName, barcode, branchName, quantity, unit, stockValue, expiryDate, status)
- **Auth:** JWT Bearer — faqat `OWNER` role

---

## T-203 | P1 | [BACKEND] | Alerts / Notifications feed endpoint

- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/notifications/`
- **Muammo:** Mobile-owner Alerts ekrani uchun structured alert feed kerak
- **Kerakli endpointlar:**
  - `GET /notifications/alerts?type=&isRead=&branchId=&page=&limit=` → paginated alerts
  - `PUT /notifications/alerts/:id/read` → mark as read
  - `PUT /notifications/alerts/read-all` → mark all as read
- **Alert types:** `LOW_STOCK | OUT_OF_STOCK | EXPIRY_WARNING | LARGE_REFUND | SUSPICIOUS_ACTIVITY | SHIFT_CLOSED | SYSTEM_ERROR | NASIYA_OVERDUE`
- **Alert object:** `{ id, type, description, branchName, branchId, isRead, createdAt, metadata? }`
- **Auth:** JWT Bearer — faqat `OWNER` role

---

## T-204 | P1 | [BACKEND] | Employee Performance endpoint

- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/` yoki `apps/api/src/sales/`
- **Muammo:** Mobile-owner Employees ekrani uchun performance va suspicious activity ma'lumotlari kerak
- **Kerakli endpointlar:**
  - `GET /employees/performance?branchId=&period=today|week|month` → `{ employees: [EmployeePerformance] }`
  - `GET /employees/:id/suspicious-activity?limit=20` → `{ activities: [{ id, type, description, orderId?, amount?, createdAt }] }`
- **EmployeePerformance object:** `{ employeeId, employeeName, role, branchName, totalOrders, totalRevenue, totalRefunds, refundRate, totalVoids, suspiciousActivityCount }`
- **Suspicious activity triggers:** refund > 3× avg, void after payment, large discount (> 30%), negative cash drawer
- **Auth:** JWT Bearer — faqat `OWNER` role

---

## T-205 | P1 | [BACKEND] | Shift Monitoring endpoint

- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/sales/shifts/`
- **Muammo:** Mobile-owner Shifts ekrani uchun cross-branch shift list kerak
- **Kerakli endpointlar:**
  - `GET /shifts?branchId=&status=open|closed&page=&limit=` → paginated shifts (all branches if owner)
  - `GET /shifts/:id` → shift detail with payment breakdown
- **Shift object:** `{ id, branchId, branchName, cashierName, status, openedAt, closedAt, totalRevenue, totalOrders, paymentBreakdown: { cash, card, click, payme } }`
- **Auth:** JWT Bearer — faqat `OWNER` role (sees all branches), `CASHIER` faqat o'zinikini

---

## T-206 | P1 | [BACKEND] | Nasiya (Debt) Aging Report endpoint

- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/sales/` yoki `apps/api/src/ledger/`
- **Muammo:** Mobile-owner Nasiya ekrani uchun aging bucket va customer debt list kerak
- **Kerakli endpointlar:**
  - `GET /debts/summary?branchId=` → `{ totalDebt, overdueDebt, overdueCount, aging: { current, days30, days60, days90plus } }`
  - `GET /debts/customers?branchId=&status=current|overdue&page=&limit=` → `{ customers: [CustomerDebt] }`
- **CustomerDebt object:** `{ customerId, customerName, phone, totalDebt, overdueAmount, lastPaymentDate, daysPastDue }`
- **Auth:** JWT Bearer — faqat `OWNER` role

---

## T-207 | P1 | [BACKEND] | System Health endpoint

- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/system/`
- **Muammo:** Mobile-owner SystemHealth ekrani uchun service status va sync status kerak
- **Kerakli endpointlar:**
  - `GET /system/health` → `{ services: [{ name, status: 'ok'|'warn'|'error', latencyMs }], syncStatus: [{ branchId, branchName, lastSyncAt, pendingCount }], recentErrors: [{ message, service, timestamp }] }`
- **Auth:** JWT Bearer — faqat `OWNER` role

---

## T-208 | P2 | [BACKEND] | Push Notification device token registration

- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/notifications/`
- **Muammo:** Mobile-owner app push notification olish uchun FCM device token ni backendga yuborishi kerak
- **Kerakli endpointlar:**
  - `POST /notifications/device-token` → `{ token: string, platform: 'android'|'ios' }`
  - `DELETE /notifications/device-token` → logout da tokenni o'chirish
- **DB:** `user_device_tokens` jadvali: `(userId, token, platform, createdAt, updatedAt)`
- **Auth:** JWT Bearer — autentifikatsiya qilingan foydalanuvchi
- **Note:** Expo Go da push token ishlamaydi — faqat `expo-dev-client` yoki release build da

---

## T-209 | P1 | [BACKEND] | Branches endpoint — mobile-owner uchun filiallar ro'yxati

- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/` (yoki mavjud branches modul)
- **Muammo:** Mobile-owner `HeaderBranchSelector` va `BranchSelectorSheet` uchun filiallar kerak
- **Kerakli endpoint:**
  - `GET /branches?tenantId=` → `{ branches: [{ id, name, address?, isActive }] }`
- **Branch object:** `{ id: string, name: string, address?: string, isActive: boolean }`
- **Auth:** JWT Bearer — `OWNER` role (faqat o'z tenant filiallarini ko'radi)
- **Note:** Mobile-owner bu endpoint orqali branch selector ni to'ldiradi. `tenant_id` JWT dan olinadi.

---

## T-210 | P1 | [BACKEND] | Analytics orders count endpoint — Dashboard 4-karta uchun

- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/analytics/`
- **Muammo:** Dashboard ekrani 4-kartasi "Buyurtmalar 247 ta" ko'rsatadi — `GET /analytics/orders` kerak
- **Kerakli endpoint:**
  - `GET /analytics/orders?branchId=&period=today|week|month|year` → `{ total: number, avgOrderValue: number, trend: number }`
  - `trend` = joriy davrning oldingi davr bilan solishtirgan % o'zgarishi
- **Auth:** JWT Bearer — faqat `OWNER` role
- **Note:** `RevenueData` bilan parallel chaqiriladi. Alohida endpoint sifatida izolyatsiya qilingan.

---

## T-211 | P1 | [BACKEND] | DebtSummary `overdueCount` field qo'shish

- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/sales/` yoki `apps/api/src/ledger/`
- **Muammo:** `GET /debts/summary` response da `overdueCount` (muddati o'tgan mijozlar soni) yo'q
- **Joriy response:** `{ totalDebt, overdueDebt, debtorCount, avgDebt }`
- **Kerakli response:** `{ totalDebt, overdueDebt, overdueCount, debtorCount, avgDebt }`
  - `overdueCount` = muddati o'tgan `orders`/`invoices` bor mijozlar soni
- **Frontend:** `apps/mobile-owner/src/api/debts.api.ts` — `DebtSummary.overdueCount` allaqachon qo'shildi

---

## T-212 | P1 | [BACKEND] | `GET /debts/aging-report` — Qarz yoshi hisoboti bucketi

- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/sales/` yoki `apps/api/src/ledger/`
- **Muammo:** Mobile-owner Nasiya ekrani `AgingBucketChart` uchun bucket ma'lumotlari kerak
- **Kerakli endpoint:**
  - `GET /debts/aging-report?branchId=` → `{ buckets: [AgingBucket] }`
  - `AgingBucket` = `{ bucket: '0_30'|'31_60'|'61_90'|'90_plus', label: string, amount: number, customerCount: number }`
- **Bucket logikasi:**
  - `0_30` = last purchase <= 30 kun oldin
  - `31_60` = 31–60 kun
  - `61_90` = 61–90 kun
  - `90_plus` = 90+ kun (eng xavfli)
- **Auth:** JWT Bearer — faqat `OWNER` role
- **Frontend:** `apps/mobile-owner/src/api/debts.api.ts` — `AgingBucket`, `AgingReport` interfeyslari tayyor

---

## T-213 | P1 | [BACKEND] | `GET /alerts` — `priority` query param qo'shish

- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/notifications/`
- **Muammo:** Mobile-owner Alerts ekrani `HIGH | O'RTA | PAST` priority filterlari bilan ishlaydi lekin backend `priority` param qabul qilmaydi
- **O'zgartirish:**
  - `GET /alerts?priority=high|medium|low&status=read|unread|all&branchId=&page=&limit=`
  - `priority` — ixtiyoriy filter. Agar berilmasa — hammasi qaytariladi.
  - `Alert.priority` = `'high' | 'medium' | 'low'` — har alert uchun shart
- **Alert priority mapping:**
  - `high` = `SUSPICIOUS_ACTIVITY`, `OUT_OF_STOCK`, `SYSTEM_ERROR`, `NASIYA_OVERDUE` (30+ kun)
  - `medium` = `LARGE_REFUND`, `EXPIRY_WARNING`, `NASIYA_OVERDUE` (7–30 kun)
  - `low` = `LOW_STOCK`, `SHIFT_CLOSED`
- **Auth:** JWT Bearer — faqat `OWNER` role
- **Frontend:** `apps/mobile-owner/src/hooks/useAlerts.ts` — `AlertPriorityFilter` type tayyor, API ga `priority` param jo'natiladi

---

## T-214 | P1 | [BACKEND] | Shift PaymentBreakdown — `method` + `percentage` field

- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/sales/shifts/`
- **Muammo:** `GET /shifts/:id` response da `paymentBreakdown` bo'lishi kerak, lekin hozir yo'q yoki format boshqacha
- **Kerakli format:**
  ```json
  {
    "paymentBreakdown": [
      { "method": "cash", "amount": 8200000, "percentage": 45.3 },
      { "method": "terminal", "amount": 5400000, "percentage": 29.8 },
      { "method": "click", "amount": 2700000, "percentage": 14.9 },
      { "method": "payme", "amount": 1810000, "percentage": 10.0 }
    ]
  }
  ```
- **method values:** `cash | terminal | click | payme | transfer`
- **percentage** = `(amount / totalRevenue) * 100` — backend tomonidan hisoblanadi
- **Auth:** JWT Bearer — faqat `OWNER` role
- **Frontend:** `apps/mobile-owner/src/screens/Shifts/PaymentBreakdownChart.tsx` — horizontal bars chart tayyor

---

## T-215 | P2 | [BACKEND] | `StockValueData.byBranch` — Inventory stock value by branch

- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/inventory/`
- **Muammo:** Analytics screen `StockValueByBranch` chart uchun filial bo'yicha tovar qiymati kerak
- **Kerakli endpoint:**
  - `GET /inventory/stock-value?period=today|week|month|year` → `{ total: number, byBranch: [{ branchId, branchName, value }] }`
- **Frontend:** `apps/mobile-owner/src/api/inventory.api.ts` — `StockValueData` interface tekshirib ko'r
- **Auth:** JWT Bearer — faqat `OWNER` role

---

## T-216 | P0 | [BACKEND] | Demo Seed Data — 4 ta filial + owner user + tovarlar + smenalar

- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/prisma/seed.ts` (yoki `apps/api/src/seed/`)
- **Muammo:** Mobile-owner panel backend bilan test qilinmayapti, chunki DB da real data yo'q. Mock data bilan ko'rinadi, real backendga ulanmaydi.
- **Kerakli seed data:**

### 1. Tenant
```
id: "tenant-demo-001"
name: "Kosmetika Savdosi"
slug: "kosmetika"
plan: "pro"
```

### 2. Owner User
```
email: "owner@kosmetika.uz"
password: "Demo1234!"   ← bcrypt hash qilish
role: OWNER
tenantId: "tenant-demo-001"
```

### 3. 4 ta Branch (Filial)
```ts
[
  { id: "branch-001", name: "Chilonzor",        address: "Chilonzor tumani, 14-mavze",    tenantId, isActive: true },
  { id: "branch-002", name: "Yunusabad",         address: "Yunusabad tumani, Amir Temur",  tenantId, isActive: true },
  { id: "branch-003", name: "Mirzo Ulug'bek",    address: "Mirzo Ulug'bek tumani, 4-mavze", tenantId, isActive: true },
  { id: "branch-004", name: "Sergeli",           address: "Sergeli tumani, Yangi hayot",  tenantId, isActive: true },
]
```

### 4. Kassirlar (har filialga 1 ta)
```
Sarvar Qodirov    → branch-001, role: CASHIER
Jahongir Nazarov  → branch-002, role: CASHIER
Zulfiya Ergasheva → branch-003, role: CASHIER
Muhabbat Tosheva  → branch-004, role: CASHIER
```

### 5. Tovarlar (kamida 10 ta)
```
Chanel No.5 EDP 100ml      — costPrice: 320_000, barcode: "3145891253317"
Dior Sauvage EDT 60ml      — costPrice: 285_000, barcode: "3348901419610"
L'Oreal Elvive Shampoo     — costPrice: 45_000,  barcode: "3600523816802"
Nivea Soft Cream 200ml     — costPrice: 38_000,  barcode: "4005808155583"
MAC Lipstick Ruby Woo      — costPrice: 180_000, barcode: "773602524723"
Versace Eros EDT 50ml      — costPrice: 420_000, barcode: "8011003827763"
Garnier SkinActive Serum   — costPrice: 85_000,  barcode: "3600542386449"
NYX Professional Palette   — costPrice: 95_000,  barcode: "800897003693"
Maybelline Mascara         — costPrice: 75_000,  barcode: "3600530990359"
KIKO Milano Lipstick       — costPrice: 120_000, barcode: "8025272618602"
```

### 6. Stock (har filialdagi tovar miqdori)
- branch-001: Chanel(8), Dior(3), L'Oreal(25), Nivea(40), MAC(2), Versace(5)
- branch-002: Chanel(5), Garnier(12), NYX(8), Maybelline(15), KIKO(6)
- branch-003: Dior(7), MAC(4), Versace(3), L'Oreal(30), Nivea(20)
- branch-004: Chanel(2), Garnier(8), Maybelline(10), KIKO(3), Nivea(15)

### 7. Smenalar (so'nggi 3 kun — 2 ta ochiq + 8 ta yopiq)
```
branch-001, Sarvar Qodirov     → OCHIQ, openedAt: 4 soat oldin, revenue: 8_450_000, orders: 34
branch-002, Jahongir Nazarov   → OCHIQ, openedAt: 6 soat oldin, revenue: 5_120_000, orders: 21
branch-001, Muhabbat Tosheva   → YOPIQ, kecha  8 soat, revenue: 12_780_000, orders: 58
branch-003, Zulfiya Ergasheva  → YOPIQ, kecha  8 soat, revenue: 9_340_000,  orders: 42
branch-004, Sarvar Qodirov     → YOPIQ, 2 kun oldin, revenue: 6_890_000, orders: 31
... (qolganlarini o'xshash qilib to'ldirish)
```

### 8. Nasiya (Debt) — kamida 6 ta mijoz
```
Nodira Yusupova   — debt: 2_400_000, overdue: 65 kun
Jasur Toshmatov   — debt: 1_850_000, overdue: 42 kun
Malika Hamidova   — debt: 3_200_000, overdue: 12 kun
Bobur Rahimov     — debt: 950_000,   overdue: 78 kun
Gulnora Nazarova  — debt: 1_600_000, overdue: 5 kun
Sherzod Mirzayev  — debt: 650_000,   overdue: 31 kun
```

- **Ishlatish:** `npx ts-node apps/api/prisma/seed.ts` yoki `npx prisma db seed`
- **Muhim:** `seed.ts` idempotent bo'lishi kerak — ikki marta ishlatsa duplicate yaratmasin (`upsert` ishlatish)

---

## T-217 | P1 | [BACKEND] | `GET /shifts` — Shifts list endpoint (pagination + filters)

- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/sales/shifts/shifts.controller.ts`
- **Muammo:** Mobile-owner Smenlar ekrani `GET /shifts` dan paginated list kutadi, lekin hozir faqat `GET /shifts/:id` bormi tekshirish kerak
- **Kerakli endpoint:**
  ```
  GET /shifts?branchId=&status=open|closed&dateFrom=&dateTo=&page=1&limit=20
  ```
- **Response:**
  ```json
  {
    "items": [Shift],
    "total": 50,
    "page": 1,
    "limit": 20
  }
  ```
- **Shift object to'liq:**
  ```json
  {
    "id": "shift-001",
    "branchId": "branch-001",
    "branchName": "Chilonzor",
    "cashierId": "user-001",
    "cashierName": "Sarvar Qodirov",
    "openedAt": "2026-03-12T09:33:00Z",
    "closedAt": null,
    "status": "open",
    "totalRevenue": 8450000,
    "totalOrders": 34,
    "avgOrderValue": 248529,
    "totalRefunds": 1,
    "totalVoids": 0,
    "totalDiscounts": 3,
    "paymentBreakdown": [
      { "method": "cash",     "amount": 3200000, "percentage": 37.9 },
      { "method": "terminal", "amount": 2850000, "percentage": 33.7 },
      { "method": "click",    "amount": 1550000, "percentage": 18.3 },
      { "method": "payme",    "amount":  850000, "percentage": 10.1 }
    ]
  }
  ```
- **Sorting:** `openedAt DESC` (yangi smenalar tepada)
- **Auth:** JWT Bearer — faqat `OWNER` role, `tenant_id` JWT dan
- **Frontend:** `apps/mobile-owner/src/hooks/useShifts.ts` + `apps/mobile-owner/src/api/shifts.api.ts`

---

## T-218 | P1 | [BACKEND] | `GET /inventory/stock` — Inventory list endpoint (filtrlar bilan)

- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/inventory/`
- **Muammo:** Mobile-owner Inventory ekrani tovarlarni status bo'yicha filterlaydi
- **Kerakli endpoint:**
  ```
  GET /inventory/stock?branchId=&status=normal|low|out_of_stock|expiring|expired|all&page=1&limit=50
  ```
- **Response:**
  ```json
  {
    "items": [InventoryItem],
    "total": 120,
    "page": 1,
    "limit": 50
  }
  ```
- **InventoryItem:**
  ```json
  {
    "id": "inv-001",
    "productName": "Chanel No.5 EDP 100ml",
    "barcode": "3145891253317",
    "quantity": 8,
    "unit": "dona",
    "branchName": "Chilonzor",
    "branchId": "branch-001",
    "costPrice": 320000,
    "stockValue": 2560000,
    "reorderLevel": 5,
    "expiryDate": "2026-12-01",
    "status": "normal"
  }
  ```
- **Status logikasi (backend tomonida hisoblanadi):**
  - `out_of_stock` = `quantity <= 0`
  - `low`          = `quantity > 0 && quantity <= reorderLevel`
  - `expiring`     = `expiryDate` dan 30 kun qoldi
  - `expired`      = `expiryDate` o'tib ketdi
  - `normal`       = boshqa holat
- **Auth:** JWT Bearer — faqat `OWNER` role
- **Frontend:** `apps/mobile-owner/src/api/inventory.api.ts` — `InventoryItem`, `InventoryStatus` interfeyslari tayyor

---

## T-219 | P1 | [BACKEND] | `GET /inventory/low-stock` — Kam qolgan tovarlar banner uchun

- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/inventory/`
- **Muammo:** Dashboard sariq banner "X ta mahsulot kam qoldi" uchun low-stock tovarlar ro'yxati kerak
- **Kerakli endpoint:**
  ```
  GET /inventory/low-stock?branchId=
  ```
- **Response:** `InventoryItem[]` (status = `low` yoki `out_of_stock`)
- **Limit:** Max 20 ta (banner uchun count muhim, detail emas)
- **Auth:** JWT Bearer — faqat `OWNER` role
- **Frontend:** `apps/mobile-owner/src/hooks/useDashboard.ts` — `lowStock` query

---

## T-220 | P0 | [BACKEND] | Owner Panel — Barcha endpointlar Postman/Swagger test

- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** Swagger: `http://localhost:3000/api`
- **Maqsad:** Mobile-owner panel uchun kerakli barcha endpointlar ishlashini tasdiqlash
- **Checklist:**
  ```
  □ POST /auth/login                → owner@kosmetika.uz / Demo1234! → JWT token
  □ GET  /branches                  → 4 ta filial qaytaradi
  □ GET  /analytics/revenue         → 4 ta metric (today/week/month/year)
  □ GET  /analytics/orders          → total, avgOrderValue, trend
  □ GET  /analytics/sales-trend     → 30 kun grafik ma'lumoti
  □ GET  /analytics/branch-comparison → 4 filial daromad
  □ GET  /analytics/top-products    → top 5 tovar
  □ GET  /analytics/stock-value     → byBranch array
  □ GET  /inventory/stock           → tovarlar ro'yxati (pagination, status filter)
  □ GET  /inventory/low-stock       → kam qolgan tovarlar
  □ GET  /shifts                    → smenalar ro'yxati (pagination, status filter)
  □ GET  /shifts/:id                → smena detail + paymentBreakdown
  □ GET  /debts/summary             → totalDebt, overdueDebt, overdueCount, debtorCount, avgDebt
  □ GET  /debts/customers           → nasiya mijozlar (pagination)
  □ GET  /debts/aging-report        → 4 ta bucket (0_30, 31_60, 61_90, 90_plus)
  □ GET  /employees/performance     → xodimlar statistikasi
  □ GET  /alerts                    → xabarlar (priority, status filter, pagination)
  □ PATCH /alerts/:id/read          → o'qildi belgilash
  □ GET  /system/health             → server status, DB ping, Redis ping
  ```
- **Note:** Har endpoint `branchId` filter qabul qilishi va `tenant_id` JWT dan olib ishlashi kerak

---

## ════════════════════════════════════════════════════════════════
## 🔴 MOBILE-OWNER API CONTRACT (T-221..T-226) — Ibrat tomonidan qo'shildi 2026-03-14
## apps/mobile-owner/src/config/endpoints.ts bilan TO'LIQ MOS KELISHI SHART
## ════════════════════════════════════════════════════════════════

---

## T-221 | P1 | [BACKEND] | `GET /analytics/revenue` — Response format mismatch

- **Sana:** 2026-03-14
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/ai/analytics.controller.ts` + yangi analytics service
- **Muammo:** Backend hozir `GET /analytics/revenue` dan `[{ period, amount, currency, trend, branchId, branchName }]` array qaytaradi. Mobile-owner `{ today, week, month, year, todayTrend, weekTrend, monthTrend, yearTrend }` object kutadi.
- **Kerakli response format:**
  ```json
  {
    "today": 1936000,
    "week": 12450000,
    "month": 48750000,
    "year": 185000000,
    "todayTrend": 12.5,
    "weekTrend": 8.3,
    "monthTrend": -3.1,
    "yearTrend": 5.2
  }
  ```
- **Query params:** `?branch_id=&period=today|week|month|year`
- **Auth:** JWT Bearer — faqat `OWNER` role
- **Frontend fayl:** `apps/mobile-owner/src/api/analytics.api.ts` → `RevenueData` interface

---

## T-222 | P1 | [BACKEND] | `GET /inventory/out-of-stock` — Omborda yo'q tovarlar

- **Sana:** 2026-03-14
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/inventory/inventory.controller.ts`
- **Muammo:** Mobile-owner Inventory ekrani "Out of Stock" tab uchun alohida endpoint kerak. Mavjud `GET /inventory/stock?status=out_of_stock` bor lekin mobile alohida `/inventory/out-of-stock` chaqiradi.
- **Kerakli endpoint:**
  ```
  GET /inventory/out-of-stock?branch_id=
  ```
- **Response:** `InventoryItem[]` (quantity = 0 bo'lgan tovarlar)
- **InventoryItem format** (T-218 bilan bir xil):
  ```json
  {
    "id": "inv-001",
    "productName": "Chanel No.5 EDP 100ml",
    "barcode": "3145891253317",
    "quantity": 0,
    "unit": "dona",
    "branchName": "Chilonzor",
    "branchId": "branch-001",
    "costPrice": 320000,
    "stockValue": 0,
    "reorderLevel": 5,
    "expiryDate": null,
    "status": "out_of_stock"
  }
  ```
- **Auth:** JWT Bearer — faqat `OWNER` role
- **Frontend fayl:** `apps/mobile-owner/src/api/inventory.api.ts` → `INVENTORY_OUT_OF_STOCK` endpoint

---

## T-223 | P1 | [BACKEND] | `GET /shifts/:id` + `GET /shifts/summary` — T-217 ga qo'shimcha

- **Sana:** 2026-03-14
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/sales/shifts/` (yoki yangi `/shifts` controller — T-217 kontekstida)
- **Muammo:** T-217 faqat `GET /shifts` list endpointini dokumentlashtirdi. Mobile-owner yana 2 ta endpoint kutadi:

### 1. `GET /shifts/:id` — Smena detallari
```
GET /shifts/:id
```
**Response:**
```json
{
  "id": "shift-001",
  "branchId": "branch-001",
  "branchName": "Chilonzor",
  "cashierId": "user-001",
  "cashierName": "Sarvar Qodirov",
  "openedAt": "2026-03-14T09:00:00Z",
  "closedAt": "2026-03-14T18:30:00Z",
  "status": "closed",
  "totalRevenue": 8450000,
  "totalOrders": 34,
  "avgOrderValue": 248529,
  "totalRefunds": 1,
  "totalVoids": 0,
  "totalDiscounts": 3,
  "paymentBreakdown": [
    { "method": "cash",     "amount": 3200000, "percentage": 37.9 },
    { "method": "terminal", "amount": 2850000, "percentage": 33.7 },
    { "method": "click",    "amount": 1550000, "percentage": 18.3 },
    { "method": "payme",    "amount":  850000, "percentage": 10.1 }
  ]
}
```

### 2. `GET /shifts/summary` — Umumiy smena statistikasi
```
GET /shifts/summary?branch_id=&from_date=&to_date=
```
**Response:**
```json
{
  "totalRevenue": 48750000,
  "totalOrders": 247,
  "totalShifts": 12,
  "avgRevenuePerShift": 4062500
}
```
- **Auth:** JWT Bearer — faqat `OWNER` role, `tenant_id` JWT dan
- **Frontend fayl:** `apps/mobile-owner/src/api/shifts.api.ts` → `getShiftById()`, `getShiftSummary()`

---

## T-224 | P0 | [BACKEND] | `/employees/*` — Owner panel xodim endpointlari (TO'LIQ SPEC)

- **Sana:** 2026-03-14
- **Mas'ul:** Polat
- **Fayl:** yangi `apps/api/src/employees/` controller (yoki `apps/api/src/identity/` ga qo'shish)
- **Muammo:** T-144 (Employee CRUD) va T-204 (Performance) mavjud lekin mobile-owner uchun TO'LIQ spec yo'q. Backend `/users` controller bor lekin mobile `/employees` path da ishlaydi va boshqacha format kutadi.
- **⚠️ MUHIM:** Mobile `/employees` path dan foydalanadi, `/users` emas!

### Kerakli endpointlar:

```
GET    /employees?branch_id=                           → Employee[]
GET    /employees/:id                                  → Employee
POST   /employees                                      → Employee
PATCH  /employees/:id/status      { status }           → Employee
PATCH  /employees/:id/pos-access  { hasPosAccess }     → Employee
DELETE /employees/:id                                  → void

GET    /employees/performance?branch_id=&period=&from_date=&to_date=
                                                       → EmployeePerformance[]
GET    /employees/:id/performance?from_date=&to_date=&period=
                                                       → EmployeePerformance

GET    /employees/suspicious-activity?branch_id=&from_date=&to_date=&severity=
                                                       → SuspiciousActivityAlert[]
GET    /employees/:id/suspicious-activity              → SuspiciousActivityAlert[]
```

### Employee object (to'liq format):
```json
{
  "id": "user-001",
  "firstName": "Sarvar",
  "lastName": "Qodirov",
  "fullName": "Sarvar Qodirov",
  "phone": "+998901234567",
  "email": null,
  "dateOfBirth": "1995-05-20",
  "passportId": "AB1234567",
  "address": "Toshkent, Chilonzor",
  "hireDate": "2024-01-15",
  "role": "cashier",
  "branchId": "branch-001",
  "branchName": "Chilonzor",
  "status": "active",
  "login": "sarvar_chilonzor",
  "photoUrl": null,
  "hasPosAccess": true,
  "hasAdminAccess": false,
  "hasReportsAccess": false,
  "emergencyContactName": null,
  "emergencyContactPhone": null
}
```

### EmployeePerformance object:
```json
{
  "employeeId": "user-001",
  "employeeName": "Sarvar Qodirov",
  "role": "cashier",
  "branchName": "Chilonzor",
  "totalOrders": 247,
  "totalRevenue": 14326000,
  "avgOrderValue": 58000,
  "totalRefunds": 3,
  "refundRate": 0.8,
  "totalVoids": 1,
  "totalDiscounts": 12,
  "discountRate": 4.9,
  "suspiciousActivityCount": 0,
  "alerts": []
}
```

### SuspiciousActivityAlert object:
```json
{
  "id": "alert-001",
  "type": "EXCESSIVE_VOIDS",
  "description": "5 ta void 2 soat ichida",
  "occurredAt": "2026-03-14T14:00:00Z",
  "severity": "high"
}
```
- **type values:** `EXCESSIVE_VOIDS | LARGE_DISCOUNT | RAPID_REFUNDS | OFF_HOURS_ACTIVITY`
- **severity values:** `low | medium | high`
- **Suspicious triggers:** refund > 3× avg order, void after payment, discount > 30%, 5+ voids in 2 hours
- **Auth:** JWT Bearer — faqat `OWNER` role
- **Frontend fayl:** `apps/mobile-owner/src/api/employees.api.ts`

---

## T-225 | P1 | [BACKEND] | Biometric auth — `POST /auth/biometric/register` + `POST /auth/biometric/verify`

- **Sana:** 2026-03-14
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/auth.controller.ts`
- **Muammo:** Mobile-owner biometric login (fingerprint/face) ishlatadi. Backend da bu endpointlar yo'q.

### Kerakli endpointlar:

```
POST /auth/biometric/register
Body: { publicKey: string, deviceId: string }
→ { success: true, biometricToken: string }

POST /auth/biometric/verify
Body: { biometricToken: string, deviceId: string }
→ { access_token: string, refresh_token: string, user: User }
```

### Implementatsiya yondashuvi:
- Register: Foydalanuvchi logindan keyin biometric key ni serverda saqlash
- Verify: Saqlangan biometric key orqali access token qaytarish
- `user_biometric_keys` jadvali: `(userId, publicKey, deviceId, createdAt)`
- Biometric token 30 kunlik, har verify da yangilanadi
- **Auth (register):** JWT Bearer — autentifikatsiya qilingan foydalanuvchi
- **Auth (verify):** Public (token orqali)
- **Frontend fayl:** `apps/mobile-owner/src/hooks/useBiometricAuth.ts`, `apps/mobile-owner/src/api/auth.api.ts`

---

## T-226 | P0 | [BACKEND] | Path mismatch MAP — Mobile calls vs Backend has (To'liq jadval)

- **Sana:** 2026-03-14
- **Mas'ul:** Polat
- **Maqsad:** Backend dasturchi bu jadvalni ko'rib, qaysi endpointlar MAVJUD lekin boshqa pathda, qaysilari YO'Q ekanini bilsin.

| Mobile chaqiradi | Backend hozir | Holat | Vazifa |
|---|---|---|---|
| `POST /notifications/fcm-token` | `POST /notifications/fcm-token` | ✅ ISHLAYDI | — |
| `GET /branches` | `GET /branches` | ✅ ISHLAYDI | — |
| `GET /branches/:id` | `GET /branches/:id` | ✅ ISHLAYDI | — |
| `GET /health` | `GET /health` | ✅ Format check | T-207 |
| `GET /analytics/revenue` | `GET /analytics/revenue` (demo) | ⚠️ FORMAT NOTO'G'RI | T-221 |
| `GET /analytics/orders` | ❌ YO'Q | ❌ MISSING | T-210 |
| `GET /analytics/sales-trend` | ❌ YO'Q | ❌ MISSING | T-201 |
| `GET /analytics/branch-comparison` | `GET /analytics/branches/comparison` (demo) | ⚠️ PATH + FORMAT | T-201 |
| `GET /analytics/top-products` | `GET /reports/top-products` | ⚠️ PATH FARQ | T-201 |
| `GET /analytics/revenue-by-branch` | ❌ YO'Q | ❌ MISSING | T-201 |
| `GET /analytics/employee-performance` | `GET /reports/employee-activity` | ⚠️ PATH + FORMAT | T-204 |
| `GET /inventory/stock` | `GET /inventory/stock` | ✅ Format check | T-218 |
| `GET /inventory/low-stock` | `GET /inventory/stock/low` | ⚠️ PATH FARQ | T-219 |
| `GET /inventory/expiring` | `GET /inventory/expiring` | ✅ Format check | — |
| `GET /inventory/out-of-stock` | ❌ YO'Q | ❌ MISSING | T-222 |
| `GET /inventory/stock-value` | ❌ YO'Q | ❌ MISSING | T-215 |
| `GET /shifts` | `GET /sales/shifts` | ⚠️ PATH FARQ | T-217 |
| `GET /shifts/:id` | ❌ YO'Q (faqat list) | ❌ MISSING | T-223 |
| `GET /shifts/summary` | ❌ YO'Q | ❌ MISSING | T-223 |
| `GET /debts/summary` | `/nasiya` (boshqa format) | ⚠️ PATH + FORMAT | T-206 |
| `GET /debts/aging-report` | ❌ YO'Q | ❌ MISSING | T-212 |
| `GET /debts/customers` | `GET /nasiya` (boshqa format) | ⚠️ PATH + FORMAT | T-206 |
| `GET /employees` | `GET /users` (boshqa format) | ⚠️ PATH + FORMAT | T-224 |
| `GET /employees/:id` | `GET /users/:id` (boshqa format) | ⚠️ PATH + FORMAT | T-224 |
| `POST /employees` | `POST /users` (boshqa format) | ⚠️ PATH + FORMAT | T-224 |
| `PATCH /employees/:id/status` | ❌ YO'Q | ❌ MISSING | T-224 |
| `PATCH /employees/:id/pos-access` | ❌ YO'Q | ❌ MISSING | T-224 |
| `DELETE /employees/:id` | ❌ YO'Q (soft delete?) | ❌ MISSING | T-224 |
| `GET /employees/performance` | `GET /reports/employee-activity` | ⚠️ PATH + FORMAT | T-224 |
| `GET /employees/:id/performance` | ❌ YO'Q | ❌ MISSING | T-224 |
| `GET /employees/suspicious-activity` | ❌ YO'Q | ❌ MISSING | T-224 |
| `GET /employees/:id/suspicious-activity` | ❌ YO'Q | ❌ MISSING | T-224 |
| `GET /alerts` | `GET /notifications` (boshqa format) | ⚠️ PATH + FORMAT | T-203 |
| `GET /alerts/unread-count` | `GET /notifications/unread-count` | ⚠️ PATH FARQ | T-203 |
| `PATCH /alerts/:id/read` | `PATCH /notifications/:id/read` | ⚠️ PATH FARQ | T-203 |
| `PATCH /alerts/read-all` | `PATCH /notifications/read-all` | ⚠️ PATH FARQ | T-203 |
| `GET /system/health` | `GET /health` (boshqa format) | ⚠️ PATH + FORMAT | T-207 |
| `GET /system/sync-status` | ❌ YO'Q | ❌ MISSING | T-207 |
| `GET /system/errors` | ❌ YO'Q | ❌ MISSING | T-207 |
| `POST /auth/biometric/register` | ❌ YO'Q | ❌ MISSING | T-225 |
| `POST /auth/biometric/verify` | ❌ YO'Q | ❌ MISSING | T-225 |

**Xulosa:**
- ✅ ISHLAYDI: 4 ta
- ⚠️ PATH yoki FORMAT fix kerak: 18 ta
- ❌ MISSING (yangi implementatsiya): 18 ta

---

## ════════════════════════════════════════════════════════════════
## 🔴 MOBILE-OWNER TASKS TUGADI (T-221..T-226)
## ════════════════════════════════════════════════════════════════

---

## ✅ T-122 | P1 | [BACKEND] | Eskiz.uz SMS → Telegram + Email (BAJARILDI 2026-03-09)
> Eskiz.uz to'liq olib tashlandi. Telegram Bot API (bepul) + SMTP Email fallback.
> - `sms.service.ts` o'chirildi
> - `telegram-notify.service.ts`, `email-notify.service.ts`, `notify.service.ts` yaratildi
> - Schema: `users.telegram_chat_id`, `customers.telegram_chat_id`, `telegram_link_tokens` jadvali
> - Bot: `/start <token>` deep link qo'llab-quvvatlash
> - API: `POST /notifications/telegram/link-token`, `POST /notifications/telegram/verify`
> - `nodemailer` package qo'shildi; `.env.example` yangilandi

---

## 📅 REJA: 8 haftalik FULL PRODUCTION (Kosmetika do'koni)

| Hafta | Maqsad |
|-------|--------|
| **Week 1** | Catalog + Basic POS sale + Receipt print + Shift |
| **Week 2** | Inventory movements + Low stock + Simple reports |
| **Week 3** | Refund/return + Audit log + Roles/Permissions UI |
| **Week 4** | Expiry module + Expiry report + Staging deploy |
| **Week 5** | ⭐ NASIYA (qarz) + Customer CRM + Ledger integration |
| **Week 6** | ⭐ Offline architecture + Sync engine + Resilience |
| **Week 7** | ⭐ SaaS Owner Dashboard + Security hardening |
| **Week 8** | ⭐ Mobile app + Telegram bot + Performance + Deploy |

### ⚠️ KRITIK TOPILMA: NASIYA (qarz savdo) — MVP da YO'Q edi!
> O'zbekiston do'konlarining **60-70%** nasiyada sotadi. Bu funksiya bo'lmasa tizim ishlatilmaydi.
> T-050 — T-054 DARHOL Week 1-2 ga parallel qo'shilishi kerak!

---

## 🔴 P0 — KRITIK (MVP Day 1 uchun shart)

---

### ═══════════════════════════════════════
### WEEK 1 — Catalog + POS Sale + Shift
### ═══════════════════════════════════════

---

## T-011 | P0 | [BACKEND] | Catalog module — Prisma schema (products, categories, units, barcodes)
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/prisma/schema.prisma`
- **Vazifa:**
  - `categories` jadvali: id, tenant_id, name, parent_id (nested), sort_order, is_active, created_at, updated_at, deleted_at
  - `units` jadvali: id, tenant_id, name (dona, kg, litr, quti), short_name, created_at
  - `products` jadvali: id, tenant_id, category_id, name, sku, barcode (unique per tenant), cost_price, sell_price, unit_id, min_stock_level, is_active, image_url, description, expiry_tracking (boolean), created_at, updated_at, deleted_at
  - `product_barcodes` jadvali: id, product_id, barcode, is_primary, created_at (bir product da bir nechta barcode)
  - Indexes: tenant_id, [tenant_id, barcode], [tenant_id, sku], [tenant_id, category_id]
  - `npx prisma migrate dev --name add-catalog-tables`
- **Kutilgan:** Catalog jadvallari DB da tayyor, Prisma client generate bo'lgan

---

## T-012 | P0 | [BACKEND] | Catalog module — CRUD service + controller
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/catalog/`
- **Vazifa:**
  - `CatalogModule`, `CatalogService`, `CatalogController`
  - **Products CRUD:** GET /products (list, filter, search, paginate), GET /products/:id, POST /products, PATCH /products/:id, DELETE /products/:id (soft delete)
  - **Categories CRUD:** GET /categories (tree), POST /categories, PATCH /categories/:id, DELETE /categories/:id
  - **Units CRUD:** GET /units, POST /units
  - **Barcode:** GET /products/barcode/:code — tezkor barcode scan uchun
  - Barcha query da `tenant_id` filter MAJBURIY
  - DTOs: CreateProductDto, UpdateProductDto, CreateCategoryDto, ProductFilterDto (search, category, min/max price, is_active)
  - Pagination: page, limit, sort, order
- **Kutilgan:** API endpointlar ishlaydi, Postman dan test qilsa bo'ladi

---

## T-013 | P0 | [BACKEND] | Sales module — Prisma schema (orders, order_items, shifts)
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/prisma/schema.prisma`
- **Vazifa:**
  - `shifts` jadvali: id, tenant_id, user_id, branch_id, opened_at, closed_at, opening_cash, closing_cash, expected_cash, notes, status (OPEN/CLOSED)
  - `orders` jadvali: id, tenant_id, shift_id, user_id (cashier), branch_id, order_number (auto-increment per tenant), status (COMPLETED/RETURNED/VOIDED), subtotal, discount_amount, discount_type (PERCENT/FIXED), tax_amount, total, notes, fiscal_status (NONE/PENDING/SENT/FAILED), fiscal_id, fiscal_qr, created_at
  - `order_items` jadvali: id, order_id, product_id, product_name (snapshot), quantity, unit_price (snapshot), discount_amount, total, cost_price (snapshot, margin uchun)
  - ⚠️ `orders` va `order_items` — immutable. Return uchun alohida `returns` jadvali
  - `returns` jadvali: id, tenant_id, order_id, user_id, reason, total, status (PENDING/APPROVED), approved_by, created_at
  - `return_items` jadvali: id, return_id, order_item_id, product_id, quantity, amount
  - Indexes: [tenant_id, order_number], [tenant_id, shift_id], [tenant_id, created_at]
- **Kutilgan:** Sales jadvallari DB da tayyor

---

## T-014 | P0 | [BACKEND] | Sales module — Order creation service + shift management
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/sales/`
- **Vazifa:**
  - `SalesModule`, `SalesService`, `SalesController`
  - **Shift:** POST /shifts/open, POST /shifts/close, GET /shifts/current, GET /shifts/:id/report
  - **Orders:** POST /orders (create sale), GET /orders (list, filter by date/shift/status), GET /orders/:id
  - Order yaratishda:
    1. Shift OPEN ekanini tekshir
    2. Product narxlarini DB dan ol (snapshot sifatida saqla)
    3. Discount hisoblash
    4. Order + items yaratish (transaction ichida)
    5. Domain event: `sale.created` emit qilish → inventory deduction, ledger entry
  - Order number: auto-increment per tenant (YYYYMMDD-XXXX format)
  - Smena yopishda: jami savdo, cash, card summary hisoblash
- **Kutilgan:** Savdo qilish va smena boshqarish API tayyor

---

## T-015 | P0 | [BACKEND] | Payments module — Cash + Terminal (card) payment
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/payments/`
- **Vazifa:**
  - `PaymentsModule`, `PaymentsService`, `PaymentsController`
  - Prisma schema: `payment_intents` jadvali: id, tenant_id, order_id, method (CASH/CARD/CLICK/PAYME), amount, status (CREATED/CONFIRMED/SETTLED/FAILED/REVERSED), reference, created_at
  - POST /payments (create payment intent for order)
  - Split payment: bitta order uchun bir nechta payment (cash+card)
  - MVP da faqat CASH va CARD (terminal) — Click/Payme keyinroq
  - Payment yaratishda → `payment.confirmed` event emit
  - PaymentProviderFactory — plugin pattern (CLAUDE_BACKEND.md dagi kabi)
- **Kutilgan:** Cash va card to'lov qilsa bo'ladi, split payment ishlaydi

---

## T-016 | P0 | [FRONTEND] | Admin Panel — Catalog UI (Products CRUD + Categories)
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/Catalog/`
- **Vazifa:**
  - Products list sahifasi: DataTable (sortable, filterable, paginated)
  - Product qo'shish/tahrirlash form: name, barcode, sku, category, cost_price, sell_price, unit, min_stock, image
  - Categories tree view + CRUD
  - Barcode search (text input, barcode scanner ready)
  - React Query hooks: useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct
  - Zod validation: productSchema, categorySchema
  - Loading skeletons, error handling, toast notifications
- **Kutilgan:** Admin paneldan mahsulot va kategoriyalarni boshqarsa bo'ladi

---

## T-017 | P0 | [FRONTEND] | POS Sale Screen — Cart + Barcode + Payment
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/POS/` (MVP da web-based POS, Tauri keyinroq)
- **Vazifa:**
  - **Layout:** Chap — product search/list + cart | O'ng — total, discount, payment
  - **Barcode scan:** input field, barcode scanner (keyboard wedge) support
  - **Cart:** product qo'shish, quantity +/-, item o'chirish, line discount
  - **Discount:** butun orderga discount (% yoki fixed)
  - **Payment panel:** Cash / Card tanlash, summa kiritish, qaytim hisoblash
  - **Split payment:** Cash + Card kombinatsiya
  - **Keyboard shortcuts:** F1=search, F5=cash, F6=card, F10=complete, Esc=cancel
  - **Receipt preview:** sotuvdan keyin chek ko'rinishi
  - Shift status bar (yuqorida): cashier nomi, shift vaqti, savdolar soni
- **Kutilgan:** Tez, keyboard-first POS sale qilsa bo'ladi

---

## T-018 | P0 | [FRONTEND] | Shift management UI — Open/Close shift
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/POS/Shift/`
- **Vazifa:**
  - Shift ochish: opening cash summasini kiritish
  - Shift yopish: closing cash, expected vs actual, notes
  - Shift report: savdolar soni, jami summa, cash/card breakdown
  - POS ekranga kirish uchun shift OPEN bo'lishi shart
- **Kutilgan:** Cashier shift ochib-yopib ishlasa bo'ladi

---

## T-019 | P0 | [BACKEND] | Receipt printing — ESC/POS format endpoint
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/sales/receipt/`
- **Vazifa:**
  - GET /orders/:id/receipt — chek ma'lumotlarini qaytarish (structured JSON)
  - Receipt data: do'kon nomi, manzil, cashier, sana/vaqt, items (name, qty, price), subtotal, discount, tax, total, payment method, fiscal_status
  - Keyinroq ESC/POS binary format ham (Tauri POS uchun)
  - MVP da: HTML receipt template (browser print)
- **Kutilgan:** Chek print qilsa bo'ladi (browser print)

---

## T-020 | P0 | [FRONTEND] | Receipt print UI — Browser print + template
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/components/Receipt/`
- **Vazifa:**
  - Receipt HTML template (80mm thermal printer o'lchamida)
  - Do'kon nomi, manzil, INN, sana/vaqt
  - Items table: nomi, qty, narx, summa
  - Subtotal, discount, tax, TOTAL
  - Payment method, qaytim
  - Fiscal status (PENDING placeholder)
  - window.print() orqali chop etish
  - Auto-print option (sale complete dan keyin)
- **Kutilgan:** Thermal printer dan chek chiqadi

---

### ═══════════════════════════════════════
### WEEK 2 — Inventory + Low Stock + Reports
### ═══════════════════════════════════════

---

## T-021 | P0 | [BACKEND] | Inventory module — Prisma schema (stock_movements, warehouses)
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/prisma/schema.prisma`
- **Vazifa:**
  - `warehouses` jadvali: id, tenant_id, name, address, is_default, is_active, created_at
  - `stock_movements` jadvali: id, tenant_id, product_id, warehouse_id, type (IN/OUT/ADJUSTMENT/RETURN/TRANSFER), quantity (always positive, sign = type), reference_type (PURCHASE/SALE/MANUAL/DAMAGE/RETURN), reference_id, batch_number, expiry_date, cost_price, notes, user_id, created_at
  - ⚠️ stock_movements — IMMUTABLE (updated_at yo'q, delete yo'q)
  - Current stock = SUM of movements (IN = +, OUT = -)
  - `stock_snapshots` jadvali (optional, performance uchun): id, tenant_id, product_id, warehouse_id, quantity, calculated_at
  - Indexes: [tenant_id, product_id, warehouse_id], [tenant_id, created_at]
- **Kutilgan:** Inventory jadvallari DB da tayyor

---

## T-022 | P0 | [BACKEND] | Inventory module — Stock movement service + kirim/chiqim
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/inventory/`
- **Vazifa:**
  - `InventoryModule`, `InventoryService`, `InventoryController`
  - **Stock In (Kirim/Nakladnoy):** POST /inventory/stock-in — supplier dan tovar qabul qilish (items array: product_id, quantity, cost_price, batch_number, expiry_date)
  - **Stock Out (Chiqim):** POST /inventory/stock-out — zarar/yo'qotish (items + reason)
  - **Current Stock:** GET /inventory/stock — product lar ro'yxati + current quantity
  - **Stock by Product:** GET /inventory/stock/:productId — movement history
  - **Low Stock Alert:** GET /inventory/low-stock — min_stock_level dan past bo'lganlar
  - `sale.created` event listener → automatic stock deduction
  - Stock valuation: average cost method (MVP)
- **Kutilgan:** Kirim, chiqim, avtomatik savdo deduction ishlaydi

---

## T-023 | P0 | [FRONTEND] | Inventory UI — Stock levels + Kirim (nakladnoy)
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/Inventory/`
- **Vazifa:**
  - **Stock levels page:** DataTable — product nomi, barcode, current qty, min level, status (OK/LOW/OUT)
  - Color coding: yashil (OK), sariq (LOW), qizil (OUT OF STOCK)
  - **Kirim (Stock In) page:** Form — supplier (text), items (product select + qty + cost_price + expiry_date), notes
  - Items qo'shish: barcode scan yoki product search
  - **Chiqim (Stock Out) page:** Form — reason (DAMAGE/WRITE_OFF/OTHER), items + qty
  - **Low stock alert page:** faqat past bo'lganlar, filterable
  - Barcha sahifalar: React Query hooks, loading, error handling
- **Kutilgan:** Admin paneldan ombor boshqarsa bo'ladi

---

## T-024 | P1 | [BACKEND] | Reports module — Daily revenue, top products, basic finance
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/reports/`
- **Vazifa:**
  - `ReportsModule`, `ReportsService`, `ReportsController`
  - **Daily revenue:** GET /reports/daily-revenue?from=&to= — kunlik savdo summalari
  - **Top products:** GET /reports/top-products?from=&to=&limit= — eng ko'p sotilganlar
  - **Sales summary:** GET /reports/sales-summary?from=&to= — jami savdo, qaytarishlar, sof daromad
  - **Profit estimate:** GET /reports/profit?from=&to= — sales - COGS (avg cost) - expenses
  - **Shift report:** GET /reports/shift/:shiftId — smena hisoboti
  - Barcha reportlarda tenant_id filter MAJBURIY
- **Kutilgan:** Asosiy hisobotlar API tayyor

---

## T-025 | P1 | [FRONTEND] | Reports UI — Dashboard + Daily sales + Top products
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/Dashboard/`, `apps/web/src/pages/Reports/`
- **Vazifa:**
  - **Dashboard:** bugungi savdo, haftalik trend chart, top 5 product, low stock alerts
  - **Daily revenue page:** date range picker, bar chart (Recharts), table
  - **Top products page:** date range, list with qty + revenue
  - **Shift reports:** smena tanlash, details table
  - ResponsiveContainer charts, loading skeletons
- **Kutilgan:** Admin panelda hisobotlar ko'rinadi

---

### ═══════════════════════════════════════
### WEEK 3 — Refund/Return + Audit + Security
### ═══════════════════════════════════════

---

## T-026 | P1 | [BACKEND] | Returns/Refund — service + admin PIN verification
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/sales/`
- **Vazifa:**
  - POST /orders/:id/return — qaytarish yaratish (items, reason, admin_pin)
  - Admin PIN tekshirish: faqat ADMIN yoki MANAGER roli bilan tasdiqlash
  - Cashier faqat so'rov yuboradi, ADMIN/MANAGER tasdiqlaydi
  - Return yaratishda:
    1. Original order mavjudligini tekshir
    2. Qaytarilayotgan qty <= original qty
    3. Return record yaratish
    4. `return.created` event → stock return (IN), payment reversal
  - GET /returns — qaytarishlar ro'yxati
  - Discount limit: Cashier max 5%, MANAGER max 15%, ADMIN unlimited
- **Kutilgan:** Qaytarish + fraud prevention ishlaydi

---

## T-027 | P1 | [BACKEND] | Audit log — Barcha CRUD operatsiyalar log qilinadi
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/interceptors/audit.interceptor.ts`
- **Vazifa:**
  - `audit_logs` jadvali: id, tenant_id, user_id, action (CREATE/UPDATE/DELETE/VOID/RETURN/LOGIN/SHIFT_OPEN/SHIFT_CLOSE), entity_type, entity_id, old_data (JSON), new_data (JSON), ip, user_agent, created_at
  - Global AuditInterceptor: POST/PATCH/DELETE requestlarni avtomatik log qilish
  - Sensitive operatsiyalar: refund, void, discount > 5%, shift close — alohida belgilanadi
  - GET /audit-logs — admin uchun filter (user, action, entity, date)
- **Kutilgan:** Barcha o'zgarishlar izlanadi, admin ko'ra oladi

---

---

### ═══════════════════════════════════════
### WEEK 4 — Expiry + Expenses + Deploy
### ═══════════════════════════════════════

---

## T-031 | P1 | [BACKEND] | Expiry tracking — Expiring soon report + alerts
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/inventory/`
- **Vazifa:**
  - GET /inventory/expiring?days=30 — yaroqlilik muddati 30/60/90 kun ichida tugaydigan productlar
  - Expiry data stock_movements.expiry_date dan olinadi (batch level)
  - Response: product name, barcode, batch, expiry_date, remaining_qty, days_left
  - Sort by expiry_date ASC (eng yaqin birinchi)
  - Expired items: alohida endpoint GET /inventory/expired
  - ⚠️ Kosmetika uchun expiry ENG MUHIM — bu report aniq bo'lishi shart
- **Kutilgan:** Yaroqlilik muddati bo'yicha hisobot ishlaydi

---

## T-032 | P1 | [BACKEND] | Expenses module — Simple expense tracking
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/finance/`
- **Vazifa:**
  - `expenses` jadvali: id, tenant_id, category (RENT/SALARY/DELIVERY/UTILITIES/OTHER), description, amount, date, user_id, created_at
  - `FinanceModule`, `FinanceService`, `FinanceController`
  - POST /expenses — xarajat qo'shish
  - GET /expenses — ro'yxat (filter: category, date range)
  - GET /expenses/summary?from=&to= — kategoriya bo'yicha jami
  - Profit hisoblash: revenue - COGS - expenses
- **Kutilgan:** Oddiy xarajatlarni kiritish va hisobot olsa bo'ladi

---

---

## T-035 | P1 | [BACKEND] | Ledger module — Double-entry journal (MVP — basic)
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/ledger/`
- **Vazifa:**
  - `LedgerModule`, `LedgerService` (Controller YO'Q — faqat internal)
  - Prisma schema: `journal_entries` + `ledger_lines` (CLAUDE_BACKEND.md dagi kabi)
  - `sale.created` → debit Cash/Receivable, credit Revenue
  - `payment.confirmed` → debit Cash, credit Sales
  - `return.created` → reversal entries
  - sum(debit) === sum(credit) validation MAJBURIY
  - ⚠️ IMMUTABLE — update/delete TAQIQLANGAN
- **Kutilgan:** Har savdo, to'lov, qaytarishda ledger entry avtomatik yaratiladi

---

## T-036 | P1 | [BACKEND] | Fiscal adapter — "Ready" dizayn (placeholder)
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/tax/`
- **Vazifa:**
  - `TaxModule`, `FiscalAdapterService`
  - Order da: fiscal_status field (NONE/PENDING/SENT/FAILED)
  - Placeholder adapter: hozir faqat status ni PENDING qiladi
  - Keyinroq real provider (REGOS va boshqa) adapter qo'shiladi
  - Receipt da fiscal_status ko'rsatish
  - ⚠️ Sale ni HECH QACHON block qilma fiscal fail bo'lsa
- **Kutilgan:** Fiscal dizayn tayyor, keyinroq plug-in qilsa bo'ladi

---

## T-037 | P1 | [DEVOPS] | Staging deploy — Docker + CI/CD basic
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `docker/`, `.github/workflows/`
- **Vazifa:**
  - Production-ready Dockerfile (API + Web)
  - docker-compose.staging.yml (PostgreSQL, Redis, API, Web)
  - GitHub Actions: lint → type-check → test → build → deploy
  - Environment variables management (.env.staging)
  - Basic health check endpoint
  - SSL/HTTPS setup
- **Kutilgan:** Staging server da ishlaydi, auto-deploy PR merge dan keyin

---

## T-038 | P0 | [IKKALASI] | Shared types — API contract (request/response DTOs)
- **Sana:** 2026-02-26
- **Mas'ul:** Polat + AbdulazizYormatov
- **Fayl:** `packages/types/`
- **Vazifa:**
  - Product, Category, Unit types
  - Order, OrderItem, Shift types
  - PaymentIntent types
  - StockMovement types
  - Return types
  - Common: PaginatedResponse<T>, ApiError, SortOrder
  - Frontend va Backend bir xil type ishlatishi SHART
- **Kutilgan:** `packages/types` da barcha shared typelar tayyor

---

## T-039 | P0 | [BACKEND] | Domain events setup — EventEmitter2 integration
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/events/`
- **Vazifa:**
  - NestJS EventEmitter2 integratsiya
  - Events: `sale.created`, `payment.confirmed`, `return.created`, `stock.low`, `shift.opened`, `shift.closed`
  - EventLogService: barcha eventlarni `event_log` jadvaliga yozish (immutable)
  - Event handler pattern: CLAUDE_BACKEND.md dagi kabi
  - Sale → Inventory deduction, Ledger entry, Fiscal queue avtomatik
- **Kutilgan:** Modul aro aloqa event-driven ishlaydi

---

## 🟡 P1 — MUHIM (funksional xatolik / MVP+)

_(yuqoridagi T-024 — T-037 P1 tasklar ham shu kategoriyada)_

---

## 🔵 P2 — O'RTA (MVP dan keyin, Phase 2)

---

## T-040 | P2 | [BACKEND] | Telegram notifications — Low stock, shift close, suspicious refund
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/bot/`
- **Vazifa:**
  - grammY bot setup
  - Admin Telegram chat ga alert yuborish
  - Triggerlar: low stock, shift close report, refund > threshold, expired stock
  - `/report` command — bugungi savdo summary
- **Kutilgan:** Admin Telegram dan alertlar oladi

---

## T-041 | P2 | [FRONTEND] | Supplier management — CRUD + product linking
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/Catalog/Suppliers/`
- **Vazifa:**
  - Suppliers CRUD: name, phone, company, address
  - Product-supplier linking
  - Kirim (stock-in) da supplier tanlash
- **Kutilgan:** Yetkazib beruvchilarni boshqarsa bo'ladi

---

## T-042 | P2 | [BACKEND] | Supplier module — CRUD service
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/catalog/`
- **Vazifa:**
  - `suppliers` jadvali: id, tenant_id, name, phone, company, address, is_active
  - `product_suppliers` jadvali: product_id, supplier_id, supply_price
  - CRUD endpoints: /suppliers
- **Kutilgan:** Supplier API tayyor

---

## ⚪ P3 — PAST (Phase 2+, keyinroq)

---

## T-043 | P3 | [BACKEND] | Loyalty module — Bonus points system
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Xaridor loyalty: points earn (sale), points redeem (discount). Customer card / phone number.

## T-044 | P3 | [FRONTEND] | Loyalty UI — Customer points + redeem
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** POS da customer tanlash, points ko'rsatish, points bilan to'lash.

## T-045 | P3 | [BACKEND] | Bundles/Sets — Kosmetika setlar (skincare set, gift set)
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Bundle product: bir nechta product ni bitta narxda sotish. Stock deduction har component dan.

## T-046 | P3 | [BACKEND] | Serial number tracking — Qimmat brendlar uchun
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Product variant-level serial number. Kirimda serial qo'shish, sotishda serial tanlash.

## T-047 | P3 | [IKKALASI] | Multi-branch support — Filiallar
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Branch CRUD, branch-level stock, branch-level reports, stock transfer between branches.

## T-048 | P3 | [BACKEND] | Supplier order automation — Auto-reorder
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Min stock level ga yetganda supplier ga avtomatik buyurtma (notification yoki draft order).

## T-049 | P3 | [IKKALASI] | POS Desktop — Tauri + SQLite offline-first
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Web POS → Tauri desktop app. SQLite local DB, outbox sync, ESC/POS printer. CLAUDE_FRONTEND.md dagi offline-first arxitektura.

---

# ════════════════════════════════════════════════════════════════
# PRODUCTION-READY FEATURES (Deep Analysis — T-050+)
# ════════════════════════════════════════════════════════════════

---

### ═══════════════════════════════════════
### 🔥 NASIYA (QARZ SAVDO) — ENG KRITIK!
### O'zbekiston do'konlarining 60-70% nasiyada sotadi
### Bu bo'lmasa tizim ISHLATILMAYDI
### ═══════════════════════════════════════

---

## T-050 | P0 | [BACKEND] | Customer module — Prisma schema + CRUD
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/prisma/schema.prisma`, `apps/api/src/customers/`
- **Vazifa:**
  - `customers` jadvali: id, tenant_id, name, phone (UNIQUE per tenant — O'zbekistonda asosiy identifikator), telegram_username, address, notes, debt_balance (calculated), total_purchases, visit_count, last_visit_at, debt_limit, is_blocked, created_at, updated_at, deleted_at
  - `CustomerModule`, `CustomerService`, `CustomerController`
  - POST /customers — yangi xaridor
  - GET /customers — ro'yxat (search by phone/name, filter by has_debt)
  - GET /customers/:id — profil + purchase history + debt history
  - GET /customers/phone/:phone — tezkor telefon orqali topish (POS uchun)
  - PATCH /customers/:id — tahrirlash
  - Indexes: [tenant_id, phone], [tenant_id, name]
- **Kutilgan:** Xaridorlar bazasi tayyor, telefon orqali tezkor topsa bo'ladi

---

## T-051 | P0 | [BACKEND] | Nasiya (qarz) module — Qarz yaratish + to'lash
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/customers/nasiya/`
- **Vazifa:**
  - `debts` jadvali: id, tenant_id, customer_id, order_id, amount, paid_amount, remaining, due_date, status (ACTIVE/PARTIALLY_PAID/PAID/OVERDUE/WRITTEN_OFF), notes, created_at
  - `debt_payments` jadvali: id, debt_id, tenant_id, amount, method (CASH/CARD/TRANSFER), received_by (user_id), notes, created_at
  - POST /orders — nasiya bilan savdo: payment_method = NASIYA, customer_id MAJBURIY
  - POST /debts/:id/pay — qarz to'lash (to'liq yoki qisman)
  - GET /debts — ro'yxat (filter: customer, status, overdue)
  - GET /debts/overdue — muddati o'tganlar
  - GET /debts/summary — jami qarz, overdue summa, yig'ilgan summa
  - **Qoidalar:**
    - Nasiyaga sotishda: customer.debt_limit tekshirish
    - Overdue customer ga yangi nasiya BLOCK qilish
    - debt_payment yaratishda: Ledger entry (debit Cash, credit Accounts Receivable)
    - Partial payment: eng eski qarzga birinchi (FIFO)
  - **Aging report:** GET /debts/aging — 0-30, 31-60, 61-90, 90+ kun bucketlar
- **Kutilgan:** Nasiyaga sotish, qarz to'lash, overdue tracking ishlaydi

---

## T-052 | P0 | [FRONTEND] | Nasiya UI — POS da qarzga sotish
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/POS/`
- **Vazifa:**
  - POS payment panelda "Nasiya" tugmasi (F7)
  - Nasiya tanlanganda: customer search modal (telefon orqali)
  - Customer topilmasa: tezkor yaratish (name + phone)
  - Customer debt limit va status ko'rsatish (qancha qarzi bor, limit qancha)
  - Overdue customer → qizil ogohlantirish "Bu xaridor muddati o'tgan qarzga ega!"
  - Nasiya savdo tasdiqlash → order yaratiladi + debt record
- **Kutilgan:** Kassir nasiyaga sotsa bo'ladi, customer tezkor topiladi

---

## T-053 | P0 | [FRONTEND] | Nasiya management UI — Qarzlar ro'yxati + to'lov qabul
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/Customers/`
- **Vazifa:**
  - **Customers list:** DataTable — name, phone, total debt, last visit, status
  - **Customer profile:** purchase history, debt history, to'lovlar
  - **Debt list:** DataTable — customer, amount, remaining, due_date, status, age (days)
  - Color coding: yashil (current), sariq (0-30 overdue), qizil (30+ overdue)
  - **Debt payment form:** customer tanlash → amount kiritish → method → confirm
  - **Aging report page:** 4 bucket (0-30, 31-60, 61-90, 90+), jami summalar, pie chart
  - **Dashboard widget:** "Jami nasiya: X so'm | Overdue: Y so'm"
- **Kutilgan:** Admin/manager nasiyalarni to'liq boshqarsa bo'ladi

---

## T-054 | P1 | [BACKEND] | Nasiya reminders — SMS/Telegram orqali eslatish
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/notifications/`
- **Vazifa:**
  - Due date dan 3 kun oldin: avtomatik Telegram/SMS reminder
  - Overdue bo'lganda: kunlik reminder (max 3 kun, keyin haftalik)
  - Template: "Hurmatli [ism], [do'kon] da [X] so'm qarzingiz bor. Muddati: [sana]"
  - Reminder history log
  - Tenant settings: reminder enabled/disabled, channel (SMS/Telegram/both)
- **Kutilgan:** Xaridorga avtomatik qarz eslatish yuboriladi

---

### ═══════════════════════════════════════
### 🖥️ SAAS OWNER (FOUNDER) DASHBOARD
### Barcha tenantlar ustidan monitoring
### ═══════════════════════════════════════

---

## T-055 | P0 | [BACKEND] | Super Admin auth — Cross-tenant access
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/`
- **Vazifa:**
  - `admin_users` jadvali: id, email, password_hash, name, role (SUPER_ADMIN/SUPPORT), is_active, created_at
  - Alohida login endpoint: POST /admin/auth/login
  - Super Admin JWT: tenant_id = null, role = SUPER_ADMIN
  - Cross-tenant query: TenantGuard bypass for SUPER_ADMIN
  - Barcha admin actions audit log ga yoziladi
- **Kutilgan:** SaaS owner barcha tenantlarni ko'ra oladi

---

## T-056 | P0 | [BACKEND] | Founder Dashboard API — Aggregated metrics
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/admin/`
- **Vazifa:**
  - `AdminModule`, `AdminService`, `AdminController`
  - GET /admin/tenants — barcha tenantlar ro'yxati (name, slug, created_at, status, user_count, last_activity, subscription_status)
  - GET /admin/metrics — aggregated: jami savdo bugun/hafta/oy, jami orders, active tenants, active users online
  - GET /admin/tenants/:id/sales — tenant ning savdo tarixi (real-time)
  - GET /admin/tenants/:id/errors — tenant ning error loglari
  - GET /admin/tenants/:id/health — tenant health: last sync, last sale, error count 24h, active users
  - GET /admin/errors — BARCHA tenantlardan error log (filter: tenant, severity, date)
  - GET /admin/sales/live — real-time savdo stream (WebSocket yoki SSE)
- **Kutilgan:** Founder barcha do'konlarning real-time datalarini ko'radi

---

## T-057 | P0 | [FRONTEND] | Founder Dashboard UI — Main monitoring panel
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/Admin/`
- **Vazifa:**
  - **Alohida layout** /admin/* — SaaS owner uchun (tenant admin paneldan farqli)
  - **Overview page:**
    - Card grid: jami tenantlar, active tenants, bugungi jami savdo, jami orders
    - Live sales ticker (so'nggi 10 ta savdo real-time)
    - Revenue chart (barcha tenantlar aggregated, daily)
    - Top 5 tenants by revenue (bar chart)
  - **Tenants list page:**
    - DataTable: name, slug, sales today, revenue today, errors 24h, last activity, status
    - Traffic light: yashil (active, no errors), sariq (active, errors), qizil (inactive > 24h)
    - Search, filter by status
  - **Tenant detail page:**
    - Savdo chart, top products, error list, active users, shift history
    - "Login as" tugmasi (impersonation)
  - **Error log page:**
    - Barcha tenantlardan centralized errors
    - Filter: tenant, type (API/client/sync), severity, date
    - Error detail: stack trace, user, request info
  - **Real-time notifications:**
    - Browser notification: yangi error, tenant down, big refund
- **Kutilgan:** Founder bitta ekrandan BARCHA do'konlarni monitoring qiladi

---

## T-058 | P1 | [BACKEND] | Tenant impersonation — "Login as" any tenant
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/admin/`
- **Vazifa:**
  - POST /admin/impersonate/:tenantId — vaqtinchalik token (1 soat, read-only option)
  - Barcha impersonation audit log ga yoziladi: who, when, which tenant
  - Impersonated session da banner: "Siz [tenant] sifatida kirgansiz"
  - Faqat SUPER_ADMIN roli
- **Kutilgan:** SaaS owner debug uchun har qanday tenant ga kirsa bo'ladi

---

## T-059 | P1 | [BACKEND] | Tenant provisioning wizard — One-click setup
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/admin/`
- **Vazifa:**
  - POST /admin/tenants/provision — yangi tenant yaratish:
    1. Tenant record
    2. Owner user (phone + temp password)
    3. Default branch
    4. Seed categories (Kosmetika: Terini parvarish, Soch, Makiyaj, Atir, Tirnoq, Tana parvarish, Aksessuarlar)
    5. Default units (dona, quti, set, ml, gram)
    6. Default settings (currency: UZS, tax: 12%, fiscal: disabled)
  - Response: tenant slug, owner credentials
- **Kutilgan:** Yangi do'konni 1 klikda tayyorlab bersa bo'ladi

---

---

## T-061 | P1 | [BACKEND] | Real-time events — WebSocket/SSE for live data
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/realtime/`
- **Vazifa:**
  - NestJS WebSocket Gateway (Socket.io)
  - Events: `sale:completed`, `error:new`, `sync:status`, `shift:changed`
  - Room-based: tenant_id room (tenant admin), `admin` room (founder)
  - JWT auth for WebSocket connections
  - Founder: barcha tenantlardan event oladi
  - Tenant admin: faqat o'z tenant eventlari
- **Kutilgan:** Real-time data update frontend da ishlaydi

---

### ═══════════════════════════════════════
### 🌐 OFFLINE-FIRST ARXITEKTURA
### Internet yo'q paytda savdo davom etadi
### Internet kelganda data avtomatik sync
### ═══════════════════════════════════════

---

## T-062 | P0 | [BACKEND] | Outbox pattern — Server-side sync endpoint
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/sync/`
- **Vazifa:**
  - `SyncModule`, `SyncService`, `SyncController`
  - POST /sync/inbound — POS dan kelgan batch data qabul qilish
    - Body: array of events [{type, payload, idempotency_key, timestamp}]
    - Har event uchun: idempotency check → process → ack
  - GET /sync/outbound?since=timestamp — server dan o'zgarishlarni olish (products, prices, categories)
  - **Idempotency:** duplicate event reject (409), already processed = skip
  - **Ordering:** sequence_number orqali tartib saqlash
  - **Batch processing:** 100 ta event bitta request da
  - **Conflict resolution:**
    - Financial (sale, payment, stock movement): event-sourcing, reject true duplicates
    - Non-financial (product name, category): last-write-wins + timestamp
- **Kutilgan:** POS offline ishlagan data serverga to'g'ri sync bo'ladi

---

## T-063 | P0 | [IKKALASI] | Sync engine package — Core offline logic
- **Sana:** 2026-02-26
- **Mas'ul:** Polat + AbdulazizYormatov
- **Fayl:** `packages/sync-engine/`
- **Vazifa:**
  - `sync_outbox` table schema (for SQLite and PostgreSQL)
  - OutboxManager: append event, process queue (FIFO), mark sent/failed
  - SyncWorker: background process, exponential backoff (1s→2s→4s→8s, max 5min)
  - ConflictResolver: strategy pattern (event-sourcing vs last-write-wins)
  - IdempotencyKeyGenerator: UUID v4 + tenant + timestamp
  - ConnectivityDetector: active ping every 30s, degrade detection (latency > 5s)
  - SyncStatus: online/offline/syncing/error states
- **Kutilgan:** Offline-first core logic tayyor, POS va server ishlatsa bo'ladi

---

## T-064 | P0 | [FRONTEND] | Sync status UI — Persistent status bar
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/components/SyncStatus/`
- **Vazifa:**
  - POS ekranda persistent status bar:
    - 🟢 "Online — synced" (hammasi yaxshi)
    - 🔵 "Online — syncing (14 pending)" (yuborilmoqda)
    - 🔴 "Offline — 47 unsynced" (internet yo'q)
    - 🟡 "Slow connection" (latency > 5s)
  - Click → pending queue details (qaysi savdolar sync bo'lmagan)
  - Auto-retry indicator
  - Last sync timestamp
- **Kutilgan:** Kassir doim sync holatini ko'radi

---

---

### ═══════════════════════════════════════
### 🔒 SECURITY HARDENING
### ═══════════════════════════════════════

---

## T-067 | P0 | [BACKEND] | Failed login lockout — Brute-force himoya
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/`
- **Vazifa:**
  - 5 muvaffaqiyatsiz urinish → 15 daqiqa lock
  - `login_attempts` jadvali: user_id, ip, success, created_at
  - Lock status: GET /auth/me da ko'rsatish
  - Admin unlock: POST /users/:id/unlock
  - Barcha failed login lar audit log ga
- **Kutilgan:** Brute-force hujumdan himoya

---

## T-068 | P0 | [BACKEND] | Admin PIN — Sensitive operatsiyalar uchun
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/`
- **Vazifa:**
  - User jadvaliga: `pin_hash` field (4-6 raqam, bcrypt)
  - PIN kerak operatsiyalar: refund, void, discount > 5%, price change, shift close, cash drawer open
  - POST /auth/verify-pin — PIN tekshirish (request body: pin, action_type)
  - Noto'g'ri PIN 3 marta → 5 daqiqa lock
  - PIN almashtirishda eski PIN kerak
- **Kutilgan:** Fraud prevention — sensitive ops faqat PIN bilan

---

## T-069 | P1 | [BACKEND] | Session management — Active sessions tracking
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/`
- **Vazifa:**
  - `sessions` jadvali: id, user_id, tenant_id, device_info, ip, last_active, created_at
  - GET /auth/sessions — foydalanuvchi ning active sessions
  - DELETE /auth/sessions/:id — sessionni tugatish
  - Max 3 concurrent session (configurable per tenant)
  - Admin: force logout any user
- **Kutilgan:** Kim qayerdan kirganini ko'rsa bo'ladi

---

## T-070 | P1 | [BACKEND] | Employee activity monitor — Fraud detection
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/reports/`
- **Vazifa:**
  - Per-cashier metrics: void count, refund count, discount total, avg transaction value
  - Suspicious patterns: 3+ void in 1 hour, refund > 20% of sales, discount > threshold
  - GET /reports/employee-activity — filter by user, date range
  - Alert trigger: suspicious activity → Telegram notification to owner
- **Kutilgan:** Xodim firibgarligi aniqlanadi

---

## T-071 | P1 | [BACKEND] | API Key auth — POS sync uchun long-lived token
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/`
- **Vazifa:**
  - `api_keys` jadvali: id, tenant_id, branch_id, key_hash, name, scopes, last_used, is_active, created_at, expires_at
  - POS-to-server sync: API key (expire qilmaydi, JWT o'rniga)
  - Scoped: faqat sync endpoints ga access
  - Revocable: admin paneldan o'chirish mumkin
  - Rate limit: per API key
- **Kutilgan:** POS offline dan serverga xavfsiz sync

---

## T-072 | P1 | [BACKEND] | Input sanitization — XSS/injection himoya
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/pipes/`
- **Vazifa:**
  - Global pipe: HTML strip from all text inputs
  - Barcode format validation (EAN-13, EAN-8, Code128, UPC-A)
  - Phone format validation (+998XXXXXXXXX)
  - Price validation: positive number, max 2 decimal
  - File upload: mimetype whitelist (image/jpeg, image/png, image/webp)
- **Kutilgan:** Barcha kiritilgan data xavfsiz

---

### ═══════════════════════════════════════
### ⚡ PERFORMANCE & SCALABILITY
### ═══════════════════════════════════════

---

## T-073 | P0 | [BACKEND] | Redis caching layer — Product catalog + stock cache
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/cache/`
- **Vazifa:**
  - NestJS CacheModule + Redis adapter
  - Cache strategiyasi:
    - Product catalog: 5 min TTL, invalidate on product update
    - Current stock levels: 1 min TTL, invalidate on stock movement
    - User sessions: until logout
    - Exchange rate: 24h TTL
  - Cache decorator: `@Cacheable(key, ttl)`
  - Cache invalidation: event-driven (product.updated → clear cache)
- **Kutilgan:** API response 3-5x tezroq (cache hit)

---

## T-074 | P0 | [BACKEND] | Database indexing — Critical query optimization
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/prisma/schema.prisma`
- **Vazifa:**
  - Composite indexes: [tenant_id, created_at] on orders, [tenant_id, barcode] on products, [tenant_id, product_id, warehouse_id] on stock_movements
  - Partial indexes: `WHERE is_active = true` on products
  - Pagination: barcha list endpoint da MAJBURIY (default 20, max 100)
  - Global interceptor: paginate qilinmagan list so'rovni reject
- **Kutilgan:** Katta data bilan ham tez ishlaydi

---

## T-075 | P1 | [BACKEND] | Stock snapshot materialization — Hourly recalculation
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/inventory/`
- **Vazifa:**
  - `@Cron('0 * * * *')` — har soat stock snapshot hisoblash
  - `stock_snapshots` jadvaliga: tenant_id, product_id, warehouse_id, quantity, calculated_at
  - Stock query: snapshot + recent movements (snapshot dan keyingilar) = current stock
  - 10x tezroq (10000+ movement bor product uchun)
- **Kutilgan:** Stock query tez, katta inventar bilan ham ishlaydi

---

## T-076 | P1 | [BACKEND] | BullMQ worker — Background job processing
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/worker/`
- **Vazifa:**
  - Queue lar: `fiscal-receipt`, `notification`, `report-generate`, `stock-snapshot`, `data-export`, `sync-process`
  - Job patterns: retry (3x, exponential), DLQ (dead letter), timeout
  - Admin UI: BullMQ Board (optional) — job status ko'rish
  - Cron jobs: stock snapshot (hourly), expiry check (daily), exchange rate (daily)
- **Kutilgan:** Background tasklar xavfsiz va kuzatiladigan tarzda ishlaydi

---

## T-077 | P1 | [BACKEND] | Response compression + rate limiting per tenant
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/`
- **Vazifa:**
  - gzip/brotli compression middleware (catalog 1000+ items uchun muhim)
  - Per-tenant rate limit: 100 req/min default, configurable per plan
  - Per-endpoint rate limit: login = 10/min, sync = 30/min, reports = 20/min
  - Graceful 429 response with Retry-After header
- **Kutilgan:** API tez va himoyalangan

---

### ═══════════════════════════════════════
### 🇺🇿 MOLIYAVIY COMPLIANCE (O'zbekiston)
### ═══════════════════════════════════════

---

## T-078 | P0 | [BACKEND] | NDS (QQS) hisoblash — 12% VAT
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/tax/`
- **Vazifa:**
  - UZ QQS: 12% standart stavka
  - Per-product tax config: taxable/exempt
  - Narx formatlar: tax-inclusive (default UZ) vs tax-exclusive
  - Tax hisoblash: order level summary (subtotal, tax_amount, total)
  - Tax report: GET /reports/tax?from=&to= — davriy QQS hisobot
- **Kutilgan:** Har savdoda QQS to'g'ri hisoblanadi

---

## T-079 | P0 | [BACKEND] | INN va STIR validatsiya — Soliq identifikator
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/`
- **Vazifa:**
  - Tenant jadvaliga: inn (9 yoki 14 raqam), stir, oked, legal_name, legal_address
  - INN format validatsiya
  - Receipt da INN chiqarish (qonuniy talab)
  - Tenant registration da INN MAJBURIY
- **Kutilgan:** Soliq ma'lumotlari to'g'ri saqlanadi va chekda ko'rinadi

---

## T-080 | P0 | [BACKEND] | UZS yaxlitlash — Tiyinsiz hisoblash
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/utils/`
- **Vazifa:**
  - UZ da amalda tiyin yo'q. Yaxlitlash: 100 yoki 1000 ga (configurable)
  - Yaxlitlash farqi ledger da alohida account ga yoziladi
  - Round function: `roundUZS(amount, precision)` — utils package da
  - Barcha narx/summa hisoblashda ishlatiladi
- **Kutilgan:** Narxlar real hayotdagi kabi yaxlitlanadi

---

## T-081 | P1 | [BACKEND] | REGOS fiskal integratsiya — Elektron chek
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/tax/fiscal/`
- **Vazifa:**
  - REGOS API adapter: receipt yuborish → fiscal_id + QR code olish
  - Queue orqali: savdo → fiscal queue → retry (3x, exponential)
  - Fail bo'lsa: savdo DAVOM etadi, fiscal_status = PENDING → retry
  - Receipt snapshot: immutable saqlanadi
  - Z-report: kunlik fiskal yakuniy hisobot
- **Kutilgan:** Soliq idorasiga elektron chek yuboriladi

---

## T-082 | P1 | [BACKEND] | Valyuta support — USD/UZS dual currency
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/currency/`
- **Vazifa:**
  - Import kosmetikalar USD da narxlanadi, UZS da sotiladi
  - `exchange_rates` jadvali: date, usd_uzs, source (CBU)
  - Cron: har kuni CBU API dan kurs olish (https://cbu.uz/oz/arkhiv-kursov-valyut/json/)
  - Product da: cost_currency (USD/UZS), auto-convert to UZS
  - Margin hisoblashda valyuta kursi hisobga olinadi
- **Kutilgan:** Import tovar narxi USD da, foyda to'g'ri hisoblanadi

---

## T-083 | P1 | [BACKEND] | Z-report — Kunlik fiskal yakuniy hisobot
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/reports/`
- **Vazifa:**
  - POST /reports/z-report — kunlik yakuniy hisobot yaratish
  - Tarkibi: jami savdo, jami QQS, jami qaytarishlar, payment method breakdown, fiscal receipt count
  - Immutable: yaratilgandan keyin o'zgartirib BO'LMAYDI
  - Sequence number: auto-increment
  - Soliq tekshiruvida talab qilinadi
- **Kutilgan:** Kunlik Z-hisobot soliq uchun tayyor

---

### ═══════════════════════════════════════
### 🔧 OPERATSION FEATURES
### ═══════════════════════════════════════

---

## T-084 | P0 | [DEVOPS] | Automated database backups — Daily to S3/MinIO
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `docker/`, `scripts/`
- **Vazifa:**
  - Kunlik pg_dump → S3/MinIO (encrypted GPG)
  - Retention: 30 kun
  - Restore test: oylik avtomatik
  - Backup notification: success/fail → Telegram
- **Kutilgan:** Data hech qachon yo'qolmaydi

---

## T-085 | P0 | [BACKEND] | Health checks — Readiness + liveness
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/health/`
- **Vazifa:**
  - GET /health/live — process alive (200)
  - GET /health/ready — DB + Redis + MinIO connected (200/503)
  - GET /health/startup — app fully initialized
  - Graceful shutdown: `enableShutdownHooks()`, in-flight request finish, DB close
- **Kutilgan:** Deploy va monitoring to'g'ri ishlaydi

---

## T-086 | P1 | [DEVOPS] | Monitoring — Prometheus + Grafana
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `docker/monitoring/`
- **Vazifa:**
  - Prometheus metrics: request latency, error rate, active connections, queue depth, DB connection pool
  - Grafana dashboard: API performance, error trends, resource usage
  - Alert rules: error rate > 5%, latency > 2s, queue depth > 100
  - Uptime monitoring: external ping → Telegram alert
- **Kutilgan:** System performance real-time ko'rinadi

---

## T-087 | P1 | [BACKEND] | Data export — CSV/Excel
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/reports/`
- **Vazifa:**
  - Har report va list: "Export" tugmasi
  - BullMQ job: generate file → S3 → download URL
  - Formats: CSV, XLSX
  - Large exports (10k+ rows): async, ready notification
  - Export history: tenant admin ko'rsa bo'ladi
- **Kutilgan:** Hisobotlarni Excel ga chiqarsa bo'ladi

---

## T-088 | P1 | [BACKEND] | Scheduled tasks (Cron) — Daily/hourly jobs
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/cron/`
- **Vazifa:**
  - @Cron tasks:
    - Hourly: stock snapshot recalculation
    - Daily 00:00: exchange rate update (CBU)
    - Daily 06:00: expiry report generation
    - Daily 08:00: nasiya reminder (due today/overdue)
    - Weekly: dead stock report
    - Monthly: subscription billing check
  - Cron log: har run audit qilinadi
- **Kutilgan:** Avtomatik kunlik/haftalik tasklar ishlaydi

---

### ═══════════════════════════════════════
### 📊 ANALYTICS & BUSINESS INTELLIGENCE
### ═══════════════════════════════════════

---

## T-089 | P1 | [BACKEND] | Sales analytics — Trend, top products, margin
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/ai/`
- **Vazifa:**
  - GET /analytics/sales-trend?period=daily|weekly|monthly — sales trend chart data
  - GET /analytics/top-products?from=&to=&limit= — eng foydali/eng ko'p sotilgan
  - GET /analytics/dead-stock?days=30|60|90 — harakatsiz tovarlar
  - GET /analytics/margin — per-product margin analysis
  - GET /analytics/abc — ABC classification (A=top 20%, B=30%, C=50%)
  - GET /analytics/cashier-performance — per-cashier metrics
  - GET /analytics/hourly-heatmap — soatlik savdo heatmap
- **Kutilgan:** Business intelligence endpointlar tayyor

---

---

### ═══════════════════════════════════════
### ⚙️ ERROR HANDLING & RESILIENCE
### ═══════════════════════════════════════

---

## T-091 | P0 | [BACKEND] | Global exception filter — Consistent error responses
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/filters/`
- **Vazifa:**
  - AllExceptionsFilter: barcha handled va unhandled errorlarni ushlash
  - Standard response format: `{ statusCode, message, error, timestamp, path, requestId }`
  - Internal details HECH QACHON client ga yuborilmaydi
  - 5xx errors → error log file + Sentry/alert
  - Prisma errors → user-friendly message (unique constraint, not found, etc.)
- **Kutilgan:** Barcha errorlar bir xil formatda, xavfsiz

---

## T-092 | P0 | [BACKEND] | Transaction safety — Prisma $transaction everywhere
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/` (barcha service lar)
- **Vazifa:**
  - Barcha multi-step write operations: `prisma.$transaction([...])` ichida
  - Order yaratish: order + items + payment + event = 1 transaction
  - Stock in: movements + snapshot update = 1 transaction
  - Nasiya: order + debt + event = 1 transaction
  - Har qanday step fail → FULL rollback
- **Kutilgan:** Data hech qachon yarim-yarti holatda qolmaydi

---

## T-093 | P1 | [BACKEND] | Circuit breaker — External service himoya
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/circuit-breaker/`
- **Vazifa:**
  - External services uchun: fiscal API, SMS gateway, payment provider, exchange rate API
  - 3 consecutive fail → circuit OPEN (30s) → half-open test → close
  - `opossum` library
  - Fallback: fiscal fail → queue, SMS fail → retry later, exchange rate fail → use cached
- **Kutilgan:** External service fail butun tizimni buzolmaydi

---

## T-094 | P1 | [BACKEND] | Dead letter queue — Failed job management
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/worker/`
- **Vazifa:**
  - BullMQ: 3 retry dan keyin → DLQ ga ko'chirish
  - Admin endpoint: GET /admin/dlq — failed jobs list
  - POST /admin/dlq/:id/retry — qayta urinish
  - DELETE /admin/dlq/:id — dismiss
  - Alert: DLQ da 10+ job → Telegram notification
- **Kutilgan:** Failed jobs kuzatiladi va boshqariladi

---

### ═══════════════════════════════════════
### 🏢 KOSMETIKA-SPECIFIC FEATURES
### ═══════════════════════════════════════

---

## T-095 | P1 | [BACKEND] | Product variants — Rang/hajm/tur
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/catalog/`
- **Vazifa:**
  - `product_variants` jadvali: id, product_id, tenant_id, name (e.g. "Qizil", "50ml"), sku, barcode, cost_price, sell_price, is_active
  - Kosmetikada: lipstick 20 ta rangda, krem 3 ta hajmda
  - Har variant o'z barcode, stock, price
  - POS da: product tanlash → variant tanlash
  - Stock: variant level da tracking
- **Kutilgan:** Kosmetika variantlari (rang, hajm) boshqariladi

---

## T-096 | P2 | [BACKEND] | Tester/sample tracking — Ochilgan tester hisobi
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/inventory/`
- **Vazifa:**
  - Tester ochish: stock_movement type = TESTER
  - Tester cost: expense sifatida hisoblanadi
  - Tester list: GET /inventory/testers — qaysi productlardan tester ochilgan
  - Monthly tester cost report
- **Kutilgan:** Tester xarajati to'g'ri hisoblanadi

---

## T-097 | P2 | [BACKEND] | Product sertifikat — Kosmetika sifat hujjati
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/catalog/`
- **Vazifa:**
  - `product_certificates` jadvali: id, product_id, cert_number, issuing_authority, issued_at, expires_at, file_url
  - Expired sertifikat → alert
  - Soliq tekshiruvida talab qilinishi mumkin
- **Kutilgan:** Sertifikat ma'lumotlari saqlanadi va kuzatiladi

---

## T-098 | P1 | [BACKEND] | Price management — Wholesale/retail + tiered
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/catalog/`
- **Vazifa:**
  - `product_prices` jadvali: id, product_id, price_type (RETAIL/WHOLESALE), min_qty, price, valid_from, valid_to
  - POS da: customer group ga qarab narx (wholesale customer → wholesale price)
  - Tiered: 1-5 dona = X, 6-10 = Y, 11+ = Z
  - Price history: narx o'zgarishi log qilinadi
  - Scheduled price: kelajakda boshlanadigan narx
- **Kutilgan:** Narxlarni moslashuvchan boshqarsa bo'ladi

---

## T-099 | P2 | [BACKEND] | Promotions engine — Discount, buy-X-get-Y
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/sales/promotions/`
- **Vazifa:**
  - `promotions` jadvali: id, tenant_id, name, type (PERCENT/FIXED/BUY_X_GET_Y/BUNDLE), rules (JSON), valid_from, valid_to, is_active
  - POS da: auto-apply matching promotions
  - Types: % chegirma, fixed summa, 2+1, happy hour (vaqtga bog'liq)
  - Stackable rules config
  - Promotion analytics: qancha ishlatildi, qancha tejaldi
- **Kutilgan:** Aksiya/chegirma tizimi ishlaydi

---

### ═══════════════════════════════════════
### 📱 MOBILE APP (Owner uchun)
### ═══════════════════════════════════════

---

## T-103 | P1 | [BACKEND] | Push notifications — Firebase + notification service
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/notifications/`
- **Vazifa:**
  - Firebase Cloud Messaging integration
  - Notification types: sale_completed, shift_changed, error_alert, low_stock, expiry_warning, large_refund, nasiya_overdue
  - Per-user notification preferences
  - `notifications` jadvali: id, user_id, type, title, body, data, is_read, created_at
  - GET /notifications — user ning notifications
  - PATCH /notifications/:id/read
- **Kutilgan:** Mobile va web da push notification ishlaydi

---

### ═══════════════════════════════════════
### 🔌 3RD PARTY INTEGRATIONS
### ═══════════════════════════════════════

---

## T-104 | P1 | [BACKEND] | Telegram bot — Owner alert va commands
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/bot/`
- **Vazifa:**
  - grammY framework setup
  - Commands: `/sales` (bugungi savdo), `/stock <barcode>` (stock check), `/debt <phone>` (qarz check), `/shift` (smena status), `/report` (kunlik hisobot)
  - Auto-alerts: low stock, expiry, large refund, system error, shift close report
  - Multi-tenant: bot tenant ga bog'lanadi (setup via web panel)
  - Message templates: O'zbek tilida
- **Kutilgan:** Do'kon egasi Telegram dan barcha ma'lumotni oladi

---

## T-105 | P1 | [BACKEND] | CBU exchange rate — Kunlik USD/UZS kurs
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/currency/`
- **Vazifa:**
  - Daily cron: https://cbu.uz/oz/arkhiv-kursov-valyut/json/ dan kurs olish
  - `exchange_rates` jadvali: date, currency_pair, rate, source
  - Fallback: API fail → oxirgi cached kurs ishlatiladi
  - GET /exchange-rates/current — hozirgi kurs
  - Product cost convert: USD cost × today rate = UZS cost
- **Kutilgan:** Import kosmetika narxi avtomatik UZS ga convert

---


## T-107 | P2 | [BACKEND] | Payme/Click integration — Online to'lov
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/payments/providers/`
- **Vazifa:**
  - Payme API adapter: createTransaction, performTransaction, checkTransaction
  - Click API adapter: prepare, complete
  - Webhook handler: payment confirmation callback
  - POS da: QR code ko'rsatish → customer telefondan to'laydi
  - Subscription billing ham Payme/Click orqali
- **Kutilgan:** Online to'lov usullari ishlaydi

---

### ═══════════════════════════════════════
### 💰 SUBSCRIPTION & BILLING (SaaS Model)
### ═══════════════════════════════════════

---

## T-108 | P1 | [BACKEND] | Subscription plans — SaaS billing
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/billing/`
- **Vazifa:**
  - `subscription_plans` jadvali: id, name, price_monthly, max_branches, max_products, max_users, features (JSON)
  - `tenant_subscriptions` jadvali: id, tenant_id, plan_id, status (TRIAL/ACTIVE/PAST_DUE/CANCELLED), started_at, expires_at, trial_ends_at
  - Plans: Free trial (14 kun) → Basic (1 filial, 1000 product, 2 user) → Pro (5 filial, unlimited, 10 user) → Enterprise
  - Usage limit middleware: product/user/branch count check
  - Grace period: to'lov fail → 3 kun (read-only mode)
- **Kutilgan:** SaaS subscription tizimi ishlaydi

---

## T-109 | P2 | [FRONTEND] | Billing UI — Plan tanlash, to'lov
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/Settings/Billing/`
- **Vazifa:**
  - Current plan info, usage stats (products used / limit)
  - Plan comparison table
  - Upgrade/downgrade flow
  - Invoice history, PDF download
  - Payment method management
- **Kutilgan:** Tenant o'z subscriptionni boshqarsa bo'ladi

---

### ═══════════════════════════════════════
### 🔧 HARDWARE INTEGRATION
### ═══════════════════════════════════════

---

## T-110 | P0 | [FRONTEND] | Thermal printer — ESC/POS integration
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/print/` (MVP: browser print, Tauri: native ESC/POS)
- **Vazifa:**
  - MVP: window.print() bilan 80mm template
  - Tauri: ESC/POS binary commands, USB va network printer
  - Auto-print on sale complete (setting)
  - Test print button
  - Common printers: Epson TM-T20, XPrinter XP-80, RONGTA RP80
- **Kutilgan:** Thermal printer dan chek chiqadi

---

---

## T-112 | P2 | [FRONTEND] | Label printer — Narx etiketka
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/print/`
- **Vazifa:**
  - Product label: name, barcode, price, expiry
  - Label sizes: 30x20mm, 40x30mm, 58x40mm
  - Batch print: selected products uchun
  - Printers: Zebra, TSC, XPrinter label
- **Kutilgan:** Narx etikekasi chop etsa bo'ladi

---

### ═══════════════════════════════════════
### 🏪 MULTI-BRANCH (Filiallar)
### ═══════════════════════════════════════

---

## T-113 | P1 | [BACKEND] | Branch management — Full CRUD + permissions
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/`
- **Vazifa:**
  - Branch CRUD: GET/POST/PATCH/DELETE /branches
  - User-branch assignment: user faqat belgilangan branch(lar) ga access
  - Branch-level data isolation: orders, stock, shifts — branch_id filter
  - Default branch per user
- **Kutilgan:** Filiallar tizimi ishlaydi

---

## T-114 | P1 | [BACKEND] | Inter-branch stock transfer
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/inventory/`
- **Vazifa:**
  - `stock_transfers` jadvali: id, tenant_id, from_branch, to_branch, status (REQUESTED/APPROVED/SHIPPED/RECEIVED/CANCELLED), items, requested_by, approved_by, notes, created_at
  - Workflow: Request → Approve → Ship → Receive
  - Stock: OUT from source, IN to destination
  - In-transit stock tracking
- **Kutilgan:** Filiallar orasida tovar ko'chirsa bo'ladi

---

---

### ═══════════════════════════════════════
### P3 — KELAJAK (6+ oy)
### ═══════════════════════════════════════

---

## T-116 | P3 | [BACKEND] | Customer loyalty — Points + tiers
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Earn points (1 point/1000 UZS). Tiers: Bronze/Silver/Gold. Birthday bonus. Redeem as payment.

## T-117 | P3 | [FRONTEND] | Customer display — 2-ekran (ikkinchi monitor)
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** POS da ikkinchi ekran: scan qilingan tovar, running total, reklama. VFD yoki monitor.

## T-118 | P3 | [BACKEND] | 1C export — Buxgalteriya integratsiya
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Savdo/xarid datalarini 1C-compatible formatda export (XML). O'zbekistonda ko'p buxgalterlar 1C ishlatadi.

## T-119 | P3 | [BACKEND] | Marketplace sync — Uzum/Sello
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Online sotish: catalog sync, stock sync, order import. Omnichannel.

## T-120 | P3 | [BACKEND] | AI forecasting — Seasonal demand prediction
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Kosmetika seasonal: sunscreen (yoz), moisturizer (qish), gift sets (8-Mart, Yangi yil). O'tgan yil datasi bo'yicha buyurtma tavsiya.

## T-121 | P3 | [BACKEND] | Google Sheets export — Automated daily data
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Scheduled: kunlik savdo data → linked Google Sheet. Ko'p do'kon egalari Sheets da tahlil qiladi.

## T-122 | P3 | [FRONTEND] | Custom report builder — Ad-hoc hisobotlar
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Dimension (product, category, date, branch, cashier) + metrics (revenue, qty, margin) tanlash → custom report. Excel export.

## T-123 | P3 | [FRONTEND] | Weight scale integration — Gramm bilan sotish
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** USB/Serial tarozi → og'irlik o'qish → narx hisoblash. Kamdan-kam kosmetika uchun (aralash do'konlar).

## T-124 | P3 | [IKKALASI] | Feature flags — Per-tenant feature toggle
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** `feature_flags` jadvali. Admin paneldan enable/disable: loyalty, multi-branch, fiscal, promotions. Gradual rollout.

---

# ════════════════════════════════════════════════════════════════
# TOPILGAN KAMCHILIKLAR — Developer Tooling & DX (T-125+)
# ════════════════════════════════════════════════════════════════

---

### ═══════════════════════════════════════
### 🛠️ DEVELOPER TOOLING & INFRATUZILMA
### ═══════════════════════════════════════

---

## T-125 | P0 | [BACKEND] | Swagger/OpenAPI documentation — API docs setup
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/main.ts`, `apps/api/src/**/*.dto.ts`
- **Vazifa:**
  - `@nestjs/swagger` — SwaggerModule.setup('/api/docs')
  - Barcha DTO larga `@ApiProperty()` decorator
  - Controller larga `@ApiTags()`, `@ApiBearerAuth()`, `@ApiOperation()`, `@ApiResponse()`
  - Swagger JSON export: `/api/docs-json` (frontend client generate uchun)
  - Grouping: Identity, Catalog, Sales, Inventory, Payments, Reports, Admin
  - Auth: Swagger UI da Bearer token kiritish imkoniyati
- **Kutilgan:** `/api/docs` da to'liq interaktiv API dokumentatsiya

---

## T-126 | P0 | [BACKEND] | Test infrastructure — Jest setup + first tests
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `apps/api/jest.config.ts`, `apps/api/src/**/*.spec.ts`
- **Vazifa:**
  - Jest config: `apps/api/jest.config.ts` (ts-jest, moduleNameMapper, coverage)
  - Test DB: `DATABASE_URL_TEST` in .env, test Prisma client
  - Unit test namuna: `identity.service.spec.ts` — register, login, refresh token
  - Integration test namuna: `auth.controller.spec.ts` — POST /auth/login, POST /auth/register
  - Test utilities: `createTestApp()`, `createTestUser()`, `getAuthToken()`
  - Coverage threshold: 50% minimum (boshlang'ich)
  - `pnpm --filter api test` script
- **Kutilgan:** Test infra tayyor, namuna testlar ishlaydi, CI da run bo'ladi

---

## T-127 | P1 | [BACKEND] | Database seed data — Development uchun test data
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `apps/api/prisma/seed.ts`
- **Vazifa:**
  - `prisma db seed` — development uchun sample data yaratish
  - Seed data:
    - 1 tenant (Kosmetika do'koni "Gul Kosmetika")
    - 1 owner user (admin@test.com / password123)
    - 1 cashier user (cashier@test.com / password123)
    - 1 branch (default)
    - 10 categories (Terini parvarish, Soch, Makiyaj, Atir, Tirnoq, ...)
    - 5 units (dona, quti, set, ml, gram)
    - 30+ products (har kategoriyadan, barcode, narx, min_stock bilan)
    - 5 customers (telefon, nasiya bilan)
  - Idempotent: qayta run qilsa xato bermaydi
  - package.json: `"prisma": { "seed": "ts-node prisma/seed.ts" }`
- **Kutilgan:** `pnpm --filter api db:seed` bilan tayyor test muhit

---

## T-128 | P0 | [DEVOPS] | .gitignore yangilash — Keraksiz fayllarni ignore
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `.gitignore`
- **Vazifa:**
  - `tsconfig.tsbuildinfo` — barcha apps da
  - `.claude/settings.local.json` — local Claude config
  - `logs/` — runtime log fayllar
  - `.env.local`, `.env.staging`, `.env.production`
  - `*.tsbuildinfo`
  - `apps/api/dist/`
  - `apps/web/.next/`
- **Kutilgan:** Git status da keraksiz fayllar ko'rinmaydi

---

### ═══════════════════════════════════════
### 📁 FAYL YUKLASH & MEDIA
### ═══════════════════════════════════════

---

## T-129 | P1 | [BACKEND] | File upload service — MinIO S3 integration
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/upload/`
- **Vazifa:**
  - `UploadModule`, `UploadService`
  - MinIO client: `@aws-sdk/client-s3`
  - POST /upload — single file upload (image: jpeg/png/webp, max 5MB)
  - POST /upload/bulk — multiple files (max 10)
  - Buckets: `product-images`, `receipts`, `certificates`, `exports`
  - Auto-resize: thumbnail (200px), medium (800px), original
  - Presigned URL: GET /upload/:key — vaqtinchalik download link
  - Mimetype + size validation, tenant_id folder isolation
- **Kutilgan:** Product image va fayllarni yuklash ishlaydi

---

## T-130 | P1 | [BACKEND] | Product bulk import/export — CSV/Excel
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/catalog/import/`
- **Vazifa:**
  - POST /products/import — CSV/XLSX fayldan bulk import
  - Template: GET /products/import/template — bo'sh Excel template yuklab olish
  - Import flow: upload → validate → preview (errors ko'rsatish) → confirm → save
  - Validation: barcode uniqueness, category exists, price > 0, required fields
  - Duplicate handling: barcode mavjud → update yoki skip (user tanlaydi)
  - GET /products/export — barcha productlarni Excel ga chiqarish
  - BullMQ: 500+ row → async job, tayyor bo'lganda notification
- **Kutilgan:** Do'kon ochishda 500-1000 ta productni tezkor kiritsa bo'ladi

---

## T-131 | P1 | [BACKEND] | Barcode generation — Barcodesiz product uchun
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/catalog/`
- **Vazifa:**
  - Barcode format: EAN-13 (internal), prefix: tenant-specific (e.g. 200XXXXX)
  - Auto-generate: product yaratishda barcode yo'q bo'lsa → internal barcode yaratish
  - GET /products/:id/barcode — barcode image (SVG/PNG) generate qilish
  - Batch barcode generate: POST /products/generate-barcodes — tanlangan products uchun
  - `bwip-js` library
- **Kutilgan:** Barcodesiz productlarga ham barcode berib, etiketka chop etsa bo'ladi

---

### ═══════════════════════════════════════
### ⚙️ TENANT KONFIGURATSIYA
### ═══════════════════════════════════════

---

## T-132 | P1 | [BACKEND] | Tenant settings — Configurable per-tenant sozlamalar
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/settings/`
- **Vazifa:**
  - `tenant_settings` jadvali: id, tenant_id, key, value (JSON), updated_at
  - Settings:
    - `currency` — UZS (default), USD
    - `tax_rate` — 12 (default QQS)
    - `tax_inclusive` — true/false (narxga QQS kirganmi)
    - `receipt_header` — do'kon nomi, manzil, INN, telefon
    - `receipt_footer` — "Xaridingiz uchun rahmat!"
    - `logo_url` — receipt va admin panel uchun
    - `shift_required` — savdo qilish uchun shift ochish shartmi
    - `debt_limit_default` — yangi customer uchun default nasiya limit
    - `rounding` — 100 yoki 1000 ga yaxlitlash
    - `low_stock_threshold` — default min_stock_level
  - GET /settings — tenant sozlamalari
  - PATCH /settings — yangilash (faqat ADMIN/OWNER)
  - Default values: birinchi marta o'qilganda avtomatik yaratiladi
- **Kutilgan:** Har do'kon o'zi uchun sozlama qilsa bo'ladi

---

## T-133 | P1 | [BACKEND] | Price history — Narx o'zgarishi tarixi
- **Sana:** 2026-02-28
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/catalog/`
- **Vazifa:**
  - `price_changes` jadvali: id, tenant_id, product_id, old_cost_price, new_cost_price, old_sell_price, new_sell_price, changed_by (user_id), reason, created_at
  - Product update qilinganda narx o'zgargan bo'lsa → avtomatik log
  - GET /products/:id/price-history — narx o'zgarish tarixi
  - Margin tahlili: cost va sell price trend chart uchun data
  - ⚠️ Immutable — price_changes UPDATE/DELETE TAQIQLANGAN
- **Kutilgan:** Narx o'zgarishi izlanadi, margin trend ko'rinadi

---

### ═══════════════════════════════════════
### 🖥️ FRONTEND INFRATUZILMA
### ═══════════════════════════════════════

---

## T-134 | P0 | [FRONTEND] | App Shell — Base layout (sidebar, navigation, header)
- **Sana:** 2026-02-28
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/components/Layout/`
- **Vazifa:**
  - **Sidebar:** Logo, navigation links, collapse/expand
    - Dashboard, Catalog (Products, Categories), Sales (POS, Orders, Returns), Inventory (Stock, Kirim, Chiqim, Expiry), Customers (List, Debts), Reports, Settings (Users, Audit, Billing)
  - **Header:** Branch selector, user avatar + dropdown (profile, logout), notifications bell
  - **Auth layout:** Login page uchun alohida layout (sidebar yo'q)
  - **POS layout:** POS mode uchun minimal layout (full screen, sidebar yo'q)
  - **Responsive:** mobile collapsed sidebar, desktop fixed sidebar
  - **Active route highlighting**, breadcrumbs
  - Tailwind + shadcn/ui component library
- **Kutilgan:** Admin panel navigatsiya va layout tayyor, sahifalar qo'shsa bo'ladi

---

## T-135 | P0 | [FRONTEND] | Login/Auth pages — Login, register-tenant, forgot password
- **Sana:** 2026-02-28
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/app/(auth)/`
- **Vazifa:**
  - **Login page:** tenant slug + username/phone + password
  - **Register tenant page:** do'kon nomi, INN, owner name, phone, password (POST /auth/register-tenant)
  - **Forgot password:** phone orqali reset (keyinroq SMS OTP bilan)
  - JWT token saqlash: access token → memory, refresh token → httpOnly cookie
  - Auto-redirect: login → dashboard, unauthenticated → login
  - Form validation: zod + react-hook-form
  - Loading states, error messages (noto'g'ri parol, user topilmadi, account locked)
  - "Parolni ko'rsatish" toggle
- **Kutilgan:** Login ishlaydi, token boshqaruvi tayyor

---

## T-136 | P0 | [FRONTEND] | API client setup — Axios interceptors + React Query
- **Sana:** 2026-02-28
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/lib/`
- **Vazifa:**
  - Axios instance: baseURL, default headers, timeout
  - **Request interceptor:** Authorization: Bearer token qo'shish
  - **Response interceptor:**
    - 401 → refresh token bilan yangilash, qayta so'rov
    - 403 → "Ruxsat yo'q" toast
    - 5xx → "Server xatosi" toast + client error log yuborish
    - Network error → "Internet aloqasi yo'q" banner
  - React Query provider: defaultOptions (staleTime, retry, refetchOnWindowFocus)
  - Query key factory: `queryKeys.products.list(filters)`, `queryKeys.orders.detail(id)`
  - Typed API functions: `api.products.getAll()`, `api.orders.create(data)`, etc.
- **Kutilgan:** Frontend dan API ga xavfsiz va standart tarzda so'rov yuboriladi

---

## T-137 | P2 | [FRONTEND] | i18n/Localization — O'zbek, Rus, English tillar
- **Sana:** 2026-02-28
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/i18n/`
- **Vazifa:**
  - `next-intl` yoki `i18next` library
  - 3 til: O'zbek (default), Русский, English
  - Tarjima fayllari: `locales/uz.json`, `locales/ru.json`, `locales/en.json`
  - Til almashtirish: header da dropdown
  - Sana/vaqt formatlash: locale-aware (O'zbek: KK.OO.YYYY)
  - Narx formatlash: `1 234 567 so'm` (UZS), `$1,234.56` (USD)
  - UI elementlar: barcha button, label, placeholder, error message
- **Kutilgan:** Admin panel 3 tilda ishlaydi, foydalanuvchi tanlaydi

---

## T-138 | P1 | [BACKEND] | Stock levels — Snapshot dan keyin qo'shilgan mahsulotlar ko'rinmaydi

- **Sana:** 2026-03-08
- **Mas'ul:** Polat / Bekzod
- **Fayl:** `apps/api/src/inventory/inventory.service.ts` → `getStockLevels()`
- **Muammo:** `getStockLevels()` snapshot mavjud bo'lsa `stock_snapshots` + delta yondashuvi ishlatadi. Ammo snapshot DAN KEYIN qo'shilgan yangi mahsulotlar faqat `stock_movements`da bo'ladi, `stock_snapshots`da yo'q. Natijada LEFT JOIN orqali ular ko'rinmaydi.
- **Kutilgan:** Snapshot'dan keyingi yangi mahsulotlar ham `GET /api/v1/inventory/levels`da ko'rinishi kerak.
- **Taklif:** SQL'ga UNION ALL qo'shing — snapshot'da bo'lmagan, lekin `stock_movements`da (snapshot vaqtidan keyin) bo'lgan mahsulotlarni ham qo'shsin.
- **Workaround (hozircha):** `stock_snapshots` jadvali bo'sh bo'lsa, full aggregate mode ishlaydi va barcha mahsulotlar ko'rinadi.

---

## T-139 | P1 | [IKKALASI] | ibrat/feat-mobile-app → main merge va Railway deploy

- **Sana:** 2026-03-09
- **Mas'ul:** Polat (merge review) + Ibrat (mobile test after deploy)
- **Muammo:** Mobile-specific backend routes faqat `ibrat/feat-mobile-app` branchida, `main`da yo'q → Railway da 404:
  - `GET /inventory/stock` — mobile alias (safeQueryFn bilan 404 ushlanadi)
  - `GET /inventory/stock/low` — mobile alias
  - `GET /sales/quick-stats` — dashboard uchun kritik
  - `GET /sales/shifts/active` — dashboard uchun kritik
  - `GET /analytics/revenue` + `/branches/comparison` + `/insights` — analytics controller yo'q
- **Kutilgan:** PR yaratib `main`ga merge qilish → Railway auto-deploy → mobile app real data ko'radi
- **Eslatma:** Mobile app hozircha 404 larni `safeQueryFn` bilan ushlab, empty state ko'rsatadi (crash yo'q)

---

## T-140 | P1 | [BACKEND] | Real estate controller — routes bo'sh

- **Sana:** 2026-03-09
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/realestate/realestate.controller.ts`
- **Muammo:** Controller `@Controller('real-estate')` deklaratsiya qilingan lekin HECH QANDAY route yo'q. Mobile app `/real-estate/properties`, `/real-estate/stats`, `/real-estate/payments` ga murojaat qiladi — hammasi 404. `safeQueryFn` ushlab turadi.
- **Kutilgan:** `getProperties()`, `getStats()`, `getRentalPayments()`, `getAllPayments()` endpointlari qo'shilsin

---

## 📊 STATISTIKA

| Umumiy | P0 | P1 | P2 | P3 |
|--------|----|----|----|----|
| **127** | **34** | **58** | **15** | **20** |

### MVP (T-011 — T-049): 39 task
### Production Features (T-050 — T-124): 75 task
### Topilgan kamchiliklar (T-125 — T-137): 13 task

---

### Kategoriya bo'yicha

| Kategoriya | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| [BACKEND] | 20 | 38 | 8 | 7 | **73** |
| [FRONTEND] | 10 | 11 | 4 | 4 | **29** |
| [MOBILE] | — | 3 | 1 | — | **4** |
| [DEVOPS] | 3 | 2 | — | — | **5** |
| [IKKALASI] | 3 | 3 | — | 2 | **8** |
| [SECURITY] | — | — | — | — | **(guards ichida)** |

---

### Mas'uliyat taqsimoti

| Dasturchi | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| **Polat** (Backend & DevOps) | 21 | 39 | 7 | — | **67** |
| **AbdulazizYormatov** (Frontend) | 12 | 9 | 4 | — | **25** |
| **Ibrat + Abdulaziz** (Mobile) | — | 3 | 1 | — | **4** |
| **Birgalikda** | 3 | 3 | — | — | **6** |
| **Belgilanmagan** | — | — | 3 | 20 | **23** |

---

### ⚠️ TOPILGAN KRITIK KAMCHILIKLAR

```
1. NASIYA YO'Q EDI — O'zbekiston bozoridagi eng muhim funksiya (T-050—T-054)
2. CUSTOMER CRM YO'Q — nasiya va loyalty uchun zarur (T-050)
3. OFFLINE SYNC BO'SH — packages/sync-engine hozir export {} (T-062—T-066)
4. FRONTEND 0% — faqat default Next.js sahifa mavjud
5. DOCKER CONFIGS YO'Q — docker/ papka bo'sh (.gitkeep)
6. UZS YAXLITLASH YO'Q — real hayotda tiyin yo'q (T-080)
7. VALYUTA SUPPORT YO'Q — import kosmetika USD da narxlanadi (T-082)
8. SAAS OWNER PANEL YO'Q — founder monitoring (T-055—T-061)
```

---

### 🏆 TAVSIYA ETILGAN SPRINT TARTIBI

```
Sprint 1 (Hafta 1-2):  Prisma schema HAMMA jadvali + Catalog + Customer + Nasiya
Sprint 2 (Hafta 2-3):  Sales + Shifts + Payments — asosiy savdo loop
Sprint 3 (Hafta 3-4):  Inventory + Nasiya payments + Ledger — pul oqimi
Sprint 4 (Hafta 4-5):  Frontend POS + Receipt + Shift UI — minimal UI
Sprint 5 (Hafta 5-6):  Offline sync + IndexedDB + Outbox — real do'konga deploy
Sprint 6 (Hafta 6-7):  Reports + Audit + Expiry + Security — ishonchlilik
Sprint 7 (Hafta 7-8):  SaaS Dashboard + Subscription + Monitoring + Deploy
Sprint 8 (Hafta 8+):   Mobile app + Telegram bot + Analytics + Polish
```

---

---

### ═══════════════════════════════════════
### 🔍 FRONTEND QA & DEPLOY (Ibrat — 2026-03-09)
### ═══════════════════════════════════════

---

## T-141 | P1 | [FRONTEND] | Web — Backend↔Frontend API contract tekshiruvi

- **Sana:** 2026-03-09
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/src/api/`
- **Muammo:** Frontend endpoint URL lari backend controller lari bilan mos kelmasligi mumkin
- **Vazifa:** Backend controller larini o'qib, frontend API call larini solishtirish. Nomuvofiqliklarni frontendda tuzatish.
- **Kutilgan:** Barcha API call lar to'g'ri endpoint larga yo'naltirilgan

---

## T-142 | P1 | [FRONTEND] | Web — Playwright bilan localhost da to'liq UI test

- **Sana:** 2026-03-09
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/src/`
- **Muammo:** UI xatolari production ga chiqishi mumkin
- **Vazifa:** `pnpm --filter web dev` ishga tushirib, Playwright bilan login, dashboard, asosiy sahifalarni test qilish. Topilgan xatolarni tuzatish.
- **Kutilgan:** Barcha asosiy sahifalar xatosiz ishlaydi

---

## T-143 | P0 | [FRONTEND] | Web — Production deploy va 200 OK tekshiruvi

- **Sana:** 2026-03-09
- **Mas'ul:** Ibrat
- **Fayl:** `apps/web/`
- **Muammo:** Deploy muvaffaqiyatli bo'lishi va `https://web-production-5b0b7.up.railway.app` 200 qaytarishi kerak
- **Vazifa:** Build → Push → Railway deploy → curl tekshiruvi
- **Kutilgan:** HTTP 200, app ishlaydi

---

---

### ═══════════════════════════════════════
### 🔧 OWNER MOBILE — Employee Management Backend (Ibrat — 2026-03-14)
### ═══════════════════════════════════════

---

## T-144 | P1 | [BACKEND] | Employee full CRUD endpointlari (Owner Mobile uchun)

- **Sana:** 2026-03-14
- **Mas'ul:** Polat (Backend)
- **Fayl:** `apps/api/src/employees/employees.controller.ts`
- **Muammo:** Owner mobile app uchun xodimlarni boshqarish API yo'q
- **Kerakli endpointlar:**
  ```
  GET    /employees                        → Employee[]  (branch_id filter)
  GET    /employees/:id                    → Employee (full bio profile)
  POST   /employees                        → create employee + login + password
  PATCH  /employees/:id/status             → { status: 'active'|'inactive'|'fired' }
  PATCH  /employees/:id/pos-access         → { hasPosAccess: boolean }
  DELETE /employees/:id                    → delete employee permanently
  GET    /employees/:id/performance        → EmployeePerformance (exists — verify)
  GET    /employees/:id/suspicious-activity → SuspiciousActivityAlert[]
  ```
- **Employee model yangi fieldlar:**
  ```
  firstName, lastName, fullName, phone, email
  dateOfBirth, passportId, address, hireDate
  role: 'cashier'|'manager'|'admin'
  status: 'active'|'inactive'|'fired'
  login (unique), passwordHash
  hasPosAccess, hasAdminAccess, hasReportsAccess (boolean)
  emergencyContactName, emergencyContactPhone
  photoUrl (nullable)
  ```
- **Kutilgan:** Owner `/employees` CRUD orqali xodim qo'sha, statusini o'zgartira, o'chira oladi

---

## T-145 | P1 | [BACKEND] | Login orqali auth — Employee va Admin uchun

- **Sana:** 2026-03-14
- **Mas'ul:** Polat (Backend)
- **Fayl:** `apps/api/src/auth/auth.service.ts`
- **Muammo:** Xodim yaratilganda login+password beriladi, lekin u bilan login qilib bo'lmaydi
- **Vazifa:**
  - `POST /auth/login` — `{ login, password }` qabul qilsin (email OR login)
  - JWT da `hasPosAccess`, `hasAdminAccess`, `role` fieldlari bo'lsin
  - POS mobile app login: login + password → JWT (hasPosAccess check)
  - Admin web login: email + password → JWT (hasAdminAccess check)
- **Kutilgan:** Kassir o'z login/paroli bilan POS ga kira oladi; admin o'z login/paroli bilan web ga kira oladi

---

## T-146 | P2 | [BACKEND] | Employee status o'zgarishida POS token ni invalidate qilish

- **Sana:** 2026-03-14
- **Mas'ul:** Polat (Backend)
- **Fayl:** `apps/api/src/auth/auth.service.ts`, `apps/api/src/employees/employees.service.ts`
- **Muammo:** Xodim "fired" yoki POS access olinganda, uning aktiv JWT tokenlar hali ishlaydi
- **Vazifa:**
  - `updateStatus(fired)` yoki `revokePosAccess` chaqirilganda → employee refresh token larni blacklist qilish
  - Redis ga token blacklist saqlash (yoki DB da `tokenVersion` field)
  - JWT middleware: tokenVersion tekshirish
- **Kutilgan:** Ishdan chiqarilgan kassir darhol POS ga kira olmaydi (token expired → force logout)

---

## T-226 | P1 | [IKKALASI] | Mobile-Owner ↔ Backend full integration — seed + path aliases

- **Sana:** 2026-03-15
- **Mas'ul:** Ibrat (Mobile)
- **Fayllar:**
  - `apps/api/src/ai/ai.controller.ts` — + `/analytics/orders`, `/analytics/branch-comparison`, `/analytics/revenue-by-branch`
  - `apps/api/src/ai/ai.service.ts` — + `getOrdersSummary`, `getBranchComparison`, `getRevenueByBranch`
  - `apps/api/src/sales/shifts.controller.ts` — YANGI: `/shifts/*` alias
  - `apps/api/src/nasiya/debts.controller.ts` — YANGI: `/debts/*` alias
  - `apps/api/src/nasiya/nasiya.service.ts` — + `getSummary`, `getAgingReport`, `getDebtCustomers`
  - `apps/api/src/notifications/alerts.controller.ts` — YANGI: `/alerts/*` alias
  - `apps/api/src/health/system.controller.ts` — YANGI: `/system/*` alias
  - `apps/api/prisma/seed.ts` — kengaytirilgan: 4 filial, 4 kassir, 10 product, 60+ order, 6 nasiya, 8 alert
  - `apps/api/prisma/schema.prisma` — + TelegramLinkToken, ProductCertificate, Promotion modellari
- **Holat:** ✅ Bajarildi — tsc clean, PR tayyor

---

## T-227 | P1 | [IKKALASI] | Integration test checklist — mobile-owner endpoints

- **Sana:** 2026-03-15
- **Mas'ul:** Ibrat (Mobile) + Bekzod (Test)
- **Vazifa:**
  - [ ] Login: `POST /auth/login` (owner@kosmetika.uz / Demo1234! / kosmetika-demo)
  - [ ] `GET /analytics/revenue` — today/week/month/year + trends
  - [ ] `GET /analytics/orders` — total, avgOrderValue, trend
  - [ ] `GET /analytics/branch-comparison` — 4 filial
  - [ ] `GET /analytics/revenue-by-branch` — 4 filial
  - [ ] `GET /analytics/sales-trend` — kunlik grafik
  - [ ] `GET /analytics/top-products` — top 10
  - [ ] `GET /shifts` — paginated list
  - [ ] `GET /shifts/summary` — total revenue, orders
  - [ ] `GET /shifts/active` — ochiq smenalar
  - [ ] `GET /shifts/:id` — smena detali
  - [ ] `GET /debts/summary` — totalDebt, overdueDebt
  - [ ] `GET /debts/aging-report` — buckets
  - [ ] `GET /debts/customers` — paginated
  - [ ] `GET /alerts` — paginated
  - [ ] `GET /alerts/unread-count`
  - [ ] `PATCH /alerts/:id/read`
  - [ ] `GET /system/health` — DB + Redis
  - [ ] `GET /system/sync-status` — filiallar
  - [ ] `GET /employees` — list
  - [ ] `GET /inventory/out-of-stock`
  - [ ] Seed data: `npx ts-node prisma/seed.ts`

---

## T-228 | P1 | [BACKEND] | Duplicate migrations — bot_settings conflict

- **Sana:** 2026-03-15
- **Mas'ul:** Polat (Backend)
- **Fayl:** `apps/api/prisma/migrations/`
- **Muammo:** Ikkita migration fayli bir xil ALTER TABLE bajaradi:
  - `20260310000001_add_bot_settings/migration.sql`
  - `20260313000001_add_bot_settings/migration.sql`
- **Xavf:** `prisma migrate deploy` birinchi marta ishlaganda `IF NOT EXISTS` tufayli muammo chiqmasligi mumkin, lekin `prisma migrate status` noto'g'ri ko'rinadi
- **Yechim:** Eski (20260310) ni o'chirib, 20260313 ni qoldirish. Yoki squash migration yaratish.

---

*docs/Tasks.md | RAOS Kosmetika POS — Full Production v2.1 | 2026-03-15*
=======
# RAOS — OCHIQ VAZIFALAR (Kosmetika POS MVP)
# Yangilangan: 2026-03-09
# Format: T-XXX | Prioritet | [KAT] | Sarlavha

---

## 📌 QOIDALAR

```
1. Har topilgan bug/task → shu faylga DARHOL yoziladi
2. Sessiya boshida shu faylni O'QIB, oxirgi T-raqamdan DAVOM ettiriladi
3. Takroriy task yaratmaslik — mavjudini yangilash
4. Fix bo'lgach → shu yerdan O'CHIRISH → docs/Done.md ga KO'CHIRISH
5. Prioritet: P0=kritik, P1=muhim, P2=o'rta, P3=past
6. Kategoriya: [BACKEND], [FRONTEND], [DEVOPS], [SECURITY], [IKKALASI]
```

---

## ✅ T-122 | P1 | [BACKEND] | Eskiz.uz SMS → Telegram + Email (BAJARILDI 2026-03-09)
> Eskiz.uz to'liq olib tashlandi. Telegram Bot API (bepul) + SMTP Email fallback.
> - `sms.service.ts` o'chirildi
> - `telegram-notify.service.ts`, `email-notify.service.ts`, `notify.service.ts` yaratildi
> - Schema: `users.telegram_chat_id`, `customers.telegram_chat_id`, `telegram_link_tokens` jadvali
> - Bot: `/start <token>` deep link qo'llab-quvvatlash
> - API: `POST /notifications/telegram/link-token`, `POST /notifications/telegram/verify`
> - `nodemailer` package qo'shildi; `.env.example` yangilandi

---

## 📅 REJA: 8 haftalik FULL PRODUCTION (Kosmetika do'koni)

| Hafta | Maqsad |
|-------|--------|
| **Week 1** | Catalog + Basic POS sale + Receipt print + Shift |
| **Week 2** | Inventory movements + Low stock + Simple reports |
| **Week 3** | Refund/return + Audit log + Roles/Permissions UI |
| **Week 4** | Expiry module + Expiry report + Staging deploy |
| **Week 5** | ⭐ NASIYA (qarz) + Customer CRM + Ledger integration |
| **Week 6** | ⭐ Offline architecture + Sync engine + Resilience |
| **Week 7** | ⭐ SaaS Owner Dashboard + Security hardening |
| **Week 8** | ⭐ Mobile app + Telegram bot + Performance + Deploy |

### ⚠️ KRITIK TOPILMA: NASIYA (qarz savdo) — MVP da YO'Q edi!
> O'zbekiston do'konlarining **60-70%** nasiyada sotadi. Bu funksiya bo'lmasa tizim ishlatilmaydi.
> T-050 — T-054 DARHOL Week 1-2 ga parallel qo'shilishi kerak!

---

## 🔴 P0 — KRITIK (MVP Day 1 uchun shart)

---

### ═══════════════════════════════════════
### WEEK 1 — Catalog + POS Sale + Shift
### ═══════════════════════════════════════

---

## T-011 | P0 | [BACKEND] | Catalog module — Prisma schema (products, categories, units, barcodes)
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/prisma/schema.prisma`
- **Vazifa:**
  - `categories` jadvali: id, tenant_id, name, parent_id (nested), sort_order, is_active, created_at, updated_at, deleted_at
  - `units` jadvali: id, tenant_id, name (dona, kg, litr, quti), short_name, created_at
  - `products` jadvali: id, tenant_id, category_id, name, sku, barcode (unique per tenant), cost_price, sell_price, unit_id, min_stock_level, is_active, image_url, description, expiry_tracking (boolean), created_at, updated_at, deleted_at
  - `product_barcodes` jadvali: id, product_id, barcode, is_primary, created_at (bir product da bir nechta barcode)
  - Indexes: tenant_id, [tenant_id, barcode], [tenant_id, sku], [tenant_id, category_id]
  - `npx prisma migrate dev --name add-catalog-tables`
- **Kutilgan:** Catalog jadvallari DB da tayyor, Prisma client generate bo'lgan

---

## T-012 | P0 | [BACKEND] | Catalog module — CRUD service + controller
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/catalog/`
- **Vazifa:**
  - `CatalogModule`, `CatalogService`, `CatalogController`
  - **Products CRUD:** GET /products (list, filter, search, paginate), GET /products/:id, POST /products, PATCH /products/:id, DELETE /products/:id (soft delete)
  - **Categories CRUD:** GET /categories (tree), POST /categories, PATCH /categories/:id, DELETE /categories/:id
  - **Units CRUD:** GET /units, POST /units
  - **Barcode:** GET /products/barcode/:code — tezkor barcode scan uchun
  - Barcha query da `tenant_id` filter MAJBURIY
  - DTOs: CreateProductDto, UpdateProductDto, CreateCategoryDto, ProductFilterDto (search, category, min/max price, is_active)
  - Pagination: page, limit, sort, order
- **Kutilgan:** API endpointlar ishlaydi, Postman dan test qilsa bo'ladi

---

## T-013 | P0 | [BACKEND] | Sales module — Prisma schema (orders, order_items, shifts)
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/prisma/schema.prisma`
- **Vazifa:**
  - `shifts` jadvali: id, tenant_id, user_id, branch_id, opened_at, closed_at, opening_cash, closing_cash, expected_cash, notes, status (OPEN/CLOSED)
  - `orders` jadvali: id, tenant_id, shift_id, user_id (cashier), branch_id, order_number (auto-increment per tenant), status (COMPLETED/RETURNED/VOIDED), subtotal, discount_amount, discount_type (PERCENT/FIXED), tax_amount, total, notes, fiscal_status (NONE/PENDING/SENT/FAILED), fiscal_id, fiscal_qr, created_at
  - `order_items` jadvali: id, order_id, product_id, product_name (snapshot), quantity, unit_price (snapshot), discount_amount, total, cost_price (snapshot, margin uchun)
  - ⚠️ `orders` va `order_items` — immutable. Return uchun alohida `returns` jadvali
  - `returns` jadvali: id, tenant_id, order_id, user_id, reason, total, status (PENDING/APPROVED), approved_by, created_at
  - `return_items` jadvali: id, return_id, order_item_id, product_id, quantity, amount
  - Indexes: [tenant_id, order_number], [tenant_id, shift_id], [tenant_id, created_at]
- **Kutilgan:** Sales jadvallari DB da tayyor

---

## T-014 | P0 | [BACKEND] | Sales module — Order creation service + shift management
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/sales/`
- **Vazifa:**
  - `SalesModule`, `SalesService`, `SalesController`
  - **Shift:** POST /shifts/open, POST /shifts/close, GET /shifts/current, GET /shifts/:id/report
  - **Orders:** POST /orders (create sale), GET /orders (list, filter by date/shift/status), GET /orders/:id
  - Order yaratishda:
    1. Shift OPEN ekanini tekshir
    2. Product narxlarini DB dan ol (snapshot sifatida saqla)
    3. Discount hisoblash
    4. Order + items yaratish (transaction ichida)
    5. Domain event: `sale.created` emit qilish → inventory deduction, ledger entry
  - Order number: auto-increment per tenant (YYYYMMDD-XXXX format)
  - Smena yopishda: jami savdo, cash, card summary hisoblash
- **Kutilgan:** Savdo qilish va smena boshqarish API tayyor

---

## T-015 | P0 | [BACKEND] | Payments module — Cash + Terminal (card) payment
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/payments/`
- **Vazifa:**
  - `PaymentsModule`, `PaymentsService`, `PaymentsController`
  - Prisma schema: `payment_intents` jadvali: id, tenant_id, order_id, method (CASH/CARD/CLICK/PAYME), amount, status (CREATED/CONFIRMED/SETTLED/FAILED/REVERSED), reference, created_at
  - POST /payments (create payment intent for order)
  - Split payment: bitta order uchun bir nechta payment (cash+card)
  - MVP da faqat CASH va CARD (terminal) — Click/Payme keyinroq
  - Payment yaratishda → `payment.confirmed` event emit
  - PaymentProviderFactory — plugin pattern (CLAUDE_BACKEND.md dagi kabi)
- **Kutilgan:** Cash va card to'lov qilsa bo'ladi, split payment ishlaydi

---

## T-016 | P0 | [FRONTEND] | Admin Panel — Catalog UI (Products CRUD + Categories)
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/Catalog/`
- **Vazifa:**
  - Products list sahifasi: DataTable (sortable, filterable, paginated)
  - Product qo'shish/tahrirlash form: name, barcode, sku, category, cost_price, sell_price, unit, min_stock, image
  - Categories tree view + CRUD
  - Barcode search (text input, barcode scanner ready)
  - React Query hooks: useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct
  - Zod validation: productSchema, categorySchema
  - Loading skeletons, error handling, toast notifications
- **Kutilgan:** Admin paneldan mahsulot va kategoriyalarni boshqarsa bo'ladi

---

## T-017 | P0 | [FRONTEND] | POS Sale Screen — Cart + Barcode + Payment
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/POS/` (MVP da web-based POS, Tauri keyinroq)
- **Vazifa:**
  - **Layout:** Chap — product search/list + cart | O'ng — total, discount, payment
  - **Barcode scan:** input field, barcode scanner (keyboard wedge) support
  - **Cart:** product qo'shish, quantity +/-, item o'chirish, line discount
  - **Discount:** butun orderga discount (% yoki fixed)
  - **Payment panel:** Cash / Card tanlash, summa kiritish, qaytim hisoblash
  - **Split payment:** Cash + Card kombinatsiya
  - **Keyboard shortcuts:** F1=search, F5=cash, F6=card, F10=complete, Esc=cancel
  - **Receipt preview:** sotuvdan keyin chek ko'rinishi
  - Shift status bar (yuqorida): cashier nomi, shift vaqti, savdolar soni
- **Kutilgan:** Tez, keyboard-first POS sale qilsa bo'ladi

---

## T-018 | P0 | [FRONTEND] | Shift management UI — Open/Close shift
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/POS/Shift/`
- **Vazifa:**
  - Shift ochish: opening cash summasini kiritish
  - Shift yopish: closing cash, expected vs actual, notes
  - Shift report: savdolar soni, jami summa, cash/card breakdown
  - POS ekranga kirish uchun shift OPEN bo'lishi shart
- **Kutilgan:** Cashier shift ochib-yopib ishlasa bo'ladi

---

## T-019 | P0 | [BACKEND] | Receipt printing — ESC/POS format endpoint
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/sales/receipt/`
- **Vazifa:**
  - GET /orders/:id/receipt — chek ma'lumotlarini qaytarish (structured JSON)
  - Receipt data: do'kon nomi, manzil, cashier, sana/vaqt, items (name, qty, price), subtotal, discount, tax, total, payment method, fiscal_status
  - Keyinroq ESC/POS binary format ham (Tauri POS uchun)
  - MVP da: HTML receipt template (browser print)
- **Kutilgan:** Chek print qilsa bo'ladi (browser print)

---

## T-020 | P0 | [FRONTEND] | Receipt print UI — Browser print + template
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/components/Receipt/`
- **Vazifa:**
  - Receipt HTML template (80mm thermal printer o'lchamida)
  - Do'kon nomi, manzil, INN, sana/vaqt
  - Items table: nomi, qty, narx, summa
  - Subtotal, discount, tax, TOTAL
  - Payment method, qaytim
  - Fiscal status (PENDING placeholder)
  - window.print() orqali chop etish
  - Auto-print option (sale complete dan keyin)
- **Kutilgan:** Thermal printer dan chek chiqadi

---

### ═══════════════════════════════════════
### WEEK 2 — Inventory + Low Stock + Reports
### ═══════════════════════════════════════

---

## T-021 | P0 | [BACKEND] | Inventory module — Prisma schema (stock_movements, warehouses)
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/prisma/schema.prisma`
- **Vazifa:**
  - `warehouses` jadvali: id, tenant_id, name, address, is_default, is_active, created_at
  - `stock_movements` jadvali: id, tenant_id, product_id, warehouse_id, type (IN/OUT/ADJUSTMENT/RETURN/TRANSFER), quantity (always positive, sign = type), reference_type (PURCHASE/SALE/MANUAL/DAMAGE/RETURN), reference_id, batch_number, expiry_date, cost_price, notes, user_id, created_at
  - ⚠️ stock_movements — IMMUTABLE (updated_at yo'q, delete yo'q)
  - Current stock = SUM of movements (IN = +, OUT = -)
  - `stock_snapshots` jadvali (optional, performance uchun): id, tenant_id, product_id, warehouse_id, quantity, calculated_at
  - Indexes: [tenant_id, product_id, warehouse_id], [tenant_id, created_at]
- **Kutilgan:** Inventory jadvallari DB da tayyor

---

## T-022 | P0 | [BACKEND] | Inventory module — Stock movement service + kirim/chiqim
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/inventory/`
- **Vazifa:**
  - `InventoryModule`, `InventoryService`, `InventoryController`
  - **Stock In (Kirim/Nakladnoy):** POST /inventory/stock-in — supplier dan tovar qabul qilish (items array: product_id, quantity, cost_price, batch_number, expiry_date)
  - **Stock Out (Chiqim):** POST /inventory/stock-out — zarar/yo'qotish (items + reason)
  - **Current Stock:** GET /inventory/stock — product lar ro'yxati + current quantity
  - **Stock by Product:** GET /inventory/stock/:productId — movement history
  - **Low Stock Alert:** GET /inventory/low-stock — min_stock_level dan past bo'lganlar
  - `sale.created` event listener → automatic stock deduction
  - Stock valuation: average cost method (MVP)
- **Kutilgan:** Kirim, chiqim, avtomatik savdo deduction ishlaydi

---

## T-023 | P0 | [FRONTEND] | Inventory UI — Stock levels + Kirim (nakladnoy)
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/Inventory/`
- **Vazifa:**
  - **Stock levels page:** DataTable — product nomi, barcode, current qty, min level, status (OK/LOW/OUT)
  - Color coding: yashil (OK), sariq (LOW), qizil (OUT OF STOCK)
  - **Kirim (Stock In) page:** Form — supplier (text), items (product select + qty + cost_price + expiry_date), notes
  - Items qo'shish: barcode scan yoki product search
  - **Chiqim (Stock Out) page:** Form — reason (DAMAGE/WRITE_OFF/OTHER), items + qty
  - **Low stock alert page:** faqat past bo'lganlar, filterable
  - Barcha sahifalar: React Query hooks, loading, error handling
- **Kutilgan:** Admin paneldan ombor boshqarsa bo'ladi

---

## T-024 | P1 | [BACKEND] | Reports module — Daily revenue, top products, basic finance
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/reports/`
- **Vazifa:**
  - `ReportsModule`, `ReportsService`, `ReportsController`
  - **Daily revenue:** GET /reports/daily-revenue?from=&to= — kunlik savdo summalari
  - **Top products:** GET /reports/top-products?from=&to=&limit= — eng ko'p sotilganlar
  - **Sales summary:** GET /reports/sales-summary?from=&to= — jami savdo, qaytarishlar, sof daromad
  - **Profit estimate:** GET /reports/profit?from=&to= — sales - COGS (avg cost) - expenses
  - **Shift report:** GET /reports/shift/:shiftId — smena hisoboti
  - Barcha reportlarda tenant_id filter MAJBURIY
- **Kutilgan:** Asosiy hisobotlar API tayyor

---

## T-025 | P1 | [FRONTEND] | Reports UI — Dashboard + Daily sales + Top products
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/Dashboard/`, `apps/web/src/pages/Reports/`
- **Vazifa:**
  - **Dashboard:** bugungi savdo, haftalik trend chart, top 5 product, low stock alerts
  - **Daily revenue page:** date range picker, bar chart (Recharts), table
  - **Top products page:** date range, list with qty + revenue
  - **Shift reports:** smena tanlash, details table
  - ResponsiveContainer charts, loading skeletons
- **Kutilgan:** Admin panelda hisobotlar ko'rinadi

---

### ═══════════════════════════════════════
### WEEK 3 — Refund/Return + Audit + Security
### ═══════════════════════════════════════

---

## T-026 | P1 | [BACKEND] | Returns/Refund — service + admin PIN verification
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/sales/`
- **Vazifa:**
  - POST /orders/:id/return — qaytarish yaratish (items, reason, admin_pin)
  - Admin PIN tekshirish: faqat ADMIN yoki MANAGER roli bilan tasdiqlash
  - Cashier faqat so'rov yuboradi, ADMIN/MANAGER tasdiqlaydi
  - Return yaratishda:
    1. Original order mavjudligini tekshir
    2. Qaytarilayotgan qty <= original qty
    3. Return record yaratish
    4. `return.created` event → stock return (IN), payment reversal
  - GET /returns — qaytarishlar ro'yxati
  - Discount limit: Cashier max 5%, MANAGER max 15%, ADMIN unlimited
- **Kutilgan:** Qaytarish + fraud prevention ishlaydi

---

## T-027 | P1 | [BACKEND] | Audit log — Barcha CRUD operatsiyalar log qilinadi
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/interceptors/audit.interceptor.ts`
- **Vazifa:**
  - `audit_logs` jadvali: id, tenant_id, user_id, action (CREATE/UPDATE/DELETE/VOID/RETURN/LOGIN/SHIFT_OPEN/SHIFT_CLOSE), entity_type, entity_id, old_data (JSON), new_data (JSON), ip, user_agent, created_at
  - Global AuditInterceptor: POST/PATCH/DELETE requestlarni avtomatik log qilish
  - Sensitive operatsiyalar: refund, void, discount > 5%, shift close — alohida belgilanadi
  - GET /audit-logs — admin uchun filter (user, action, entity, date)
- **Kutilgan:** Barcha o'zgarishlar izlanadi, admin ko'ra oladi

---

---

### ═══════════════════════════════════════
### WEEK 4 — Expiry + Expenses + Deploy
### ═══════════════════════════════════════

---

## T-031 | P1 | [BACKEND] | Expiry tracking — Expiring soon report + alerts
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/inventory/`
- **Vazifa:**
  - GET /inventory/expiring?days=30 — yaroqlilik muddati 30/60/90 kun ichida tugaydigan productlar
  - Expiry data stock_movements.expiry_date dan olinadi (batch level)
  - Response: product name, barcode, batch, expiry_date, remaining_qty, days_left
  - Sort by expiry_date ASC (eng yaqin birinchi)
  - Expired items: alohida endpoint GET /inventory/expired
  - ⚠️ Kosmetika uchun expiry ENG MUHIM — bu report aniq bo'lishi shart
- **Kutilgan:** Yaroqlilik muddati bo'yicha hisobot ishlaydi

---

## T-032 | P1 | [BACKEND] | Expenses module — Simple expense tracking
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/finance/`
- **Vazifa:**
  - `expenses` jadvali: id, tenant_id, category (RENT/SALARY/DELIVERY/UTILITIES/OTHER), description, amount, date, user_id, created_at
  - `FinanceModule`, `FinanceService`, `FinanceController`
  - POST /expenses — xarajat qo'shish
  - GET /expenses — ro'yxat (filter: category, date range)
  - GET /expenses/summary?from=&to= — kategoriya bo'yicha jami
  - Profit hisoblash: revenue - COGS - expenses
- **Kutilgan:** Oddiy xarajatlarni kiritish va hisobot olsa bo'ladi

---

---

## T-035 | P1 | [BACKEND] | Ledger module — Double-entry journal (MVP — basic)
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/ledger/`
- **Vazifa:**
  - `LedgerModule`, `LedgerService` (Controller YO'Q — faqat internal)
  - Prisma schema: `journal_entries` + `ledger_lines` (CLAUDE_BACKEND.md dagi kabi)
  - `sale.created` → debit Cash/Receivable, credit Revenue
  - `payment.confirmed` → debit Cash, credit Sales
  - `return.created` → reversal entries
  - sum(debit) === sum(credit) validation MAJBURIY
  - ⚠️ IMMUTABLE — update/delete TAQIQLANGAN
- **Kutilgan:** Har savdo, to'lov, qaytarishda ledger entry avtomatik yaratiladi

---

## T-036 | P1 | [BACKEND] | Fiscal adapter — "Ready" dizayn (placeholder)
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/tax/`
- **Vazifa:**
  - `TaxModule`, `FiscalAdapterService`
  - Order da: fiscal_status field (NONE/PENDING/SENT/FAILED)
  - Placeholder adapter: hozir faqat status ni PENDING qiladi
  - Keyinroq real provider (REGOS va boshqa) adapter qo'shiladi
  - Receipt da fiscal_status ko'rsatish
  - ⚠️ Sale ni HECH QACHON block qilma fiscal fail bo'lsa
- **Kutilgan:** Fiscal dizayn tayyor, keyinroq plug-in qilsa bo'ladi

---

## T-037 | P1 | [DEVOPS] | Staging deploy — Docker + CI/CD basic
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `docker/`, `.github/workflows/`
- **Vazifa:**
  - Production-ready Dockerfile (API + Web)
  - docker-compose.staging.yml (PostgreSQL, Redis, API, Web)
  - GitHub Actions: lint → type-check → test → build → deploy
  - Environment variables management (.env.staging)
  - Basic health check endpoint
  - SSL/HTTPS setup
- **Kutilgan:** Staging server da ishlaydi, auto-deploy PR merge dan keyin

---

## T-038 | P0 | [IKKALASI] | Shared types — API contract (request/response DTOs)
- **Sana:** 2026-02-26
- **Mas'ul:** Polat + AbdulazizYormatov
- **Fayl:** `packages/types/`
- **Vazifa:**
  - Product, Category, Unit types
  - Order, OrderItem, Shift types
  - PaymentIntent types
  - StockMovement types
  - Return types
  - Common: PaginatedResponse<T>, ApiError, SortOrder
  - Frontend va Backend bir xil type ishlatishi SHART
- **Kutilgan:** `packages/types` da barcha shared typelar tayyor

---

## T-039 | P0 | [BACKEND] | Domain events setup — EventEmitter2 integration
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/events/`
- **Vazifa:**
  - NestJS EventEmitter2 integratsiya
  - Events: `sale.created`, `payment.confirmed`, `return.created`, `stock.low`, `shift.opened`, `shift.closed`
  - EventLogService: barcha eventlarni `event_log` jadvaliga yozish (immutable)
  - Event handler pattern: CLAUDE_BACKEND.md dagi kabi
  - Sale → Inventory deduction, Ledger entry, Fiscal queue avtomatik
- **Kutilgan:** Modul aro aloqa event-driven ishlaydi

---

## 🟡 P1 — MUHIM (funksional xatolik / MVP+)

_(yuqoridagi T-024 — T-037 P1 tasklar ham shu kategoriyada)_

---

## 🔵 P2 — O'RTA (MVP dan keyin, Phase 2)

---

## T-040 | P2 | [BACKEND] | Telegram notifications — Low stock, shift close, suspicious refund
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/bot/`
- **Vazifa:**
  - grammY bot setup
  - Admin Telegram chat ga alert yuborish
  - Triggerlar: low stock, shift close report, refund > threshold, expired stock
  - `/report` command — bugungi savdo summary
- **Kutilgan:** Admin Telegram dan alertlar oladi

---

## T-041 | P2 | [FRONTEND] | Supplier management — CRUD + product linking
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/Catalog/Suppliers/`
- **Vazifa:**
  - Suppliers CRUD: name, phone, company, address
  - Product-supplier linking
  - Kirim (stock-in) da supplier tanlash
- **Kutilgan:** Yetkazib beruvchilarni boshqarsa bo'ladi

---

## T-042 | P2 | [BACKEND] | Supplier module — CRUD service
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/catalog/`
- **Vazifa:**
  - `suppliers` jadvali: id, tenant_id, name, phone, company, address, is_active
  - `product_suppliers` jadvali: product_id, supplier_id, supply_price
  - CRUD endpoints: /suppliers
- **Kutilgan:** Supplier API tayyor

---

## ⚪ P3 — PAST (Phase 2+, keyinroq)

---

## T-043 | P3 | [BACKEND] | Loyalty module — Bonus points system
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Xaridor loyalty: points earn (sale), points redeem (discount). Customer card / phone number.

## T-045 | P3 | [BACKEND] | Bundles/Sets — Kosmetika setlar (skincare set, gift set)
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Bundle product: bir nechta product ni bitta narxda sotish. Stock deduction har component dan.

## T-046 | P3 | [BACKEND] | Serial number tracking — Qimmat brendlar uchun
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Product variant-level serial number. Kirimda serial qo'shish, sotishda serial tanlash.

## T-047 | P3 | [IKKALASI] | Multi-branch support — Filiallar
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Branch CRUD, branch-level stock, branch-level reports, stock transfer between branches.

## T-048 | P3 | [BACKEND] | Supplier order automation — Auto-reorder
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Min stock level ga yetganda supplier ga avtomatik buyurtma (notification yoki draft order).

## T-049 | P3 | [IKKALASI] | POS Desktop — Tauri + SQLite offline-first
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Web POS → Tauri desktop app. SQLite local DB, outbox sync, ESC/POS printer. CLAUDE_FRONTEND.md dagi offline-first arxitektura.

---

# ════════════════════════════════════════════════════════════════
# PRODUCTION-READY FEATURES (Deep Analysis — T-050+)
# ════════════════════════════════════════════════════════════════

---

### ═══════════════════════════════════════
### 🔥 NASIYA (QARZ SAVDO) — ENG KRITIK!
### O'zbekiston do'konlarining 60-70% nasiyada sotadi
### Bu bo'lmasa tizim ISHLATILMAYDI
### ═══════════════════════════════════════

---

## T-050 | P0 | [BACKEND] | Customer module — Prisma schema + CRUD
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/prisma/schema.prisma`, `apps/api/src/customers/`
- **Vazifa:**
  - `customers` jadvali: id, tenant_id, name, phone (UNIQUE per tenant — O'zbekistonda asosiy identifikator), telegram_username, address, notes, debt_balance (calculated), total_purchases, visit_count, last_visit_at, debt_limit, is_blocked, created_at, updated_at, deleted_at
  - `CustomerModule`, `CustomerService`, `CustomerController`
  - POST /customers — yangi xaridor
  - GET /customers — ro'yxat (search by phone/name, filter by has_debt)
  - GET /customers/:id — profil + purchase history + debt history
  - GET /customers/phone/:phone — tezkor telefon orqali topish (POS uchun)
  - PATCH /customers/:id — tahrirlash
  - Indexes: [tenant_id, phone], [tenant_id, name]
- **Kutilgan:** Xaridorlar bazasi tayyor, telefon orqali tezkor topsa bo'ladi

---

## T-051 | P0 | [BACKEND] | Nasiya (qarz) module — Qarz yaratish + to'lash
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/customers/nasiya/`
- **Vazifa:**
  - `debts` jadvali: id, tenant_id, customer_id, order_id, amount, paid_amount, remaining, due_date, status (ACTIVE/PARTIALLY_PAID/PAID/OVERDUE/WRITTEN_OFF), notes, created_at
  - `debt_payments` jadvali: id, debt_id, tenant_id, amount, method (CASH/CARD/TRANSFER), received_by (user_id), notes, created_at
  - POST /orders — nasiya bilan savdo: payment_method = NASIYA, customer_id MAJBURIY
  - POST /debts/:id/pay — qarz to'lash (to'liq yoki qisman)
  - GET /debts — ro'yxat (filter: customer, status, overdue)
  - GET /debts/overdue — muddati o'tganlar
  - GET /debts/summary — jami qarz, overdue summa, yig'ilgan summa
  - **Qoidalar:**
    - Nasiyaga sotishda: customer.debt_limit tekshirish
    - Overdue customer ga yangi nasiya BLOCK qilish
    - debt_payment yaratishda: Ledger entry (debit Cash, credit Accounts Receivable)
    - Partial payment: eng eski qarzga birinchi (FIFO)
  - **Aging report:** GET /debts/aging — 0-30, 31-60, 61-90, 90+ kun bucketlar
- **Kutilgan:** Nasiyaga sotish, qarz to'lash, overdue tracking ishlaydi

---

## T-052 | P0 | [FRONTEND] | Nasiya UI — POS da qarzga sotish
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/POS/`
- **Vazifa:**
  - POS payment panelda "Nasiya" tugmasi (F7)
  - Nasiya tanlanganda: customer search modal (telefon orqali)
  - Customer topilmasa: tezkor yaratish (name + phone)
  - Customer debt limit va status ko'rsatish (qancha qarzi bor, limit qancha)
  - Overdue customer → qizil ogohlantirish "Bu xaridor muddati o'tgan qarzga ega!"
  - Nasiya savdo tasdiqlash → order yaratiladi + debt record
- **Kutilgan:** Kassir nasiyaga sotsa bo'ladi, customer tezkor topiladi

---

## T-053 | P0 | [FRONTEND] | Nasiya management UI — Qarzlar ro'yxati + to'lov qabul
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/Customers/`
- **Vazifa:**
  - **Customers list:** DataTable — name, phone, total debt, last visit, status
  - **Customer profile:** purchase history, debt history, to'lovlar
  - **Debt list:** DataTable — customer, amount, remaining, due_date, status, age (days)
  - Color coding: yashil (current), sariq (0-30 overdue), qizil (30+ overdue)
  - **Debt payment form:** customer tanlash → amount kiritish → method → confirm
  - **Aging report page:** 4 bucket (0-30, 31-60, 61-90, 90+), jami summalar, pie chart
  - **Dashboard widget:** "Jami nasiya: X so'm | Overdue: Y so'm"
- **Kutilgan:** Admin/manager nasiyalarni to'liq boshqarsa bo'ladi

---

## T-054 | P1 | [BACKEND] | Nasiya reminders — SMS/Telegram orqali eslatish
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/notifications/`
- **Vazifa:**
  - Due date dan 3 kun oldin: avtomatik Telegram/SMS reminder
  - Overdue bo'lganda: kunlik reminder (max 3 kun, keyin haftalik)
  - Template: "Hurmatli [ism], [do'kon] da [X] so'm qarzingiz bor. Muddati: [sana]"
  - Reminder history log
  - Tenant settings: reminder enabled/disabled, channel (SMS/Telegram/both)
- **Kutilgan:** Xaridorga avtomatik qarz eslatish yuboriladi

---

### ═══════════════════════════════════════
### 🖥️ SAAS OWNER (FOUNDER) DASHBOARD
### Barcha tenantlar ustidan monitoring
### ═══════════════════════════════════════

---

## T-055 | P0 | [BACKEND] | Super Admin auth — Cross-tenant access
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/`
- **Vazifa:**
  - `admin_users` jadvali: id, email, password_hash, name, role (SUPER_ADMIN/SUPPORT), is_active, created_at
  - Alohida login endpoint: POST /admin/auth/login
  - Super Admin JWT: tenant_id = null, role = SUPER_ADMIN
  - Cross-tenant query: TenantGuard bypass for SUPER_ADMIN
  - Barcha admin actions audit log ga yoziladi
- **Kutilgan:** SaaS owner barcha tenantlarni ko'ra oladi

---

## T-056 | P0 | [BACKEND] | Founder Dashboard API — Aggregated metrics
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/admin/`
- **Vazifa:**
  - `AdminModule`, `AdminService`, `AdminController`
  - GET /admin/tenants — barcha tenantlar ro'yxati (name, slug, created_at, status, user_count, last_activity, subscription_status)
  - GET /admin/metrics — aggregated: jami savdo bugun/hafta/oy, jami orders, active tenants, active users online
  - GET /admin/tenants/:id/sales — tenant ning savdo tarixi (real-time)
  - GET /admin/tenants/:id/errors — tenant ning error loglari
  - GET /admin/tenants/:id/health — tenant health: last sync, last sale, error count 24h, active users
  - GET /admin/errors — BARCHA tenantlardan error log (filter: tenant, severity, date)
  - GET /admin/sales/live — real-time savdo stream (WebSocket yoki SSE)
- **Kutilgan:** Founder barcha do'konlarning real-time datalarini ko'radi

---

## T-057 | P0 | [FRONTEND] | Founder Dashboard UI — Main monitoring panel
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/Admin/`
- **Vazifa:**
  - **Alohida layout** /admin/* — SaaS owner uchun (tenant admin paneldan farqli)
  - **Overview page:**
    - Card grid: jami tenantlar, active tenants, bugungi jami savdo, jami orders
    - Live sales ticker (so'nggi 10 ta savdo real-time)
    - Revenue chart (barcha tenantlar aggregated, daily)
    - Top 5 tenants by revenue (bar chart)
  - **Tenants list page:**
    - DataTable: name, slug, sales today, revenue today, errors 24h, last activity, status
    - Traffic light: yashil (active, no errors), sariq (active, errors), qizil (inactive > 24h)
    - Search, filter by status
  - **Tenant detail page:**
    - Savdo chart, top products, error list, active users, shift history
    - "Login as" tugmasi (impersonation)
  - **Error log page:**
    - Barcha tenantlardan centralized errors
    - Filter: tenant, type (API/client/sync), severity, date
    - Error detail: stack trace, user, request info
  - **Real-time notifications:**
    - Browser notification: yangi error, tenant down, big refund
- **Kutilgan:** Founder bitta ekrandan BARCHA do'konlarni monitoring qiladi

---

## T-058 | P1 | [BACKEND] | Tenant impersonation — "Login as" any tenant
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/admin/`
- **Vazifa:**
  - POST /admin/impersonate/:tenantId — vaqtinchalik token (1 soat, read-only option)
  - Barcha impersonation audit log ga yoziladi: who, when, which tenant
  - Impersonated session da banner: "Siz [tenant] sifatida kirgansiz"
  - Faqat SUPER_ADMIN roli
- **Kutilgan:** SaaS owner debug uchun har qanday tenant ga kirsa bo'ladi

---

## T-059 | P1 | [BACKEND] | Tenant provisioning wizard — One-click setup
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/admin/`
- **Vazifa:**
  - POST /admin/tenants/provision — yangi tenant yaratish:
    1. Tenant record
    2. Owner user (phone + temp password)
    3. Default branch
    4. Seed categories (Kosmetika: Terini parvarish, Soch, Makiyaj, Atir, Tirnoq, Tana parvarish, Aksessuarlar)
    5. Default units (dona, quti, set, ml, gram)
    6. Default settings (currency: UZS, tax: 12%, fiscal: disabled)
  - Response: tenant slug, owner credentials
- **Kutilgan:** Yangi do'konni 1 klikda tayyorlab bersa bo'ladi

---

---

## T-061 | P1 | [BACKEND] | Real-time events — WebSocket/SSE for live data
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/realtime/`
- **Vazifa:**
  - NestJS WebSocket Gateway (Socket.io)
  - Events: `sale:completed`, `error:new`, `sync:status`, `shift:changed`
  - Room-based: tenant_id room (tenant admin), `admin` room (founder)
  - JWT auth for WebSocket connections
  - Founder: barcha tenantlardan event oladi
  - Tenant admin: faqat o'z tenant eventlari
- **Kutilgan:** Real-time data update frontend da ishlaydi

---

### ═══════════════════════════════════════
### 🌐 OFFLINE-FIRST ARXITEKTURA
### Internet yo'q paytda savdo davom etadi
### Internet kelganda data avtomatik sync
### ═══════════════════════════════════════

---

## T-062 | P0 | [BACKEND] | Outbox pattern — Server-side sync endpoint
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/sync/`
- **Vazifa:**
  - `SyncModule`, `SyncService`, `SyncController`
  - POST /sync/inbound — POS dan kelgan batch data qabul qilish
    - Body: array of events [{type, payload, idempotency_key, timestamp}]
    - Har event uchun: idempotency check → process → ack
  - GET /sync/outbound?since=timestamp — server dan o'zgarishlarni olish (products, prices, categories)
  - **Idempotency:** duplicate event reject (409), already processed = skip
  - **Ordering:** sequence_number orqali tartib saqlash
  - **Batch processing:** 100 ta event bitta request da
  - **Conflict resolution:**
    - Financial (sale, payment, stock movement): event-sourcing, reject true duplicates
    - Non-financial (product name, category): last-write-wins + timestamp
- **Kutilgan:** POS offline ishlagan data serverga to'g'ri sync bo'ladi

---

## T-063 | P0 | [IKKALASI] | Sync engine package — Core offline logic
- **Sana:** 2026-02-26
- **Mas'ul:** Polat + AbdulazizYormatov
- **Fayl:** `packages/sync-engine/`
- **Vazifa:**
  - `sync_outbox` table schema (for SQLite and PostgreSQL)
  - OutboxManager: append event, process queue (FIFO), mark sent/failed
  - SyncWorker: background process, exponential backoff (1s→2s→4s→8s, max 5min)
  - ConflictResolver: strategy pattern (event-sourcing vs last-write-wins)
  - IdempotencyKeyGenerator: UUID v4 + tenant + timestamp
  - ConnectivityDetector: active ping every 30s, degrade detection (latency > 5s)
  - SyncStatus: online/offline/syncing/error states
- **Kutilgan:** Offline-first core logic tayyor, POS va server ishlatsa bo'ladi

---

---

---

### ═══════════════════════════════════════
### 🔒 SECURITY HARDENING
### ═══════════════════════════════════════

---

## T-067 | P0 | [BACKEND] | Failed login lockout — Brute-force himoya
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/`
- **Vazifa:**
  - 5 muvaffaqiyatsiz urinish → 15 daqiqa lock
  - `login_attempts` jadvali: user_id, ip, success, created_at
  - Lock status: GET /auth/me da ko'rsatish
  - Admin unlock: POST /users/:id/unlock
  - Barcha failed login lar audit log ga
- **Kutilgan:** Brute-force hujumdan himoya

---

## T-068 | P0 | [BACKEND] | Admin PIN — Sensitive operatsiyalar uchun
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/`
- **Vazifa:**
  - User jadvaliga: `pin_hash` field (4-6 raqam, bcrypt)
  - PIN kerak operatsiyalar: refund, void, discount > 5%, price change, shift close, cash drawer open
  - POST /auth/verify-pin — PIN tekshirish (request body: pin, action_type)
  - Noto'g'ri PIN 3 marta → 5 daqiqa lock
  - PIN almashtirishda eski PIN kerak
- **Kutilgan:** Fraud prevention — sensitive ops faqat PIN bilan

---

## T-069 | P1 | [BACKEND] | Session management — Active sessions tracking
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/`
- **Vazifa:**
  - `sessions` jadvali: id, user_id, tenant_id, device_info, ip, last_active, created_at
  - GET /auth/sessions — foydalanuvchi ning active sessions
  - DELETE /auth/sessions/:id — sessionni tugatish
  - Max 3 concurrent session (configurable per tenant)
  - Admin: force logout any user
- **Kutilgan:** Kim qayerdan kirganini ko'rsa bo'ladi

---

## T-070 | P1 | [BACKEND] | Employee activity monitor — Fraud detection
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/reports/`
- **Vazifa:**
  - Per-cashier metrics: void count, refund count, discount total, avg transaction value
  - Suspicious patterns: 3+ void in 1 hour, refund > 20% of sales, discount > threshold
  - GET /reports/employee-activity — filter by user, date range
  - Alert trigger: suspicious activity → Telegram notification to owner
- **Kutilgan:** Xodim firibgarligi aniqlanadi

---

## T-071 | P1 | [BACKEND] | API Key auth — POS sync uchun long-lived token
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/`
- **Vazifa:**
  - `api_keys` jadvali: id, tenant_id, branch_id, key_hash, name, scopes, last_used, is_active, created_at, expires_at
  - POS-to-server sync: API key (expire qilmaydi, JWT o'rniga)
  - Scoped: faqat sync endpoints ga access
  - Revocable: admin paneldan o'chirish mumkin
  - Rate limit: per API key
- **Kutilgan:** POS offline dan serverga xavfsiz sync

---

## T-072 | P1 | [BACKEND] | Input sanitization — XSS/injection himoya
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/pipes/`
- **Vazifa:**
  - Global pipe: HTML strip from all text inputs
  - Barcode format validation (EAN-13, EAN-8, Code128, UPC-A)
  - Phone format validation (+998XXXXXXXXX)
  - Price validation: positive number, max 2 decimal
  - File upload: mimetype whitelist (image/jpeg, image/png, image/webp)
- **Kutilgan:** Barcha kiritilgan data xavfsiz

---

### ═══════════════════════════════════════
### ⚡ PERFORMANCE & SCALABILITY
### ═══════════════════════════════════════

---

## T-073 | P0 | [BACKEND] | Redis caching layer — Product catalog + stock cache
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/cache/`
- **Vazifa:**
  - NestJS CacheModule + Redis adapter
  - Cache strategiyasi:
    - Product catalog: 5 min TTL, invalidate on product update
    - Current stock levels: 1 min TTL, invalidate on stock movement
    - User sessions: until logout
    - Exchange rate: 24h TTL
  - Cache decorator: `@Cacheable(key, ttl)`
  - Cache invalidation: event-driven (product.updated → clear cache)
- **Kutilgan:** API response 3-5x tezroq (cache hit)

---

## T-074 | P0 | [BACKEND] | Database indexing — Critical query optimization
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/prisma/schema.prisma`
- **Vazifa:**
  - Composite indexes: [tenant_id, created_at] on orders, [tenant_id, barcode] on products, [tenant_id, product_id, warehouse_id] on stock_movements
  - Partial indexes: `WHERE is_active = true` on products
  - Pagination: barcha list endpoint da MAJBURIY (default 20, max 100)
  - Global interceptor: paginate qilinmagan list so'rovni reject
- **Kutilgan:** Katta data bilan ham tez ishlaydi

---

## T-075 | P1 | [BACKEND] | Stock snapshot materialization — Hourly recalculation
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/inventory/`
- **Vazifa:**
  - `@Cron('0 * * * *')` — har soat stock snapshot hisoblash
  - `stock_snapshots` jadvaliga: tenant_id, product_id, warehouse_id, quantity, calculated_at
  - Stock query: snapshot + recent movements (snapshot dan keyingilar) = current stock
  - 10x tezroq (10000+ movement bor product uchun)
- **Kutilgan:** Stock query tez, katta inventar bilan ham ishlaydi

---

## T-076 | P1 | [BACKEND] | BullMQ worker — Background job processing
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/worker/`
- **Vazifa:**
  - Queue lar: `fiscal-receipt`, `notification`, `report-generate`, `stock-snapshot`, `data-export`, `sync-process`
  - Job patterns: retry (3x, exponential), DLQ (dead letter), timeout
  - Admin UI: BullMQ Board (optional) — job status ko'rish
  - Cron jobs: stock snapshot (hourly), expiry check (daily), exchange rate (daily)
- **Kutilgan:** Background tasklar xavfsiz va kuzatiladigan tarzda ishlaydi

---

## T-077 | P1 | [BACKEND] | Response compression + rate limiting per tenant
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/`
- **Vazifa:**
  - gzip/brotli compression middleware (catalog 1000+ items uchun muhim)
  - Per-tenant rate limit: 100 req/min default, configurable per plan
  - Per-endpoint rate limit: login = 10/min, sync = 30/min, reports = 20/min
  - Graceful 429 response with Retry-After header
- **Kutilgan:** API tez va himoyalangan

---

### ═══════════════════════════════════════
### 🇺🇿 MOLIYAVIY COMPLIANCE (O'zbekiston)
### ═══════════════════════════════════════

---

## T-078 | P0 | [BACKEND] | NDS (QQS) hisoblash — 12% VAT
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/tax/`
- **Vazifa:**
  - UZ QQS: 12% standart stavka
  - Per-product tax config: taxable/exempt
  - Narx formatlar: tax-inclusive (default UZ) vs tax-exclusive
  - Tax hisoblash: order level summary (subtotal, tax_amount, total)
  - Tax report: GET /reports/tax?from=&to= — davriy QQS hisobot
- **Kutilgan:** Har savdoda QQS to'g'ri hisoblanadi

---

## T-079 | P0 | [BACKEND] | INN va STIR validatsiya — Soliq identifikator
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/`
- **Vazifa:**
  - Tenant jadvaliga: inn (9 yoki 14 raqam), stir, oked, legal_name, legal_address
  - INN format validatsiya
  - Receipt da INN chiqarish (qonuniy talab)
  - Tenant registration da INN MAJBURIY
- **Kutilgan:** Soliq ma'lumotlari to'g'ri saqlanadi va chekda ko'rinadi

---

## T-080 | P0 | [BACKEND] | UZS yaxlitlash — Tiyinsiz hisoblash
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/utils/`
- **Vazifa:**
  - UZ da amalda tiyin yo'q. Yaxlitlash: 100 yoki 1000 ga (configurable)
  - Yaxlitlash farqi ledger da alohida account ga yoziladi
  - Round function: `roundUZS(amount, precision)` — utils package da
  - Barcha narx/summa hisoblashda ishlatiladi
- **Kutilgan:** Narxlar real hayotdagi kabi yaxlitlanadi

---

## T-081 | P1 | [BACKEND] | REGOS fiskal integratsiya — Elektron chek
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/tax/fiscal/`
- **Vazifa:**
  - REGOS API adapter: receipt yuborish → fiscal_id + QR code olish
  - Queue orqali: savdo → fiscal queue → retry (3x, exponential)
  - Fail bo'lsa: savdo DAVOM etadi, fiscal_status = PENDING → retry
  - Receipt snapshot: immutable saqlanadi
  - Z-report: kunlik fiskal yakuniy hisobot
- **Kutilgan:** Soliq idorasiga elektron chek yuboriladi

---

## T-082 | P1 | [BACKEND] | Valyuta support — USD/UZS dual currency
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/currency/`
- **Vazifa:**
  - Import kosmetikalar USD da narxlanadi, UZS da sotiladi
  - `exchange_rates` jadvali: date, usd_uzs, source (CBU)
  - Cron: har kuni CBU API dan kurs olish (https://cbu.uz/oz/arkhiv-kursov-valyut/json/)
  - Product da: cost_currency (USD/UZS), auto-convert to UZS
  - Margin hisoblashda valyuta kursi hisobga olinadi
- **Kutilgan:** Import tovar narxi USD da, foyda to'g'ri hisoblanadi

---

## T-083 | P1 | [BACKEND] | Z-report — Kunlik fiskal yakuniy hisobot
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/reports/`
- **Vazifa:**
  - POST /reports/z-report — kunlik yakuniy hisobot yaratish
  - Tarkibi: jami savdo, jami QQS, jami qaytarishlar, payment method breakdown, fiscal receipt count
  - Immutable: yaratilgandan keyin o'zgartirib BO'LMAYDI
  - Sequence number: auto-increment
  - Soliq tekshiruvida talab qilinadi
- **Kutilgan:** Kunlik Z-hisobot soliq uchun tayyor

---

### ═══════════════════════════════════════
### 🔧 OPERATSION FEATURES
### ═══════════════════════════════════════

---

## T-084 | P0 | [DEVOPS] | Automated database backups — Daily to S3/MinIO
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `docker/`, `scripts/`
- **Vazifa:**
  - Kunlik pg_dump → S3/MinIO (encrypted GPG)
  - Retention: 30 kun
  - Restore test: oylik avtomatik
  - Backup notification: success/fail → Telegram
- **Kutilgan:** Data hech qachon yo'qolmaydi

---

## T-085 | P0 | [BACKEND] | Health checks — Readiness + liveness
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/health/`
- **Vazifa:**
  - GET /health/live — process alive (200)
  - GET /health/ready — DB + Redis + MinIO connected (200/503)
  - GET /health/startup — app fully initialized
  - Graceful shutdown: `enableShutdownHooks()`, in-flight request finish, DB close
- **Kutilgan:** Deploy va monitoring to'g'ri ishlaydi

---

## T-086 | P1 | [DEVOPS] | Monitoring — Prometheus + Grafana
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `docker/monitoring/`
- **Vazifa:**
  - Prometheus metrics: request latency, error rate, active connections, queue depth, DB connection pool
  - Grafana dashboard: API performance, error trends, resource usage
  - Alert rules: error rate > 5%, latency > 2s, queue depth > 100
  - Uptime monitoring: external ping → Telegram alert
- **Kutilgan:** System performance real-time ko'rinadi

---

## T-087 | P1 | [BACKEND] | Data export — CSV/Excel
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/reports/`
- **Vazifa:**
  - Har report va list: "Export" tugmasi
  - BullMQ job: generate file → S3 → download URL
  - Formats: CSV, XLSX
  - Large exports (10k+ rows): async, ready notification
  - Export history: tenant admin ko'rsa bo'ladi
- **Kutilgan:** Hisobotlarni Excel ga chiqarsa bo'ladi

---

## T-088 | P1 | [BACKEND] | Scheduled tasks (Cron) — Daily/hourly jobs
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/cron/`
- **Vazifa:**
  - @Cron tasks:
    - Hourly: stock snapshot recalculation
    - Daily 00:00: exchange rate update (CBU)
    - Daily 06:00: expiry report generation
    - Daily 08:00: nasiya reminder (due today/overdue)
    - Weekly: dead stock report
    - Monthly: subscription billing check
  - Cron log: har run audit qilinadi
- **Kutilgan:** Avtomatik kunlik/haftalik tasklar ishlaydi

---

### ═══════════════════════════════════════
### 📊 ANALYTICS & BUSINESS INTELLIGENCE
### ═══════════════════════════════════════

---

## T-089 | P1 | [BACKEND] | Sales analytics — Trend, top products, margin
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/ai/`
- **Vazifa:**
  - GET /analytics/sales-trend?period=daily|weekly|monthly — sales trend chart data
  - GET /analytics/top-products?from=&to=&limit= — eng foydali/eng ko'p sotilgan
  - GET /analytics/dead-stock?days=30|60|90 — harakatsiz tovarlar
  - GET /analytics/margin — per-product margin analysis
  - GET /analytics/abc — ABC classification (A=top 20%, B=30%, C=50%)
  - GET /analytics/cashier-performance — per-cashier metrics
  - GET /analytics/hourly-heatmap — soatlik savdo heatmap
- **Kutilgan:** Business intelligence endpointlar tayyor

---

---

### ═══════════════════════════════════════
### ⚙️ ERROR HANDLING & RESILIENCE
### ═══════════════════════════════════════

---

## T-091 | P0 | [BACKEND] | Global exception filter — Consistent error responses
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/filters/`
- **Vazifa:**
  - AllExceptionsFilter: barcha handled va unhandled errorlarni ushlash
  - Standard response format: `{ statusCode, message, error, timestamp, path, requestId }`
  - Internal details HECH QACHON client ga yuborilmaydi
  - 5xx errors → error log file + Sentry/alert
  - Prisma errors → user-friendly message (unique constraint, not found, etc.)
- **Kutilgan:** Barcha errorlar bir xil formatda, xavfsiz

---

## T-092 | P0 | [BACKEND] | Transaction safety — Prisma $transaction everywhere
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/` (barcha service lar)
- **Vazifa:**
  - Barcha multi-step write operations: `prisma.$transaction([...])` ichida
  - Order yaratish: order + items + payment + event = 1 transaction
  - Stock in: movements + snapshot update = 1 transaction
  - Nasiya: order + debt + event = 1 transaction
  - Har qanday step fail → FULL rollback
- **Kutilgan:** Data hech qachon yarim-yarti holatda qolmaydi

---

## T-093 | P1 | [BACKEND] | Circuit breaker — External service himoya
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/circuit-breaker/`
- **Vazifa:**
  - External services uchun: fiscal API, SMS gateway, payment provider, exchange rate API
  - 3 consecutive fail → circuit OPEN (30s) → half-open test → close
  - `opossum` library
  - Fallback: fiscal fail → queue, SMS fail → retry later, exchange rate fail → use cached
- **Kutilgan:** External service fail butun tizimni buzolmaydi

---

## T-094 | P1 | [BACKEND] | Dead letter queue — Failed job management
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/worker/`
- **Vazifa:**
  - BullMQ: 3 retry dan keyin → DLQ ga ko'chirish
  - Admin endpoint: GET /admin/dlq — failed jobs list
  - POST /admin/dlq/:id/retry — qayta urinish
  - DELETE /admin/dlq/:id — dismiss
  - Alert: DLQ da 10+ job → Telegram notification
- **Kutilgan:** Failed jobs kuzatiladi va boshqariladi

---

### ═══════════════════════════════════════
### 🏢 KOSMETIKA-SPECIFIC FEATURES
### ═══════════════════════════════════════

---

## T-095 | P1 | [BACKEND] | Product variants — Rang/hajm/tur
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/catalog/`
- **Vazifa:**
  - `product_variants` jadvali: id, product_id, tenant_id, name (e.g. "Qizil", "50ml"), sku, barcode, cost_price, sell_price, is_active
  - Kosmetikada: lipstick 20 ta rangda, krem 3 ta hajmda
  - Har variant o'z barcode, stock, price
  - POS da: product tanlash → variant tanlash
  - Stock: variant level da tracking
- **Kutilgan:** Kosmetika variantlari (rang, hajm) boshqariladi

---

## T-096 | P2 | [BACKEND] | Tester/sample tracking — Ochilgan tester hisobi
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/inventory/`
- **Vazifa:**
  - Tester ochish: stock_movement type = TESTER
  - Tester cost: expense sifatida hisoblanadi
  - Tester list: GET /inventory/testers — qaysi productlardan tester ochilgan
  - Monthly tester cost report
- **Kutilgan:** Tester xarajati to'g'ri hisoblanadi

---

## T-097 | P2 | [BACKEND] | Product sertifikat — Kosmetika sifat hujjati
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/catalog/`
- **Vazifa:**
  - `product_certificates` jadvali: id, product_id, cert_number, issuing_authority, issued_at, expires_at, file_url
  - Expired sertifikat → alert
  - Soliq tekshiruvida talab qilinishi mumkin
- **Kutilgan:** Sertifikat ma'lumotlari saqlanadi va kuzatiladi

---

## T-098 | P1 | [BACKEND] | Price management — Wholesale/retail + tiered
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/catalog/`
- **Vazifa:**
  - `product_prices` jadvali: id, product_id, price_type (RETAIL/WHOLESALE), min_qty, price, valid_from, valid_to
  - POS da: customer group ga qarab narx (wholesale customer → wholesale price)
  - Tiered: 1-5 dona = X, 6-10 = Y, 11+ = Z
  - Price history: narx o'zgarishi log qilinadi
  - Scheduled price: kelajakda boshlanadigan narx
- **Kutilgan:** Narxlarni moslashuvchan boshqarsa bo'ladi

---

## T-099 | P2 | [BACKEND] | Promotions engine — Discount, buy-X-get-Y
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/sales/promotions/`
- **Vazifa:**
  - `promotions` jadvali: id, tenant_id, name, type (PERCENT/FIXED/BUY_X_GET_Y/BUNDLE), rules (JSON), valid_from, valid_to, is_active
  - POS da: auto-apply matching promotions
  - Types: % chegirma, fixed summa, 2+1, happy hour (vaqtga bog'liq)
  - Stackable rules config
  - Promotion analytics: qancha ishlatildi, qancha tejaldi
- **Kutilgan:** Aksiya/chegirma tizimi ishlaydi

---

### ═══════════════════════════════════════
### 📱 MOBILE APP (Owner uchun)
### ═══════════════════════════════════════

---

## T-100 | P1 | [MOBILE] | Owner mobile dashboard — Real-time monitoring
- **Sana:** 2026-02-26
- **Mas'ul:** Ibrat + Abdulaziz
- **Fayl:** `apps/mobile/`
- **Vazifa:**
  - Home screen: bugungi savdo, haftalik trend, active shifts
  - Push notification: har savdo, shift open/close, error, low stock
  - Savdo list: real-time yangilanib turadi
  - Quick stats: revenue, orders, avg basket, top products
- **Kutilgan:** Do'kon egasi telefondan doim xabardor

---

## T-101 | P1 | [MOBILE] | Nasiya management — Qarzlarni telefondan boshqarish
- **Sana:** 2026-02-26
- **Mas'ul:** Ibrat + Abdulaziz
- **Fayl:** `apps/mobile/`
- **Vazifa:**
  - Debtors list: kim qancha qarzda
  - Debt payment recording: to'lov qabul qilish
  - Send reminder: Telegram/SMS orqali "to'lang" xabar
  - Overdue alerts: push notification
- **Kutilgan:** Owner yo'lda ham nasiyalarni boshqaradi

---

## T-102 | P2 | [MOBILE] | Barcode scanner — Camera orqali tovar tekshirish
- **Sana:** 2026-02-26
- **Mas'ul:** Ibrat + Abdulaziz
- **Fayl:** `apps/mobile/`
- **Vazifa:**
  - Camera barcode scan → product info (name, price, stock, expiry)
  - Quick stock adjustment
  - Physical inventory count: scan + enter actual qty
- **Kutilgan:** Telefondan tovar ma'lumotini tezkor ko'rsa bo'ladi

---

## T-103 | P1 | [BACKEND] | Push notifications — Firebase + notification service
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/notifications/`
- **Vazifa:**
  - Firebase Cloud Messaging integration
  - Notification types: sale_completed, shift_changed, error_alert, low_stock, expiry_warning, large_refund, nasiya_overdue
  - Per-user notification preferences
  - `notifications` jadvali: id, user_id, type, title, body, data, is_read, created_at
  - GET /notifications — user ning notifications
  - PATCH /notifications/:id/read
- **Kutilgan:** Mobile va web da push notification ishlaydi

---

### ═══════════════════════════════════════
### 🔌 3RD PARTY INTEGRATIONS
### ═══════════════════════════════════════

---

## T-104 | P1 | [BACKEND] | Telegram bot — Owner alert va commands
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/bot/`
- **Vazifa:**
  - grammY framework setup
  - Commands: `/sales` (bugungi savdo), `/stock <barcode>` (stock check), `/debt <phone>` (qarz check), `/shift` (smena status), `/report` (kunlik hisobot)
  - Auto-alerts: low stock, expiry, large refund, system error, shift close report
  - Multi-tenant: bot tenant ga bog'lanadi (setup via web panel)
  - Message templates: O'zbek tilida
- **Kutilgan:** Do'kon egasi Telegram dan barcha ma'lumotni oladi

---

## T-105 | P1 | [BACKEND] | CBU exchange rate — Kunlik USD/UZS kurs
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/common/currency/`
- **Vazifa:**
  - Daily cron: https://cbu.uz/oz/arkhiv-kursov-valyut/json/ dan kurs olish
  - `exchange_rates` jadvali: date, currency_pair, rate, source
  - Fallback: API fail → oxirgi cached kurs ishlatiladi
  - GET /exchange-rates/current — hozirgi kurs
  - Product cost convert: USD cost × today rate = UZS cost
- **Kutilgan:** Import kosmetika narxi avtomatik UZS ga convert

---


## T-107 | P2 | [BACKEND] | Payme/Click integration — Online to'lov
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/payments/providers/`
- **Vazifa:**
  - Payme API adapter: createTransaction, performTransaction, checkTransaction
  - Click API adapter: prepare, complete
  - Webhook handler: payment confirmation callback
  - POS da: QR code ko'rsatish → customer telefondan to'laydi
  - Subscription billing ham Payme/Click orqali
- **Kutilgan:** Online to'lov usullari ishlaydi

---

### ═══════════════════════════════════════
### 💰 SUBSCRIPTION & BILLING (SaaS Model)
### ═══════════════════════════════════════

---

## T-108 | P1 | [BACKEND] | Subscription plans — SaaS billing
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/billing/`
- **Vazifa:**
  - `subscription_plans` jadvali: id, name, price_monthly, max_branches, max_products, max_users, features (JSON)
  - `tenant_subscriptions` jadvali: id, tenant_id, plan_id, status (TRIAL/ACTIVE/PAST_DUE/CANCELLED), started_at, expires_at, trial_ends_at
  - Plans: Free trial (14 kun) → Basic (1 filial, 1000 product, 2 user) → Pro (5 filial, unlimited, 10 user) → Enterprise
  - Usage limit middleware: product/user/branch count check
  - Grace period: to'lov fail → 3 kun (read-only mode)
- **Kutilgan:** SaaS subscription tizimi ishlaydi

---

## T-109 | P2 | [FRONTEND] | Billing UI — Plan tanlash, to'lov
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/pages/Settings/Billing/`
- **Vazifa:**
  - Current plan info, usage stats (products used / limit)
  - Plan comparison table
  - Upgrade/downgrade flow
  - Invoice history, PDF download
  - Payment method management
- **Kutilgan:** Tenant o'z subscriptionni boshqarsa bo'ladi

---

### ═══════════════════════════════════════
### 🔧 HARDWARE INTEGRATION
### ═══════════════════════════════════════

---

---

## T-112 | P2 | [FRONTEND] | Label printer — Narx etiketka
- **Sana:** 2026-02-26
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/print/`
- **Vazifa:**
  - Product label: name, barcode, price, expiry
  - Label sizes: 30x20mm, 40x30mm, 58x40mm
  - Batch print: selected products uchun
  - Printers: Zebra, TSC, XPrinter label
- **Kutilgan:** Narx etikekasi chop etsa bo'ladi

---

### ═══════════════════════════════════════
### 🏪 MULTI-BRANCH (Filiallar)
### ═══════════════════════════════════════

---

## T-113 | P1 | [BACKEND] | Branch management — Full CRUD + permissions
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/identity/`
- **Vazifa:**
  - Branch CRUD: GET/POST/PATCH/DELETE /branches
  - User-branch assignment: user faqat belgilangan branch(lar) ga access
  - Branch-level data isolation: orders, stock, shifts — branch_id filter
  - Default branch per user
- **Kutilgan:** Filiallar tizimi ishlaydi

---

## T-114 | P1 | [BACKEND] | Inter-branch stock transfer
- **Sana:** 2026-02-26
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/inventory/`
- **Vazifa:**
  - `stock_transfers` jadvali: id, tenant_id, from_branch, to_branch, status (REQUESTED/APPROVED/SHIPPED/RECEIVED/CANCELLED), items, requested_by, approved_by, notes, created_at
  - Workflow: Request → Approve → Ship → Receive
  - Stock: OUT from source, IN to destination
  - In-transit stock tracking
- **Kutilgan:** Filiallar orasida tovar ko'chirsa bo'ladi

---

---

### ═══════════════════════════════════════
### P3 — KELAJAK (6+ oy)
### ═══════════════════════════════════════

---

## T-116 | P3 | [BACKEND] | Customer loyalty — Points + tiers
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Earn points (1 point/1000 UZS). Tiers: Bronze/Silver/Gold. Birthday bonus. Redeem as payment.

## T-118 | P3 | [BACKEND] | 1C export — Buxgalteriya integratsiya
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Savdo/xarid datalarini 1C-compatible formatda export (XML). O'zbekistonda ko'p buxgalterlar 1C ishlatadi.

## T-119 | P3 | [BACKEND] | Marketplace sync — Uzum/Sello
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Online sotish: catalog sync, stock sync, order import. Omnichannel.

## T-120 | P3 | [BACKEND] | AI forecasting — Seasonal demand prediction
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Kosmetika seasonal: sunscreen (yoz), moisturizer (qish), gift sets (8-Mart, Yangi yil). O'tgan yil datasi bo'yicha buyurtma tavsiya.

## T-121 | P3 | [BACKEND] | Google Sheets export — Automated daily data
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Scheduled: kunlik savdo data → linked Google Sheet. Ko'p do'kon egalari Sheets da tahlil qiladi.

## T-122 | P3 | [FRONTEND] | Custom report builder — Ad-hoc hisobotlar
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Dimension (product, category, date, branch, cashier) + metrics (revenue, qty, margin) tanlash → custom report. Excel export.

## T-123 | P3 | [FRONTEND] | Weight scale integration — Gramm bilan sotish
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** USB/Serial tarozi → og'irlik o'qish → narx hisoblash. Kamdan-kam kosmetika uchun (aralash do'konlar).

## T-124 | P3 | [IKKALASI] | Feature flags — Per-tenant feature toggle
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** `feature_flags` jadvali. Admin paneldan enable/disable: loyalty, multi-branch, fiscal, promotions. Gradual rollout.

---

## 📊 STATISTIKA

| Umumiy | P0 | P1 | P2 | P3 |
|--------|----|----|----|----|
| **114** | **28** | **52** | **14** | **20** |

### MVP (T-011 — T-049): 39 task
### Production Features (T-050 — T-124): 75 task

---

### Kategoriya bo'yicha

| Kategoriya | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| [BACKEND] | 18 | 32 | 8 | 7 | **65** |
| [FRONTEND] | 7 | 11 | 3 | 4 | **25** |
| [MOBILE] | — | 3 | 1 | — | **4** |
| [DEVOPS] | 2 | 2 | — | — | **4** |
| [IKKALASI] | 3 | 3 | — | 2 | **8** |
| [SECURITY] | — | — | — | — | **(guards ichida)** |

---

### Mas'uliyat taqsimoti

| Dasturchi | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| **Polat** (Backend & DevOps) | 18 | 37 | 7 | — | **62** |
| **AbdulazizYormatov** (Frontend) | 9 | 16 | 3 | — | **28** |
| **Ibrat + Abdulaziz** (Mobile) | — | 3 | 1 | — | **4** |
| **Birgalikda** | 3 | 3 | — | — | **6** |
| **Belgilanmagan** | — | — | 3 | 20 | **23** |

> ➕ T-125..T-138 qo'shildi (2026-03-12): Owner Panel — 8 ta [FRONTEND] + 4 ta [BACKEND] task. Mas'ul: AbdulazizYormatov (frontend), Polat (backend).

---

### ⚠️ TOPILGAN KRITIK KAMCHILIKLAR

```
1. NASIYA YO'Q EDI — O'zbekiston bozoridagi eng muhim funksiya (T-050—T-054)
2. CUSTOMER CRM YO'Q — nasiya va loyalty uchun zarur (T-050)
3. OFFLINE SYNC BO'SH — packages/sync-engine hozir export {} (T-062—T-066)
4. FRONTEND 0% — faqat default Next.js sahifa mavjud
5. DOCKER CONFIGS YO'Q — docker/ papka bo'sh (.gitkeep)
6. UZS YAXLITLASH YO'Q — real hayotda tiyin yo'q (T-080)
7. VALYUTA SUPPORT YO'Q — import kosmetika USD da narxlanadi (T-082)
8. SAAS OWNER PANEL YO'Q — founder monitoring (T-055—T-061)
```

---

### 🏆 TAVSIYA ETILGAN SPRINT TARTIBI

```
Sprint 1 (Hafta 1-2):  Prisma schema HAMMA jadvali + Catalog + Customer + Nasiya
Sprint 2 (Hafta 2-3):  Sales + Shifts + Payments — asosiy savdo loop
Sprint 3 (Hafta 3-4):  Inventory + Nasiya payments + Ledger — pul oqimi
Sprint 4 (Hafta 4-5):  Frontend POS + Receipt + Shift UI — minimal UI
Sprint 5 (Hafta 5-6):  Offline sync + IndexedDB + Outbox — real do'konga deploy
Sprint 6 (Hafta 6-7):  Reports + Audit + Expiry + Security — ishonchlilik
Sprint 7 (Hafta 7-8):  SaaS Dashboard + Subscription + Monitoring + Deploy
Sprint 8 (Hafta 8+):   Mobile app + Telegram bot + Analytics + Polish
```

---

*docs/Tasks.md | RAOS Kosmetika POS — Full Production v2.0 | 2026-02-26*

---

### ═══════════════════════════════════════
### 🏠 OWNER PANEL — /owner/* (Admin Panel ichida)
### Mas'ul: AbdulazizYormatov
### Fayl: CLAUDE_FRONTEND_OWNER.md
### ═══════════════════════════════════════

---

## T-125 | P1 | [FRONTEND] | Owner Panel — Layout, Sidebar, Store
- **Sana:** 2026-03-12
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/app/(admin)/owner/layout.tsx`, `components/layout/OwnerSidebar.tsx`, `store/owner.store.ts`
- **Vazifa:**
  - `/owner/*` route group uchun alohida layout (admin layoutdan farqli — dark sidebar yoki accent rang)
  - `OwnerSidebar.tsx` — 8 ta navigation item: Dashboard, Analytics, Inventory, Debts, Shifts, Employees, Alerts, System
  - `owner.store.ts` — Zustand: `selectedBranch`, `dateRange`, `sidebarOpen`
  - Redirect: `/owner` → `/owner/dashboard`
- **Kutilgan:** Owner panel navigation ishlaydi, har sahifaga o'tish mumkin

---

## T-126 | P1 | [FRONTEND] | Owner Dashboard — Revenue cards + Charts
- **Sana:** 2026-03-12
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/app/(admin)/owner/dashboard/page.tsx`
- **Vazifa:**
  - Revenue cards: Today / Week / Month / Year / Total Orders / Avg Order Value
  - Sales Trend Chart (LineChart, last 30 days revenue + daily orders) — Recharts
  - Branch Comparison Chart (BarChart — revenue/orders/avg per branch)
  - Top Products (top 5 — product name, revenue, qty sold)
  - Low Stock Alerts widget (product, branch, qty, reorder level)
  - React Query hooks: `useOwnerDashboard(period)`
- **Kutilgan:** Owner bir qarashda barcha KPI larni ko'radi

---

## T-127 | P1 | [FRONTEND] | Owner Analytics — Revenue + Orders + Product analytics
- **Sana:** 2026-03-12
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/app/(admin)/owner/analytics/page.tsx`
- **Vazifa:**
  - Period filter: Today / Week / Month / Year / Custom Range
  - **Revenue Analytics:** total revenue, growth %, revenue per branch (BarChart), hourly revenue (heatmap yoki bar)
  - **Orders Analytics:** orders volume (LineChart), orders per branch, orders per employee, peak hours
  - **Product Analytics:** top selling, slow selling, dead stock (30+ kun sotilmagan)
  - Branch filter (dropdown — selectedBranch dan)
  - hooks: `useOwnerRevenue(period)`, `useOwnerOrders(period)`, `useOwnerProducts(period)`
- **Kutilgan:** Owner davrlar bo'yicha savdo tahlilini ko'radi

---

## T-128 | P1 | [FRONTEND] | Owner Inventory — Stock monitoring tabs
- **Sana:** 2026-03-12
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/app/(admin)/owner/inventory/page.tsx`
- **Vazifa:**
  - 5 ta tab: All Stock / Low Stock / Out Of Stock / Expiring / Expired
  - Jadval ustunlari: product name, barcode, branch, quantity, stock value, expiry date
  - Low Stock: qty <= reorder_level (sariq rang)
  - Out of Stock: qty = 0 (qizil rang)
  - Expiring: expiry_date <= 30 kun (to'q sariq)
  - Expired: expiry_date < bugun (qizil)
  - Export CSV tugmasi
  - hook: `useOwnerInventory(tab, branch)`
- **Kutilgan:** Owner qaysi mahsulot kam yoki muddati o'tayotganini ko'radi

---

## T-129 | P1 | [FRONTEND] | Owner Debts — Summary + Aging + Customer table
- **Sana:** 2026-03-12
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/app/(admin)/owner/debts/page.tsx`
- **Vazifa:**
  - Summary cards: Total Debt / Overdue Debt / Debtors Count / Average Debt
  - Aging Report (BarChart yoki jadval): 0–30 / 31–60 / 61–90 / 90+ kunlik qarzlar
  - Customer Debt Table: customer name, branch, total debt, last purchase, days overdue
  - Color coding: yashil (current), sariq (0–30), to'q sariq (31–60), qizil (60+)
  - hook: `useOwnerDebts(branch)`
- **Kutilgan:** Owner nasiya holatini to'liq ko'radi

---

## T-130 | P1 | [FRONTEND] | Owner Shifts — Shift monitoring table
- **Sana:** 2026-03-12
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/app/(admin)/owner/shifts/page.tsx`
- **Vazifa:**
  - Shifts jadval: branch, cashier, open time, close time, shift revenue, orders, avg order, refunds, voids, discounts
  - Payment breakdown per shift: Cash / Terminal / Click / Payme
  - Date range filter
  - Shift detail modal/drawer: itemized summary
  - hook: `useOwnerShifts(dateRange, branch)`
- **Kutilgan:** Owner har smenaning moliyaviy ko'rsatkichlarini ko'radi

---

## T-131 | P1 | [FRONTEND] | Owner Employees — Performance + Suspicious activity
- **Sana:** 2026-03-12
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/app/(admin)/owner/employees/page.tsx`
- **Vazifa:**
  - Employee Performance Table: orders, revenue, avg order, refund rate, void rate, discount rate
  - Suspicious Activity List: excessive voids, rapid refunds, large discounts (sariq/qizil badge)
  - Period filter
  - Employee detail expandable row
  - hook: `useOwnerEmployees(period, branch)`
- **Kutilgan:** Owner xodimlar faoliyatini nazorat qiladi, firibgarlikni aniqlaydi

---

## T-132 | P1 | [FRONTEND] | Owner Alerts — Alert management
- **Sana:** 2026-03-12
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/app/(admin)/owner/alerts/page.tsx`
- **Vazifa:**
  - Alert types: LOW_STOCK / OUT_OF_STOCK / EXPIRY_WARNING / SUSPICIOUS_ACTIVITY / LARGE_REFUND / NASIYA_OVERDUE / SYSTEM_ERROR
  - Priority badges: LOW (ko'k) / MEDIUM (sariq) / HIGH (qizil)
  - Filter: type, priority, branch, date
  - Mark as read / Dismiss
  - Bell icon badge (unread count) — Header da
  - hook: `useOwnerAlerts(filters)`, `useMarkAlertRead()`
- **Kutilgan:** Owner muhim ogohlantirishlarni ko'rib ularga munosabat bildiradi

---

## T-133 | P1 | [FRONTEND] | Owner System Health — API + DB + Worker + POS sync
- **Sana:** 2026-03-12
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/app/(admin)/owner/system/page.tsx`
- **Vazifa:**
  - Service status cards: API server / Database / Worker queue / POS sync (Healthy / Degraded / Error)
  - Recent Errors log jadval: timestamp, service, message, stack (collapsible)
  - POS Sync Status list: branch, last sync, pending count, status
  - Auto-refresh (30s interval)
  - hook: `useSystemHealth()`, `useSystemErrors()`
- **Kutilgan:** Owner tizim salomatligini real-time ko'radi

---

## T-134 | P1 | [BACKEND] | Owner Dashboard API — Revenue metrics by period
- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/analytics/owner/`
- **Vazifa:**
  - GET /owner/dashboard?period=today|week|month|year — revenue cards + trend + top products + low stock
  - GET /owner/analytics/revenue?period=...&branch=... — detailed revenue breakdown
  - GET /owner/analytics/orders?period=...&branch=... — orders analytics + peak hours
  - GET /owner/analytics/products?period=...&branch=... — top/slow/dead stock products
  - Tenant-scoped: faqat o'z tenant ma'lumotlari
- **Kutilgan:** Frontend Owner Dashboard va Analytics sahifalariga data keladi

---

## T-135 | P1 | [BACKEND] | Owner Employees API — Performance + Suspicious activity
- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/analytics/owner/`
- **Vazifa:**
  - GET /owner/employees?period=...&branch=... — per-cashier: orders, revenue, avg_order, refund_rate, void_rate, discount_rate
  - GET /owner/employees/suspicious — employees with suspicious patterns (3+ voids/hour, refund > 20%, discount > threshold)
  - GET /owner/shifts?from=...&to=...&branch=... — shift list with financial breakdown
- **Kutilgan:** Frontend Employees va Shifts sahifalariga data

---

## T-136 | P1 | [BACKEND] | Owner Alerts API — Alert CRUD
- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/alerts/`
- **Vazifa:**
  - `alerts` jadvali: id, tenant_id, type, priority, message, metadata (JSON), is_read, created_at
  - GET /owner/alerts?type=...&priority=...&branch=...&page=...
  - PATCH /owner/alerts/:id/read — mark as read
  - DELETE /owner/alerts/:id — dismiss
  - GET /owner/alerts/unread-count — badge uchun
  - Auto-generate alerts: low stock cron, expiry cron, suspicious activity trigger
- **Kutilgan:** Frontend Alerts sahifasi + Header badge

---

## T-137 | P1 | [BACKEND] | Owner System Health API — Service status
- **Sana:** 2026-03-12
- **Mas'ul:** Polat
- **Fayl:** `apps/api/src/health/`
- **Vazifa:**
  - GET /owner/system/health — API, DB, Worker, Redis status (ping-based)
  - GET /owner/system/errors?from=...&limit=... — recent errors from error log
  - GET /owner/system/pos-sync — per-branch POS sync status (last_sync, pending_count)
- **Kutilgan:** Frontend System Health sahifasi

---

## T-138 | P1 | [FRONTEND] | Owner API files — employees.api.ts, alerts.api.ts, system.api.ts
- **Sana:** 2026-03-12
- **Mas'ul:** AbdulazizYormatov
- **Fayl:** `apps/web/src/api/employees.api.ts`, `alerts.api.ts`, `system.api.ts`
- **Vazifa:**
  - `employees.api.ts` — getPerformance(period, branch), getSuspicious()
  - `alerts.api.ts` — getAlerts(filters), getUnreadCount(), markRead(id), dismiss(id)
  - `system.api.ts` — getHealth(), getErrors(params), getPosSyncStatus()
  - Hooks: `hooks/owner/useOwnerDashboard.ts`, `useOwnerAnalytics.ts`, `useOwnerInventory.ts`, `useOwnerDebts.ts`, `useOwnerShifts.ts`, `useOwnerEmployees.ts`, `useOwnerAlerts.ts`, `useSystemHealth.ts`
- **Kutilgan:** Barcha owner panel hooklari backend bilan ulangan
>>>>>>> Stashed changes
