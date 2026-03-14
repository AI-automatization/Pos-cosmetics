# RAOS Owner Mobile App — Claude Web Prompt
# Bu faylni Claude.ai web versiyasiga to'liq copy-paste qilib bering.
# Keyin "Quyidagi faylni yoz:" deb buyruq bering.

---

## SYSTEM CONTEXT (o'qib ol, keyin kod yoz)

Sen **RAOS Owner Mobile App** dagi React Native dasturchi sifatida ishlaysan.

### App nima?
**RAOS Owner App** — biznes egasi uchun READ-ONLY monitoring ilovasi.
- Hech qanday financial mutation YO'Q (sotuv, to'lov, inventar o'zgartirish — TAQIQLANGAN)
- Faqat ko'rish va ogohlantirishlar qabul qilish
- Multi-branch: bir nechta filial birdan kuzatiladi

---

## TECH STACK

```
Framework:        React Native + Expo SDK 55 (RN 0.83)
Language:         TypeScript strict mode — `any` TAQIQLANGAN
State:            Zustand ^4
Server State:     TanStack React Query ^5
Navigation:       React Navigation v6 (bottom-tabs + native-stack)
HTTP Client:      Axios ^1 (interceptors bilan)
Storage:          AsyncStorage (tokens + cache)
Biometric:        expo-local-authentication
Push:             expo-notifications (FCM)
Charts:           victory-native 36 + react-native-svg
Icons:            @expo/vector-icons (Ionicons)
i18n:             i18next ^23 + react-i18next (uz, ru, en)
Safe Area:        react-native-safe-area-context
Gestures:         react-native-gesture-handler
```

**package.json dependencies:**
```json
{
  "@expo/vector-icons": "^15.1.1",
  "@react-native-async-storage/async-storage": "2.2.0",
  "@react-navigation/bottom-tabs": "^6",
  "@react-navigation/native": "^6",
  "@react-navigation/native-stack": "^6",
  "@tanstack/react-query": "^5",
  "axios": "^1",
  "expo": "~55.0.5",
  "expo-local-authentication": "~55.0.8",
  "expo-notifications": "~55.0.12",
  "expo-secure-store": "~55.0.8",
  "i18next": "^23",
  "react": "19.2.0",
  "react-i18next": "^14",
  "react-native": "0.83.2",
  "react-native-gesture-handler": "^2.30.0",
  "react-native-safe-area-context": "~5.6.2",
  "react-native-screens": "^4.24.0",
  "react-native-svg": "15.15.3",
  "victory-native": "36",
  "zustand": "^4"
}
```

---

## DESIGN SYSTEM (src/config/theme.ts)

```typescript
export const Colors = {
  bgApp: '#F8FAFC',
  bgSurface: '#FFFFFF',
  bgSubtle: '#F1F5F9',

  primary: '#1E40AF',
  primaryLight: '#EFF6FF',
  primaryMid: '#3B82F6',

  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  info: '#0891B2',
  infoLight: '#E0F2FE',
  purple: '#7C3AED',
  purpleLight: '#EDE9FE',
  orange: '#EA580C',
  orangeLight: '#FFEDD5',

  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',

  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  separator: '#F3F4F6',
  unreadBg: '#EFF6FF',
  unreadDot: '#1E40AF',
} as const;

export const Radii = {
  sm: 6, md: 10, lg: 16, xl: 20, pill: 999,
} as const;

export const Shadows = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardStrong: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 5,
  },
} as const;

export const Typography = {
  h1: { fontSize: 28, fontWeight: '800' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '700' as const },
  h4: { fontSize: 16, fontWeight: '700' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  bodyMedium: { fontSize: 14, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  captionMedium: { fontSize: 12, fontWeight: '600' as const },
  label: { fontSize: 11, fontWeight: '600' as const },
} as const;
```

---

## CONFIG (src/config/constants.ts)

```typescript
export const DASHBOARD_REFETCH_INTERVAL = 60_000;
export const ALERTS_REFETCH_INTERVAL = 30_000;
export const HEALTH_REFETCH_INTERVAL = 15_000;
export const QUERY_STALE_TIME = 120_000;
export const APP_LOCK_TIMEOUT_MS = 300_000;
export const MAX_RETRIES = 3;
export const LOW_STOCK_THRESHOLD_DAYS = 30;
export const ONBOARDING_STEPS_COUNT = 5;
```

