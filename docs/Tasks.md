# RAOS — OCHIQ VAZIFALAR (Kosmetika POS MVP)
# Yangilangan: 2026-04-19 (T-056 yopildi)
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

## T-220 | P0 | [BACKEND] | Owner Panel — barcha endpointlar Postman/Swagger test

- **Sana:** 2026-03-12
- **Mas'ul:** Ibrat
- **Fayl:** Swagger: `http://localhost:3000/api/v1/docs`
- **Vazifa:** `apps/mobile-owner` panel uchun kerakli barcha endpointlar ishlashini tasdiqlash:
  ```
  □ GET /analytics/revenue          → 4 ta metric
  □ GET /analytics/sales-trend      → 30 kun grafik
  □ GET /analytics/branch-comparison→ filiallar
  □ GET /analytics/top-products     → top 5
  □ GET /analytics/stock-value      → byBranch
  □ GET /inventory/stock            → pagination, status filter
  □ GET /shifts/:id                 → paymentBreakdown bilan
  □ GET /debts/summary              → totalDebt, overdueDebt
  □ GET /debts/aging-report         → 4 bucket
  □ GET /employees/performance
  □ GET /alerts
  □ GET /system/health
  ```

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P1 (MUHIM)
# ══════════════════════════════════════════════════════════════

---

## T-348 | P1 | [DEVOPS] | ibrat/feat-backend-updates — merge yoki close qaror

- **Sana:** 2026-04-15 | **Yangilangan:** 2026-04-20
- **Mas'ul:** Ibrat
- **Holat:** `ibrat/feat-frontend-updates` va `ibrat/chore-tasks-sync` — O'CHIRILDI ✅
- **Qolgan:** `ibrat/feat-backend-updates` — 2 ta nesmerj commit:
  - `feat(api): backend updates — inventory approve/reject, employees, nasiya, tasks, notifications`
  - `fix(lint): remove unused LoadingSkeleton import in promotions/page.tsx`
- **Qaror kerak:** Bu commitlar main da allaqachon boshqa commit orqali kiritilganmi?
  Agar ha → `git push origin --delete ibrat/feat-backend-updates`
  Agar yo'q → main ga merge qilish kerak

---

# ══════════════════════════════════════════════════════════════
# OCHIQ VAZIFALAR — P2 (O'RTA, MVP dan keyin)
# ══════════════════════════════════════════════════════════════

---

## T-040 | P2 | [BACKEND] | Telegram bot — Low stock, shift close, refund alertlar

- **Sana:** 2026-02-26
- **Mas'ul:** Ibrat
- **Fayl:** `apps/bot/`
- **Vazifa:** Triggerlar: low stock alert, shift yopilish hisoboti, refund > threshold, expired stock
  `/report` command — bugungi savdo summary
- **Kutilgan:** Admin Telegram dan alertlar oladi

---

## T-096 | P2 | [BACKEND] | Tester/sample tracking — Ochilgan tester hisobi

- **Sana:** 2026-02-26
- **Mas'ul:** Ibrat
- **Fayl:** `apps/api/src/inventory/`
- **Vazifa:** `stock_movement` type = TESTER. Tester cost expense sifatida.
  `GET /inventory/testers` — qaysi productlardan tester ochilgan.
- **Kutilgan:** Tester xarajati to'g'ri hisoblanadi

---

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

## T-118 | P3 | [BACKEND] | 1C export — Buxgalteriya integratsiya
- **Sana:** 2026-02-26
- **Vazifa:** Savdo/xarid datalarini 1C-compatible XML formatda export.

## T-119 | P3 | [BACKEND] | Marketplace sync — Uzum/Sello
- **Sana:** 2026-02-26
- **Vazifa:** Catalog sync, stock sync, order import. Omnichannel.

## T-120 | P3 | [BACKEND] | AI forecasting — Seasonal demand prediction
- **Sana:** 2026-02-26
- **Vazifa:** Kosmetika seasonal (sunscreen yoz, moisturizer qish, gift sets 8-Mart).
  O'tgan yil datasi bo'yicha buyurtma tavsiya.

## T-121 | P3 | [BACKEND] | Google Sheets export — Automated daily data
- **Sana:** 2026-02-26
- **Vazifa:** Kunlik savdo data → linked Google Sheet. Scheduled cron.
