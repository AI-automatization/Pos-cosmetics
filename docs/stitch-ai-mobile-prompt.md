# RAOS Mobile App — Stitch AI Full UI Redesign Prompt

## CONTEXT

Design a complete React Native mobile app called **RAOS** (Retail & Asset Operating System) for Uzbekistan retail businesses. This is a **staff + manager app** that covers sales (POS), inventory, debt management, reports, catalog, finance, and settings. All text in **Uzbek language**. Currency: **so'm (UZS)**. Design style: **clean, professional, dark-accent cards on white/light gray backgrounds**, inspired by modern fintech apps.

---

## DESIGN SYSTEM

### Colors
```
Primary:       #2563EB  (blue-600)
PrimaryDark:   #1D4ED8  (blue-700)
PrimaryLight:  #EFF6FF  (blue-50)

Success:       #16A34A  (green-600)
SuccessLight:  #F0FDF4  (green-50)

Warning:       #D97706  (amber-600)
WarningLight:  #FFFBEB  (amber-50)

Danger:        #DC2626  (red-600)
DangerLight:   #FEF2F2  (red-50)

Orange:        #EA580C  (orange-600)
OrangeLight:   #FFF7ED  (orange-50)

Purple:        #7C3AED  (purple-600)
PurpleLight:   #F5F3FF  (purple-50)

Background:    #F9FAFB  (gray-50)
Surface:       #FFFFFF
Border:        #E5E7EB  (gray-200)
BorderFocus:   #2563EB

Text:          #111827  (gray-900)
TextSecondary: #6B7280  (gray-500)
TextMuted:     #9CA3AF  (gray-400)
TextInverse:   #FFFFFF

Header:        #FFFFFF
TabBar:        #FFFFFF
```

### Typography
```
FontFamily: 'Inter' (or system default)

Sizes:
  xs:   11px
  sm:   13px
  base: 15px
  md:   16px
  lg:   18px
  xl:   20px
  2xl:  24px
  3xl:  28px

Weights:
  regular:   400
  medium:    500
  semibold:  600
  bold:      700
```

### Spacing System
```
2px, 4px, 6px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px
```

### Border Radius
```
sm: 6px, md: 10px, lg: 14px, xl: 18px, full: 9999px
```

### Common Components (reuse everywhere)

**StatusBadge:**
- Small pill/chip: `paddingHorizontal: 8, paddingVertical: 3, borderRadius: full`
- Colors: green (success), yellow (warning), red (danger), blue (info), gray (neutral)
- Text: 11px, semibold, uppercase
- Optional icon (12px) on left

**StatCard:**
- White card, rounded-lg, shadow-sm, padding 16
- Icon in colored circle (36x36) top-left
- Title: 12px, gray-500, uppercase
- Value: 22px, bold, gray-900
- Optional trend badge (green/red arrow + %)

**SectionHeader:**
- Row: title left (16px, semibold), optional action right (blue link)

**Divider:** 1px, gray-100

**EmptyState:**
- Centered: large icon (gray-300, 48px), title (gray-500, 16px, semibold), optional description, optional button

**LoadingSpinner:** Centered ActivityIndicator, blue color

**SearchBar:**
- White bg, gray-200 border, rounded-xl, padding 12
- Search icon (gray-400) on left, clear button on right if text

**ActionButton (FAB):**
- Blue, 56x56, rounded-full, shadow-lg, Plus icon white
- Fixed: bottom 24, right 20

**SwipeableRow:**
- Swipe left → red "O'chirish" action
- Swipe right → blue "Tahrirlash" action

**BottomSheet:**
- Modal sheet from bottom, handle bar, rounded-top-24, white bg, max-height 85%

**PriceText:**
- `${formatPrice(amount)} so'm`
- Bold, right-aligned, gray-900

---

## NAVIGATION STRUCTURE

### Auth Stack (unauthenticated)
```
LoginScreen
BiometricScreen
OnboardingScreen
```

### Main App (authenticated) — Bottom Tab Navigator

**Tab 1: Bosh sahifa** (Dashboard) — House icon
**Tab 2: Savdo** (Sales/POS) — ShoppingCart icon
**Tab 3: Katalog** (Catalog) — Grid icon ← NEW
**Tab 4: Moliya** (Finance) — TrendingUp icon ← NEW
**Tab 5: Ko'proq** (More) — Menu/Grid icon

Bottom tab style:
- White bg, top border gray-100
- Active: blue icon + blue label (12px, semibold)
- Inactive: gray-400 icon + gray-400 label
- Tab bar height: 60px + safe area

### Stack Navigators inside tabs:

**Dashboard Stack:**
- DashboardScreen (main)

**Savdo Stack:**
- SavdoScreen (POS main)
- SmenaScreen (Shift management)
- SalesHistoryScreen (Orders list)
- SaleDetailScreen (Order detail)
- ReturnScreen (Process return) ← NEW
- NasiyaListScreen (Debt list)
- NasiyaDetailScreen (Debt detail)

**Katalog Stack:** ← ALL NEW
- ProductsScreen (Product list)
- ProductDetailScreen (Product detail/edit)
- ProductFormScreen (Create/edit product)
- CategoriesScreen (Categories list/tree)
- SuppliersScreen (Suppliers list)

**Moliya Stack:** ← ALL NEW
- FinanceScreen (Finance hub)
- PnLScreen (Profit & Loss)
- ExpensesScreen (Expenses)
- PaymentsHistoryScreen (Payment transactions)
- ReportsHubScreen (Reports index)
- DailyRevenueScreen (Daily chart)
- TopProductsScreen (Top products)
- ShiftReportsScreen (Shift history)
- NasiyaAgingScreen (Debt aging)

