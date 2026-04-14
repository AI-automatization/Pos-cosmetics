# RAOS Mobile — UI Redesign Done

> **Dizayn manba:** `docs/stitch-ai-mobile-prompt.md`
> **Tasks fayl:** `docs/ui-redesign-tasks.md`
> Bajarilgan UI tasklar arxivi — sana + qisqa yechim

---

## PHASE 0 — FOUNDATION ✅ (2026-04-14)

### UI-000 | THEME — colors.ts
- **Fayl:** `apps/mobile/src/theme/colors.ts`
- **Bajarildi:** 2026-04-14
- **Yechim:** `primary` `#6366F1` → `#2563EB`; yangi tokenlar qo'shildi: `primaryDark`, `primaryLight`, `successLight`, `warningLight`, `dangerLight`, `orange`, `orangeLight`, `purple`, `purpleLight`, `surfaceLow`, `borderFocus`, `textMuted`, `textInverse`, `header`, `tabBar`; `background` → `#F9FAFB`; `border` → `#E5E7EB`

### UI-001 | THEME — typography.ts
- **Fayl:** `apps/mobile/src/theme/typography.ts`
- **Bajarildi:** 2026-04-14
- **Yechim:** `sizes` va `weights` ob'ektlari qo'shildi; yangi presetlar: `screenTitle`, `sectionTitle`, `cardTitle`, `body`, `bodySmall`, `caption`, `label`, `labelSmall`, `price`, `priceSmall`, `stat`, `mono`

### UI-002 | THEME — spacing.ts
- **Fayl:** `apps/mobile/src/theme/spacing.ts`
- **Bajarildi:** 2026-04-14
- **Yechim:** Numeric tokenlar 1–11 (2dp–48dp) qo'shildi; eski `xs/sm/md/lg/xl/xxl` alias'lar saqlab qolindi (backward compat)

### UI-003 | THEME — borderRadius.ts (YANGI)
- **Fayl:** `apps/mobile/src/theme/borderRadius.ts`
- **Bajarildi:** 2026-04-14
- **Yechim:** Yangi fayl yaratildi — `xs=4, sm=6, md=10, lg=14, xl=18, 2xl=24, full=9999`; `theme/index.ts` ga export qo'shildi

### UI-004 | SHARED — Card component
- **Fayl:** `apps/mobile/src/components/common/Card.tsx`
- **Bajarildi:** 2026-04-14
- **Yechim:** `variant: 'default' | 'elevated' | 'flat'` prop; `padding` prop (default 16); `borderRadius: 14` (Stitch lg token); `elevated` variant — `#2563EB` shadow

### UI-005 | SHARED — Badge component
- **Fayl:** `apps/mobile/src/components/common/Badge.tsx`
- **Bajarildi:** 2026-04-14
- **Yechim:** `'error'` → `'danger'` rename; `'orange'` va `'purple'` variantlar qo'shildi; `icon?: React.ReactNode` prop; 11px uppercase letterSpacing; Stitch token ranglari (`successLight` bg va h.k.); 11+ screen fayllarida breaking change tuzatildi

### UI-006 | SHARED — EmptyState component
- **Fayl:** `apps/mobile/src/components/common/EmptyState.tsx`
- **Bajarildi:** 2026-04-14
- **Yechim:** `icon` emoji → `React.ReactNode`; `message` prop → `title` + `description`; `actionLabel` + `onAction` CTA button; `style?: ViewStyle`; barcha screen fayllarida `message` → `title` tuzatildi

### UI-007 | SHARED — ScreenLayout / Header
- **Fayl:** `apps/mobile/src/components/layout/ScreenLayout.tsx`
- **Bajarildi:** 2026-04-14
- **Yechim:** `container.backgroundColor` → `#F9FAFB`; `header.paddingVertical` → `spacing.md`; `header.borderBottomColor` → `#E5E7EB`

### UI-008 | NAV — TabNavigator
- **Fayl:** `apps/mobile/src/navigation/TabNavigator.tsx`
- **Bajarildi:** 2026-04-14
- **Yechim:** 7 tab → 5 tab: `BoshSahifa`, `Savdo`, `Katalog`, `Moliya`, `Ko'proq`; `SavdoNavigator` stack (SavdoMain, SmenaScreen, SalesHistory, NasiyaScreen); `MoreNavigator` stack (MoreMenu, KirimScreen, OmborScreen, SettingsScreen); `PRIMARY = '#2563EB'`; tabBar height 60; `navigation/types.ts` yangilandi

