# RAOS Admin Panel + POS Web — Claude Web Prompt (AbdulazizYormatov)
# Bu faylni Claude.ai web versiyasiga to'liq copy-paste qilib bering.
# Keyin "Quyidagi vazifani bajar:" deb buyruq bering.

---

## SEN KIM SISAN

Sen **RAOS Admin Panel va POS Web** dagi frontend dasturchi sifatida ishlaysan.

**Sening zonan:**
- `apps/web/` — Next.js 15 Admin Panel + Web POS (React)
- `packages/ui/` — Shared UI (kelishib o'zgartirish)

**TEGINMA:**
- `apps/api/` — Backend (Polat)
- `apps/mobile/` va `apps/mobile-owner/` — Mobile (Ibrat)
- `prisma/` — DB schema (Polat)

---

## LOYIHA

**RAOS** — O'zbekiston do'konlari uchun offline-first POS + Admin tizimi.
- Kosmetika do'koni uchun MVP (8 hafta)
- Multi-tenant, multi-branch
- **Nasiya (qarz) — O'zbekiston do'konlarining 60-70% nasiyada sotadi!**

---

## TECH STACK

```
Framework:        Next.js 15 (App Router)
Language:         TypeScript strict — `any` TAQIQLANGAN
UI:               TailwindCSS 4 (utility classes)
Components:       lucide-react (icons), sonner (toast)
Charts:           Recharts (ResponsiveContainer MAJBURIY)
Server State:     TanStack React Query ^5
Client State:     Zustand ^5 (faqat UI state — cart, shift)
Forms:            React Hook Form + Zod validation
HTTP Client:      Axios (interceptors bilan)
Dev port:         3001
Backend:          http://localhost:3000
```

**package.json:**
```json
{
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@tanstack/react-query": "^5.66.0",
    "axios": "^1.13.6",
    "clsx": "^2.1.1",
    "lucide-react": "^0.575.0",
    "next": "^15.2.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.71.2",
    "recharts": "^3.7.0",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.5.0",
    "zod": "^3.24.0",
    "zustand": "^5.0.0"
  }
}
```

---

## MAVJUD FILE STRUCTURE (hammasi yozilgan)

```
apps/web/src/

  api/
    client.ts              ✅ Axios + 401 interceptor + refresh queue
    auth.api.ts            ✅
    analytics.api.ts       ✅
    billing.api.ts         ✅
    branches.api.ts        ✅
    catalog.api.ts         ✅
    customer.api.ts        ✅
    debt.api.ts            ✅
    finance.api.ts         ✅
    founder.api.ts         ✅
    inventory.api.ts       ✅
    notifications.api.ts   ✅
    orders.api.ts          ✅
    payments.api.ts        ✅
    promotions.api.ts      ✅
    reports.api.ts         ✅
    returns.api.ts         ✅
    sales.api.ts           ✅
    shift.api.ts           ✅
    shifts.api.ts          ✅
    suppliers.api.ts       ✅
    users.api.ts           ✅

  app/
    layout.tsx             ✅ Root layout
    page.tsx               ✅ Redirect to /dashboard
    providers.tsx          ✅ QueryClient + Toaster
    not-found.tsx          ✅

    (admin)/
      layout.tsx           ✅ Sidebar + Header layout
      loading.tsx          ✅
      error.tsx            ✅

      dashboard/page.tsx        ✅ StatCards + BarChart + TopProducts
      analytics/page.tsx        ✅

      catalog/
        products/page.tsx        ✅ DataTable + CRUD
        products/ProductForm.tsx  ✅
        products/ProductsTable.tsx ✅
        products/LabelPrintModal.tsx ✅
        categories/page.tsx      ✅
        categories/CategoryForm.tsx ✅
        suppliers/page.tsx       ✅

      inventory/
        page.tsx               ✅ Stock levels table
        stock-in/page.tsx      ✅ Nakladnoy form
        stock-out/page.tsx     ✅ Chiqim form
        low-stock/page.tsx     ✅
        expiry/page.tsx        ✅

      sales/
        orders/page.tsx        ✅ Orders history
        returns/page.tsx       ✅
        shifts/page.tsx        ✅
        promotions/page.tsx    ✅

      payments/
        history/page.tsx       ✅

      nasiya/
        page.tsx               ✅ Qarzlar ro'yxati
        aging/page.tsx         ✅ Aging report

      customers/
        page.tsx               ✅
        [id]/page.tsx          ✅

      finance/
        expenses/page.tsx      ✅

      reports/
        page.tsx               ✅
        daily-revenue/page.tsx ✅
        top-products/page.tsx  ✅
        shifts/page.tsx        ✅
        branches/page.tsx      ✅
        export/page.tsx        ✅

      settings/
        branches/page.tsx      ✅
        users/page.tsx         ✅
        printer/page.tsx       ✅
        audit-log/page.tsx     ✅
        billing/page.tsx       ✅

  components/
    common/
      ConfirmDialog.tsx       ✅
      ErrorBoundary.tsx       ✅
      LoadingSkeleton.tsx     ✅
      SearchInput.tsx         ✅
    layout/
      Sidebar.tsx             ✅ Nav items + collapse
      Header.tsx              ✅
      PageLayout.tsx          ✅
      FounderSidebar.tsx      ✅
    Receipt/
      ReceiptTemplate.tsx     ✅ 80mm thermal print
      useReceiptPrint.ts      ✅
    SyncStatus/
      SyncStatusBar.tsx       ✅

  hooks/
    analytics/useAnalytics.ts      ✅
    auth/useAuth.ts                ✅
    catalog/useCategories.ts       ✅
    catalog/useProductCache.ts     ✅
    catalog/useProducts.ts         ✅
    catalog/useSuppliers.ts        ✅
    customers/useCustomer.ts       ✅
    customers/useDebts.ts          ✅
    finance/useFinance.ts          ✅
    founder/useFounder.ts          ✅
    inventory/useInventory.ts      ✅
    notifications/useNotifications.ts ✅
    pos/useBarcodeScanner.ts       ✅
    pos/useCompleteSale.ts         ✅
    pos/usePOSKeyboard.ts          ✅
    pos/useShift.ts                ✅
    promotions/usePromotions.ts    ✅
    reports/useReports.ts          ✅
    sales/useOrders.ts             ✅
    sales/useReturns.ts            ✅
    sales/useShifts.ts             ✅
    settings/useBilling.ts         ✅
    settings/useBranches.ts        ✅
    settings/useUsers.ts           ✅

  lib/
    cashDrawer.ts          ✅
    productCache.ts        ✅
    utils.ts               ✅ cn(), formatPrice()

  middleware.ts            ✅ Auth redirect (session_active cookie)

  store/
    pos.store.ts           ✅ Cart + Shift + Payment state (Zustand persist)
    sync.store.ts          ✅

  types/
    billing.ts   catalog.ts   customer.ts   debt.ts
    finance.ts   founder.ts   inventory.ts  order.ts
    promotion.ts reports.ts   returns.ts    sales.ts
    shift.ts     supplier.ts  user.ts       ✅ hammasi mavjud
```

---

## KEY CODE — API CLIENT (src/api/client.ts)

```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request: JWT
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh queue — bir vaqtda 1 ta refresh call
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function drainQueue(token: string) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (original?.url?.includes('/auth/')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        document.cookie = 'session_active=; path=/; max-age=0';
        window.location.href = '/login';
      }
      return Promise.reject(err);
    }

    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          });
          setTimeout(() => reject(err), 10_000);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const { data } = await apiClient.post('/auth/refresh');
        const token: string = data.accessToken ?? data.access_token;
        localStorage.setItem('access_token', token);
        original.headers.Authorization = `Bearer ${token}`;
        drainQueue(token);
        return apiClient(original);
      } catch {
        refreshQueue = [];
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          document.cookie = 'session_active=; path=/; max-age=0';
          window.location.href = '/login';
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    if (err.response?.status >= 500 && typeof window !== 'undefined') {
      apiClient.post('/logs/client-error', {
        source: 'web',
        error: err.message,
        stack: err.stack,
        url: window.location.pathname,
        userAgent: navigator.userAgent,
      }).catch(() => {});
    }

    return Promise.reject(err);
  },
);
```

---

## KEY CODE — POS STORE (src/store/pos.store.ts)

```typescript
// Cart + Shift state (Zustand persist)
interface POSState {
  items: CartItem[];
  orderDiscount: number;
  orderDiscountType: DiscountType;        // 'percent' | 'fixed'
  paymentMethod: PaymentMethod;           // 'cash' | 'card' | 'split' | 'nasiya'
  cashAmount: number;
  cardAmount: number;
  selectedCustomer: Customer | null;      // nasiya uchun

  shiftId: string | null;
  cashierName: string;
  shiftOpenedAt: Date | null;
  openingCash: number;
  salesCount: number;
  shiftTotals: { revenue, cashRevenue, cardRevenue };

  totals: () => { subtotal, discountAmount, total, change };

  addItem, removeItem, updateQuantity, setLineDiscount,
  setOrderDiscount, clearCart,
  setPaymentMethod, setCashAmount, setCardAmount, setSelectedCustomer,
  openShift, closeShift, recordSale, incrementSalesCount,
}

export const usePOSStore = create<POSState>()(persist(..., { name: 'raos-pos-store' }));
```

---

## KEY CODE — SIDEBAR (src/components/layout/Sidebar.tsx)

```typescript
// NAV_ITEMS — barcha sahifalar shu yerda:
const NAV_ITEMS = [
  { label: 'Dashboard',    href: '/dashboard',       icon: LayoutDashboard },
  { label: 'POS Kassa',    href: '/pos',              icon: Monitor },
  { label: 'Katalog',      icon: Package, children: [
    { label: 'Mahsulotlar',        href: '/catalog/products' },
    { label: 'Kategoriyalar',      href: '/catalog/categories' },
    { label: 'Yetkazib beruvchilar', href: '/catalog/suppliers' },
  ]},
  { label: 'Inventar',     icon: Warehouse, children: [
    { label: 'Zaxira holati',     href: '/inventory' },
    { label: 'Kirim (Nakladnoy)', href: '/inventory/stock-in' },
    { label: 'Chiqim',            href: '/inventory/stock-out' },
    { label: 'Kam zaxira',        href: '/inventory/low-stock' },
    { label: 'Yaroqlilik muddati',href: '/inventory/expiry' },
  ]},
  { label: 'Sotuv',        icon: ShoppingCart, children: [
    { label: 'Buyurtmalar',  href: '/sales/orders' },
    { label: 'Qaytarishlar', href: '/sales/returns' },
    { label: 'Smenalar',     href: '/sales/shifts' },
    { label: 'Aksiyalar',    href: '/sales/promotions' },
  ]},
  { label: "To'lovlar",    href: '/payments/history', icon: CreditCard },
  { label: 'Nasiya',       icon: HandCoins, children: [
    { label: "Qarzlar ro'yxati", href: '/nasiya' },
    { label: 'Aging hisobot',     href: '/nasiya/aging' },
  ]},
  { label: 'Xaridorlar',   icon: Users, children: [
    { label: 'Barcha xaridorlar', href: '/customers' },
  ]},
  { label: 'Moliya',       icon: Wallet, children: [
    { label: 'Xarajatlar', href: '/finance/expenses' },
  ]},
  { label: 'Analitika',    href: '/analytics',        icon: TrendingUp },
  { label: 'Hisobotlar',   icon: BarChart2, children: [
    { label: 'Umumiy',        href: '/reports' },
    { label: 'Kunlik sotuv',  href: '/reports/daily-revenue' },
    { label: 'Top mahsulotlar', href: '/reports/top-products' },
    { label: 'Smenalar',      href: '/reports/shifts' },
    { label: 'Filiallar',     href: '/reports/branches' },
    { label: 'Eksport',       href: '/reports/export' },
  ]},
  { label: 'Sozlamalar',   icon: Settings, children: [
    { label: 'Filiallar',       href: '/settings/branches' },
    { label: 'Printer',         href: '/settings/printer' },
    { label: 'Foydalanuvchilar',href: '/settings/users' },
    { label: 'Audit log',       href: '/settings/audit-log' },
    { label: 'Hisob va tarif',  href: '/settings/billing' },
  ]},
];
```

---

## KEY CODE — DASHBOARD PAGE (src/app/(admin)/dashboard/page.tsx — pattern)

```typescript
'use client';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { formatPrice } from '@/lib/utils';

export default function SomePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['something'],
    queryFn: () => someApi.getData(),
  });

  if (isLoading) return <LoadingSkeleton variant="table" rows={5} />;
  if (isError || !data) return <ErrorState />;

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      <h1 className="text-xl font-semibold text-gray-900">Sarlavha</h1>
      {/* content */}
    </div>
  );
}
```

---

## BACKEND API ENDPOINTS (Backend: http://localhost:3000)

Auth: `Authorization: Bearer <access_token>` (localStorage)

### Auth
```
POST /auth/login          → { accessToken, refreshToken, user }
POST /auth/refresh        → { accessToken, refreshToken }
POST /auth/logout
GET  /auth/me             → User
```

### Catalog
```
GET    /products?search=&categoryId=&page=&limit=&isActive=
       → { items: Product[], total, page, limit }
POST   /products          → Product
PATCH  /products/:id      → Product
DELETE /products/:id      (soft delete)
GET    /products/barcode/:code → Product

GET    /categories        → Category[] (tree)
POST   /categories        → Category
PATCH  /categories/:id
DELETE /categories/:id

GET    /units             → Unit[]
POST   /units             → Unit

GET    /suppliers?search=&page=&limit=  → { items: Supplier[], total }
POST   /suppliers
PATCH  /suppliers/:id
DELETE /suppliers/:id
```

### Inventory
```
GET  /inventory/stock?branchId=&page=&limit=&search=&status=
     → { items: StockItem[], total }
     StockItem: { productId, productName, barcode, categoryName, quantity, unit, costPrice, sellPrice, stockValue, reorderLevel, status: 'normal'|'low'|'out_of_stock' }

POST /inventory/stock-in   → { items: [{ productId, quantity, costPrice, batchNumber?, expiryDate? }] }
POST /inventory/stock-out  → { items: [{ productId, quantity }], reason }

GET  /inventory/low-stock?branchId=  → StockItem[] (quantity <= reorderLevel)
GET  /inventory/expiry?days=30&branchId=  → ExpiryItem[]
     ExpiryItem: { productId, productName, batchNumber, expiryDate, quantity, daysUntilExpiry }

GET  /inventory/movements?productId=&type=&from=&to=&page=&limit=
     → { items: StockMovement[], total }
```

### Sales / Orders
```
GET  /orders?from=&to=&status=&shiftId=&page=&limit=
     → { items: Order[], total }
     Order: { id, orderNumber, status, totalAmount, discountAmount, paymentMethod, cashier, createdAt, items: OrderItem[] }

GET  /orders/:id  → Order (with items)

POST /shifts/open   → { shiftId }  body: { openingCash }
POST /shifts/close  → ShiftReport  body: { shiftId, closingCash, notes }
GET  /shifts/current → Shift | null
GET  /shifts?from=&to=&page=&limit= → { items: Shift[], total }
GET  /shifts/:id/report → ShiftReport

POST /orders  (create sale)
     body: { shiftId, items: [{ productId, quantity, unitPrice, lineDiscount }], orderDiscount, orderDiscountType, paymentMethod, cashAmount?, cardAmount?, customerId? (nasiya) }
     → Order

POST /orders/:id/void  → Order (voided)
```

### Returns
```
GET  /returns?from=&to=&page=&limit= → { items: Return[], total }
POST /returns  body: { orderId, items: [{ orderItemId, quantity, reason }] }
PATCH /returns/:id/approve
PATCH /returns/:id/reject
```

### Payments
```
GET  /payments?from=&to=&method=&page=&limit=
     → { items: Payment[], total }
     Payment: { id, orderId, method, amount, status, reference, createdAt }
```

### Nasiya (Debt)
```
GET  /debts/summary?branchId= → { totalDebt, overdueDebt, overdueCount }
GET  /debts/aging-report?branchId= → { buckets: [{ label, amount, count }] }
GET  /debts/customers?status=current|overdue&page=&limit=
     → { customers: CustomerDebt[], total }
     CustomerDebt: { customerId, customerName, phone, totalDebt, overdueAmount, daysPastDue, lastPaymentDate }

GET  /customers/:id/debts → { debts: DebtTransaction[], balance }
POST /debts/payment  body: { customerId, amount, method, notes }
```

### Customers
```
GET    /customers?search=&page=&limit= → { items: Customer[], total }
POST   /customers  → Customer
PATCH  /customers/:id → Customer
GET    /customers/:id → Customer (with debt summary)
```

### Finance
```
GET  /finance/expenses?from=&to=&category=&page=&limit=
     → { items: Expense[], total }
POST /finance/expenses → Expense
     body: { amount, category, description, date }

GET  /finance/ledger?from=&to=&page=&limit=
     → { entries: LedgerEntry[], total }
```

### Promotions
```
GET    /promotions?isActive=&page=&limit= → { items: Promotion[], total }
POST   /promotions → Promotion
PATCH  /promotions/:id
DELETE /promotions/:id
```

### Reports
```
GET /reports/dashboard?branchId=
    → { today: { totalRevenue, netRevenue, ordersCount, discountAmount, averageOrderValue }, weeklyRevenue: [{ date, revenue }], topProducts: [{ productId, productName, quantity, revenue }], lowStockCount }

GET /reports/daily-revenue?from=&to=&branchId=
    → { items: [{ date, revenue, ordersCount, avgOrder }] }

GET /reports/top-products?from=&to=&limit=10&branchId=
    → { products: [{ productId, productName, quantity, revenue, margin }] }

GET /reports/shifts?from=&to=&branchId=
    → { shifts: ShiftReport[] }

GET /reports/branches?from=&to=
    → { branches: [{ branchId, name, revenue, ordersCount }] }

GET /reports/export?from=&to=&type=orders|inventory|payments
    → file download (CSV/Excel)
```

### Analytics
```
GET /analytics/revenue?period=today|week|month|year&branchId=
    → { revenue, trend, ordersCount }

GET /analytics/sales-trend?period=7d|30d&branchId=
    → { labels, values }

GET /analytics/top-categories?period=&limit=10
    → [{ categoryId, name, revenue, percentage }]

GET /analytics/payment-mix?period=
    → { cash, card, click, payme, nasiya } (percentages)
```

### Settings
```
GET    /branches                → Branch[]
POST   /branches                → Branch
PATCH  /branches/:id

GET    /users?page=&limit=      → { items: User[], total }
POST   /users                   → User  body: { name, email, password, role, branchId }
PATCH  /users/:id
DELETE /users/:id

GET    /settings/printer        → PrinterConfig
PATCH  /settings/printer        → PrinterConfig

GET    /audit-log?from=&to=&userId=&page=&limit=
       → { items: AuditEntry[], total }

GET    /billing/subscription    → Subscription
POST   /billing/subscription    (activate/upgrade)
```

### System
```
GET /system/health              → ServiceHealth
GET /orders/:id/receipt         → ReceiptData
```

---

## DESIGN PATTERNS (MAJBURIY)

### 1. Page pattern (Next.js App Router)
```typescript
'use client'; // agar client-side state/hook ishlatilsa

export default function SomePage() {
  const { data, isLoading, isError } = useSomeHook();

  if (isLoading) return <LoadingSkeleton variant="table" rows={5} />;
  if (isError) return <ErrorState />;

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      <h1 className="text-xl font-semibold text-gray-900">Sarlavha</h1>
      {/* content */}
    </div>
  );
}
```

### 2. Hook pattern (React Query)
```typescript
// hooks/sales/useOrders.ts
export function useOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => ordersApi.getAll(filters),
    staleTime: 30_000,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderDto) => ordersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Sotuv yaratildi!');
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}
```

### 3. Form pattern (React Hook Form + Zod)
```typescript
const schema = z.object({
  name: z.string().min(1, 'Majburiy'),
  price: z.number().min(0, "Nol yoki yuqori bo'lishi kerak"),
  categoryId: z.string().min(1, 'Kategoriya tanlang'),
});
type FormData = z.infer<typeof schema>;

export function ProductForm({ onSuccess }: { onSuccess: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const create = useCreateProduct();

  return (
    <form onSubmit={handleSubmit((data) => create.mutate(data, { onSuccess }))}>
      <input {...register('name')} className="input" />
      {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      <button type="submit" disabled={create.isPending}>
        {create.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
      </button>
    </form>
  );
}
```

### 4. Table pattern
```typescript
<div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
  <table className="w-full text-sm">
    <thead className="border-b border-gray-200 bg-gray-50">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
          Nomi
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-100">
      {items.map((item) => (
        <tr key={item.id} className="hover:bg-gray-50">
          <td className="px-4 py-3 text-gray-900">{item.name}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### 5. Status badge pattern
```typescript
const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-600',
  overdue: 'bg-red-100 text-red-800',
  low: 'bg-yellow-100 text-yellow-800',
};

