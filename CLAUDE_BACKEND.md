# CLAUDE_BACKEND.md — RAOS Backend & DevOps Engineer Guide
# NestJS · Prisma · BullMQ · PostgreSQL · Redis · Tauri · Docker
# Claude CLI bu faylni Polat tanlanganda o'qiydi

---

## 👋 ZONA

```
apps/api/           → Backend API (NestJS)
apps/worker/        → BullMQ processors
apps/bot/           → Telegram bot (grammY)
packages/types/     → Shared types (kelishib o'zgartirish)
packages/utils/     → Shared utilities (kelishib o'zgartirish)
packages/sync-engine/ → Offline sync logic
prisma/             → Database schema + migrations
docker/             → Docker configs
docker-compose.yml  → Infra config
```

**🚫 TEGINMA:**
- `apps/web/` — AbdulazizYormatov zonasi (Admin Panel + Desktop)
- `apps/pos/` — AbdulazizYormatov zonasi (POS Desktop UI)
- `apps/mobile/` — Ibrat + Abdulaziz zonasi (React Native Android + IOS)

---

## 🏗️ NESTJS MODUL TUZILISHI

### Har modul o'z papkasida

```
apps/api/src/
  identity/
    identity.module.ts
    identity.controller.ts
    identity.service.ts
    dto/
      create-user.dto.ts
      login.dto.ts
    interfaces/
      user.interface.ts
    guards/
      roles.guard.ts
  catalog/
    catalog.module.ts
    catalog.controller.ts
    catalog.service.ts
    dto/
      create-product.dto.ts
      update-product.dto.ts
    interfaces/
      product.interface.ts
  inventory/
    inventory.module.ts
    inventory.controller.ts
    inventory.service.ts
    dto/
      stock-movement.dto.ts
    interfaces/
      stock.interface.ts
  sales/
    sales.module.ts
    sales.controller.ts
    sales.service.ts
    dto/
      create-order.dto.ts
      return-order.dto.ts
    interfaces/
      order.interface.ts
  payments/
    payments.module.ts
    payments.controller.ts
    payments.service.ts
    providers/                    ← Plugin-based payment providers
      cash.provider.ts
      click.provider.ts
      payme.provider.ts
      terminal.provider.ts
      payment-provider.interface.ts
    dto/
      create-payment-intent.dto.ts
    interfaces/
      payment.interface.ts
  ledger/
    ledger.module.ts
    ledger.service.ts            ← Controller YO'Q — faqat internal
    interfaces/
      journal-entry.interface.ts
  tax/
    tax.module.ts
    tax.service.ts
    fiscal/
      fiscal-adapter.interface.ts
      fiscal-adapter.provider.ts
    dto/
      tax-rule.dto.ts
  realestate/
    realestate.module.ts
    realestate.controller.ts
    realestate.service.ts
    dto/
      create-property.dto.ts
      create-contract.dto.ts
  ai/
    ai.module.ts
    ai.service.ts
    engines/
      trend.engine.ts
      deadstock.engine.ts
      margin.engine.ts
      forecast.engine.ts
  notifications/
    notifications.module.ts
    notifications.service.ts
    channels/
      telegram.channel.ts
      sms.channel.ts
  common/
    decorators/
      current-user.decorator.ts
      tenant.decorator.ts
    guards/
      jwt-auth.guard.ts
      roles.guard.ts
      billing.guard.ts
      throttler.guard.ts
    interceptors/
      request-logger.interceptor.ts
      bigint-serializer.interceptor.ts
    filters/
      global-exception.filter.ts
    pipes/
      validation.pipe.ts
  events/
    event-bus.service.ts
    event-log.service.ts
    events.interface.ts
```

---

## 🔒 GUARDS TARTIBI

```
Request → Middleware → Guard → Interceptor → Controller → Service

Guards ketma-ketligi:
  1. JwtAuthGuard    — token tekshirish
  2. RolesGuard      — rol (ADMIN, MANAGER, CASHIER, VIEWER)
  3. TenantGuard     — tenant_id extraction & validation
  4. BillingGuard    — to'lov holati (subscription active?)
  5. ThrottlerGuard  — rate limiting
```

