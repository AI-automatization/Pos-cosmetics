# CLAUDE_MOBILE.md — RAOS Mobile Engineer Guide
# React Native · Android + IOS · TypeScript · Expo
# Claude CLI bu faylni Ibrat (Android) yoki Abdulaziz (IOS) tanlanganda o'qiydi

---

## 👋 ZONA

```
apps/mobile/src/
  screens/          → Ekranlar (navigation = 1 screen)
  components/       → Qayta ishlatiluvchi komponentlar
  hooks/            → Custom React Native hooks
  api/              → HTTP client va endpoint lar
  navigation/       → React Navigation config
  store/            → Global state (zustand)
  utils/            → Yordamchi funksiyalar
  config/           → Konfiguratsiya
  i18n/             → Tarjimalar (uz, ru, en)
  assets/           → Images, fonts, icons
  notifications/    → Push notification handlers
```

**🚫 TEGINMA:**
- `apps/api/` — Polat zonasi (Backend)
- `apps/worker/` — Polat zonasi (Worker)
- `apps/bot/` — Polat zonasi (Bot)
- `apps/web/` — AbdulazizYormatov zonasi (Admin Panel)
- `apps/pos/` — AbdulazizYormatov zonasi (POS Desktop)
- `prisma/` — Polat zonasi (Database)

---

## 📱 PLATFORMA

```
✅ Android (Ibrat — React Native)
✅ iOS (Abdulaziz — React Native)
✅ Expo (agar mumkin bo'lsa)
✅ Push notifications (FCM)
✅ Biometric auth (fingerprint)
```

---

## 🎯 MOBILE APP VAZIFASI

> **Mobile = Owner Dashboard** — monitoring va alertlar.
> ⚠️ Mobile da FINANCIAL MUTATIONS TAQIQLANGAN!

### Nima MUMKIN (Read + Alerts):

```
✅ Revenue summary (kunlik, haftalik, oylik)
✅ Branch comparison
✅ Low stock alerts
✅ Rental payment alerts (real estate)
✅ Suspicious activity alerts
✅ AI recommendations / insights
✅ Sales history ko'rish
✅ Inventory levels ko'rish
✅ Employee activity ko'rish
✅ Push notification qabul qilish
```

### Nima TAQIQLANGAN (Financial Mutations):

```
❌ Sotuv yaratish
❌ To'lov qabul qilish
❌ Narx o'zgartirish
❌ Inventar manual adjustment
❌ Ledger entry yaratish
❌ Fiscal receipt yuborish
❌ Refund/return ishlov berish
```

---

## 🏗️ ARXITEKTURA

### 1. Fayl Tuzilishi — Max 250 Qator

```
apps/mobile/src/
  screens/
    Dashboard/
      index.tsx                  // Main dashboard
      RevenueCard.tsx            // Revenue summary card
      BranchComparison.tsx       // Branch comparison chart
      AlertsList.tsx             // Active alerts
      useDashboardData.ts        // Screen-specific hook
    Sales/
      index.tsx                  // Sales history
      SaleDetail.tsx             // Single sale detail
      useSalesData.ts
    Inventory/
      index.tsx                  // Stock levels
      LowStockList.tsx           // Low stock items
      useInventoryData.ts
    RealEstate/
      index.tsx                  // Properties overview
      PropertyDetail.tsx
      RentalPayments.tsx
      useRealEstateData.ts
    AIInsights/
      index.tsx                  // AI recommendations
      TrendCard.tsx
      useInsightsData.ts
    Settings/
      index.tsx
      Profile.tsx
      NotificationPrefs.tsx
    Auth/
      LoginScreen.tsx
      BiometricScreen.tsx
  components/
    common/
      Card.tsx
      Badge.tsx
      LoadingSpinner.tsx
      ErrorView.tsx
      EmptyState.tsx
      PullToRefresh.tsx
    charts/
      MiniChart.tsx
      BarChart.tsx
      TrendIndicator.tsx
    layout/
      ScreenLayout.tsx
      BottomTabBar.tsx
  navigation/
    RootNavigator.tsx
    TabNavigator.tsx
    AuthNavigator.tsx
    types.ts                     // Navigation type definitions
```

### 2. `any` TAQIQLANGAN

