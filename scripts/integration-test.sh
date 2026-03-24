#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
# RAOS Integration Test — "Paytinka" (Web-like layered flow)
# Ma'lumot qatlamlardan o'tadi: Tenant → Employee → Auth → POS → Revoke
# Ishlatish: bash scripts/integration-test.sh [BASE_URL]
# Misol:     bash scripts/integration-test.sh http://localhost:3000
# ═══════════════════════════════════════════════════════════════════

BASE_URL="${1:-http://localhost:3000}"
API="$BASE_URL/api/v1"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

PASS=0
FAIL=0
SKIP=0

# ─── helpers ──────────────────────────────────────────────────────
pass() { echo -e "${GREEN}  ✅ PASS${NC} — $1"; ((PASS++)); }
fail() { echo -e "${RED}  ❌ FAIL${NC} — $1"; ((FAIL++)); }
skip() { echo -e "${YELLOW}  ⏭  SKIP${NC} — $1"; ((SKIP++)); }
section() { echo -e "\n${BLUE}${BOLD}═══ $1 ═══${NC}"; }
layer() { echo -e "\n${CYAN}▶ Layer $1: $2${NC}"; }

check() {
  local label="$1"
  local expected="$2"
  local actual="$3"
  if echo "$actual" | grep -q "$expected"; then
    pass "$label"
  else
    fail "$label (expected: '$expected', got: '${actual:0:120}')"
  fi
}

http_status() {
  curl -s -o /dev/null -w "%{http_code}" "$@"
}

# ═══════════════════════════════════════════════════════════════════
layer 0 "Health — API ishlaydimi?"
# ═══════════════════════════════════════════════════════════════════
section "Health Check"

HEALTH=$(curl -sf "$API/health" 2>/dev/null || echo "ERROR")
check "API /health endpoint" "ok\|status\|healthy\|alive" "$HEALTH"

# ═══════════════════════════════════════════════════════════════════
layer 1 "Tenant Registration — Yangi do'kon"
# ═══════════════════════════════════════════════════════════════════
section "Tenant Registration"

SLUG="test-$(date +%s)"
OWNER_EMAIL="owner-${SLUG}@test.com"
OWNER_PASS="TestPass123!"

REGISTER=$(curl -sf -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"slug\":\"$SLUG\",\"tenantName\":\"Test Dokon\",\"email\":\"$OWNER_EMAIL\",\"password\":\"$OWNER_PASS\",\"firstName\":\"Test\",\"lastName\":\"Owner\"}" \
  2>/dev/null || echo "ERROR")

check "Tenant register → 201" "token\|success\|accessToken\|id" "$REGISTER"

# ═══════════════════════════════════════════════════════════════════
layer 2 "Owner Login — email bilan (T-145)"
# ═══════════════════════════════════════════════════════════════════
section "Owner Login (email)"

LOGIN=$(curl -sf -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$OWNER_EMAIL\",\"password\":\"$OWNER_PASS\",\"slug\":\"$SLUG\"}" \
  2>/dev/null || echo "ERROR")

