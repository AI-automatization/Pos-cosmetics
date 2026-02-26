# CLAUDE_BACKEND.md — Backend Engineer Guide
# NestJS · Prisma · BullMQ · PostgreSQL · Redis
# Claude CLI bu faylni Backend dasturchi tanlanganda o'qiydi

---

## 👋 ZONA

```
apps/api/        → Backend API (NestJS)
apps/worker/     → BullMQ processors
apps/bot/        → Telegram bot (grammY)
docker-compose.yml → Infra config
```

**🚫 TEGINMA:** `apps/web/` — bu Frontend zonasi.

---

## 🏗️ ARXITEKTURA QOIDALARI

### 1. NestJS Modul Tuzilishi

```typescript
// HAR modul o'z papkasida:
apps/api/src/
  [module]/
    [module].module.ts        // imports, providers, exports
    [module].controller.ts    // HTTP layer FAQAT — biznes logika YO'Q
    [module].service.ts       // biznes logika — DB, queue, external API
    dto/
      create-[entity].dto.ts  // input validation (class-validator)
    interfaces/
      [entity].interface.ts   // TypeScript interfaces
```

```typescript
// ❌ NOTO'G'RI — Controller ichida DB chaqiruvi
@Get(':id')
async get(@Param('id') id: string) {
  return this.prisma.entity.findUnique({ where: { id } });
}

// ✅ TO'G'RI — Service orqali, account_id filter bilan
@Get(':id')
async get(
  @Param('id') id: string,
  @CurrentUser('account_id') accountId: string,
) {
  return this.service.getById(id, accountId);
}
```

### 2. `any` TAQIQLANGAN — TypeScript Strict

```typescript
// ❌
async function process(data: any) { return data.price; }

// ✅
interface ProcessInput {
  readonly price: number;
  readonly currency: string;
}
function process(input: ProcessInput): ProcessResult { ... }
```

### 3. Error Handling — NestJS Exceptions

```typescript
// ❌ Xato yutiladi
try { await api.call(); } catch (e) { console.log(e); }

// ✅ Logger + proper exception
try {
  return await externalApi.call(query);
} catch (error: unknown) {
  const msg = error instanceof Error ? error.message : 'Unknown';
  this.logger.error(`API failed: ${msg}`, { query });
  throw new InternalServerErrorException('Service unavailable');
}
```

### 4. Multi-Tenant — account_id HAR SO'ROVDA

```typescript
// ❌ Data leak!
async getAll() {
  return this.prisma.product.findMany(); // BARCHA accountlar!
}

// ✅ account_id filter
async getAll(accountId: string) {
  return this.prisma.product.findMany({
    where: { account_id: accountId },
  });
}
```

### 5. BigInt/Decimal Serialization

```typescript
// Global yechim — main.ts da:
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

// Yoki har joyda:
return { id: entity.id.toString(), balance: Number(account.balance) };
```

### 6. N+1 Query Prevention

```typescript
// ❌ N+1
const users = await prisma.user.findMany();
for (const u of users) {
  const orders = await prisma.order.findMany({ where: { userId: u.id } });
}

// ✅ Include
const users = await prisma.user.findMany({
  include: { orders: { take: 10 } },
});
```

### 7. BullMQ Job Pattern

```typescript
// Service — job yaratish:
async startProcessing(accountId: string, data: Input) {
  return this.queue.add('process', { account_id: accountId, ...data }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { age: 86400 },   // 24h
    removeOnFail: { age: 604800 },      // 7d
  });
}

// Worker — processor:
async process(job: Job<ProcessData>) {
  const start = Date.now();
  logJobStart(QUEUE, job.id!, job.name, job.data);
  try {
    const result = await this.doWork(job.data);
    logJobDone(QUEUE, job.id!, job.name, Date.now() - start);
    return result;
  } catch (error) {
    logJobError(QUEUE, job.id!, job.name, error, Date.now() - start);
    throw error; // BullMQ retry qiladi
  }
}
```

---

## 🔒 GUARDS TARTIBI

```
Request → Middleware → Guard → Interceptor → Controller → Service

Guards ketma-ketligi:
  1. JwtAuthGuard    — token tekshirish
  2. RolesGuard      — rol (ADMIN, USER)
  3. BillingGuard    — to'lov holati
  4. ThrottlerGuard  — rate limiting
```

---

## 🧪 TEST

```typescript
// Unit test:
describe('BillingService', () => {
  it('should charge correctly', async () => {
    const result = await service.charge(accountId, 50000);
    expect(result.balance_after).toBe(initialBalance - 50000);
  });
});

// Integration test:
describe('POST /api/v1/products/:id/track', () => {
  it('returns 201 with valid auth', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/products/123/track')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
  });
});
```

---

## 📊 PRISMA QOIDALARI

```bash
npx prisma migrate dev --name [name]  # Migration yaratish
npx prisma generate                    # Client generate
npx prisma validate                    # Schema tekshirish
npx prisma db push                     # Dev — migration o'rniga

# ❌ HECH QACHON production da:
npx prisma migrate reset               # BARCHA DATA YO'QOLADI!
```

---

## 📝 LOGGING

```typescript
// NestJS Logger — console.log EMAS:
private readonly logger = new Logger(MyService.name);

this.logger.log('Operation started', { accountId, productId });
this.logger.warn('Rate limit approaching', { remaining: 5 });
this.logger.error('External API failed', { error: err.message, stack: err.stack });

// Worker: Structured JSON (logJobStart/logJobDone/logJobError)
// Fayl rotation: logs/api-YYYY-MM-DD.log
// Sensitive data: password, token, secret → [REDACTED]
```

---

*CLAUDE_BACKEND.md | [LOYIHA_NOMI] | v1.0*
