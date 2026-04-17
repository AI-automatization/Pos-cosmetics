# RAOS UI Design Skill
# Tailwind + Next.js App Router + shadcn/ui — Production-grade Admin & POS interfaces

---

## Kontekst

Bu skill RAOS loyihasida frontend komponentlar, sahifalar va panellar yaratish uchun ishlatiladi.
Stack: **Next.js App Router + TailwindCSS + React Query + Zustand + TypeScript strict**.

Trigger holatlari:
- "Yangi sahifa yoz" / "komponent qil" / "UI yasа"
- "Design yaxshi emas" / "ko'rinishini yaxshila"
- Admin Panel, POS, Warehouse, Founder panel sahifalari
- Table, Form, Modal, Card, Dashboard komponentlari

---

## RAOS Design System

### Rang Palatrasi (CSS Variables orqali — hex TAQIQLANGAN)

```css
/* globals.css da mavjud bo'lishi kerak */
:root {
  /* Primary */
  --color-primary: theme('colors.indigo.600');
  --color-primary-hover: theme('colors.indigo.700');
  --color-primary-light: theme('colors.indigo.50');

  /* Semantic */
  --color-success: theme('colors.emerald.600');
  --color-warning: theme('colors.amber.500');
  --color-danger: theme('colors.red.600');
  --color-info: theme('colors.sky.500');

  /* Neutral */
  --color-surface: theme('colors.white');
  --color-surface-alt: theme('colors.gray.50');
  --color-border: theme('colors.gray.200');
  --color-text: theme('colors.gray.900');
  --color-text-muted: theme('colors.gray.500');
}
```

### Tipografiya

```
Font stack:
  Display/Heading: "Geist" yoki "Plus Jakarta Sans" (Google Fonts)
  Body: "Inter" (system fallback sifatida acceptable — heading da TAQIQLANGAN)
  Mono: "JetBrains Mono" — kod, ID, barcode uchun

Qaydlar:
  - h1: text-2xl font-bold tracking-tight text-gray-900
  - h2: text-xl font-semibold text-gray-800
  - Label: text-sm font-medium text-gray-700
  - Muted: text-sm text-gray-500
  - Table header: text-xs font-semibold uppercase tracking-wide text-gray-500
```

---

## Komponent Standartlari

### Page Layout

```tsx
// apps/web/src/components/layout/PageLayout.tsx
// HAR SAHIFADA ISHLATILADI

export function PageLayout({
  title,
  description,
  actions,
  children,
}: PageLayoutProps) {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
        )}
      </div>
      {/* Content */}
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}
```

### Stats Card (Dashboard)

```tsx
interface StatCardProps {
  label: string;
  value: string | number;
  delta?: { value: string; positive: boolean };
  icon: React.ReactNode;
  color?: 'indigo' | 'emerald' | 'amber' | 'red';
}

export function StatCard({ label, value, delta, icon, color = 'indigo' }: StatCardProps) {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span className={`rounded-xl p-2 ${colorMap[color]}`}>{icon}</span>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {delta && (
          <span className={`text-xs font-medium ${
            delta.positive ? 'text-emerald-600' : 'text-red-500'
          }`}>
            {delta.positive ? '↑' : '↓'} {delta.value}
          </span>
        )}
      </div>
    </div>
  );
}
```

### DataTable

```tsx
// RAOS standart jadval pattern
// TanStack Table + Tailwind

// Jadval Container:
<div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
  {/* Toolbar */}
  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
    <SearchInput placeholder="Qidirish..." onChange={setSearch} />
    <div className="flex gap-2">
      {/* Filter, Export tugmalari */}
    </div>
  </div>

  {/* Table */}
  <table className="w-full text-sm">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
          Nomi
        </th>
        {/* ... */}
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-100">
      {rows.map(row => (
        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
          <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
        </tr>
      ))}
    </tbody>
  </table>

  {/* Pagination */}
  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
    <p className="text-sm text-gray-500">
      {total} ta natija, {page}-sahifa
    </p>
    {/* Pagination buttons */}
  </div>
</div>
```

### Button Variants

```tsx
// PRIMARY — asosiy harakat
<button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">

// SECONDARY — ikkilamchi harakat
<button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-95 transition-all">

// DANGER — o'chirish/xavfli harakat
<button className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 active:scale-95 transition-all">

// GHOST — icon yoki minimal tugma
<button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">

// LOADING holat (MAJBURIY):
<button disabled={isPending}>
  {isPending ? (
    <><Loader2 className="h-4 w-4 animate-spin" /> Saqlanmoqda...</>
  ) : (
    <><PlusIcon className="h-4 w-4" /> Qo'shish</>
  )}
</button>
```

### Form Field

```tsx
// Standart form field pattern
<div className="flex flex-col gap-1.5">
  <label className="text-sm font-medium text-gray-700">
    Mahsulot nomi <span className="text-red-500">*</span>
  </label>
  <input
    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors disabled:bg-gray-50 disabled:text-gray-500 aria-invalid:border-red-500"
    placeholder="Masalan: Coca Cola 0.5L"
    {...register('name')}
  />
  {error && (
    <p className="text-xs text-red-500">{error.message}</p>
  )}
</div>

// Form Grid:
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
  {/* fields */}
</div>
```

### Badge / Status

```tsx
// Status badge pattern
const STATUS_STYLES = {
  active:   'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
  inactive: 'bg-gray-100 text-gray-600 ring-1 ring-gray-500/20',
  pending:  'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
  failed:   'bg-red-50 text-red-700 ring-1 ring-red-600/20',
  low:      'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20',
};

<span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
  {label}
</span>
```

### Modal / Dialog

