# CLAUDE_FRONTEND.md — RAOS Frontend Engineer Guide
# Next.js · Tauri · React 19 · TypeScript · Tailwind · React Query
# Claude CLI bu faylni AbdulazizYormatov tanlanganda o'qiydi

---

## 👋 ZONA

```
apps/web/src/                  → Admin Panel + POS (Next.js App Router)
  app/
    (admin)/                   → Admin Panel sahifalari
      dashboard/page.tsx
      catalog/products/        → ProductForm, ProductsTable, VariantsSection
      catalog/categories/
      catalog/suppliers/
      inventory/               → page, stock-in, stock-out, expiry, low-stock
      sales/orders/
      sales/returns/
      sales/shifts/
      finance/expenses/
      reports/                 → page, daily-revenue, top-products, branches, shifts
      customers/
      nasiya/                  → page, aging
      payments/history/
      settings/                → users, billing, printer, audit-log
      analytics/page.tsx
    (pos)/                     → POS Desktop (Web-based, offline-first)
      pos/
        page.tsx               → asosiy POS sahifa
        CartPanel.tsx
        PaymentPanel.tsx
        ProductSearch.tsx
        ReceiptPreview.tsx
        ShiftBar.tsx
        customer-display/      → Customer display window
        shift/                 → ShiftOpenModal, ShiftCloseModal, ShiftReport
    (founder)/                 → Owner Panel (founder ko'radi)
      founder/
        overview/
        tenants/               → list, [id], new
        analytics/
        errors/
    (auth)/                    → Login sahifalari
  components/
    layout/                    → Sidebar, Header, PageLayout, FounderSidebar
    common/                    → ConfirmDialog, SearchInput, LoadingSkeleton
    Receipt/                   → ReceiptTemplate, useReceiptPrint
    SyncStatus/                → SyncStatusBar
  hooks/
    catalog/                   → useProducts, useCategories, useSuppliers, useProductCache, useVariants
    customers/                 → useCustomer, useDebts, useLoyalty
    finance/                   → useFinance
    founder/                   → useFounder
    inventory/                 → useInventory
    pos/                       → useCompleteSale, useShift, useBarcodeScanner, usePOSKeyboard, useCustomerDisplayBroadcast
    reports/                   → useReports
    sales/                     → useOrders, useReturns, useShifts
    settings/                  → useUsers, useBilling
  api/                         → HTTP client va endpointlar
  store/                       → Zustand global state (pos.store, sync.store)
  types/                       → TypeScript type definitsiyalari
  lib/                         → cashDrawer, productCache, utils

packages/ui/            → Shared UI components
packages/types/         → Shared TypeScript types
```

**🚫 TEGINMA:**
- `apps/api/` — Polat zonasi (Backend)
- `apps/worker/` — Polat zonasi (Worker)
- `apps/bot/` — Polat zonasi (Bot)
- `apps/mobile/` — Ibrat + Abdulaziz zonasi (React Native Android + IOS)
- `prisma/` — Polat zonasi (Database)

---

## 🏗️ KOMPONENT ARXITEKTURASI

### 1. Fayl Tuzilishi — Max 400 Qator

```
// Admin Panel — murakkab page alohida papkada:
apps/web/src/app/(admin)/
  dashboard/page.tsx           // Dashboard stats + P&L
  catalog/products/
    page.tsx                   // asosiy list + CRUD trigger
    ProductForm.tsx            // create/edit form
    ProductsTable.tsx          // table component
    VariantsSection.tsx        // product variants CRUD
    LabelPrintModal.tsx        // barcode label print
  catalog/categories/
    page.tsx
    CategoryForm.tsx
  catalog/suppliers/page.tsx
  inventory/page.tsx
  sales/orders/page.tsx
  reports/page.tsx
  customers/page.tsx
  ...

// POS Desktop — web-based, keyboard-first:
apps/web/src/app/(pos)/pos/
  page.tsx                     // asosiy POS sahifa
  CartPanel.tsx
  PaymentPanel.tsx
  ProductSearch.tsx
  ReceiptPreview.tsx
  ShiftBar.tsx
  shift/
    ShiftOpenModal.tsx
    ShiftCloseModal.tsx
    ShiftReport.tsx
  customer-display/            // Customer display window

// Shared components:
apps/web/src/components/
  layout/
    Sidebar.tsx
    Header.tsx
    PageLayout.tsx
    FounderSidebar.tsx
  common/
    ConfirmDialog.tsx
    SearchInput.tsx
    LoadingSkeleton.tsx
  Receipt/
    ReceiptTemplate.tsx
    useReceiptPrint.ts
  SyncStatus/
    SyncStatusBar.tsx
```

