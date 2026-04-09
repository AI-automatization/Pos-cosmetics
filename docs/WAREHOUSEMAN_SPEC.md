# WAREHOUSEMAN TIZIMI — Mobile Spec

**Sana:** 2026-03-24
**Yozdi:** Bekzod (Architector) + Claude
**Uchun:** Abdulaziz (Mobile iOS), Ibrat (Mobile Android)
**Branch:** `ibrat/feat-mobile-app` ustiga ishlash

---

## 1. ROLE-BASED ROUTING TIZIMI

### Hozirgi holat

Hozir mobile app da `RootNavigator.tsx` faqat `isAuthenticated` tekshiradi. QAYSI role login qilgan bo'lsa ham — bir xil 5 tab ko'rinadi. Bu NOTO'G'RI.

### Yangi tizim

Login qilingandan keyin `GET /auth/me` dan `user.role` qaytadi. Shu role ga qarab boshqa-boshqa navigator ko'rsatiladi:

```
LOGIN → GET /auth/me → user.role = ?
         │
    ┌────┴──────────────┐
    │                   │
  CASHIER            WAREHOUSEMAN
  (Sotuvchi)         (Omborchi)
    │                   │
    ▼                   ▼
  SellerTabNavigator   WarehouseTabNavigator
  (hozirgi 5 tab)     (yangi 4 tab)
    │                   │
    │                   ├── Ombor (stock ro'yxat)
    │                   ├── Yuknomalar (kirim)
    │                   ├── Katalog (kategoriya, product, supplier)
    │                   └── Sozlamalar
    │
    ├── Dashboard
    ├── Sales
    ├── Nasiya
    ├── Inventory
    └── RealEstate
```

### RootNavigator.tsx da o'zgartirish

```typescript
// auth.store.ts dan user.role olish
const { isAuthenticated, user } = useAuthStore();

// Authenticated bo'lgandan keyin:
if (user?.role === 'CASHIER') {
  return <SellerTabNavigator />;     // hozirgi TabNavigator
}
if (user?.role === 'WAREHOUSEMAN') {
  return <WarehouseTabNavigator />;  // YANGI
}
// Boshqa rollar (OWNER, ADMIN, MANAGER, VIEWER):
// "Bu ilova faqat sotuvchi va omborchi uchun" xabar ko'rsatish
// yoki OWNER uchun hozirgi dashboard (qaror Bekzod da)
```

### Navigation Types (yangi)

```typescript
// navigation/types.ts ga qo'shish:

export type WarehouseTabParamList = {
  Stock: undefined;
  GoodsReceipts: undefined;
  Catalog: undefined;
  Settings: undefined;
};

export type StockStackParamList = {
  StockLevels: undefined;
  StockDetail: { productId: string; productName: string };
};

export type GoodsReceiptStackParamList = {
  ReceiptList: undefined;
  ReceiptCreate: undefined;
  ReceiptDetail: { receiptId: string; receiptNumber: string };
};

export type CatalogStackParamList = {
  CatalogHome: undefined;
  Categories: undefined;
  CategoryCreate: undefined;
  Products: undefined;
  ProductCreate: undefined;
  ProductDetail: { productId: string };
  Suppliers: undefined;
  SupplierCreate: undefined;
  SupplierDetail: { supplierId: string };
};
```

---

## 2. BACKEND — UserRole ENUM O'ZGARISHI

Prisma schema ga `WAREHOUSEMAN` qo'shiladi:

```prisma
enum UserRole {
  OWNER
  ADMIN
  MANAGER
  CASHIER        // Sotuvchi (Seller)
  WAREHOUSEMAN   // Omborchi — YANGI
  VIEWER
}
```

Shared types ham yangilanadi: `packages/types/src/auth.ts`

> **MUHIM:** Migration backend jamoasi (Polat) tomonidan qilinadi. Mobile bu role ni faqat o'qiydi.

---

## 3. O'LCHOV BIRLIKLARI (UNITS) — TO'LIQ RO'YXAT

