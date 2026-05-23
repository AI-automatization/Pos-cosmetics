# RAOS Mobile — Rol bo'yicha navigatsiya, Dashboard va Ombor

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kassir va Egasi uchun alohida tab navigatsiyasi, Owner Dashboard ekrani va Kassir Ombor (buyurtma) ekranini yaratish.

**Architecture:** `user.role` (CASHIER / OWNER / ADMIN) login dan keyin auth.store dan o'qiladi. TabNavigator rol bo'yicha mos tab set ko'rsatadi. Dashboard — owner uchun real-time statistika. Ombor — kassir uchun filial ombori + bosh omborda buyurtma yozish.

**Tech Stack:** React Native, Expo ~54, React Navigation v6, Zustand, TypeScript strict, React Native StyleSheet (inline styles taqiqlangan)

---

## Fayl tuzilmasi

```
YARATISH:
  apps/mobile/src/screens/Dashboard/index.tsx      — Owner dashboard (to'liq)
  apps/mobile/src/screens/Ombor/index.tsx          — Kassir ombor + buyurtma
  apps/mobile/src/screens/Onboarding/index.tsx     — Birinchi kirish ekrani
  apps/mobile/src/navigation/CashierTabNavigator.tsx — Kassir tabs
  apps/mobile/src/navigation/OwnerTabNavigator.tsx   — Egasi tabs

O'ZGARTIRISH:
  apps/mobile/src/navigation/types.ts              — Yangi tab param listlari
  apps/mobile/src/navigation/RootNavigator.tsx     — Onboarding + rol routing
  apps/mobile/app.json                             — icon, splash config
```

---

## Chunk 1: Texnik tuzatishlar va navigatsiya tiplari

### Task 1: expo-camera version fix

**Fayl:** `apps/mobile/package.json`

- [ ] **Step 1: expo-camera versiyasini yangilash**

```bash
cd apps/mobile
npx expo install expo-camera
```

Expected: `expo-camera@~17.0.x` package.json ga yoziladi

- [ ] **Step 2: Metro cache tozalash**

```bash
npx expo start --clear
```

Expected: "Metro Bundler" boshlanganda camera warning yo'qoladi

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/package.json apps/mobile/node_modules
git add apps/mobile/package.json
git commit -m "fix(mobile): upgrade expo-camera to ~17.0.x"
```

---

### Task 2: Navigation tiplari yangilash

**Fayl:** `apps/mobile/src/navigation/types.ts`

- [ ] **Step 1: Mavjud faylni o'qib chiqish**

Hozirgi holat:
```typescript
export type TabParamList = {
  Dashboard: undefined;
  Savdo: undefined;
  SavdoTarixi: undefined;
  Nasiya: undefined;
  Kirim: undefined;
  Settings: undefined;
};
```

- [ ] **Step 2: Rol bo'yicha alohida param listlari qo'shish**

```typescript
export type AuthStackParamList = {
  Login: undefined;
  Biometric: undefined;
};

export type OnboardingStackParamList = {
  Onboarding: undefined;
};

// Kassir tabs
export type CashierTabParamList = {
  Smena: undefined;
  Savdo: undefined;
  SavdoTarixi: undefined;
  Nasiya: undefined;
  Ombor: undefined;
};

// Egasi tabs
export type OwnerTabParamList = {
  Dashboard: undefined;
  Nasiya: undefined;
  Tovarlar: undefined;
  Settings: undefined;
};

export type SalesStackParamList = {
  SalesList: undefined;
  SaleDetail: { orderId: string; orderNumber: number };
};

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  CashierMain: undefined;
  OwnerMain: undefined;
};
```

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/navigation/types.ts
git commit -m "feat(mobile): add role-based navigation type definitions"
```

---

## Chunk 2: Rol bo'yicha tab navigatorlar

### Task 3: CashierTabNavigator

**Fayl:** `apps/mobile/src/navigation/CashierTabNavigator.tsx`

- [ ] **Step 1: Kassir tab navigator yaratish**

