# RAOS — BAJARILGAN ISHLAR ARXIVI
# Yangilangan: 2026-02-28

---

## 📌 QOIDALAR

```
1. docs/Tasks.md dagi task FIX bo'lgach → shu yerga ko'chiriladi
2. Format: T-raqam | sana | tur | qisqa yechim | fayl nomi
3. Bu fayl FAQAT arxiv — o'chirmaslik, o'zgartirmaslik
```

---

## TUZATILGAN BUGLAR

| # | Sana | Tur | Muammo va yechim | Fayl |
|---|------|-----|-----------------|------|
| — | — | — | _(hali yo'q)_ | — |

---

## YARATILGAN FEATURELAR

| # | Sana | Feature | Fayl(lar) |
|---|------|---------|-----------|
| T-001 | 2026-02-26 | Identity & RBAC module — JWT auth (access 15min + refresh 7d), @Public/@Roles decorators, global guards (JwtAuth, Roles, Tenant) | `apps/api/src/identity/` (auth.controller, users.controller, identity.service, identity.module, dto/*, guards/*, strategies/*) |
| T-002 | 2026-02-26 | Auth endpoints — POST /auth/register, login, refresh, logout, GET /auth/me | `apps/api/src/identity/auth.controller.ts` |
| T-003 | 2026-02-26 | Users CRUD — GET/POST/PATCH/DELETE /users with role hierarchy enforcement (OWNER>ADMIN>MANAGER>CASHIER>VIEWER) | `apps/api/src/identity/users.controller.ts` |
| T-004 | 2026-02-26 | Multi-tenant isolation — tenant_id filtering on all user queries, slug-based login | `apps/api/src/identity/identity.service.ts`, `apps/api/src/identity/guards/tenant.guard.ts` |
| T-005 | 2026-02-26 | Prisma migration — refresh_token + refresh_token_exp fields to users table | `apps/api/prisma/migrations/20260226112310_add_refresh_token_to_user/` |
| T-006 | 2026-02-26 | Identity domain events — TENANT_REGISTERED, USER_LOGGED_IN, USER_CREATED, USER_UPDATED, USER_DEACTIVATED | `apps/api/src/events/domain-events.ts` |
| T-016 | 2026-02-28 | Admin Panel Catalog UI — Products CRUD (DataTable, sortable/filterable/paginated), ProductForm (Zod validation), Categories tree view, barcode search, React Query hooks (useProducts, useCategories, useCreateProduct, useUpdateProduct, useDeleteProduct), loading skeletons, toast notifications | `apps/web/src/app/(admin)/catalog/products/page.tsx`, `ProductsTable.tsx`, `ProductForm.tsx`, `apps/web/src/app/(admin)/catalog/categories/page.tsx`, `apps/web/src/hooks/catalog/useProducts.ts`, `useCategories.ts`, `apps/web/src/api/catalog.api.ts`, `apps/web/src/types/catalog.ts` |
| T-017 | 2026-02-28 | POS Sale Screen — 3-column layout (ProductSearch 42% \| CartPanel 33% \| PaymentPanel 25%), barcode scanner (keyboard-wedge, <80ms detection), cart management (add/remove/qty/line discount), order discount (% yoki fixed), split payment (cash+card), keyboard shortcuts (F1/F5/F6/F7/F10/Esc), Zustand POS store, useCompleteSale mutation, ReceiptPreview modal | `apps/web/src/app/(pos)/pos/page.tsx`, `ProductSearch.tsx`, `CartPanel.tsx`, `PaymentPanel.tsx`, `ReceiptPreview.tsx`, `apps/web/src/store/pos.store.ts`, `apps/web/src/hooks/pos/useBarcodeScanner.ts`, `usePOSKeyboard.ts`, `useCompleteSale.ts`, `apps/web/src/types/sales.ts` |
| T-018 | 2026-02-28 | Shift Management UI — ShiftOpenModal (fullscreen gate, cashier name + opening cash, quick amounts: 0/100K/200K/500K/1M), ShiftCloseModal (closing cash input, ShiftReport: savdolar soni, jami, cash/card breakdown, discrepancy badge), ShiftBar (live clock, cashier, sales count, "Smenani yopish"), useOpenShift/useCloseShift hooks (API + demo fallback) | `apps/web/src/app/(pos)/pos/shift/ShiftOpenModal.tsx`, `ShiftCloseModal.tsx`, `ShiftReport.tsx`, `apps/web/src/app/(pos)/pos/ShiftBar.tsx`, `apps/web/src/hooks/pos/useShift.ts`, `apps/web/src/api/shift.api.ts`, `apps/web/src/types/shift.ts` |
| T-020 | 2026-02-28 | Receipt Print UI — ReceiptTemplate (80mm thermal: do'kon header, order № va sana, items qty×narx+chegirma, subtotal, QQS 12%, JAMI, payment method, qaytim, fiskal placeholder, footer), useReceiptPrint hook (autoPrint localStorage, toggleAutoPrint, window.print()), useAutoTriggerPrint, @media print CSS (hides UI, shows #receipt-print-area, @page 80mm), auto-print toggle (ToggleLeft/Right) | `apps/web/src/components/Receipt/ReceiptTemplate.tsx`, `useReceiptPrint.ts`, `apps/web/src/app/(pos)/pos/ReceiptPreview.tsx`, `apps/web/src/app/globals.css` |
| T-023 | 2026-02-28 | Inventory UI — Stock levels page (DataTable: mahsulot, barcode, SKU, kategoriya, zaxira, min, holat; OK/LOW/OUT color coding), Kirim/Nakladnoy page (supplier + dynamic items table: product select, qty, cost_price, batch №, expiry date, summary), Chiqim page (reason DAMAGE/WRITE_OFF/OTHER + dynamic items), Kam zaxira page (sorted OUT→LOW, shortage column, alert banner), useStock/useLowStock/useStockIn/useStockOut hooks, Sidebar Inventar links updated | `apps/web/src/app/(admin)/inventory/page.tsx`, `inventory/stock-in/page.tsx`, `inventory/stock-out/page.tsx`, `inventory/low-stock/page.tsx`, `apps/web/src/hooks/inventory/useInventory.ts`, `apps/web/src/api/inventory.api.ts`, `apps/web/src/types/inventory.ts` |
| T-025 | 2026-03-01 | Reports UI — Dashboard (bugungi savdo, sof daromad, o'rtacha chek, kam zaxira stat cards; haftalik bar chart Recharts; top 5 products; low stock alert banner; demo mode when backend not ready), Kunlik savdo page (date range picker, quick 7/30/90 kun, ResponsiveContainer BarChart, summary cards, data table), Top mahsulotlar page (date range, inline mini progress bars), Smena hisobotlari page (collapsible cards: naqd/karta/farq breakdown), recharts o'rnatildi | `apps/web/src/app/(admin)/dashboard/page.tsx`, `reports/page.tsx`, `reports/daily-revenue/page.tsx`, `reports/top-products/page.tsx`, `reports/shifts/page.tsx`, `apps/web/src/hooks/reports/useReports.ts`, `apps/web/src/api/reports.api.ts`, `apps/web/src/types/reports.ts` |

---

## ARXITEKTURA TUZATISHLARI

| # | Sana | Vazifa | Holat |
|---|------|--------|-------|
| T-007 | 2026-02-26 | @Public() decorator — global JwtAuthGuard bypass uchun, HealthController ga qo'shildi | Bajarildi |
| T-008 | 2026-02-26 | APP_GUARD orqali global guards (JwtAuth → Roles → Tenant) zanjiri o'rnatildi | Bajarildi |

---

## DEVOPS ISHLAR

| # | Sana | Vazifa | Holat |
|---|------|--------|-------|
| T-009 | 2026-02-26 | RAOS monorepo bootstrap — Docker (PostgreSQL, Redis, MinIO), NestJS API, Next.js admin, shared packages | Bajarildi |
| T-010 | 2026-02-26 | Auth dependencies o'rnatildi — @nestjs/jwt, @nestjs/passport, passport-jwt, bcryptjs | Bajarildi |

---

*docs/Done.md | RAOS*