### UI-009 | SHARED — SearchBar (YANGI)
- **Fayl:** `apps/mobile/src/components/common/SearchBar.tsx`
- **Bajarildi:** 2026-04-14
- **Yechim:** Yangi komponent — Ionicons `search-outline`/`close-circle`; `borderRadius: 18` (Stitch xl); height: 44; `value`, `onChangeText`, `placeholder`, `rightAction`, `style`, `autoFocus`, `editable` props

### UI-010 | SHARED — StatCard (YANGI)
- **Fayl:** `apps/mobile/src/components/common/StatCard.tsx`
- **Bajarildi:** 2026-04-14
- **Yechim:** Yangi komponent — colored circle (36x36) icon; 11px uppercase title; 22px bold value; ichki `TrendBadge` (▲/▼); `trend` yoki `subtitle` props

### UI-010b | SHARED — FAB (YANGI)
- **Fayl:** `apps/mobile/src/components/common/FAB.tsx`
- **Bajarildi:** 2026-04-14
- **Yechim:** Yangi komponent — 56x56, borderRadius 28, `#2563EB`, blue shadow; fixed bottom 24 / right 20; `loading` → ActivityIndicator; `disabled` → gray

---

## PHASE 1 — AUTH SCREENS

### UI-011 | AUTH — LoginScreen ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Auth/LoginScreen.tsx`
- **Yechim:** `primary` `#5B5BD6` → `#2563EB`; `background` → `#F9FAFB`; `borderFocus` qo'shildi; logo 72→80px; subtitle → "Biznesingizni boshqaring"; label 14→13px; input `borderWidth` 1.5→1, `borderRadius` 12→10; `focusedField` state + `inputWrapperFocused` style (blue border + shadow); login button matni "Kirish →" → "Kirish"; `versionText` qo'shildi

### UI-012 | AUTH — BiometricScreen ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Auth/BiometricScreen.tsx`
- **Yechim:** Emoji 👆 → `Ionicons finger-print-outline` 80px; `iconCircle` 120x120 `#EFF6FF` bg; title 22px bold; subtitle 15px gray; primary button `#2563EB` full width h52 borderRadius 12 + shadow; fallback link 15px `#2563EB`; background white; i18n `biometricTitle` + `biometricAction` kalitlari qo'shildi

### UI-013 | AUTH — OnboardingScreen ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Onboarding/index.tsx`
- **Yechim:** Illustration H*0.50 → H*0.60; active dot `#2563EB`; back button `#2563EB`; next button `#2563EB` (last → `#16A34A` yashil); skip absolute top-right ga ko'chirildi; `slide.accent` ishlatilmagan deklaratsiya tozalandi

---

## PHASE 2 — DASHBOARD SCREEN

### UI-014 | DASHBOARD — DashboardScreen ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Dashboard/index.tsx`
- **Yechim:** Placeholder → to'liq screen qurildi; Header ("Bosh sahifa" + Bell icon + date); Smena banner (orange, left border) yoki ActiveShiftCard; Stats 2x2 grid (4 StatCard); WeeklyTrendChart; RevenueCard; TopProductsCard; Tez harakatlar 2x2 grid (Savdo/Kirim/Katalog/Hisobot); RefreshControl; `formatUzbekDate()` helper

### UI-015 | DASHBOARD — ActiveShiftCard ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Dashboard/ActiveShiftCard.tsx`
- **Yechim:** `Card` → o'z konteyneri (`#EFF6FF` bg, left border `#2563EB` 4px, borderRadius 14); sarlavha + `Badge "OCHIQ"`; smena raqami `shift.id.slice(-6)` dan (shiftNumber yo'q); stats grid 2 ustun (OCHILGAN VAQT, OCHILISH NAQDI); `shift === null` → `null` qaytaradi

### UI-016 | DASHBOARD — RevenueCard ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Dashboard/RevenueCard.tsx`
- **Yechim:** "Foyda tahlili" sarlavha + "Bugun"; P&L breakdown (Daromad/Chegirma/Soliq/divider/Sof daromad yashil); pastki stats row (receipt + trending-up ikonlar, vertikal divider); `BreakdownRow` typed component; `useTranslation` olib tashlandi

