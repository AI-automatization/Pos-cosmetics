# CLAUDE.md — RAOS (Retail & Asset Operating System)

# Claude CLI tomonidan avtomatik o'qiladi

# Barcha dasturchilar uchun UMUMIY qoidalar

# RAOS v3.0 — Jamoa restrukturizatsiyasi (2026-03-23)

---

## 🤖 BIRINCHI QADAM (MAJBURIY)

**Har yangi terminal sessiyasida Claude quyidagini so'rashi SHART:**

```
Salom! Men RAOS loyihasidaman.
Kimligingizni aniqlay olmayman — ismingiz kim?
  1. Ibrat (Full-Stack — Web + Backend + DevOps)
  2. Abdulaziz (Mobile — React Native Android + iOS)
  3. AbdulazizYormatov (Team Lead — Arxitektura & Code Review)
  4. Bekzod (PM — Project Management & QA)
```

Javob kelgach → tegishli `CLAUDE_[ROL].md` faylni o'qib kontekstga kirish:

- Ibrat → `CLAUDE_FULLSTACK.md`
- Abdulaziz → `CLAUDE_MOBILE.md`
- AbdulazizYormatov → `CLAUDE_FULLSTACK.md` + `CLAUDE_MOBILE.md` (read-only review uchun)
- Bekzod → `CLAUDE_FULLSTACK.md` (read-only, project overview uchun)

### Jamoa Tuzilishi (2026-03-23 dan)

| Rol | Ism | Mas'uliyat | Zona |
|-----|-----|-----------|------|
| **Full-Stack Dev** | Ibrat | Backend API + Web Admin + POS + Bot + Worker + DevOps | apps/api, apps/web, apps/pos, apps/bot, apps/worker, docker/, prisma/ |
| **Mobile Dev** | Abdulaziz | Android + iOS (staff app + owner app) | apps/mobile, apps/mobile-owner |
| **Team Lead** | AbdulazizYormatov | Code review, arxitektura qarorlari, PR tasdiqlash | Barcha zonalar (read + review) |
| **PM** | Bekzod | Task prioritizatsiya, sprint planning, QA, yangi g'oyalar | docs/, CLAUDE*.md, test |
| **Warehouse Staff** | — | Inventar boshqaruvi (ombor) | apps/web/(warehouse)/, apps/api/src/inventory/ |

> **Nima uchun?** Har dasturchi o'z zonasida ishlaydi. Noto'g'ri faylga teginish = merge conflict + production bug.
> **Eslatma:** Polat 2026-03-23 dan loyihani tark etdi. Barcha backend vazifalari Ibrat ga o'tdi.

---

## 📦 LOYIHA

**RAOS** — Modular, multi-tenant, offline-first Business Operating System for Uzbekistan retail and mixed-asset investors.

### Target Segments

- Grocery retail
- Cosmetics / Fashion
- Electronics
- Pharmacy
- Restaurant / Fast Food
- Real estate rental owners
- Multi-branch investors

### Tech Stack

| Layer          | Tech                             | Port |
| -------------- | -------------------------------- | ---- |
| Backend API    | NestJS + Prisma + PostgreSQL     | 3000 |
| Worker         | BullMQ + Redis 7                 | —    |
| Frontend Admin | Next.js + Tailwind + React Query | 3001 |
| POS Desktop    | Tauri + SQLite (offline-first)   | —    |
| Mobile (Staff) | React Native (Android + iOS)     | —    |
| Mobile (Owner) | React Native (Android + iOS)     | —    |
| Bot            | grammY (Telegram)                | —    |
| Object Storage | S3-compatible (MinIO dev)        | 9000 |

### Monorepo: `pnpm workspaces` + `turbo`

```
apps/
  api/             → Ibrat zonasi (Backend API — NestJS)
  worker/          → Ibrat zonasi (BullMQ processors)
  bot/             → Ibrat zonasi (Telegram bot — grammY)
  web/             → Ibrat zonasi (Admin Panel — Next.js)
  pos/             → Ibrat zonasi (POS Desktop — Tauri)
  mobile/          → Abdulaziz zonasi (Staff App — React Native Android + iOS)
  mobile-owner/    → Abdulaziz zonasi (Owner App — React Native Android + iOS)
packages/
  types/           → UMUMIY — kelishib o'zgartirish
  utils/           → UMUMIY — kelishib o'zgartirish
  ui/              → UMUMIY — shared UI components
  sync-engine/     → UMUMIY — offline sync logic
prisma/            → Ibrat boshqaradi (schema + migrations)
docker/            → Ibrat boshqaradi (infra)
docs/              → Hammaga ochiq (Bekzod — PM sifatida boshqaradi)
```

