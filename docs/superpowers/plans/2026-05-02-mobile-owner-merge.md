# mobile-owner → mobile Merge Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `apps/mobile-owner` dagi barcha unique screen/hook/api/componentlarni `apps/mobile` ga ko'chirib, login qilinganda role bo'yicha UI o'zgaradigan bitta ilova yaratish.

**Architecture:**
- `apps/mobile` yagona ilova bo'lib qoladi
- Login → role tekshiriladi → `TabNavigator` role bo'yicha tab ko'rsatadi
- OWNER/ADMIN: BoshSahifa + Analytics + **Xodimlar** + Moliya + Ko'proq
- Boshqa rollar: hozirgi holat (o'zgarmaydi)
- Ko'proq (MoreMenu) da OWNER/ADMIN uchun qo'shimcha: Smenlar (owner view), Qarzdorlik

**Qoida:** `apps/mobile` dagi mavjud fayllar QAYTA YOZILMAYDI — faqat yangi fayllar qo'shiladi yoki mavjudlarga minimal qo'shimcha (navigatsiya, i18n, MoreMenu).

**Tech Stack:** React Native, React Navigation, React Query, TypeScript, Expo

---

## Nima ko'chiriladi (mobile-owner UNIQUE → mobile ga yangi)

| Kategoriya | mobile-owner | mobile da holati |
|---|---|---|
| Config | `theme.ts`, `endpoints.ts`, `queryKeys.ts` | Yo'q — yaratiladi |
| Charts | `AgingBucketChart`, `HorizontalBarChart` | Yo'q — ko'chiriladi |
| Common | `CurrencyText`, `FilterSheet`, `PullToRefresh`, `SkeletonCard`, `TrendBadge`, `StatusIndicator` | Yo'q — ko'chiriladi |
| API | `debts.api.ts`, `employees.api.ts`, `shifts.api.ts` | Yo'q — ko'chiriladi |
| Hooks | `useDebts.ts`, `useEmployees.ts`, `useShifts.ts` | Yo'q — ko'chiriladi |
| Screens | `Debts/`, `Employees/`, `HR/`, `Shifts/` (ShiftsOwner nomi bilan) | Yo'q — ko'chiriladi |
| i18n | `debts`, `shifts`, `employees` kalitlari | Yo'q — qo'shiladi |
| Navigation | `EmployeesNavigator.tsx` | Yo'q — yaratiladi |

## Nima O'ZGARTIRILMAYDI (mobile da allaqachon bor)

- `Alerts`, `Analytics`, `Auth`, `Dashboard`, `Inventory`, `Onboarding`, `Settings`, `SystemHealth` screenlari
- `MoreMenu/index.tsx` screen (faqat yangi menu item qo'shiladi)
- `TabNavigator.tsx` (faqat Xodimlar tab qo'shiladi OWNER/ADMIN uchun)
- Barcha mavjud hooks, API fayllar, store

---

## Task 1: Config fayllar yaratish

**Files:**
- Create: `apps/mobile/src/config/theme.ts`
- Create: `apps/mobile/src/config/endpoints.ts`
- Create: `apps/mobile/src/config/queryKeys.ts`

### Maqsad
mobile-owner screenlari `../../config/theme`, `../../config/endpoints`, `../../config/queryKeys` dan import qiladi. mobile da bu fayllar yo'q — yaratish kerak.

- [ ] **Step 1: `theme.ts` yaratish** — mobile-owner dagi `config/theme.ts` ni aynan ko'chir

`apps/mobile/src/config/theme.ts`:
```typescript
// Shared theme for owner screens (migrated from mobile-owner)
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
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  pill: 999,
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

- [ ] **Step 2: `endpoints.ts` yaratish** — mobile-owner dagi `config/endpoints.ts` ni aynan ko'chir

`apps/mobile/src/config/endpoints.ts`:
```typescript
export const ENDPOINTS = {
  AUTH_LOGIN: '/auth/login',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_BIOMETRIC_REGISTER: '/auth/biometric/register',
  AUTH_BIOMETRIC_VERIFY: '/auth/biometric/verify',
  DEVICES_REGISTER_PUSH_TOKEN: '/notifications/fcm-token',
  ANALYTICS_REVENUE: '/analytics/revenue',
  ANALYTICS_ORDERS: '/analytics/orders',
  ANALYTICS_SALES_TREND: '/analytics/sales-trend',
  ANALYTICS_BRANCH_COMPARISON: '/analytics/branch-comparison',
  ANALYTICS_TOP_PRODUCTS: '/analytics/top-products',
  ANALYTICS_EMPLOYEE_PERFORMANCE: '/analytics/employee-performance',
  ANALYTICS_REVENUE_BY_BRANCH: '/analytics/revenue-by-branch',
  INVENTORY_STOCK: '/inventory/stock',
  INVENTORY_LOW_STOCK: '/inventory/low-stock',
  INVENTORY_EXPIRING: '/inventory/expiring',
  INVENTORY_OUT_OF_STOCK: '/inventory/out-of-stock',
  INVENTORY_STOCK_VALUE: '/inventory/stock-value',
  SHIFTS: '/shifts',
  SHIFTS_SUMMARY: '/shifts/summary',
  DEBTS_SUMMARY: '/debts/summary',
  DEBTS_AGING_REPORT: '/debts/aging-report',
  DEBTS_CUSTOMERS: '/debts/customers',
  EMPLOYEES: '/employees',
  EMPLOYEES_PERFORMANCE: '/employees/performance',
  EMPLOYEES_SUSPICIOUS_ACTIVITY: '/employees/suspicious-activity',
  ALERTS: '/alerts',
  ALERTS_UNREAD_COUNT: '/alerts/unread-count',
  ALERTS_READ_ALL: '/alerts/read-all',
  BRANCHES: '/branches',
  SYSTEM_HEALTH: '/system/health',
  SYSTEM_SYNC_STATUS: '/system/sync-status',
  SYSTEM_ERRORS: '/system/errors',
} as const;
```

- [ ] **Step 3: `queryKeys.ts` yaratish** — mobile-owner dagi `config/queryKeys.ts` ni aynan ko'chir

`apps/mobile/src/config/queryKeys.ts`: (mobile-owner/src/config/queryKeys.ts dagi content)

- [ ] **Step 4: Commit**
```bash
git add apps/mobile/src/config/theme.ts apps/mobile/src/config/endpoints.ts apps/mobile/src/config/queryKeys.ts
git commit -m "feat(mobile): add config files for owner screens migration"
```

---

## Task 2: Missing components ko'chirish

**Files:**
- Create: `apps/mobile/src/components/charts/AgingBucketChart.tsx`
- Create: `apps/mobile/src/components/charts/HorizontalBarChart.tsx`
- Create: `apps/mobile/src/components/common/CurrencyText.tsx`
- Create: `apps/mobile/src/components/common/FilterSheet.tsx`
- Create: `apps/mobile/src/components/common/PullToRefresh.tsx`
- Create: `apps/mobile/src/components/common/SkeletonCard.tsx`
- Create: `apps/mobile/src/components/common/TrendBadge.tsx`
- Create: `apps/mobile/src/components/common/StatusIndicator.tsx`

### Maqsad
Copied screenlarda ishlatiladigan, mobile da yo'q komponentlarni ko'chirish.

- [ ] **Step 1:** `apps/mobile-owner/src/components/charts/AgingBucketChart.tsx` → `apps/mobile/src/components/charts/AgingBucketChart.tsx`
  - Import path o'zgartirish: `../../config/theme` → mobile da ham bor bo'lgani uchun o'zgarmaydi

- [ ] **Step 2:** `apps/mobile-owner/src/components/charts/HorizontalBarChart.tsx` → `apps/mobile/src/components/charts/HorizontalBarChart.tsx`

- [ ] **Step 3:** Quyidagi common komponentlarni ko'chir (har birini mobile-owner dan o'qib aynan ko'chir):
  - `CurrencyText.tsx`
  - `FilterSheet.tsx`
  - `PullToRefresh.tsx`
  - `SkeletonCard.tsx`
  - `TrendBadge.tsx`
  - `StatusIndicator.tsx`

- [ ] **Step 4: Commit**
```bash
git add apps/mobile/src/components/
git commit -m "feat(mobile): add owner-specific chart and common components"
```

---

## Task 3: API fayllar ko'chirish

**Files:**
- Create: `apps/mobile/src/api/debts.api.ts`
- Create: `apps/mobile/src/api/employees.api.ts`
- Create: `apps/mobile/src/api/shifts.api.ts`

### Maqsad
Owner-level API calllar uchun fayllar. mobile dagi `users.api.ts` dan farqli — bu owner uchun xodimlarni CRUD qilish uchun.

- [ ] **Step 1:** `apps/mobile-owner/src/api/debts.api.ts` → `apps/mobile/src/api/debts.api.ts`
  - Import: `./client` — mobile da ham `api/client.ts` bor, o'zgarmaydi
  - Import: `../config/endpoints` → `../config/endpoints` — yaratilgan fayl

- [ ] **Step 2:** `apps/mobile-owner/src/api/employees.api.ts` → `apps/mobile/src/api/employees.api.ts`
  - Bir xil import pattern, o'zgarmaydi

- [ ] **Step 3:** `apps/mobile-owner/src/api/shifts.api.ts` → `apps/mobile/src/api/shifts.api.ts`

- [ ] **Step 4: Commit**
```bash
git add apps/mobile/src/api/debts.api.ts apps/mobile/src/api/employees.api.ts apps/mobile/src/api/shifts.api.ts
git commit -m "feat(mobile): add debts, employees, shifts API files"
```

---

## Task 4: Hooks ko'chirish

**Files:**
- Create: `apps/mobile/src/hooks/useDebts.ts`
- Create: `apps/mobile/src/hooks/useEmployees.ts`
- Create: `apps/mobile/src/hooks/useShifts.ts`

### Maqsad
Copied screenlarda `../../hooks/useDebts` kabi import qilinadi. mobile da bu hooklar yo'q.

- [ ] **Step 1:** `apps/mobile-owner/src/hooks/useDebts.ts` → `apps/mobile/src/hooks/useDebts.ts`
  - Import path tekshirish: `../api/debts.api` → ok, `../config/queryKeys` → ok (yaratilgan)

- [ ] **Step 2:** `apps/mobile-owner/src/hooks/useEmployees.ts` → `apps/mobile/src/hooks/useEmployees.ts`

- [ ] **Step 3:** `apps/mobile-owner/src/hooks/useShifts.ts` → `apps/mobile/src/hooks/useShifts.ts`

- [ ] **Step 4: Commit**
```bash
git add apps/mobile/src/hooks/useDebts.ts apps/mobile/src/hooks/useEmployees.ts apps/mobile/src/hooks/useShifts.ts
git commit -m "feat(mobile): add useDebts, useEmployees, useShifts hooks"
```

---

## Task 5: Screens ko'chirish

**Files:**
- Create: `apps/mobile/src/screens/Debts/` (barcha fayllar)
- Create: `apps/mobile/src/screens/Employees/` (barcha fayllar)
- Create: `apps/mobile/src/screens/HR/` (barcha fayllar)
- Create: `apps/mobile/src/screens/ShiftsOwner/` (mobile-owner/Shifts → ShiftsOwner nomi bilan)

### Maqsad
Owner-specific screenlarni ko'chirish. `ShiftsOwner` nomi ishlatiladi chunki mobile da `Smena` (cashier smena) allaqachon bor — chalkashmaslik uchun.

### Debts screeni
- [ ] **Step 1:** `apps/mobile-owner/src/screens/Debts/` papkasidagi barcha fayllarni `apps/mobile/src/screens/Debts/` ga ko'chir:
  - `index.tsx`, `AgingReportChart.tsx`, `CustomerDebtList.tsx`, `CustomerDebtRow.tsx`, `DebtSummaryCards.tsx`, `useDebtsData.ts`
  - Import path tekshirish: `../../components/layout/ScreenLayout` → mobile da bor ✓
  - `../../components/common/SkeletonList` → mobile da bor ✓
  - `../../hooks/useDebts` → yaratilgan ✓
  - `../../api/debts.api` → yaratilgan ✓

### Employees screeni
- [ ] **Step 2:** `apps/mobile-owner/src/screens/Employees/` papkasidagi barcha fayllarni `apps/mobile/src/screens/Employees/` ga ko'chir:
  - `index.tsx`, `AddEmployeeScreen.tsx`, `EmployeeCard.tsx`, `EmployeeDetailScreen.tsx`, `EmployeeList.tsx`, `SuspiciousActivityList.tsx`, `useEmployeesData.ts`
  - `components/` subfolderdagi barcha fayllar
  - Import path tekshirish: `../../api/employees.api` → yaratilgan ✓
  - `../../hooks/useEmployees` → yaratilgan ✓
  - `../../config/theme` → yaratilgan ✓

### HR screeni
- [ ] **Step 3:** `apps/mobile-owner/src/screens/HR/` papkasidagi barcha fayllarni `apps/mobile/src/screens/HR/` ga ko'chir:
  - `index.tsx`, `HREmployeeRow.tsx`, `HRInviteSheet.tsx`, `useHRData.ts`
  - Import path tekshirish: `../../api/employees.api` → yaratilgan ✓

### ShiftsOwner screeni
- [ ] **Step 4:** `apps/mobile-owner/src/screens/Shifts/` papkasidagi barcha fayllarni `apps/mobile/src/screens/ShiftsOwner/` ga ko'chir:
  - `index.tsx`, `PaymentBreakdownChart.tsx`, `ShiftDetailScreen.tsx`, `ShiftList.tsx`, `ShiftRow.tsx`, `useShiftsData.ts`
  - `index.tsx` ichidagi import: `../../navigation/types` dagi `ShiftsStackParamList` — biz bu tipni types.ts ga qo'shamiz
  - `../../hooks/useShifts` → yaratilgan ✓
  - `../../api/shifts.api` → yaratilgan ✓

- [ ] **Step 5: Commit**
```bash
git add apps/mobile/src/screens/Debts/ apps/mobile/src/screens/Employees/ apps/mobile/src/screens/HR/ apps/mobile/src/screens/ShiftsOwner/
git commit -m "feat(mobile): migrate Debts, Employees, HR, ShiftsOwner screens from mobile-owner"
```

---

## Task 6: i18n translations qo'shish

**Files:**
- Modify: `apps/mobile/src/i18n/uz.json`
- Modify: `apps/mobile/src/i18n/ru.json`
- Modify: `apps/mobile/src/i18n/en.json`

### Maqsad
Copied screenlarda `useTranslation()` ishlatiladi. mobile da `debts`, `shifts`, `employees` kalitlari yo'q.

- [ ] **Step 1:** `apps/mobile-owner/src/i18n/locales/uz.json` dan `debts`, `shifts`, `employees` kalitlarini o'qib, `apps/mobile/src/i18n/uz.json` ga qo'sh (mavjud kalitlarni o'zgartirmasdan).

- [ ] **Step 2:** Bir xil operatsiyani `ru.json` va `en.json` uchun ham bajár (mobile-owner/locales/ru.json va en.json dan).

- [ ] **Step 3: Commit**
```bash
git add apps/mobile/src/i18n/
git commit -m "feat(mobile): add debts, shifts, employees i18n translations"
```

---

## Task 7: Navigation — types.ts yangilash

**Files:**
- Modify: `apps/mobile/src/navigation/types.ts`

### Qo'shiladigan tiplar

```typescript
// Quyidagi tiplarni types.ts ga qo'sh (mavjud tiplarni o'zgartirmasdan):

export type EmployeesStackParamList = {
  EmployeeList: undefined;
  EmployeeDetail: { employeeId: string; employeeName: string };
  AddEmployee: undefined;
};

export type ShiftsOwnerStackParamList = {
  ShiftList: undefined;
  ShiftDetail: { shiftId: string };
};

// TabParamList ga Xodimlar qo'sh:
// TabParamList = { BoshSahifa, Analytics, Savdo, Katalog, Moliya, Koproq } → bu o'ZGARTIRILMAYDI
// TabParamList ga yangi optional entry kerak emas — Navigator conditional render qiladi

// MoreStackParamList ga yangi routelar qo'sh:
// DebtsScreen: undefined;
// ShiftsOwnerScreen: undefined;
// EmployeesScreen: undefined;
// EmployeeDetail: { employeeId: string; employeeName: string };
// AddEmployee: undefined;
```

- [ ] **Step 1:** `types.ts` ga `EmployeesStackParamList` va `ShiftsOwnerStackParamList` ni qo'sh.

- [ ] **Step 2:** `TabParamList` ga `Xodimlar: undefined` qo'sh (conditional tab uchun).

- [ ] **Step 3:** `MoreStackParamList` ga yangi routelarni qo'sh:
  ```typescript
  DebtsScreen: undefined;
  ShiftsOwnerScreen: undefined;
  EmployeesScreen: undefined;
  EmployeeDetailScreen: { employeeId: string; employeeName: string };
  AddEmployeeScreen: undefined;
  ```

- [ ] **Step 4: Commit**
```bash
git add apps/mobile/src/navigation/types.ts
git commit -m "feat(mobile): add Employees, ShiftsOwner, Debts nav types"
```

---

## Task 8: EmployeesNavigator yaratish

**Files:**
- Create: `apps/mobile/src/navigation/EmployeesNavigator.tsx`

```typescript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EmployeesStackParamList } from './types';
import HRScreen from '../screens/HR';
import EmployeeDetailScreen from '../screens/Employees/EmployeeDetailScreen';
import AddEmployeeScreen from '../screens/Employees/AddEmployeeScreen';

const Stack = createNativeStackNavigator<EmployeesStackParamList>();

export default function EmployeesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EmployeeList" component={HRScreen} />
      <Stack.Screen name="EmployeeDetail" component={EmployeeDetailScreen} />
      <Stack.Screen name="AddEmployee" component={AddEmployeeScreen} />
    </Stack.Navigator>
  );
}
```

- [ ] **Step 1:** Yuqoridagi kodni yaratib saqlash.

- [ ] **Step 2: Commit**
```bash
git add apps/mobile/src/navigation/EmployeesNavigator.tsx
git commit -m "feat(mobile): add EmployeesNavigator"
```

---

## Task 9: TabNavigator — Xodimlar tab qo'shish (OWNER/ADMIN)

**Files:**
- Modify: `apps/mobile/src/navigation/TabNavigator.tsx`

### O'zgarish minimal: faqat Xodimlar tab qo'shiladi

Hozirgi holat:
- `isOwnerAdmin` bo'lsa: BoshSahifa + Analytics + Moliya + Koproq
- Bo'lmasa: BoshSahifa + Savdo + Katalog + Moliya + Koproq

Yangi holat:
- `isOwnerAdmin` bo'lsa: BoshSahifa + Analytics + **Xodimlar** + Moliya + Koproq
- Bo'lmasa: hozirgi holat (o'zgarmaydi)

- [ ] **Step 1:** `TabNavigator.tsx` ga `EmployeesNavigator` import qo'sh:
  ```typescript
  import EmployeesNavigator from './EmployeesNavigator';
  ```

- [ ] **Step 2:** `isOwnerAdmin` blokiga Analytics dan keyin Xodimlar tab qo'sh:
  ```typescript
  {isOwnerAdmin && (
    <Tab.Screen
      name="Xodimlar"
      component={EmployeesNavigator}
      options={{
        tabBarLabel: 'Xodimlar',
        tabBarIcon: ({ focused, color }) =>
          TabIcon(focused, 'people-outline', 'people', color),
      }}
    />
  )}
  ```

- [ ] **Step 3: Commit**
```bash
git add apps/mobile/src/navigation/TabNavigator.tsx
git commit -m "feat(mobile): add Xodimlar tab for OWNER/ADMIN role"
```

---

## Task 10: MoreNavigator — Debts, ShiftsOwner screen qo'shish

**Files:**
- Modify: `apps/mobile/src/navigation/TabNavigator.tsx` (MoreNavigator function)

### O'zgarish: MoreStack ga yangi screenlar import qilib qo'shish

- [ ] **Step 1:** `TabNavigator.tsx` ga yangi import qo'sh:
  ```typescript
  import DebtsScreen from '../screens/Debts';
  import ShiftsOwnerScreen from '../screens/ShiftsOwner';
  ```

- [ ] **Step 2:** `MoreNavigator` function ichiga yangi screen qo'sh:
  ```typescript
  <MoreStack.Screen name="DebtsScreen" component={DebtsScreen} options={{ headerShown: false }} />
  <MoreStack.Screen name="ShiftsOwnerScreen" component={ShiftsOwnerScreen} options={{ headerShown: false }} />
  ```

- [ ] **Step 3: Commit**
```bash
git add apps/mobile/src/navigation/TabNavigator.tsx
git commit -m "feat(mobile): add Debts and ShiftsOwner screens to MoreNavigator"
```

---

## Task 11: MoreMenu — OWNER/ADMIN uchun yangi menu itemlar

**Files:**
- Modify: `apps/mobile/src/screens/MoreMenu/index.tsx`

### Maqsad
OWNER/ADMIN uchun Ko'proq menyusida "Smenlar" va "Qarzdorlik" ko'rinishi kerak.

### O'zgarish minimal
`BOSHQARUV_GROUP` yoki yangi group sifatida qo'shish. `roleLevel >= 4` (OWNER/ADMIN) uchun:

```typescript
const OWNER_GROUP: MenuGroup = {
  title: 'Owner',
  items: [
    {
      icon: 'time-outline',
      title: 'Smenlar',
      subtitle: 'Barcha filial smenlari',
      screen: 'ShiftsOwnerScreen' as keyof MoreStackParamList,
    },
    {
      icon: 'card-outline',
      title: 'Qarzdorlik',
      subtitle: 'Mijozlar qarzdorligi',
      screen: 'DebtsScreen' as keyof MoreStackParamList,
    },
  ],
};
```

- [ ] **Step 1:** `MoreMenu/index.tsx` ga `OWNER_GROUP` const qo'sh (mavjud grouplarni o'zgartirmasdan).

- [ ] **Step 2:** `groups` useMemo ichiga `roleLevel >= 4` bo'lsa `OWNER_GROUP` qo'sh:
  ```typescript
  ...(roleLevel >= 4 ? [OWNER_GROUP] : []),
  ```

- [ ] **Step 3:** `handlePress` ichida yangi screen navigation ishlayaptimi tekshir (existing logic handles `navigation.navigate(item.screen)` — yangi screenlar avtomatik ishlaydi).

- [ ] **Step 4: Commit**
```bash
git add apps/mobile/src/screens/MoreMenu/index.tsx
git commit -m "feat(mobile): add Smenlar and Qarzdorlik to MoreMenu for OWNER/ADMIN"
```

---

## Yakuniy tekshirish

- [ ] `pnpm -r exec tsc --noEmit` — type xatolik yo'q
- [ ] OWNER/ADMIN login qilib: Xodimlar tab ko'rinadi, Ko'proq → Smenlar/Qarzdorlik ko'rinadi
- [ ] CASHIER/MANAGER login qilib: Savdo/Katalog tab ko'rinadi, Ko'proq menyu oddiy holat
- [ ] `apps/mobile-owner` — hozircha o'chirilmaydi (keyingi sprint)