### UI-017 | DASHBOARD — WeeklyTrendChart ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Dashboard/WeeklyTrendChart.tsx`
- **Yechim:** `BAR_MAX_HEIGHT` 72→120; sarlavha "Haftalik trend" + sana diapazoni (getWeekRange); bar `#DBEAFE` (blue-100), bugun `#2563EB`; barValue faqat bugungi barda; `borderRadius` 4→6; `useTranslation` olib tashlandi

### UI-018 | DASHBOARD — TopProductsCard ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Dashboard/TopProductsCard.tsx`
- **Yechim:** Sarlavha "Top mahsulotlar bugun" + "Hammasi" link; rank circle (32x32, `#EFF6FF` bg, `#2563EB` raqam); `FlatList` → `map`; 1px separator; `onSeeAll` prop; `useTranslation` olib tashlandi

### UI-019 | DASHBOARD — AlertsList ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Dashboard/AlertsList.tsx`
- **Yechim:** Sarlavha "Ogohlantirishlar" + `Badge` soni; emoji → `Ionicons` (warning-outline/alert-circle-outline); left border 3px (warning `#D97706`, danger `#DC2626`); bg `#FFFBEB`/`#FEF2F2`; empty state checkmark + "Hamma narsa joyida"; `FlatList` → `map`; `'error'` → `'danger'`; `useTranslation` olib tashlandi

---

## PHASE 3 — SAVDO (POS) SCREENS

### UI-020 | SAVDO — SavdoScreen ✅ (2026-04-14)
- **Fayllar:** `utils.ts`, `CategoryTabs.tsx`, `SavdoSearchBar.tsx`, `CartBar.tsx`, `index.tsx`
- **Yechim:** `C.primary` `#5B5BD6`→`#2563EB`; `C.bg` `#F5F5F7`→`#F9FAFB`; `C.danger` `#EF4444`→`#DC2626`; CategoryTabs inactive `white+border` → `#F3F4F6+no-border`; SearchBar `borderRadius` 12→18; CartBar `borderTopRadius` 20; empty state 2-qatorli

### UI-021 | SAVDO — SavdoHeader ✅ (2026-04-14)
- **Fayllar:** `SavdoHeader.tsx`, `index.tsx`
- **Yechim:** `isShiftOpen` + `shiftId` props qo'shildi; SmenaChip pill (yashil `#F0FDF4/#16A34A` yoki sariq `#FFFBEB/#D97706`); dot (6x6) + label (`S-XXXXXX` yoki "Smena yopiq"); header tuzilmasi `[Title flex:1][Chip][Bell]`

### UI-022 | SAVDO — CategoryTabs ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Savdo/components/CategoryTabs.tsx`
- **Yechim:** Inactive text `#6B7280`→`#374151` (gray-700); `catTabActive.borderColor` redundant olib tashlandi; inactive bg `#F3F4F6` + active `#2563EB` (UI-020 da bajarilgan)

### UI-023 | SAVDO — ProductCard ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Savdo/ProductCard.tsx`
- **Yechim:** `borderRadius` 14→12; `borderWidth: 1` `#F3F4F6`; shadow yumshatildi; `badgeIn` `#10B981`→`#16A34A`; `badgeLow` `#F59E0B`→`#D97706`; `controlBtnAdd` `#5B5BD6`→`#2563EB`; `name` 13→14px; `price` 13→16px, `#5B5BD6`→`#2563EB`; badge "DONA"→"ta"

### UI-024 | SAVDO — CartBar ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Savdo/components/CartBar.tsx`
- **Yechim:** `View` → `Animated.View`; slide-up spring animatsiyasi (translateY 100→0); "To'lov →"→"To'lash →"; `borderTopRadius: 20` (UI-020 da); `C.primary` `#2563EB` (UI-020 da)

---

### UI-025 | SAVDO — PaymentSheet ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Savdo/PaymentSheet.tsx`
- **Yechim:** `confirmBtn.backgroundColor` + `shadowColor` `#5B5BD6`→`#2563EB`; button text `"Tasdiqlash"`→`"Savdoni yakunlash"`; `sheet.maxHeight` `'90%'`→`'75%'`

### UI-026 | SAVDO — PaymentMethodPicker ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Savdo/PaymentMethodPicker.tsx`
- **Yechim:** Per-method `m.color` olib tashlandi; unified blue scheme: active=`#2563EB` bg white icon+text, inactive=white bg `#2563EB` border+icon+text; `methodIcon` 44x44 circle olib tashlandi; `Ionicons checkmark` badge olib tashlandi; label `"TO'LOV USULINI TANLANG"`→`"TO'LOV USULI"`