```typescript
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { CashierTabParamList } from './types';
import SmenaScreen from '../screens/Smena';
import SavdoScreen from '../screens/Savdo';
import SalesNavigator from './SalesNavigator';
import NasiyaScreen from '../screens/Nasiya';
import OmborScreen from '../screens/Ombor';

const Tab = createBottomTabNavigator<CashierTabParamList>();

const PRIMARY = '#5B5BD6';
const INACTIVE = '#9CA3AF';

const TAB_STYLE = {
  height: 64,
  paddingBottom: 8,
  paddingTop: 6,
  backgroundColor: '#FFFFFF',
  borderTopWidth: 1,
  borderTopColor: '#F3F4F6',
} as const;

const LABEL_STYLE = {
  fontSize: 11,
  fontWeight: '600' as const,
};

export default function CashierTabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: TAB_STYLE,
        tabBarLabelStyle: LABEL_STYLE,
      }}
    >
      <Tab.Screen
        name="Smena"
        component={SmenaScreen}
        options={{
          tabBarLabel: 'Smena',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'time' : 'time-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Savdo"
        component={SavdoScreen}
        options={{
          tabBarLabel: t('savdo.title'),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'cart' : 'cart-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SavdoTarixi"
        component={SalesNavigator}
        options={{
          tabBarLabel: 'Tarix',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Nasiya"
        component={NasiyaScreen}
        options={{
          tabBarLabel: 'Nasiya',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'card' : 'card-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Ombor"
        component={OmborScreen}
        options={{
          tabBarLabel: 'Ombor',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'cube' : 'cube-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/src/navigation/CashierTabNavigator.tsx
git commit -m "feat(mobile): add CashierTabNavigator with Ombor tab"
```

---

### Task 4: OwnerTabNavigator

**Fayl:** `apps/mobile/src/navigation/OwnerTabNavigator.tsx`

- [ ] **Step 1: Egasi tab navigator yaratish**

```typescript
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { OwnerTabParamList } from './types';
import DashboardScreen from '../screens/Dashboard';
import NasiyaScreen from '../screens/Nasiya';
import KirimScreen from '../screens/Kirim';
import SettingsScreen from '../screens/Settings';

const Tab = createBottomTabNavigator<OwnerTabParamList>();

const PRIMARY = '#5B5BD6';
const INACTIVE = '#9CA3AF';

const TAB_STYLE = {
  height: 64,
  paddingBottom: 8,
  paddingTop: 6,
  backgroundColor: '#FFFFFF',
  borderTopWidth: 1,
  borderTopColor: '#F3F4F6',
} as const;

export default function OwnerTabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: TAB_STYLE,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as const },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Bosh sahifa',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Nasiya"
        component={NasiyaScreen}
        options={{
          tabBarLabel: 'Nasiya',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'card' : 'card-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Tovarlar"
        component={KirimScreen}
        options={{
          tabBarLabel: 'Tovarlar',
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name={focused ? 'package-variant' : 'package-variant-closed'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: t('settings.title'),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/src/navigation/OwnerTabNavigator.tsx
git commit -m "feat(mobile): add OwnerTabNavigator with Dashboard tab"
```

---

### Task 5: RootNavigator yangilash

**Fayl:** `apps/mobile/src/navigation/RootNavigator.tsx`

- [ ] **Step 1: Mavjud RootNavigator ni o'qish**

```bash
cat apps/mobile/src/navigation/RootNavigator.tsx
```

- [ ] **Step 2: Rol bo'yicha routing qo'shish**

```typescript
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import type { RootStackParamList } from './types';
import { useAuthStore } from '../store/auth.store';
import AuthNavigator from './AuthNavigator';
import CashierTabNavigator from './CashierTabNavigator';
import OwnerTabNavigator from './OwnerTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const OWNER_ROLES = ['OWNER', 'ADMIN'] as const;

export default function RootNavigator() {
  const { isAuthenticated, user, loadFromStorage } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFromStorage().finally(() => setLoading(false));
  }, [loadFromStorage]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#5B5BD6" />
      </View>
    );
  }

  const isOwner = user?.role && OWNER_ROLES.includes(user.role as typeof OWNER_ROLES[number]);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : isOwner ? (
          <Stack.Screen name="OwnerMain" component={OwnerTabNavigator} />
        ) : (
          <Stack.Screen name="CashierMain" component={CashierTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
  },
});
```

- [ ] **Step 3: Metro cache tozalab, simulator da test qilish**

```bash
npx expo start --clear --ios
```

