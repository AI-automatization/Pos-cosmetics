# RAOS — API Contract for Web (Admin Panel)
# Faqat AbdulazizYormatov uchun — apps/web va apps/pos
# Yangilangan: 2026-03-10

> ⚠️ Bu fayl backend bilan kontrakt hisoblanadi.
> Endpoint path, method, request/response strukturasi O'ZGARTIRILMAYDI.
> Xato ko'rsak — Polat ga xabar ber, o'zing o'zgartirma.

---

## MUHIM QOIDALAR

```
BASE_URL  = process.env.NEXT_PUBLIC_API_URL  (masalan: https://api-production-c5b6.up.railway.app/api/v1)
Auth      = Bearer token (JWT, 15 min)
Refresh   = httpOnly cookie yoki /auth/refresh orqali
BigInt    = backend BigInt ni .toString() qilib yuboradi — parse qilmang, string sifatida ishlating
Decimal   = Prisma Decimal → JSON da string "12500.00" — Number() bilan o'zgartiring
tenantId  = HECH QACHON frontend dan yuborma — JWT dan backend o'zi oladi
```

---

## HTTP CLIENT SETUP

```typescript
// apps/web/src/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // refresh token cookie uchun
});

// Request interceptor — har so'rovga token qo'shish
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — 401 bo'lsa token yangilash
apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      try {
        const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {}, { withCredentials: true });
        localStorage.setItem('access_token', data.accessToken);
        err.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(err.config);
      } catch {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);
```

---

## TYPESCRIPT TYPES

