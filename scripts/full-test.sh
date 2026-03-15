#!/usr/bin/env bash
BASE="https://api-production-c5b6.up.railway.app/api/v1"
PASS=0; FAIL=0

ok()  { echo "  ✅ $1"; PASS=$((PASS+1)); }
fail(){ echo "  ❌ $1 → ${2:0:100}"; FAIL=$((FAIL+1)); }
chk() {
  local pattern="$1" resp="$2" name="$3"
  echo "$resp" | grep -q "$pattern" && ok "$name" || fail "$name" "$resp"
}

echo "╔══════════════════════════════════════════════════╗"
echo "║      RAOS FULL TEST — $(date '+%Y-%m-%d %H:%M')         ║"
echo "╚══════════════════════════════════════════════════╝"

ADMIN_TOKEN=$(curl -sk -X POST "$BASE/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@raos.uz","password":"Admin123456!"}' \
  | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

USER_TOKEN=$(curl -sk -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"testowner@beautyshop.uz","password":"Test12345!","slug":"test-beauty-shop"}' \
  | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

echo ""
echo "━━━ 1. INFRA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
R=$(curl -sk "$BASE/health")
chk '"status":"ok"' "$R" "Health OK"
chk '"database"' "$R" "DB connected"
chk '"redis"' "$R" "Redis connected"
UPTIME=$(echo "$R" | grep -o '"uptime":[0-9]*' | cut -d: -f2)
echo "  ℹ️  Uptime: ${UPTIME}s"

echo ""
echo "━━━ 2. SECURITY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
R=$(curl -sk "$BASE/catalog/products")
chk 'HTTP_401' "$R" "No token → 401"

R=$(curl -sk "$BASE/catalog/products" -H "Authorization: Bearer invalid.token.here")
chk 'HTTP_401' "$R" "Invalid token → 401"

R=$(curl -sk -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"hacker@evil.com","password":"wrong","slug":"test-beauty-shop"}')
chk 'HTTP_401\|Unauthorized' "$R" "Wrong creds → 401"

R=$(curl -sk "$BASE/admin/metrics" -H "Authorization: Bearer $USER_TOKEN")
chk 'HTTP_403\|Forbidden' "$R" "Tenant user cant access admin → 403"

echo ""
echo "━━━ 3. ADMIN (TenantGuard fix) ━━━━━━━━━━━━━━━━━━"
chk 'eyJ' "$ADMIN_TOKEN" "Admin login → token"
R=$(curl -sk "$BASE/admin/metrics" -H "Authorization: Bearer $ADMIN_TOKEN")
chk 'tenants\|totalOrders\|revenue' "$R" "Admin metrics"
R=$(curl -sk "$BASE/admin/tenants" -H "Authorization: Bearer $ADMIN_TOKEN")
chk 'items\|slug' "$R" "Admin tenants list"

echo ""
echo "━━━ 4. AUTH ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
chk 'eyJ' "$USER_TOKEN" "Tenant user login → token"
R=$(curl -sk "$BASE/auth/me" -H "Authorization: Bearer $USER_TOKEN")
chk 'email\|role' "$R" "GET /auth/me"

echo ""
echo "━━━ 5. CATALOG ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
R=$(curl -sk "$BASE/catalog/categories" -H "Authorization: Bearer $USER_TOKEN")
chk '\[' "$R" "Categories list"
R=$(curl -sk "$BASE/catalog/units" -H "Authorization: Bearer $USER_TOKEN")
chk '\[' "$R" "Units list"
R=$(curl -sk "$BASE/catalog/products" -H "Authorization: Bearer $USER_TOKEN")
chk 'items' "$R" "Products list"