---

## 🧠 ARXITEKTURA PRINSIPLARI

```
1. Modular Monolith (Phase 1–2) → Event-driven → Microservices (Phase 3+)
2. Ledger-first financial core — BARCHA pul harakati double-entry journal orqali
3. Multi-tenant isolation — tenant_id HAR business table da
4. Offline-first POS — Tauri + SQLite + Outbox pattern
5. API-first backend — mobile, web, POS hammasi bitta API dan foydalanadi
6. Event-driven internal — domain events orqali modul aro aloqa
7. Observability & audit by default — har action log qilinadi
8. Infrastructure-as-code ready — Docker + CI/CD
```

### Domain Modules (Bounded Contexts)

> ⚠️ Har modul o'z jadvallarini SO'RAYDI. Boshqa modul jadvaliga DIRECT QUERY TAQIQLANGAN.
> Modul aro aloqa: Service layer YOpKI Domain Events orqali.

| #   | Module              | Mas'uliyat                                                         |
| --- | ------------------- | ------------------------------------------------------------------ |
| 1   | **Identity & RBAC** | Multi-tenant, roles, branch permissions, audit log                 |
| 2   | **Catalog**         | Products, variants, units, categories, barcode, supplier           |
| 3   | **Inventory**       | Stock ledger (movement-based), warehouse, batch/expiry, transfer   |
| 4   | **Sales**           | Orders, order items, discounts, returns, shift management          |
| 5   | **Payments**        | Payment Intent, split payments, status, commission, reconciliation |
| 6   | **Ledger**          | Double-entry journal, immutable entries, reversals, snapshots      |
| 7   | **Tax & Fiscal**    | Rule-based tax, per-tenant config, fiscal adapter, receipt storage |
| 8   | **Real Estate**     | Property, rental contract, payment schedule, ROI, occupancy        |
| 9   | **AI / Analytics**  | Trend engine, dead stock, margin analysis, forecasting, alerts     |
| 10  | **Notifications**   | Telegram bot (birlamchi) + Email fallback — Eskiz SMS TAQIQLANGAN |

### Event-Driven Flow Example

```
SaleCreated →
  → DeductInventory
  → CalculateTax
  → GenerateLedgerEntries
  → TriggerFiscalReceipt
  → UpdateAnalytics
  → SendNotification

Events stored in event_log table (immutable).
```

---

## ✅ CLEAN CODE PRINSIPLARI

### SOLID

| Tamoyil                       | Qoida                                                                   |
| ----------------------------- | ----------------------------------------------------------------------- |
| **S** — Single Responsibility | Har fayl BIR vazifa. Controller = HTTP. Service = logika. Hook = state. |
| **O** — Open/Closed           | Mavjud kodni o'zgartirma → kengaytir (strategy, decorator, plugin)      |
| **L** — Liskov Substitution   | Interface va'da qilganini bajar                                         |
| **I** — Interface Segregation | Kichik, aniq interfeys. "God object" TAQIQLANGAN                        |
| **D** — Dependency Inversion  | Service → Abstract interfeys ga bog'lanish                              |

### DRY + KISS

- Bir xil kod 2+ joyda → helper/hook/service ga chiqar
- Murakkab yechimdan oldin oddiy yechimni sinab ko'r
- Premature optimization qilma — ishlat → profil → optimize

### 🚫 TAQIQLANGAN NARSALAR

```
❌ any type — TypeScript strict mode
❌ console.log — Backend: NestJS Logger, Frontend: faqat DEV mode
❌ 400+ qatorli fayl — bo'lish kerak (SRP)
❌ Inline styles — Web: Tailwind class ishlatish | Mobile: StyleSheet.create ishlatish
❌ Magic numbers — const bilan nomlash: MAX_RETRIES = 3
❌ Nested try/catch — flat error handling
❌ Hardcoded secrets — .env ishlatish
❌ O'zga dasturchining papkasiga teginish
❌ packages/* ni kelishmasdan o'zgartirish
❌ main branch ga to'g'ridan-to'g'ri push
❌ Boshqa modul jadvaliga direct query
❌ Ledger entry ni o'zgartirish/o'chirish (faqat reversal)
❌ Financial data uchun last-write-wins conflict resolution
❌ Production DB ga qo'lda SQL yozish
❌ Secret/API key ni kodga yozish
❌ Eskiz.uz SMS API — TAQIQLANGAN (2026-03-09 dan)
    → O'rniga: Telegram Bot API (birlamchi) + SMTP Email (zaxira)
    → Service: apps/api/src/notifications/notify.service.ts (NotifyService)
❌ Demo/mock data ni production ga deploy qilish — hooklar orqali tekshirish
❌ WAREHOUSE roli bilan finance, ledger, sales endpointlarga kirish
```

