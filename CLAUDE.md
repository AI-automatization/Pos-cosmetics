# CLAUDE.md — [LOYIHA_NOMI]
# Claude CLI tomonidan avtomatik o'qiladi
# Barcha dasturchilar uchun UMUMIY qoidalar
# Template: VENTRA Claude CLI System v2

---

## 🤖 BIRINCHI QADAM (MAJBURIY)

**Har yangi terminal sessiyasida Claude quyidagini so'rashi SHART:**

```
Salom! Men [LOYIHA_NOMI] loyihasidaman.
Kimligingizni aniqlay olmayman — ismingiz kim?
  1. [ISM_1] ([ROL_1])
  2. [ISM_2] ([ROL_2])
  3. [ISM_3] ([ROL_3])
```

Javob kelgach → tegishli `CLAUDE_[ROL].md` faylni o'qib kontekstga kirish:
- [ISM_1] → `CLAUDE_BACKEND.md`
- [ISM_2] → `CLAUDE_FRONTEND.md`

> **Nima uchun?** Har dasturchi o'z zonasida ishlaydi. Noto'g'ri faylga teginish = merge conflict + production bug.

---

## 📁 LOYIHA

**[LOYIHA_NOMI]** — [qisqa tavsif, 1 qator]

| Layer | Tech | Port |
|-------|------|------|
| Backend API | NestJS + Prisma + PostgreSQL | 3000 |
| Worker | BullMQ + Redis 7 | — |
| Frontend | React 19 + Vite + Tailwind + [UI lib] | 5173 |
| Bot | grammY (Telegram) | — |

**Monorepo:** `pnpm workspaces` + `turbo`

```
apps/api/        → [ISM_1] zonasi (Backend)
apps/worker/     → [ISM_1] zonasi (Worker)
apps/bot/        → [ISM_1] zonasi (Bot)
apps/web/        → [ISM_2] zonasi (Frontend)
packages/types/  → UMUMIY — kelishib o'zgartirish
packages/utils/  → UMUMIY — kelishib o'zgartirish
```

---

## ✅ CLEAN CODE PRINSIPLARI

### SOLID

| Tamoyil | Qoida |
|---------|-------|
| **S** — Single Responsibility | Har fayl BIR vazifa. Controller = HTTP. Service = logika. Hook = state. |
| **O** — Open/Closed | Mavjud kodni o'zgartirma → kengaytir (strategy, decorator) |
| **L** — Liskov Substitution | Interface va'da qilganini bajar |
| **I** — Interface Segregation | Kichik, aniq interfeys. "God object" TAQIQLANGAN |
| **D** — Dependency Inversion | Service → Abstract interfeys ga bog'lanish |

### DRY + KISS
- Bir xil kod 2+ joyda → helper/hook/service ga chiqar
- Murakkab yechimdan oldin oddiy yechimni sinab ko'r
- Premature optimization qilma — ishlat → profil → optimize

### 🚫 TAQIQLANGAN NARSALAR
```
❌ any type — TypeScript strict mode
❌ console.log — Backend: NestJS Logger, Frontend: faqat DEV mode
❌ 400+ qatorli fayl — bo'lish kerak (SRP)
❌ Inline styles — Tailwind class ishlatish
❌ Magic numbers — const bilan nomlash: MAX_RETRIES = 3
❌ Nested try/catch — flat error handling
❌ Hardcoded secrets — .env ishlatish
❌ O'zga dasturchining papkasiga teginish
❌ packages/* ni kelishmasdan o'zgartirish
❌ main branch ga to'g'ridan-to'g'ri push
```

---

## 📋 TASK TRACKING TIZIMI (MAJBURIY)

### Fayllar

| Fayl | Vazifasi |
|------|----------|
| `docs/Tasks.md` | Barcha OCHIQ vazifalar — bug, error, feature, arxitektura, devops |
| `docs/Done.md` | Bajarilgan ishlar arxivi — sana + qisqa yechim |

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

| Daraja | Ma'nosi | Javob vaqti |
|--------|---------|-------------|
| **P0** | KRITIK — production buzilgan | Darhol |
| **P1** | MUHIM — funksional xatolik | 1 kun |
| **P2** | O'RTA — yaxshilash kerak | 3 kun |
| **P3** | PAST — "yaxshi bo'lardi" | Sprint rejasi |

### Kategoriyalar
```
[BACKEND]   — API, DB, Worker, Bot
[FRONTEND]  — UI, UX, Components, Hooks
[DEVOPS]    — Docker, CI/CD, Monitoring
[SECURITY]  — Auth, RBAC, Encryption
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

`packages/types/` yoki `packages/utils/` o'zgartirish kerak bo'lsa:

```
1. Chat/Telegram da ikkinchi dasturchiga xabar
2. Tasdiq olingach o'zgartir
3. Commit: "types: [nima qo'shildi] ([ism])"
4. Ikkinchi dasturchi DARHOL pull qiladi
```

---

## 🔧 GIT QOIDALARI

```bash
# Har kuni boshida:
git pull origin main