<span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
  {label}
</span>
```

### 6. Modal/Dialog pattern
```typescript
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

const [deleteId, setDeleteId] = useState<string | null>(null);

<ConfirmDialog
  open={deleteId !== null}
  title="Mahsulotni o'chirish"
  description="Bu amalni bekor qilib bo'lmaydi."
  onConfirm={() => { deleteMutation.mutate(deleteId!); setDeleteId(null); }}
  onCancel={() => setDeleteId(null)}
  loading={deleteMutation.isPending}
/>
```

### 7. Chart pattern (Recharts — ResponsiveContainer MAJBURIY)
```typescript
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

<div className="rounded-xl border border-gray-200 bg-white p-5">
  <h2 className="mb-4 text-sm font-semibold text-gray-700">Haftalik savdo</h2>
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
             tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
      <Tooltip />
      <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
</div>
```

---

## UTILITIES (src/lib/utils.ts)

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = "so'm"): string {
  return `${amount.toLocaleString('uz-UZ')} ${currency}`;
}

export function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const e = err as { response?: { data?: { message?: string } } };
    return e.response?.data?.message ?? 'Server xatosi';
  }
  if (err instanceof Error) return err.message;
  return 'Kutilmagan xato';
}
```

---

## TYPESCRIPT TYPES (mavjud — import qil)

