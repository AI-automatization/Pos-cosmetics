---
name: mobile-lifecycle
description: Mobile app lifecycle, offline-first, permissions, accessibility, App Store survival. Use when architecting mobile features.
user-invocable: false
paths:
  - "apps/mobile/**"
---

# Mobile App Lifecycle & Platform Rules

Source: ClawHub @ivangdavila/mobile (MIT-0)

## Lifecycle Awareness

- App can be killed anytime in background — save state before backgrounding
- Restore state on return — user expects to continue where they left off
- Handle low memory warnings — release caches, non-essential resources
- Background tasks have time limits — complete or request extension

## Permissions

- Ask in context, not at launch — explain why when requesting
- Degrade gracefully if denied — app should still work with reduced features
- Don't ask for unnecessary permissions — users notice and distrust

## Offline First (RAOS critical)

- Assume network is unreliable — design for offline, sync when possible
- Cache aggressively — previous content better than loading spinner
- Queue actions for retry — don't fail on network error
- Financial data: EVENT-SOURCING conflict resolution (NEVER last-write-wins)
- Non-financial data: last-write-wins OK
- Show sync status — user should know if data is current

## Performance

- Target 60fps — dropped frames feel janky
- Main thread for UI only — heavy work on background threads
- Memory matters more than desktop — constrained devices
- Battery awareness — reduce location polling, network requests when possible
- Startup time under 2 seconds

## Navigation Patterns

- Follow platform conventions — Android back button
- Deep link to any screen — shareable, notification taps work
- Preserve scroll position on return — don't jump to top

## Storage

- Secure storage for tokens, credentials — Android Keystore
- Cache is cache — can be cleared; don't store critical data
- SQLite for structured offline data (RAOS: transactions, inventory)

## Touch and Gestures

- 44pt minimum touch target
- System gestures reserved — don't override swipe from edge
- Haptic feedback for significant actions — confirmation, errors

## Accessibility

- TalkBack (Android) testing — navigate entire app
- Dynamic type support — text scales with user preference
- Labels on all interactive elements

## Testing

- Real devices essential — emulators miss performance, sensors
- Multiple OS versions — support at least current minus 2
- Different screen sizes — small phones to tablets
- Network conditions — slow, intermittent, offline

## App Store Survival

- Privacy policy required — explain data collection
- No placeholder content — everything functional in review build
- Update regularly — abandoned apps get deprioritized