---

## NAVIGATION TYPES (src/navigation/types.ts)

```typescript
export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Biometric: undefined;
};

export type OnboardingStackParamList = {
  Onboarding: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Analytics: undefined;
  Inventory: undefined;
  Debts: undefined;
  Shifts: { shiftId?: string } | undefined;
  Employees: { employeeId?: string } | undefined;
  Alerts: undefined;
  Settings: undefined;
};
```

---

## APP.TSX (root)

```typescript
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './src/i18n';
import { setupNotificationHandlers } from './src/notifications/handler';
import RootNavigator from './src/navigation/RootNavigator';
import { MAX_RETRIES, QUERY_STALE_TIME } from './src/config/constants';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: MAX_RETRIES, staleTime: QUERY_STALE_TIME },
  },
});

export default function App() {
  useEffect(() => { setupNotificationHandlers(); }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

---

## EXISTING FILE STRUCTURE (hammasi mavjud)

```
apps/mobile-owner/
  App.tsx
  index.ts
  app.json
  package.json
  tsconfig.json

  src/
    api/
      client.ts              ✅ Axios instance + 401 interceptor
      auth.api.ts            ✅ login, refresh, biometric
      analytics.api.ts       ✅ revenue, salesTrend, branchComparison, topProducts
      inventory.api.ts       ✅ getStock, getLowStock, getExpiring
      debts.api.ts           ✅ getSummary, getAgingReport, getCustomers
      shifts.api.ts          ✅ getShifts, getShiftById
      employees.api.ts       ✅ getPerformance, getSuspiciousActivity
      alerts.api.ts          ✅ getAlerts, markRead, markAllRead, getUnreadCount
      branches.api.ts        ✅ getBranches
      system.api.ts          ✅ getHealth, getSyncStatus, getErrors
      index.ts               ✅ re-exports

    components/
      common/
        Card.tsx             ✅
        Badge.tsx            ✅
        LoadingSpinner.tsx   ✅
        SkeletonCard.tsx     ✅
        SkeletonList.tsx     ✅
        ErrorView.tsx        ✅
        EmptyState.tsx       ✅
        PullToRefresh.tsx    ✅
        StatusIndicator.tsx  ✅
        TrendBadge.tsx       ✅
        CurrencyText.tsx     ✅
        FilterSheet.tsx      ✅
      charts/
        LineChartWidget.tsx  ✅
        BarChartWidget.tsx   ✅
        HorizontalBarChart.tsx ✅
        PieChartWidget.tsx   ✅
        AgingBucketChart.tsx ✅
      layout/
        ScreenLayout.tsx     ✅
        HeaderBranchSelector.tsx ✅
        BranchSelectorSheet.tsx  ✅
        SectionHeader.tsx    ✅

    config/
      constants.ts   ✅
      endpoints.ts   ✅
      queryKeys.ts   ✅
      theme.ts       ✅

    hooks/
      useDashboard.ts        ✅
      useAnalytics.ts        ✅
      useInventory.ts        ✅
      useDebts.ts            ✅
      useShifts.ts           ✅
      useEmployees.ts        ✅
      useAlerts.ts           ✅
      useSystemHealth.ts     ✅
      useBiometricAuth.ts    ✅
      useNotifications.ts    ✅
      usePeriodFilter.ts     ✅
      useCurrency.ts         ✅

    i18n/
      index.ts
      locales/uz.json  ✅
      locales/ru.json  ✅
      locales/en.json  ✅

    navigation/
      RootNavigator.tsx      ✅
      AuthNavigator.tsx      ✅
      OnboardingNavigator.tsx ✅
      TabNavigator.tsx       ✅
      types.ts               ✅

    notifications/
      setup.ts     ✅
      handler.ts   ✅
      types.ts     ✅

    screens/
      Auth/
        LoginScreen.tsx       ✅
        BiometricScreen.tsx   ✅
      Onboarding/
        OnboardingScreen.tsx  ✅
        steps/WelcomeStep.tsx      ✅
        steps/MonitorStep.tsx      ✅
        steps/BranchStep.tsx       ✅
        steps/AlertsStep.tsx       ✅
        steps/AnalyticsStep.tsx    ✅
      Dashboard/
        index.tsx             ✅
        RevenueSummaryGrid.tsx ✅
        SalesTrendChart.tsx   ✅
        BranchComparisonChart.tsx ✅
        TopProductsChart.tsx  ✅
        LowStockAlertList.tsx ✅
        useDashboardData.ts   ✅
      Analytics/
        index.tsx             ✅
        RevenueByBranchChart.tsx ✅
        OrdersByBranchChart.tsx  ✅
        StockValueByBranch.tsx   ✅
        useAnalyticsData.ts   ✅
      Inventory/
        index.tsx             ✅
        InventoryList.tsx     ✅
        InventoryItemRow.tsx  ✅
        useInventoryData.ts   ✅
      Debts/
        index.tsx             ✅
        DebtSummaryCards.tsx  ✅
        AgingReportChart.tsx  ✅
        CustomerDebtList.tsx  ✅
        CustomerDebtRow.tsx   ✅
        useDebtsData.ts       ✅
      Shifts/
        index.tsx             ✅
        ShiftList.tsx         ✅
        ShiftRow.tsx          ✅
        ShiftDetailScreen.tsx ✅
        PaymentBreakdownChart.tsx ✅
        useShiftsData.ts      ✅
      Employees/
        index.tsx             ✅
        EmployeeList.tsx      ✅
        EmployeeCard.tsx      ✅
        SuspiciousActivityList.tsx ✅
        useEmployeesData.ts   ✅
      Alerts/
        index.tsx             ✅
        AlertList.tsx         ✅
        AlertRow.tsx          ✅
        AlertDetailScreen.tsx ✅
        useAlertsData.ts      ✅
      SystemHealth/
        index.tsx             ✅
        ServiceStatusCard.tsx ✅
        SyncStatusList.tsx    ✅
        RecentErrorsList.tsx  ✅
        useSystemHealthData.ts ✅
      Settings/
        index.tsx             ✅
        ProfileScreen.tsx     ✅
        NotificationPrefsScreen.tsx ✅
        LanguageScreen.tsx    ✅
        SecurityScreen.tsx    ✅

    store/
      auth.store.ts           ✅
      branch.store.ts         ✅
      alerts.store.ts         ✅
      onboarding.store.ts     ✅

    utils/
      formatCurrency.ts       ✅
      formatDate.ts           ✅
      extractErrorMessage.ts  ✅
      agingBucket.ts          ✅