```typescript
// ❌
function Card({ data }: { data: any }) { ... }

// ✅
interface RevenueCardProps {
  readonly period: 'daily' | 'weekly' | 'monthly';
  readonly amount: number;
  readonly currency: string;
  readonly trend: number;       // percentage change
  readonly branchName: string;
}
function RevenueCard(props: RevenueCardProps) { ... }
```

### 3. Custom Hook Pattern

```typescript
// hooks/useDashboard.ts
export function useDashboard(branchId?: string) {
  const revenue = useQuery({
    queryKey: ['dashboard', 'revenue', branchId],
    queryFn: () => analyticsApi.getRevenue(branchId),
    refetchInterval: 60_000,    // har 1 daqiqada yangilash
  });

  const alerts = useQuery({
    queryKey: ['dashboard', 'alerts', branchId],
    queryFn: () => alertsApi.getActive(branchId),
    refetchInterval: 30_000,    // har 30 sekund
  });

  const branches = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchApi.getAll(),
    staleTime: 300_000,         // 5 daqiqa cache
  });

  return { revenue, alerts, branches };
}

// Screen — faqat render:
export function DashboardScreen() {
  const { revenue, alerts, branches } = useDashboard();

  if (revenue.isLoading) return <LoadingSpinner />;
  if (revenue.error) return <ErrorView error={revenue.error} onRetry={revenue.refetch} />;

  return (
    <ScreenLayout title="Dashboard">
      <PullToRefresh onRefresh={revenue.refetch}>
        <RevenueCard data={revenue.data} />
        <BranchComparison branches={branches.data} />
        <AlertsList alerts={alerts.data} />
      </PullToRefresh>
    </ScreenLayout>
  );
}
```

### 4. Error Handling

```typescript
// ❌ Xato yutiladi
} catch (err) { console.error(err); }

// ✅ User-facing error
export function extractErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    if (!err.response) return 'Internet aloqasi yo\'q';
    return (err.response.data?.message as string) ?? 'Server xatosi';
  }
  if (err instanceof Error) return err.message;
  return 'Kutilmagan xato';
}

// ErrorView component:
export function ErrorView({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.errorText}>{extractErrorMessage(error)}</Text>
      <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
        <Text>Qayta urinish</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### 5. API Client

```
apps/mobile/src/api/
  client.ts              → axios instance + interceptors
  auth.api.ts            → authApi (login, refresh, biometric)
  analytics.api.ts       → analyticsApi (revenue, trends)
  inventory.api.ts       → inventoryApi (stock levels, alerts)
  sales.api.ts           → salesApi (history, details — READ ONLY)
  branches.api.ts        → branchApi (list, comparison)
  realestate.api.ts      → realestateApi (properties — READ ONLY)
  alerts.api.ts          → alertsApi (active alerts)
  index.ts               → re-export
```

### 6. Axios Interceptors (MAJBURIY)

```typescript
// Token management — SecureStore (Expo) yoki EncryptedStorage
import * as SecureStore from 'expo-secure-store';

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        const { data } = await api.post('/auth/refresh', { token: refreshToken });
        await SecureStore.setItemAsync('access_token', data.access_token);
        err.config.headers.Authorization = `Bearer ${data.access_token}`;
        return api(err.config);
      } catch {
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        // Navigate to login
        navigationRef.reset({ index: 0, routes: [{ name: 'Auth' }] });
      }
    }
    return Promise.reject(err);
  },
);
```

---

## 🔔 PUSH NOTIFICATIONS

```typescript
// FCM (Firebase Cloud Messaging) — Android only:
export function useNotifications() {
  useEffect(() => {
    // 1. Permission so'rash
    // 2. FCM token olish
    // 3. Backend ga token yuborish
    // 4. Notification handler o'rnatish

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      // In-app notification ko'rsatish
      showLocalNotification(remoteMessage);
    });

    return unsubscribe;
  }, []);
}

// Notification types:
type NotificationType =
  | 'LOW_STOCK'              // Kam qolgan tovar
  | 'LARGE_SALE'             // Katta summa sotuv
  | 'RENTAL_PAYMENT_DUE'    // Ijara to'lovi muddati
  | 'SUSPICIOUS_ACTIVITY'   // Shubhali harakat
  | 'AI_INSIGHT'            // AI tavsiya
  | 'SHIFT_OPENED'          // Smena ochildi
  | 'SHIFT_CLOSED'          // Smena yopildi
  | 'SYSTEM_ALERT';         // Tizim ogohlantirlishi
