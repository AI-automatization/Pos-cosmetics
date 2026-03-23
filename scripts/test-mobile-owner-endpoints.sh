#!/bin/bash
# T-227: Integration test — mobile-owner panel endpoints
# Ishlatish: bash scripts/test-mobile-owner-endpoints.sh
# Yoki production test: BASE_URL=https://api-production-c5b6.up.railway.app bash scripts/test-mobile-owner-endpoints.sh

BASE_URL="${BASE_URL:-http://localhost:3000}"
API="${BASE_URL}/api/v1"
PASS=0
FAIL=0
SKIP=0

green='\033[0;32m'
red='\033[0;31m'
yellow='\033[0;33m'
nc='\033[0m'

check() {
  local label="$1"
  local code="$2"
  local expected="${3:-200}"
  if [ "$code" = "$expected" ]; then
    echo -e "${green}✅ PASS${nc} $label (HTTP $code)"
    ((PASS++))
  elif [ "$code" = "000" ]; then
    echo -e "${yellow}⏭  SKIP${nc} $label (server unreachable)"
    ((SKIP++))
  else
    echo -e "${red}❌ FAIL${nc} $label (HTTP $code, expected $expected)"
    ((FAIL++))
  fi
}

echo "======================================"
echo "  T-227: mobile-owner endpoint test"
echo "  Base: $BASE_URL"
echo "======================================"
echo ""

# 1. Login — get token
echo "── 1. AUTH ──"
RESP=$(curl -s -w "\n%{http_code}" -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@kosmetika.uz","password":"Demo1234!","slug":"kosmetika-demo"}' 2>/dev/null)
CODE=$(echo "$RESP" | tail -1)
TOKEN=$(echo "$RESP" | head -1 | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('access_token',''))" 2>/dev/null)
check "POST /auth/login" "$CODE"

if [ -z "$TOKEN" ]; then
  echo -e "${yellow}⚠️  Token yo'q — seed data ishga tushirish kerak:${nc}"
  echo "   cd apps/api && npx ts-node prisma/seed.ts"
  echo ""
fi

AUTH="Authorization: Bearer $TOKEN"

echo ""
echo "── 2. ANALYTICS ──"
check "GET /analytics/revenue" \
  "$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH" "$API/analytics/revenue")"
check "GET /analytics/orders" \
  "$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH" "$API/analytics/orders")"
check "GET /analytics/sales-trend" \
  "$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH" "$API/analytics/sales-trend")"
check "GET /analytics/branch-comparison" \
  "$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH" "$API/analytics/branch-comparison")"
check "GET /analytics/revenue-by-branch" \
  "$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH" "$API/analytics/revenue-by-branch")"
check "GET /analytics/top-products" \
  "$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH" "$API/analytics/top-products")"
check "GET /analytics/stock-value" \
  "$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH" "$API/analytics/stock-value")"

echo ""
echo "── 3. SHIFTS ──"
check "GET /shifts" \
  "$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH" "$API/shifts")"
check "GET /shifts/summary" \
  "$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH" "$API/shifts/summary")"
check "GET /shifts/active" \
  "$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH" "$API/shifts/active")"

echo ""
echo "── 4. NASIYA (DEBTS) ──"
check "GET /debts/summary" \
  "$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH" "$API/debts/summary")"
check "GET /debts/aging-report" \
  "$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH" "$API/debts/aging-report")"
check "GET /debts/customers" \
  "$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH" "$API/debts/customers")"

echo ""
echo "── 5. ALERTS ──"
check "GET /alerts" \
  "$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH" "$API/alerts")"
check "GET /alerts/unread-count" \
  "$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH" "$API/alerts/unread-count")"

echo ""
echo "── 6. EMPLOYEES ──"
check "GET /employees" \
  "$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH" "$API/employees")"
check "GET /employees/performance" \
  "$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH" "$API/employees/performance")"

echo ""
echo "── 7. INVENTORY ──"
check "GET /inventory/stock" \
  "$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH" "$API/inventory/stock")"
check "GET /inventory/out-of-stock" \
  "$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH" "$API/inventory/out-of-stock")"
check "GET /inventory/levels?lowStock=true" \
  "$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH" "$API/inventory/levels?lowStock=true")"

echo ""
echo "── 8. SYSTEM ──"
check "GET /system/health" \
  "$(curl -s -o /dev/null -w '%{http_code}' "$API/system/health")"
check "GET /system/sync-status" \
  "$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH" "$API/system/sync-status")"

echo ""
echo "── 9. SETTINGS ──"
check "GET /settings" \
  "$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH" "$API/settings")"

echo ""
echo "── 10. BRANCHES ──"
check "GET /branches" \
  "$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH" "$API/branches")"

echo ""
echo "======================================"
echo -e "  NATIJA: ${green}$PASS PASS${nc} | ${red}$FAIL FAIL${nc} | ${yellow}$SKIP SKIP${nc}"
echo "======================================"
echo ""

if [ $FAIL -gt 0 ]; then
  echo -e "${yellow}Muammo bo'lsa:${nc}"
  echo "  1. cd apps/api && npx ts-node prisma/seed.ts   (agar token 401 bo'lsa)"
  echo "  2. docker-compose up -d                        (DB/Redis kerak bo'lsa)"
  echo "  3. pnpm --filter api dev                       (API ishlamasa)"
fi