### 2. `any` TAQIQLANGAN

```typescript
// ❌
function Card({ data }: { data: any }) { ... }

// ✅
interface ProductCardProps {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly stock: number;
  readonly trend: 'up' | 'down' | 'flat';
}
function ProductCard({ product }: { product: ProductCardProps }) { ... }
```

### 3. Custom Hook Pattern — Logika Hookda, Render Komponentda

```typescript
// hooks/useSales.ts
export function useSales(filters: SalesFilters) {
  return useQuery({
    queryKey: ['sales', filters],
    queryFn: () => salesApi.getAll(filters),
    staleTime: 30_000,
  });
}

// hooks/useCreateSale.ts
export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSaleDto) => salesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Sotuv muvaffaqiyatli yaratildi!');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });
}

// Page — faqat render:
export function SalesPage() {
  const [filters, setFilters] = useState<SalesFilters>(defaultFilters);
  const { data, isLoading, error } = useSales(filters);

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (error) return <ErrorAlert message={extractErrorMessage(error)} />;

  return (
    <PageLayout title="Sotuvlar">
      <SalesFilters value={filters} onChange={setFilters} />
      <SalesTable sales={data.items} />
      <Pagination meta={data.meta} onChange={p => setFilters(f => ({ ...f, page: p }))} />
    </PageLayout>
  );
}
```

### 4. Error Handling — Foydalanuvchi KO'RADI

```typescript
// ❌ Xato yutiladi
} catch (err) { console.error(err); }

// ✅ Toast yoki UI orqali
export function extractErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    return (err.response?.data?.message as string) ?? 'Server xatosi';
  }
  if (err instanceof Error) return err.message;
  return 'Kutilmagan xato yuz berdi';
}
```

### 5. Loading + Double-Click Prevention

```typescript
// React Query mutation bilan:
const { mutate, isPending } = useCreateSale();

<button
  onClick={() => mutate(saleData)}
  disabled={isPending || !isValid}
  className="btn btn-primary"
>
  {isPending ? <Spinner /> : <PlusIcon />}
  {isPending ? 'Saqlanmoqda...' : 'Sotuv yaratish'}
</button>
```

### 6. API Client Tuzilishi

```
apps/web/src/api/
  client.ts              → axios instance + interceptors
  billing.api.ts         → billingApi (subscription, plans)
  catalog.api.ts         → catalogApi (products, categories, variants)
  customer.api.ts        → customerApi (list, detail)
  debt.api.ts            → debtApi (nasiya, aging)
  finance.api.ts         → financeApi (expenses, ledger)
  founder.api.ts         → founderApi (tenants, overview)
  inventory.api.ts       → inventoryApi (stock, movements, transfers)
  loyalty.api.ts         → loyaltyApi (account, config, redeem)
  orders.api.ts          → ordersApi (create, list, detail)
  reports.api.ts         → reportsApi (dashboard, profit, top-products)
  returns.api.ts         → returnsApi (create, list)
  sales.api.ts           → salesApi (orders, returns, history)
  shift.api.ts           → shiftApi (open, close, current)
  shifts.api.ts          → shiftsApi (list, report)
  suppliers.api.ts       → suppliersApi (list, CRUD)
  users.api.ts           → usersApi (list, CRUD, roles)
```

### 7. Axios Interceptors (MAJBURIY)

```typescript
// Request: JWT token qo'shish
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: 401 → refresh, 402 → billing, 500 → error
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      try {
        const { data } = await api.post('/auth/refresh');
        localStorage.setItem('access_token', data.access_token);
        err.config.headers.Authorization = `Bearer ${data.access_token}`;
        return api(err.config);
      } catch {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }
    if (err.response?.status === 402) {
      window.dispatchEvent(new CustomEvent('billing:due', {
        detail: err.response.data,
      }));
    }
    return Promise.reject(err);
  },
);
```

---

## 🖥️ POS DESKTOP — OFFLINE-FIRST QOIDALARI

> ⚠️ POS `apps/web/src/app/(pos)/pos/` da joylashgan — alohida `apps/pos/` papkasi YO'Q.
> POS Next.js route group `(pos)` ichida ishlaydi, zustand + React Query bilan.

### POS Arxitekturasi