```

---

## 🔐 AUTHENTICATION

```typescript
// Biometric auth (fingerprint):
export function useBiometricAuth() {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then(setIsAvailable);
  }, []);

  const authenticate = useCallback(async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Barmoq izi bilan kiring',
      cancelLabel: 'Bekor qilish',
    });
    return result.success;
  }, []);

  return { isAvailable, authenticate };
}

// Auth flow:
// 1. Login (email + password) → tokens saved to SecureStore
// 2. Next app open → biometric check → auto-login with saved tokens
// 3. Token expired → silent refresh
// 4. Refresh failed → redirect to login
```

---

## 🎨 DESIGN SYSTEM (MOBILE)

```
1. React Native StyleSheet (NO inline styles)
2. Consistent spacing: 4, 8, 12, 16, 24, 32
3. Font sizes: 12, 14, 16, 18, 20, 24, 28, 32
4. Colors: semantic tokens from shared theme
   - primary, secondary
   - success, error, warning, info
   - background, surface, text
5. Dark/Light theme support
6. Touch targets: minimum 48x48dp
7. Card-based layout (mobile-friendly)
8. Pull-to-refresh on all list screens
9. Skeleton loading (no spinners for initial load)
10. Status bar: themed to match app
```

---

## 🌍 I18N

```typescript
// Supported: uz, ru, en
// Same keys as web where possible

const { t } = useTranslation();
<Text>{t('dashboard.revenue')}</Text>
<Text>{t('alerts.lowStock')}</Text>

// ⚠️ Hardcoded text TAQIQLANGAN!
```

---

## 📊 NAVIGATION STRUCTURE

```
AuthNavigator
  ├── LoginScreen
  └── BiometricScreen

TabNavigator (authenticated)
  ├── DashboardTab
  │   ├── DashboardScreen
  │   └── BranchDetailScreen
  ├── SalesTab
  │   ├── SalesListScreen
  │   └── SaleDetailScreen
  ├── InventoryTab
  │   ├── StockLevelsScreen
  │   └── LowStockScreen
  ├── AlertsTab
  │   ├── AlertsListScreen
  │   └── AlertDetailScreen
  └── SettingsTab
      ├── ProfileScreen
      ├── NotificationPrefsScreen
      └── BranchSelectorScreen

// Real Estate (agar tenant da bor bo'lsa):
  ├── RealEstateTab
  │   ├── PropertiesScreen
  │   ├── PropertyDetailScreen
  │   └── RentalPaymentsScreen
```

---

## 🧪 TESTING

```typescript
// Component tests:
describe('RevenueCard', () => {
  it('renders revenue amount correctly', () => {
    render(<RevenueCard amount={1500000} currency="UZS" trend={5.2} />);
    expect(screen.getByText('1,500,000 UZS')).toBeTruthy();
    expect(screen.getByText('+5.2%')).toBeTruthy();
  });
});

// Hook tests:
describe('useDashboard', () => {
  it('fetches dashboard data on mount', async () => {
    const { result } = renderHook(() => useDashboard());
    await waitFor(() => expect(result.current.revenue.isSuccess).toBe(true));
  });
});
```

---

## ⚡ PERFORMANCE

```
1. FlatList for all lists (ScrollView EMAS)
2. Image caching (FastImage yoki Expo Image)
3. Memoization: React.memo for list items
4. Lazy screens: React.lazy + Suspense
5. Bundle size monitoring
6. Network request batching where possible
7. Offline-first approach for dashboard cache
```

---

## 🚫 TAQIQLANGAN

```
❌ apps/api/ papkasiga TEGINMA (Polat zonasi)
❌ apps/web/ papkasiga TEGINMA (AbdulazizYormatov zonasi)
❌ apps/pos/ papkasiga TEGINMA (AbdulazizYormatov zonasi)
❌ prisma/ papkasiga TEGINMA (Polat zonasi)
❌ Financial mutations (sale, payment, refund, ledger)
❌ any type
❌ console.log production da
❌ Inline styles → StyleSheet.create
❌ ScrollView for long lists → FlatList
❌ 250+ qatorli komponent → bo'lish kerak
❌ Hardcoded text → i18n
❌ Token plaintext saqlash → SecureStore/EncryptedStorage
✅ iOS va Android — ikkala platforma uchun yozish
```

---

*CLAUDE_MOBILE.md | RAOS | v1.0*