---

## 📋 TASK TRACKING TIZIMI (MAJBURIY)

### Fayllar

| Fayl            | Vazifasi                                                          |
| --------------- | ----------------------------------------------------------------- |
| `docs/Tasks.md` | Barcha OCHIQ vazifalar — bug, error, feature, arxitektura, devops |
| `docs/Done.md`  | Bajarilgan ishlar arxivi — sana + qisqa yechim                    |

### Format

```markdown
## T-001 | P0 | [BACKEND] | Sarlavha

- **Sana:** 2026-XX-XX
- **Mas'ul:** [ism]
- **Fayl:** apps/api/src/modul/fayl.ts
- **Muammo:** [nima bo'lyapti]
- **Kutilgan:** [nima bo'lishi kerak]
```

### Prioritet

| Daraja | Ma'nosi                      | Javob vaqti   |
| ------ | ---------------------------- | ------------- |
| **P0** | KRITIK — production buzilgan | Darhol        |
| **P1** | MUHIM — funksional xatolik   | 1 kun         |
| **P2** | O'RTA — yaxshilash kerak     | 3 kun         |
| **P3** | PAST — "yaxshi bo'lardi"     | Sprint rejasi |

### Kategoriyalar

```
[BACKEND]   — API, DB, Worker, Bot, Ledger, Fiscal, Payments
[FRONTEND]  — Admin Panel UI, POS Desktop UI
[MOBILE]    — React Native Android + iOS (staff app + owner app)
[DEVOPS]    — Docker, CI/CD, Monitoring, Infra
[SECURITY]  — Auth, RBAC, Encryption, Audit
[OFFLINE]   — Sync engine, conflict resolution, SQLite
[AI]        — Analytics pipeline, insights, forecasting
[IKKALASI]  — Shared types, API contract, migrations
```

### Qoidalar

```
1. Bug topilgan paytda DARHOL → docs/Tasks.md
2. Har sessiya boshida Tasks.md o'qib T-raqamni DAVOM ettirish
3. Takroriy task yaratmaslik — mavjudini yangilash
4. Fix bo'lgach: Tasks.md dan O'CHIRISH → Done.md ga KO'CHIRISH
5. Done.md da: sana + qisqa yechim + o'zgartirilgan fayl nomi
```

---

## 🔀 SHARED FILE PROTOCOL

`packages/types/`, `packages/utils/`, `packages/ui/`, `packages/sync-engine/` o'zgartirish kerak bo'lsa:

```
1. Chat/Telegram da boshqa dasturchi(lar)ga xabar
2. Tasdiq olingach o'zgartir
3. Commit: "types: [nima qo'shildi] ([ism])"
4. Boshqa dasturchilar DARHOL pull qiladi
```

---

## 🔧 GIT QOIDALARI

```bash
# Har kuni boshida:
git pull origin main

# Branch format:
ibrat/feat-[feature-name]
ibrat/fix-[bug-description]
abdulaziz/feat-[feature-name]
abdulaziz/fix-[bug-description]

# Commit format (Conventional Commits — MAJBURIY):
feat(module): short description in English
fix(module): what was fixed
refactor(module): what changed
chore(module): config/tooling change
test(module): test added/fixed
docs(module): documentation update

# Modul nomlari commit da:
# identity, catalog, inventory, sales, payments, ledger,
# tax, realestate, ai, pos, admin, mobile, sync, infra

# Branch Protection (main):
✓ PR orqali faqat (direct push TAQIQLANGAN)
✓ Kamida 1 review approval
✓ CI checks o'tishi shart
✓ Squash merge (toza tarix)
```

---

## 📝 LOGGING STANDARTLARI

### Backend (Winston-backed NestJS Logger)

```typescript
// NestJS Logger — avtomatik Winston orqali file ga yozadi
// requestId, tenantId, userId avtomatik qo'shiladi (AsyncLocalStorage)
import { Logger } from '@nestjs/common';

@Injectable()
export class MyService {
  private readonly logger = new Logger(MyService.name);

  async process() {
    this.logger.log('Started', { context: 'data' });
    this.logger.warn('Unusual state', { detail: '...' });
    this.logger.error('Failed', { error: err.message, stack: err.stack });
  }
}
// console.log TAQIQLANGAN → faqat NestJS Logger ishlatish
```

### Worker (Structured JSON)

```typescript
// Har job uchun 3 ta log:
logJobStart(queue, jobId, jobName, data);
logJobDone(queue, jobId, jobName, durationMs);
logJobError(queue, jobId, jobName, err);
```

