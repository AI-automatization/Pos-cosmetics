export { authApi } from './auth.api';
export { analyticsApi } from './analytics.api';
export { inventoryApi } from './inventory.api';
export { debtsApi } from './debts.api';
export { shiftsApi } from './shifts.api';
export { employeesApi } from './employees.api';
export { alertsApi } from './alerts.api';
export { branchesApi } from './branches.api';
export { systemApi } from './system.api';

export type { AuthTokens, User, LoginResponse, RegisterPushTokenParams } from './auth.api';
export type {
  AnalyticsParams,
  SalesTrendParams,
  TopProductsParams,
  RevenueData,
  OrdersData,
  SalesTrendPoint,
  BranchComparisonItem,
  TopProduct,
  BranchRevenueItem,
} from './analytics.api';
export type {
  InventoryItem,
  InventoryStatus,
  InventoryParams,
  PaginatedResponse,
  StockValueData,
} from './inventory.api';
export type { CustomerDebt, DebtSummary, AgingBucket, AgingReport, DebtCustomersParams } from './debts.api';
export type { Shift, ShiftSummary, ShiftsParams, PaymentBreakdown } from './shifts.api';
export type { EmployeePerformance, SuspiciousActivityAlert, EmployeeParams, SuspiciousParams } from './employees.api';
export type { Alert, AlertsParams, MarkAllReadParams } from './alerts.api';
export type { Branch } from './branches.api';
export type { SystemHealth, ServiceStatus, BranchSyncStatus, SystemError, SystemErrorsParams } from './system.api';
