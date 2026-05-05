# RAOS — OCHIQ VAZIFALAR (Kosmetika POS MVP)
# Yangilangan: 2026-05-05 (T-433..T-446 qo'shildi — web/mobile parity gap tasklar)
# Format: T-XXX | Prioritet | [KAT] | Sarlavha

---

## JAMOA TUZILISHI (2026-03-23 dan)

| Ism | Roli | Zona |
|-----|------|------|
| **AbdulazizYormatov** | Team Lead | Umumiy rahbariyat |
| **Ibrat** | Full-Stack (Web + Backend + DevOps) | `apps/api/`, `apps/web/`, `apps/worker/`, `apps/bot/`, `docker/`, `prisma/` |
| **Abdulaziz** | Mobile (Android + iOS) | `apps/mobile/`, `apps/mobile-owner/` |
| **Bekzod** | PM (Project Manager) | Rejalashtirish, test, arxitektura |

> Polat loyihadan chiqdi (2026-03-23). Barcha uning vazifalari Ibrat ga o'tkazildi.

---

## QOIDALAR

```
1. Har topilgan bug/task -> shu faylga DARHOL yoziladi
2. Sessiya boshida shu faylni O'QIB, oxirgi T-raqamdan DAVOM ettiriladi
3. Takroriy task yaratmaslik — mavjudini yangilash
4. Fix bo'lgach -> shu yerdan O'CHIRISH -> docs/Done.md ga KO'CHIRISH
5. Prioritet: P0=kritik, P1=muhim, P2=o'rta, P3=past
6. Kategoriya: [BACKEND], [FRONTEND], [MOBILE], [DEVOPS], [SECURITY], [IKKALASI]
```

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P0 (KRITIK)
# ══════════════════════════════════════════════════════════════

---

## T-387 | P0 | [SECURITY] | Super Admin hardening

- **Sana:** 2026-04-24
- **Mas'ul:** Ibrat
- **Topgan:** AbdulazizYormatov (audit)
- **Muammo:**
  - SQL console — whitelist/audit yo'q
  - JWT localStorage da (XSS xavf)
  - DLQ endpoints JwtAuthGuard yo'q
  - Login/bootstrap da rate-limit yo'q
- **Kutilgan:** Deploy oldin barcha xavfsizlik yopilgan bo'lishi SHART

---

## T-388 | P0 | [BACKEND] | Fiscal worker — cross-tenant update, retry yo'q

- **Sana:** 2026-04-24
- **Mas'ul:** Ibrat
- **Topgan:** AbdulazizYormatov (audit)
- **Fayl:** `apps/worker/` (fiscal processor)
- **Muammo:**
  - order.update da tenant_id filter yo'q → cross-tenant update
  - fiscalStatus=FAILED har retry da o'rnatiladi
  - Retry/backoff mexanizm yo'q
  - Idempotency key (jobId) ishlatilmayapti
- **Kutilgan:** Tenant isolation, retry logika, idempotency

---

## T-389 | P0 | [SECURITY] | Cookie namespace collision — super-admin vs web

- **Sana:** 2026-04-24
- **Mas'ul:** Ibrat
- **Topgan:** AbdulazizYormatov (audit)
- **Muammo:** session_active, user_role, access_token nomlari bir xil → *.raos.uz da session leak
- **Kutilgan:** Cookie nomlari prefix bilan ajratilgan (sa_, web_)

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P1 (MUHIM)
# ══════════════════════════════════════════════════════════════

---

## T-390 | P1 | [BACKEND] | Migration 20260421120000 — SKU update bez backup

- **Sana:** 2026-04-24
- **Mas'ul:** Ibrat
- **Topgan:** AbdulazizYormatov (audit)
- **Muammo:** UPDATE products SET sku backup siz → POS scan buzilishi mumkin
- **Kutilgan:** Migration da backup/rollback qo'shish

---

## T-391 | P1 | [SECURITY] | admin-database: SUPPORT role CSV download — tenant leak

- **Sana:** 2026-04-24
- **Mas'ul:** Ibrat
- **Topgan:** AbdulazizYormatov (audit)
- **Muammo:** SUPPORT role barcha tenants CSV yuklay oladi tenantId filtersiz
- **Kutilgan:** tenantId filter MAJBURIY

---

## T-392 | P1 | [BACKEND] | shift-alert listener tenantId yo'q + sales.service 707 qator

- **Sana:** 2026-04-24
- **Mas'ul:** Ibrat
- **Topgan:** AbdulazizYormatov (audit)
- **Fayl:** `apps/api/src/sales/sales.service.ts`
- **Muammo:** shift-alert listener tenantId yo'q; sales.service.ts 707 qator — SRP buzilgan
- **Kutilgan:** tenantId qo'shish; 4 ta fayl ga bo'lish

---

## T-384 | P1 | [FRONTEND] | Founder Panel — to'liq Ruscha tarjima