---

## 📐 ARXITEKTURA QOIDALARI

### 1. Controller = HTTP ONLY — biznes logika YO'Q

```typescript
// ❌ NOTO'G'RI — Controller ichida DB chaqiruvi
@Get(':id')
async get(@Param('id') id: string) {
  return this.prisma.product.findUnique({ where: { id } });
}

// ✅ TO'G'RI — Service orqali, tenant_id filter bilan
@Get(':id')
async get(
  @Param('id') id: string,
  @CurrentTenant() tenantId: string,
) {
  return this.catalogService.getById(id, tenantId);
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

### 3. Multi-Tenant — tenant_id HAR SO'ROVDA

```typescript
// ❌ Data leak!
async getAll() {
  return this.prisma.product.findMany();
}

// ✅ tenant_id filter
async getAll(tenantId: string) {
  return this.prisma.product.findMany({
    where: { tenant_id: tenantId },
  });
}

// ✅ Custom decorator
@Get()
async getAll(@CurrentTenant() tenantId: string) {
  return this.catalogService.getAll(tenantId);
}
```

### 4. Error Handling — NestJS Exceptions

```typescript
// ❌ Xato yutiladi
try { await api.call(); } catch (e) { console.log(e); }

// ✅ Logger + proper exception
try {
  return await externalApi.call(query);
} catch (error: unknown) {
  const msg = error instanceof Error ? error.message : 'Unknown';
  this.logger.error(`External API failed: ${msg}`, { query, tenantId });
  throw new InternalServerErrorException('Service temporarily unavailable');
}
```

### 5. Domain Events — Modul aro aloqa

```typescript
// ❌ Modul A dan modul B jadvaliga direct query
async createSale(data: CreateSaleDto, tenantId: string) {
  const order = await this.prisma.order.create({ ... });
  // ❌ Inventory jadvaliga to'g'ridan teginish!
  await this.prisma.stockMovement.create({ ... });
}

// ✅ Event orqali
async createSale(data: CreateSaleDto, tenantId: string) {
  const order = await this.prisma.order.create({ ... });

  await this.eventBus.emit('sale.created', {
    orderId: order.id,
    tenantId,
    items: data.items,
    timestamp: new Date(),
  });

  // Event log ga yozish (immutable)
  await this.eventLog.record('sale.created', order.id, tenantId);

  return order;
}

// Inventory module — event listener:
@OnEvent('sale.created')
async handleSaleCreated(event: SaleCreatedEvent) {
  for (const item of event.items) {
    await this.inventoryService.deductStock(
      item.productId,
      item.quantity,
      event.tenantId,
      event.orderId, // reference
    );
  }
}
```

### 6. BigInt/Decimal Serialization

```typescript
// Global interceptor — main.ts da:
// BigIntSerializerInterceptor ishlatish

// Yoki har joyda manual:
return {
  id: entity.id.toString(),
  balance: Number(account.balance),
};
```

### 7. N+1 Query Prevention

```typescript
// ❌ N+1
const orders = await prisma.order.findMany({ where: { tenant_id: tenantId } });
for (const o of orders) {
  const items = await prisma.orderItem.findMany({ where: { orderId: o.id } });
}

// ✅ Include
const orders = await prisma.order.findMany({
  where: { tenant_id: tenantId },
  include: {
    items: { include: { product: true } },
    payments: true,
  },
});
```

---

## 💰 LEDGER MODULE (KRITIK)

### Double-Entry Journal — IMMUTABLE

```typescript
// Har financial transaction uchun:
interface JournalEntry {
  id: string;
  tenant_id: string;
  reference_type: 'SALE' | 'PAYMENT' | 'REFUND' | 'TRANSFER' | 'ADJUSTMENT';
  reference_id: string;
  entries: LedgerLine[];
  created_at: Date;
  // ⚠️ updated_at YO'Q — immutable!
}

interface LedgerLine {
  account_code: string;    // CoA account
  debit: number;           // 0 yoki summa
  credit: number;          // 0 yoki summa
  currency: string;
  description: string;
}