```typescript
// apps/web/src/types/api.ts  (yoki packages/types/ ga ko'chirish kelishilgandan keyin)

// ─── Umumiy ───────────────────────────────────────────────────

export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'VIEWER';
export type OrderStatus = 'COMPLETED' | 'RETURNED' | 'VOIDED';
export type PaymentMethod = 'CASH' | 'TERMINAL' | 'CLICK' | 'PAYME' | 'TRANSFER';
export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'SETTLED' | 'FAILED' | 'REVERSED';
export type ShiftStatus = 'OPEN' | 'CLOSED';
export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'RETURN_IN' | 'TESTER';
export type DebtStatus = 'ACTIVE' | 'PARTIAL' | 'PAID' | 'OVERDUE';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

// ─── Auth ─────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
  slug: string; // tenant slug — MAJBURIY
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    tenantId: string;
    tenant: { id: string; name: string; slug: string };
  };
}

export interface RegisterRequest {
  tenantName: string;
  slug: string;
  ownerEmail: string;
  ownerPassword: string;
  ownerFirstName: string;
  ownerLastName: string;
}

// ─── User ─────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

// ─── Catalog ──────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  children?: Category[];
}

export interface Unit {
  id: string;
  name: string;
  symbol: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  categoryId: string | null;
  unitId: string | null;
  sellPrice: string;      // Decimal → string "12500.00"
  costPrice: string;      // Decimal → string
  minStockLevel: number;
  isActive: boolean;
  category?: Pick<Category, 'id' | 'name'>;
  unit?: Pick<Unit, 'id' | 'name' | 'symbol'>;
}

export interface CreateProductRequest {
  name: string;
  sku?: string;
  barcode?: string;
  categoryId?: string;
  unitId?: string;
  sellPrice: number;
  costPrice: number;
  minStockLevel?: number;
}

export interface ProductsFilter {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  isActive: boolean;
}

// ─── Inventory ────────────────────────────────────────────────

export interface Warehouse {
  id: string;
  name: string;
  branchId: string | null;
  isActive: boolean;
}

export interface StockLevel {
  productId: string;
  productName: string;
  sku: string | null;
  barcode: string | null;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  minStockLevel: number;
  isLow: boolean;
}

export interface StockMovementRequest {
  productId: string;
  warehouseId: string;
  type: StockMovementType;
  quantity: number;
  costPrice?: number;
  batchNumber?: string;
  expiryDate?: string; // ISO date
  note?: string;
}

export interface StockTransfer {
  id: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  status: 'PENDING' | 'APPROVED' | 'SHIPPED' | 'RECEIVED' | 'CANCELLED';
  items: { productId: string; quantity: number }[];
  createdAt: string;
}

// ─── Sales ────────────────────────────────────────────────────

export interface Shift {
  id: string;
  status: ShiftStatus;
  openedAt: string;
  closedAt: string | null;
  openingCash: string;
  user: Pick<User, 'id' | 'firstName' | 'lastName'>;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface CreateOrderRequest {
  shiftId: string;
  customerId?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }[];
  discountAmount?: number;
  note?: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  total: string;           // Decimal
  discountAmount: string;  // Decimal
  shiftId: string;
  customerId: string | null;
  fiscalStatus: 'PENDING' | 'SENT' | 'FAILED';
  fiscalId: string | null;
  fiscalQr: string | null;
  items: OrderItem[];
  payments: PaymentIntent[];
  createdAt: string;
}

// ─── Payments ─────────────────────────────────────────────────

export interface PaymentIntent {
  id: string;
  method: PaymentMethod;
  amount: string; // Decimal
  status: PaymentStatus;
  orderId: string;
}

export interface CreatePaymentRequest {
  orderId: string;
  method: PaymentMethod;
  amount: number;
}

export interface SplitPaymentRequest {
  orderId: string;
  payments: { method: PaymentMethod; amount: number }[];
}

// ─── Customers ────────────────────────────────────────────────

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CustomerStats {
  totalOrders: number;
  totalSpent: string;
  totalDebt: string;
  lastOrderAt: string | null;
}

// ─── Nasiya (Qarz) ────────────────────────────────────────────

export interface DebtRecord {
  id: string;
  customerId: string;
  orderId: string | null;
  totalAmount: string;   // Decimal — FIELD NOMI: totalAmount (amount EMAS!)
  paidAmount: string;
  remaining: string;
  dueDate: string | null;
  status: DebtStatus;
  customer: Pick<Customer, 'id' | 'name' | 'phone'>;
  createdAt: string;
}

export interface CreateDebtRequest {
  customerId: string;
  orderId?: string;
  totalAmount: number;   // ⚠️ amount EMAS — totalAmount!
  dueDate?: string;
  note?: string;
}

export interface DebtPaymentRequest {
  amount: number;
  method?: PaymentMethod;
  note?: string;
}

// ─── Reports ──────────────────────────────────────────────────

export interface DailyRevenueReport {
  date: string;
  revenue: number;
  orders: number;
  returns: number;
  netRevenue: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  qtySold: number;
  revenue: number;
}

export interface SalesSummary {
  totalRevenue: string;
  totalOrders: number;
  totalReturns: number;
  netRevenue: string;
  avgOrderValue: string;
  paymentBreakdown: { method: string; amount: number }[];
}

export interface ProfitReport {
  revenue: number;
  cogs: number;       // Cost of Goods Sold
  returns: number;
  grossProfit: number;
  margin: number;     // % da
}

// ─── Analytics ────────────────────────────────────────────────

export interface SalesTrend {
  period: string;
  revenue: number;
  orders: number;
}

export interface ABCItem {
  productId: string;
  productName: string;
  revenue: number;
  revenueShare: number;
  class: 'A' | 'B' | 'C';
}

export interface HourlyHeatmap {
  hour: number;
  weekday: number;
  orders: number;
}

// ─── Expenses ─────────────────────────────────────────────────

export type ExpenseCategory = 'RENT' | 'SALARY' | 'DELIVERY' | 'UTILITIES' | 'OTHER';

export interface Expense {
  id: string;
  amount: string;
  category: ExpenseCategory;
  description: string | null;
  date: string;
  createdAt: string;
}

// ─── Exchange Rate ────────────────────────────────────────────

export interface ExchangeRate {
  id: string;
  usdToUzs: string;  // Decimal
  date: string;
  source: string;
}

// ─── Branches ─────────────────────────────────────────────────

export interface Branch {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
}

// ─── Notifications ────────────────────────────────────────────

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Billing ──────────────────────────────────────────────────

export interface BillingPlan {
  id: string;
  slug: string;
  name: string;
  price: string;
  maxBranches: number;
  maxProducts: number;
  maxUsers: number;
}

export interface Subscription {
  id: string;
  planId: string;
  status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  plan: BillingPlan;
}
```

---

## API FUNCTIONS BY PAGE

### 📄 LOGIN PAGE