```tsx
// Dialog arxitekturasi: shadcn/ui Dialog yoki custom
<div className="fixed inset-0 z-50 flex items-center justify-center">
  {/* Overlay */}
  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

  {/* Panel */}
  <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
    {/* Header */}
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
        <XIcon className="h-4 w-4" />
      </button>
    </div>

    {/* Content */}
    <div className="flex flex-col gap-4">{children}</div>

    {/* Footer */}
    <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
      <button onClick={onClose} className="...secondary...">Bekor qilish</button>
      <button onClick={onConfirm} className="...primary...">Saqlash</button>
    </div>
  </div>
</div>
```

---

## Panel-Specific Design Rules

### Admin Panel

```
Layout: Sidebar (240px) + main content
Sidebar bg: gray-900 (dark) — white text
Active item: indigo-600 bg, white text
Header: white, border-b border-gray-200, h-16
Content: p-6, max-w-screen-2xl, gray-50 bg
Cards: white, rounded-2xl, border border-gray-100, shadow-sm
Charts: ResponsiveContainer MAJBURIY, Recharts
```

### POS Desktop

```
Layout: 2-column (left: products 60%, right: cart 40%)
Colors: gray-900 bg (dark) — high contrast uchun
Buttons: min-h-[56px] — touch-friendly
Font-size: min 16px — barcode va narx uchun 20px+
Numeric display: font-mono, text-3xl
Cart items: compact, clear quantity controls
Payment modal: full-screen overlay, centered
Status bar: bottom, h-10, sync status + shift info
Keyboard shortcuts: MAJBURIY ko'rinadi (F1, F2, F5...)
```

### Warehouse Panel

```
Layout: Sidebar (dark) + main
Stock status indicator: DOIM ko'rinadi
  🟢 Normal (emerald) | 🟡 Low (amber) | 🔴 Out (red)
Tables: sortable, filterable, paginated
Nakладная view: read-only snapshot (lock icon ko'rinadi)
Movement history: timeline format
Batch actions: checkbox selection + bulk actions toolbar
```

---

## Animations & Micro-interactions

```tsx
// Sahifa transition (layout.tsx da):
<div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
  {children}
</div>

// Skeleton loader (loading holat):
<div className="animate-pulse rounded-lg bg-gray-200 h-10 w-full" />

// Hover lift (card da):
className="hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"

// Success feedback (mutation dan keyin):
// toast.success() + icon animatsiya:
<CheckCircle className="text-emerald-500 animate-in zoom-in duration-200" />

// Table row hover:
className="hover:bg-indigo-50/50 transition-colors duration-100 cursor-pointer"
```

---

## Empty States

```tsx
// Har jadval/sahifada empty state bo'lishi SHART
function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-gray-100 p-4 text-gray-400 mb-4">
        {icon}  {/* 32x32 icon */}
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Misol:
<EmptyState
  icon={<PackageIcon className="h-8 w-8" />}
  title="Mahsulotlar topilmadi"
  description="Yangi mahsulot qo'shish uchun tugmani bosing"
  action={<button className="...primary...">+ Mahsulot qo'shish</button>}
/>
```

---

## Loading States

```tsx
// Page loading:
function PageSkeleton() {
  return (
    <div className="p-6 flex flex-col gap-4 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded-lg" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-gray-200 rounded-xl" />
    </div>
  );
}

// Table row skeleton:
{isLoading && [...Array(5)].map((_, i) => (
  <tr key={i} className="animate-pulse">
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-1/2" /></td>
  </tr>
))}
```

---

## Error States

```tsx
// Inline error (query fail):
function ErrorAlert({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-800">Xato yuz berdi</p>
        <p className="text-sm text-red-600 mt-0.5">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="text-sm text-red-700 underline hover:no-underline">
          Qayta urinish
        </button>
      )}
    </div>
  );
}
```

---

## Accessibility Checklist

```
✓ Har button/input — aria-label yoki visible label
✓ Focus ring: focus-visible:ring-2 focus-visible:ring-indigo-500
✓ Disabled states: opacity-50 + cursor-not-allowed
✓ Color ma'nosi faqat rang orqali emas (icon yoki text ham)
✓ Keyboard navigation: Tab order mantiqiy
✓ Error messages: aria-describedby bilan bog'liq
✓ Modal: focus trap + Escape bilan yopiladi
✓ Table: th scope="col" / scope="row"
✓ Loading: aria-busy="true"
```

---

## TAQIQLANGAN (Design)

```
❌ Inline styles — Tailwind class ishlatish
❌ Magic colors — hex (#3B82F6) — Tailwind token (blue-500)
❌ Fixed width charts — ResponsiveContainer
❌ Hardcoded text — i18n translation keys
❌ Generic "Loading..." text — skeleton loader ishlatish
❌ Alert/confirm browser dialogs — custom modal
❌ Scrolling overflow tashqarida — overflow-hidden + scroll container
❌ z-index magic numbers — Tailwind z-10, z-20, z-50
❌ Dark sidebar da dark text
❌ POS tugmalariga min 48px dan past height
❌ Empty jadval ko'rsatmaslik (empty state MAJBURIY)
❌ Form submit after double-click (disabled={isPending})
```

---

## Skill Ishlatish Tartibi

Claude bu skillni quyidagicha ishlatadi:

```
1. Kontekstni tushun: Qaysi panel? Qanday komponent?
2. Panel-specific qoidalarni qo'lla (Admin / POS / Warehouse)
3. TypeScript strict — any TAQIQLANGAN
4. Logika hookda, render komponentda
5. Loading + empty + error state — HAR DOIM
6. Tailwind tokens — hex TAQIQLANGAN
7. i18n keys — hardcoded text TAQIQLANGAN
8. 400 qatordan oshsa → alohida komponentlarga bo'l
```

---

*ui-design.md | RAOS | v1.0 | 2026-04-06*