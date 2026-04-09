---
description: React Native rules for RAOS Mobile App (Android)
paths:
  - "apps/mobile/**"
---

# React Native Mobile Rules (Android)

## Component Performance
- `FlatList` for any list over 10 items — `ScrollView` with `map` loads everything in memory
- `keyExtractor` must return stable unique strings — using index causes bugs on reorder
- `React.memo` prevents re-renders when props unchanged — wrap pure display components
- `useCallback` for functions passed to child components
- Extract styles to `StyleSheet.create` outside component body — not inline

## State Management
- `useState` for component-local state — don't add Redux/Zustand for a toggle
- Lift state to lowest common ancestor only
- `useMemo` for expensive computations
- Context re-renders all consumers on any change — split contexts by update frequency
- Don't store derived data in state — compute during render

## Navigation
- React Navigation is the standard — Expo Router for file-based routing
- Stack screens stay mounted — clean up subscriptions in `useEffect` cleanup
- Pass serializable params only — functions break deep linking
- `useFocusEffect` for screen-specific side effects
- `navigation.reset` for auth flows — clears back stack

## Styling
- `StyleSheet.create` outside component body
- Flexbox defaults differ from web — `flexDirection: 'column'` default
- Dimensions in density-independent pixels
- `Platform.select` for platform-specific styles
- No CSS inheritance — each Text needs explicit styling

## Offline-First (RAOS specific)
- Transactions saved locally first (SQLite)
- Outbox table for sync queue
- Background sync worker
- Financial data: event-sourcing (NEVER last-write-wins)
- Idempotency keys for every transaction

## Android Specific
- Explicit `overflow: 'hidden'` for border radius clipping
- Shadows via `elevation` (not `shadow*` props)
- `BackHandler` for hardware back button
- StatusBar color/visibility testing required

## Performance
- Hermes engine MUST be enabled
- `InteractionManager.runAfterInteractions` defers heavy work
- `useNativeDriver: true` for animations
- Remove `console.log` in production — use `__DEV__` guard
- Cache remote images with `react-native-fast-image`

## Build
- `npx react-native clean` for unexplained build failures
- `cd android && ./gradlew clean` for stubborn build issues
- Test release builds locally before submitting