```typescript
// apps/web/src/api/auth.api.ts
import { apiClient } from './client';
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types/api';

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/auth/login', data).then(r => r.data),

  register: (data: RegisterRequest) =>
    apiClient.post('/auth/register', data).then(r => r.data),

  logout: () =>
    apiClient.post('/auth/logout').then(r => r.data),

  me: () =>
    apiClient.get<LoginResponse['user']>('/auth/me').then(r => r.data),

  refresh: () =>
    apiClient.post<{ accessToken: string }>('/auth/refresh').then(r => r.data),
};

// hooks/useAuth.ts
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.accessToken);
      queryClient.setQueryData(['me'], data.user);
    },
  });
}
```

---

### 📊 DASHBOARD PAGE

```typescript
// apps/web/src/api/reports.api.ts
import type { SalesSummary, DailyRevenueReport, TopProduct } from '../types/api';

export const reportsApi = {
  salesSummary: (from: string, to: string) =>
    apiClient.get<SalesSummary>('/reports/sales-summary', { params: { from, to } }).then(r => r.data),

  dailyRevenue: (from: string, to: string) =>
    apiClient.get<DailyRevenueReport[]>('/reports/daily-revenue', { params: { from, to } }).then(r => r.data),

  topProducts: (limit = 10) =>
    apiClient.get<TopProduct[]>('/reports/top-products', { params: { limit } }).then(r => r.data),

  profit: (from: string, to: string) =>
    apiClient.get('/reports/profit', { params: { from, to } }).then(r => r.data),
};

// analytics.api.ts
export const analyticsApi = {
  salesTrend: (period: 'daily' | 'weekly' | 'monthly', from: string, to: string) =>
    apiClient.get('/analytics/sales-trend', { params: { period, from, to } }).then(r => r.data),

  abcAnalysis: () =>
    apiClient.get('/analytics/abc').then(r => r.data),

  hourlyHeatmap: () =>
    apiClient.get('/analytics/hourly-heatmap').then(r => r.data),

  cashierPerformance: (from: string, to: string) =>
    apiClient.get('/analytics/cashier-performance', { params: { from, to } }).then(r => r.data),
};

// hooks/useDashboard.ts
export function useSalesSummary(from: string, to: string) {
  return useQuery({
    queryKey: ['sales-summary', from, to],
    queryFn: () => reportsApi.salesSummary(from, to),
    staleTime: 5 * 60_000, // 5 daqiqa
  });
}

export function useDailyRevenue(from: string, to: string) {
  return useQuery({
    queryKey: ['daily-revenue', from, to],
    queryFn: () => reportsApi.dailyRevenue(from, to),
  });
}
```

---

### 🛒 CATALOG PAGE (Mahsulotlar)

```typescript
// apps/web/src/api/catalog.api.ts
import type { Product, Category, Unit, Supplier, PaginatedResponse, ProductsFilter } from '../types/api';

export const catalogApi = {
  // Products
  getProducts: (filter: ProductsFilter) =>
    apiClient.get<PaginatedResponse<Product>>('/catalog/products', { params: filter }).then(r => r.data),

  getProduct: (id: string) =>
    apiClient.get<Product>(`/catalog/products/${id}`).then(r => r.data),

  getProductByBarcode: (code: string) =>
    apiClient.get<Product>(`/catalog/products/barcode/${code}`).then(r => r.data),

  createProduct: (data: CreateProductRequest) =>
    apiClient.post<Product>('/catalog/products', data).then(r => r.data),

  updateProduct: (id: string, data: Partial<CreateProductRequest>) =>
    apiClient.patch<Product>(`/catalog/products/${id}`, data).then(r => r.data),

  deleteProduct: (id: string) =>
    apiClient.delete(`/catalog/products/${id}`).then(r => r.data),

  // Categories
  getCategories: () =>
    apiClient.get<Category[]>('/catalog/categories').then(r => r.data),

  createCategory: (data: { name: string; parentId?: string }) =>
    apiClient.post<Category>('/catalog/categories', data).then(r => r.data),

  // Units
  getUnits: () =>
    apiClient.get<Unit[]>('/catalog/units').then(r => r.data),

  // Suppliers
  getSuppliers: () =>
    apiClient.get<Supplier[]>('/catalog/suppliers').then(r => r.data),

  // Resolve price for POS (customer group + quantity)
  resolvePrice: (productId: string, qty: number, customerId?: string) =>
    apiClient.get(`/catalog/products/${productId}/prices/resolve`, {
      params: { qty, customerId },
    }).then(r => r.data),
};

// hooks/useCatalog.ts
export function useProducts(filter: ProductsFilter) {
  return useQuery({
    queryKey: ['products', filter],
    queryFn: () => catalogApi.getProducts(filter),
    placeholderData: keepPreviousData,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: catalogApi.createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}
```

