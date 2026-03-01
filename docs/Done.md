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

---

*docs/Done.md | RAOS*