### API Request Logger (Interceptor — avtomatik)

```
Har request avtomatik log qilinadi:
- requestId (UUID, X-Request-Id header)
- tenantId, userId (JWT dan)
- method, url, status, durationMs, ip
- isSlow (> 500ms → warn)
- Sensitive data avtomatik [REDACTED]: password, token, secret, authorization
```

### Frontend & Mobile — Client Error Reporting

```typescript
// Production da console.log TAQIQLANGAN
// Error Boundary + window.onerror → POST /api/v1/logs/client-error
// API interceptor da 5xx errorlarni avtomatik yuborish

// Client error endpoint:
// POST /api/v1/logs/client-error (public, rate-limited 30/min)
// Body: { source, error, stack?, url?, userAgent?, tenantId?, userId? }
```

### Log fayllar

```
logs/
  api-YYYY-MM-DD.log       ← Barcha API requestlar (JSON, daily rotation)
  errors-YYYY-MM-DD.log    ← Faqat 5xx errorlar (JSON)
  client-YYYY-MM-DD.log    ← Frontend/Mobile/POS errorlar (JSON)
```

Rotation: kunlik, max 20MB, 14 kun saqlash.

### Claude Integration

```
Har sessiya boshida:
1. logs/ papkani tekshir
2. errors-*.log va client-*.log dan so'nggi errorlarni o'qi
3. Takroriy/kritik errorlarni → docs/Tasks.md ga P0/P1 task sifatida yoz
```

---

## 🤖 AGENTLAR TIZIMI

RAOS da Claude Code subagentlari mavjud — `.claude/agents/` papkasida.

**Sessiya boshida agent ishlatish tartibi:**

```
1. VS Code ochildi
   → "session-start agentini ishga tushir"

2. P0 task ko'rsatdi (masalan type xatoliklar)
   → "type-fixer agentini ishga tushir"

3. Merge conflict ko'rsatdi
   → "conflict-resolver agentini ishga tushir"

4. Tasks.md eskirgan (git da commit bor, Tasks.md da hali ochiq)
   → "tasks-done-sync agentini ishga tushir"

5. Yangi feature boshlash
   → "orchestrator agentini ishga tushir"
   → "component-builder: [vazifa]"

6. Commit qilishdan oldin
   → "frontend-reviewer: [fayl]ni review qil"
```

**Barcha agentlar:** `session-start`, `orchestrator`, `conflict-resolver`,
`type-fixer`, `tasks-done-sync`, `component-builder`, `api-integrator`,
`frontend-reviewer`, `type-checker`

To'liq qo'llanma: `docs/AGENTS_GUIDE.md`

---

## 🔐 SECURITY CHECKLIST

```
✓ JWT: Access token (15min) + Refresh token (7d, httpOnly cookie)
✓ Password: bcrypt (12 rounds minimum)
✓ Input validation: class-validator (backend) + zod (frontend/mobile)
✓ SQL injection: Prisma ORM (parametrized queries)
✓ CORS: faqat ruxsat berilgan originlar
✓ Rate limit: NestJS Throttler (60 req/min default)
✓ Helmet: HTTP security headers
✓ Multi-tenant: tenant_id HAR query da filter
✓ Secrets: .env faylda, HECH QACHON kodda
✓ File upload: mimetype + size validation
✓ Ledger: immutable entries — faqat reversal orqali tuzatish
✓ Audit log: barcha CRUD operatsiyalar log qilinadi
✓ Fiscal data: snapshot saqlanadi, o'zgartirib bo'lmaydi
✓ Encrypted backups: kunlik avtomatik backup
```

---

## 💳 PAYMENT ARCHITECTURE

```
Plugin-based architecture:
  - Cash
  - Terminal (bank terminal)
  - Click
  - Payme
  - Bank transfer

Payment Intent Lifecycle:
  Created → Confirmed → Settled → (Failed | Reversed)

Reconciliation: cron job (kunlik tekshiruv)
Split payments: bitta order — bir nechta payment method
Commission tracking: har payment provider uchun alohida
```

---

## 🧾 FISCAL LAYER

```
- Fiscal adapter service (provider-agnostic)
- Async receipt sending (queue orqali)
- Retry queue (3 attempts, exponential backoff)
- Receipt snapshot store (o'zgartirib bo'lmaydi)
- Fiscal ID & QR code storage
- ⚠️ HECH QACHON sale ni block qilma fiscal fail bo'lsa → pending + retry
```

---

## 🌐 OFFLINE-FIRST ARCHITECTURE