---

### 📦 INVENTORY PAGE (Ombor)

```typescript
// apps/web/src/api/inventory.api.ts
import type { Warehouse, StockLevel, StockMovementRequest, StockTransfer } from '../types/api';

export const inventoryApi = {
  getWarehouses: () =>
    apiClient.get<Warehouse[]>('/inventory/warehouses').then(r => r.data),

  getStockLevels: (params?: { warehouseId?: string; lowStock?: boolean; search?: string }) =>
    apiClient.get<StockLevel[]>('/inventory/levels', { params }).then(r => r.data),

  addMovement: (data: StockMovementRequest) =>
    apiClient.post('/inventory/movements', data).then(r => r.data),

  getMovements: (params: { productId?: string; type?: string; from?: string; to?: string; page?: number }) =>
    apiClient.get('/inventory/movements', { params }).then(r => r.data),

  getExpiring: (days = 30) =>
    apiClient.get('/inventory/expiring', { params: { days } }).then(r => r.data),

  getExpired: () =>
    apiClient.get('/inventory/expired').then(r => r.data),

  // Transfer
  createTransfer: (data: { fromWarehouseId: string; toWarehouseId: string; items: { productId: string; quantity: number }[] }) =>
    apiClient.post<StockTransfer>('/inventory/transfers', data).then(r => r.data),

  approveTransfer: (id: string) =>
    apiClient.patch(`/inventory/transfers/${id}/approve`).then(r => r.data),

  receiveTransfer: (id: string) =>
    apiClient.patch(`/inventory/transfers/${id}/receive`).then(r => r.data),
};

// hooks/useInventory.ts
export function useStockLevels(params?: { lowStock?: boolean }) {
  return useQuery({
    queryKey: ['stock-levels', params],
    queryFn: () => inventoryApi.getStockLevels(params),
    refetchInterval: 60_000, // har daqiqa yangilansin
  });
}
```

---

### 💰 SALES / ORDERS PAGE

```typescript
// apps/web/src/api/sales.api.ts
import type { Order, Shift, CreateOrderRequest } from '../types/api';

export const salesApi = {
  // Shifts
  openShift: (data: { branchId?: string; openingCash: number }) =>
    apiClient.post<Shift>('/sales/shifts/open', data).then(r => r.data),

  closeShift: (id: string, data: { closingCash: number; note?: string }) =>
    apiClient.post<Shift>(`/sales/shifts/${id}/close`, data).then(r => r.data),

  currentShift: () =>
    apiClient.get<Shift | null>('/sales/shifts/current').then(r => r.data),

  getShifts: (params?: { page?: number; limit?: number }) =>
    apiClient.get('/sales/shifts', { params }).then(r => r.data),

  // Orders
  createOrder: (data: CreateOrderRequest) =>
    apiClient.post<Order>('/sales/orders', data).then(r => r.data),

  getOrders: (params?: { from?: string; to?: string; status?: string; page?: number; limit?: number }) =>
    apiClient.get('/sales/orders', { params }).then(r => r.data),

  getOrder: (id: string) =>
    apiClient.get<Order>(`/sales/orders/${id}`).then(r => r.data),

  getReceipt: (id: string) =>
    apiClient.get(`/sales/orders/${id}/receipt`).then(r => r.data),

  // Returns
  createReturn: (data: { orderId: string; items: { orderItemId: string; quantity: number }[]; reason: string }) =>
    apiClient.post('/sales/returns', data).then(r => r.data),

  approveReturn: (id: string) =>
    apiClient.patch(`/sales/returns/${id}/approve`).then(r => r.data),
};

// Promotions
export const promotionsApi = {
  applyToCart: (items: { productId: string; quantity: number; unitPrice: number }[]) =>
    apiClient.post('/promotions/apply', { items }).then(r => r.data),

  getAll: () =>
    apiClient.get('/promotions').then(r => r.data),
};
```

---