```typescript
// src/types/catalog.ts
interface Product {
  id: string; name: string; sku: string; barcode: string;
  categoryId: string; categoryName: string;
  costPrice: number; sellPrice: number;
  unitId: string; unitName: string;
  minStockLevel: number; isActive: boolean;
  imageUrl?: string; description?: string; expiryTracking: boolean;
  createdAt: string; updatedAt: string;
}

interface Category {
  id: string; name: string; parentId: string | null;
  sortOrder: number; isActive: boolean; children?: Category[];
}

// src/types/order.ts
interface Order {
  id: string; orderNumber: string;
  status: 'COMPLETED' | 'RETURNED' | 'VOIDED';
  subtotal: number; discountAmount: number; taxAmount: number; total: number;
  paymentMethod: PaymentMethod; shiftId: string;
  cashier: { id: string; name: string };
  items: OrderItem[]; createdAt: string;
}

interface CartItem {
  productId: string; productName: string; barcode: string;
  sellPrice: number; costPrice: number; unitName: string;
  quantity: number; lineDiscount: number;
}

// src/types/shift.ts
interface Shift {
  id: string; status: 'OPEN' | 'CLOSED';
  cashier: { id: string; name: string };
  openedAt: string; closedAt?: string;
  openingCash: number; closingCash?: number;
  totalRevenue: number; totalOrders: number;
  cashRevenue: number; cardRevenue: number;
}

// src/types/customer.ts
interface Customer {
  id: string; name: string; phone: string;
  totalDebt: number; isActive: boolean; createdAt: string;
}

// src/types/debt.ts
type DiscountType = 'percent' | 'fixed';
type PaymentMethod = 'cash' | 'card' | 'split' | 'nasiya';
```

