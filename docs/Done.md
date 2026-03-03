# RAOS — BAJARILGAN ISHLAR ARXIVI
# Yangilangan: 2026-03-01

---

## 📌 QOIDALAR

```
1. docs/Tasks.md dagi task FIX bo'lgach → shu yerga ko'chiriladi
2. Format: T-raqam | sana | tur | qisqa yechim | fayl nomi
3. Bu fayl FAQAT arxiv — o'chirmaslik, o'zgartirmaslik
```

---

## TUZATILGAN BUGLAR

| # | Sana | Tur | Muammo va yechim | Fayl |
|---|------|-----|-----------------|------|
| — | — | — | _(hali yo'q)_ | — |

---

## YARATILGAN FEATURELAR

| # | Sana | Feature | Fayl(lar) |
|---|------|---------|-----------|
| T-001 | 2026-02-26 | Identity & RBAC module — JWT auth (access 15min + refresh 7d), @Public/@Roles decorators, global guards (JwtAuth, Roles, Tenant) | `apps/api/src/identity/` (auth.controller, users.controller, identity.service, identity.module, dto/*, guards/*, strategies/*) |
| T-002 | 2026-02-26 | Auth endpoints — POST /auth/register, login, refresh, logout, GET /auth/me | `apps/api/src/identity/auth.controller.ts` |
| T-003 | 2026-02-26 | Users CRUD — GET/POST/PATCH/DELETE /users with role hierarchy enforcement (OWNER>ADMIN>MANAGER>CASHIER>VIEWER) | `apps/api/src/identity/users.controller.ts` |
| T-004 | 2026-02-26 | Multi-tenant isolation — tenant_id filtering on all user queries, slug-based login | `apps/api/src/identity/identity.service.ts`, `apps/api/src/identity/guards/tenant.guard.ts` |
| T-005 | 2026-02-26 | Prisma migration — refresh_token + refresh_token_exp fields to users table | `apps/api/prisma/migrations/20260226112310_add_refresh_token_to_user/` |
| T-006 | 2026-02-26 | Identity domain events — TENANT_REGISTERED, USER_LOGGED_IN, USER_CREATED, USER_UPDATED, USER_DEACTIVATED | `apps/api/src/events/domain-events.ts` |

---

## ARXITEKTURA TUZATISHLARI

| # | Sana | Vazifa | Holat |
|---|------|--------|-------|
| T-007 | 2026-02-26 | @Public() decorator — global JwtAuthGuard bypass uchun, HealthController ga qo'shildi | Bajarildi |
| T-008 | 2026-02-26 | APP_GUARD orqali global guards (JwtAuth → Roles → Tenant) zanjiri o'rnatildi | Bajarildi |

---

## DEVOPS ISHLAR

| # | Sana | Vazifa | Holat |
|---|------|--------|-------|
| T-009 | 2026-02-26 | RAOS monorepo bootstrap — Docker (PostgreSQL, Redis, MinIO), NestJS API, Next.js admin, shared packages | Bajarildi |
| T-010 | 2026-02-26 | Auth dependencies o'rnatildi — @nestjs/jwt, @nestjs/passport, passport-jwt, bcryptjs | Bajarildi |
| T-100 | 2026-02-28 | Dashboard — Quick stats (ordersCount, avgBasket, topProducts) + Active shifts qo'shildi | `salesApi` (getQuickStats, getActiveShifts), `useDashboard.ts`, `screens/Dashboard/index.tsx` |
| T-101 | 2026-02-28 | Nasiya management — Debtors list, DebtDetail (payment + reminder), NasiyaTab qo'shildi | `api/nasiya.api.ts`, `hooks/useNasiya.ts`, `screens/Nasiya/index.tsx`, `screens/Nasiya/DebtDetail.tsx`, `navigation/TabNavigator.tsx`, `navigation/types.ts` |
| T-102 | 2026-02-28 | Barcode scanner — Camera orqali tovar tekshirish, catalog.api.ts qo'shildi, expo-camera dependency | `api/catalog.api.ts`, `screens/Inventory/BarcodeScanner.tsx`, `navigation/TabNavigator.tsx`, `package.json` |
| T-138 | 2026-03-01 | Mobile app core — Expo + React Native setup: App.tsx (QueryClient, i18n init, useNotifications), RootNavigator (auth/app switch), AuthNavigator, TabNavigator (6 tab: Dashboard/Sales/Nasiya/Inventory/Alerts/Settings), navigation types; Zustand stores (auth.store: login/logout/loadUser + SecureStore, app.store: selectedBranchId); config/constants, utils/format, utils/error | `src/App.tsx`, `navigation/RootNavigator.tsx`, `navigation/AuthNavigator.tsx`, `navigation/TabNavigator.tsx`, `navigation/types.ts`, `store/auth.store.ts`, `store/app.store.ts`, `config/constants.ts`, `utils/format.ts`, `utils/error.ts` |
| T-139 | 2026-03-01 | Auth ekranlar — LoginScreen (email/parol, biometric tugmasi, disabled state, KeyboardAvoidingView), BiometricScreen (expo-local-authentication, enrolled check), useBiometricAuth hook | `screens/Auth/LoginScreen.tsx`, `screens/Auth/BiometricScreen.tsx`, `hooks/useBiometricAuth.ts` |
| T-140 | 2026-03-01 | API client — axios instance (15s timeout, JSON headers), JWT request interceptor (SecureStore dan token), 401 auto-refresh (token rotation + config retry), navigationRef orqali logout redirect; barcha API modullari: auth, analytics, sales, inventory, alerts, nasiya, catalog, branches | `api/client.ts`, `api/auth.api.ts`, `api/analytics.api.ts`, `api/sales.api.ts`, `api/inventory.api.ts`, `api/alerts.api.ts`, `api/nasiya.api.ts`, `api/catalog.api.ts`, `api/branches.api.ts`, `api/index.ts` |
| T-141 | 2026-03-01 | Sales ekranlar — SalesListScreen (FlatList, page-based pagination, pull-to-refresh, Branch/date/total ko'rsatish), SaleDetailScreen (order items list, totals, cashier/branch/paymentMethod info) | `screens/Sales/index.tsx`, `screens/Sales/SaleDetail.tsx` |
| T-142 | 2026-03-01 | Alerts ekranlar — AlertsListScreen (8 xil alert type emoji ikonkalar, read/unread rang farqi #eff6ff, 30s auto-refetch), AlertDetailScreen (ochilganda avto mark-as-read useMutation, queryClient invalidation) | `screens/Alerts/index.tsx`, `screens/Alerts/AlertDetail.tsx` |
| T-143 | 2026-03-01 | Settings ekranlar — SettingsScreen (user info card, logout confirm Alert.alert), ProfileScreen (avatar initials, read-only: email/name/role), NotificationPrefsScreen | `screens/Settings/index.tsx`, `screens/Settings/Profile.tsx`, `screens/Settings/NotificationPrefs.tsx` |
| T-144 | 2026-03-01 | Push notifications (client) — useNotifications hook (Device.isDevice check, permission request, Expo push token → POST /notifications/register-device), in-app notification handler (shouldShowAlert/Sound/Badge) | `hooks/useNotifications.ts`, `notifications/handlers.ts` |
| T-145 | 2026-03-01 | Common komponentlar — Card (shadow, borderRadius), Badge (success/error/warning/info 4 variant), LoadingSpinner (message + ActivityIndicator), ErrorView (extractErrorMessage, Qayta urinish button), EmptyState (icon + message), TrendIndicator (qizil/yashil arrow + %), ScreenLayout (ScrollView + PullToRefresh) | `components/common/Card.tsx`, `components/common/Badge.tsx`, `components/common/LoadingSpinner.tsx`, `components/common/ErrorView.tsx`, `components/common/EmptyState.tsx`, `components/charts/TrendIndicator.tsx`, `components/layout/ScreenLayout.tsx` |
| T-146 | 2026-03-01 | i18n — uz/ru/en JSON tarjima fayllari (auth, dashboard, sales, nasiya, inventory, alerts, settings, common kalitlar), react-i18next setup, initI18n async loader, fallback: uz | `i18n/uz.json`, `i18n/ru.json`, `i18n/en.json`, `i18n/index.ts` |

| T-150 | 2026-03-01 | Navigation bug fix — `navigation.replace('Auth')` xatosi: RootNavigator faqat 1 screen registerlardi. Fix: `onboardingDone` zustand app.store ga ko'chirildi, OnboardingScreen `setOnboardingDone(true)` chaqiradi, RootNavigator barcha screenlarni registerlaydi | `store/app.store.ts`, `navigation/RootNavigator.tsx`, `screens/Onboarding/index.tsx` |
| T-151 | 2026-03-01 | Maestro E2E test setup — Android emulator (Pixel_7) da Maestro 2.2.0 o'rnatildi, 7 ta flow yaratildi: onboarding (skip/full), login UI, login validation, tab navigation, settings, inventory. Login + validation testlar PASSED ✅. Tab/Settings/Inventory testlar backend :3000 talab etadi. | `apps/mobile/.maestro/*.yaml` |
| T-152 | 2026-03-02 | Dev seed — 5 rol uchun test accountlar: OWNER/ADMIN/MANAGER/CASHIER/VIEWER, tenant slug: raos-demo, parol: Demo1234!. ts-node devDeps ga qo'shildi, prisma:seed script. | `apps/api/prisma/seed.ts`, `apps/api/package.json` |
| T-153 | 2026-03-02 | Real Estate module (mobile) — realEstateApi (getProperties, getProperty, getStats, getRentalPayments, getAllPayments), PropertiesScreen (mulklar ro'yxati + StatsCard overview), PropertyDetailScreen (moliyaviy + ijara ma'lumotlari), RentalPaymentsScreen (to'lovlar tarixi). RealEstateTab TabNavigator ga qo'shildi. RealEstateStackParamList navigation types ga qo'shildi. | `api/realestate.api.ts`, `screens/RealEstate/index.tsx`, `screens/RealEstate/PropertyDetail.tsx`, `screens/RealEstate/RentalPayments.tsx`, `navigation/types.ts`, `navigation/TabNavigator.tsx` |
| T-154 | 2026-03-02 | AI Insights module (mobile) — AIInsightsScreen (filter: ALL/TREND/DEADSTOCK/MARGIN/FORECAST), TrendCard (emoji + priority badge + tavsif), AIInsightsTab TabNavigator ga qo'shildi, AIInsightsStackParamList types ga qo'shildi. analyticsApi.getInsights dan data olinadi. | `screens/AIInsights/index.tsx`, `screens/AIInsights/TrendCard.tsx`, `navigation/types.ts`, `navigation/TabNavigator.tsx` |
| T-155 | 2026-03-02 | Chart komponentlar — MiniChart (sparkline bars, flex-based, isLast bar highlight), BarChart (vertikal ustunlar, formatValue prop, label + value ko'rsatish). React Native native Views ishlatiladi (kutubxonasiz). | `components/charts/MiniChart.tsx`, `components/charts/BarChart.tsx` |
| T-156 | 2026-03-02 | Kengaytirilgan testlar — hooks.test.ts (useDashboard: 5 test — fields, revenue data, branchId passing, loading state, quickStats), screens.test.tsx (TrendCard: 7 test, MiniChart: 4 test, BarChart: 4 test). Jami: 45 test, hammasi PASSED ✅. | `__tests__/hooks.test.ts`, `__tests__/screens.test.tsx` |
| T-157 | 2026-03-02 | i18n kengaytirish — uz/ru/en da `realestate` va `insights` bo'limlari qo'shildi (30+ kalit har tilda). nav da `realestate` va `insights` tarjimalari qo'shildi. | `i18n/uz.json`, `i18n/ru.json`, `i18n/en.json` |
| T-158 | 2026-03-02 | Maestro test fix + kengaytirish — 02_login.yaml: "Dashboard" → "Bosh sahifa" (uz tarjima) tuzatildi. 07_all_tabs.yaml config.yaml ga qo'shildi (jami 8 flow). hooks.test.ts TS2532 xatosi (data?.[0].period → data?.[0]?.period) tuzatildi. Jami 45 test PASSED ✅. | `.maestro/02_login.yaml`, `.maestro/config.yaml`, `src/__tests__/hooks.test.ts` |
| T-159 | 2026-03-02 | 404 xato global hal — `safeQueryFn<T>()` utils/error.ts ga qo'shildi (backend endpoint 404/501 → bo'sh fallback, real xatolar throw). useDashboard local safe() → shared safeQueryFn. Barcha ekranlar tuzatildi: Sales, Alerts, Inventory, LowStockList, AIInsights, RealEstate (stats+properties), useNasiya hook. Natija: backend endpoint yo'q bo'lsa ErrorView emas, EmptyState ko'rinadi. TypeScript tozа, 45 test PASSED ✅. | `utils/error.ts`, `hooks/useDashboard.ts`, `hooks/useNasiya.ts`, `screens/Sales/index.tsx`, `screens/Alerts/index.tsx`, `screens/Inventory/index.tsx`, `screens/Inventory/LowStockList.tsx`, `screens/AIInsights/index.tsx`, `screens/RealEstate/index.tsx` |

| T-160 | 2026-03-02 | Mobile backend endpoints — 16 ta endpoint yaratildi: GET /auth/branches (identity.service getBranches + demo fallback); Sales: GET /sales/orders (paginated), /orders/:id, /quick-stats, /shifts/active; Analytics: GET /analytics/revenue, /branches/comparison, /insights (ai module ga AnalyticsController qo'shildi); Notifications: GET /notifications/alerts, PATCH /alerts/:id/read, POST /register-device (yangi controller + module yangilandi); Nasiya module (yangi): GET /nasiya/debtors, /debtors/:id, POST /payments, /debtors/:id/remind; Inventory: GET /inventory/stock, /stock/low; RealEstate: path real-estate→realestate tuzatildi, GET /properties, /stats, /properties/:id, /properties/:id/payments, /payments. Barcha mock data — Uzbek cosmetics store kontekstida. 16/16 endpoint ✅. | `apps/api/src/` (sales, inventory, ai/analytics.controller, notifications, nasiya/*, realestate, identity/auth.controller, identity-info.controller), `apps/mobile/src/api/branches.api.ts` |

---

*docs/Done.md | RAOS*
