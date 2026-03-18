CLAUDE_FRONTEND_OWNER.md — RAOS Owner Panel Guide
Next.js · React 19 · TypeScript · Tailwind · React Query
Claude CLI bu faylni Owner panel ustida ishlaganda o'qiydi
👋 ZONA
apps/web/src/
  pages/
    owner/                    → Owner monitoring panel

  components/
    owner/                    → Owner-specific UI components

  hooks/
    owner/                    → Owner analytics hooks

  api/
    analytics.api.ts
    inventory.api.ts
    debts.api.ts
    employees.api.ts
    alerts.api.ts
    system.api.ts

  store/
    owner.store.ts            → Owner UI state

  utils/
    ownerMetrics.ts

  config/
    owner.config.ts

Owner panel Admin Panel ichida ishlaydi.

🏗 OWNER PANEL STRUKTURASI
apps/web/src/pages/owner/

Dashboard/
  index.tsx
  RevenueCards.tsx
  SalesTrendChart.tsx
  BranchComparisonChart.tsx
  TopProductsChart.tsx
  LowStockList.tsx
  useDashboardData.ts

Analytics/
  index.tsx
  RevenueAnalytics.tsx
  OrdersAnalytics.tsx
  ProductAnalytics.tsx
  BranchAnalytics.tsx
  useAnalyticsData.ts

Inventory/
  index.tsx
  InventoryTable.tsx
  LowStockList.tsx
  ExpiringProducts.tsx
  useInventoryData.ts

Debts/
  index.tsx
  DebtSummary.tsx
  AgingReport.tsx
  CustomerDebtTable.tsx
  useDebtData.ts

Shifts/
  index.tsx
  ShiftTable.tsx
  ShiftDetails.tsx
  useShiftData.ts

Employees/
  index.tsx
  EmployeePerformanceTable.tsx
  SuspiciousActivityList.tsx
  useEmployeeData.ts

Alerts/
  index.tsx
  AlertsTable.tsx
  AlertFilters.tsx
  useAlertsData.ts

System/
  index.tsx
  SystemHealthCard.tsx
  SyncStatusList.tsx
  ErrorLogs.tsx
  useSystemData.ts
📊 OWNER PANEL PAGES

Owner panel sahifalari:

/owner/dashboard
/owner/analytics
/owner/inventory
/owner/debts
/owner/shifts
/owner/employees
/owner/alerts
/owner/system
🖥 OWNER DASHBOARD

Dashboard biznes monitoring sahifasi.

Ko'rsatadi:

Revenue Today
Revenue Week
Revenue Month
Revenue Year
Total Orders
Average Order Value
Sales Trend Chart

Ko'rsatadi:

last 30 days revenue
daily orders

Chart turi:

LineChart
Branch Comparison

Ko'rsatadi:

revenue per branch
orders per branch
avg order value

Chart:

BarChart
Top Products

Ko'rsatadi:

product name
revenue
quantity sold
Low Stock Alerts

Ko'rsatadi:

product
branch
quantity
reorder level
📈 ANALYTICS

Analytics sahifasi biznes analiz uchun.

Period filter:

Today
Week
Month
Year
Custom Range
Revenue Analytics

Ko'rsatadi:

total revenue
revenue growth
revenue per branch
revenue per employee

Charts:

Revenue Trend
Revenue By Branch
Hourly Revenue
Orders Analytics

Ko'rsatadi:

orders volume
orders per branch
orders per employee
peak hours
Product Analytics

Ko'rsatadi:

top selling products
slow selling products
dead stock

Dead stock:

product not sold for 30 days
📦 INVENTORY

Inventory monitoring sahifasi.

Tabs:

All Stock
Low Stock
Out Of Stock
Expiring
Expired

Ko'rsatadi:

product name
barcode
branch
quantity
stock value
expiry date
💳 DEBTS

Debt monitoring sahifasi.

Summary cards:

Total Debt
Overdue Debt
Debtors Count
Average Debt
Aging Report

Debt kategoriyalar:

0–30 days
31–60 days
61–90 days
90+ days
Customer Debt Table

Ko'rsatadi:

customer name
branch
total debt
last purchase
days overdue
⏰ SHIFTS

Shift monitoring sahifasi.

Ko'rsatadi:

shift revenue
orders
avg order value
refunds
voids
discounts

Payment methods:

cash
terminal
click
payme
👥 EMPLOYEES

Employee monitoring sahifasi.

Ko'rsatadi:

orders per employee
revenue per employee
avg order
refund rate
void rate
discount rate
Suspicious Activity

Ko'rsatadi:

excessive voids
rapid refunds
large discounts
🚨 ALERTS

Alerts sahifasi.

Alert types:

LOW_STOCK
OUT_OF_STOCK
EXPIRY_WARNING
SUSPICIOUS_ACTIVITY
LARGE_REFUND
NASIYA_OVERDUE
SYSTEM_ERROR

Priority:

LOW
MEDIUM
HIGH
🧠 SYSTEM HEALTH

System monitoring sahifasi.

Ko'rsatadi:

API server status
Database status
Worker queue
POS sync status
Recent errors

Status indikatorlari:

Healthy
Degraded
Error
🔄 DATA FETCHING

Owner panel React Query ishlatadi.

Example:


export function useOwnerRevenue(period: Period) {
  return useQuery({
    queryKey: ['owner','revenue',period],
    queryFn: () => analyticsApi.getRevenue(period),
    staleTime: 60_000,
  });
}
🔄 STATE MANAGEMENT

Owner panel state:

selectedBranch
dateRange
sidebarOpen

Zustand ishlatiladi.

🎨 DESIGN SYSTEM

Owner panel UI:

TailwindCSS
Responsive charts
Dark mode

Spacing scale:

4
8
12
16
24
32
48

Charts:

Recharts
ResponsiveContainer
🌍 I18N

Supported languages:

uz
ru
en

Translation files:

i18n/uz.json
i18n/ru.json
i18n/en.json
📊 OWNER PANEL MAQSADI

Owner panel yordam beradi:

monitor revenue
compare branches
analyze employees
track inventory
monitor debts
detect suspicious activity
monitor system health