Expected:
- Login → Kassir uchun: Smena/Savdo/Tarix/Nasiya/Ombor tabs
- Login → Egasi uchun: Dashboard/Nasiya/Tovarlar/Settings tabs
- Demo kirish → CASHIER roli bilan ishlashi kerak

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/src/navigation/RootNavigator.tsx
git commit -m "feat(mobile): role-based navigation CASHIER vs OWNER"
```

---

## Chunk 3: Dashboard ekrani (Egasi uchun)

### Task 6: Dashboard screen to'liq implementatsiya

**Fayl:** `apps/mobile/src/screens/Dashboard/index.tsx`

- [ ] **Step 1: Mavjud bo'sh Dashboard ni o'chirib yangi yozish**

Hozir `Dashboard/index.tsx` faqat "Dashboard" matnini ko'rsatadi.
Quyidagi to'liq komponentni yoz:

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:      '#F5F5F7',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  secondary: '#6B7280',
  border:  '#F3F4F6',
  primary: '#5B5BD6',
  green:   '#10B981',
  red:     '#EF4444',
  orange:  '#F59E0B',
  blue:    '#3B82F6',
};

type Period = 'today' | 'week' | 'month';

// ─── Mock ma'lumotlar ───────────────────────────────────
const MOCK_DATA: Record<Period, {
  revenue: number;
  orders: number;
  cashPct: number;
  cardPct: number;
  nasiyaPct: number;
  profit: number;
  lowStock: number;
  overdueNasiya: number;
  activeCashier: string;
  shiftStart: string;
}> = {
  today: {
    revenue: 4_200_000,
    orders: 48,
    cashPct: 50,
    cardPct: 42,
    nasiyaPct: 8,
    profit: 1_260_000,
    lowStock: 3,
    overdueNasiya: 2,
    activeCashier: 'Azamat Akhmedov',
    shiftStart: '08:30',
  },
  week: {
    revenue: 28_500_000,
    orders: 312,
    cashPct: 48,
    cardPct: 44,
    nasiyaPct: 8,
    profit: 8_550_000,
    lowStock: 3,
    overdueNasiya: 5,
    activeCashier: 'Azamat Akhmedov',
    shiftStart: '08:30',
  },
  month: {
    revenue: 112_000_000,
    orders: 1240,
    cashPct: 47,
    cardPct: 45,
    nasiyaPct: 8,
    profit: 33_600_000,
    lowStock: 3,
    overdueNasiya: 7,
    activeCashier: 'Azamat Akhmedov',
    shiftStart: '08:30',
  },
};

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Bugun',
  week: 'Hafta',
  month: 'Oy',
};

function fmt(n: number) { return n.toLocaleString('ru-RU'); }

// ─── Period toggle ──────────────────────────────────────
function PeriodToggle({
  active,
  onSelect,
}: {
  active: Period;
  onSelect: (p: Period) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      {(['today', 'week', 'month'] as Period[]).map((p) => (
        <TouchableOpacity
          key={p}
          style={[styles.toggleBtn, active === p && styles.toggleBtnActive]}
          onPress={() => onSelect(p)}
          activeOpacity={0.75}
        >
          <Text style={[styles.toggleText, active === p && styles.toggleTextActive]}>
            {PERIOD_LABELS[p]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Revenue card ───────────────────────────────────────
function RevenueCard({ data }: { data: typeof MOCK_DATA['today'] }) {
  return (
    <View style={styles.revenueCard}>
      <View style={styles.revenueTop}>
        <View>
          <Text style={styles.revenueLabel}>Jami daromad</Text>
          <Text style={styles.revenueAmount}>{fmt(data.revenue)} UZS</Text>
          <Text style={styles.revenueOrders}>{data.orders} ta savdo</Text>
        </View>
        <View style={styles.revenueProfitBox}>
          <Text style={styles.revenueProfitLabel}>Foyda</Text>
          <Text style={styles.revenueProfitAmount}>{fmt(data.profit)}</Text>
          <Text style={styles.revenueProfitPct}>
            ~{Math.round((data.profit / data.revenue) * 100)}%
          </Text>
        </View>
      </View>

      {/* Payment split bar */}
      <View style={styles.splitRow}>
        <View style={[styles.splitBar, { width: `${data.cashPct}%`, backgroundColor: C.green }]} />
        <View style={[styles.splitBar, { width: `${data.cardPct}%`, backgroundColor: C.blue }]} />
        <View style={[styles.splitBar, { width: `${data.nasiyaPct}%`, backgroundColor: C.orange }]} />
      </View>
      <View style={styles.splitLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: C.green }]} />
          <Text style={styles.legendText}>Naqd {data.cashPct}%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: C.blue }]} />
          <Text style={styles.legendText}>Karta {data.cardPct}%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: C.orange }]} />
          <Text style={styles.legendText}>Nasiya {data.nasiyaPct}%</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Alert card ─────────────────────────────────────────
function AlertCard({
  icon,
  label,
  count,
  color,
  bg,
}: {
  icon: string;
  label: string;
  count: number;
  color: string;
  bg: string;
}) {
  if (count === 0) return null;
  return (
    <TouchableOpacity style={[styles.alertCard, { borderLeftColor: color }]} activeOpacity={0.8}>
      <View style={[styles.alertIcon, { backgroundColor: bg }]}>
        <MaterialCommunityIcons name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.alertText}>{label}</Text>
      <View style={[styles.alertBadge, { backgroundColor: color }]}>
        <Text style={styles.alertBadgeText}>{count}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={C.muted} />
    </TouchableOpacity>
  );
}

// ─── Smena card ─────────────────────────────────────────
function SmenaCard({ cashier, shiftStart }: { cashier: string; shiftStart: string }) {
  return (
    <View style={styles.smenaCard}>
      <View style={styles.smenaLeft}>
        <View style={styles.smenaDot} />
        <View>
          <Text style={styles.smenaName}>{cashier}</Text>
          <Text style={styles.smenaTime}>Smena boshlandi: {shiftStart}</Text>
        </View>
      </View>
      <View style={[styles.smenaBadge]}>
        <Text style={styles.smenaBadgeText}>● Faol</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────
export default function DashboardScreen() {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<Period>('today');
  const [refreshing, setRefreshing] = useState(false);

  const data = MOCK_DATA[period];
  const firstName = user?.firstName ?? 'Egasi';

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Salom, {firstName} 👋</Text>
          <Text style={styles.headerDate}>
            {new Date().toLocaleDateString('uz-UZ', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </Text>
        </View>
        <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={22} color={C.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
        }
      >
        {/* Period toggle */}
        <PeriodToggle active={period} onSelect={setPeriod} />

        {/* Revenue card */}
        <RevenueCard data={data} />

        {/* Alerts */}
        {(data.lowStock > 0 || data.overdueNasiya > 0) && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>Ogohlantirishlar</Text>
            <AlertCard
              icon="package-variant-closed-remove"
              label="Kam qolgan tovarlar"
              count={data.lowStock}
              color={C.orange}
              bg="#FEF3C7"
            />
            <AlertCard
              icon="clock-alert-outline"
              label="Muddati o'tgan nasiyalar"
              count={data.overdueNasiya}
              color={C.red}
              bg="#FEE2E2"
            />
          </View>
        )}

        {/* Active shift */}
        <View style={styles.smenaSection}>
          <Text style={styles.sectionTitle}>Faol smena</Text>
          <SmenaCard cashier={data.activeCashier} shiftStart={data.shiftStart} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerGreeting: { fontSize: 18, fontWeight: '800', color: C.text },
  headerDate: { fontSize: 12, color: C.muted, marginTop: 2 },
  notifBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center',
  },

  scroll: { paddingBottom: 32, gap: 16, paddingTop: 16 },

  // Period toggle
  toggleRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1, borderColor: C.border,
  },
  toggleBtn: {
    flex: 1, paddingVertical: 8, alignItems: 'center',
    borderRadius: 8,
  },
  toggleBtnActive: { backgroundColor: C.primary },
  toggleText: { fontSize: 14, fontWeight: '600', color: C.secondary },
  toggleTextActive: { color: C.white },

  // Revenue card
  revenueCard: {
    marginHorizontal: 16,
    backgroundColor: C.primary,
    borderRadius: 16, padding: 20, gap: 14,
  },
  revenueTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  revenueLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  revenueAmount: { fontSize: 26, fontWeight: '800', color: C.white, marginTop: 4 },
  revenueOrders: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  revenueProfitBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12, padding: 10, alignItems: 'center',
  },
  revenueProfitLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)' },
  revenueProfitAmount: { fontSize: 14, fontWeight: '800', color: C.white, marginTop: 2 },
  revenueProfitPct: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 1 },

  // Payment split bar
  splitRow: {
    flexDirection: 'row', height: 6, borderRadius: 3,
    overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.2)',
  },
  splitBar: { height: 6 },
  splitLegend: { flexDirection: 'row', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },

  // Alerts
  alertsSection: { marginHorizontal: 16, gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 2 },
  alertCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.white, borderRadius: 12, padding: 12,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  alertIcon: {
    width: 34, height: 34, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  alertText: { flex: 1, fontSize: 14, fontWeight: '600', color: C.text },
  alertBadge: {
    minWidth: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  alertBadgeText: { fontSize: 12, fontWeight: '800', color: C.white },

  // Smena
  smenaSection: { marginHorizontal: 16, gap: 8 },
  smenaCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.white, borderRadius: 12, padding: 14,
    borderLeftWidth: 4, borderLeftColor: C.green,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  smenaLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  smenaDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.green },
  smenaName: { fontSize: 14, fontWeight: '700', color: C.text },
  smenaTime: { fontSize: 11, color: C.muted, marginTop: 2 },
  smenaBadge: {
    backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  smenaBadgeText: { fontSize: 12, fontWeight: '700', color: C.green },
});
```

