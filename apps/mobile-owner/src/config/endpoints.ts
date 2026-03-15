export const ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_BIOMETRIC_REGISTER: '/auth/biometric/register',
  AUTH_BIOMETRIC_VERIFY: '/auth/biometric/verify',
  DEVICES_REGISTER_PUSH_TOKEN: '/notifications/fcm-token', // backend: POST /notifications/fcm-token (token + platform)

  // Analytics
  ANALYTICS_REVENUE: '/analytics/revenue',
  ANALYTICS_ORDERS: '/analytics/orders',
  ANALYTICS_SALES_TREND: '/analytics/sales-trend',
  ANALYTICS_BRANCH_COMPARISON: '/analytics/branch-comparison',
  ANALYTICS_TOP_PRODUCTS: '/analytics/top-products',
  ANALYTICS_EMPLOYEE_PERFORMANCE: '/analytics/employee-performance',
  ANALYTICS_REVENUE_BY_BRANCH: '/analytics/revenue-by-branch',

  // Inventory
  INVENTORY_STOCK: '/inventory/stock',
  INVENTORY_LOW_STOCK: '/inventory/low-stock',
  INVENTORY_EXPIRING: '/inventory/expiring',
  INVENTORY_OUT_OF_STOCK: '/inventory/out-of-stock',
  INVENTORY_STOCK_VALUE: '/inventory/stock-value',

  // Shifts
  SHIFTS: '/shifts',
  SHIFTS_SUMMARY: '/shifts/summary',

  // Debts
  DEBTS_SUMMARY: '/debts/summary',
  DEBTS_AGING_REPORT: '/debts/aging-report',
  DEBTS_CUSTOMERS: '/debts/customers',

  // Employees
  EMPLOYEES: '/employees',
  EMPLOYEES_PERFORMANCE: '/employees/performance',
  EMPLOYEES_SUSPICIOUS_ACTIVITY: '/employees/suspicious-activity',

  // Alerts
  ALERTS: '/alerts',
  ALERTS_UNREAD_COUNT: '/alerts/unread-count',
  ALERTS_READ_ALL: '/alerts/read-all',

  // Branches
  BRANCHES: '/branches',

  // System
  SYSTEM_HEALTH: '/system/health',
  SYSTEM_SYNC_STATUS: '/system/sync-status',
  SYSTEM_ERRORS: '/system/errors',
} as const;
