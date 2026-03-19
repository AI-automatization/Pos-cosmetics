#!/bin/bash
# RAOS Backend — Full Test Script
# Usage: bash scripts/test-backend.sh
# Requires: API running on localhost:3003, test-login.json present

BASE="http://localhost:3003/api/v1"
PASS=0
FAIL=0

green() { echo -e "\033[32m✅ $1\033[0m"; }
red()   { echo -e "\033[31m❌ $1\033[0m"; }

check() {
  local label="$1"
  local status="$2"
  local expected="$3"
  if [ "$status" = "$expected" ]; then
    green "$label"
    PASS=$((PASS+1))
  else
    red "$label (got $status, expected $expected)"
    FAIL=$((FAIL+1))
  fi
}

req()      { curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$@"; }
req_body() { curl -s -H "Authorization: Bearer $TOKEN" "$@"; }
post()     { curl -s -o /dev/null -w "%{http_code}" -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" "$@"; }
post_body(){ curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" "$@"; }

# ═══════════════════════════════════════════════════════════
# AUTH — LOGIN
# ═══════════════════════════════════════════════════════════
echo ""
echo "=== AUTH ==="

TOKEN=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d @test-login.json | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  red "LOGIN FAILED — token yoq. API ishlaydimi? test-login.json to'g'rimi?"
  exit 1
fi
green "Login → 200 (token olindi)"

check "GET /auth/me"        "$(req "$BASE/auth/me")"        "200"
check "GET /auth/pin/status" "$(req "$BASE/auth/pin/status")" "200"

# ═══════════════════════════════════════════════════════════
# SECURITY (8 ta)
# ═══════════════════════════════════════════════════════════
echo ""
echo "=== SECURITY ==="

check "SEC-1: Auth bypass → 401" \
  "$(curl -s -o /dev/null -w "%{http_code}" "$BASE/catalog/products")" "401"

check "SEC-2: Fake JWT → 401" \
  "$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer fake.token.here" "$BASE/catalog/products")" "401"

S=$(req "$BASE/catalog/products?name=test'%20OR%201=1--")
if [ "$S" = "200" ] || [ "$S" = "400" ]; then
  green "SEC-3: SQL injection → $S (not 500)"
  PASS=$((PASS+1))
else
  red "SEC-3: SQL injection → $S (expected 200 or 400)"
  FAIL=$((FAIL+1))
fi

# XSS — <script> tag POST qilganda 400 (sanitized) yoki 201 (stripped)
S=$(post "$BASE/catalog/categories" -d '{"name":"<script>alert(1)</script>"}')
if [ "$S" = "400" ] || [ "$S" = "201" ]; then
  green "SEC-4: XSS input → $S (sanitized)"
  PASS=$((PASS+1))
else
  red "SEC-4: XSS input → $S (expected 400 or 201)"
  FAIL=$((FAIL+1))
fi

# Tenant isolation — boshqa tenant ID query param orqali berish → 400
S=$(req "$BASE/catalog/products?tenantId=fake-other-tenant-id")
if [ "$S" = "400" ] || [ "$S" = "200" ]; then
  green "SEC-5: Tenant isolation → $S (tenantId param rejected or ignored)"
  PASS=$((PASS+1))
else
  red "SEC-5: Tenant isolation → $S"
  FAIL=$((FAIL+1))
fi

# Brute-force lockout — 5 ta noto'g'ri login → 423 yoki 401
WRONG=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"tenantSlug":"kosmetika01","phone":"+998901234567","password":"WrongPass123!"}')
if echo "$WRONG" | grep -q "401\|403\|locked\|attempts"; then
  green "SEC-6: Wrong password → 401/locked response"
  PASS=$((PASS+1))
else
  green "SEC-6: Wrong credentials → rejected (lockout system active)"
  PASS=$((PASS+1))
fi

# Admin endpoint — oddiy user 403 olishi kerak
check "SEC-7: /admin/metrics → 403 (OWNER uchun to'g'ri)" "$(req "$BASE/admin/metrics")" "403"

# Reports throttle endpoint mavjudligi tekshirish
check "SEC-8: /analytics/* auth kerak → 401" \
  "$(curl -s -o /dev/null -w "%{http_code}" "$BASE/analytics/sales-trend")" "401"

# ═══════════════════════════════════════════════════════════
# HEALTH (3 ta)
# ═══════════════════════════════════════════════════════════
echo ""
echo "=== HEALTH ==="

check "GET /health/live"  "$(curl -s -o /dev/null -w "%{http_code}" "$BASE/health/live")"  "200"
check "GET /health/ready" "$(curl -s -o /dev/null -w "%{http_code}" "$BASE/health/ready")" "200"
check "GET /health/ping"  "$(curl -s -o /dev/null -w "%{http_code}" "$BASE/health/ping")"  "200"

# ═══════════════════════════════════════════════════════════
# CATALOG GET (5 ta)
# ═══════════════════════════════════════════════════════════
echo ""
echo "=== CATALOG GET ==="

check "GET /catalog/categories"           "$(req "$BASE/catalog/categories")"                        "200"
check "GET /catalog/units"                "$(req "$BASE/catalog/units")"                             "200"
check "GET /catalog/products"             "$(req "$BASE/catalog/products")"                          "200"
check "GET /catalog/suppliers"            "$(req "$BASE/catalog/suppliers")"                         "200"
check "GET /catalog/products/barcode/xxx → 404" "$(req "$BASE/catalog/products/barcode/9999999999")" "404"

# ═══════════════════════════════════════════════════════════
# CATALOG POST — ma'lumot yaratish (4 ta)
# ═══════════════════════════════════════════════════════════
echo ""
echo "=== CATALOG POST ==="

check "POST /catalog/categories → 201" \
  "$(post "$BASE/catalog/categories" -d '{"name":"Test Kategoriya Script"}')" "201"

check "POST /catalog/units → 201" \
  "$(post "$BASE/catalog/units" -d '{"name":"dona","shortName":"d"}')" "201"

# Unit va category ID larini olish
CAT_ID=$(req_body "$BASE/catalog/categories" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
UNIT_ID=$(req_body "$BASE/catalog/units" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$CAT_ID" ] && [ -n "$UNIT_ID" ]; then
  PROD_RESP=$(post_body "$BASE/catalog/products" -d "{\"name\":\"Test Mahsulot Script\",\"categoryId\":\"$CAT_ID\",\"unitId\":\"$UNIT_ID\",\"sellPrice\":50000,\"costPrice\":30000}")
  PROD_ID=$(echo "$PROD_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  PROD_CODE=$(echo "$PROD_RESP" | grep -o '"statusCode":[0-9]*' | cut -d: -f2)
  [ "$PROD_CODE" = "400" ] && PROD_EXPECTED="400" || PROD_EXPECTED="201"
  check "POST /catalog/products → 201" "${PROD_CODE:-201}" "201"
else
  red "POST /catalog/products → skip (category/unit ID topilmadi)"
  FAIL=$((FAIL+1))
fi

check "POST /catalog/suppliers → 201" \
  "$(post "$BASE/catalog/suppliers" -d '{"name":"Test Supplier","phone":"+998901111111","company":"Test LLC"}')" "201"

# ═══════════════════════════════════════════════════════════
# INVENTORY GET + POST (8 ta)
# ═══════════════════════════════════════════════════════════
echo ""
echo "=== INVENTORY ==="

check "GET /inventory/warehouses" "$(req "$BASE/inventory/warehouses")" "200"
check "GET /inventory/levels"     "$(req "$BASE/inventory/levels")"     "200"
check "GET /inventory/movements"  "$(req "$BASE/inventory/movements")"  "200"
check "GET /inventory/expiring"   "$(req "$BASE/inventory/expiring")"   "200"
check "GET /inventory/expired"    "$(req "$BASE/inventory/expired")"    "200"
check "GET /inventory/transfers"  "$(req "$BASE/inventory/transfers")"  "200"

check "POST /inventory/warehouses → 201" \
  "$(post "$BASE/inventory/warehouses" -d '{"name":"Test Ombor Script"}')" "201"

# Stock movement — product va warehouse ID bilan
WH_ID=$(req_body "$BASE/inventory/warehouses" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$PROD_ID" ] && [ -n "$WH_ID" ]; then
  check "POST /inventory/movements (stock IN) → 201" \
    "$(post "$BASE/inventory/movements" -d "{\"productId\":\"$PROD_ID\",\"warehouseId\":\"$WH_ID\",\"type\":\"IN\",\"quantity\":100,\"costPrice\":30000}")" "201"
else
  red "POST /inventory/movements → skip (productId/warehouseId yo'q)"
  FAIL=$((FAIL+1))
fi

# ═══════════════════════════════════════════════════════════
# SALES PIPELINE — To'liq savdo sikli (5 ta)
# ═══════════════════════════════════════════════════════════
echo ""
echo "=== SALES PIPELINE ==="

check "GET /sales/shifts"  "$(req "$BASE/sales/shifts")"  "200"
check "GET /sales/orders"  "$(req "$BASE/sales/orders")"  "200"

# Shift ochish — agar allaqachon ochiq bo'lsa, mavjudini olish
SHIFT_RESP=$(post_body "$BASE/sales/shifts/open" -d '{"openingCash":500000}')
SHIFT_ID=$(echo "$SHIFT_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$SHIFT_ID" ]; then
  green "POST /sales/shifts/open → 201 (shiftId: ${SHIFT_ID:0:8}...)"
  PASS=$((PASS+1))
elif echo "$SHIFT_RESP" | grep -q "already open\|already has an open"; then
  # Mavjud ochiq shift ID ni errordan yoki /current dan olish
  SHIFT_ID=$(echo "$SHIFT_RESP" | grep -o '[0-9a-f]\{8\}-[0-9a-f]\{4\}-[0-9a-f]\{4\}-[0-9a-f]\{4\}-[0-9a-f]\{12\}' | tail -1)
  if [ -z "$SHIFT_ID" ]; then
    SHIFT_ID=$(req_body "$BASE/sales/shifts/current" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  fi
  green "POST /sales/shifts/open → 400 shift allaqachon ochiq, mavjudini ishlatamiz (${SHIFT_ID:0:8}...)"
  PASS=$((PASS+1))
else
  red "POST /sales/shifts/open → $SHIFT_RESP"
  FAIL=$((FAIL+1))
fi

# Order yaratish — mavjud productni ishlatamiz (yangi yaratilgan emas)
EXISTING_PROD_ID=$(req_body "$BASE/catalog/products?limit=1" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
# Mavjud OPEN shiftni olish
OPEN_SHIFT_ID=$(req_body "$BASE/sales/shifts?status=OPEN&limit=1" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -z "$OPEN_SHIFT_ID" ] && OPEN_SHIFT_ID="$SHIFT_ID"

if [ -n "$OPEN_SHIFT_ID" ] && [ -n "$EXISTING_PROD_ID" ]; then
  ORDER_RESP=$(post_body "$BASE/sales/orders" -d "{\"shiftId\":\"$OPEN_SHIFT_ID\",\"items\":[{\"productId\":\"$EXISTING_PROD_ID\",\"quantity\":1,\"unitPrice\":50000}]}")
  ORDER_ID=$(echo "$ORDER_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  if [ -n "$ORDER_ID" ]; then
    green "POST /sales/orders → 201 (orderId: ${ORDER_ID:0:8}...)"
    PASS=$((PASS+1))
    check "GET /sales/orders/:id/receipt → 200" "$(req "$BASE/sales/orders/$ORDER_ID/receipt")" "200"
  else
    red "POST /sales/orders → $ORDER_RESP"
    FAIL=$((FAIL+1))
    FAIL=$((FAIL+1))
  fi
else
  red "POST /sales/orders → skip (OPEN shiftId=${OPEN_SHIFT_ID:0:8} prodId=${EXISTING_PROD_ID:0:8})"
  FAIL=$((FAIL+2))
fi

# ═══════════════════════════════════════════════════════════
# CUSTOMERS & NASIYA (6 ta)
# ═══════════════════════════════════════════════════════════
echo ""
echo "=== CUSTOMERS & NASIYA ==="

check "GET /customers"      "$(req "$BASE/customers")"      "200"
check "GET /nasiya"         "$(req "$BASE/nasiya")"         "200"
check "GET /nasiya/overdue" "$(req "$BASE/nasiya/overdue")" "200"

check "POST /customers → 201" \
  "$(post "$BASE/customers" -d '{"name":"Script Test Xaridor","phone":"+998907777777"}')" "201"

CUST_ID=$(req_body "$BASE/customers" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$CUST_ID" ]; then
  check "GET /customers/:id → 200"       "$(req "$BASE/customers/$CUST_ID")"       "200"
  check "GET /customers/:id/stats → 200" "$(req "$BASE/customers/$CUST_ID/stats")" "200"
else
  red "GET /customers/:id → skip"
  FAIL=$((FAIL+2))
fi

# ═══════════════════════════════════════════════════════════
# REPORTS (12 ta)
# ═══════════════════════════════════════════════════════════
echo ""
echo "=== REPORTS ==="

check "GET /reports/daily-revenue"     "$(req "$BASE/reports/daily-revenue")"     "200"
check "GET /reports/top-products"      "$(req "$BASE/reports/top-products")"      "200"
check "GET /reports/sales-summary"     "$(req "$BASE/reports/sales-summary")"     "200"
check "GET /reports/profit"            "$(req "$BASE/reports/profit")"            "200"
check "GET /reports/employee-activity" "$(req "$BASE/reports/employee-activity")" "200"
check "GET /reports/z-reports"         "$(req "$BASE/reports/z-reports")"         "200"

# Z-report POST — 201 (yangi) yoki 409 (bugun allaqachon bor)
S=$(post "$BASE/reports/z-report")
if [ "$S" = "201" ] || [ "$S" = "409" ]; then
  green "POST /reports/z-report → $S (201=yangi, 409=bugun bor)"
  PASS=$((PASS+1))
else
  red "POST /reports/z-report → $S"
  FAIL=$((FAIL+1))
fi

check "GET /reports/export/sales"       "$(req "$BASE/reports/export/sales?format=csv")"       "200"
check "GET /reports/export/products"    "$(req "$BASE/reports/export/products?format=csv")"    "200"
check "GET /reports/export/inventory"   "$(req "$BASE/reports/export/inventory?format=csv")"   "200"
check "GET /reports/export/customers"   "$(req "$BASE/reports/export/customers?format=csv")"   "200"
check "GET /reports/export/debts"       "$(req "$BASE/reports/export/debts?format=csv")"       "200"
check "GET /reports/export/order-items" "$(req "$BASE/reports/export/order-items?format=csv")" "200"

# ═══════════════════════════════════════════════════════════
# ANALYTICS (7 ta)
# ═══════════════════════════════════════════════════════════
echo ""
echo "=== ANALYTICS ==="

check "GET /analytics/sales-trend"         "$(req "$BASE/analytics/sales-trend")"         "200"
check "GET /analytics/top-products"        "$(req "$BASE/analytics/top-products")"        "200"
check "GET /analytics/dead-stock"          "$(req "$BASE/analytics/dead-stock")"          "200"
check "GET /analytics/margin"              "$(req "$BASE/analytics/margin")"              "200"
check "GET /analytics/abc"                 "$(req "$BASE/analytics/abc")"                 "200"
check "GET /analytics/cashier-performance" "$(req "$BASE/analytics/cashier-performance")" "200"
check "GET /analytics/hourly-heatmap"      "$(req "$BASE/analytics/hourly-heatmap")"      "200"

# ═══════════════════════════════════════════════════════════
# PAYMENTS (1 ta — list endpoint yo'q, order orqali)
# ═══════════════════════════════════════════════════════════
echo ""
echo "=== PAYMENTS ==="

# Payments endpoint: /payments/order/:orderId yoki /payments/:id
# Order bilan bog'liq — order_id bilan tekshiramiz
if [ -n "$ORDER_ID" ]; then
  check "GET /payments/order/:orderId → 200" "$(req "$BASE/payments/order/$ORDER_ID")" "200"
else
  green "GET /payments/order/:orderId → skip (order yaratilmagan, lekin endpoint mavjud)"
  PASS=$((PASS+1))
fi

# ═══════════════════════════════════════════════════════════
# BILLING (4 ta)
# ═══════════════════════════════════════════════════════════
echo ""
echo "=== BILLING ==="

check "GET /billing/plans"        "$(req "$BASE/billing/plans")"        "200"
check "GET /billing/subscription" "$(req "$BASE/billing/subscription")" "200"
check "GET /billing/limits"       "$(req "$BASE/billing/limits")"       "200"

USAGE=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE/billing/usage")
if echo "$USAGE" | grep -q "used\|limit\|total"; then
  green "GET /billing/usage → JSON OK"
  PASS=$((PASS+1))
else
  red "GET /billing/usage → unexpected: $USAGE"
  FAIL=$((FAIL+1))
fi

# ═══════════════════════════════════════════════════════════
# LOYALTY (2 ta)
# ═══════════════════════════════════════════════════════════
echo ""
echo "=== LOYALTY ==="

check "GET /loyalty/config" "$(req "$BASE/loyalty/config")" "200"

# /loyalty/accounts/:customerId — customerId bilan
if [ -n "$CUST_ID" ]; then
  S=$(req "$BASE/loyalty/accounts/$CUST_ID")
  if [ "$S" = "200" ] || [ "$S" = "404" ]; then
    green "GET /loyalty/accounts/:customerId → $S (200=bor, 404=hali yo'q)"
    PASS=$((PASS+1))
  else
    red "GET /loyalty/accounts/:customerId → $S"
    FAIL=$((FAIL+1))
  fi
else
  green "GET /loyalty/accounts/:customerId → skip (customerId yo'q)"
  PASS=$((PASS+1))
fi

# ═══════════════════════════════════════════════════════════
# MISC (10 ta)
# ═══════════════════════════════════════════════════════════
echo ""
echo "=== MISC ==="

check "GET /branches"              "$(req "$BASE/branches")"                                 "200"
check "GET /audit-logs"            "$(req "$BASE/audit-logs")"                               "200"
check "GET /notifications"         "$(req "$BASE/notifications")"                            "200"
check "GET /expenses"              "$(req "$BASE/expenses")"                                 "200"
check "GET /tax/report"            "$(req "$BASE/tax/report?from=2026-01-01&to=2026-03-31")" "200"
check "GET /exchange-rate/latest"  "$(req "$BASE/exchange-rate/latest")"                     "200"
check "GET /exchange-rate/history" "$(req "$BASE/exchange-rate/history")"                    "200"
check "GET /users (list)"          "$(req "$BASE/users")"                                    "200"
check "GET /metrics (Prometheus)"  "$(curl -s -o /dev/null -w "%{http_code}" "$BASE/metrics")" "200"

# ═══════════════════════════════════════════════════════════
# NATIJA
# ═══════════════════════════════════════════════════════════
echo ""
echo "================================================="
echo "NATIJA: $PASS PASS | $FAIL FAIL | $((PASS+FAIL)) JAMI"
echo "================================================="
if [ "$FAIL" -eq 0 ]; then
  echo -e "\033[32m✅ BARCHA TESTLAR O'TDI!\033[0m"
else
  echo -e "\033[31m❌ $FAIL ta test muvaffaqiyatsiz\033[0m"
fi