Seed data sifatida backend ga qo'shiladi. Mobile da `GET /catalog/units` orqali olinadi.

| # | name | shortName | allowDecimal | Izoh |
|---|------|-----------|-------------|------|
| 1 | Dona | dona | false | Butun son: 1, 2, 3 |
| 2 | Kilogramm | kg | true | Kasr: 0.5, 1.350 |
| 3 | Gramm | gr | true | 100gr, 250gr |
| 4 | Litr | l | true | 0.5l, 1.5l |
| 5 | Millilitr | ml | true | 50ml, 100ml, 250ml |
| 6 | Metr | m | true | 1.5m, 2.3m |
| 7 | Santimetr | sm | true | Mato, lenta |
| 8 | Quti | quti | false | Korobka, karobka |
| 9 | Pachka | pachka | false | Sigaret, salfetka |
| 10 | Blok | blok | false | Sigaret bloki |
| 11 | Juft | juft | false | Oyoq kiyim |
| 12 | Komplekt | kompl | false | To'plam, nabor |
| 13 | Butilka | but | false | Ichimlik |
| 14 | Banka | banka | false | Konserva |
| 15 | Tubik | tubik | false | Krem, pasta (kosmetika) |
| 16 | Rulon | rulon | false | Tualat qog'oz, skotch |
| 17 | Dasta | dasta | false | Gul, sabzavot bog'lam |
| 18 | Meshok | meshok | false | Un, guruch |
| 19 | Tonna | t | true | Katta ulgurji |
| 20 | Karobka | kor | false | Yetkazib berish qutisi |

### Backend o'zgarish: Unit modelga `allowDecimal` field qo'shiladi

```prisma
model Unit {
  id           String   @id @default(uuid())
  tenantId     String   @map("tenant_id")
  name         String
  shortName    String   @map("short_name")
  allowDecimal Boolean  @default(false) @map("allow_decimal") // ← YANGI
  createdAt    DateTime @default(now()) @map("created_at")
  // ...
}
```

### Mobile da foydalanish

- Product create formada unit select → `GET /catalog/units`
- Agar unit.allowDecimal = false → quantity input faqat butun son
- Agar unit.allowDecimal = true → quantity input kasr ruxsat (0.001 gacha)
- Form pastida [+ Yangi birlik] tugmasi → inline modal (name, shortName, allowDecimal toggle)

---

## 4. VALYUTALAR

Backend da `costCurrency` field bor. Qo'shimcha valyutalar qo'shiladi:

| Valyuta | Kod | Belgisi |
|---------|-----|---------|
| O'zbek so'mi | UZS | so'm |
| AQSH dollari | USD | $ |
| Rossiya rubli | RUB | ₽ |
| Xitoy yuani | CNY | ¥ |

### Mobile da

- Product create va yuknomada: kelish narxi yonida valyuta select `[ UZS ▼ ]`
- Sotish narxi — har doim **UZS** da (mijozga UZS da sotiladi)
- Agar kelish narxi USD/RUB/CNY da → kurs bo'yicha UZS ekvivalentini ko'rsatish (informatsion)
- Kurs: `GET /currency/rates` (backend da ExchangeRate modeli bor, CBU dan olinadi)

---

## 5. PRODUCT CREATE — TO'LIQ FORMA SPEK

### Ekran: `ProductCreateScreen`