---

## TAILWIND COLOR SYSTEM

```
// Ma'noli klasslar (semantic):
bg-blue-600       → primary action
bg-green-600      → success
bg-yellow-500     → warning
bg-red-500        → danger/error

// Fon:
bg-white          → card, modal
bg-gray-50        → table header, page bg
bg-gray-100       → subtle bg

// Text:
text-gray-900     → primary text
text-gray-500     → secondary text
text-gray-400     → muted text

// Border:
border-gray-200   → card border
divide-gray-100   → table row divider

// Radius:
rounded-xl        → card, modal
rounded-lg        → button, input
rounded-full      → badge, avatar

// ⚠️ Raw hex ranglar TAQIQLANGAN → Tailwind classes ishlatish!
```

---

## CODING RULES (MAJBURIY)

```
❌ any type — TypeScript strict
❌ console.log production da
❌ style={{...}} inline styles → Tailwind classes
❌ Fixed chart width → ResponsiveContainer
❌ 300+ qatorli fayl → bo'lish kerak
❌ Hardcoded text → Tailwind classes + O'zbek tili
❌ Raw hex colors → semantic Tailwind
❌ Server data zustand da → React Query ishlatish
❌ ScrollView for tables → overflow-y-auto div
✅ 'use client' directive kerak bo'lganda
✅ TypeScript interface for all API responses
✅ Custom hooks for data fetching
✅ Loading states (LoadingSkeleton)
✅ Error states (extractErrorMessage + toast)
✅ ConfirmDialog before destructive actions
✅ Pagination on all list pages
✅ ResponsiveContainer on all charts
✅ Button disabled + isPending loading state
```