### 👤 CUSTOMERS + NASIYA PAGE

```typescript
// apps/web/src/api/customers.api.ts
import type { Customer, CustomerStats } from '../types/api';

export const customersApi = {
  getAll: (params?: { search?: string; page?: number; limit?: number }) =>
    apiClient.get('/customers', { params }).then(r => r.data),

  getById: (id: string) =>
    apiClient.get<Customer>(`/customers/${id}`).then(r => r.data),

  getStats: (id: string) =>
    apiClient.get<CustomerStats>(`/customers/${id}/stats`).then(r => r.data),

  create: (data: { name: string; phone?: string; email?: string; address?: string }) =>
    apiClient.post<Customer>('/customers', data).then(r => r.data),

  update: (id: string, data: Partial<Customer>) =>
    apiClient.patch<Customer>(`/customers/${id}`, data).then(r => r.data),
};

// apps/web/src/api/nasiya.api.ts
import type { DebtRecord, CreateDebtRequest, DebtPaymentRequest } from '../types/api';

export const nasiyaApi = {
  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    apiClient.get('/nasiya', { params }).then(r => r.data),

  getOverdue: () =>
    apiClient.get<DebtRecord[]>('/nasiya/overdue').then(r => r.data),

  getById: (id: string) =>
    apiClient.get<DebtRecord>(`/nasiya/${id}`).then(r => r.data),

  // ⚠️ totalAmount ishlatiladi (amount EMAS!)
  create: (data: CreateDebtRequest) =>
    apiClient.post<DebtRecord>('/nasiya', data).then(r => r.data),

  pay: (id: string, data: DebtPaymentRequest) =>
    apiClient.post(`/nasiya/${id}/pay`, data).then(r => r.data),

  getCustomerSummary: (customerId: string) =>
    apiClient.get(`/nasiya/customer/${customerId}/summary`).then(r => r.data),
};
```

---

### ⚙️ SETTINGS PAGE (Users, Branches, Billing)

```typescript
// apps/web/src/api/settings.api.ts

export const usersApi = {
  getAll: () => apiClient.get('/users').then(r => r.data),
  create: (data: CreateUserRequest) => apiClient.post('/users', data).then(r => r.data),
  update: (id: string, data: Partial<CreateUserRequest>) => apiClient.patch(`/users/${id}`, data).then(r => r.data),
  deactivate: (id: string) => apiClient.delete(`/users/${id}`).then(r => r.data),
  unlock: (id: string) => apiClient.post(`/users/${id}/unlock`).then(r => r.data),
};

export const branchesApi = {
  getAll: () => apiClient.get('/branches').then(r => r.data),
  getById: (id: string) => apiClient.get(`/branches/${id}`).then(r => r.data),
  getStats: (id: string) => apiClient.get(`/branches/${id}/stats`).then(r => r.data),
  create: (data: { name: string; address?: string; phone?: string }) =>
    apiClient.post('/branches', data).then(r => r.data),
  update: (id: string, data: Partial<Branch>) => apiClient.patch(`/branches/${id}`, data).then(r => r.data),
};

export const billingApi = {
  getPlans: () => apiClient.get('/billing/plans').then(r => r.data),
  getSubscription: () => apiClient.get('/billing/subscription').then(r => r.data),
  getLimits: () => apiClient.get('/billing/limits').then(r => r.data),
  getUsage: () => apiClient.get('/billing/usage').then(r => r.data),
  startTrial: () => apiClient.post('/billing/trial').then(r => r.data),
  upgrade: (planSlug: string) => apiClient.post('/billing/upgrade', { planSlug }).then(r => r.data),
};

// Telegram notification link
export const notificationsApi = {
  createTelegramLinkToken: () =>
    apiClient.post('/notifications/telegram/link-token').then(r => r.data),

  getAll: (page = 1) =>
    apiClient.get('/notifications', { params: { page } }).then(r => r.data),

  markAllRead: () =>
    apiClient.patch('/notifications/read-all').then(r => r.data),

  getUnreadCount: () =>
    apiClient.get<{ count: number }>('/notifications/unread-count').then(r => r.data),
};
```

---

### 💵 FINANCE PAGE (Xarajatlar)

