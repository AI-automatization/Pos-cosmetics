# Mobile Staff App — Expo SDK 55 / RN 0.83.2 Upgrade Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `apps/mobile` (staff app) ni Expo SDK 54 / RN 0.81.5 dan Expo SDK 55 / RN 0.83.2 ga upgrade qilish — owner app bilan SDK versiyasini moslashtirish.

**Architecture:** pnpm workspace da ikki xil RN versiya (`metro@0.83.3` va `metro@0.81.x` ziddiyati) keltirib chiqargan version mismatch xatolikni hal qilish uchun staff app owner app bilan bir xil SDK versiyasiga o'tkaziladi. metro.config.js dagi barcha workaround'lar tozalanadi.

**Tech Stack:** Expo SDK 55, React Native 0.83.2, pnpm workspace, CocoaPods, iOS Simulator

---

## Chunk 1: Dependency Update

### Task 1: `package.json` ni yangilash

**Files:**
- Modify: `apps/mobile/package.json`

- [ ] **Step 1: package.json dependencies ni yangilash**

```json
{
  "dependencies": {
    "@expo/metro-runtime": "~4.0.1",
    "@expo/vector-icons": "~15.1.1",
    "@raos/types": "workspace:*",
    "@react-navigation/bottom-tabs": "^6.6.1",
    "@react-navigation/native": "^6.1.18",
    "@react-navigation/native-stack": "^6.11.0",
    "@tanstack/react-query": "^5.64.2",
    "axios": "^1.8.1",
    "expo": "~55.0.9",
    "expo-camera": "~17.0.10",
    "expo-local-authentication": "~55.0.9",
    "expo-notifications": "~55.0.14",
    "expo-secure-store": "~55.0.9",
    "expo-status-bar": "~55.0.4",
    "i18next": "^24.2.2",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "react-i18next": "^15.4.0",
    "react-native": "0.83.2",
    "react-native-gesture-handler": "^2.30.0",
    "react-native-safe-area-context": "~5.6.2",
    "react-native-screens": "^4.23.0",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@config-plugins/detox": "^11.0.0",
    "@expo/ngrok": "^4.1.3",
    "@types/react": "~19.2.2",
    "detox": "^20.47.0",
    "jest-circus": "^30.3.0",
    "typescript": "^5.7.3"
  }
}
```

Muhim o'zgarishlar:
- `expo`: `~54.0.0` → `~55.0.9`
- `react-native`: `0.81.5` → `0.83.2`
- `react`/`react-dom`: `19.1.0` → `19.2.0`
- `expo-camera`: `~16.0.18` → `~17.0.10`
- `expo-local-authentication`: `~17.0.8` → `~55.0.9`
- `expo-notifications`: `~0.32.16` → `~55.0.14`
- `expo-secure-store`: `~15.0.8` → `~55.0.9`
- `expo-status-bar`: `~3.0.9` → `~55.0.4`
- `@expo/metro-runtime`: `~6.1.2` → `~4.0.1`
- `react-native-gesture-handler`: yangi qo'shildi `^2.30.0`
- `react-native-screens`: `~4.16.0` → `^4.23.0`
- `react-native-safe-area-context`: `~5.6.0` → `~5.6.2`

- [ ] **Step 2: pnpm install**

```bash
cd /path/to/Pos-cosmetics
pnpm install
```