- [ ] **Step 2: Simulator da Owner roli bilan test qilish**

Demo login → OWNER roli → Dashboard tab ko'rinishi kerak:
- Bugun/Hafta/Oy toggle ishlashi
- Revenue card (daromad, foyda, split bar)
- Alert cards (lowStock, overdueNasiya)
- Active shift card

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/screens/Dashboard/index.tsx
git commit -m "feat(mobile): implement Owner Dashboard screen with revenue, alerts, shift"
```

---

## Chunk 4: Ombor ekrani (Kassir uchun)

### Task 7: Ombor screen + buyurtma flow

**Fayl:** `apps/mobile/src/screens/Ombor/index.tsx`

- [ ] **Step 1: Ombor papkasini yaratib screen yozish**

```typescript
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:       '#F5F5F7',
  white:    '#FFFFFF',
  text:     '#111827',
  muted:    '#9CA3AF',
  secondary:'#6B7280',
  border:   '#F3F4F6',
  primary:  '#5B5BD6',
  green:    '#10B981',
  red:      '#EF4444',
  orange:   '#F59E0B',
};

// ─── Types ─────────────────────────────────────────────
type StockStatus = 'OK' | 'LOW' | 'OUT';

interface StockItem {
  id: string;
  name: string;
  category: string;
  currentQty: number;
  minQty: number;
  unit: string;
  status: StockStatus;
}