```typescript
// apps/web/src/api/finance.api.ts
import type { Expense, ExpenseCategory } from '../types/api';

export const financeApi = {
  getExpenses: (params?: { from?: string; to?: string; category?: ExpenseCategory }) =>
    apiClient.get<Expense[]>('/expenses', { params }).then(r => r.data),

  getSummary: (params?: { from?: string; to?: string }) =>
    apiClient.get('/expenses/summary', { params }).then(r => r.data),

  create: (data: { amount: number; category: ExpenseCategory; description?: string; date?: string }) =>
    apiClient.post<Expense>('/expenses', data).then(r => r.data),

  delete: (id: string) =>
    apiClient.delete(`/expenses/${id}`).then(r => r.data),

  getExchangeRate: () =>
    apiClient.get('/exchange-rate/latest').then(r => r.data),
};
```

---

### 📤 EXPORT (Excel / CSV)

```typescript
// apps/web/src/api/export.api.ts
// ⚠️ Bu endpoint lar file download qaytaradi — blob sifatida olish kerak

export const exportApi = {
  sales: (params: { from: string; to: string; format?: 'csv' | 'excel' }) =>
    apiClient.get('/reports/export/sales', { params, responseType: 'blob' }).then(r => r.data),

  products: () =>
    apiClient.get('/reports/export/products', { responseType: 'blob' }).then(r => r.data),

  inventory: () =>
    apiClient.get('/reports/export/inventory', { responseType: 'blob' }).then(r => r.data),

  customers: () =>
    apiClient.get('/reports/export/customers', { responseType: 'blob' }).then(r => r.data),

  debts: () =>
    apiClient.get('/reports/export/debts', { responseType: 'blob' }).then(r => r.data),
};

// Foydalanish namunasi:
async function downloadSalesReport(from: string, to: string) {
  const blob = await exportApi.sales({ from, to, format: 'excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sales-${from}-${to}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## ERROR HANDLING

```typescript
// apps/web/src/utils/api-error.ts
import type { ApiError } from '../types/api';
import { AxiosError } from 'axios';

export function getApiErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiError;
    if (Array.isArray(data?.message)) return data.message.join(', ');
    return data?.message ?? err.message;
  }
  return 'Xatolik yuz berdi';
}

// React Query global error handler
// apps/web/src/providers/QueryProvider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries:   { retry: 1, staleTime: 30_000 },
    mutations: {
      onError: (err) => toast.error(getApiErrorMessage(err)),
    },
  },
});
```

---

## MUHIM ESLATMALAR (⚠️ TRAP LER)

```typescript
// 1. BigInt → string — hisob qilma, ko'rsat
const id = product.id;           // ✅ string sifatida ishlatish
const num = Number(product.id);  // ❌ BigInt ni Number ga o'tkazma

// 2. Decimal → number — arифметika uchun
const price = Number(product.sellPrice);      // ✅
const price = product.sellPrice * 1.2;        // ❌ string * number

// 3. Nasiya yaratishda field nomi
{ totalAmount: 50000 }  // ✅
{ amount: 50000 }       // ❌ backend 400 qaytaradi

// 4. Login da slug MAJBURIY
{ email, password, slug }  // ✅
{ email, password }        // ❌ 400 Bad Request

// 5. Payment confirm/settle — PATCH (POST emas)
PATCH /payments/:id/confirm   // ✅
POST  /payments/:id/confirm   // ❌ 404

// 6. Stock levels endpoint
GET /inventory/levels           // ✅
GET /inventory/stock-levels     // ❌ 404

// 7. Barcode endpoint
GET /catalog/products/barcode/:code   // ✅
GET /catalog/barcode/:code            // ❌ 404

// 8. Audit logs
GET /audit-logs    // ✅
GET /audit         // ❌ 404

// 9. Exchange rate
GET /exchange-rate/latest    // ✅
GET /exchange-rates/latest   // ❌ 404

// 10. Nasiya customer summary
GET /nasiya/customer/:id/summary   // ✅
GET /nasiya/summary                // ❌ 404
```

---

## SWAGGER (to'liq interaktiv dokumentatsiya)

```
Local:      http://localhost:3003/api/v1/docs
Production: https://api-production-c5b6.up.railway.app/api/v1/docs
```

Swagger da "Authorize" tugmasini bosib token kiritish kerak.

---

_docs/API_FOR_WEB.md | RAOS | 2026-03-10_