```typescript
// POS da Zustand store (apps/web/src/store/pos.store.ts):
// - cart items, selected customer, payment state
// Sync state (apps/web/src/store/sync.store.ts):
// - offline queue, sync status

// Sale yaratish (apps/web/src/hooks/pos/useCompleteSale.ts):
export function useCompleteSale() {
  // 1. POST /sales/orders (online)
  // 2. Offline: sync queue ga qo'sh (outbox pattern)
  // 3. Receipt print trigger
}

// hooks/useLocalSale.ts (ESKI PATTERN — endi ishlatilmaydi)
export function useLocalSale() {
  const db = useLocalDB();

  const createSale = useCallback(async (sale: LocalSaleDto) => {
    // 1. SQLite ga yozish
    const saleId = await db.sales.create(sale);

    // 2. Outbox ga qo'shish (sync uchun)
    await db.outbox.append({
      type: 'SALE_CREATED',
      payload: { ...sale, id: saleId },
      idempotency_key: generateIdempotencyKey(),
      created_at: new Date().toISOString(),
    });

    // 3. Local stock deduction
    for (const item of sale.items) {
      await db.stock.deduct(item.product_id, item.quantity);
    }

    return saleId;
  }, [db]);

  return { createSale };
}
```

### Offline Indicator (MAJBURIY)

```typescript
// POS da DOIM ko'rinadi:
export function SyncIndicator() {
  const { isOnline, pendingCount, lastSyncAt } = useSyncStatus();

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-1 rounded-full text-sm',
      isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
    )}>
      <div className={cn(
        'w-2 h-2 rounded-full',
        isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500',
      )} />
      {isOnline ? 'Online' : 'Offline'}
      {pendingCount > 0 && (
        <span className="ml-1 font-medium">({pendingCount} pending)</span>
      )}
    </div>
  );
}
```

### Keyboard-First UX (POS)

```typescript
// POS da keyboard shortcutlar MAJBURIY:
const POS_SHORTCUTS = {
  'F1': 'Barcode search focus',
  'F2': 'Manual product search',
  'F5': 'Cash payment',
  'F6': 'Card payment',
  'F7': 'Split payment',
  'F8': 'Print receipt',
  'F10': 'Complete sale',
  'Escape': 'Cancel / Close modal',
  'Delete': 'Remove item from cart',
  '+': 'Increase quantity',
  '-': 'Decrease quantity',
} as const;

// Barcode scanner integration:
export function useBarcodeScanner(onScan: (barcode: string) => void) {
  // Detect rapid keypress pattern (barcode scanners type fast)
  // Buffer characters → emit on Enter or timeout
}
```

### Local Print (Receipt)

```typescript
// Tauri orqali printer ga yuborish:
export async function printReceipt(sale: LocalSale) {
  const receiptHtml = generateReceiptHtml(sale);
  await invoke('print_receipt', { html: receiptHtml });
}
```

---

## 🎨 DESIGN SYSTEM

### Admin Panel

```
1. TailwindCSS utility classes
2. Consistent spacing: 4, 8, 12, 16, 24, 32, 48
3. Color palette: semantic tokens (primary, success, error, warning)
4. Dark/Light theme support
5. Responsive: mobile-first (base → sm: → md: → lg: → xl:)
6. DataTable: sortable, filterable, paginated
7. Charts: Recharts with ResponsiveContainer
```

### POS Desktop

```
1. Large touch-friendly buttons (min 48x48px)
2. High contrast colors (read in bright environments)
3. Minimal navigation (everything on 1-2 screens)
4. Cart always visible (right panel)
5. Numeric keypad for quantity/price
6. Status bar: shift info + sync status + time
```

### Shared Rules

```
1. Raw hex ranglar TAQIQLANGAN → semantic tokens
2. Custom SVG iconlar (external CDN emas)
3. Accessibility: aria-label, role, keyboard nav
4. I18n: barcha UI text tarjima kaliti orqali (uz, ru, en)
5. Responsive images: lazy loading + proper sizing
6. Form validation: zod schemas + inline errors
```

---

## 🔐 ROLE-BASED UI

```typescript
// Route guard:
const ROUTE_PERMISSIONS: Record<string, Role[]> = {
  '/dashboard': ['ADMIN', 'MANAGER', 'VIEWER'],
  '/sales': ['ADMIN', 'MANAGER', 'CASHIER'],
  '/inventory': ['ADMIN', 'MANAGER'],
  '/finance': ['ADMIN'],
  '/settings': ['ADMIN'],
  '/realestate': ['ADMIN', 'MANAGER'],
  '/ai-insights': ['ADMIN', 'MANAGER'],
};

// Component-level:
export function ConditionalRender({ roles, children }: {
  roles: Role[];
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  if (!roles.includes(user.role)) return null;
  return <>{children}</>;
}
```

---

## 📊 ADMIN PANEL PAGES (haqiqiy implemented routes)