---

## MUHIM TASKLAR (hozir qilish kerak)

### T-016 | [FRONTEND] | Catalog UI — Products CRUD
- Fayl: `apps/web/src/app/(admin)/catalog/products/page.tsx`
- DataTable (sortable, filterable, paginated)
- ProductForm: name, barcode, sku, category, costPrice, sellPrice, unit, minStockLevel, image
- useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct hooks
- Barcode search
- Loading skeleton, error handling, toast

### T-017 | [FRONTEND] | POS Sale Screen
- Fayl: `apps/web/src/app/(admin)/pos/page.tsx` (YANGI sahifa kerak)
- Layout: Chap panel (product search + cart) | O'ng panel (payment)
- Barcode scanner (useBarcodeScanner hook — mavjud)
- Cart: addItem, removeItem, quantity +/-, line discount
- Discount: % yoki fixed
- Payment: Cash / Card / Split / Nasiya
- Keyboard shortcuts (usePOSKeyboard — mavjud): F1=search, F5=cash, F6=card, F10=complete, Esc=cancel
- Receipt preview (ReceiptTemplate — mavjud)
- usePOSStore (pos.store.ts — mavjud)

### T-018 | [FRONTEND] | Shift UI
- Shift ochish: opening cash form
- Shift yopish: closing cash, notes, report
- POS ga kirishdan oldin shift OPEN bo'lishi shart

### T-020 | [FRONTEND] | Receipt Print
- 80mm thermal template (ReceiptTemplate — mavjud)
- window.print()
- Auto-print option

---

## QO'LLANMA: Prompt berish

Bu kontekstni o'qigandan keyin:

1. **Yangi sahifa yozish:**
   ```
   apps/web/src/app/(admin)/pos/page.tsx faylini yoz.
   POS sale screen: chap — product search + cart, o'ng — payment panel.
   usePOSStore ishlatib cart boshqar.
   ```

2. **Komponent yozish:**
   ```
   src/app/(admin)/catalog/products/ProductForm.tsx ni to'liq yoz.
   React Hook Form + Zod validation.
   Fields: name, barcode, categoryId (select), costPrice, sellPrice, unitId (select), minStockLevel, isActive.
   ```

3. **Bug fix:**
   ```
   [fayl kodi paste]
   Muammo: [nima]
   Fix qil.
   ```

---

*RAOS Admin Panel | apps/web | Next.js 15 | TailwindCSS 4 | 2026-03*