### UI-027 | SAVDO — PaymentInputBlock ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Savdo/PaymentInputBlock.tsx`
- **Yechim:** `Switch trackColor.true` `#5B5BD6`→`#2563EB`; `changeAmount.color` `#5B5BD6`→`#16A34A` (qaytim yashil); `changeNeg.color` `#EF4444`→`#DC2626`

### UI-028 | SAVDO — LowStockSheet ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Savdo/LowStockSheet.tsx`
- **Yechim:** Sariq warning banner qo'shildi (`#FFFBEB` bg, `#FDE68A` border, `warning-outline` icon, "Diqqat: X ta mahsulot zaxirasi kam"); `C` tokenlar yangilandi: `orange #F59E0B→#D97706`, `red #EF4444→#DC2626`, `primary #5B5BD6→#2563EB`; badge text `"DONA"→"ta"`

---

## PHASE 4 — SALES HISTORY SCREENS

### UI-029 | SALES — SalesHistoryScreen ✅ (2026-04-14)
- **Fayllar:** `Sales/index.tsx`, `SalesColors.ts`, `SalesTypes.ts`, `SaleRow.tsx`
- **Yechim:** `SalesColors` yangilandi (`primary #5B5BD6→#2563EB`, `bg #F5F5F7→#F9FAFB`, `border #F3F4F6→#E5E7EB`, `green #10B981→#16A34A`); header `{todayLabel}+menuIcon`→`"Buyurtmalar tarixi"+calendarIcon`; filter pills qo'shildi (Barchasi/Bajarildi/Qaytarildi/Bekor qilindi) + `filter` state + `filteredSales`; `Sale` interfeysi ga `status: OrderStatus` qo'shildi; `orderToSale()` yangilandi; `SaleRow` — blue monospace ID (`#2563EB`, `font-family: Courier New/monospace`) + `STATUS_STYLE` badge (Bajarildi/Qaytarildi/Bekor qilindi); emoji EmptyState → `receipt-outline` Ionicons

### UI-030 | SALES — SaleDetailModal ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Sales/SaleDetailModal.tsx`
- **Yechim:** Header: blue monospace order ID + status badge; Info card: vaqt + to'lov usuli (`#F9FAFB` bg, borderRadius 12); Items: `qty × price UZS` format + line total blue; Summary card: jami mahsulot + umumiy summa (18px bold blue); Actions: COMPLETED → "Qaytarish" (outline danger) + "Chek chop etish" (blue) | boshqa → "Yopish"

### UI-031 | SALES — ReturnScreen ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Sales/ReturnScreen.tsx` (YANGI FAYL)
- **Yechim:** Header: back button + "Qaytarish — #XXXX" (blue monospace); Items: checkbox (22x22, borderRadius 6, active `#2563EB`) + name/price + qty stepper ([−][n][+]) when checked; Return reason multiline TextInput; Orange summary box `#FFFBEB/#FDE68A` ("Qaytarish summasi: X UZS") faqat selection bo'lsa; Footer: "Qaytarishni tasdiqlash" (blue, disabled=gray) + `Alert.alert` tasdiqlash; `props: sale, onClose, onConfirm`

---

## PHASE 5 — SMENA SCREENS

### UI-032 | SMENA — SmenaScreen ✅ (2026-04-14)
- **Fayllar:** `Smena/index.tsx`, `SmenaComponents.tsx`, `SmenaOpenSheet.tsx` (yangi), `SmenaCloseSheet.tsx` (yangi)
- **Yechim:** `C` tokenlar yangilandi (`primary #5B5BD6→#2563EB`, `green #10B981→#16A34A`, `red #EF4444→#DC2626`, `orange #F59E0B→#D97706`, `bg/border` yangilandi); shift card bg `C.white`→`#F0FDF4` (green-50); `handleToggleShift` Alert → bottom sheets; `SmenaOpenSheet`: boshlang'ich naqd input + green button; `SmenaCloseSheet`: summary table + haqiqiy naqd input + diff display (green/red) + red close button

---

## PHASE 6 — KATALOG SCREENS