- **Sana:** 2026-04-21
- **Mas'ul:** Ibrat
- **Fayl:** Barcha `apps/web/src/app/(founder)/` va `apps/web/src/components/layout/FounderSidebar.tsx`
- **Muammo:** 3 til aralashgan — Sidebar: Ruscha, Kontentlar: O'zbekcha, Sarlavhalar: Inglizcha
- **Vazifa:**
  - FounderSidebar.tsx — allaqachon Ruscha (OK)
  - Overview page — "Founder Overview" → "Обзор", "Jami tenantlar" → "Всего тенантов" va h.k.
  - Tenants list — "Barchasi/Faol/Nofaol" → "Все/Активные/Неактивные" va h.k.
  - Tenant detail — tablar "Obzor/Obuna/Foydalanuvchilar" → "Обзор/Подписка/Пользователи"
  - Tenant new wizard — "Kompaniya/Vladelec/Tarif/Tasdiqlash" → "Компания/Владелец/Тариф/Подтверждение"
  - Database Manager — "Jadvallar/Hajm/Ulanishlar" → "Таблицы/Размер/Соединения"
  - Errors page — "Barchasi/Xato topilmadi" → "Все/Ошибок не найдено"
  - Admin Login — "Parol/Kirish" → "Пароль/Войти"
  - Sidebar bottomda: "Admin panelga" → "← В админ-панель", "Chiqish" → "Выйти"
- **Kutilgan:** Butun Founder Panel 100% Ruscha

---

## T-420 | P1 | [MOBILE] | mobile-owner → mobile merge: role-based UI

