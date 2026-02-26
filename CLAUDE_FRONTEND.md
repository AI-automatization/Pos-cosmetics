# CLAUDE_FRONTEND.md — Frontend Engineer Guide
# React 19 · TypeScript · Tailwind · [UI Library]
# Claude CLI bu faylni Frontend dasturchi tanlanganda o'qiydi

---

## 👋 ZONA

```
apps/web/src/
  pages/          → Sahifalar (route = 1 page)
  components/     → Qayta ishlatiluvchi komponentlar
  hooks/          → Custom React hooks
  api/            → HTTP client va endpoint lar
  i18n/           → Tarjimalar
  utils/          → Yordamchi funksiyalar
  config/         → Konfiguratsiya
```

**🚫 TEGINMA:** `apps/api/`, `apps/worker/`, `apps/bot/` — bu Backend zonasi.

---

## 🏗️ KOMPONENT ARXITEKTURASI

### 1. Fayl Tuzilishi — Max 300 Qator

```
// Murakkab page alohida papkada:
pages/
  SomePage/
    index.tsx              // asosiy page export
    SomeCard.tsx           // faqat shu page da → ichida
    useSomeData.ts         // page-specific hook → ichida
components/
  some/
    SomeBadge.tsx          // ko'p joyda → components ga
hooks/
  useDebounce.ts           // global hook lar
  useAuth.ts
```

### 2. `any` TAQIQLANGAN

```typescript
// ❌
function Card({ data }: { data: any }) { ... }

// ✅
interface ProductCard {
  readonly id: string;
  readonly title: string;
  readonly price: number;
  readonly trend: 'up' | 'down' | 'flat';
}
function Card({ product }: { product: ProductCard }) { ... }
```

### 3. Custom Hook Pattern — Logika Hookda, Render Komponentda

```typescript
// hooks/useProducts.ts
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await productsApi.getAll();
      setProducts(data);
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { products, loading, error, reload: load };
}

// Page — faqat render:
export function ProductsPage() {
  const { products, loading, error, reload } = useProducts();
  if (loading) return <SkeletonTable />;
  if (error) return <ErrorAlert message={error} onRetry={reload} />;
  return <ProductsList products={products} />;
}
```

### 4. Error Handling — Foydalanuvchi KO'RADI

```typescript
// ❌ Xato yutiladi
} catch (err) { console.error(err); }

// ✅ Toast yoki UI orqali
} catch (err: unknown) {
  const message = err instanceof AxiosError
    ? (err.response?.data?.message as string) ?? 'Server xatosi'
    : 'Kutilmagan xato';
  setError(message);
  toast.error(message);
}
```

### 5. Loading + Double-Click Prevention

```typescript
const [submitting, setSubmitting] = useState(false);

async function handleSubmit() {
  if (submitting) return;
  setSubmitting(true);
  setError(null);
  try {
    await api.create(data);
    toast.success('Muvaffaqiyatli!');
  } catch (err: unknown) {
    setError(extractErrorMessage(err));
  } finally {
    setSubmitting(false);
  }
}

<button onClick={handleSubmit} disabled={submitting || !isValid} className="btn btn-primary">
  {submitting ? <Spinner /> : <PlusIcon />}
  {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
</button>
```

### 6. API Client Tuzilishi

```
// Bo'lingan fayllar — bitta 500+ qatorli client.ts EMAS:
api/
  client.ts          → axios instance + interceptors
  auth.api.ts        → authApi
  products.api.ts    → productsApi
  admin.api.ts       → adminApi
  index.ts           → re-export
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

### 8. Polling Pattern (Universal)

```typescript
export function usePolling<T>(
  fetchFn: () => Promise<T>,
  shouldContinue: (data: T) => boolean,
  intervalMs = 3000,
) {
  const [data, setData] = useState<T | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(async () => {
    setIsPolling(true);
    const check = async () => {
      const result = await fetchFn();
      setData(result);
      if (!shouldContinue(result)) stop();
    };
    await check();
    intervalRef.current = setInterval(check, intervalMs);
  }, [fetchFn, shouldContinue, intervalMs]);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsPolling(false);
  }, []);

  useEffect(() => () => stop(), [stop]);
  return { data, isPolling, start, stop };
}
```

---

## 🎨 DESIGN SYSTEM

```
1. UI library komponent classlarini ishlatish (btn, card, table, badge, etc.)
2. Raw hex ranglar TAQIQLANGAN → semantic tokenlar (primary, success, error)
3. Responsive: mobile-first (base → sm: → md: → lg:)
4. Dark/Light theme: semantic tokens orqali avtomatik
5. Custom SVG iconlar (external CDN emas)
6. Accessibility: aria-label, role, keyboard nav
7. I18n: barcha UI text tarjima kaliti orqali
```

---

## 🚫 TAQIQLANGAN

```
❌ apps/api/ papkasiga TEGINMA
❌ prisma/ papkasiga TEGINMA
❌ any type
❌ console.log production da
❌ inline style (style={{...}}) → Tailwind class
❌ 300+ qatorli komponent → hook ga ajratish
❌ Fixed width charts → ResponsiveContainer
❌ localStorage to'g'ridan → useLocalStorage hook
```

---

*CLAUDE_FRONTEND.md | [LOYIHA_NOMI] | v1.0*