### UI-033 | KATALOG — ProductsScreen ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Catalog/ProductsScreen.tsx` (YANGI FAYL)
- **Yechim:** Header: "Mahsulotlar" + item count + filter icon; `SearchBar` komponent; category pills (Barchasi + API dan); stats chips 3ta: Jami/Faol/Nofaol (filter + count); `ProductListCard`: 60x60 initials img (`#EFF6FF`), name 15px semibold, SKU monospace gray, categoryName, price blue, StockBadge (OK/KAM/TUGAGAN), margin badge (+X%), `⋮` menu (Alert → Tahrirlash/O'chirish); `gesture-handler` yo'q → `Alert.alert` menu; FAB 56x56 `#2563EB`; `catalogApi.getProducts` + `catalogApi.getCategories` (react-query)

### UI-034 | KATALOG — ProductFormScreen ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Catalog/ProductFormScreen.tsx` (YANGI FAYL)
- **Yechim:** Header: back + "Yangi mahsulot"/"Tahrirlash" + "Saqlash" button (disabled if no name/price); Image picker (dashed border, camera icon); 5 section card: Asosiy ma'lumot (name/SKU/category Alert picker/description), Narxlar (costPrice/sellPrice + marja badge auto-calc, green/red), Zaxira (minStock + joriy read-only edit modeda), Barcode (input + scan icon), Holat (Switch + faol/nofaol hint); bottom blue "Saqlash" button; `props: product?, onClose, onSaved`

### UI-035 | KATALOG — CategoriesScreen ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Catalog/CategoriesScreen.tsx` (YANGI FAYL)
- **Yechim:** Header: "Kategoriyalar" + count + blue Plus button; `buildTree()` flat→tree (`parentId` asosida); flat list: root (white bg, folder icon `#FDE68A`) + child (indented 32px, `#F9FAFB` bg, indent line); children count badge (blue); `⋮` menu → Alert (Tahrirlash/O'chirish + confirm); `CategoryFormSheet` ichida: name input + ota kategoriya Alert picker + blue "Qo'shish/Saqlash"; empty state + "Birinchisini qo'shish" button

### UI-036 | KATALOG — SuppliersScreen ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Catalog/SuppliersScreen.tsx` (YANGI FAYL)
- **Yechim:** Supplier API yo'q → local state (`useState<Supplier[]>`); Header: "Yetkazib beruvchilar" + count + blue Plus; SearchBar (ism/kompaniya/telefon filter); `SupplierCard`: 44x44 `#EFF6FF` business icon + name + company (muted) + phone/address meta rows + `⋮` menu; `SupplierFormSheet`: 4 field (ism/telefon/kompaniya/manzil) + blue save button; CRUD: add/edit/delete local state; empty state + "Birinchisini qo'shish"

### UI-037 | MOLIYA — FinanceScreen ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Finance/FinanceScreen.tsx` (YANGI FAYL)
- **Yechim:** Header: "Moliya" + `bar-chart-outline` icon; period pills: Bugun/7 kun/30 kun/90 kun/1 yil — `getPeriodDates()` ISO string compute; `reportsApi.getSalesSummary(from, to)` react-query; 4 StatCard 2x2 grid: Tushum (green), Yalpi tushum (blue), Qaytarishlar (red), Chegirmalar (orange); payment breakdown card (method dot + amount); 4 NavCard: P&L/Xarajatlar/To'lovlar tarixi/Hisobotlar

### UI-038 | MOLIYA — PnLScreen ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Finance/PnLScreen.tsx` (YANGI FAYL)
- **Yechim:** Header: "Foyda va Zarar" + back button (optional `onClose` prop); period pills (getPeriodDates); `reportsApi.getSalesSummary` react-query; 4 KpiCard 2×2: Tushum/Yalpi foyda/Tannarx/Sof daromad; P&L jadval: Daromad section (yalpi→chegirma→qaytarish→sof) + Xarajatlar section (COGS+operatsion) + sof daromad bold row; SegmentBar (proportional flex segments green+orange) + legend; COGS=0 placeholder (API yo'q) + info note

### UI-039 | MOLIYA — ExpensesScreen ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Finance/ExpensesScreen.tsx` (YANGI FAYL)
- **Yechim:** Local state CRUD (API yo'q); Header: "Xarajatlar" + red Plus; summary card `#FEF2F2` (Jami xarajat + count); filter pills: Barchasi/Ijara/Kommunal/Maosh/Boshqa (icon + color per category); `ExpenseCard`: 44x44 category icon, desc, catBadge, date, payMethod, amount red bold, `⋮` menu; `ExpenseFormSheet` (5 field: sana/kategoriya Alert/tavsif/miqdor/to'lov usuli Alert) + red save button; swipe → `⋮` Alert (no gesture library)

### UI-040 | MOLIYA — PaymentsHistoryScreen ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Finance/PaymentsHistoryScreen.tsx` (YANGI FAYL)
- **Yechim:** `salesApi.getOrders({ from, to, limit: 200 })` react-query; SearchBar (orderNumber qidirish); 2 qator filter: period pills (Bugun/7 kun/30 kun/90 kun) + method pills (Barchasi/Naqd/Karta/Nasiya/Click/Payme — dark active); summary strip: Jami tushum + Bajarildi count + Jami count; `PaymentCard`: status icon circle, monospace order #, StatusBadge, date+time, customerId (truncated), amount (red for RETURNED); Note: Order type has no paymentMethod field — method filter ready for when API adds it

### UI-041 | MOLIYA — ReportsHubScreen ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Finance/ReportsHubScreen.tsx` (YANGI FAYL)
- **Yechim:** Navigation hub, API yo'q; Header: "Hisobotlar" + doc icon; 4 ta katta `ReportCard`: Kunlik savdo (blue bar-chart), Top mahsulotlar (green trending-up), Smena hisobotlari (purple time), Nasiya qarzdorlik (orange alert-circle); har card: 52x52 icon circle + title + description + color-matched arrow box; `onNavigate` prop orqali navigatsiya; info banner pastda

### UI-042 | MOLIYA — DailyRevenueScreen ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Finance/DailyRevenueScreen.tsx` (YANGI FAYL)
- **Yechim:** `reportsApi.getDailyRevenue(from, to)` react-query; period pills: 7/30/90 kun (flex, to'liq kenglik); 3-ustunli summary strip: Jami tushum + Buyurtmalar + O'rtacha/kun; custom `BarChart` — proportional `View` heights (CHART_HEIGHT=180), y-axis labels (fmtShort), scrollable bars (28px wide, 6px gap, maxBars screen-width limited); data table: sana/tushum/buyurtma + total row (`#F0F9FF` bg, blue total)

### UI-043 | MOLIYA — TopProductsScreen ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Finance/TopProductsScreen.tsx` (YANGI FAYL)
- **Yechim:** `reportsApi.getTopProducts(from, to, 10)` react-query; period pills 7/30/90/1yil + list/chart view toggle (icon buttons); summary strip: Jami tushum/sotildi/mahsulotlar; **List view**: rank circle (oltin/kumush/bronza), 40x40 initials avatar, name, qty, revenue blue; **Chart view**: `HorizontalBarChart` (proportional width bars, max BAR_MAX_W, rank dots) + qty ranking top-5 table; `onClose` optional prop

### UI-044 | MOLIYA — ShiftReportsScreen ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Finance/ShiftReportsScreen.tsx` (YANGI FAYL)
- **Yechim:** `salesApi.getShifts(1, 100)` react-query, client-side period filter (Bugun/7/30/Barchasi); summary strip: Jami tushum/Buyurtmalar/Smenalar; `ShiftCard`: № badge (green=ochiq, gray=yopildi), sana+vaqt oralig'i, status badge, davomiylik (`duration()` helper h:m), kassir nomi, 4-ustunli stats grid (Buyurtmalar/Naqd/Karta/Nasiya), jami tushum blue bold; `onClose` prop

### UI-045 | MOLIYA — NasiyaAgingScreen ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Finance/NasiyaAgingScreen.tsx` (YANGI FAYL)
- **Yechim:** `nasiyaApi.getList()` + `nasiyaApi.getOverdue()` react-query; 4 summary card horizontal scroll (Jami/Muddati o'tgan/Bu oy/Xaridorlar); Tab: Barchasi/Muddati o'tgan (red badge count); `DebtCard`: 40x40 initials, ism+telefon, `AgeBucket` badge (Joriy green/0-30 yellow/31-60 orange/61-90 red/90+ dark red), progress bar (paid/total), qolgan qarz red bold, "To'lash" blue button; `QuickPaySheet`: remaining subtitle, amount TextInput, 50%+To'liq quick buttons, payment method Alert picker, `nasiyaApi.recordPayment()` + `queryClient.invalidateQueries`

### UI-046 | OMBOR — OmborScreen ✅ (2026-04-14)
- **Fayllar:** `OmborColors.ts`, `OmborHeader.tsx`, `OmborTypes.ts`, `OmborListHeader.tsx`, `index.tsx`
- **Yechim:** C tokens: `bg #F5F5F7→#F9FAFB`, `border #F3F4F6→#E5E7EB`, `primary #5B5BD6→#2563EB`, `green #10B981→#16A34A`, `orange #F59E0B→#D97706`, `red #EF4444→#DC2626`; STATUS_CFG: yangi bg renglari (`#F0FDF4`/`#FFFBEB`/`#FEF2F2`), TUGADI label→"TUGAGAN"; TABS: Hammasi→Barchasi, Kam→KAM, Tugadi→TUGAGAN; `OmborHeader`: cube+avatar → "Ombor" subtitle + Scanner (`scan-outline`) + Filter (`options-outline`) icon buttons `#EFF6FF` bg; `OmborListHeader`: border-based pills (active=blue fill), `Feather`→`Ionicons`; `index.tsx`: `MaterialCommunityIcons`→`Ionicons`

### UI-047 | OMBOR — OmborProductCard ✅ (2026-04-14)
- **Fayllar:** `OmborProductCard.tsx`, `OmborStatsRow.tsx`
- **Yechim:** Full rewrite: `borderLeftWidth: 4` color-coded (green=MAVJUD/yellow=KAM/red=TUGAGAN); 50×50 rounded-8 initials box (2 harf, cfg.iconBg/iconColor); name 15px semibold + SKU 12px monospace `#9CA3AF`; stock "47 ta" 16px bold color-coded + "min X" subtitle; status badge (6px radius); "Kirim so'rash" bordered button (blue outline, faqat status≠MAVJUD da) + `onRequest` prop; `OmborStatsRow` border colors yangilandi

### UI-048 | KIRIM — KirimScreen ✅ (2026-04-14)
- **Fayllar:** `KirimColors.ts`, `KirimTypes.ts`, `KirimStatsChips.tsx`, `KirimListHeader.tsx`, `index.tsx`
- **Yechim:** C tokens: `bg #F5F5F7→#F9FAFB`, `border #F3F4F6→#E5E7EB`, `primary #5B5BD6→#2563EB`, `green #10B981→#16A34A`, `orange #F59E0B→#D97706`, `red #EF4444→#DC2626`; `FilterTab` ga CANCELLED qo'shildi; STATUS_CFG labels: KUTILMOQDA/QABUL QILINDI/BEKOR QILINDI (uppercase); TABS: Hammasi→Barchasi + BEKOR QILINDI tab; `KirimStatsChips` redesign: StatsRow (3 cards — Jami/KUTILMOQDA/QABUL QILINDI, left border color-coded); `KirimListHeader`: `Feather`→`Ionicons`, border-based pills; `index.tsx`: `MaterialCommunityIcons`→`Ionicons`, header title "Kirim"→"Kirimlar"

### UI-049 | KIRIM — KirimReceiptCard ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Kirim/KirimReceiptCard.tsx`
- **Yechim:** Full rewrite: monospace blue `receiptNumber` (`#2563EB`, Platform.select Courier/monospace); status badge (`10px 800 weight`, 6px radius, cfg.bg/text); `business-outline` icon + supplier name; bottom row: `calendar-outline` + formatted date + `cube-outline` + itemsCount + amount (15px bold); white card + 1px border + shadow-sm; removed package-variant MaterialCommunityIcons icon

### UI-050 | KIRIM — NewReceiptSheet ✅ (2026-04-14)
- **Fayl:** `apps/mobile/src/screens/Kirim/NewReceiptSheet.tsx`, `components/types.ts`
- **Yechim:** `components/types.ts` C colors yangilandi: `#5B5BD6→#2563EB`, `bg #F5F5F7→#F9FAFB`, `border #F3F4F6→#E5E7EB`, `red #EF4444→#DC2626`, `green #10B981→#16A34A` (kaskad: SupplierForm, AddedItemsList, ScannedItemMiniForm, ManualItemMiniForm, AddItemButtons); `NewReceiptSheet.tsx`: submit button "Qabul qilish"→"Kirim yaratish"; sheet borderRadius 24→20, padding 24→20; handle 40→36px, 5→4px; titleRow font 20→18px; sectionTitle: uppercase + letterSpacing; cancelBtn/submitBtn borderRadius 10→12; C local token override qo'shildi

_RAOS UI Done | Phase 0: 2026-04-14 | Phase 1–3: 2026-04-14_