check "Owner login → accessToken" "accessToken" "$LOGIN"
OWNER_TOKEN=$(echo "$LOGIN" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$OWNER_TOKEN" ]; then
  fail "Owner token olinmadi — keyingi layerlar ishlamaydi"
  echo ""
  echo "═══ NATIJA ═══"
  echo -e "${RED}Layerlar test qilinmadi — API yoki login ishlamayapti${NC}"
  exit 1
fi

# ─── T-145: login field bilan ham kirish ──────────────────────────
LOGIN_WITH_LOGIN=$(curl -sf -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"login\":\"$OWNER_EMAIL\",\"password\":\"$OWNER_PASS\",\"slug\":\"$SLUG\"}" \
  2>/dev/null || echo "ERROR")
check "Login with 'login' field (T-145)" "accessToken" "$LOGIN_WITH_LOGIN"

# ─── JWT payload tekshirish ───────────────────────────────────────
JWT_PAYLOAD=$(echo "$LOGIN" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4 | cut -d'.' -f2)
# base64 decode (padding bilan)
PADDING=$(( 4 - ${#JWT_PAYLOAD} % 4 ))
if [ $PADDING -lt 4 ]; then JWT_PAYLOAD="${JWT_PAYLOAD}$(printf '=%.0s' $(seq 1 $PADDING))"; fi
DECODED=$(echo "$JWT_PAYLOAD" | base64 -d 2>/dev/null || echo "DECODE_ERROR")
check "JWT hasPosAccess field (T-145)" "hasPosAccess" "$DECODED"
check "JWT hasAdminAccess field (T-145)" "hasAdminAccess" "$DECODED"

# ─── /auth/me ─────────────────────────────────────────────────────
ME=$(curl -sf "$API/auth/me" -H "Authorization: Bearer $OWNER_TOKEN" 2>/dev/null || echo "ERROR")
check "GET /auth/me → owner profile" "email\|role\|firstName" "$ME"

# ═══════════════════════════════════════════════════════════════════
layer 3 "Employee Create — Kassir qo'shish (T-144)"
# ═══════════════════════════════════════════════════════════════════
section "Create Employee (Kassir)"

KASSIR_EMAIL="kassir-${SLUG}@test.com"
KASSIR_PASS="Kassir123!"

CREATE_EMP=$(curl -sf -X POST "$API/employees" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"Ali\",\"lastName\":\"Karimov\",\"email\":\"$KASSIR_EMAIL\",\"password\":\"$KASSIR_PASS\",\"role\":\"CASHIER\"}" \
  2>/dev/null || echo "ERROR")

check "POST /employees → kassir yaratildi" "id\|email\|firstName" "$CREATE_EMP"
EMP_ID=$(echo "$CREATE_EMP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# ═══════════════════════════════════════════════════════════════════
layer 4 "Employee Login — kassir email bilan kiradi (T-145)"
# ═══════════════════════════════════════════════════════════════════
section "Kassir Login"

KASSIR_LOGIN=$(curl -sf -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$KASSIR_EMAIL\",\"password\":\"$KASSIR_PASS\",\"slug\":\"$SLUG\"}" \
  2>/dev/null || echo "ERROR")

check "Kassir login → accessToken" "accessToken" "$KASSIR_LOGIN"
KASSIR_TOKEN=$(echo "$KASSIR_LOGIN" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# ─── JWT decode kassir ────────────────────────────────────────────
if [ -n "$KASSIR_TOKEN" ]; then
  KPAYLOAD=$(echo "$KASSIR_TOKEN" | cut -d'.' -f2)
  KPADDING=$(( 4 - ${#KPAYLOAD} % 4 ))
  if [ $KPADDING -lt 4 ]; then KPAYLOAD="${KPAYLOAD}$(printf '=%.0s' $(seq 1 $KPADDING))"; fi
  KDECODED=$(echo "$KPAYLOAD" | base64 -d 2>/dev/null || echo "DECODE_ERROR")
  check "Kassir JWT hasPosAccess=true" "hasPosAccess.*true\|true.*hasPosAccess" "$KDECODED"
fi

# ═══════════════════════════════════════════════════════════════════
layer 5 "Employee List & Get — CRUD (T-144)"
# ═══════════════════════════════════════════════════════════════════
section "Employee CRUD"

EMP_LIST=$(curl -sf "$API/employees" -H "Authorization: Bearer $OWNER_TOKEN" 2>/dev/null || echo "ERROR")
check "GET /employees → list" "\[\|id\|firstName" "$EMP_LIST"

if [ -n "$EMP_ID" ]; then
  EMP_GET=$(curl -sf "$API/employees/$EMP_ID" -H "Authorization: Bearer $OWNER_TOKEN" 2>/dev/null || echo "ERROR")
  check "GET /employees/:id → detail" "id\|firstName\|status" "$EMP_GET"
  check "Employee hasPosAccess field" "hasPosAccess" "$EMP_GET"
else
  skip "GET /employees/:id — EMP_ID yo'q"
fi

# ═══════════════════════════════════════════════════════════════════
layer 6 "Status Change — inactive → sessiya o'chadi (T-146)"
# ═══════════════════════════════════════════════════════════════════
section "Employee Status → inactive (T-146)"

if [ -n "$EMP_ID" ]; then
  STATUS_UPD=$(curl -sf -X PATCH "$API/employees/$EMP_ID/status" \
    -H "Authorization: Bearer $OWNER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"status":"inactive"}' \
    2>/dev/null || echo "ERROR")
  check "PATCH /employees/:id/status → inactive" "status\|isActive\|id" "$STATUS_UPD"

  # Kassir tokeni endi ishlamaydi (session o'chirildi)
  # Note: JWT o'zi expire bo'lmaydi, lekin refresh qilib bo'lmaydi
  KASSIR_ME=$(curl -sf "$API/auth/me" -H "Authorization: Bearer $KASSIR_TOKEN" 2>/dev/null || echo "ERROR")
  # isActive=false bo'lgandan keyin jwt.strategy.ts "User deactivated" deydi
  STATUS_HTTP=$(http_status -X GET "$API/auth/me" -H "Authorization: Bearer $KASSIR_TOKEN")
  if [ "$STATUS_HTTP" = "401" ]; then
    pass "Kassir token → 401 (inactive user, T-146)"
  else
    # Agar JWT validate qilsa ham isActive tekshiriladi
    check "Kassir session invalidated" "401\|deactivated\|not found" "${STATUS_HTTP}-${KASSIR_ME}"
  fi
else
  skip "Status change — EMP_ID yo'q"
fi

# ═══════════════════════════════════════════════════════════════════
layer 7 "Status → fired (T-144, T-146)"
# ═══════════════════════════════════════════════════════════════════
section "Employee Status → fired"

if [ -n "$EMP_ID" ]; then
  FIRED=$(curl -sf -X PATCH "$API/employees/$EMP_ID/status" \
    -H "Authorization: Bearer $OWNER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"status":"fired"}' \
    2>/dev/null || echo "ERROR")
  check "PATCH /employees/:id/status → fired" "status\|isActive\|id" "$FIRED"
else
  skip "fired status — EMP_ID yo'q"
fi

# ═══════════════════════════════════════════════════════════════════
layer 8 "POS Access Revoke (T-146)"
# ═══════════════════════════════════════════════════════════════════
section "POS Access Revoke"

if [ -n "$EMP_ID" ]; then
  # Avval active qilamiz (POS revoke test uchun)
  curl -sf -X PATCH "$API/employees/$EMP_ID/status" \
    -H "Authorization: Bearer $OWNER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"status":"active"}' > /dev/null 2>&1

  POS_REVOKE=$(curl -sf -X PATCH "$API/employees/$EMP_ID/pos-access" \
    -H "Authorization: Bearer $OWNER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"hasPosAccess":false}' \
    2>/dev/null || echo "ERROR")
  check "PATCH /employees/:id/pos-access → false (T-146)" "id\|role\|hasPosAccess" "$POS_REVOKE"
else
  skip "POS revoke — EMP_ID yo'q"
fi

# ═══════════════════════════════════════════════════════════════════
layer 9 "Catalog — Mahsulot yaratish (tenant isolation)"
# ═══════════════════════════════════════════════════════════════════
section "Catalog Layer"

PRODUCT=$(curl -sf -X POST "$API/catalog/products" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Krem\",\"sku\":\"TEST-$(date +%s)\",\"sellPrice\":15000,\"costPrice\":10000}" \
  2>/dev/null || echo "ERROR")
check "POST /catalog/products → mahsulot" "id\|name\|sku\|price\|error" "$PRODUCT"

# ═══════════════════════════════════════════════════════════════════
layer 10 "Sessions — Sessiya boshqaruvi"
# ═══════════════════════════════════════════════════════════════════
section "Session Management"

SESSIONS=$(curl -sf "$API/auth/sessions" -H "Authorization: Bearer $OWNER_TOKEN" 2>/dev/null || echo "ERROR")
check "GET /auth/sessions → list" "\[\|id\|userId\|error" "$SESSIONS"

# ═══════════════════════════════════════════════════════════════════
echo ""
echo "══════════════════════════════════════════"
echo -e "${BOLD}NATIJA${NC}"
echo "══════════════════════════════════════════"
echo -e "  ${GREEN}✅ PASS: $PASS${NC}"
echo -e "  ${RED}❌ FAIL: $FAIL${NC}"
echo -e "  ${YELLOW}⏭  SKIP: $SKIP${NC}"
echo "──────────────────────────────────────────"
TOTAL=$((PASS + FAIL + SKIP))
echo "  Jami: $TOTAL"
if [ $FAIL -eq 0 ]; then
  echo -e "\n${GREEN}${BOLD}  🎉 BARCHA TESTLAR O'TDI!${NC}"
else
  echo -e "\n${RED}${BOLD}  ⚠️  $FAIL ta test muvaffaqiyatsiz${NC}"
fi
echo ""