type OrderStatus = 'SENT' | 'REVIEWING' | 'APPROVED' | 'DELIVERED';

interface OrderRequest {
  id: string;
  productName: string;
  requestedQty: number;
  unit: string;
  status: OrderStatus;
  createdAt: string;
  note?: string;
}

// ─── Mock data ─────────────────────────────────────────
const MOCK_STOCK: StockItem[] = [
  { id: '1', name: "Chanel N°5 Parfum",        category: 'Atir',   currentQty: 15, minQty: 5,  unit: 'dona', status: 'OK'  },
  { id: '2', name: 'Nivea Soft Cream',          category: 'Yuz',    currentQty: 2,  minQty: 5,  unit: 'dona', status: 'LOW' },
  { id: '3', name: "L'Oreal Shampoo",           category: 'Soch',   currentQty: 0,  minQty: 5,  unit: 'dona', status: 'OUT' },
  { id: '4', name: 'Vaseline Intensive Care',   category: 'Tana',   currentQty: 40, minQty: 10, unit: 'dona', status: 'OK'  },
  { id: '5', name: 'Neutrogena Hand Cream',     category: 'Tana',   currentQty: 3,  minQty: 5,  unit: 'dona', status: 'LOW' },
  { id: '6', name: 'Garnier Micellar Water',    category: 'Yuz',    currentQty: 8,  minQty: 3,  unit: 'dona', status: 'OK'  },
  { id: '7', name: 'Pantene Conditioner',       category: 'Soch',   currentQty: 3,  minQty: 5,  unit: 'dona', status: 'LOW' },
];

const MOCK_ORDERS: OrderRequest[] = [
  {
    id: 'o1', productName: "L'Oreal Shampoo", requestedQty: 20, unit: 'dona',
    status: 'APPROVED', createdAt: '2026-03-13', note: 'Tez kerak',
  },
  {
    id: 'o2', productName: 'Neutrogena Hand Cream', requestedQty: 10, unit: 'dona',
    status: 'REVIEWING', createdAt: '2026-03-14',
  },
];

const ORDER_CFG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  SENT:      { label: 'Yuborildi',          color: C.secondary, bg: C.border     },
  REVIEWING: { label: 'Ko\'rib chiqilmoqda', color: C.orange,    bg: '#FEF3C7'   },
  APPROVED:  { label: 'Tasdiqlandi',         color: C.green,     bg: '#D1FAE5'   },
  DELIVERED: { label: 'Yetkazildi',          color: C.primary,   bg: '#EFF6FF'   },
};

function fmt(n: number) { return n.toLocaleString('ru-RU'); }

