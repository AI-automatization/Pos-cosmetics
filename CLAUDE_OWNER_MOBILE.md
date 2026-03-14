  # mobile-owner.md — RAOS Owner Mobile App
  # apps/mobile-owner · React Native · Android + iOS · TypeScript · Expo
  # READ-ONLY monitoring application for business owners

  ---

  ## Overview

  **RAOS Owner App** is a dedicated mobile application for business owners to monitor their retail operations remotely across one or multiple branches.

  > ⚠️ This app is **READ-ONLY**. No financial mutations are permitted.

  ### What This App Is

  - A real-time monitoring dashboard for business owners
  - A multi-branch analytics and comparison tool
  - An alert and notification center for critical business events
  - An employee performance and shift oversight tool

  ### What This App Is NOT

  - A POS terminal (use `apps/pos`)
  - A staff tool (use `apps/mobile`)
  - An admin panel (use `apps/web`)

  ### Key Constraints

  ```
  ❌ Cannot create sales
  ❌ Cannot accept payments
  ❌ Cannot change prices
  ❌ Cannot edit inventory
  ❌ Cannot modify customer records
  ❌ Cannot process refunds or returns
  ❌ Cannot create ledger entries
  ✅ Can only VIEW data and receive alerts
  ```

  ### Tech Stack

  | Layer         | Technology                                      |
  | ------------- | ----------------------------------------------- |
  | Framework     | React Native (Expo)                             |
  | Language      | TypeScript (strict mode — `any` PROHIBITED)     |
  | State         | Zustand                                         |
  | Server State  | TanStack Query (React Query)                    |
  | Navigation    | React Navigation v6                             |
  | HTTP Client   | Axios with interceptors                         |
  | Storage       | Expo SecureStore (tokens), AsyncStorage (cache) |
  | Push          | FCM (Firebase Cloud Messaging)                  |
  | Auth          | JWT + Biometric (fingerprint/face)              |
  | Charts        | Victory Native or Recharts Native               |
  | i18n          | i18next (uz, ru, en)                            |
  | Platforms     | Android + iOS                                   |

  ---

  ## Onboarding

  Displayed only on first app launch. Persisted via AsyncStorage flag `onboarding_complete`.

  ### Screen 1 — Welcome

  ```
  Title:    Welcome to RAOS
  Subtitle: Monitor your business from anywhere, anytime.

  Illustration: business owner viewing dashboard on phone

  [Next →]
  ```

  ### Screen 2 — What You Can Monitor

  ```
  Title: What You Can Monitor

  • Sales and revenue (daily, weekly, monthly, yearly)
  • Inventory levels and stock alerts
  • Customer debts and aging reports
  • Employee performance and activity
  • Shift summaries across all cashiers

  [Next →]
  ```

  ### Screen 3 — Branch Selection

  ```
  Title: Your Branches

  You can monitor ALL branches together
  or focus on a single branch.

  Switch branches anytime from the top of the screen.

  [Next →]
  ```

  ### Screen 4 — Alerts

  ```
  Title: Smart Alerts

  You will receive push notifications for:

  • Low stock or out-of-stock items
  • Overdue customer debts
  • Suspicious cashier activity
  • Large refunds or voids
  • System errors

  [Next →]
  ```

  ### Screen 5 — Analytics

  ```
  Title: Business Insights

  View trends, top products, revenue by branch,
  and employee performance metrics — all in one place.

  [Get Started →]
  ```

  ### Onboarding Implementation Notes

  ```typescript
  // store/onboarding.store.ts
  interface OnboardingState {
    readonly isComplete: boolean;
    readonly currentStep: number;
    completeOnboarding: () => void;
    nextStep: () => void;
  }

  // Check on app start:
  const isComplete = await AsyncStorage.getItem('onboarding_complete');
  if (!isComplete) navigate('Onboarding');
  ```

  ---

  ## Branch Selection

  ### Header Branch Selector

  The branch selector must be permanently visible in the app header on all authenticated screens.

  ```
  [🏪 All Branches ▼]    ← always visible in header
  ```

  Tapping opens a bottom sheet with:

  ```
  ○ All Branches
  ● Branch A — Tashkent, Chilanzar
  ○ Branch B — Tashkent, Yunusabad
  ○ Branch C — Samarkand
  ```

  ### Branch State

  ```typescript
  // store/branch.store.ts
  interface BranchState {
    readonly selectedBranchId: string | null; // null = All Branches
    readonly branches: Branch[];
    selectBranch: (id: string | null) => void;
    fetchBranches: () => Promise<void>;
  }

  interface Branch {
    readonly id: string;
    readonly name: string;
    readonly city: string;
    readonly isActive: boolean;
  }
  ```

  ### Branch Selector Rules

  - Default on first login: **All Branches**
  - Selection persists across app sessions (AsyncStorage)
  - All API calls automatically include `branch_id` filter when a branch is selected
  - When **All Branches** is selected, `branch_id` is omitted from API calls

  ---

  ## Dashboard

  The main screen shown after login. Refreshes every 60 seconds automatically. Pull-to-refresh supported.

  ### Revenue Summary Cards

  | Card           | Data                                  |
  | -------------- | ------------------------------------- |
  | Revenue Today  | Sum of all sales today                |
  | Revenue Week   | Current ISO week                      |
  | Revenue Month  | Current calendar month                |
  | Revenue Year   | Current calendar year                 |
  | Total Orders   | Count of orders for selected period   |
  | Avg Order Val  | Revenue ÷ orders for selected period  |

  Each card shows:
  - Current value
  - Trend indicator (% change vs previous period)
  - Currency (UZS by default, configurable)

  ### Dashboard Charts

  1. **Sales Trend** — Line chart, last 30 days revenue
  2. **Branch Comparison** — Bar chart, revenue by branch (current month)
  3. **Top Products** — Horizontal bar chart, top 10 by revenue
  4. **Low Stock Alerts** — List of items below reorder threshold

  ### Dashboard Screen Structure

  ```typescript
  // screens/Dashboard/index.tsx
  export function DashboardScreen() {
    const { branchId } = useBranchStore();
    const { revenue, orders, charts, alerts } = useDashboard(branchId);

    if (revenue.isLoading) return <SkeletonDashboard />;
    if (revenue.error) return <ErrorView error={revenue.error} onRetry={revenue.refetch} />;

    return (
      <ScreenLayout title="Dashboard" showBranchSelector>
        <PullToRefresh onRefresh={revenue.refetch}>
          <RevenueSummaryGrid data={revenue.data} />
          <OrderSummaryRow data={orders.data} />
          <SalesTrendChart data={charts.data?.salesTrend} />
          <BranchComparisonChart data={charts.data?.branchComparison} />
          <TopProductsChart data={charts.data?.topProducts} />
          <LowStockAlertList alerts={alerts.data} />
        </PullToRefresh>
      </ScreenLayout>
    );
  }
  ```

  ---

  ## Multi-Branch Analytics

  Accessible from the **Analytics** tab. Allows deep comparison across branches.

  ### Analytics Screens

  #### Revenue by Branch

  - Bar chart: each bar = one branch
  - Filters: Today / This Week / This Month / This Year / Custom Range
  - Table view below chart: branch name, revenue, orders, avg order value, % of total

  #### Orders by Branch

  - Volume comparison per branch
  - Peak hours heatmap per branch

  #### Stock Value by Branch

  - Total inventory value per branch (quantity × cost price)
  - Breakdown by category

  #### Employee Performance by Branch

  - Orders processed per cashier per branch
  - Revenue generated per cashier
  - Void and refund rates per cashier

  ### Analytics Hook Pattern

  ```typescript
  // hooks/useAnalytics.ts
  export function useAnalytics(branchId: string | null, period: Period) {
    const revenue = useQuery({
      queryKey: ['analytics', 'revenue', branchId, period],
      queryFn: () => analyticsApi.getRevenue({ branchId, period }),
      staleTime: 120_000,
    });

    const branchComparison = useQuery({
      queryKey: ['analytics', 'branch-comparison', period],
      queryFn: () => analyticsApi.getBranchComparison({ period }),
      enabled: branchId === null, // Only when All Branches selected
    });

    return { revenue, branchComparison };
  }
  ```

  ---

  ## Inventory Monitoring

  **READ-ONLY.** The owner can view stock levels but cannot adjust inventory.

  ### Inventory Overview Screen

  Tabs:

  | Tab          | Description                            |
  | ------------ | -------------------------------------- |
  | All Stock    | Full product list with quantities      |
  | Low Stock    | Items below reorder level              |
  | Out of Stock | Items with quantity = 0                |
  | Expiring     | Items expiring within 30 days          |
  | Expired      | Items past expiry date                 |

  ### Product Row Display

  Each inventory item shows:

  ```
  [Product Image]  Product Name
                  Barcode: 4600123456789
                  Qty: 12 units    Branch: Chilanzar
                  Stock Value: 240,000 UZS
                  Expiry: 2025-03-15  ⚠️ Expiring Soon
  ```

  ### Inventory Data Interface

  ```typescript
  interface InventoryItem {
    readonly id: string;
    readonly productName: string;
    readonly barcode: string;
    readonly quantity: number;
    readonly unit: string;
    readonly branchName: string;
    readonly branchId: string;
    readonly costPrice: number;
    readonly stockValue: number;
    readonly reorderLevel: number;
    readonly expiryDate: string | null;
    readonly status: 'normal' | 'low' | 'out_of_stock' | 'expiring' | 'expired';
  }
  ```

  ### Inventory Hook

  ```typescript
  // hooks/useInventory.ts
  export function useInventory(branchId: string | null, status?: InventoryStatus) {
    return useQuery({
      queryKey: ['inventory', branchId, status],
      queryFn: () => inventoryApi.getStock({ branchId, status }),
      refetchInterval: 120_000,
    });
  }
  ```

  ---

  ## Debt Monitoring

  Displays customer credit (nasiya) balances and aging reports.

  ### Debt Overview Screen

  Summary cards:

  ```
  Total Outstanding Debt    Overdue Debt (30+ days)
  [  45,000,000 UZS  ]     [  12,000,000 UZS  ]

  Number of Debtors         Avg Debt per Customer
  [      128         ]     [    351,562 UZS    ]
  ```

  ### Aging Report

  Aging buckets displayed as a bar chart and table:

  | Bucket      | Customers | Total Amount    |
  | ----------- | --------- | --------------- |
  | 0–30 days   | 64        | 18,000,000 UZS  |
  | 31–60 days  | 32        | 12,000,000 UZS  |
  | 61–90 days  | 20        | 9,000,000 UZS   |
  | 90+ days    | 12        | 6,000,000 UZS   |

  ### Customer Debt List

  Each row shows:

  ```
  👤 Alisher Karimov          Branch: Yunusabad
    Total Debt: 1,200,000 UZS
    Last Purchase: 2025-01-15
    Overdue: 45 days           🔴 OVERDUE
  ```

  Sortable by: amount (desc), days overdue (desc), customer name.

  ### Debt Data Interface

  ```typescript
  interface CustomerDebt {
    readonly customerId: string;
    readonly customerName: string;
    readonly phone: string;
    readonly branchName: string;
    readonly totalDebt: number;
    readonly overdueAmount: number;
    readonly daysSinceLastPayment: number;
    readonly agingBucket: '0_30' | '31_60' | '61_90' | '90_plus';
    readonly lastPurchaseDate: string;
  }
  ```

  ---

  ## Shift Monitoring

  Owners can view all shift records for any branch, including open and closed shifts.

  ### Shift List Screen

  Filters: Branch, Date Range, Cashier, Status (Open / Closed)

  Each shift row:

  ```
  🟢 OPEN  |  Branch: Chilanzar  |  Cashier: Nodira
  Opened: 09:00  |  Revenue: 3,450,000 UZS  |  Orders: 47

  ─────────────────────────────────────────────────────

  🔴 CLOSED  |  Branch: Yunusabad  |  Cashier: Jasur
  09:00 → 18:30  |  Revenue: 5,120,000 UZS  |  Orders: 83
  ```

  ### Shift Detail Screen

  ```
  Shift #1042
  Branch: Chilanzar
  Cashier: Nodira Yusupova
  Opened: 2025-02-10 09:00
  Closed: 2025-02-10 18:30
  Duration: 9h 30m

  ── Revenue ───────────────────────────────
  Total Revenue:     5,120,000 UZS
  Total Orders:      83
  Average Order:     61,687 UZS
  Refunds:           2 orders  (120,000 UZS)
  Voids:             1 order   (45,000 UZS)
  Discounts:         5 orders  (85,000 UZS)

  ── Payment Breakdown ─────────────────────
  Cash:              2,400,000 UZS  (46.9%)
  Terminal:          1,800,000 UZS  (35.2%)
  Click:               620,000 UZS  (12.1%)
  Payme:               300,000 UZS   (5.9%)
  ```

  ### Shift Data Interface

  ```typescript
  interface Shift {
    readonly id: string;
    readonly branchId: string;
    readonly branchName: string;
    readonly cashierId: string;
    readonly cashierName: string;
    readonly openedAt: string;
    readonly closedAt: string | null;
    readonly status: 'open' | 'closed';
    readonly totalRevenue: number;
    readonly totalOrders: number;
    readonly avgOrderValue: number;
    readonly totalRefunds: number;
    readonly totalVoids: number;
    readonly totalDiscounts: number;
    readonly paymentBreakdown: PaymentBreakdown[];
  }

  interface PaymentBreakdown {
    readonly method: 'cash' | 'terminal' | 'click' | 'payme' | 'transfer';
    readonly amount: number;
    readonly percentage: number;
  }
  ```

  ---

  ## Employee Monitoring

  ### Employee Performance Screen

  Shows metrics per employee for the selected branch and period.

  Filter by: Branch, Period (Today / Week / Month / Custom), Sort by: Revenue / Orders / Refunds

  Each employee card:

  ```
  👤 Nodira Yusupova  —  Cashier  —  Chilanzar Branch

  Orders:        247     Avg Order:   58,000 UZS
  Revenue:   14,326,000  Refunds:     3 (0.8%)
  Voids:         1       Discounts:   12 (4.9%)
  ```

  ### Suspicious Activity Alerts

  Displayed as a badge count on the employee tab and a dedicated section:

  ```
  ⚠️ Suspicious Activity Alerts

  • Jasur Toshmatov — 5 voids in 2 hours (2025-02-10)
  • Dilnoza Karimova — Large discount: 40% on order #5021
  • Bobur Rahimov — 3 consecutive refunds in 30 min
  ```

  ### Employee Performance Interface

  ```typescript
  interface EmployeePerformance {
    readonly employeeId: string;
    readonly employeeName: string;
    readonly role: string;
    readonly branchName: string;
    readonly totalOrders: number;
    readonly totalRevenue: number;
    readonly avgOrderValue: number;
    readonly totalRefunds: number;
    readonly refundRate: number;
    readonly totalVoids: number;
    readonly totalDiscounts: number;
    readonly discountRate: number;
    readonly suspiciousActivityCount: number;
    readonly alerts: SuspiciousActivityAlert[];
  }

  interface SuspiciousActivityAlert {
    readonly id: string;
    readonly type: 'EXCESSIVE_VOIDS' | 'LARGE_DISCOUNT' | 'RAPID_REFUNDS' | 'OFF_HOURS_ACTIVITY';
    readonly description: string;
    readonly occurredAt: string;
    readonly severity: 'low' | 'medium' | 'high';
  }
  ```

  ---

  ## Alerts

  ### Alert Types

  | Type                  | Trigger                                        | Priority |
  | --------------------- | ---------------------------------------------- | -------- |
  | `LOW_STOCK`           | Item quantity below reorder level              | Medium   |
  | `OUT_OF_STOCK`        | Item quantity reaches 0                        | High     |
  | `EXPIRY_WARNING`      | Item expiring within 30 days                   | Medium   |
  | `LARGE_REFUND`        | Single refund exceeds threshold                | High     |
  | `SUSPICIOUS_ACTIVITY` | Excessive voids, refunds, or large discounts   | High     |
  | `SHIFT_CLOSED`        | Cashier closes shift                           | Low      |
  | `SYSTEM_ERROR`        | API error, sync failure, worker crash          | High     |
  | `NASIYA_OVERDUE`      | Customer debt overdue (30+ days)               | Medium   |

  ### Alerts List Screen

  Filter by: Type, Branch, Priority, Date, Read/Unread

  Each alert row:

  ```
  🔴  OUT_OF_STOCK                           2 min ago
      Coca-Cola 2L — Chilanzar Branch
      Qty: 0  |  Last seen: 12 units (yesterday)
      [View Product →]

  ──────────────────────────────────────────────────

  ⚠️  SUSPICIOUS_ACTIVITY                    1 hour ago
      Jasur Toshmatov — 5 voids in 2 hours
      Branch: Yunusabad  |  Shift #1088
      [View Employee →]
  ```

  ### Push Notification Setup

  ```typescript
  // notifications/setup.ts
  export async function registerPushNotifications(tenantId: string, userId: string) {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    const token = await Notifications.getExpoPushTokenAsync();

    await alertsApi.registerDevice({
      token: token.data,
      platform: Platform.OS,
      tenantId,
      userId,
    });
  }

  // notifications/handler.ts
  export function setupNotificationHandlers() {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    Notifications.addNotificationReceivedListener(handleForegroundNotification);
    Notifications.addNotificationResponseReceivedListener(handleNotificationTap);
  }

  function handleNotificationTap(response: Notifications.NotificationResponse) {
    const { type, entityId, branchId } = response.notification.request.content.data as AlertPayload;

    switch (type) {
      case 'LOW_STOCK':
      case 'OUT_OF_STOCK':
        navigate('Inventory', { productId: entityId, branchId });
        break;
      case 'SUSPICIOUS_ACTIVITY':
      case 'LARGE_REFUND':
        navigate('Employees', { employeeId: entityId });
        break;
      case 'NASIYA_OVERDUE':
        navigate('Debts', { customerId: entityId });
        break;
      case 'SYSTEM_ERROR':
        navigate('SystemHealth');
        break;
      default:
        navigate('Alerts');
    }
  }
  ```

  ---

  ## System Health

  Owners can view the technical health of the RAOS backend.

  ### System Health Screen

  ```
  System Health                          Last updated: 2s ago

  ── API Status ───────────────────────────────────────
  🟢  API Server          Healthy       Uptime: 99.97%
  🟢  Database            Healthy       Response: 12ms
  🟡  Worker Queue        Degraded      Queue depth: 142
  🔴  Fiscal Service      Error         Last error: 14min ago

  ── Sync Status ──────────────────────────────────────
  🟢  Chilanzar POS       Synced        Last sync: 2 min ago
  🟢  Yunusabad POS       Synced        Last sync: 5 min ago
  🔴  Samarkand POS       Offline       Last sync: 4 hours ago

  ── Recent Errors ────────────────────────────────────
  [ERROR] Fiscal receipt timeout — Order #5034 (14 min ago)
  [WARN]  Worker queue depth high: 142 pending jobs (1 hr ago)
  [ERROR] Samarkand POS sync failed: Connection refused (4 hr ago)
  ```

  ### System Health Interface

  ```typescript
  interface SystemHealth {
    readonly apiStatus: ServiceStatus;
    readonly databaseStatus: ServiceStatus;
    readonly workerStatus: ServiceStatus;
    readonly fiscalStatus: ServiceStatus;
    readonly uptime: number; // seconds
    readonly syncStatuses: BranchSyncStatus[];
    readonly recentErrors: SystemError[];
  }

  interface ServiceStatus {
    readonly status: 'healthy' | 'degraded' | 'error';
    readonly responseMs?: number;
    readonly message?: string;
  }

  interface BranchSyncStatus {
    readonly branchId: string;
    readonly branchName: string;
    readonly status: 'synced' | 'pending' | 'offline' | 'error';
    readonly lastSyncAt: string;
    readonly pendingItems: number;
  }

  interface SystemError {
    readonly id: string;
    readonly level: 'error' | 'warn' | 'info';
    readonly message: string;
    readonly occurredAt: string;
    readonly service: string;
  }
  ```

  ---

  ## Mobile App Structure

  ```
  apps/mobile-owner/
    app.json
    App.tsx
    babel.config.js
    tsconfig.json
    package.json

    src/
      screens/
        Auth/
          LoginScreen.tsx
          BiometricScreen.tsx
        Onboarding/
          OnboardingScreen.tsx
          steps/
            WelcomeStep.tsx
            MonitorStep.tsx
            BranchStep.tsx
            AlertsStep.tsx
            AnalyticsStep.tsx
        Dashboard/
          index.tsx
          RevenueSummaryGrid.tsx
          SalesTrendChart.tsx
          BranchComparisonChart.tsx
          TopProductsChart.tsx
          LowStockAlertList.tsx
          useDashboardData.ts
        Analytics/
          index.tsx
          RevenueByBranchChart.tsx
          OrdersByBranchChart.tsx
          StockValueByBranch.tsx
          useAnalyticsData.ts
        Inventory/
          index.tsx
          InventoryList.tsx
          InventoryItem.tsx
          ExpiringList.tsx
          LowStockList.tsx
          useInventoryData.ts
        Debts/
          index.tsx
          DebtSummaryCards.tsx
          AgingReportChart.tsx
          CustomerDebtList.tsx
          CustomerDebtRow.tsx
          useDebtsData.ts
        Shifts/
          index.tsx
          ShiftList.tsx
          ShiftRow.tsx
          ShiftDetailScreen.tsx
          PaymentBreakdownChart.tsx
          useShiftsData.ts
        Employees/
          index.tsx
          EmployeeList.tsx
          EmployeeCard.tsx
          SuspiciousActivityList.tsx
          useEmployeesData.ts
        Alerts/
          index.tsx
          AlertList.tsx
          AlertRow.tsx
          AlertDetailScreen.tsx
          useAlertsData.ts
        SystemHealth/
          index.tsx
          ServiceStatusCard.tsx
          SyncStatusList.tsx
          RecentErrorsList.tsx
          useSystemHealthData.ts
        Settings/
          index.tsx
          ProfileScreen.tsx
          NotificationPrefsScreen.tsx
          LanguageScreen.tsx
          SecurityScreen.tsx

      components/
        common/
          Card.tsx
          Badge.tsx
          LoadingSpinner.tsx
          SkeletonCard.tsx
          SkeletonList.tsx
          ErrorView.tsx
          EmptyState.tsx
          PullToRefresh.tsx
          StatusIndicator.tsx
          TrendBadge.tsx
          CurrencyText.tsx
          DateRangePicker.tsx
          FilterSheet.tsx
        charts/
          LineChart.tsx
          BarChart.tsx
          HorizontalBarChart.tsx
          PieChart.tsx
          AgingBucketChart.tsx
          MiniSparkline.tsx
        layout/
          ScreenLayout.tsx
          TabBarLayout.tsx
          HeaderBranchSelector.tsx
          BranchSelectorSheet.tsx
          SectionHeader.tsx

      navigation/
        RootNavigator.tsx
        AuthNavigator.tsx
        OnboardingNavigator.tsx
        TabNavigator.tsx
        types.ts

      hooks/
        useDashboard.ts
        useAnalytics.ts
        useInventory.ts
        useDebts.ts
        useShifts.ts
        useEmployees.ts
        useAlerts.ts
        useSystemHealth.ts
        useBiometricAuth.ts
        useNotifications.ts
        usePeriodFilter.ts
        useCurrency.ts

      api/
        client.ts
        auth.api.ts
        analytics.api.ts
        inventory.api.ts
        debts.api.ts
        shifts.api.ts
        employees.api.ts
        alerts.api.ts
        branches.api.ts
        system.api.ts
        index.ts

      store/
        auth.store.ts
        branch.store.ts
        alerts.store.ts
        onboarding.store.ts

      notifications/
        setup.ts
        handler.ts
        types.ts

      i18n/
        index.ts
        locales/
          uz.json
          ru.json
          en.json

      utils/
        formatCurrency.ts
        formatDate.ts
        extractErrorMessage.ts
        agingBucket.ts

      config/
        constants.ts
        endpoints.ts
        queryKeys.ts

      assets/
        images/
        fonts/
        icons/
  ```

  ---

  ## Backend API Requirements

  All endpoints require:
  - `Authorization: Bearer <access_token>` header
  - `tenant_id` resolved from JWT claims
  - Optional query params: `branch_id`, `from_date`, `to_date`, `period`

  ### Authentication

  ```
  POST   /auth/login
  POST   /auth/refresh
  POST   /auth/logout
  POST   /auth/biometric/register
  POST   /auth/biometric/verify
  POST   /devices/register-push-token
  ```

  ### Analytics

  ```
  GET    /analytics/revenue
        ?branch_id&period&from_date&to_date
        → { today, week, month, year, trend }

  GET    /analytics/orders
        ?branch_id&period&from_date&to_date
        → { total, avgOrderValue, trend }

  GET    /analytics/sales-trend
        ?branch_id&from_date&to_date&granularity=day|week|month
        → [{ date, revenue, orders }]

  GET    /analytics/branch-comparison
        ?period&from_date&to_date
        → [{ branchId, branchName, revenue, orders, avgOrderValue }]

  GET    /analytics/top-products
        ?branch_id&period&from_date&to_date&limit=10
        → [{ productId, name, revenue, quantity }]

  GET    /analytics/employee-performance
        ?branch_id&period&from_date&to_date
        → [{ employeeId, name, orders, revenue, refunds, voids, discounts }]

  GET    /analytics/revenue-by-branch
        ?period&from_date&to_date
        → [{ branchId, name, revenue, stockValue, orders }]
  ```

  ### Inventory

  ```
  GET    /inventory/stock
        ?branch_id&status=normal|low|out_of_stock|expiring|expired&page&limit
        → { items: InventoryItem[], total, page }

  GET    /inventory/low-stock
        ?branch_id
        → [{ productId, name, quantity, reorderLevel, branchName }]

  GET    /inventory/expiring
        ?branch_id&days=30
        → [{ productId, name, expiryDate, quantity, branchName }]

  GET    /inventory/out-of-stock
        ?branch_id
        → [{ productId, name, branchName, lastQuantity }]

  GET    /inventory/stock-value
        ?branch_id
        → { totalValue, byBranch: [{ branchId, value }] }
  ```

  ### Shifts

  ```
  GET    /shifts
        ?branch_id&from_date&to_date&cashier_id&status=open|closed&page&limit
        → { shifts: Shift[], total, page }

  GET    /shifts/:id
        → Shift (with payment breakdown)

  GET    /shifts/summary
        ?branch_id&from_date&to_date
        → { totalRevenue, totalOrders, totalShifts, avgRevenuePerShift }
  ```

  ### Debts (Nasiya)

  ```
  GET    /debts/summary
        ?branch_id
        → { totalDebt, overdueDebt, debtorCount, avgDebt }

  GET    /debts/aging-report
        ?branch_id
        → { buckets: [{ label, amount, customerCount }] }

  GET    /debts/customers
        ?branch_id&aging_bucket&sort=amount|days&page&limit
        → { customers: CustomerDebt[], total, page }

  GET    /debts/customers/:id
        → CustomerDebt (with transaction history)
  ```

  ### Employees

  ```
  GET    /employees/performance
        ?branch_id&from_date&to_date&period
        → [EmployeePerformance]

  GET    /employees/:id/performance
        ?from_date&to_date
        → EmployeePerformance

  GET    /employees/suspicious-activity
        ?branch_id&from_date&to_date&severity=low|medium|high
        → [SuspiciousActivityAlert]
  ```

  ### Alerts

  ```
  GET    /alerts
        ?branch_id&type&priority&status=unread|read|all&page&limit
        → { alerts: Alert[], unreadCount, total, page }

  PATCH  /alerts/:id/read
        → { success: true }

  PATCH  /alerts/read-all
        ?branch_id&type
        → { success: true, count: number }

  GET    /alerts/unread-count
        ?branch_id
        → { count: number }
  ```

  ### Branches

  ```
  GET    /branches
        → [Branch]

  GET    /branches/:id
        → Branch (with address, manager, contact)
  ```

  ### System Health

  ```
  GET    /system/health
        → SystemHealth

  GET    /system/sync-status
        → [BranchSyncStatus]

  GET    /system/errors
        ?from_date&level=error|warn&limit=50
        → [SystemError]
  ```

  ---

  ## Security Rules

  ### Authentication & Authorization

  ```
  ✅ JWT access token (15 min TTL)
  ✅ JWT refresh token (7 days, stored in SecureStore)
  ✅ Biometric re-auth on app foreground resume (after 5 min background)
  ✅ Token refresh interceptor (auto-silent refresh)
  ✅ On refresh failure → force logout → navigate to login
  ✅ Owner role verified server-side on every request
  ✅ tenant_id always resolved from JWT — never from client query param
  ✅ branch_id validated against tenant ownership server-side
  ```

  ### Role: OWNER

  ```
  The OWNER role must be enforced server-side as a guard on all /owner/* routes:

  @Roles('OWNER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  ```

  Owner API endpoints must be:
  - Prefixed `/owner/` OR
  - Protected by role guard that rejects non-OWNER tokens

  ### Read-Only Enforcement

  ```
  ✅ Owner app makes ONLY GET requests (except: alert read status PATCH)
  ✅ Backend must reject POST/PUT/DELETE from OWNER role on financial resources:
    - /sales
    - /payments
    - /inventory/adjust
    - /products (create/update/delete)
    - /customers (create/update)
    - /ledger
    - /refunds
  ```

  ### Data Protection

  ```
  ✅ Tokens: Expo SecureStore (encrypted, hardware-backed where available)
  ✅ No sensitive data in AsyncStorage
  ✅ No financial data cached unencrypted on device
  ✅ HTTPS only — certificate pinning recommended for production
  ✅ Push token registered per device, revoked on logout
  ✅ Screenshot prevention on sensitive screens (iOS: secure flag, Android: FLAG_SECURE)
  ✅ App lock on 5 min background (biometric re-auth required)
  ```

  ### Multi-Tenant Isolation

  ```
  ✅ tenant_id resolved from JWT on every API call
  ✅ Owner can only see data belonging to their tenant
  ✅ branch_id validated: branch must belong to owner's tenant
  ✅ No cross-tenant data leakage — enforced at service layer
  ```

  ### Audit Logging

  ```
  ✅ Every owner API request logged: tenantId, userId, method, url, timestamp
  ✅ Alert read events logged
  ✅ Login/logout events logged with device info
  ✅ Failed auth attempts logged with IP
  ```

  ### Network Security

  ```
  ✅ All API calls over HTTPS
  ✅ Authorization header automatically stripped from error logs
  ✅ No API keys or secrets bundled in app
  ✅ API base URL from environment config (not hardcoded)
  ```

  ---

  ## Development Setup

  ```bash
  # 1. Create app
  cd apps
  npx create-expo-app mobile-owner --template expo-template-blank-typescript

  # 2. Install core dependencies
  cd mobile-owner
  pnpm add @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
  pnpm add @tanstack/react-query zustand axios
  pnpm add expo-secure-store expo-local-authentication expo-notifications
  pnpm add i18next react-i18next
  pnpm add victory-native  # or recharts-native

  # 3. Environment
  cp .env.example .env.local
  # Set: API_URL, FIREBASE_CONFIG, SENTRY_DSN

  # 4. Start
  pnpm start
  ```

  ### Environment Variables

  ```
  API_BASE_URL=https://api.raos.uz
  FIREBASE_API_KEY=...
  FIREBASE_PROJECT_ID=...
  SENTRY_DSN=...
  APP_ENV=development|staging|production
  ```

  ---

  ## Code Quality Rules

  ```
  ❌ any type — TypeScript strict mode enforced
  ❌ console.log — use structured logging or remove
  ❌ Hardcoded text — use i18n keys
  ❌ 250+ line components — split into smaller components
  ❌ Financial mutation API calls — NEVER in this app
  ❌ Token storage in AsyncStorage — use SecureStore
  ❌ ScrollView for long lists — use FlatList
  ❌ Inline styles — use StyleSheet.create()
  ❌ Magic numbers — use named constants from config/constants.ts
  ✅ TypeScript interfaces for all API responses
  ✅ Custom hooks for all data fetching
  ✅ Pull-to-refresh on all list screens 
  ✅ Skeleton loading on initial load
  ✅ Error boundaries on all screens
  ✅ iOS and Android both supported
  ✅ Dark/Light theme support
  ✅ i18n: uz, ru, en
  ```

  ---

  *mobile-owner.md | RAOS | apps/mobile-owner | v1.0*