```
┌─────────────────────────────────────────────────────────┐
│  ← Orqaga              YANGI MAHSULOT                   │
│                                                          │
│  ── Asosiy ma'lumotlar ──                                │
│                                                          │
│  Kategoriya*         [ Telefonlar          ▼ ]           │
│                      (GET /catalog/categories)           │
│                      [+ Yangi kategoriya]                │
│                                                          │
│  Nomi*               [ Samsung Galaxy S24 Ultra ]        │
│                                                          │
│  SKU                 [ SAM-S24U-256 ]                    │
│                      placeholder: "Avtomatik yoki o'zi"  │
│                                                          │
│  O'lchov birligi*    [ dona              ▼ ]             │
│                      (GET /catalog/units)                │
│                      [+ Yangi birlik]                    │
│                                                          │
│  Tavsif              [ _________________________ ]       │
│                      (ixtiyoriy, multiline)              │
│                                                          │
│  ── Barcode(lar) ──                                      │
│                                                          │
│  ┌──────────────────────────────────┐                    │
│  │ 📷  8901234567890   [Asosiy ✓]  🗑 │                  │
│  │     8901234567891   [      ]    🗑 │                  │
│  └──────────────────────────────────┘                    │
│  [+ Barcode qo'shish]                                   │
│     → Kamera scan YOKI qo'lda kiritish                  │
│     → Scan/kiritish paytida DARHOL duplicate tekshiruv:  │
│       GET /catalog/products/barcode/:code                │
│       404 = OK (yangi)                                   │
│       200 = OGOHLANTIRISH: "Bu barcode [Product X] da!" │
│                                                          │
│  ── Narxlar ──                                           │
│                                                          │
│  Kelish narxi*       [ 8,000,000 ]  [ UZS ▼ ]           │
│                      Valyuta: UZS | USD | RUB | CNY      │
│                      (USD bo'lsa: ≈ 98,400,000 UZS)     │
│                                                          │
│  Sotish narxi*       (Kiritish usuli tanlash:)           │
│    ◉ Summa:          [ 10,000,000 ]  UZS                │
│    ○ Foiz ustama:    [ 25 ] % = 10,000,000 UZS          │
│                      (auto-hisob ko'rsatiladi)           │
│                                                          │
│  ── Variantlar (ixtiyoriy) ──                            │
│                                                          │
│  [+ Variant qo'shish]                                   │
│  ┌────────────────────────────────────────────┐          │
│  │  Variant 1:                                │          │
│  │  Nomi:      [ 128GB Qora    ]              │          │
│  │  Barcode:   [ 890123456001  ] [📷]         │          │
│  │  Kelish:    [ 7,500,000     ] UZS          │          │
│  │  Sotish:    [ 9,500,000     ] UZS          │          │
│  │                                   [🗑]     │          │
│  ├────────────────────────────────────────────┤          │
│  │  Variant 2:                                │          │
│  │  Nomi:      [ 256GB Oq      ]              │          │
│  │  Barcode:   [ 890123456002  ] [📷]         │          │
│  │  Kelish:    [ 8,000,000     ] UZS          │          │
│  │  Sotish:    [ 10,000,000    ] UZS          │          │
│  │                                   [🗑]     │          │
│  └────────────────────────────────────────────┘          │
│                                                          │
│  ── Qo'shimcha sozlamalar (collapse) ──                  │
│                                                          │
│  Min stock ogohlantirish:  [ 5 ]                         │
│  Yaroqlilik muddati:      [ ☐ Track qilish ]            │
│  Rasm:                     [📷 Rasm qo'shish]           │
│                                                          │
│  ┌──────────────────────────────────────────┐            │
│  │           [  SAQLASH  ]                  │            │
│  └──────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

### API chaqiruvlar ketma-ketligi

```
1. POST /catalog/products
   Body: {
     name, sku?, categoryId, unitId,
     costPrice, costCurrency, sellPrice,
     minStockLevel?, imageUrl?, description?,
     expiryTracking
   }
   → productId qaytadi

2. Har bir barcode uchun (parallel):
   POST /catalog/products/:productId/barcodes  (yoki product create da barcodes[] array)
   Body: { barcode, isPrimary }

3. Har bir variant uchun (parallel):
   POST /catalog/products/:productId/variants
   Body: { name, sku?, barcode?, costPrice, costCurrency, sellPrice }