PROD_ID=$(echo "$R" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$PROD_ID" ]; then
  R2=$(curl -sk "$BASE/catalog/products/$PROD_ID" -H "Authorization: Bearer $USER_TOKEN")
  chk 'id\|name\|sellPrice' "$R2" "Product by ID"
fi

echo ""
echo "━━━ 6. INVENTORY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
R=$(curl -sk "$BASE/inventory/levels" -H "Authorization: Bearer $USER_TOKEN")
chk '\[' "$R" "Stock levels"
R=$(curl -sk "$BASE/inventory/levels?lowStock=true" -H "Authorization: Bearer $USER_TOKEN")
chk '\[' "$R" "Low stock"
R=$(curl -sk "$BASE/inventory/out-of-stock" -H "Authorization: Bearer $USER_TOKEN")
chk '\[' "$R" "T-222: Out of stock"
R=$(curl -sk "$BASE/inventory/expiring" -H "Authorization: Bearer $USER_TOKEN")
chk '\[' "$R" "Expiring products"

echo ""
echo "━━━ 7. SALES & SHIFTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━"
R=$(curl -sk "$BASE/sales/shifts" -H "Authorization: Bearer $USER_TOKEN")
chk 'items' "$R" "Shifts list"
R=$(curl -sk "$BASE/sales/shifts/current" -H "Authorization: Bearer $USER_TOKEN")
chk 'id\|status\|null' "$R" "Current shift"
R=$(curl -sk "$BASE/sales/shifts/summary" -H "Authorization: Bearer $USER_TOKEN")
chk 'totalRevenue\|totalShifts' "$R" "T-223: Shifts summary"

SHIFT_ID=$(curl -sk "$BASE/sales/shifts" -H "Authorization: Bearer $USER_TOKEN" \
  | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$SHIFT_ID" ]; then
  R=$(curl -sk "$BASE/sales/shifts/$SHIFT_ID" -H "Authorization: Bearer $USER_TOKEN")
  chk 'totalRevenue\|cashierId' "$R" "T-223: Shift by ID"
else
  ok "T-223: Shift by ID (no shifts yet)"
fi

R=$(curl -sk "$BASE/sales/orders" -H "Authorization: Bearer $USER_TOKEN")
chk 'items' "$R" "Orders list"

echo ""
echo "━━━ 8. ANALYTICS (T-221) ━━━━━━━━━━━━━━━━━━━━━━━"
R=$(curl -sk "$BASE/analytics/revenue" -H "Authorization: Bearer $USER_TOKEN")
chk 'today' "$R" "T-221: Revenue summary"
chk 'todayTrend' "$R" "T-221: Trend values"
R=$(curl -sk "$BASE/analytics/sales-trend" -H "Authorization: Bearer $USER_TOKEN")
chk '\[' "$R" "Sales trend"
R=$(curl -sk "$BASE/analytics/top-products" -H "Authorization: Bearer $USER_TOKEN")
chk '\[' "$R" "Top products"

echo ""
echo "━━━ 9. EMPLOYEES (T-224) ━━━━━━━━━━━━━━━━━━━━━━━"
R=$(curl -sk "$BASE/employees" -H "Authorization: Bearer $USER_TOKEN")
chk '\[' "$R" "Employees list"
R=$(curl -sk "$BASE/employees/performance" -H "Authorization: Bearer $USER_TOKEN")
chk '\[' "$R" "Employee performance"
R=$(curl -sk "$BASE/employees/suspicious-activity" -H "Authorization: Bearer $USER_TOKEN")
chk '\[' "$R" "Suspicious activity"

EMP_ID=$(curl -sk "$BASE/employees" -H "Authorization: Bearer $USER_TOKEN" \
  | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$EMP_ID" ]; then
  R=$(curl -sk "$BASE/employees/$EMP_ID" -H "Authorization: Bearer $USER_TOKEN")
  chk 'fullName\|role\|status' "$R" "Employee by ID"
  R=$(curl -sk "$BASE/employees/$EMP_ID/performance" -H "Authorization: Bearer $USER_TOKEN")
  chk 'employeeId\|totalOrders' "$R" "Employee performance by ID"
  R=$(curl -sk "$BASE/employees/$EMP_ID/suspicious-activity" -H "Authorization: Bearer $USER_TOKEN")
  chk '\[' "$R" "Employee suspicious activity"
fi

echo ""
echo "━━━ 10. CUSTOMERS & NASIYA ━━━━━━━━━━━━━━━━━━━━━"
R=$(curl -sk "$BASE/customers" -H "Authorization: Bearer $USER_TOKEN")
chk '\[' "$R" "Customers list"
R=$(curl -sk "$BASE/nasiya" -H "Authorization: Bearer $USER_TOKEN")
chk 'items' "$R" "Nasiya list"

echo ""
echo "━━━ 11. FINANCE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
R=$(curl -sk "$BASE/exchange-rate/latest" -H "Authorization: Bearer $USER_TOKEN")
chk 'rate\|usd' "$R" "Exchange rate"
R=$(curl -sk "$BASE/expenses" -H "Authorization: Bearer $USER_TOKEN")
chk 'items' "$R" "Expenses list"

echo ""
echo "━━━ 12. REPORTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
R=$(curl -sk "$BASE/reports/daily" -H "Authorization: Bearer $USER_TOKEN")
chk 'revenue\|orders\|date' "$R" "Daily report"

echo ""
echo "━━━ 13. NOTIFICATIONS ━━━━━━━━━━━━━━━━━━━━━━━━━━"
R=$(curl -sk -X POST "$BASE/notifications/telegram/link-token" \
  -H "Authorization: Bearer $USER_TOKEN")
chk 'token\|linkUrl\|data' "$R" "Telegram link-token"

echo ""
echo "━━━ 14. BIOMETRIC (T-225) ━━━━━━━━━━━━━━━━━━━━━━"
R=$(curl -sk -X POST "$BASE/auth/biometric/register" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"biometricId":"device-test-001"}')
chk 'biometricRegistered\|success' "$R" "T-225: Biometric register"

R=$(curl -sk -X POST "$BASE/auth/biometric/verify" \
  -H "Content-Type: application/json" \
  -d '{"biometricId":"device-test-001","userId":"test"}')
chk 'verified\|success' "$R" "T-225: Biometric verify"

echo ""
echo "━━━ 15. AUDIT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
R=$(curl -sk "$BASE/audit-logs" -H "Authorization: Bearer $USER_TOKEN")
chk 'items' "$R" "Audit logs"

echo ""
echo "╔══════════════════════════════════════════════════╗"
printf "║  JAMI:  ✅ PASS=%-3s   ❌ FAIL=%-3s               ║\n" "$PASS" "$FAIL"
echo "╚══════════════════════════════════════════════════╝"