```

---

## KEY EXISTING CODE EXAMPLES

### API Client (src/api/client.ts)
```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post<{ access_token: string; refresh_token: string }>(
          `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'}/auth/refresh`,
          { token: refreshToken },
        );
        await AsyncStorage.setItem('access_token', data.access_token);
        await AsyncStorage.setItem('refresh_token', data.refresh_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return apiClient(originalRequest);
      } catch {
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        const { useAuthStore } = await import('../store/auth.store');
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  },
);
```

### Auth Store (src/store/auth.store.ts)
```typescript
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthTokens, User } from '../api/auth.api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: AuthTokens, user: User) => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (v: boolean) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async (tokens, user) => {
    await AsyncStorage.setItem('access_token', tokens.access_token);
    await AsyncStorage.setItem('refresh_token', tokens.refresh_token);
    await AsyncStorage.setItem('user_data', JSON.stringify(user));
    set({ user, isAuthenticated: true, isLoading: false });
  },
  logout: async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data']);
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
  setLoading: (v) => set({ isLoading: v }),
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem('access_token');
      const userJson = token ? await AsyncStorage.getItem('user_data') : null;
      if (token && userJson) {
        set({ user: JSON.parse(userJson) as User, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
```

### Branch Store (src/store/branch.store.ts)
```typescript
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Branch {
  readonly id: string;
  readonly name: string;
  readonly city: string;
  readonly isActive: boolean;
}

interface BranchState {
  selectedBranchId: string | null;
  branches: Branch[];
  selectBranch: (id: string | null) => Promise<void>;
  setBranches: (branches: Branch[]) => void;
  loadPersistedBranch: () => Promise<void>;
}

export const useBranchStore = create<BranchState>((set) => ({
  selectedBranchId: null,
  branches: [],
  selectBranch: async (id) => {
    await AsyncStorage.setItem('selected_branch_id', id ?? 'ALL');
    set({ selectedBranchId: id });
  },
  setBranches: (branches) => set({ branches }),
  loadPersistedBranch: async () => {
    const saved = await AsyncStorage.getItem('selected_branch_id');
    if (saved && saved !== 'ALL') set({ selectedBranchId: saved });
  },
}));
```

### ScreenLayout (src/components/layout/ScreenLayout.tsx)
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderBranchSelector from './HeaderBranchSelector';
import { Colors, Shadows } from '../../config/theme';

interface ScreenLayoutProps {
  title: string;
  showBranchSelector?: boolean;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
}

export default function ScreenLayout({ title, showBranchSelector = true, children, rightAction }: ScreenLayoutProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.headerRight}>
          {showBranchSelector && <HeaderBranchSelector />}
          {rightAction}
        </View>
      </View>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgApp },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    ...Shadows.card,
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.primary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  content: { flex: 1 },
});
```

### Dashboard Screen pattern (src/screens/Dashboard/index.tsx)
```typescript
import React from 'react';
import { FlatList, RefreshControl, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDashboard } from '../../hooks/useDashboard';
import ScreenLayout from '../../components/layout/ScreenLayout';
import SkeletonList from '../../components/common/SkeletonList';
import ErrorView from '../../components/common/ErrorView';
import RevenueSummaryGrid from './RevenueSummaryGrid';
import SalesTrendChart from './SalesTrendChart';
import BranchComparisonChart from './BranchComparisonChart';
import TopProductsChart from './TopProductsChart';
import LowStockAlertList from './LowStockAlertList';
import { useBranchStore } from '../../store/branch.store';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);
  const { revenue, salesTrend, branchComparison, topProducts, lowStock } = useDashboard();

  const sections = [
    { key: 'revenue' }, { key: 'salesTrend' },
    { key: 'branchComparison' }, { key: 'topProducts' }, { key: 'lowStock' },
  ];

  function renderSection({ item }: { item: { key: string } }) {
    switch (item.key) {
      case 'revenue': return revenue.data ? <RevenueSummaryGrid data={revenue.data} /> : null;
      case 'salesTrend': return <SalesTrendChart data={salesTrend.data} />;
      case 'branchComparison': return selectedBranchId === null ? <BranchComparisonChart data={branchComparison.data} /> : null;
      case 'topProducts': return <TopProductsChart data={topProducts.data} />;
      case 'lowStock': return <LowStockAlertList data={lowStock.data} />;
      default: return null;
    }
  }

  const handleRefresh = async () => {
    await Promise.all([revenue.refetch(), salesTrend.refetch(), branchComparison.refetch(), topProducts.refetch(), lowStock.refetch()]);
  };

  if (revenue.isLoading) return <ScreenLayout title={t('dashboard.title')}><SkeletonList count={4} /></ScreenLayout>;
  if (revenue.isError) return <ScreenLayout title={t('dashboard.title')}><ErrorView error={revenue.error} onRetry={() => { void revenue.refetch(); }} /></ScreenLayout>;

  return (
    <ScreenLayout title={t('dashboard.title')}>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.key}
        renderItem={renderSection}
        contentContainerStyle={{ paddingVertical: 12, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={revenue.isFetching} onRefresh={() => { void handleRefresh(); }} />}
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
      />
    </ScreenLayout>
  );
}
```

---

## BACKEND API ENDPOINTS

Backend: `http://localhost:3000` (prod: `https://api.raos.uz`)
Auth: `Authorization: Bearer <access_token>` (JWT, faqat OWNER role)

### Auth
```
POST /auth/login                    → { tokens: { access_token, refresh_token }, user: { id, name, email, role, tenantId } }
POST /auth/refresh                  → { access_token, refresh_token }
POST /auth/logout
POST /auth/biometric/register
POST /auth/biometric/verify
POST /notifications/device-token    → { token, platform }
DELETE /notifications/device-token
```

### Analytics
```
GET /analytics/revenue?branchId=&period=today|week|month|year
    → { today, week, month, year, todayTrend, weekTrend, monthTrend, yearTrend }

GET /analytics/orders?branchId=&period=
    → { total, avgOrderValue, trend }

GET /analytics/sales-trend?branchId=&period=7d|30d
    → { labels: string[], values: number[] }

GET /analytics/branch-comparison?metric=revenue|orders
    → { branches: [{ branchId, branchName, value }] }

GET /analytics/top-products?limit=10&branchId=
    → { products: [{ productId, name, quantity, revenue }] }

GET /analytics/employee-performance?branchId=&period=
    → [{ employeeId, name, orders, revenue, refunds, voids }]

GET /analytics/revenue-by-branch?period=
    → [{ branchId, name, revenue, stockValue, orders }]
```

### Inventory
```
GET /inventory/low-stock?branchId=&limit=20
    → { items: [{ productId, productName, quantity, unit, threshold, status }] }

GET /inventory/items?branchId=&status=normal|low|out_of_stock|expiring|expired&search=&page=&limit=
    → { items: InventoryItem[], total, page }
    InventoryItem: { id, productName, barcode, quantity, unit, branchName, branchId, costPrice, stockValue, reorderLevel, expiryDate, status }

GET /inventory/expiring?branchId=&days=30
    → [{ productId, name, expiryDate, quantity, branchName }]

GET /inventory/out-of-stock?branchId=
    → [{ productId, name, branchName, lastQuantity }]
```

### Shifts
```
GET /shifts?branchId=&status=open|closed&page=&limit=
    → { shifts: Shift[], total, page }
    Shift: { id, branchId, branchName, cashierName, status, openedAt, closedAt, totalRevenue, totalOrders, paymentBreakdown }

GET /shifts/:id
    → Shift with payment breakdown: { cash, card, click, payme }

GET /shifts/summary?branchId=&from_date=&to_date=
    → { totalRevenue, totalOrders, totalShifts, avgRevenuePerShift }
```

### Debts (Nasiya)
```
GET /debts/summary?branchId=
    → { totalDebt, overdueDebt, overdueCount, aging: { current, days30, days60, days90plus } }

GET /debts/aging-report?branchId=
    → { buckets: [{ label, amount, customerCount }] }

GET /debts/customers?branchId=&status=current|overdue&page=&limit=
    → { customers: CustomerDebt[], total, page }
    CustomerDebt: { customerId, customerName, phone, totalDebt, overdueAmount, lastPaymentDate, daysPastDue }
```

### Employees
```
GET /employees/performance?branchId=&period=today|week|month
    → { employees: [{ employeeId, employeeName, role, branchName, totalOrders, totalRevenue, totalRefunds, refundRate, totalVoids, suspiciousActivityCount }] }

GET /employees/:id/suspicious-activity?limit=20
    → { activities: [{ id, type, description, orderId?, amount?, createdAt }] }
    Types: EXCESSIVE_VOIDS | LARGE_DISCOUNT | RAPID_REFUNDS | OFF_HOURS_ACTIVITY
```

### Alerts
```
GET /notifications/alerts?type=&isRead=&branchId=&page=&limit=
    → { alerts: Alert[], unreadCount, total, page }
    Alert: { id, type, description, branchName, branchId, isRead, createdAt, metadata? }
    Types: LOW_STOCK | OUT_OF_STOCK | EXPIRY_WARNING | LARGE_REFUND | SUSPICIOUS_ACTIVITY | SHIFT_CLOSED | SYSTEM_ERROR | NASIYA_OVERDUE

PUT /notifications/alerts/:id/read → { success: true }
PUT /notifications/alerts/read-all → { success: true, count: number }
GET /notifications/alerts/unread-count?branchId= → { count: number }
```

### Branches
```
GET /branches → [{ id, name, city, isActive }]
GET /branches/:id → Branch with address, manager, contact
```

### System Health
```
GET /system/health
    → { services: [{ name, status: 'ok'|'warn'|'error', latencyMs }], syncStatus: [...], recentErrors: [...] }

GET /system/sync-status
    → [{ branchId, branchName, lastSyncAt, pendingCount, status }]

GET /system/errors?from_date=&level=error|warn&limit=50
    → [{ message, service, timestamp, level }]
```

---

## CODING RULES (MAJBURIY)

```
❌ any type — TypeScript strict
❌ console.log — faqat DEV mode da
❌ Inline styles — StyleSheet.create()
❌ ScrollView for long lists — FlatList
❌ 250+ qatorli komponent — bo'lish kerak
❌ Hardcoded text — i18n keys ishlatish
❌ Financial mutation (sale, payment, ledger) API calllar
✅ readonly props interfaces
✅ Custom hook pattern for all data fetching
✅ Pull-to-refresh on all list screens
✅ Skeleton loading on initial load
✅ ErrorView with retry on all screens
✅ FlatList + keyExtractor for all lists
✅ Colors, Radii, Shadows from theme.ts (hardcoded colors TAQIQLANGAN)
✅ i18n keys for all text
✅ iOS + Android ikkala platforma
```

---

## DATA TYPES (TypeScript interfaces)

```typescript
interface InventoryItem {
  readonly id: string;
  readonly productName: string;
  readonly barcode: string;
  readonly quantity: number;
  readonly unit: string;
  readonly branchName: string;
  readonly branchId: string;
  readonly costPrice: number;
  readonly stockValue: number;
  readonly reorderLevel: number;
  readonly expiryDate: string | null;
  readonly status: 'normal' | 'low' | 'out_of_stock' | 'expiring' | 'expired';
}

interface CustomerDebt {
  readonly customerId: string;
  readonly customerName: string;
  readonly phone: string;
  readonly branchName: string;
  readonly totalDebt: number;
  readonly overdueAmount: number;
  readonly daysPastDue: number;
  readonly lastPaymentDate: string;
}

interface Shift {
  readonly id: string;
  readonly branchId: string;
  readonly branchName: string;
  readonly cashierId: string;
  readonly cashierName: string;
  readonly openedAt: string;
  readonly closedAt: string | null;
  readonly status: 'open' | 'closed';
  readonly totalRevenue: number;
  readonly totalOrders: number;
  readonly avgOrderValue: number;
  readonly totalRefunds: number;
  readonly totalVoids: number;
  readonly totalDiscounts: number;
  readonly paymentBreakdown: PaymentBreakdown[];
}

interface PaymentBreakdown {
  readonly method: 'cash' | 'terminal' | 'click' | 'payme' | 'transfer';
  readonly amount: number;
  readonly percentage: number;
}

interface EmployeePerformance {
  readonly employeeId: string;
  readonly employeeName: string;
  readonly role: string;
  readonly branchName: string;
  readonly totalOrders: number;
  readonly totalRevenue: number;
  readonly avgOrderValue: number;
  readonly totalRefunds: number;
  readonly refundRate: number;
  readonly totalVoids: number;
  readonly totalDiscounts: number;
  readonly discountRate: number;
  readonly suspiciousActivityCount: number;
  readonly alerts: SuspiciousActivityAlert[];
}

interface SuspiciousActivityAlert {
  readonly id: string;
  readonly type: 'EXCESSIVE_VOIDS' | 'LARGE_DISCOUNT' | 'RAPID_REFUNDS' | 'OFF_HOURS_ACTIVITY';
  readonly description: string;
  readonly occurredAt: string;
  readonly severity: 'low' | 'medium' | 'high';
}

interface Alert {
  readonly id: string;
  readonly type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRY_WARNING' | 'LARGE_REFUND' | 'SUSPICIOUS_ACTIVITY' | 'SHIFT_CLOSED' | 'SYSTEM_ERROR' | 'NASIYA_OVERDUE';
  readonly description: string;
  readonly branchName: string;
  readonly branchId: string;
  readonly isRead: boolean;
  readonly createdAt: string;
  readonly metadata?: Record<string, unknown>;
}

interface SystemHealth {
  readonly apiStatus: ServiceStatus;
  readonly databaseStatus: ServiceStatus;
  readonly workerStatus: ServiceStatus;
  readonly fiscalStatus: ServiceStatus;
  readonly uptime: number;
  readonly syncStatuses: BranchSyncStatus[];
  readonly recentErrors: SystemError[];
}

interface ServiceStatus {
  readonly status: 'healthy' | 'degraded' | 'error';
  readonly responseMs?: number;
  readonly message?: string;
}

interface BranchSyncStatus {
  readonly branchId: string;
  readonly branchName: string;
  readonly status: 'synced' | 'pending' | 'offline' | 'error';
  readonly lastSyncAt: string;
  readonly pendingItems: number;
}
```

---

## HOOK PATTERN (MAJBURIY)

```typescript
// hooks/useShifts.ts — namuna
import { useQuery } from '@tanstack/react-query';
import { shiftsApi } from '../api/shifts.api';
import { useBranchStore } from '../store/branch.store';
import { QUERY_KEYS } from '../config/queryKeys';

export function useShifts(status?: 'open' | 'closed') {
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);

  return useQuery({
    queryKey: [QUERY_KEYS.SHIFTS, selectedBranchId, status],
    queryFn: () => shiftsApi.getShifts({ branchId: selectedBranchId ?? undefined, status }),
    staleTime: 60_000,
  });
}
```

---

## SCREEN PATTERN (MAJBURIY)

```typescript
// screens/Shifts/index.tsx — namuna struktura
export default function ShiftsScreen() {
  const { t } = useTranslation();
  const shifts = useShifts();

  if (shifts.isLoading) return <ScreenLayout title="Smenalar"><SkeletonList count={5} /></ScreenLayout>;
  if (shifts.isError) return <ScreenLayout title="Smenalar"><ErrorView error={shifts.error} onRetry={() => { void shifts.refetch(); }} /></ScreenLayout>;

  return (
    <ScreenLayout title={t('shifts.title')}>
      <FlatList
        data={shifts.data?.shifts ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ShiftRow shift={item} />}
        contentContainerStyle={{ paddingVertical: 12, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={shifts.isFetching} onRefresh={() => { void shifts.refetch(); }} />}
        ListEmptyComponent={<EmptyState message={t('shifts.empty')} />}
      />
    </ScreenLayout>
  );
}
```

---

## I18N KEYS FORMAT

```json
// uz.json namuna
{
  "common": {
    "loading": "Yuklanmoqda...",
    "error": "Xatolik yuz berdi",
    "retry": "Qayta urinish",
    "empty": "Ma'lumot topilmadi",
    "allBranches": "Barcha filiallar",
    "currency": "so'm"
  },
  "dashboard": { "title": "Asosiy" },
  "analytics": { "title": "Tahlil" },
  "inventory": { "title": "Inventar", "empty": "Tovarlar topilmadi" },
  "debts": { "title": "Nasiya" },
  "shifts": { "title": "Smenalar", "empty": "Smenalar topilmadi" },
  "employees": { "title": "Xodimlar" },
  "alerts": { "title": "Ogohlantirishlar" },
  "settings": { "title": "Sozlamalar" }
}
```

---

## FORMATTERS (src/utils/)

```typescript
// formatCurrency.ts
export function formatCurrency(amount: number, currency = 'UZS'): string {
  return `${amount.toLocaleString('uz-UZ')} ${currency}`;
}

// formatDate.ts
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('uz-UZ');
}

// extractErrorMessage.ts
export function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as { response?: { data?: { message?: string } } };
    return axiosErr.response?.data?.message ?? 'Server xatosi';
  }
  if (err instanceof Error) return err.message;
  return 'Kutilmagan xato';
}
```

---

## QO'LLANMA: Prompt berish tartibi

Bu kontekstni o'qigandan keyin, quyidagilarni Claude web ga bera olasiz:

1. **Bitta fayl yozish:**
   ```
   src/screens/Shifts/ShiftRow.tsx faylini yoz.
   Shift interfeysi: { id, branchName, cashierName, status: 'open'|'closed', openedAt, closedAt, totalRevenue, totalOrders }
   Dizayn: status badge (🟢 OPEN yashil | 🔴 CLOSED qizil), card style, Colors va Radii dan foydalanish shart.
   ```

2. **Ekranni to'liq yozish:**
   ```
   src/screens/Employees/index.tsx ni to'liq yoz.
   useEmployees hook dan ma'lumot ol, EmployeeCard komponenti ishlatib FlatList ko'rsat.
   Period filter (Bugun/Hafta/Oy) ni usePeriodFilter hook bilan qo'sh.
   ```

3. **Bugni fix qilish:**
   ```
   [fayl kodi shu yerga]
   Muammo: [nima bo'lyapti]
   Fix qil.
   ```

---

*RAOS Owner Mobile | apps/mobile-owner | Expo SDK 55 | RN 0.83 | 2026-03*