```
/                   → redirect by role (ADMIN → /dashboard, CASHIER → /pos)
/dashboard          → Overview stats, P&L breakdown, top products
/catalog
  /products         → Product list + CRUD + variants + label print
  /categories       → Category management
  /suppliers        → Supplier management
/inventory
  /                 → Current stock levels
  /stock-in         → Stock received (purchase)
  /stock-out        → Manual stock deduction
  /expiry           → Expiry date tracking
  /low-stock        → Low stock alerts
/sales
  /orders           → Sales history + details
  /returns          → Return management
  /shifts           → Shift history
/payments
  /history          → Payment history
/finance
  /expenses         → Expense tracking
/reports
  /                 → Reports overview
  /daily-revenue    → Daily revenue chart
  /top-products     → Best selling products
  /branches         → Branch comparison
  /shifts           → Shift reports
/customers
  /                 → Customer list
  /[id]             → Customer detail + debt history + loyalty
/nasiya
  /                 → Active debts (nasiya)
  /aging            → Debt aging report
/analytics          → AI analytics page
/settings
  /users            → User management + roles
  /billing          → Subscription management
  /printer          → Receipt printer settings
  /audit-log        → Audit trail

/pos                → POS screen (route group (pos))
  /shift            → Shift open/close modals

/founder            → Owner monitoring panel (CLAUDE_FRONTEND_OWNER.md)
  /overview         → Revenue cards + branch comparison
  /analytics        → Revenue/Orders analytics + period filter
  /tenants          → Tenant list + [id] detail + new
  /errors           → System error logs
```

---

## 🔄 STATE MANAGEMENT

```typescript
// Server state: React Query (TanStack Query)
// Client state: Zustand (minimal)
// Form state: React Hook Form + Zod

// Zustand example (global UI state only):
interface AppStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  selectedBranch: string | null;
  setSelectedBranch: (id: string) => void;
}

const useAppStore = create<AppStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  selectedBranch: null,
  setSelectedBranch: (id) => set({ selectedBranch: id }),
}));

// ⚠️ Server data FAQAT React Query orqali — zustand da cache qilma!
```

---

## 🌍 I18N

```typescript
// Supported languages: uz, ru, en
// Translation files:
// i18n/uz.json, i18n/ru.json, i18n/en.json

// Usage:
const { t } = useTranslation();
<h1>{t('dashboard.title')}</h1>
<button>{t('common.save')}</button>

// ⚠️ Hardcoded text TAQIQLANGAN — HAMMA text tarjima orqali!
```

---

## 📝 LOGGING (Client Error Reporting)

### Qoidalar

```
1. Production da console.log TAQIQLANGAN
2. Development da: if (process.env.NODE_ENV === 'development') console.log(...)
3. Error Boundary component MAJBURIY — render errorlarni ushlaydi
4. API interceptor 5xx errorlarni avtomatik POST /api/v1/logs/client-error ga yuboradi
5. window.onerror va window.onunhandledrejection handle qilinishi SHART
```

### Error reporting endpoint

```typescript
// POST /api/v1/logs/client-error (public, auth kerak emas)
interface ClientErrorPayload {
  source: 'web' | 'mobile' | 'pos';
  error: string;        // error message
  stack?: string;       // stack trace
  url?: string;         // sahifa URL
  userAgent?: string;   // browser info
  tenantId?: string;    // agar mavjud
  userId?: string;      // agar mavjud
}

// Axios interceptor da:
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status >= 500) {
      reportClientError({
        source: 'web',
        error: err.message,
        stack: err.stack,
        url: window.location.pathname,
        userAgent: navigator.userAgent,
      });
    }
    return Promise.reject(err);
  },
);
```

---

## 🚫 TAQIQLANGAN

```
❌ apps/api/ papkasiga TEGINMA (Polat zonasi)
❌ apps/worker/ papkasiga TEGINMA (Polat zonasi)
❌ apps/bot/ papkasiga TEGINMA (Polat zonasi)
❌ apps/mobile/ papkasiga TEGINMA (Ibrat + Abdulaziz zonasi)
❌ prisma/ papkasiga TEGINMA (Polat zonasi)
❌ any type
❌ console.log production da
❌ inline style (style={{...}}) → Tailwind class
❌ 400+ qatorli komponent → bo'lish kerak
❌ Fixed width charts → ResponsiveContainer
❌ localStorage to'g'ridan → useLocalStorage hook
❌ Hardcoded text → i18n translation keys
❌ Raw hex colors → semantic tokens
❌ External CDN imports → local assets
❌ Server state zustand da → React Query
```

---

*CLAUDE_FRONTEND.md | RAOS | v1.1*