// ⚠️ QOIDALAR:
// 1. sum(debit) === sum(credit) — HAR DOIM
// 2. UPDATE/DELETE TAQIQLANGAN — faqat REVERSAL entry
// 3. Har entry snapshot bilan saqlanadi
// 4. Branch consolidation — branch_id orqali
```

```typescript
// ❌ HECH QACHON
await prisma.journalEntry.update({ ... });
await prisma.journalEntry.delete({ ... });

// ✅ Xato tuzatish — REVERSAL entry
async reverseEntry(entryId: string, tenantId: string, reason: string) {
  const original = await this.getEntry(entryId, tenantId);

  // Teskari entry yaratish
  const reversal = await this.createEntry({
    tenant_id: tenantId,
    reference_type: 'REVERSAL',
    reference_id: original.id,
    entries: original.entries.map(line => ({
      account_code: line.account_code,
      debit: line.credit,      // teskari
      credit: line.debit,      // teskari
      currency: line.currency,
      description: `REVERSAL: ${reason}`,
    })),
  });

  return reversal;
}
```

---

## 💳 PAYMENT PROVIDERS (Plugin Architecture)

```typescript
// Interface — barcha providerlar implement qiladi:
interface PaymentProvider {
  readonly name: string;
  createIntent(amount: number, currency: string, metadata: PaymentMeta): Promise<PaymentIntentResult>;
  confirmPayment(intentId: string): Promise<PaymentConfirmResult>;
  refund(intentId: string, amount?: number): Promise<RefundResult>;
  getStatus(intentId: string): Promise<PaymentStatus>;
}

// Payment Intent Lifecycle:
// CREATED → CONFIRMED → SETTLED
//                     → FAILED
//                     → REVERSED

// Factory pattern:
@Injectable()
export class PaymentProviderFactory {
  private providers = new Map<string, PaymentProvider>();

  register(provider: PaymentProvider) {
    this.providers.set(provider.name, provider);
  }

  get(name: string): PaymentProvider {
    const provider = this.providers.get(name);
    if (!provider) throw new BadRequestException(`Unknown payment provider: ${name}`);
    return provider;
  }
}

// Split payment:
async processSplitPayment(orderId: string, payments: SplitPaymentDto[]) {
  const results = [];
  for (const p of payments) {
    const provider = this.factory.get(p.provider);
    const intent = await provider.createIntent(p.amount, p.currency, { orderId });
    results.push(intent);
  }
  return results;
}
```

---

## 🧾 FISCAL ADAPTER

```typescript
// Provider-agnostic interface:
interface FiscalAdapter {
  sendReceipt(receipt: FiscalReceiptData): Promise<FiscalResult>;
  getStatus(receiptId: string): Promise<FiscalStatus>;
  cancelReceipt(receiptId: string): Promise<FiscalCancelResult>;
}

// ⚠️ QOIDALAR:
// 1. Sale ni HECH QACHON block qilma fiscal fail bo'lsa
// 2. Fail → queue ga qo'sh → retry (3 attempts, exponential backoff)
// 3. Receipt snapshot MAJBURIY saqlanadi (o'zgartirib bo'lmaydi)
// 4. Fiscal ID va QR code saqlanadi

// Queue orqali:
async sendFiscalReceipt(saleId: string, tenantId: string) {
  await this.fiscalQueue.add('send-receipt', {
    saleId,
    tenantId,
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  });
}
```

---

## 📦 INVENTORY — Stock Movement Model

```typescript
// Event-sourcing approach — snapshot EMAS, movement-based:
interface StockMovement {
  id: string;
  tenant_id: string;
  product_id: string;
  warehouse_id: string;
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT' | 'RETURN';
  quantity: number;          // always positive
  reference_type: string;    // 'SALE', 'PURCHASE', 'MANUAL', etc.
  reference_id: string;
  batch_number?: string;
  expiry_date?: Date;
  created_at: Date;
  // ⚠️ updated_at YO'Q — immutable movement!
}