```

> **Optimalroq:** Backend bitta `POST /catalog/products` da barcodes[] va variants[] ham qabul qilsa — bitta request yetarli. Backend jamoasi bilan kelishish kerak.

---

## 6. KATEGORIYA YARATISH

### Ekran: `CategoryCreateScreen`

```
┌──────────────────────────────────────┐
│  ← Orqaga     YANGI KATEGORIYA       │
│                                      │
│  Nomi*:       [ Samsung           ]  │
│  Ota kategoriya: [ Telefonlar  ▼  ]  │
│                  (ixtiyoriy, tree)    │
│                  "Asosiy" = top-level │
│                                      │
│  [  SAQLASH  ]                       │
└──────────────────────────────────────┘
```

**API:** `POST /catalog/categories` → `{ name, parentId? }`

Backend da hierarchical category bor (parent → children). Masalan:
```
Elektronika
  ├── Telefonlar
  │   ├── Samsung
  │   └── iPhone
  └── Aksessuarlar
Kosmetika
  ├── Yuz kremi
  └── Atir
```

---

## 7. KONTRAGENT (SUPPLIER) VA AGENT

### Hozirgi Supplier modeli (backend)

```
Supplier: { id, tenantId, name, phone, company, address, isActive }
```

### Kerak bo'lgan o'zgarish

Supplier da **agent** (aloqa shaxsi / vakil) ma'lumotlari ham bo'lishi kerak. Ikki variant:

**Variant A — Supplier ichida field (sodda, MVP uchun):**
```prisma
model Supplier {
  // ... mavjud fieldlar
  agentName   String?  @map("agent_name")    // Vakil ismi
  agentPhone  String?  @map("agent_phone")   // Vakil telefoni
}
```

**Variant B — Alohida model (ko'p agentli, kelajak uchun):**
```prisma
model SupplierAgent {
  id          String   @id @default(uuid())
  supplierId  String   @map("supplier_id")
  name        String
  phone       String
  position    String?  // "Savdo bo'yicha menejer"
  isPrimary   Boolean  @default(false)
  // ...
}
```

> **Qaror:** Bekzod — MVP uchun Variant A (oddiy). Kelajakda Variant B ga o'tish mumkin.

### Ekran: `SupplierCreateScreen`

```
┌──────────────────────────────────────────┐
│  ← Orqaga     YANGI KONTRAGENT           │
│                                          │
│  ── Kompaniya ──                         │
│  MCHJ nomi*:     [ Samsung Uzb MCHJ  ]  │
│  Telefon:        [ +998 90 123 4567  ]  │
│  Manzil:         [ Toshkent, ...     ]  │
│                  (ixtiyoriy)             │
│                                          │
│  ── Agent (vakil) ──                     │
│  Ismi:           [ Alisher Karimov   ]  │
│  Telefon:        [ +998 91 987 6543  ]  │
│                                          │
│  [  SAQLASH  ]                           │
└──────────────────────────────────────────┘
```

**API:** `POST /catalog/suppliers` → `{ name, phone?, company?, address?, agentName?, agentPhone? }`

---

## 8. KIRIM TIZIMI (YUKNOMA / НАКЛАДНАЯ) — YANGI MODUL

Bu backend da hozir **YO'Q**. To'liq yangi modul yoziladi.

### 8.1 Ma'lumot modeli

```
GoodsReceipt (Yuknoma)
├── id                  UUID
├── tenantId            String (multi-tenant)
├── receiptNumber       String (auto: "YUK-001", "YUK-002", ...)
├── supplierId          String → Supplier (kontragent)
├── warehouseId         String? → Warehouse (agar omborga kirim)
├── branchId            String? → Branch (agar to'g'ridan filialga)
├── receivedById        String → User (kim kirim qildi)
├── date                DateTime (yuknoma sanasi)
├── note                String? (izoh)
├── status              DRAFT | CONFIRMED
├── totalCostAmount     Decimal (jami kelish narxi — auto hisob)
├── totalSellAmount     Decimal (jami sotish narxi — auto hisob)
├── currency            String (UZS | USD | RUB | CNY)
├── createdAt           DateTime
├── updatedAt           DateTime
│
└── GoodsReceiptItem (yuknoma qatorlari)
    ├── id              UUID
    ├── goodsReceiptId  String → GoodsReceipt
    ├── productId       String → Product
    ├── variantId       String? → ProductVariant (agar variant tanlangan bo'lsa)
    ├── quantity         Decimal (soni)
    ├── costPrice       Decimal (kelish narxi — 1 birlik uchun)
    ├── sellPrice       Decimal (sotish narxi — 1 birlik uchun)
    ├── sellPriceMode   FIXED | PERCENT
    ├── sellPricePercent Decimal? (agar PERCENT bo'lsa: 25%)
    ├── totalCost       Decimal (quantity * costPrice — auto)
    ├── totalSell       Decimal (quantity * sellPrice — auto)
    ├── createdAt       DateTime
```

### 8.2 Status lifecycle

```
DRAFT → omborchi tovarlarni kiritayotganda (hali saqlanmagan yoki qoralama)
CONFIRMED → tasdiqlash → stock harakati boshlanadi

DRAFT paytida: tahrirlash, o'chirish mumkin
CONFIRMED bo'lgandan keyin: O'ZGARTIRIB BO'LMAYDI (immutable hujjat)
```

### 8.3 CONFIRM qilinganda backend nima qiladi

```
GoodsReceipt CONFIRMED →
  1. Har item uchun StockMovement yaratiladi:
     - type: IN
     - warehouseId: yuknomadan
     - productId: itemdan
     - quantity: itemdan
     - reference_type: "GOODS_RECEIPT"
     - reference_id: goodsReceiptId

  2. Product.costPrice yangilanadi (oxirgi kelish narxi)

  3. Product.sellPrice yangilanadi (agar berilgan bo'lsa)

  4. ProductSupplier bog'lanadi (agar bog'lanmagan bo'lsa):
     - product ↔ supplier → supplyPrice = costPrice

  5. EventLog: "goods_receipt.confirmed"

  6. Notification: "Yuknoma #YUK-001 tasdiqlandi. 5 ta mahsulot kirim qilindi."
```

### 8.4 Qayerga kirim — ombor yoki filial

```
Omborchi tanlaydi:
  ◉ Omborga (warehouse tanlash)     → stock omborda oshadi
  ○ Filialga (branch tanlash)       → stock filialda oshadi

Agar omborga kirim → keyinchalik StockTransfer orqali filiallarga taqsimlanadi.
Agar filialga kirim → tovar darhol filialda sotishga tayyor.
```

### 8.5 Ekran: Yuknomalar ro'yxati (`ReceiptListScreen`)

```
┌──────────────────────────────────────────────┐
│  YUKNOMALAR                    [+ Yangi]     │
│  ─────────────────────────────────────────    │
│  🔍 Qidiruv...         [Sana filtri ▼]      │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ YUK-003         2026-03-24          │    │
│  │ Samsung Uzb MCHJ    5 ta mahsulot   │    │
│  │ 45,000,000 UZS       ● Tasdiqlangan │    │
│  ├──────────────────────────────────────┤    │
│  │ YUK-002         2026-03-23          │    │
│  │ Apple Uzb MCHJ      3 ta mahsulot   │    │
│  │ 120,000,000 UZS      ● Tasdiqlangan │    │
│  ├──────────────────────────────────────┤    │
│  │ YUK-001         2026-03-22          │    │
│  │ Xiaomi Trade        8 ta mahsulot   │    │
│  │ 28,500,000 UZS       ○ Qoralama    │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

### 8.6 Ekran: Yangi yuknoma yaratish (`ReceiptCreateScreen`)

```
┌──────────────────────────────────────────────────────┐
│  ← Orqaga          YANGI YUKNOMA                     │
│                                                      │
│  ── Umumiy ma'lumot ──                               │
│                                                      │
│  Sana*:          [ 2026-03-24       📅 ]             │
│  Kontragent*:    [ Samsung Uzb MCHJ  ▼ ]             │
│                  (GET /catalog/suppliers)             │
│                  [+ Yangi kontragent]                 │
│                                                      │
│  Qayerga kirim*:                                     │
│    ◉ Omborga:    [ Markaziy ombor    ▼ ]             │
│    ○ Filialga:   [ Chilonzor filial  ▼ ]             │
│                                                      │
│  Valyuta:        [ UZS ▼ ]                           │
│                                                      │
│  ── Mahsulotlar ──                                   │
│                                                      │
│  [+ Mahsulot qo'shish]  [📷 Barcode scan]           │
│                                                      │
│  ┌────────────────────────────────────────────┐      │
│  │ 1. Galaxy S24 Ultra                        │      │
│  │    Soni: [ 50 ]  dona                      │      │
│  │    Kelish: [ 8,000,000 ] UZS               │      │
│  │    Sotish: ◉ [ 10,000,000 ] ○ [ 25 ] %    │      │
│  │    Jami kelish: 400,000,000 UZS       [🗑] │      │
│  ├────────────────────────────────────────────┤      │
│  │ 2. Galaxy Buds3 Pro                        │      │
│  │    Soni: [ 100 ]  dona                     │      │
│  │    Kelish: [ 400,000 ] UZS                 │      │
│  │    Sotish: ◉ [ 550,000 ] ○ [ 37.5 ] %     │      │
│  │    Jami kelish: 40,000,000 UZS        [🗑] │      │
│  └────────────────────────────────────────────┘      │
│                                                      │
│  ── Jami ──                                          │
│  Kelish jami:    440,000,000 UZS                     │
│  Sotish jami:    555,000,000 UZS                     │
│  Foyda (taxmin): 115,000,000 UZS (+26.1%)           │
│                                                      │
│  Izoh:           [ _________________________ ]       │
│                                                      │
│  [ QORALAMA SAQLASH ]     [ TASDIQLASH ✓ ]          │
│  (draft — keyin tahrir)   (confirm — stock o'zgaradi)│
└──────────────────────────────────────────────────────┘
```

### 8.7 Mahsulot qo'shish modal (yuknoma ichida)

```
┌─────────────────────────────────────────┐
│  MAHSULOT TANLASH                 [ ✕ ] │
│                                         │
│  🔍 Nomi yoki barcode...                │
│  [📷 Barcode scan]                      │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Galaxy S24 Ultra     dona         │  │
│  │ Barcode: 890123456789             │  │
│  │ Hozirgi stock: 12 dona            │  │
│  ├───────────────────────────────────┤  │
│  │ Galaxy S24           dona         │  │
│  │ Barcode: 890123456790             │  │
│  │ Hozirgi stock: 8 dona             │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Mahsulot topilmadimi?                  │
│  [+ Yangi mahsulot yaratish]            │
│  (ProductCreate ekraniga o'tadi)        │
└─────────────────────────────────────────┘

Tanlangandan keyin:
┌─────────────────────────────────────────┐
│  Galaxy S24 Ultra                       │
│                                         │
│  Variant: [ Hammasi ▼ ] (agar bor bo'lsa) │
│           [ 128GB Qora ]                │
│           [ 256GB Oq   ]               │
│                                         │
│  Soni*:        [ 50    ]               │
│  Kelish narxi*:[ 8,000,000 ]           │
│  Sotish narxi: ◉ Summa [ 10,000,000 ]  │
│                ○ Foiz  [ 25 ] %         │
│                                         │
│  [ QO'SHISH ]                           │
└─────────────────────────────────────────┘
```

---

## 9. API ENDPOINTLAR — YANGI VA MAVJUD

### Mavjud (backend da bor, mobile ishlatadi):

| Endpoint | Method | Vazifasi |
|----------|--------|---------|
| `/auth/login` | POST | Login |
| `/auth/me` | GET | User profile + role |
| `/auth/refresh` | POST | Token yangilash |
| `/catalog/categories` | GET | Kategoriyalar ro'yxati |
| `/catalog/categories` | POST | Kategoriya yaratish |
| `/catalog/units` | GET | O'lchov birliklari |
| `/catalog/units` | POST | Yangi birlik yaratish |
| `/catalog/products` | GET | Mahsulotlar ro'yxati |
| `/catalog/products` | POST | Mahsulot yaratish |
| `/catalog/products/:id` | GET | Mahsulot detali |
| `/catalog/products/:id` | PATCH | Mahsulot tahrirlash |
| `/catalog/products/barcode/:code` | GET | Barcode bo'yicha qidirish |
| `/catalog/products/:id/variants` | GET | Variantlar |
| `/catalog/products/:id/variants` | POST | Variant yaratish |
| `/catalog/suppliers` | GET | Kontragentlar |
| `/catalog/suppliers` | POST | Kontragent yaratish |
| `/catalog/suppliers/:id` | GET | Kontragent detali |
| `/inventory/levels` | GET | Ombor stock darajasi |
| `/inventory/warehouses` | GET | Omborlar ro'yxati |
| `/branches` | GET | Filiallar ro'yxati |
| `/currency/rates` | GET | Valyuta kurslari |

### YANGI (backend da yozilishi kerak):

| Endpoint | Method | Vazifasi |
|----------|--------|---------|
| `/goods-receipts` | POST | Yuknoma yaratish |
| `/goods-receipts` | GET | Yuknomalr ro'yxati (filter: sana, supplier, status) |
| `/goods-receipts/:id` | GET | Yuknoma detali (items bilan) |
| `/goods-receipts/:id` | PATCH | Qoralama tahrirlash |
| `/goods-receipts/:id/confirm` | PATCH | Tasdiqlash → stock movement trigger |
| `/goods-receipts/:id` | DELETE | Qoralama o'chirish (faqat DRAFT) |

---

## 10. WAREHOUSEMAN TAB NAVIGATOR — BARCHA SCREENLAR

```
WarehouseTabNavigator (4 bottom tab):

📦 Tab 1: OMBOR (Stock)
│
├── StockLevelsScreen
│   - Ombordagi barcha tovarlar ro'yxati
│   - Qidiruv (nomi, barcode)
│   - Filter: kategoriya, low stock
│   - Har bir tovar: nomi, stock soni, unit, last kirim sanasi
│   └── → StockDetailScreen (tap)
│       - Tovar to'liq ma'lumoti
│       - Stock harakatlar tarixi (IN/OUT/TRANSFER)
│       - Qaysi filiallarda qancha bor

📋 Tab 2: YUKNOMALAR (Kirim)
│
├── ReceiptListScreen
│   - Barcha yuknomalr (paginated)
│   - Filter: sana, kontragent, status (draft/confirmed)
│   - Qidiruv: raqam, kontragent nomi
│   └── → ReceiptDetailScreen (tap)
│       - Yuknoma to'liq ma'lumoti
│       - Barcha items ro'yxati
│       - Agar DRAFT → [Tahrirlash] [Tasdiqlash]
│
├── [+ Yangi yuknoma] (FAB button yoki header)
│   └── → ReceiptCreateScreen
│       - Kontragent tanlash
│       - Qayerga (ombor/filial)
│       - Mahsulotlar qo'shish (scan/qidiruv)
│       - Narxlar kiritish
│       - [Qoralama] yoki [Tasdiqlash]

📂 Tab 3: KATALOG
│
├── CatalogHomeScreen (3 ta karta)
│   ├── [Kategoriyalar] → CategoriesScreen
│   │   ├── Kategoriyalar ro'yxati (tree)
│   │   └── [+ Yangi] → CategoryCreateScreen
│   │
│   ├── [Mahsulotlar] → ProductsScreen
│   │   ├── Mahsulotlar ro'yxati (filter: kategoriya, active)
│   │   ├── [+ Yangi] → ProductCreateScreen
│   │   └── Tap → ProductDetailScreen (ko'rish/tahrirlash)
│   │
│   └── [Kontragentlar] → SuppliersScreen
│       ├── Kontragentlar ro'yxati
│       ├── [+ Yangi] → SupplierCreateScreen
│       └── Tap → SupplierDetailScreen

⚙️ Tab 4: SOZLAMALAR
│
├── SettingsScreen
│   ├── Profil
│   ├── Til tanlash
│   └── Chiqish (logout)
```

---

## 11. MUHIM UX QOIDALAR

1. **Barcode scan** — har joyda ishlashi kerak: product create, yuknoma item qo'shish, stock qidirish
2. **Duplicate barcode** — scan/kiritish paytida DARHOL tekshiriladi, ogohlantirish chiqadi
3. **Narx hisob** — foiz kiritilsa → sotish narxi avtomatik hisoblanadi (real-time)
4. **Jami hisob** — yuknomada quantity * price = total avtomatik ko'rsatiladi
5. **Unit validation** — dona = butun son, kg/litr = kasr ruxsat
6. **Offline** — hozircha ONLINE-FIRST. Keyingi fazada offline-queue qo'shiladi
7. **Loading state** — har bir API chaqiruvda skeleton/spinner
8. **Error handling** — network xato → "Internet aloqasi yo'q" xabari + retry
9. **Pull to refresh** — barcha list ekranlar

---

## 12. BACKEND JAMOASIGA (Polat) TASK LAR

Backend tomonida qilinadigan ishlar:

| # | Task | Priority |
|---|------|----------|
| 1 | `WAREHOUSEMAN` → UserRole enum ga qo'shish + migration | P0 |
| 2 | `Unit.allowDecimal` field qo'shish + migration | P1 |
| 3 | Unit seed data (20 ta birlik) | P1 |
| 4 | `Supplier.agentName`, `Supplier.agentPhone` qo'shish | P1 |
| 5 | `costCurrency` enum kengaytirish: UZS, USD, RUB, CNY | P1 |
| 6 | `GoodsReceipt` + `GoodsReceiptItem` modellari yaratish | P0 |
| 7 | `goods-receipts` CRUD + confirm endpoint | P0 |
| 8 | Confirm → StockMovement + Product price update logic | P0 |
| 9 | Confirm → ProductSupplier auto-link | P2 |
| 10 | `POST /catalog/products` — barcodes[], variants[] qabul qilsin (batch) | P1 |

---

## 13. MOBILE JAMOASIGA (Abdulaziz/Ibrat) TASK LAR

| # | Task | Priority |
|---|------|----------|
| 1 | `RootNavigator` — role-based routing (CASHIER vs WAREHOUSEMAN) | P0 |
| 2 | `WarehouseTabNavigator` — 4 tab skeleti | P0 |
| 3 | `StockLevelsScreen` — ombor stock ro'yxati | P1 |
| 4 | `CatalogHomeScreen` — 3 karta (kategoriya, product, supplier) | P1 |
| 5 | `CategoryCreateScreen` | P1 |
| 6 | `ProductCreateScreen` — to'liq forma (barcode, variant, narx) | P0 |
| 7 | `SupplierCreateScreen` — kompaniya + agent | P1 |
| 8 | `ReceiptListScreen` — yuknomalr ro'yxati | P0 |
| 9 | `ReceiptCreateScreen` — yangi yuknoma (item qo'shish, narx, confirm) | P0 |
| 10 | `ReceiptDetailScreen` — yuknoma ko'rish | P1 |
| 11 | Barcode duplicate tekshiruv (scan paytida) | P1 |
| 12 | Narx auto-hisob (foiz → summa) | P1 |
| 13 | Unit validation (allowDecimal) | P2 |
| 14 | Valyuta select + kurs ko'rsatish | P2 |

---

_WAREHOUSEMAN_SPEC.md | RAOS | v1.0 | 2026-03-24_