- **Sana:** 2026-05-02
- **Mas'ul:** Abdulaziz
- **Fayl:** `apps/mobile/src/`
- **Muammo:** `apps/mobile-owner` alohida app sifatida mavjud. Barcha unique screen/hook/api/component `apps/mobile` ga ko'chirilmagan. Login qilinganda role bo'yicha UI o'zgarmaydi (OWNER/ADMIN uchun owner-specific UI ko'rsatilmaydi).
- **Kutilgan:**
  - OWNER/ADMIN login → BoshSahifa + Analytics + **Xodimlar** tab + Moliya + Ko'proq
  - Ko'proq menyu (OWNER/ADMIN): Smenlar (owner view) + Qarzdorlik qo'shiladi
  - Boshqa rollar: hozirgi holat (o'zgarmaydi)
- **Ko'chiriladigan narsalar (mobile-owner → mobile):**
  - Config: `theme.ts`, `endpoints.ts`, `queryKeys.ts`
  - Components: `AgingBucketChart`, `HorizontalBarChart`, `CurrencyText`, `FilterSheet`, `PullToRefresh`, `SkeletonCard`, `TrendBadge`, `StatusIndicator`
  - API: `debts.api.ts`, `employees.api.ts`, `shifts.api.ts`
  - Hooks: `useDebts.ts`, `useEmployees.ts`, `useShifts.ts`
  - Screens: `Debts/`, `Employees/`, `HR/`, `Shifts/` (ShiftsOwner nomi bilan)
  - i18n: `debts`, `shifts`, `employees` kalitlari
  - Navigation: `EmployeesNavigator`, types yangilash, TabNavigator, MoreNavigator, MoreMenu
- **Izoh:** `apps/mobile-owner` hozircha saqlanadi — merge to'liq tekshirilgandan keyin o'chiriladi
- **Reja:** `docs/superpowers/plans/2026-05-02-mobile-owner-merge.md`

---


# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P2 (O'RTA, MVP dan keyin)
# ══════════════════════════════════════════════════════════════

---

## T-380 | P2 | [BACKEND+FRONTEND] | Super Admin — Billing & Monetizatsiya

- **Sana:** 2026-04-21
- **Mas'ul:** Ibrat
- **Holat:** OCHIQ (billing API hali sotib olinmagan)
- **Fayl:** `apps/api/src/admin/admin-billing.controller.ts` (yaratish kerak)
- **Vazifa:**
  - `GET /admin/billing/overview` — MRR, ARR, subscribers, conversion rate, plan distribution
  - `GET /admin/billing/plans` — barcha planlar + subscriber count
  - `POST /admin/billing/plans` — plan yaratish
  - `PATCH /admin/billing/plans/:id` — plan tahrirlash
  - `DELETE /admin/billing/plans/:id` — plan deaktivatsiya
  - `GET /admin/billing/subscriptions` — barcha obunalar + filtrlar
  - `GET /admin/billing/revenue-history` — MRR trend (6 oy)
  - Frontend: `/founder/billing` — KPI kartalar, pie chart, plan CRUD, subscription table
- **Eslatma:** Payme/Click integratsiya hali yo'q (T-107). Hozircha faqat manual subscription management.
- **Kutilgan:** Admin planlarni boshqara oladi, MRR/ARR ko'ra oladi, obunalarni override qila oladi

---

---

## T-339 | P2 | [BACKEND] | Demo Seed — Low-stock mahsulot qo'shish (POS toast test uchun)

## T-097 | P2 | [BACKEND] | Product sertifikat — Kosmetika sifat hujjati

- **Sana:** 2026-02-26
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/catalog/`
- **Vazifa:** `product_certificates` CRUD (cert_number, issuing_authority, issued_at, expires_at, file_url).
  Expired sertifikat → alert.
- **Kutilgan:** Sertifikat ma'lumotlari saqlanadi va kuzatiladi

---

## T-107 | P2 | [BACKEND] | Payme/Click integratsiya — Online to'lov

- **Sana:** 2026-02-26
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/payments/providers/`
- **Vazifa:** Payme adapter (createTransaction, performTransaction, checkTransaction).
  Click adapter (prepare, complete). Webhook handler.
- **Kutilgan:** Online to'lov usullari ishlaydi

---

---











## T-419 | P2 | [BACKEND] | Ko'chmas mulk — POST /real-estate/properties endpoint yo'q

- **Sana:** 2026-04-29
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/realestate/realestate.controller.ts`
- **Muammo:** Backend da faqat GET endpointlar bor. `POST /real-estate/properties` yo'q — yangi mulk yaratib bo'lmaydi.
- **Kutilgan:** `POST /real-estate/properties` — name, address, type, rentAmount, area?, roi? fieldlar bilan
- **Bog'liq:** T-418 (mobile AddPropertyScreen) — backend tayyor bo'lgach faollashtiriladi

---

## ════════════════════════════════════════════════════════════════
## 🔴 MOBILE-OWNER API CONTRACT (T-221..T-226) — 2026-03-14
## apps/mobile-owner/src/config/endpoints.ts bilan TO'LIQ MOS KELISHI SHART
## Mas'ul: Abdulaziz (tekshirish) + Ibrat (backend)
## ════════════════════════════════════════════════════════════════

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P3 (KELAJAK, 6+ oy)
# ══════════════════════════════════════════════════════════════

---

## T-116 | P3 | [BACKEND] | Customer loyalty — Points + tiers
- **Sana:** 2026-02-26
- **Vazifa:** Earn points (1 point/1000 UZS). Tiers: Bronze/Silver/Gold. Birthday bonus. Redeem as payment.

## T-119 | P3 | [BACKEND] | Marketplace sync — Uzum/Sello
- **Sana:** 2026-02-26
- **Vazifa:** Catalog sync, stock sync, order import. Omnichannel.

## T-120 | P3 | [BACKEND] | AI forecasting — Seasonal demand prediction
- **Sana:** 2026-02-26
- **Vazifa:** Kosmetika seasonal (sunscreen yoz, moisturizer qish, gift sets 8-Mart).
  O'tgan yil datasi bo'yicha buyurtma tavsiya.

## T-121 | P3 | [BACKEND] | Google Sheets export — Automated daily data
- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** Kunlik savdo data → linked Google Sheet. Ko'p do'kon egalari Sheets da tahlil qiladi. Scheduled cron.


## T-124 | P3 | [IKKALASI] | Feature flags — Per-tenant feature toggle (kengaytirilgan)

- **Sana:** 2026-02-26
- **Mas'ul:** —
- **Vazifa:** T-313 da asosiy feature flags yaratiladi. Bu task — gradual rollout, A/B testing, analytics integratsiya kabi kengaytirilgan funksiyalar.

---

## T-437 | P2 | [MOBILE] | Buyurtmalar (Sales Orders) admin ko'rinishi — mobileda yo'q

- **Sana:** 2026-05-05
- **Mas'ul:** Abdulaziz
- **Rol:** OWNER, ADMIN, MANAGER
- **Fayl:** `apps/mobile/src/screens/` (yangi screen yoki `Sales/` kengaytirish)
- **Muammo:** Web da `/sales/orders` orqali OWNER/ADMIN barcha buyurtmalarni ko'ra oladi. Mobileda `Savdo` tab faqat yangi sotuv yaratish uchun (POS), o'tgan buyurtmalar tarixi yo'q.
- **Kutilgan:** `Ko'proq` menyusida "Buyurtmalar" — filtrli orders list + detail. `GET /sales/orders` API.
- **Bog'liq:** Web: `apps/web/src/app/(admin)/sales/orders/`

---

## T-438 | P2 | [MOBILE] | Qaytarish (Sales Returns) ekrani — mobileda yo'q

- **Sana:** 2026-05-05
- **Mas'ul:** Abdulaziz
- **Rol:** OWNER, ADMIN, MANAGER
- **Fayl:** `apps/mobile/src/screens/` (yangi screen)
- **Muammo:** Web da `/sales/returns` orqali mahsulot qaytarish va refund qayta ishlash mumkin. Mobileda bu imkoniyat yo'q.
- **Kutilgan:** Sotilgan orderni tanlash → qaytarish miqdori → `POST /sales/orders/:id/return` API.
- **Bog'liq:** Web: `apps/web/src/app/(admin)/sales/returns/`

---

## T-439 | P2 | [MOBILE] | Filial hisobotlari (Branch Reports) — mobileda yo'q

- **Sana:** 2026-05-05
- **Mas'ul:** Abdulaziz
- **Rol:** OWNER, ADMIN
- **Fayl:** `apps/mobile/src/screens/Finance/` (kengaytirish)
- **Muammo:** Web da `/reports/branches` orqali OWNER bir nechta filial ko'rsatkichlarini solishtira oladi. Moliya ekranida `ReportsHubScreen` bor, lekin filial kesimida hisobot yo'q.
- **Kutilgan:** `ReportsHubScreen` yoki alohida screen da filial bo'yicha daromad, xarajat, sotuv taqqoslash.
- **Bog'liq:** Web: `apps/web/src/app/(admin)/reports/branches/`

---

## T-440 | P2 | [MOBILE] | Chegirmalar (Discounts) yaratish — mobileda yo'q

- **Sana:** 2026-05-05
- **Mas'ul:** Abdulaziz
- **Rol:** OWNER, ADMIN
- **Fayl:** `apps/mobile/src/screens/` (yangi screen)
- **Muammo:** Web da `/chegirma` orqali chegirmalar yaratiladi va boshqariladi. Mobileda `Promotions` ekrani bor, lekin `Chegirma` (discount) ekrani yo'q.
- **Kutilgan:** `Ko'proq` menyusida "Chegirmalar" — list + yaratish. `GET/POST /sales/discounts` API.
- **Bog'liq:** Web: `apps/web/src/app/(admin)/chegirma/`

---

## T-441 | P2 | [MOBILE] | To'liq Warehouse moduli — hisobvaraq va hisobdan chiqarish

- **Sana:** 2026-05-05
- **Mas'ul:** Abdulaziz
- **Rol:** OWNER, ADMIN, WAREHOUSE (hisobvaraqlar — barchasi; write-off — faqat OWNER/ADMIN)
- **Fayl:** `apps/mobile/src/screens/Kirim/` (kengaytirish) yoki yangi `Warehouse/` screen
- **Muammo:** Web da to'liq warehouse moduli bor: qabul qilish hisobvaraqlari (`/warehouse/invoices`), hisobdan chiqarish (`/warehouse/write-off`). Mobileda faqat `Kirim` (stock in) va `Ombor` (lookup) bor — hisobvaraq detail va write-off yo'q.
- **Kutilgan:**
  - Kirim hisobvaraqlari: `GET /inventory/stock-ins` list + `GET /inventory/stock-ins/:id` detail
  - Hisobdan chiqarish: `POST /inventory/write-off` (mahsulot + sabab)
- **Bog'liq:** Web: `apps/web/src/app/(warehouse)/warehouse/invoices/`, `/warehouse/write-off/`

---

## T-442 | P2 | [MOBILE] | Manager Dashboard — mobileda yo'q

- **Sana:** 2026-05-05
- **Mas'ul:** Abdulaziz
- **Rol:** MANAGER (OWNER/ADMIN uchun mavjud Dashboard o'zgarishsiz qoladi)
- **Fayl:** `apps/mobile/src/screens/Dashboard/` (kengaytirish)
- **Muammo:** Web da `/(manager)/manager-dashboard` MANAGER roli uchun alohida dashboard. Mobileda MANAGER roli OWNER/ADMIN bilan bir xil dashboard ko'radi — manager-spesifik KPIlar yo'q.
- **Kutilgan:** MANAGER role login qilganda `Dashboard` ekranida alohida ko'rinish: o'z smena statistikasi, filial KPIlar, smena yopish/ochish tugmasi.
- **Bog'liq:** Web: `apps/web/src/app/(manager)/manager-dashboard/`

---

## T-443 | P3 | [MOBILE] | Hisobot yaratuvchi (Report Builder) — mobileda yo'q

- **Sana:** 2026-05-05
- **Mas'ul:** Abdulaziz
- **Rol:** OWNER, ADMIN
- **Fayl:** `apps/mobile/src/screens/Finance/` (yangi screen)
- **Muammo:** Web da `/reports/builder` orqali custom hisobotlar yaratish mumkin. Mobileda faqat tayyor hisobotlar bor.
- **Kutilgan:** Soddalashtirilgan hisobot yaratuvchi (sana oralig'i, metrikalar tanlash) mobile uchun.
- **Bog'liq:** Web: `apps/web/src/app/(admin)/reports/builder/`

---

## T-444 | P3 | [MOBILE] | Hisobot eksport (CSV/Excel) — mobileda yo'q

- **Sana:** 2026-05-05
- **Mas'ul:** Abdulaziz
- **Rol:** OWNER, ADMIN, MANAGER
- **Fayl:** `apps/mobile/src/screens/Finance/` (kengaytirish)
- **Muammo:** Web da `/reports/export` orqali hisobotlar CSV/Excel formatida yuklab olish mumkin. Mobileda bu imkoniyat yo'q.
- **Kutilgan:** Hisobot ekranlarida "Eksport" tugmasi — `GET /reports/export?format=csv` API, Share Sheet orqali fayl yuborish.
- **Bog'liq:** Web: `apps/web/src/app/(admin)/reports/export/`

---

## T-445 | P3 | [MOBILE] | Billing/Obuna boshqaruvi — mobileda yo'q

- **Sana:** 2026-05-05
- **Mas'ul:** Abdulaziz
- **Rol:** OWNER (faqat)
- **Fayl:** `apps/mobile/src/screens/Settings/` (kengaytirish)
- **Muammo:** Web da `/settings/billing` orqali OWNER obuna holatini ko'ra oladi. Mobileda `Ko'proq → Settings` da billing bo'limi yo'q.
- **Kutilgan:** Settings da obuna holati, joriy plan, muddati. `GET /billing/subscription` API.
- **Bog'liq:** Web: `apps/web/src/app/(admin)/settings/billing/`, T-380

---

## T-446 | P3 | [MOBILE] | Task boshqaruvi — mobileda yo'q

- **Sana:** 2026-05-05
- **Mas'ul:** Abdulaziz
- **Rol:** OWNER, ADMIN, MANAGER
- **Fayl:** `apps/mobile/src/screens/` (yangi screen)
- **Muammo:** Web da `/tasks` orqali ichki vazifalar yaratish va kuzatish mumkin. Mobileda yo'q.
- **Kutilgan:** `Ko'proq` menyusida "Vazifalar" — CRUD, status, mas'ul belgilash.
- **Bog'liq:** Web: `apps/web/src/app/(admin)/tasks/`

---

## T-432 | P2 | [MOBILE] | Settings — Kassir filialni ko'ra olmasligi kerak

- **Sana:** 2026-05-05
- **Mas'ul:** Abdulaziz
- **Fayl:** apps/mobile/src/screens/Settings/index.tsx (272-278-qatorlar)
- **Muammo:** Settings ekranidagi "Filiallar" (Branches) menu item hech qanday role tekshiruvsiz barcha foydalanuvchilarga ko'rsatilmoqda. CASHIER (level 2), VIEWER (level 1) va WAREHOUSE (level 2) rollari ham bu menuni ko'ra oladi va `BranchesScreen` ga o'tishi mumkin. Shuningdek, `BranchesScreen.tsx` da ham hech qanday role guard yo'q — ekran to'liq ochiq. `utils/roles.ts` da `ADMIN_ROLES = ['OWNER', 'ADMIN']` va `getRoleLevel()` funksiyalari mavjud, lekin Settings ekranida ishlatilmagan.
- **Kutilgan:** Faqat OWNER (level 5) va ADMIN (level 4) "Filiallar" menu itemini ko'rishi va BranchesScreen ga kirishi kerak. CASHIER / VIEWER / WAREHOUSE / MANAGER rollari bu menudan umuman xabardor bo'lmasligi kerak.
- **Fix:** `apps/mobile/src/screens/Settings/index.tsx` da `useAuthStore` orqali olingan `user?.role` ni tekshirish. `getRoleLevel` yoki `ADMIN_ROLES` import qilib, Branches `MenuRow` ni shartli render qilish:
  ```tsx
  import { getRoleLevel } from '../../utils/roles';
  // ...
  const canSeeBranches = getRoleLevel(user?.role) >= 4; // OWNER yoki ADMIN
  // ...
  {canSeeBranches && (
    <>
      <Divider />
      <MenuRow
        icon="business-outline"
        iconBg="#EEF2FF"
        iconColor="#6366F1"
        label={t('settings.branches')}
        subtitle={branchName}
        onPress={() => navigation.navigate('BranchesScreen')}
      />
    </>
  )}
  ```
  Qo'shimcha mudofaa sifatida `BranchesScreen.tsx` boshida ham role tekshiruv qo'shish tavsiya etiladi (navigation guard).
- **Topildi:** Manual Code Review — 2026-05-05

---

## T-428 | P1 | [MOBILE] | OmborRequestSheet — "Yuborish" tugmasi hech narsa qilmaydi (API chaqiruvi yo'q)

- **Sana:** 2026-05-05
- **Mas'ul:** Abdulaziz
- **Fayl:** apps/mobile/src/screens/Ombor/OmborRequestSheet.tsx (106-109-qatorlar)
- **Muammo:** `handleSubmit` funksiyasi (106-qator) faqat `onClose()` chaqiradi — hech qanday API so'rovi yuborilmaydi. Kod ichida `// API integration is a separate task — just close for now.` izohi qoldirilgan. Backend da `POST /inventory/restock-request` endpointi to'liq tayyor (`RestockRequestDto`: `productId`, `productName`, `currentStock`) va `inventoryApi` da mos funksiya yo'q. Foydalanuvchi "Yuborish" tugmasini bosadi, sheet yopiladi, lekin omborchiga hech narsa kelmaydi.
- **Kutilgan:** Foydalanuvchi belgilangan (checked) mahsulotlar uchun `POST /inventory/restock-request` ga so'rov yuborilishi kerak. Har bir checked `RequestItem` uchun `{ productId, productName, currentStock: item.stock }` yuborilishi lozim. Muvaffaqiyatli yuborilgandan so'ng foydalanuvchiga toast/alert ko'rsatilishi va sheet yopilishi kerak.
- **Topildi:** Manual Code Review — 2026-05-05

---

## T-429 | P1 | [MOBILE] | InventoryScreen — Faqat low-stock mahsulotlar ko'rinadi, barcha mahsulotlar ko'rsatilishi kerak (low/out-of-stock birinchi)

- **Sana:** 2026-05-05
- **Mas'ul:** Abdulaziz
- **Fayl:** apps/mobile/src/screens/Inventory/index.tsx + apps/mobile/src/api/inventory.api.ts
- **Muammo:** `InventoryScreen` (`apps/mobile/src/screens/Inventory/index.tsx`) `useInventoryData` hook orqali faqat `inventoryApi.getLowStock()` ni chaqiradi. `getLowStock()` esa `GET /inventory/levels?lowStock=true` yuboradi — bu faqat stok darajasi `minStockLevel` dan past bo'lgan mahsulotlarni qaytaradi. Normal stokdagi mahsulotlar umuman ko'rsatilmaydi. Bundan tashqari, `LowStockItem` interfeysi (`stock`, `minStockLevel`, `quantity`, `warehouseId`, `isLow`) bilan backend `GET /inventory/levels` javobi (`totalQty`, `name`, `minStockLevel`) mos kelmaydi — `stock` maydoni yo'q, `productName` o'rniga `name` qaytariladi. Bu sahifada mahsulotlar umuman ko'rsatilmasligiga olib kelishi mumkin.
- **Kutilgan:** `GET /inventory/items` (yoki `GET /inventory/levels` `lowStock` parametrsiz) orqali BARCHA mahsulotlar yuklanishi kerak. So'ng ular `status` bo'yicha saralanishi: `out_of_stock` (stock=0) va `low` (stock <= minStockLevel) mahsulotlar ro'yxat boshida, `normal` mahsulotlar oxirida ko'rinishi kerak.
- **Topildi:** Manual Code Review — 2026-05-05

---

## T-425 | P1 | [MOBILE] | Nasiya — nasiyaApi.pay() signature mismatch: payment method UI ga bog'lanmagan

- **Sana:** 2026-05-05
- **Mas'ul:** Abdulaziz
- **Fayl:** apps/mobile/src/api/nasiya.api.ts (105-qator), apps/mobile/src/screens/Nasiya/PayModal.tsx (74-qator)
- **Muammo:** `PayModal` "To'lov usuli" tanlashni (CASH / CARD / TRANSFER) `nasiyaApi.pay(debt.id, parsed, method)` — uchinchi argument sifatida uzatadi. Lekin `nasiyaApi.pay` funksiyasi `pay(id, amount, notes?)` deb aniqlangan — uchinchi parametr `notes`, ya'ni foydalanuvchi tanlagan `method` qiymati (`'CARD'`, `'TRANSFER'`) `notes` maydoni sifatida yuboriladi. Bundan tashqari, funksiya ichida `method: 'CASH'` qattiq (hardcoded) yozilgan, shuning uchun foydalanuvchi qaysi to'lov usulini tanlashidan qat'iy nazar, backend har doim `method=CASH` qabul qiladi va `notes` maydoni ifloslangan.
  ```typescript
  // HOZIRGI (noto'g'ri) — nasiya.api.ts 105-qator:
  pay: async (id: string, amount: number, notes?: string): Promise<void> => {
    await api.post(`/nasiya/${id}/pay`, { amount, method: 'CASH', notes });
    //                 method hardcoded CASH ↑   ↑ notes ga 'CARD'/'TRANSFER' kelib tushadi
  };
  // PayModal 74-qator:
  await nasiyaApi.pay(debt.id, parsed, method); // method='CARD' → notes='CARD' deb yuboriladi
  ```
- **Kutilgan:** `nasiyaApi.pay(id, amount, method, notes?)` — funksiya imzosi `method` ni alohida parametr sifatida qabul qilishi va backend ga to'g'ri yuborishi kerak. Foydalanuvchi tanlagan to'lov usuli (CASH / CARD / TRANSFER) backend `DebtPayment.method` maydonida saqlanishi lozim.
- **Topildi:** Manual Code Review — 2026-05-05

---

## T-426 | P1 | [MOBILE] | Nasiya — PayModal amount parse: `parseInt` bilan katta summa noto'g'ri o'qilishi

- **Sana:** 2026-05-05
- **Mas'ul:** Abdulaziz
- **Fayl:** apps/mobile/src/screens/Nasiya/PayModal.tsx (60-61-qatorlar)
- **Muammo:** `handleConfirm` da to'lov summasi quyidagicha parse qilinadi:
  ```typescript
  const parsed = parseInt(amount.replace(/\s/g, ''), 10);
  if (!parsed || parsed <= 0) { ... }
  ```
  `parseInt` vergul (`,`) yoki nuqta (`.`) belgisini uchratganda u belgigacha bo'lgan qismni qaytaradi va qolganini o'tkazib yuboradi. Masalan, iOS klaviaturasida foydalanuvchi `1,000,000` kiritsa, `parseInt('1,000,000', 10)` → `1` qaytaradi. Yoki foydalanuvchi `150000.50` kiritsa, `parseInt` → `150000` qaytaradi (bu holda ma'qul), lekin backend `Decimal` qabul qilganda bu noto'g'ri. Asosiy xavf: katta summalarda bo'lim belgisi bilan yozilganda summa kesib tashlanadi va foydalanuvchi bilmasdan noto'g'ri summa to'laydi. Bundan tashqari, `!parsed` tekshiruvi `0` qiymatini ham xato deb qaytaradi (bu to'g'ri), lekin `NaN` holini alohida ushlamaydi.
- **Kutilgan:** `Number(amount.replace(/[\s,]/g, ''))` ishlatilishi va `isNaN` bilan tekshiruv qo'yilishi: `if (isNaN(parsed) || parsed <= 0)`. Bu bilan `'1,000,000'` → `1000000` to'g'ri parse qilinadi.
- **Topildi:** Manual Code Review — 2026-05-05

---

## T-427 | P2 | [MOBILE] | Nasiya — PayModal muvaffaqiyatli to'lovda Alert → onClose tartib xatosi (iOS modal konflikti)

- **Sana:** 2026-05-05
- **Mas'ul:** Abdulaziz
- **Fayl:** apps/mobile/src/screens/Nasiya/PayModal.tsx (75-77-qatorlar)
- **Muammo:** `handleConfirm` to'lov muvaffaqiyatli bo'lganda quyidagi tartibda ishlaydi:
  ```typescript
  Alert.alert('', "To'lov muvaffaqiyatli amalga oshirildi"); // 75
  onSuccess();  // 76 — refetchAll() — API refresh darhol boshlanadi
  onClose();    // 77 — modal setPayVisible(false) — Alert ni kutmasdan
  ```
  `Alert.alert` React Native da asinxron (fire-and-forget) — Alert tugmachasi bosilishini kutmaydi. iOS da ikkita `Modal` bir vaqtda render bo'lishi (PayModal + Alert) Z-index konfliktiga olib keladi va ba'zi hollarda ekran muzlashi mumkin. `onSuccess()` Alert ko'rsatilayotgan paytdayoq ishga tushadi, shuning uchun list refresh animatsiyasi Alert bilan ustma-ust keladi. To'g'ri tartib: foydalanuvchi Alert ni tasdiqlagan callback ichida `onSuccess()` va `onClose()` chaqirilishi kerak.
- **Kutilgan:**
  ```typescript
  Alert.alert('', "To'lov muvaffaqiyatli amalga oshirildi", [
    { text: 'OK', onPress: () => { onSuccess(); onClose(); } }
  ]);
  ```
  Bu iOS va Android da ham to'g'ri ishlaydi: foydalanuvchi "OK" bosgach modal yopiladi va list yangilanadi.
- **Topildi:** Manual Code Review — 2026-05-05

---

# ══════════════════════════════════════════════════════════════
# STATISTIKA
# ══════════════════════════════════════════════════════════════

---

| Umumiy ochiq | P0 | P1 | P2 | P3 |
|--------------|----|----|----|----|
| **27** | **3** | **9** | **9** | **6** |

### Kategoriya bo'yicha

| Kategoriya | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| [BACKEND] | 1 | 2 | 5 | 4 | **12** |
| [FRONTEND] | 0 | 1 | 0 | 0 | **1** |
| [MOBILE] | 0 | 5 | 4 | 4 | **13** |
| [SECURITY] | 2 | 1 | 0 | 0 | **3** |
| [IKKALASI] | 0 | 2 | 0 | 1 | **3** |
| [BACKEND+FRONTEND] | 0 | 0 | 1 | 0 | **1** |

### Mas'uliyat taqsimoti

| Dasturchi | P0 | P1 | P2 | P3 | Jami |
|-----------|----|----|----|----|------|
| **Ibrat** (Full-Stack) | 3 | 3 | 5 | 0 | **11** |
| **Abdulaziz** (Mobile) | 0 | 5 | 5 | 4 | **14** |
| **Belgilanmagan** | 0 | 0 | 0 | 2 | **2** |
| **Ibrat + Abdulaziz** | 0 | 1 | 0 | 0 | **1** |

> Yangilandi: 2026-05-05 — T-433..T-436 Done.md ga ko'chirildi (git da bajarilgan)

---

# ══════════════════════════════════════════════════════════════
# BAJARILGAN MODULLAR (allaqachon kodda mavjud)
# Bu yerda ko'rsatilgan narsalar Done.md da yoki kodda tayyor
# ══════════════════════════════════════════════════════════════

```
Quyidagi modullar apps/api/src/ da mavjud va ishlaydi:

  identity/     — Auth, JWT, Users, Sessions, RBAC, API keys, PIN
  catalog/      — Products, Categories, Units, Suppliers, Variants, Certificates, Prices
  inventory/    — Stock movements, Warehouses, Transfers, Testers, Snapshots
  sales/        — Orders, Shifts, Returns, Promotions
  payments/     — Cash, Terminal, Click, Payme providers
  ledger/       — Double-entry journal (immutable)
  tax/          — Fiscal adapter (stub), VAT 12%, fiscal worker
  customers/    — CRUD, stats
  nasiya/       — Debts, payments, aging report, debt aliases
  notifications/ — Push (FCM), Alerts, Telegram notify, Email notify
  ai/           — Analytics (7 endpoints), revenue, sales-trend, etc.
  billing/      — Subscription plans, limits, usage
  branches/     — CRUD, stats
  employees/    — CRUD, performance, fired status
  audit/        — Logs
  reports/      — Daily, top products, Z-report, export CSV/Excel
  finance/      — Expenses CRUD + P&L + Balance Sheet + Cash Flow
  admin/        — Super admin, metrics, DLQ, IP block, feature flags
  health/       — Live, ready, ping, system health
  realtime/     — WebSocket gateway (Socket.io)
  sync/         — Outbox pattern + conflict resolution (T-302)
  realestate/   — Module shell (empty controller -> T-140)
  loyalty/      — LoyaltyConfig, Account, Transaction
  metrics/      — Prometheus endpoint (MetricsSecretGuard)
  events/       — Domain events, EventEmitter2
  common/       — Cache, cron, guards, pipes, filters, circuit breaker, currency
  support/      — Tickets, messages, status (T-305)

  apps/worker/  — 6 queue workers (fiscal, notification, report, snapshot, export, sync)
  apps/bot/     — Telegram bot (grammY) — commands, cron alerts (5 cron)
```

---

*docs/Tasks.md | RAOS Kosmetika POS | v3.0 | 2026-04-03 (tozalandi)*


---

## T-421 | P1 | [IKKALASI] | ExpensesScreen — Backend response key mismatch: `items` vs `data`

- **Sana:** 2026-05-05
- **Mas'ul:** Abdulaziz (mobile fix) + Ibrat (backend confirm)
- **Fayl:** apps/mobile/src/api/expenses.api.ts, apps/api/src/finance/finance.service.ts
- **Muammo:** Backend `financeService.getExpenses()` `{ items, total, page, limit }` qaytaradi (kalit: `items`). Lekin `expenses.api.ts` `getExpenses()` response ni `{ data: ..., total, page, limit }` deb kutadi (kalit: `data`). `ExpensesScreen.tsx` `data?.data` o'qiydi — bu har doim `undefined` bo'ladi. Natija: ro'yxat hech qachon yuklanmaydi, ekran bo'sh ko'rinadi va foydalanuvchi xarajat qo'sha olmaydi.
- **Kutilgan:** Backend `{ data: Expense[], total, page, limit }` qaytarishi yoki `expenses.api.ts` `data.items` o'qishi kerak.
- **Topildi:** Manual Code Review — 2026-05-05
- **Fix:** Applied 2026-05-05 — `PaginatedExpenses.data` → `items`, `api.get<{items:...}>`, `data.items.map(...)`, `ExpensesScreen` `data?.data` → `data?.items`

---

## T-422 | P1 | [MOBILE] | client.ts — CONFIG.API_URL default port noto'g'ri (3003 vs 3000)

- **Sana:** 2026-05-05
- **Mas'ul:** Abdulaziz
- **Fayl:** apps/mobile/src/config/index.ts
- **Muammo:** `apps/mobile/src/config/index.ts` da `CONFIG.API_URL` default qiymati `http://localhost:3003/api/v1` (port 3003). Backend haqiqatda `:3000` da ishlaydi. `apps/mobile/src/config/constants.ts` da esa to'g'ri `http://10.0.2.2:3000/api/v1` yozilgan. `client.ts` `CONFIG` dan import qiladi — bu `index.ts` dan keladi. Natija: iOS simulator yoki real qurilmada `EXPO_PUBLIC_API_URL` env o'zgaruvchisi set qilinmagan bo'lsa, barcha API chaqiruvlar noto'g'ri portga ketadi va 404/ECONNREFUSED qaytaradi.
- **Kutilgan:** `CONFIG.API_URL` default porti `3000` bo'lishi kerak.
- **Topildi:** Manual Code Review — 2026-05-05
- **Fix:** Applied 2026-05-05 — `'http://localhost:3003/api/v1'` → `'http://localhost:3000/api/v1'` in `apps/mobile/src/config/index.ts`

---

## T-423 | P1 | [IKKALASI] | PaymentsHistoryScreen — Backend `/sales/orders` `from`/`to` sana filtrini qabul qilmaydi

- **Sana:** 2026-05-05
- **Mas'ul:** Ibrat (backend fix) + Abdulaziz (mobile)
- **Fayl:** apps/mobile/src/screens/Finance/PaymentsHistoryScreen.tsx, apps/api/src/sales/sales.controller.ts, apps/api/src/sales/sales.service.ts
- **Muammo:** `PaymentsHistoryScreen` `salesApi.getOrders({ from, to, limit: 200 })` chaqiradi. Lekin backend `GET /sales/orders` controlleri faqat `page`, `limit`, `shiftId` parametrlarini qabul qiladi; `from` va `to` parametrlari yo'q. `sales.service.ts` `getOrders()` ham `where` shartida sana filtri yo'q. Natija: davr filtri tugmalari (bugun/7 kun/30 kun/90 kun) hech qanday ta'sir qilmaydi — har doim barcha orderlar qaytariladi.
- **Kutilgan:** Backend `from` va `to` query parametrlarini qabul qilib, `order.createdAt` bo'yicha filtrlashi kerak.
- **Topildi:** Manual Code Review — 2026-05-05

---

## T-424 | P2 | [MOBILE] | PaymentsHistoryScreen — To'lov usuli filtri (Naqd/Karta/Nasiya/Click/Payme) ishlamaydi

- **Sana:** 2026-05-05
- **Mas'ul:** Abdulaziz
- **Fayl:** apps/mobile/src/screens/Finance/PaymentsHistoryScreen.tsx
- **Muammo:** Ekranda 6 ta to'lov usuli filtri ko'rsatiladi (Barchasi, Naqd, Karta, Nasiya, Click, Payme). Tugmalar bosiladi va `method` state o'zgaradi, lekin `filtered` massivni hisoblashda bu filtr hech qachon qo'llanilmaydi — kodda `// method filter — placeholder: Order type has no paymentMethod field yet` deb izohlangan (175-177 qatorlar). Natija: barcha to'lov usuli tugmalari dekorativ, funksionalligi yo'q.
- **Kutilgan:** T-423 fix bo'lgandan so'ng `order.paymentMethod` bo'yicha filtr qo'llanishi kerak. Hozircha tugmalar disabled yoki "tez orada" label bilan ko'rsatilishi kerak.
- **Topildi:** Manual Code Review — 2026-05-05

---