// Current stock = sum of all movements:
async getCurrentStock(productId: string, warehouseId: string, tenantId: string): Promise<number> {
  const result = await this.prisma.stockMovement.aggregate({
    where: {
      tenant_id: tenantId,
      product_id: productId,
      warehouse_id: warehouseId,
    },
    _sum: {
      quantity: true, // IN = +, OUT = -
    },
  });
  return result._sum.quantity ?? 0;
}
```

---

## 🔄 BULLMQ JOB PATTERNS

```typescript
// Service — job yaratish:
async startProcessing(tenantId: string, data: Input) {
  return this.queue.add('process', {
    tenant_id: tenantId,
    ...data,
    idempotency_key: generateIdempotencyKey(tenantId, data),
  }, {
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

  // Idempotency check
  const exists = await this.checkIdempotency(job.data.idempotency_key);
  if (exists) {
    this.logger.warn(`Duplicate job skipped: ${job.data.idempotency_key}`);
    return;
  }

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

### Queue ro'yxati

```
fiscal-receipt     → Fiscal cheklarni yuborish
payment-reconcile  → Payment tekshiruv (kunlik)
sync-inbound       → POS dan kelgan offline data
analytics-compute  → AI/Analytics hisoblash
notification       → Telegram/SMS yuborish
backup             → Database backup
report-generate    → Hisobot generatsiya
```

---

## 🌐 OFFLINE SYNC (Backend qismi)

```typescript
// POS dan kelgan outbox data ni qabul qilish:
@Post('sync/inbound')
async receiveSync(
  @CurrentTenant() tenantId: string,
  @Body() syncBatch: SyncBatchDto,
) {
  // 1. Idempotency key tekshirish
  // 2. Event ordering tekshirish (sequence number)
  // 3. Conflict detection
  // 4. Apply changes
  // 5. Return acknowledgment + server changes

  return this.syncService.processBatch(tenantId, syncBatch);
}

// Conflict resolution:
// - Financial data (sales, payments, stock): EVENT-SOURCING — reject duplicates
// - Non-financial (product name, category): LAST-WRITE-WINS
// - Stock: movement-based — conflicts impossible (each movement is unique event)
```

---

## 📊 PRISMA QOIDALARI

```bash
npx prisma migrate dev --name [name]  # Migration yaratish
npx prisma generate                    # Client generate
npx prisma validate                    # Schema tekshirish

# ❌ HECH QACHON production da:
npx prisma migrate reset               # BARCHA DATA YO'QOLADI!
```

### Schema konventsiyalar

```prisma
// Table naming: snake_case, plural
model products {
  id          String   @id @default(cuid())
  tenant_id   String                        // ← MAJBURIY
  name        String
  sku         String
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  deleted_at  DateTime?                     // soft delete

  @@index([tenant_id])
  @@index([tenant_id, sku])
  @@map("products")
}

// Ledger tables: updated_at YO'Q (immutable)
model journal_entries {
  id             String   @id @default(cuid())
  tenant_id      String
  reference_type String
  reference_id   String
  created_at     DateTime @default(now())
  // ⚠️ updated_at TAQIQLANGAN

  @@index([tenant_id])
  @@index([tenant_id, reference_type, reference_id])
  @@map("journal_entries")
}
```

---

## 🧪 TEST

```typescript
// Unit test:
describe('LedgerService', () => {
  it('should create balanced journal entry', async () => {
    const entry = await service.createEntry({
      tenant_id: testTenantId,
      reference_type: 'SALE',
      reference_id: 'order-123',
      entries: [
        { account_code: '1000', debit: 50000, credit: 0 },
        { account_code: '4000', debit: 0, credit: 50000 },
      ],
    });
    const totalDebit = entry.entries.reduce((s, e) => s + e.debit, 0);
    const totalCredit = entry.entries.reduce((s, e) => s + e.credit, 0);
    expect(totalDebit).toBe(totalCredit);
  });

  it('should reject unbalanced entry', async () => {
    await expect(service.createEntry({
      ...validEntry,
      entries: [
        { account_code: '1000', debit: 50000, credit: 0 },
        { account_code: '4000', debit: 0, credit: 30000 }, // unbalanced!
      ],
    })).rejects.toThrow('Journal entry must be balanced');
  });
});

// Integration test:
describe('POST /api/v1/sales', () => {
  it('creates sale and emits events', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/sales')
      .set('Authorization', `Bearer ${token}`)
      .send(validSaleDto)
      .expect(201);

    expect(res.body.id).toBeDefined();
    // Verify inventory deducted
    // Verify ledger entry created
    // Verify fiscal receipt queued
  });
});
```

---

## 🐳 DEVOPS

### Docker Compose (Development)

```yaml
services:
  postgres:
    image: postgres:16
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: raos_dev
      POSTGRES_USER: raos
      POSTGRES_PASSWORD: raos_dev_pass
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  minio:
    image: minio/minio
    ports: ["9000:9000", "9001:9001"]
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: raos_minio
      MINIO_ROOT_PASSWORD: raos_minio_pass
```

### CI/CD (GitHub Actions)

```yaml
# Pipeline steps:
1. Lint (eslint + prettier)
2. Type check (tsc --noEmit)
3. Unit tests
4. Integration tests (with test DB)
5. Docker build
6. Deploy to staging (auto)
7. Deploy to production (manual approval)
```

### Environments

| Env | Database | Purpose |
|-----|----------|---------|
| dev | Local PostgreSQL | Development |
| staging | Managed DB (copy) | Testing |
| production | Managed DB | Live |

```
⚠️ Claude va dev lar FAQAT dev/staging muhitida ishlaydi.
⚠️ Production ga faqat CI/CD orqali deploy.
```

---

## 📝 LOGGING (Winston-backed)

### Arxitektura

```
Request → RequestIdMiddleware (UUID + AsyncLocalStorage)
        → JwtAuthGuard (tenantId, userId → context)
        → RequestLoggerInterceptor (request/response logging)
        → Controller → Service
        → GlobalExceptionFilter (error logging)
```

### Log fayllar

```
logs/
  api-YYYY-MM-DD.log       ← Barcha API requestlar (JSON)
  errors-YYYY-MM-DD.log    ← Faqat 5xx errorlar (JSON)
  client-YYYY-MM-DD.log    ← Frontend/Mobile/POS errorlar (JSON)
```

### Service larda logging

```typescript
// NestJS Logger — avtomatik Winston orqali file ga yozadi
// requestId, tenantId, userId avtomatik qo'shiladi
private readonly logger = new Logger(MyService.name);

this.logger.log('Operation started', { tenantId, productId });
this.logger.warn('Rate limit approaching', { remaining: 5 });
this.logger.error('External API failed', {
  error: err.message,
  stack: err.stack,
  tenantId,
});

// console.log TAQIQLANGAN → faqat NestJS Logger
// Sensitive data avtomatik [REDACTED]: password, token, secret, authorization
// Rotation: kunlik, max 20MB, 14 kun saqlash
```

### Client error endpoint

```
POST /api/v1/logs/client-error (@Public, 30 req/min)
Body: { source: 'web'|'mobile'|'pos', error, stack?, url?, userAgent?, tenantId?, userId? }
→ logs/client-YYYY-MM-DD.log
```

---

## 🚫 TAQIQLANGAN

```
❌ apps/web/ papkasiga TEGINMA (AbdulazizYormatov zonasi)
❌ apps/pos/ papkasiga TEGINMA (AbdulazizYormatov zonasi)
❌ apps/mobile/ papkasiga TEGINMA (Ibrat + Abdulaziz zonasi)
❌ any type
❌ console.log production da
❌ Ledger entry UPDATE/DELETE
❌ Fiscal receipt o'zgartirish
❌ Financial data da last-write-wins
❌ Boshqa modul jadvaliga direct query
❌ tenant_id siz query
❌ prisma migrate reset
❌ Payment real keys dev muhitida
❌ Production DB ga direct access
```

---

*CLAUDE_BACKEND.md | RAOS | v1.0*