**Ko'proq Stack:**
- MoreMenuScreen (hub)
- OmborScreen (Warehouse/Inventory)
- KirimScreen (Stock receipts)
- ScannerScreen (Barcode scanner)
- RealEstateScreen (Property list)
- RealEstateDetailScreen (Property detail)
- AIInsightsScreen (Analytics)
- AlertsScreen (Notifications)
- SettingsScreen (Settings hub)
- UsersScreen (User management) ← NEW
- BranchesScreen (Branch management) ← NEW
- AuditLogScreen (Audit trail) ← NEW
- ProfileScreen (My profile)

---

## SCREEN DESIGNS

---

### AUTH SCREENS

---

#### 1. LoginScreen

**Layout:** Full screen, white bg, centered content, safe area padding

**Top Section (illustration/logo):**
- App icon/logo (80x80, blue bg, rounded-2xl, white "R" letter or logo)
- App name: "RAOS" (28px, bold, gray-900)
- Subtitle: "Biznesingizni boshqaring" (15px, gray-500)

**Form Section (marginTop: 48):**
- **Label:** "Telefon raqam" (13px, semibold, gray-700)
- **Input:** Phone number, `+998` prefix inside, `XXXXXXXXX` mask, keyboardType: phone-pad
  - Border: gray-200, borderRadius: 10, padding: 14, 16px text
  - Focus: blue border + blue ring shadow