```
POS Desktop (Tauri + SQLite):
  1. Transaction locally saqlanadi
  2. Outbox table ga append qilinadi
  3. Background sync worker serverga yuboradi
  4. Conflict resolution strategy:
     - Financial data: event-sourcing (HECH QACHON last-write-wins)
     - Non-financial data: last-write-wins
     - Idempotency keys: har transaction uchun unique key
  5. Offline works for: Sales, Inventory deduction, Shift, Local print
```

---

## 🖥️ LOCAL DEVELOPMENT

```bash
# 1. Infra:
docker-compose up -d   # PostgreSQL, Redis, MinIO

# 2. Dependencies:
pnpm install

# 3. DB:
cd apps/api && npx prisma migrate dev && npx prisma generate

# 4. Dev servers:
pnpm --filter api dev        # Backend  → :3000
pnpm --filter web dev        # Admin    → :3001
pnpm --filter worker dev     # Worker
pnpm --filter bot dev        # Telegram bot
pnpm --filter pos dev        # POS Desktop (Tauri)
pnpm --filter mobile start         # React Native Staff App
pnpm --filter mobile-owner start   # React Native Owner App
# iOS uchun (birinchi marta):
cd apps/mobile && npx pod-install   # CocoaPods install
pnpm --filter mobile run ios        # iOS simulator

# 5. Type check (push oldin):
pnpm -r exec tsc --noEmit
```

---

## 🔍 DEFINITIONS (RAOS-specific atamalar)

| Atama             | Ma'nosi                                                           |
| ----------------- | ----------------------------------------------------------------- |
| `tenant_id`       | Multi-tenant identifier — HAR business table da bo'lishi SHART    |
| `BigInt`          | Prisma ID/balance — JSON serialize: `.toString()` MAJBURIY        |
| `Ledger Entry`    | Double-entry journal yozuvi — IMMUTABLE, faqat reversal           |
| `Payment Intent`  | To'lov niyati — lifecycle: created → confirmed → settled          |
| `Fiscal Receipt`  | Soliq cheki — snapshot saqlanadi, o'zgartirib BO'LMAYDI           |
| `Outbox`          | Offline sync pattern — local DB dan serverga yuborish uchun queue |
| `Idempotency Key` | Takroriy operatsiyani oldini olish uchun unique kalit             |
| `Domain Event`    | Modul ichki hodisasi — masalan: SaleCreated, PaymentSettled       |
| `Stock Movement`  | Inventar harakati — debit/credit based, snapshot emas             |

---

## ⚠️ XAVFLI ZONALAR

```
❌ prisma migrate reset        — BARCHA ma'lumotlar yo'qoladi!
❌ main ga to'g'ridan push     — faqat PR orqali!
❌ .env commit qilish          — .gitignore da bo'lishi SHART
❌ Boshqa zona fayllarini o'zgartirish
❌ Production DB ga qo'lda SQL yozish
❌ Secret/API key ni kodga yozish
❌ Ledger entry ni UPDATE/DELETE qilish
❌ Fiscal receipt ni o'zgartirish
❌ Financial data da last-write-wins
❌ Boshqa modul jadvaliga direct query
❌ Payment provider real keys dev da
```

---

## 🚀 ROADMAP

### Phase 1 (6 months)

- Grocery POS (offline-first)
- Identity & RBAC
- Catalog + Inventory
- Sales + Payments
- Ledger (double-entry)
- Tax & Fiscal adapter
- Telegram alerts
- Admin Panel (basic)

### Phase 2 (6–12 months)

- Multi-vertical support
- Holding dashboard
- AI basic analytics
- Real estate module
- Mobile app (Android + iOS)

### Phase 3 (12–24 months)

- Marketplace procurement
- Bank integrations
- Lending layer
- Advanced AI forecasting

---

## 📚 KEYIN O'QILADIGAN FAYLLAR

| Fayl                        | Kim uchun                                               |
| --------------------------- | ------------------------------------------------------- |
| `CLAUDE_FULLSTACK.md`       | Ibrat (Full-Stack — Web + Backend + DevOps)             |
| `CLAUDE_MOBILE.md`          | Abdulaziz (Mobile — Android + iOS)                      |
| `docs/AGENTS_GUIDE.md`      | Hammaga — Claude agentlari to'liq qo'llanmasi           |
| `docs/Tasks.md`             | Ochiq vazifalar (Bekzod — PM boshqaradi)                |
| `docs/Done.md`              | Bajarilgan ishlar                                       |

---

_CLAUDE.md | RAOS | v3.0 | 2026-03-24 — Mobile iOS qo'shildi, mobile-owner aniqlashtirildi_