// ─── Stock item row ──────────────────────────────────────
function StockRow({
  item,
  onOrder,
}: {
  item: StockItem;
  onOrder: (item: StockItem) => void;
}) {
  const isLow  = item.status === 'LOW';
  const isOut  = item.status === 'OUT';
  const color  = isOut ? C.red : isLow ? C.orange : C.green;
  const bg     = isOut ? '#FEE2E2' : isLow ? '#FEF3C7' : '#D1FAE5';
  const label  = isOut ? 'Tugagan' : isLow ? 'Kam qoldi' : 'Yetarli';

  return (
    <View style={styles.stockRow}>
      <View style={styles.stockLeft}>
        <Text style={styles.stockName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.stockCat}>{item.category}</Text>
      </View>
      <View style={styles.stockMid}>
        <Text style={[styles.stockQty, { color }]}>
          {item.currentQty} {item.unit}
        </Text>
        <View style={[styles.stockBadge, { backgroundColor: bg }]}>
          <Text style={[styles.stockBadgeText, { color }]}>{label}</Text>
        </View>
      </View>
      {(isLow || isOut) && (
        <TouchableOpacity
          style={styles.orderBtn}
          onPress={() => onOrder(item)}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={18} color={C.primary} />
          <Text style={styles.orderBtnText}>So'rov</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Order request row ──────────────────────────────────
function OrderRow({ order }: { order: OrderRequest }) {
  const cfg = ORDER_CFG[order.status];
  return (
    <View style={styles.orderRow}>
      <View style={styles.orderLeft}>
        <Text style={styles.orderName} numberOfLines={1}>{order.productName}</Text>
        <Text style={styles.orderMeta}>{order.requestedQty} {order.unit}  •  {order.createdAt}</Text>
        {order.note && <Text style={styles.orderNote}>{order.note}</Text>}
      </View>
      <View style={[styles.orderBadge2, { backgroundColor: cfg.bg }]}>
        <Text style={[styles.orderBadge2Text, { color: cfg.color }]}>{cfg.label}</Text>
      </View>
    </View>
  );
}

// ─── Order Modal ────────────────────────────────────────
function OrderModal({
  visible,
  item,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  item: StockItem | null;
  onClose: () => void;
  onConfirm: (qty: number, note: string) => void;
}) {
  const [qty, setQty]   = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (visible) { setQty(''); setNote(''); setLoading(false); }
  }, [visible]);

  if (!item) return null;

  const handleConfirm = () => {
    const n = parseInt(qty, 10);
    if (!n || n <= 0) {
      Alert.alert('Xatolik', 'Miqdor 0 dan katta bo\'lishi kerak');
      return;
    }
    setLoading(true);
    setTimeout(() => { setLoading(false); onConfirm(n, note); }, 600);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalWrap}
          >
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Buyurtma yuborish</Text>

              <View style={styles.modalProduct}>
                <MaterialCommunityIcons name="package-variant" size={20} color={C.primary} />
                <Text style={styles.modalProductName} numberOfLines={2}>{item.name}</Text>
              </View>
              <Text style={styles.modalStock}>
                Hozirda: <Text style={{ color: C.red, fontWeight: '700' }}>{item.currentQty} {item.unit}</Text>
              </Text>

              <Text style={styles.inputLabel}>Kerakli miqdor ({item.unit})</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.inputField}
                  value={qty}
                  onChangeText={setQty}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={C.muted}
                  autoFocus
                  editable={!loading}
                />
                <Text style={styles.inputUnit}>{item.unit}</Text>
              </View>

              <Text style={styles.inputLabel}>Izoh (ixtiyoriy)</Text>
              <TextInput
                style={styles.noteField}
                value={note}
                onChangeText={setNote}
                placeholder="Masalan: tez kerak, musiqa festivali uchun..."
                placeholderTextColor={C.muted}
                multiline
                editable={!loading}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
                  <Text style={styles.cancelText}>Bekor</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sendBtn, (!qty || loading) && { opacity: 0.5 }]}
                  onPress={handleConfirm}
                  disabled={!qty || loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color={C.white} size="small" />
                  ) : (
                    <>
                      <Ionicons name="send-outline" size={16} color={C.white} />
                      <Text style={styles.sendText}>Yuborish</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ─── Main Screen ───────────────────────────────────────
type ActiveTab = 'stock' | 'orders';

export default function OmborScreen() {
  const [tab, setTab]               = useState<ActiveTab>('stock');
  const [search, setSearch]         = useState('');
  const [selectedItem, setSelected] = useState<StockItem | null>(null);
  const [modalVisible, setModal]    = useState(false);
  const [orders, setOrders]         = useState<OrderRequest[]>(MOCK_ORDERS);

  const lowCount = MOCK_STOCK.filter((i) => i.status !== 'OK').length;

  const filteredStock = useMemo(() => {
    const q = search.toLowerCase();
    return MOCK_STOCK.filter((i) =>
      i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q),
    );
  }, [search]);

  const handleOrder = (item: StockItem) => {
    setSelected(item);
    setModal(true);
  };

  const handleConfirm = (qty: number, note: string) => {
    const newOrder: OrderRequest = {
      id: `o${Date.now()}`,
      productName: selectedItem!.name,
      requestedQty: qty,
      unit: selectedItem!.unit,
      status: 'SENT',
      createdAt: new Date().toISOString().split('T')[0]!,
      note: note || undefined,
    };
    setOrders((prev) => [newOrder, ...prev]);
    setModal(false);
    Alert.alert('✅ Yuborildi', 'Buyurtma egasiga yuborildi. Ko\'rib chiqilgach xabar olasiz.');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ombor</Text>
        {lowCount > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{lowCount} ta kam</Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'stock' && styles.tabBtnActive]}
          onPress={() => setTab('stock')}
          activeOpacity={0.75}
        >
          <Text style={[styles.tabText, tab === 'stock' && styles.tabTextActive]}>
            Zaxira
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'orders' && styles.tabBtnActive]}
          onPress={() => setTab('orders')}
          activeOpacity={0.75}
        >
          <Text style={[styles.tabText, tab === 'orders' && styles.tabTextActive]}>
            Buyurtmalarim ({orders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'stock' ? (
        <>
          {/* Search */}
          <View style={styles.searchRow}>
            <Feather name="search" size={16} color={C.muted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tovar qidirish..."
              placeholderTextColor={C.muted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Feather name="x" size={16} color={C.muted} />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filteredStock}
            keyExtractor={(i) => i.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <StockRow item={item} onOrder={handleOrder} />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={styles.empty}>
                <MaterialCommunityIcons name="package-variant-closed" size={48} color={C.muted} />
                <Text style={styles.emptyText}>Tovar topilmadi</Text>
              </View>
            }
          />
        </>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <OrderRow order={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={C.muted} />
              <Text style={styles.emptyText}>Buyurtma yo'q</Text>
              <Text style={styles.emptySubText}>
                Kam qolgan tovarlar uchun "So'rov" tugmasini bosing
              </Text>
            </View>
          }
        />
      )}

      <OrderModal
        visible={modalVisible}
        item={selectedItem}
        onClose={() => setModal(false)}
        onConfirm={handleConfirm}
      />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.text },
  headerBadge: {
    backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  headerBadgeText: { fontSize: 12, fontWeight: '700', color: C.orange },

  // Tabs
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderBottomWidth: 1, borderBottomColor: C.border,
    paddingHorizontal: 16, gap: 4,
  },
  tabBtn: {
    paddingVertical: 12, paddingHorizontal: 4,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabBtnActive: { borderBottomColor: C.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: C.muted },
  tabTextActive: { color: C.primary },

  // Search
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 12,
    paddingHorizontal: 14, height: 44, margin: 12,
    borderWidth: 1, borderColor: C.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.text },

  // List
  list: { paddingBottom: 32, paddingHorizontal: 16, paddingTop: 4 },
  separator: { height: 1, backgroundColor: C.border, marginLeft: 0 },

  // Stock row
  stockRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 12, gap: 8, marginBottom: 0,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  stockLeft: { flex: 1 },
  stockName: { fontSize: 14, fontWeight: '600', color: C.text },
  stockCat: { fontSize: 11, color: C.muted, marginTop: 2 },
  stockMid: { alignItems: 'flex-end', gap: 4 },
  stockQty: { fontSize: 14, fontWeight: '700' },
  stockBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  stockBadgeText: { fontSize: 10, fontWeight: '700' },
  orderBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: C.primary + '12', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 6,
  },
  orderBtnText: { fontSize: 11, fontWeight: '700', color: C.primary },

  // Order row
  orderRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, padding: 14, borderRadius: 12, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  orderLeft: { flex: 1 },
  orderName: { fontSize: 14, fontWeight: '600', color: C.text },
  orderMeta: { fontSize: 11, color: C.muted, marginTop: 3 },
  orderNote: { fontSize: 11, color: C.orange, marginTop: 2, fontStyle: 'italic' },
  orderBadge2: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  orderBadge2Text: { fontSize: 11, fontWeight: '700' },

  // Empty
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: C.muted, fontWeight: '600' },
  emptySubText: { fontSize: 13, color: C.muted, textAlign: 'center', paddingHorizontal: 32 },

  // Modal
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalWrap: { width: '100%' },
  modalSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingBottom: 34,
  },
  modalHandle: {
    width: 40, height: 5, borderRadius: 3,
    backgroundColor: C.border, alignSelf: 'center',
    marginTop: 12, marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 16 },
  modalProduct: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.bg, borderRadius: 10, padding: 12, marginBottom: 6,
  },
  modalProductName: { flex: 1, fontSize: 15, fontWeight: '600', color: C.text },
  modalStock: { fontSize: 13, color: C.secondary, marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: C.secondary, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 12,
    paddingHorizontal: 16, height: 52,
    borderWidth: 1, borderColor: C.border, marginBottom: 14,
  },
  inputField: { flex: 1, fontSize: 20, fontWeight: '700', color: C.text },
  inputUnit: { fontSize: 14, fontWeight: '600', color: C.muted, marginLeft: 8 },
  noteField: {
    backgroundColor: '#F9FAFB', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: C.border,
    fontSize: 14, color: C.text, height: 80,
    textAlignVertical: 'top', marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, borderWidth: 1, borderColor: C.border,
    borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: C.secondary },
  sendBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.primary, borderRadius: 14, height: 54, gap: 8,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  sendText: { color: C.white, fontSize: 16, fontWeight: '800' },
});
```

- [ ] **Step 2: Simulator da Kassir roli bilan Ombor tabni test qilish**

```
Kassir login → Ombor tab:
✓ Zaxira ro'yxati ko'rinadi
✓ Kam qolganlar sariq, tugaganlar qizil
✓ "So'rov" tugmasi faqat kam/tugagan tovarlarda
✓ Modal ochiladi → qty + note yoziladi → Yuborildi
✓ Buyurtmalarim tabda yangi buyurtma ko'rinadi
```

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/screens/Ombor/index.tsx
git commit -m "feat(mobile): add Ombor screen with stock levels and order request flow"
```

