#!/usr/bin/env bash
#
# run-ios.sh — RAOS staff ilovasini iOS simulyatorda build + install + launch.
#
# NEGA bu skript kerak:
#   1. Loyiha iCloud-sinxron Desktop papkasida bo'lsa, FileProvider framework va
#      .app papkalariga `com.apple.FinderInfo` bosadi → `codesign` rad etadi:
#      "resource fork, Finder information, or similar detritus not allowed".
#      Yechim: build natijasini iCloud TASHQARISIDAGI DerivedData ga chiqaramiz
#      ($HOME/Library/... — bu yerga FileProvider stamp qo'ymaydi). Shunda Xcode
#      native imzo + to'g'ri simulated entitlements beradi → expo-secure-store
#      (keychain) ishlaydi, login token saqlanadi.
#   2. `expo run:ios` xmldom 0.9.x bug'i bilan crash bo'ladi (T-478) — shuning
#      uchun to'g'ridan-to'g'ri `xcodebuild` ishlatamiz.
#
# Foydalanish:
#   cd apps/mobile && pnpm ios:sim      (yoki: bash scripts/run-ios.sh)
#
set -euo pipefail

# --- Konfiguratsiya ---
readonly SCHEME="RAOS"
readonly BUNDLE_ID="uz.raos.mobile"
readonly CONFIGURATION="Debug"
readonly METRO_PORT=8081
readonly METRO_TIMEOUT_SEC=60
readonly UDID_RE='[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}'
# DerivedData iCloud TASHQARISIDA bo'lishi SHART (codesign detritusining oldini oladi)
readonly DERIVED_DATA="${HOME}/Library/Developer/Xcode/DerivedData/RAOS-ios"

# Skriptga nisbatan yo'llar (cwd'dan mustaqil)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly MOBILE_DIR="$(dirname "$SCRIPT_DIR")"
readonly IOS_DIR="${MOBILE_DIR}/ios"
readonly WORKSPACE="${IOS_DIR}/${SCHEME}.xcworkspace"

log() { printf '\033[1;34m▶ %s\033[0m\n' "$*"; }
err() { printf '\033[1;31m✖ %s\033[0m\n' "$*" >&2; }

[ -d "$WORKSPACE" ] || { err "Workspace topilmadi: $WORKSPACE"; exit 1; }

# --- 1. Simulyator (booted bo'lsa o'shani, bo'lmasa birinchi iPhone'ni boot) ---
log "Simulyator tekshirilmoqda…"
UDID="$(xcrun simctl list devices booted | grep -Eo "$UDID_RE" | head -1 || true)"
if [ -z "$UDID" ]; then
  log "Booted simulyator yo'q — birinchi mavjud iPhone boot qilinmoqda…"
  UDID="$(xcrun simctl list devices available | grep -E 'iPhone' | grep -Eo "$UDID_RE" | head -1 || true)"
  [ -n "$UDID" ] || { err "Mavjud iPhone simulyator topilmadi."; exit 1; }
  xcrun simctl boot "$UDID"
fi
open -a Simulator || true
log "Simulyator UDID: $UDID"

# --- 2. Metro (8081) — ishlamayotgan bo'lsa background'da ishga tushirish ---
if ! lsof -iTCP:"$METRO_PORT" -sTCP:LISTEN -n -P >/dev/null 2>&1; then
  log "Metro ishlamayapti — background'da ishga tushirilmoqda (log: /tmp/raos-metro.log)…"
  ( cd "$MOBILE_DIR" && nohup npx expo start >/tmp/raos-metro.log 2>&1 & )
  tries=0
  until lsof -iTCP:"$METRO_PORT" -sTCP:LISTEN -n -P >/dev/null 2>&1; do
    tries=$((tries + 1))
    [ "$tries" -gt "$METRO_TIMEOUT_SEC" ] && { err "Metro ${METRO_TIMEOUT_SEC}s ichida ishga tushmadi — /tmp/raos-metro.log ni tekshiring."; exit 1; }
    sleep 1
  done
fi
log "Metro :$METRO_PORT da ishlayapti."

# --- 3. Detritus insurance: manba Pods frameworklaridan FinderInfo'ni tozalash ---
log "Pods xattr tozalanmoqda…"
xattr -cr "${IOS_DIR}/Pods" 2>/dev/null || true

# --- 4. Build (iCloud TASHQARISIDAGI DerivedData — kalit nuqta) ---
log "Build qilinmoqda (DerivedData: $DERIVED_DATA)…"
xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION" \
  -sdk iphonesimulator \
  -destination "id=${UDID}" \
  -derivedDataPath "$DERIVED_DATA" \
  -quiet \
  build

# --- 5. .app ni topish ---
readonly APP="${DERIVED_DATA}/Build/Products/${CONFIGURATION}-iphonesimulator/${SCHEME}.app"
[ -d "$APP" ] || { err "Build .app topilmadi: $APP"; exit 1; }

# --- 6. O'rnatish + ishga tushirish ---
log "O'rnatilmoqda…"
xcrun simctl install "$UDID" "$APP"
log "Ishga tushirilmoqda…"
xcrun simctl launch "$UDID" "$BUNDLE_ID"

log "✓ Tayyor. Simulyatorda RAOS dev-launcher'da Metro serverга bosib ilovani yuklang."