Kutilgan natija: `node_modules` yangilanadi, `pnpm-lock.yaml` o'zgaradi.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/package.json pnpm-lock.yaml
git commit -m "chore(mobile): upgrade Expo SDK 54→55, RN 0.81.5→0.83.2"
```

---

### Task 2: `metro.config.js` ni soddalashtirish

**Files:**
- Modify: `apps/mobile/metro.config.js`

- [ ] **Step 1: metro.config.js ni tozalash**

Barcha SDK 54 workaround'larni olib tashlab, owner app bilan bir xil oddiy config yozish:

```js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/metro.config.js
git commit -m "chore(mobile): simplify metro.config.js after SDK 55 upgrade"
```

---

## Chunk 2: iOS Native Rebuild

### Task 3: iOS Pods yangilash

**Files:**
- Modify: `apps/mobile/ios/Podfile.lock` (auto-generated)

- [ ] **Step 1: Eski Pods va DerivedData ni tozalash**

```bash
rm -rf apps/mobile/ios/Pods
rm -rf apps/mobile/ios/Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/RAOS-*
```

- [ ] **Step 2: Pod install**

```bash
cd apps/mobile/ios
pod install
```

Kutilgan natija: RN 0.83.2 Pods o'rnatiladi, `Podfile.lock` yangilanadi.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/ios/Podfile.lock
git commit -m "chore(mobile): update CocoaPods for RN 0.83.2"
```

---

## Chunk 3: Kod Moslashuvi

### Task 4: Breaking changes tekshirish va tuzatish

**Files:**
- Modify: `apps/mobile/src/` (kerak bo'lsa)
- Modify: `apps/mobile/index.js` (kerak bo'lsa)

RN 0.81 → 0.83 asosiy o'zgarishlar:
- `react-native-gesture-handler` endi `GestureHandlerRootView` kerak (navigation uchun)
- `StyleSheet.create` — ba'zi props o'zgarishi mumkin
- `Animated` — ba'zi API o'zgarishi

- [ ] **Step 1: `App.tsx` da `GestureHandlerRootView` qo'shish**

`react-navigation` `react-native-gesture-handler` ni ishlatadi. `App.tsx` ni tekshirib, kerak bo'lsa:

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// ...
return (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <NavigationContainer>
      {/* ... */}
    </NavigationContainer>
  </GestureHandlerRootView>
);
```

- [ ] **Step 2: TypeScript xatoliklarni tekshirish**

```bash
cd apps/mobile
pnpm typecheck
```

Chiquvchi xatoliklarni tuzatish.

- [ ] **Step 3: `index.js` entry point tekshirish**

RN 0.83.2 da Hermes default. `index.js`:
```js
import { registerRootComponent } from 'expo';
import App from './src/App';
registerRootComponent(App);
```

Bu format to'g'ri — o'zgartirish kerak emas.

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/src/
git commit -m "fix(mobile): adapt code for RN 0.83.2 breaking changes"
```

---

## Chunk 4: Build va Test

### Task 5: iOS Simulator da test

**Files:** —

- [ ] **Step 1: Barcha eski process va cache larni tozalash**

```bash
watchman watch-del-all
```

- [ ] **Step 2: Staff app ni build va ishga tushirish**

```bash
cd apps/mobile
npx expo run:ios --device "D7859283-A754-4E2A-9497-5CFE8A44ECA1"
```

`D7859283-A754-4E2A-9497-5CFE8A44ECA1` — iPhone 17 Pro Max UDID.

- [ ] **Step 3: Version mismatch yo'qligini tekshirish**

Metro logda mana bu xatolik bo'lmasligi kerak:
```
React Native version mismatch.
JavaScript version: X.X.X
Native version: X.X.X
```

- [ ] **Step 4: App screen larni manual test qilish**

- Login screen ochiladi
- Navigation ishlaydi
- API chaqiruvlar yo'naltirilib backend ga ketadi

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat(mobile): Expo SDK 55 upgrade complete — RN 0.83.2"
```

---

## Muhim eslatmalar

- `expo-notifications` SDK 55 da `setNotificationHandler` API o'zgardi — `apps/mobile/src/hooks/useNotifications.ts` ni tekshirish kerak
- `expo-camera` 17.x da camera permission API o'zgardi — `apps/mobile/src/screens/` ichida camera ishlatilsa tekshirish kerak
- Owner app (`apps/mobile-owner`) bilan parallel ishlashda portlar: owner → 8081, staff → 8084