---

## Chunk 5: App assets

### Task 8: App icon va splash screen

**Fayl:** `apps/mobile/app.json`

- [ ] **Step 1: Placeholder icon yaratish**

```bash
# 1024x1024 purple background with "R" letter
# Haqiqiy icon dizayner tomonidan keyin almashtiriladi
# Hozircha EAS Build uchun kerakli config qo'shamiz
```

- [ ] **Step 2: app.json ga icon va splash config qo'shish**

```json
{
  "expo": {
    "name": "RAOS",
    "slug": "raos-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#5B5BD6"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "uz.raos.mobile"
    },
    "android": {
      "package": "uz.raos.mobile",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#5B5BD6"
      }
    }
  }
}
```

- [ ] **Step 3: assets papkasini tekshirish**

```bash
ls apps/mobile/assets/
```

Agar icon.png yo'q bo'lsa, dizaynerga topshiriq:
- `icon.png` — 1024×1024, purple (#5B5BD6), "R" harfi
- `splash.png` — 1284×2778, RAOS logo markazda
- `adaptive-icon.png` — 1024×1024 (Android uchun)

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/app.json
git commit -m "chore(mobile): add icon and splash screen config to app.json"
```

---

## Yakuniy tekshiruv

```bash
# Type check
cd apps/mobile && npx tsc --noEmit

# Simulator da to'liq flow test:
npx expo start --ios --clear
```

**Test scenariylari:**

```
Scenario 1 — Kassir:
  [ ] Login → CASHIER roli → 5 ta tab (Smena/Savdo/Tarix/Nasiya/Ombor)
  [ ] Ombor → Zaxira ko'rinadi
  [ ] Ombor → Kam tovar → So'rov → Buyurtmalarim da ko'rinadi
  [ ] Settings yo'q kassir tabda ✓

Scenario 2 — Egasi:
  [ ] Login → OWNER roli → 4 ta tab (Dashboard/Nasiya/Tovarlar/Settings)
  [ ] Dashboard → Bugun/Hafta/Oy toggle ishlaydi
  [ ] Dashboard → Revenue card, alerts, smena ko'rinadi
  [ ] Pull to refresh ishlaydi

Scenario 3 — Demo kirish:
  [ ] Demo kirish → CASHIER roli bilan kiradi
```

---

## Git branch va PR

```bash
# Hozirgi branch: abdulaziz/feat-mobile-ios
# Barcha o'zgarishlar shu branchda

git push origin abdulaziz/feat-mobile-ios
# PR → main (Bekzod review)
```

---

*RAOS Mobile Implementation Plan | v1.0 | 2026-03-14*