# Branch format:
[ism]/feat-[feature-name]
[ism]/fix-[bug-description]
[ism]/refactor-[what]
[ism]/chore-[what]

# Commit format (Conventional Commits — MAJBURIY):
feat(module): short description in English
fix(module): what was fixed
refactor(module): what changed
chore(module): config/tooling change
test(module): test added/fixed
docs(module): documentation update

# Branch Protection (main):
✓ PR orqali faqat (direct push TAQIQLANGAN)
✓ Kamida 1 review approval
✓ CI checks o'tishi shart
✓ Squash merge (toza tarix)
```

---

## 📝 LOGGING STANDARTLARI

### Backend (NestJS Logger)
```typescript
// console.log EMAS — NestJS Logger ishlatish
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
```

### Worker (Structured JSON)
```typescript
interface WorkerLogEntry {
  timestamp: string;
  queue: string;
  job_id: string;
  job_name: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  duration_ms?: number;
  error?: string;
  stack?: string;
}

// Har job uchun 3 ta log:
logJobStart(queue, jobId, jobName, data);       // ← boshlanish
logJobDone(queue, jobId, jobName, durationMs);  // ← muvaffaqiyat
logJobError(queue, jobId, jobName, err);        // ← xatolik
```

### API Request Logger (Interceptor)
```typescript
interface RequestLog {
  request_id: string;         // unique trace ID
  timestamp: string;
  method: string;             // GET, POST, etc.
  url: string;
  status: number;
  duration_ms: number;
  account_id: string | null;
  user_id: string | null;
  ip: string;
  is_slow: boolean;           // > 500ms
  error: string | null;
}

// Sensitive data: password, token, secret → [REDACTED]
```

### Frontend
```typescript
// Production da console.log TAQIQLANGAN
// Faqat development:
if (import.meta.env.DEV) {
  console.log('[debug]', data);
}
// Production: Sentry yoki error tracking
```

### Log fayl rotation
```
logs/
  api-2026-02-26.log       # kunlik rotation
  worker-2026-02-26.log
```

---

## 🔐 SECURITY CHECKLIST

```
✓ JWT: Access token (15min) + Refresh token (7d, httpOnly cookie)
✓ Password: bcrypt (12 rounds minimum)
✓ Input validation: class-validator (backend) + zod (frontend)
✓ SQL injection: Prisma ORM (parametrized queries)
✓ CORS: faqat ruxsat berilgan originlar
✓ Rate limit: NestJS Throttler (60 req/min default)
✓ Helmet: HTTP security headers
✓ Multi-tenant: account_id HAR query da filter
✓ Secrets: .env faylda, HECH QACHON kodda
✓ File upload: mimetype + size validation
```

---

## 🖥️ LOCAL DEVELOPMENT

```bash
# 1. Infra:
docker-compose up -d

# 2. Dependencies:
pnpm install

# 3. DB:
cd apps/api && npx prisma migrate dev && npx prisma generate

# 4. Dev servers:
pnpm --filter api dev
pnpm --filter web dev
pnpm --filter worker dev

# 5. Type check (push oldin):
pnpm -r exec tsc --noEmit
```

---

## 🔍 DEFINITIONS (loyiha-specific atamalar)

| Atama | Ma'nosi |
|-------|---------|
| `BigInt` | Prisma ID/balance — JSON serialize: `.toString()` MAJBURIY |
| `account_id` | Multi-tenant filter — HAR query da bo'lishi SHART |
| ... | ... (loyihaga qarab to'ldiring) |

---

## ⚠️ XAVFLI ZONALAR

```
❌ prisma migrate reset    — BARCHA ma'lumotlar yo'qoladi!
❌ main ga to'g'ridan push — faqat PR orqali!
❌ .env commit qilish      — .gitignore da bo'lishi SHART
❌ Boshqa zona fayllarini o'zgartirish
❌ Production DB ga qo'lda SQL yozish
❌ Secret/API key ni kodga yozish
```

---

## 📚 KEYIN O'QILADIGAN FAYLLAR

| Fayl | Kim uchun |
|------|-----------|
| `CLAUDE_BACKEND.md` | Backend dev |
| `CLAUDE_FRONTEND.md` | Frontend dev |
| `docs/Tasks.md` | Ochiq vazifalar |
| `docs/Done.md` | Bajarilgan ishlar |

---

*CLAUDE.md | [LOYIHA_NOMI] | v1.0*
