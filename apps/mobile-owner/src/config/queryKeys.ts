export const QUERY_KEYS = {
  dashboard: {
    revenue: (branchId?: string | null) => ['dashboard', 'revenue', branchId ?? 'all'] as const,
    orders: (branchId?: string | null) => ['dashboard', 'orders', branchId ?? 'all'] as const,
    salesTrend: (branchId?: string | null) => ['dashboard', 'salesTrend', branchId ?? 'all'] as const,
    branchComparison: () => ['dashboard', 'branchComparison'] as const,
    topProducts: (branchId?: string | null) => ['dashboard', 'topProducts', branchId ?? 'all'] as const,
  },
  analytics: {
    revenue: (branchId?: string | null, period?: string) => ['analytics', 'revenue', branchId ?? 'all', period ?? 'month'] as const,
    orders: (branchId?: string | null, period?: string) => ['analytics', 'orders', branchId ?? 'all', period ?? 'month'] as const,
    revenueByBranch: (period?: string) => ['analytics', 'revenueByBranch', period ?? 'month'] as const,
    stockValue: (branchId?: string | null) => ['analytics', 'stockValue', branchId ?? 'all'] as const,
  },
  inventory: {
    stock: (branchId?: string | null, status?: string) => ['inventory', 'stock', branchId ?? 'all', status ?? 'all'] as const,
    lowStock: (branchId?: string | null) => ['inventory', 'lowStock', branchId ?? 'all'] as const,
    expiring: (branchId?: string | null) => ['inventory', 'expiring', branchId ?? 'all'] as const,
    outOfStock: (branchId?: string | null) => ['inventory', 'outOfStock', branchId ?? 'all'] as const,
    stockValue: (branchId?: string | null) => ['inventory', 'stockValue', branchId ?? 'all'] as const,
  },
  debts: {
    summary: (branchId?: string | null) => ['debts', 'summary', branchId ?? 'all'] as const,
    agingReport: (branchId?: string | null) => ['debts', 'agingReport', branchId ?? 'all'] as const,
    customers: (branchId?: string | null, page?: number) => ['debts', 'customers', branchId ?? 'all', page ?? 1] as const,
  },
  shifts: {
    list: (branchId?: string | null, page?: number) => ['shifts', 'list', branchId ?? 'all', page ?? 1] as const,
    detail: (id: string) => ['shifts', 'detail', id] as const,
    summary: (branchId?: string | null) => ['shifts', 'summary', branchId ?? 'all'] as const,
  },
  employees: {
    list: (branchId?: string | null) => ['employees', 'list', branchId ?? 'all'] as const,
    performance: (branchId?: string | null, period?: string) => ['employees', 'performance', branchId ?? 'all', period ?? 'month'] as const,
    suspicious: (branchId?: string | null) => ['employees', 'suspicious', branchId ?? 'all'] as const,
    detail: (id: string) => ['employees', 'detail', id] as const,
    profile: (id: string) => ['employees', 'profile', id] as const,
  },
  alerts: {
    // Branch-level prefix for invalidation — matches every status/priority combination.
    listKey: (branchId?: string | null) => ['alerts', 'list', branchId ?? 'all'] as const,
    list: (branchId?: string | null, statusFilter?: string, priorityFilter?: string) =>
      ['alerts', 'list', branchId ?? 'all', statusFilter ?? 'all', priorityFilter ?? 'all'] as const,
    unreadCount: (branchId?: string | null) => ['alerts', 'unreadCount', branchId ?? 'all'] as const,
    detail: (id: string) => ['alerts', 'detail', id] as const,
  },
  branches: {
    all: () => ['branches'] as const,
    detail: (id: string) => ['branches', 'detail', id] as const,
  },
  reports: {
    shiftReports: (branchId?: string | null, period?: string) => ['reports', 'shifts', branchId ?? 'all', period ?? 'today'] as const,
    branchReport: (period?: string) => ['reports', 'branches', period ?? 'month'] as const,
  },
  system: {
    health: () => ['system', 'health'] as const,
    syncStatus: () => ['system', 'syncStatus'] as const,
    errors: () => ['system', 'errors'] as const,
  },
} as const;