- **Label:** "Parol" (13px, semibold, gray-700)
- **Input:** Password, eye icon toggle on right, secureTextEntry
- **"Kirish" Button:**
  - Blue bg (#2563EB), full width, height: 52, borderRadius: 12
  - Text: "Kirish" (16px, bold, white)
  - Loading: ActivityIndicator replacing text

**Bottom:** Version text (gray-400, 12px, centered, marginTop: 40)

---

#### 2. BiometricScreen

**Layout:** Centered, white bg

**Icon:** Large fingerprint/face icon (80x80, blue)
**Title:** "Biometrik kirish" (22px, bold)
**Subtitle:** "Barmoq izingiz yoki yuz identifikatsiyangizdan foydalaning" (gray-500, center, 15px)

**Button:** "Biometrik bilan kirish" (blue, full width, marginTop: 32)
**Link:** "Parol bilan kirish" (blue text, center, marginTop: 16)

---

### DASHBOARD SCREEN

---

#### 3. DashboardScreen

**Header:**
- Left: "Bosh sahifa" (20px, bold)
- Right: Notification bell icon (badge if unread alerts)
- Below header: Date text "9 Aprel, 2026, Payshanba" (13px, gray-500)

**Smena Banner (if shift not open):**
- Orange bg card: "Smena ochilmagan" + "Savdo boshlash uchun smena oching"
- Button: "Smena ochish" (white text, orange border)

**Smena Info (if open):**
- Blue-50 bg card, left blue border
- Row: "Smena №S-0042" (13px, gray-600) | "08:30 dan" | "Kassir: Alisher"

**Stat Cards Grid (2x2):**

Card 1 — Bugungi tushum:
- Icon: TrendingUp (blue circle bg)
- Title: "Bugungi tushum"
- Value: "12,450,000 so'm" (22px, bold)
- Sub: "+8% kechagidan" (green, 12px)

Card 2 — Yalpi foyda:
- Icon: DollarSign (green circle bg)
- Title: "Yalpi foyda"
- Value: "3,120,000 so'm"
- Sub: "25.1% marja" (green badge)

Card 3 — O'rtacha chek:
- Icon: Receipt (blue circle bg)
- Title: "O'rtacha chek"
- Value: "87,500 so'm"
- Sub: "143 buyurtma bugun"

Card 4 — Kam zaxira:
- Icon: AlertTriangle (yellow/red circle based on count)
- Title: "Kam zaxira"
- Value: "12 ta mahsulot" (red if >5, yellow if >0, green "Yaxshi" if 0)
- Sub: "3 ta tugagan" (red if exists)
- Tapable → OmborScreen filtered to low stock

**Haftalik daromad (Weekly Revenue Chart):**
- Section header: "Haftalik daromad" + date range
- Bar chart: 7 bars, X-axis: kun nomlari (Dush, Sesh...), Y-axis: formatted amounts
- Active bar: blue, inactive: blue-100
- Tooltip on press: date + amount
- Chart height: 180px

**Foyda tahlili (Profit Breakdown):**
- White card, padding 16
- Section header: "Foyda tahlili"
- Rows with labels and values:
  - "Tushum (daromad)": 12,450,000 so'm (gray-900)
  - "Tannarx (COGS)": 9,330,000 so'm (gray-600)
  - Divider
  - "Yalpi foyda": 3,120,000 so'm (green, bold)
  - Margin badge: "25.1%" (green pill)

**Top mahsulotlar:**
- Section header: "Top mahsulotlar bugun" + "Hammasi" link
- List of 5 items:
  - Left: Rank number (22px, bold, blue) in 32x32 circle
  - Center: Product name (14px, semibold) + category (12px, gray-500)
  - Right: qty text + revenue (14px, semibold)
- Tap → ProductDetailScreen

**Tez harakatlar (Quick Actions):**
- 2x2 grid of action buttons:
  - "Savdo" (ShoppingCart, blue) → SavdoScreen
  - "Kirim" (PackagePlus, green) → KirimScreen
  - "Katalog" (Grid, purple) → ProductsScreen
  - "Hisobot" (BarChart, orange) → ReportsHubScreen

---

### SAVDO (POS) SCREENS

---

#### 4. SavdoScreen (Point of Sale)

**Header:**
- Left: "Savdo" (20px, bold)
- Right: Smena status chip (green "S-0042" or orange "Smena yopiq")
- Tap smena chip → SmenaScreen

**Search Bar:**
- "Mahsulot nomi yoki barcode..." placeholder
- Camera/barcode icon on right → opens scanner
- Clears on X tap

**Category Tabs:**
- Horizontal scroll, pills
- "Barchasi" | "Oziq-ovqat" | "Kosmetika" | "Kiyim" | ...
- Active: blue bg white text, inactive: gray-100 gray-700 text

**Products Grid (2 columns):**
ProductCard:
- White card, border gray-100, borderRadius: 12, shadow-sm
- Product image (aspect 1:1, borderRadius: 8, gray-100 placeholder)
- Name (14px, semibold, 2 lines max)
- Price (16px, bold, blue)
- Stock badge: "42 ta" (green) or "2 ta" (yellow) or "Tugagan" (red, disabled)
- Tap → adds to cart (ripple animation)
- Long press → product detail

**CartBar (bottom floating):**
- Shows when cart has items
- White card, shadow-xl, borderRadius-t: 20, padding 16
- Row: Shopping cart icon + "X ta mahsulot" | "Jami: X so'm" | "To'lash →" blue button
- Tap "To'lash" → slides up PaymentSheet

**PaymentSheet (BottomSheet, 75% height):**

Section: Cart Items (scrollable):
- Each item row:
  - Product name (14px, semibold)
  - Unit price (gray-500, 13px)
  - Qty stepper: [−] [2] [+] (styled buttons)
  - Line total (15px, bold, right)
  - Swipe left to delete

Section: Summary:
- "Jami mahsulotlar": X ta
- "Chegirma": −0 so'm (gray, or green if discount)
- Divider
- "Umumiy summa": X so'm (18px, bold, blue)

Section: To'lov usuli (Payment Methods):
- 4 button row: "Naqd" | "Karta" | "Nasiya" | "Aralash"
- Active: blue bg white text, inactive: white blue border
- Each has icon (Banknote, CreditCard, Clock, Split)

When NAQD selected:
- Input: "Naqd mablag' miqdori" with number keyboard
- Auto-calculate change: "Qaytim: X so'm" (green)

When NASIYA selected:
- Input: "Xaridor ismi" + "Telefon"
- Due date picker: "Muddati" (calendar picker)

When ARALASH selected:
- Two inputs: Naqd + Karta amounts
- Auto-balance remaining

**"Savdoni yakunlash" Button:**
- Blue, full width, height: 54, borderRadius: 14
- Loading state + success animation on confirm
- Shows receipt preview briefly after success

**LowStockWarning (if cart item running low):**
- Yellow banner at top of PaymentSheet
- "Diqqat: [Product] zaxirasi kam — atigi X ta qoldi"

---

#### 5. SmenaScreen (Shift Management)

**Header:** "Smena boshqaruvi" (back arrow if accessed via stack)

**Current Shift Card (if open):**
- Green-50 bg, green left border, borderRadius: 14
- Row 1: "Smena №S-0042" (16px, bold) + green "Ochiq" badge
- Row 2: Clock icon + "Boshlangan: 08:30" | User icon + "Kassir: Alisher"
- Divider
- Stats grid (2x2):
  - "Boshlang'ich naqd": 500,000 so'm
  - "Savdolar soni": 47 ta
  - "Jami tushum": 8,240,000 so'm
  - "Naqd (hozir)": 3,120,000 so'm

**"Smena yopish" Button:** Red, full width

**Shift History List:**
- Section header: "Oxirgi smenalar"
- Each card:
  - Row: Smena № | Date | Duration
  - Row: Kassir nomi | Buyurtmalar soni | Jami tushum
  - Status badge: "Yopiq" (gray)
  - Tap → SmenaDetailSheet

**SmenaOpenSheet (BottomSheet):**
- Title: "Smena ochish"
- Input: "Boshlang'ich naqd pul" (required, number keyboard)
- Info text: "Kassaga solingan boshlang'ich summa"
- Button: "Smena ochish" (green)

**SmenaCloseSheet (BottomSheet):**
- Title: "Smena yopish"
- Summary table:
  - "Naqd savdo": X so'm
  - "Karta savdo": X so'm
  - "Nasiya": X so'm
  - Divider
  - "Umumiy tushum": X so'm (bold)
- Input: "Kassadagi naqd hisob" (actual cash)
- Auto-diff: "Farq: +/- X so'm" (green if OK, red if shortage)
- Note textarea: "Izoh (ixtiyoriy)"
- Button: "Smena yopish" (red)

---

#### 6. SalesHistoryScreen (Orders List)

**Header:** "Buyurtmalar tarixi" (back arrow)

**Filters Row:**
- Status pills: "Barchasi" | "Bajarildi" | "Qaytarildi" | "Bekor qilindi"
- Date filter button (Calendar icon) → date range picker

**Search:** "Buyurtma raqami yoki kassir..."

**Stats Row (3 chips):**
- Total orders count | Total revenue | Avg order value
- Horizontal scroll

**Orders List:**
Each order card (white, shadow-sm, borderRadius: 12, padding: 14):
- Row 1: "№ORD-0847" (14px, monospace, blue) | Status badge | Date (gray-500, 12px)
- Row 2: Kassir icon + name (gray-600, 13px) | Payment method icon + label
- Row 3: Total amount (18px, bold, right) | Items count (gray-500, 13px)

**StatusBadge:**
- COMPLETED: Green "Bajarildi" + CheckCircle icon
- RETURNED: Yellow "Qaytarildi" + RotateCcw icon
- VOIDED: Red "Bekor qilindi" + XCircle icon

**Tap → SaleDetailScreen**

**Pagination:** "Ko'proq yuklash" button at bottom

---

#### 7. SaleDetailScreen (Order Detail)

**Header:** "Buyurtma #ORD-0847" + status badge

**Info Card:**
- Date + time
- Kassir: name
- Smena: number
- Payment: method icon + label

**Items List:**
Each item:
- Product name (14px, semibold)
- Qty × unit price (gray-500, 13px)
- Line total (14px, bold, right)

**Summary Section:**
- Subtotal
- Discount (if any)
- Total (bold, large)
- Payment method breakdown

**Action Buttons (if COMPLETED):**
- "Qaytarish" (Return) → ReturnScreen
- "Chek chop etish" (Print Receipt) → thermal print

---

#### 8. ReturnScreen (Process Return) ← NEW FROM WEB

**Header:** "Qaytarish — #ORD-0847"

**Order Info:**
- Total: X so'm | Date: DD.MM.YYYY

**Items List (selectable):**
Each item:
- Checkbox (blue when selected) on left
- Product name + original qty
- When checked: qty input appears (1 to original qty)
- Line price shows

**Return Reason:**
- Textarea: "Sabab (ixtiyoriy)"

**Return Summary (shows when items selected):**
- "Qaytarish summasi: X so'm" (orange box)

**"Qaytarishni tasdiqlash" Button:**
- Disabled until at least 1 item selected
- Confirmation alert: "Haqiqatan ham qaytarishni amalga oshirasizmi?"

---

### KATALOG SCREENS ← ALL NEW FROM WEB

---

#### 9. ProductsScreen (Products List)

**Header:** "Mahsulotlar" + item count subtitle
**Right action:** Filter icon

**Search + Filter Row:**
- SearchBar: "Nom, SKU yoki barcode..."
- Category dropdown button (filters list)

**Stats Row:**
- "Jami: X ta" | "Faol: Y ta" | "Nofaol: Z ta"

**Product List (FlatList):**
Each ProductCard (white, shadow-sm, borderRadius: 12):
- Left: Product image 60x60 (rounded-10, gray-100 placeholder with image icon)
- Center column:
  - Name (15px, semibold, gray-900)
  - SKU: "NIV-001" (12px, monospace, gray-400)
  - Category (12px, gray-500)
- Right column:
  - Price (15px, bold, blue)
  - StockBadge: "OK" green | "KAM" yellow | "TUGAGAN" red

**FAB:** Plus icon → ProductFormScreen

**Swipe left:** "Tahrirlash" (blue) | "O'chirish" (red)

**Empty state:** Grid icon + "Mahsulotlar yo'q" + "Qo'shish" button

---

#### 10. ProductFormScreen (Create/Edit Product)

**Header:** "Yangi mahsulot" or "Mahsulotni tahrirlash"
**Right action:** "Saqlash" button (blue text)

**Form (scrollable, grouped sections):**

**SECTION: Asosiy ma'lumot**
- Image picker (tap to upload/camera, 100x100, dashed border if empty)
- Name input: "Mahsulot nomi *" (required)
- SKU input: "SKU *" (required, "NIV-001" placeholder)
- Category picker: dropdown → CategoriesScreen sheet
- Description textarea: "Tavsif (ixtiyoriy)" (max 2000 chars)

**SECTION: Narxlar**
- "Kelish narxi *": number input, so'm suffix
- "Sotuv narxi *": number input, so'm suffix
- MarginBadge (auto-calculated): "Marja: 25.1%" (green/yellow/red)

**SECTION: Zaxira**
- "Minimal zaxira": number input, "ta" suffix
- "Joriy zaxira": read-only display (if editing)

**SECTION: Barcode**
- Primary barcode input + camera scan button
- "Qo'shimcha barcode qo'shish" link (add multiple)
- Each extra barcode: input + delete X button

**SECTION: Holat**
- Toggle switch: "Faol / Nofaol"

**Bottom:** "Saqlash" blue button full width, height 52

**Validation errors:** Red text below each invalid field

---

#### 11. CategoriesScreen (Categories)

**Header:** "Kategoriyalar" + count
**Right:** Plus icon → CategoryFormSheet

**Category Tree List:**
- Root categories with expand/collapse chevron
- Sub-categories indented (16px left padding per level)
- Each row: Folder icon | Name | children count (gray badge)
- Swipe left: Edit (blue) | Delete (red)

**CategoryFormSheet (BottomSheet):**
- Title: "Kategoriya qo'shish/tahrirlash"
- Input: "Nomi *" (min 2 chars)
- Picker: "Ota kategoriya (ixtiyoriy)" — shows category list
- Buttons: Cancel + Saqlash

---

#### 12. SuppliersScreen (Suppliers)

**Header:** "Yetkazib beruvchilar" + count
**FAB:** Plus → SupplierFormSheet

**Supplier List:**
Each card (white, shadow-sm, padding 14):
- Left: Building2 icon in blue-50 circle (44x44)
- Center: Name (15px, semibold) | Phone (13px, gray-500) | Company (13px, gray-400)
- Right: Address (12px, gray-400, max 2 lines) | Edit icon

**SupplierFormSheet (BottomSheet):**
- Title: "Yetkazib beruvchi qo'shish/tahrirlash"
- Fields:
  - "Nomi *" (required)
  - "Telefon" (+998XXXXXXXXX format)
  - "Kompaniya" (optional)
  - "Manzil" (optional)
- Buttons: Cancel + Saqlash

**Search:** "Ism yoki kompaniya..."

---

### MOLIYA (FINANCE) SCREENS ← ALL NEW FROM WEB

---

#### 13. FinanceScreen (Finance Hub)

**Header:** "Moliya"

**Period Selector:**
- Horizontal scroll pills: "Bugun" | "7 kun" | "30 kun" | "90 kun" | "1 yil" | "Maxsus"
- Active: blue bg, inactive: white gray border
- "Maxsus" opens date range picker

**Summary Cards Grid (2x2):**

Card 1 — Tushum:
- DollarSign icon (blue circle)
- "Tushum": 48,200,000 so'm (22px bold)
- "+12% o'tgan davrdan" (green trend)

Card 2 — Yalpi foyda:
- TrendingUp icon (green circle)
- "Yalpi foyda": 14,460,000 so'm
- "30% marja" badge (green)

Card 3 — Tannarx (COGS):
- TrendingDown icon (red circle)
- "Tannarx": 33,740,000 so'm

Card 4 — Xarajatlar:
- Wallet icon (orange circle)
- "Xarajatlar": 4,200,000 so'm

**Navigation Cards (2x2 grid):**
Large tappable cards:
- "Foyda & Zarar" (P&L) → PnLScreen
- "Xarajatlar" → ExpensesScreen
- "To'lovlar tarixi" → PaymentsHistoryScreen
- "Hisobotlar" → ReportsHubScreen

---

#### 14. PnLScreen (Profit & Loss)

**Header:** "Foyda va Zarar" (back arrow)

**Period Selector:** Same as FinanceScreen

**KPI Cards (2x2):**
- Tushum (Revenue): blue
- Yalpi foyda (Gross Profit): green/red
- Tannarx/COGS: red
- Sof daromad (Net Income): green/red

**P&L Breakdown Table:**
White card:
- Row format: Label | Amount | — no old/new columns for mobile
- Sections:
  - **Daromad:**  Tushum: X so'm
  - **Xarajatlar:** COGS: X | Operatsion: X
  - Divider
  - **Yalpi foyda:** X so'm (green, bold)
  - **Sof daromad:** X so'm (green/red bold)

**Xarajat taqsimoti (Expense Breakdown):**
- Pie chart (donut style, 160px diameter)
- Legend below: each category color dot + name + amount + percentage
- Categories: Ijara, Kommunal, Maosh, Boshqa

---

#### 15. ExpensesScreen (Expenses)

**Header:** "Xarajatlar" (back arrow)
**Right:** Plus icon → ExpenseFormSheet

**Period Selector:** (same pills)

**Summary Card:**
- "Jami xarajat: X so'm" (large, bold, red)
- Subtitle: "X ta yozuv"

**Category Filter:**
- Horizontal scroll: "Barchasi" | "Ijara" | "Kommunal" | "Maosh" | "Boshqa"

**Expense List:**
Each item (white card, padding 12):
- Left: Category icon in color circle (40x40)
- Center: Description (14px, semibold, gray-900) | Date (12px, gray-500)
- Right: Amount (15px, bold, red) | Payment method icon

**Category color coding:**
- Ijara (Rent): blue
- Kommunal: yellow
- Maosh (Salary): green
- Boshqa (Other): gray

**Swipe left:** Edit (blue) | Delete (red)

**ExpenseFormSheet (BottomSheet, tall):**
- Title: "Xarajat qo'shish/tahrirlash"
- Fields:
  - Date picker: "Sana *" (calendar, default today)
  - Category picker: "Kategoriya *" (Ijara | Kommunal | Maosh | Boshqa)
  - Description: "Tavsif *" (required)
  - Amount: "Miqdor *" (number keyboard, "so'm" suffix)
  - Payment method: radio row: "Naqd" | "Karta" | "O'tkazma"
  - Notes: "Izoh (ixtiyoriy)"
- Buttons: Cancel + "Saqlash"

---

#### 16. PaymentsHistoryScreen (Payment Transactions)

**Header:** "To'lovlar tarixi" (back arrow)

**Search:** "Buyurtma raqami..."

**Period Selector:** (pills)

**Payment Method Filter:**
- Horizontal scroll: "Barchasi" | "Naqd" | "Karta" | "Nasiya" | "Click" | "Payme" | "O'tkazma"

**Payments List:**
Each payment card (white, padding 12):
- Row 1: "#ORD-0847" (monospace, blue) | Date+time (gray-400, 12px)
- Row 2: Xaridor icon + name (gray-600, 13px) | Payment method icon + label (13px)
- Row 3: Amount (18px, bold, right) | Status badge

**Payment Method Icons:**
- Naqd: Banknote (green)
- Karta: CreditCard (blue)
- Nasiya: Clock (orange)
- Click/Payme: Smartphone (purple)
- O'tkazma: ArrowUpRight (blue)

**Pagination:** "Ko'proq" button

---

### REPORTS SCREENS ← NEW FROM WEB

---

#### 17. ReportsHubScreen

**Header:** "Hisobotlar" (back arrow from FinanceScreen or MoreMenu)

**Report Cards (vertical list, large tappable):**

Card 1 — Kunlik savdo:
- Icon: BarChart2 (blue, 32px)
- Title: "Kunlik savdo hisoboti" (16px, semibold)
- Subtitle: "Sana bo'yicha savdo dinamikasi va grafik"
- ChevronRight

Card 2 — Top mahsulotlar:
- Icon: TrendingUp (green, 32px)
- Title: "Top mahsulotlar"
- Subtitle: "Eng ko'p sotilgan mahsulotlar ro'yxati"

Card 3 — Smena hisobotlari:
- Icon: Clock (purple, 32px)
- Title: "Smena hisobotlari"
- Subtitle: "Smenalar bo'yicha savdo va naqd hisobi"

Card 4 — Nasiya qarzdorlik:
- Icon: AlertCircle (orange, 32px)
- Title: "Nasiya qarzdorlik"
- Subtitle: "Qarzdorlik yoshi tahlili"

---

#### 18. DailyRevenueScreen

**Header:** "Kunlik savdo" (back arrow)

**Date Range Selector:**
- Row: "Dan:" date button | "Gacha:" date button
- Quick pills below: "7 kun" | "30 kun" | "90 kun"

**Summary Row (3 stats):**
- "Jami tushum": X so'm
- "Buyurtmalar": X ta
- "O'rtacha/kun": X so'm

**Bar Chart:**
- Height: 220px
- X-axis: dates (DD.MM format), rotated 45° if many
- Y-axis: abbreviated amounts (1.2M, 850K)
- Bars: blue, with blue-100 grid lines
- Tap bar → tooltip with exact date + amount

**Data Table (scrollable):**
- Columns: Sana | Buyurtmalar | Tushum
- Each row: date | count | amount (bold, right)
- Total row (bold, gray-100 bg)

---

#### 19. TopProductsScreen

**Header:** "Top mahsulotlar" (back arrow)

**Period Selector:** (pills)
**View Toggle:** "Ro'yxat" | "Diagramma" (list vs chart)

**List View:**
Each item:
- Rank circle (32x32, blue): 1, 2, 3... (bold)
- Product image (40x40, rounded-8)
- Name + category
- Sold qty (13px, gray-600)
- Revenue (15px, bold, blue, right)

**Chart View:**
- Horizontal bar chart
- Each product: name label left | colored bar | revenue value right
- Top 10 products

---

#### 20. ShiftReportsScreen

**Header:** "Smena hisobotlari" (back arrow)

**Date filter:** (date range picker)

**Smena list:**
Each smena card (white, padding 14):
- Row 1: "Smena #S-0042" (14px, bold, blue) | Date (gray-500, 12px)
- Row 2: User icon + kassir name | Clock icon + duration
- Stats row: Buyurtmalar: X ta | Naqd: X so'm | Karta: X so'm
- Total row: "Jami: X so'm" (bold, right, blue)
- Tap → SmenaDetailSheet

---

#### 21. NasiyaAgingScreen (Debt Aging) ← NEW FROM WEB

**Header:** "Nasiya qarzdorlik" (back arrow)

**Tab Filter:**
- "Barchasi" | "Muddati o'tgan"

**Summary Cards (horizontal scroll, 2-per-view):**
- "Jami nasiya": X so'm (orange)
- "Muddati o'tgan": X so'm (red)
- "Bu oy yig'ilgan": X so'm (green)
- "Nasiya xaridorlar": X ta (blue)

**Search:** "Xaridor ismi..."

**Debt List:**
Each card (white, shadow-sm, borderRadius: 12, padding 14):
- Row 1: Customer name (15px, semibold) | DebtStatusBadge
- Row 2: Phone (13px, gray-500, Phone icon) | Due date (Calendar icon)
- Row 3: "Qolgan qarz": X so'm (16px, bold, red/orange, right)
- "To'lash" button (blue, small, pill shape) on bottom right

**DebtStatusBadge colors:**
- JORIY (Current): Green "Joriy"
- 0-30 kun: Yellow "0–30 kun"
- 31-60 kun: Orange "31–60 kun"
- 61-90 kun: Red "61–90 kun"
- 90+ kun: Dark red bold "90+ kun ⚠"

**QuickPaySheet (BottomSheet):**
- Title: "Qarz to'lash"
- Customer name + order ID
- Orange info box: "Qolgan qarz: X so'm" (large bold)
- Amount input (number keyboard)
- Quick buttons: "50%" | "To'liq"
- Payment method: radio row: "Naqd" | "Karta" | "O'tkazma"
- "✓ X so'm to'lash" button (blue, full width)

---

### OMBOR & KIRIM SCREENS

---

#### 22. OmborScreen (Warehouse/Inventory)

**Header:** "Ombor"
**Right actions:** Scanner icon | Filter icon

**Stats Row (scroll):**
- Jami mahsulot: X ta
- Kam zaxira: X ta (yellow)
- Tugagan: X ta (red)

**Filter Pills:**
- "Barchasi" | "KAM" (yellow) | "TUGAGAN" (red)

**Search:** "Mahsulot nomi, barcode..."

**Product List:**
Each OmborProductCard (white, shadow-sm, borderRadius: 12):
- Left border color: green (OK), yellow (LOW), red (OUT)
- Product image 50x50 (rounded-8)
- Name (15px, semibold)
- SKU (12px, gray-400, monospace)
- Stock level: "47 ta" (16px, bold, color-coded)
- Min stock: "min: 10 ta" (11px, gray-500)
- StockBadge right
- "Kirim so'rash" button (small, bordered, right) → request stock

**Empty state (filtered):** "Ushbu filtrda mahsulotlar yo'q"

---

#### 23. KirimScreen (Stock Receipts)

**Header:** "Kirimlar"
**Right:** Plus icon → NewReceiptSheet

**Stats Row:**
- "Jami: X ta" | "Kutilmoqda: X ta" (yellow) | "Qabul qilindi: X ta" (green)

**Filter Pills:**
- "Barchasi" | "KUTILMOQDA" | "QABUL QILINDI" | "BEKOR QILINDI"

**Search:** "Yetkazib beruvchi yoki raqam..."

**Receipt List:**
Each KirimReceiptCard (white, shadow-sm, padding 14):
- Row 1: "KIR-0123" (monospace, blue) | Status badge | Date (gray-400, 12px)
- Row 2: Supplier name (13px, gray-700, Building icon)
- Row 3: Items count | Total cost (bold, right)
- Tap → KirimDetailSheet

**KirimDetailSheet (BottomSheet, 85% height):**
- Title: "Kirim #KIR-0123"
- Info: Supplier | Date | Status | Notes
- Items list: each product + qty + cost
- Total row
- If PENDING: "Qabul qilish" green button + "Bekor qilish" red button

**NewReceiptSheet (BottomSheet, tall):**
- Title: "Yangi kirim"
- Supplier picker: searchable list
- Date picker (default today)
- Product rows (add multiple):
  - Product search/select
  - Qty input
  - Cost price input
  - Delete row button
- "+ Mahsulot qo'shish" link
- Total display (auto-calculated)
- Notes textarea
- "Kirim yaratish" blue button

**TransferSheet (BottomSheet):**
- Title: "Ombor transferi"
- "Qayerdan" filial picker
- "Qayerga" filial picker
- Product + qty rows
- Notes
- "Transfer yaratish" button

---

### SETTINGS & MANAGEMENT SCREENS ← PARTIALLY NEW

---

#### 24. MoreMenuScreen (Hub for extras)

**Header:** "Ko'proq"

**User Profile Card (top):**
- Avatar circle (48x48, blue bg, initials)
- Name (16px, bold) | Role badge (blue/green/purple)
- Branch name (13px, gray-500)
- "Profil" link →

**Menu Sections (grouped):**

**Inventar:**
- "Ombor" → OmborScreen (Package icon)
- "Kirimlar" → KirimScreen (PackagePlus)
- "Skaner" → ScannerScreen (Scan icon)

**Biznes:**
- "Ko'chmas mulk" → RealEstateScreen (Building2 icon)
- "AI tahlil" → AIInsightsScreen (Sparkles icon)
- "Bildirishnomalar" → AlertsScreen (Bell icon)

**Boshqaruv:** (MANAGER/ADMIN roles only)
- "Foydalanuvchilar" → UsersScreen (Users icon)
- "Filiallar" → BranchesScreen (Building icon)
- "Audit jurnali" → AuditLogScreen (Shield icon)

**Sozlamalar:**
- "Sozlamalar" → SettingsScreen (Settings icon)
- "Chiqish" → Logout (LogOut icon, red text)

Each menu item:
- Left: icon in gray-100 circle (36x36)
- Center: title (15px) + optional subtitle (12px, gray-500)
- Right: ChevronRight (gray-300)
- Separator divider between items

---

#### 25. UsersScreen (User Management) ← NEW FROM WEB

**Header:** "Foydalanuvchilar" (back arrow)
**Right:** Plus icon → UserFormSheet

**Stats Row:**
- "Jami: X ta" | "Faol: Y ta" | "Nofaol: Z ta"

**Search:** "Ism yoki telefon..."

**User List:**
Each user card (white, shadow-sm, padding 14):
- Left: Avatar circle (44x44, bg color by role, initials)
- Center: Name (15px, semibold) | Phone (13px, monospace, gray-500)
- Right: RoleBadge + Status indicator (green dot / gray dot)
- "So'nggi kirish: X vaqt oldin" (11px, gray-400)

**RoleBadge colors:**
- EGASI (Owner): purple
- ADMIN: red
- MENEDZHER: blue
- KASSIR: green
- KO'RUVCHI: gray

**Swipe left:** "Faollashtirish/Bloklash" (green/red) | "Tahrirlash" (blue)

**UserFormSheet (BottomSheet, tall):**
- Title: "Foydalanuvchi qo'shish/tahrirlash"
- Fields:
  - "Ism va familiya *" (required, min 2 chars)
  - "Telefon *" (+998XXXXXXXXX, required)
  - "Parol *" (min 6 chars, required for new user; optional for edit)
  - "Rol *" (picker: Kassir | Menedzher | Admin)
- Buttons: Bekor qilish + Saqlash

---

#### 26. BranchesScreen (Branch Management) ← NEW FROM WEB

**Header:** "Filiallar" (back arrow)
**Right:** Plus → BranchFormSheet

**Branch List:**
Each branch card (white, shadow-sm, borderRadius: 12, padding 14):
- Left: Building2 icon in blue-50 circle (44x44)
- Center: Name (15px, semibold) | Address (13px, gray-500, 2 lines)
- Right: Status toggle (green = active, gray = inactive)
- Swipe left: "Tahrirlash" (blue) | "O'chirish" (red)

**BranchFormSheet (BottomSheet):**
- Title: "Filial qo'shish/tahrirlash"
- Fields:
  - "Filial nomi *" (required, min 2 chars)
  - "Manzil" (optional)
- Buttons: Bekor qilish + Saqlash

**Empty State:**
- Building2 icon (large gray)
- "Hali filial yo'q"
- "+ Filial qo'shish" button

---

#### 27. AuditLogScreen (Audit Trail) ← NEW FROM WEB

**Header:** "Audit jurnali" (back arrow)

**Search + Filter Row:**
- SearchBar: "Foydalanuvchi, harakat, entity..."
- Action filter dropdown: "Barchasi" | "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT"

**Audit Log List:**
Each item (white, borderRadius: 12, padding 12):
- Row 1: ActionBadge (CREATE: green | UPDATE: blue | DELETE: red | LOGIN: gray | LOGOUT: gray | APPROVE: purple) | Sana (12px, monospace, gray-400, right)
- Row 2: User icon + name (14px, semibold) | Role (12px, gray-500)
- Row 3: Entity: type + description (13px, gray-700)
- Chevron if has old/new data → expand

**Expanded detail:**
- "Oldingi" (red-50 bg): scrollable JSON preview
- "Yangi" (green-50 bg): scrollable JSON preview

---

#### 28. SettingsScreen (Settings Hub)

**Header:** "Sozlamalar"

**Profile Card:**
- Avatar + Name + Role + Branch
- "Profilni tahrirlash" →

**Settings Sections:**

**Hisob:**
- Parolni o'zgartirish → password change form
- Bildirishnomalar → notification prefs toggle list
- Filial tanlash → BranchSelectorSheet

**Ilova:**
- Tilni o'zgartirish (Language): Uzbek | Русский
- Mavzu (Theme): Yorug' | Qorong'u | Tizim
- Printer ulanish → thermal printer settings

**Xavfsizlik:**
- Biometrik kirish toggle
- Avtomatik qulflash: 1 min | 5 min | 15 min

**Ma'lumot:**
- Ilova versiyasi: v2.4.1
- Muammoni xabar qilish →
- Maxfiylik siyosati →

---

### REMAINING SCREENS (existing, upgraded)

---

#### 29. ScannerScreen (Inventory Barcode Scanner)

**Header:** "Zaxira skaneri" (back arrow)

**Camera View:**
- Full-width camera preview (60% of screen)
- Scanning frame (animated border)
- Scanning line animation
- "Barcodni sahlangizga tushtiring" instruction

**Manual input:** "Barcodni qo'lda kiriting" input field below camera

**Scan Result Card:**
- Product image + name + SKU
- Current stock: "47 ta" (large, colored)
- Category
- "Sana sanash" button → CountQtyModal

**CountQtyModal:**
- "Sanalgan miqdor" input (number keyboard)
- "Fark: +/- X ta" (auto-calculated vs system stock)
- Notes input
- "Tasdiqlash" button

**Count History:**
- Recent scans list: product + scanned qty + date

---

#### 30. AIInsightsScreen

**Header:** "AI tahlil" + brain/sparkle icon

**Period Selector:** (pills)

**Trend Cards (vertical list):**
Each TrendCard (white, shadow-sm, borderRadius: 14):
- Trend type badge (Rising, Falling, Alert)
- Title (15px, semibold)
- Description (13px, gray-600, 3 lines)
- Sparkline mini chart (if applicable)
- ChevronRight for detail

**Categories:**
- Dead stock alerts (red)
- Top rising products (green)
- Margin warnings (orange)
- Seasonal trends (blue)
- Reorder suggestions (purple)

---

#### 31. AlertsScreen (Notifications)

**Header:** "Bildirishnomalar"
**Right:** "Hammasini o'qish" link (blue text)

**Filter Pills:**
- "Barchasi" | "O'qilmagan" | "Muhim"

**Alert List:**
Each alert (white, padding 14, unread has blue left border):
- Left: Icon in colored circle (36x36) - Bell/Alert/TrendingUp/Package
- Center: Title (14px, semibold) | Description (13px, gray-500, 2 lines)
- Right: Time ago (12px, gray-400) | Unread dot (blue, 8px)

**Alert types:**
- Low stock: red/yellow Package icon
- Large order: green ShoppingBag icon
- Debt overdue: orange Clock icon
- System: gray Bell icon

---

#### 32. RealEstateScreen (Property List)

**Header:** "Ko'chmas mulk"
**Right:** Plus → PropertyFormSheet

**Summary Cards (2x2):**
- Jami mulklar: X ta
- Band: Y ta (green)
- Bo'sh: Z ta (gray)
- Muddati o'tgan: N ta (red)

**Property List:**
Each PropertyCard (white, shadow-sm, borderRadius: 14, overflow: hidden):
- Top: property photo (aspect 16:9, height 160, gradient overlay)
- Bottom: padding 12
  - Address (15px, semibold)
  - Tenant name (13px, gray-600, Person icon)
  - Monthly rent (16px, bold, blue)
  - StatusBadge: "Band" (green) | "Bo'sh" (gray) | "Muddati o'tgan" (red)

**Tap → RealEstateDetailScreen:**
- Full property info + specs
- Tenant info (if any)
- Payment history list
- Maintenance records
- Monthly payment chart

---

## GLOBAL UI PATTERNS

### Header Style
```
All screen headers:
- Background: white
- Height: 56px + safe area
- Title: 20px, bold, gray-900, centered or left
- Back button: ChevronLeft icon, gray-700, 44x44 tap area
- Right actions: icon buttons, 44x44 tap area
- Bottom border: 1px, gray-100
```

### Pull-to-Refresh
Every FlatList supports pull-to-refresh (RefreshControl, blue tint)

### Loading States
- Full page: centered skeleton cards (gray animated)
- List: first 5 skeleton items
- Buttons: ActivityIndicator replacing text

### Error States
- Toast (bottom): red bg, white text, checkmark or X icon, auto-dismiss 3s
- Full page error: sad icon + "Xatolik yuz berdi" + "Qayta urinish" button

### Success Feedback
- Toast (bottom): green bg, white text, checkmark icon
- Haptic feedback on important actions

### Confirmation Dialogs
```
Alert.alert(
  "Tasdiqlash",
  "Haqiqatan ham o'chirmoqchimisiz?",
  [
    { text: "Bekor", style: "cancel" },
    { text: "O'chirish", style: "destructive", onPress: ... }
  ]
)
```

### Price Formatting
```
formatPrice(1250000) → "1,250,000"
Display: "1,250,000 so'm"
Large values: "1.25M so'm" (in charts/summaries)
```

### Date Formatting
```
"09.04.2026" (short)
"9 Aprel 2026, 14:30" (long)
"2 soat oldin" (relative)
```

---

## TECH STACK NOTES (for Stitch AI code generation)

- **Framework:** React Native (Expo or bare)
- **Navigation:** React Navigation v6 (Stack + BottomTabs)
- **State:** Zustand for local, React Query for server state
- **Forms:** react-hook-form + zod validation
- **Charts:** Victory Native or react-native-chart-kit
- **Icons:** lucide-react-native
- **Gestures:** react-native-gesture-handler + Reanimated 2
- **BottomSheet:** @gorhom/bottom-sheet
- **Camera:** expo-camera or react-native-vision-camera
- **Biometrics:** expo-local-authentication
- **Haptics:** expo-haptics
- **Storage:** MMKV (fast local storage)
- **Date:** date-fns (uz locale)

---

## SCREEN COUNT SUMMARY

| Category | Count | Status |
|----------|-------|--------|
| Auth screens | 3 | Existing + BiometricUpgrade |
| Dashboard | 1 | Redesign |
| Savdo/POS | 5 | Existing + ReturnScreen new |
| Katalog | 4 | ALL NEW |
| Moliya | 8 | ALL NEW |
| Ombor/Kirim | 2 | Existing upgrade |
| Scanner | 1 | Existing upgrade |
| Settings (Users/Branches/Audit) | 3 | ALL NEW |
| Settings Hub | 1 | Existing upgrade |
| More Menu | 1 | Redesign |
| Real Estate | 2 | Existing upgrade |
| AI/Alerts | 2 | Existing upgrade |
| **TOTAL** | **33** | |

---

*This prompt covers the COMPLETE RAOS mobile app — all 33 screens with full UI specifications for Stitch AI code generation.*
