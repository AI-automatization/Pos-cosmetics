  # CLAUDE_FULLSTACK.md — RAOS Full-Stack Engineer Guide
  # NestJS · Next.js · Prisma · TypeScript · Tailwind · Docker · BullMQ · Redis
  # Claude CLI bu faylni Ibrat tanlanganda o'qiydi

  ---

  ## ZONA

  ```
  apps/api/              → Backend API (NestJS)
  apps/web/src/          → Admin Panel + POS (Next.js App Router)
  apps/worker/           → BullMQ processors
  apps/bot/              → Telegram bot (grammY)
  packages/types/        → Shared types (kelishib o'zgartirish)
  packages/utils/        → Shared utilities (kelishib o'zgartirish)
  packages/ui/           → Shared UI components
  packages/sync-engine/  → Offline sync logic
  prisma/                → Database schema + migrations
  docker/                → Docker configs
  docker-compose.yml     → Infra config
  ```

  **TEGINMA:**
  - `apps/mobile/` — Abdulaziz zonasi (React Native Android + iOS)
  - `apps/mobile-owner/` — Abdulaziz zonasi (Owner Mobile App)

  ---

  ## BACKEND ARXITEKTURA

  ### NestJS Modul Tuzilishi

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
      providers/                    <- Plugin-based payment providers
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
      ledger.service.ts            <- Controller YO'Q — faqat internal
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
        telegram.channel.ts   <- birlamchi kanal
        email.channel.ts      <- zaxira kanal (SMTP)
        # sms.channel.ts — O'CHIRILDI (Eskiz TAQIQLANGAN, Polat 2026-03-09)
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

  ### Guards Tartibi

  ```
  Request -> Middleware -> Guard -> Interceptor -> Controller -> Service

  Guards ketma-ketligi:
    1. JwtAuthGuard    — token tekshirish
    2. RolesGuard      — rol (ADMIN, MANAGER, WAREHOUSE, CASHIER, VIEWER)
    3. TenantGuard     — tenant_id extraction & validation
    4. BillingGuard    — to'lov holati (subscription active?)
    5. ThrottlerGuard  — rate limiting
  ```

  ### Controller = HTTP ONLY — biznes logika YO'Q

  ```typescript
  // NOTO'G'RI — Controller ichida DB chaqiruvi
  @Get(':id')
  async get(@Param('id') id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  // TO'G'RI — Service orqali, tenant_id filter bilan
  @Get(':id')
  async get(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.catalogService.getById(id, tenantId);
  }
  ```

  ### Multi-Tenant — tenant_id HAR SO'ROVDA

  ```typescript
  // Data leak!
  async getAll() {
    return this.prisma.product.findMany();
  }

  // tenant_id filter
  async getAll(tenantId: string) {
    return this.prisma.product.findMany({
      where: { tenant_id: tenantId },
    });
  }

  // Custom decorator
  @Get()
  async getAll(@CurrentTenant() tenantId: string) {
    return this.catalogService.getAll(tenantId);
  }
  ```

  ### Error Handling — NestJS Exceptions

  ```typescript
  // NOTO'G'RI — xato yutiladi
  try { await api.call(); } catch (e) { console.log(e); }

  // TO'G'RI — Logger + proper exception
  try {
    return await externalApi.call(query);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown';
    this.logger.error(`External API failed: ${msg}`, { query, tenantId });
    throw new InternalServerErrorException('Service temporarily unavailable');
  }
  ```

  ### Domain Events — Modul aro aloqa

  ```typescript
  // NOTO'G'RI — Modul A dan modul B jadvaliga direct query
  async createSale(data: CreateSaleDto, tenantId: string) {
    const order = await this.prisma.order.create({ ... });
    await this.prisma.stockMovement.create({ ... }); // Boshqa modul jadvali!
  }

  // TO'G'RI — Event orqali
  async createSale(data: CreateSaleDto, tenantId: string) {
    const order = await this.prisma.order.create({ ... });

    await this.eventBus.emit('sale.created', {
      orderId: order.id,
      tenantId,
      items: data.items,
      timestamp: new Date(),
    });

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
        event.orderId,
      );
    }
  }
  ```

  ### BigInt/Decimal Serialization

  ```typescript
  // Global interceptor — main.ts da:
  // BigIntSerializerInterceptor ishlatish

  // Yoki har joyda manual:
  return {
    id: entity.id.toString(),
    balance: Number(account.balance),
  };
  ```

  ### N+1 Query Prevention

  ```typescript
  // NOTO'G'RI — N+1
  const orders = await prisma.order.findMany({ where: { tenant_id: tenantId } });
  for (const o of orders) {
    const items = await prisma.orderItem.findMany({ where: { orderId: o.id } });
  }

  // TO'G'RI — Include
  const orders = await prisma.order.findMany({
    where: { tenant_id: tenantId },
    include: {
      items: { include: { product: true } },
      payments: true,
    },
  });
  ```

  ---

  ## LEDGER MODULE (KRITIK)

  ### Double-Entry Journal — IMMUTABLE

  ```typescript
  interface JournalEntry {
    id: string;
    tenant_id: string;
    reference_type: 'SALE' | 'PAYMENT' | 'REFUND' | 'TRANSFER' | 'ADJUSTMENT';
    reference_id: string;
    entries: LedgerLine[];
    created_at: Date;
    // updated_at YO'Q — immutable!
  }

  interface LedgerLine {
    account_code: string;
    debit: number;
    credit: number;
    currency: string;
    description: string;
  }

  // QOIDALAR:
  // 1. sum(debit) === sum(credit) — HAR DOIM
  // 2. UPDATE/DELETE TAQIQLANGAN — faqat REVERSAL entry
  // 3. Har entry snapshot bilan saqlanadi
  // 4. Branch consolidation — branch_id orqali
  ```

  ```typescript
  // HECH QACHON
  await prisma.journalEntry.update({ ... });
  await prisma.journalEntry.delete({ ... });

  // Xato tuzatish — REVERSAL entry
  async reverseEntry(entryId: string, tenantId: string, reason: string) {
    const original = await this.getEntry(entryId, tenantId);

    const reversal = await this.createEntry({
      tenant_id: tenantId,
      reference_type: 'REVERSAL',
      reference_id: original.id,
      entries: original.entries.map(line => ({
        account_code: line.account_code,
        debit: line.credit,
        credit: line.debit,
        currency: line.currency,
        description: `REVERSAL: ${reason}`,
      })),
    });

    return reversal;
  }
  ```

  ---

  ## PAYMENT PROVIDERS (Plugin Architecture)

  ```typescript
  interface PaymentProvider {
    readonly name: string;
    createIntent(amount: number, currency: string, metadata: PaymentMeta): Promise<PaymentIntentResult>;
    confirmPayment(intentId: string): Promise<PaymentConfirmResult>;
    refund(intentId: string, amount?: number): Promise<RefundResult>;
    getStatus(intentId: string): Promise<PaymentStatus>;
  }

  // Payment Intent Lifecycle:
  // CREATED -> CONFIRMED -> SETTLED
  //                      -> FAILED
  //                      -> REVERSED

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

  ## FISCAL ADAPTER

  ```typescript
  interface FiscalAdapter {
    sendReceipt(receipt: FiscalReceiptData): Promise<FiscalResult>;
    getStatus(receiptId: string): Promise<FiscalStatus>;
    cancelReceipt(receiptId: string): Promise<FiscalCancelResult>;
  }

  // QOIDALAR:
  // 1. Sale ni HECH QACHON block qilma fiscal fail bo'lsa
  // 2. Fail -> queue ga qo'sh -> retry (3 attempts, exponential backoff)
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

  ## INVENTORY — Stock Movement Model

  ```typescript
  interface StockMovement {
    id: string;
    tenant_id: string;
    product_id: string;
    warehouse_id: string;
    type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT' | 'RETURN';
    quantity: number;
    reference_type: string;
    reference_id: string;
    batch_number?: string;
    expiry_date?: Date;
    created_at: Date;
    // updated_at YO'Q — immutable movement!
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
        quantity: true,
      },
    });
    return result._sum.quantity ?? 0;
  }
  ```

  ---

  ## BULLMQ JOB PATTERNS

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
      removeOnComplete: { age: 86400 },
      removeOnFail: { age: 604800 },
    });
  }

  // Worker — processor:
  async process(job: Job<ProcessData>) {
    const start = Date.now();
    logJobStart(QUEUE, job.id!, job.name, job.data);

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
      throw error;
    }
  }
  ```

  ### Queue ro'yxati

  ```
  fiscal-receipt     -> Fiscal cheklarni yuborish
  payment-reconcile  -> Payment tekshiruv (kunlik)
  sync-inbound       -> POS dan kelgan offline data
  analytics-compute  -> AI/Analytics hisoblash
  notification       -> Telegram (birlamchi) / Email (zaxira) yuborish — SMS/Eskiz TAQIQLANGAN
  backup             -> Database backup
  report-generate    -> Hisobot generatsiya
  ```

  ---

  ## OFFLINE SYNC (Backend qismi)

  ```typescript
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

  ## PRISMA QOIDALARI

  ```bash
  npx prisma migrate dev --name [name]  # Migration yaratish
  npx prisma generate                    # Client generate
  npx prisma validate                    # Schema tekshirish

  # HECH QACHON production da:
  npx prisma migrate reset               # BARCHA DATA YO'QOLADI!
  ```

  ### Schema konventsiyalar

  ```prisma
  // Table naming: snake_case, plural
  model products {
    id          String   @id @default(cuid())
    tenant_id   String                        // <- MAJBURIY
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
    // updated_at TAQIQLANGAN

    @@index([tenant_id])
    @@index([tenant_id, reference_type, reference_id])
    @@map("journal_entries")
  }
  ```

  ---

  ## FRONTEND ARXITEKTURA

  ### Fayl Tuzilishi

  ```
  apps/web/src/
    app/
      (admin)/                   -> Admin Panel sahifalari
        dashboard/page.tsx
        catalog/products/        -> ProductForm, ProductsTable, VariantsSection
        catalog/categories/
        catalog/suppliers/
        inventory/               -> page, stock-in, stock-out, expiry, low-stock
        sales/orders/
        sales/returns/
        sales/shifts/
        finance/expenses/
        reports/                 -> page, daily-revenue, top-products, branches, shifts
        customers/
        nasiya/                  -> page, aging
        payments/history/
        settings/                -> users, billing, printer, audit-log
        analytics/page.tsx
      (pos)/                     -> POS Desktop (Web-based, offline-first)
        pos/
          page.tsx               -> asosiy POS sahifa
          CartPanel.tsx
          PaymentPanel.tsx
          ProductSearch.tsx
          ReceiptPreview.tsx
          ShiftBar.tsx
          customer-display/      -> Customer display window
          shift/                 -> ShiftOpenModal, ShiftCloseModal, ShiftReport
      (warehouse)/               -> Warehouse Panel (WAREHOUSE roli)
        layout.tsx               -> ombor panel layouti + WarehouseSidebar
        warehouse/
          page.tsx               -> dashboard (stock stats, low-stock, expiry, movements)
          stock-in/
          stock-out/
          transfer/
          expiry/
          low-stock/
      (founder)/                 -> Owner Panel (founder ko'radi)
        founder/
          overview/
          tenants/               -> list, [id], new
          analytics/
          errors/
      (auth)/                    -> Login sahifalari
    components/
      layout/                    -> Sidebar, Header, PageLayout, FounderSidebar
      common/                    -> ConfirmDialog, SearchInput, LoadingSkeleton
      Receipt/                   -> ReceiptTemplate, useReceiptPrint
      SyncStatus/                -> SyncStatusBar
    hooks/
      catalog/                   -> useProducts, useCategories, useSuppliers, useProductCache, useVariants
      customers/                 -> useCustomer, useDebts, useLoyalty
      finance/                   -> useFinance
      founder/                   -> useFounder
      inventory/                 -> useInventory
      pos/                       -> useCompleteSale, useShift, useBarcodeScanner, usePOSKeyboard, useCustomerDisplayBroadcast
      reports/                   -> useReports
      sales/                     -> useOrders, useReturns, useShifts
      settings/                  -> useUsers, useBilling
    api/                         -> HTTP client va endpointlar
    store/                       -> Zustand global state (pos.store, sync.store)
    types/                       -> TypeScript type definitsiyalari
    lib/                         -> cashDrawer, productCache, utils
  ```

  ### Komponent Arxitekturasi — Max 400 Qator

  ```
  // Admin Panel — murakkab page alohida papkada:
  apps/web/src/app/(admin)/
    catalog/products/
      page.tsx                   // asosiy list + CRUD trigger
      ProductForm.tsx            // create/edit form
      ProductsTable.tsx          // table component
      VariantsSection.tsx        // product variants CRUD
      LabelPrintModal.tsx        // barcode label print

  // POS Desktop — web-based, keyboard-first:
  apps/web/src/app/(pos)/pos/
    page.tsx                     // asosiy POS sahifa
    CartPanel.tsx
    PaymentPanel.tsx
    ProductSearch.tsx
    ReceiptPreview.tsx
    ShiftBar.tsx

  // Shared components:
  apps/web/src/components/
    layout/
      Sidebar.tsx
      Header.tsx
      PageLayout.tsx
      FounderSidebar.tsx
      WarehouseSidebar.tsx      <- WAREHOUSE roli uchun sidebar
    common/
      ConfirmDialog.tsx
      SearchInput.tsx
      LoadingSkeleton.tsx
  ```

  ### `any` TAQIQLANGAN — TypeScript Strict (Frontend ham, Backend ham)

  ```typescript
  // NOTO'G'RI
  function Card({ data }: { data: any }) { ... }

  // TO'G'RI
  interface ProductCardProps {
    readonly id: string;
    readonly name: string;
    readonly price: number;
    readonly stock: number;
    readonly trend: 'up' | 'down' | 'flat';
  }
  function ProductCard({ product }: { product: ProductCardProps }) { ... }
  ```

  ### Custom Hook Pattern — Logika Hookda, Render Komponentda

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

  ### Error Handling — Frontend

  ```typescript
  // NOTO'G'RI — xato yutiladi
  } catch (err) { console.error(err); }

  // TO'G'RI — Toast yoki UI orqali
  export function extractErrorMessage(err: unknown): string {
    if (err instanceof AxiosError) {
      return (err.response?.data?.message as string) ?? 'Server xatosi';
    }
    if (err instanceof Error) return err.message;
    return 'Kutilmagan xato yuz berdi';
  }
  ```

  ### Loading + Double-Click Prevention

  ```typescript
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

  ---

  ## API CLIENT TUZILISHI

  ```
  apps/web/src/api/
    client.ts              -> axios instance + interceptors
    billing.api.ts         -> billingApi (subscription, plans)
    catalog.api.ts         -> catalogApi (products, categories, variants)
    customer.api.ts        -> customerApi (list, detail)
    debt.api.ts            -> debtApi (nasiya, aging)
    finance.api.ts         -> financeApi (expenses, ledger)
    founder.api.ts         -> founderApi (tenants, overview)
    inventory.api.ts       -> inventoryApi (stock, movements, transfers)
    loyalty.api.ts         -> loyaltyApi (account, config, redeem)
    orders.api.ts          -> ordersApi (create, list, detail)
    reports.api.ts         -> reportsApi (dashboard, profit, top-products)
    returns.api.ts         -> returnsApi (create, list)
    sales.api.ts           -> salesApi (orders, returns, history)
    shift.api.ts           -> shiftApi (open, close, current)
    shifts.api.ts          -> shiftsApi (list, report)
    suppliers.api.ts       -> suppliersApi (list, CRUD)
    users.api.ts           -> usersApi (list, CRUD, roles)
  ```

  ### Axios Interceptors (MAJBURIY)

  ```typescript
  // Request: JWT token qo'shish
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Response: 401 -> refresh, 402 -> billing, 500 -> error
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

  ## POS DESKTOP — OFFLINE-FIRST QOIDALARI

  > POS `apps/web/src/app/(pos)/pos/` da joylashgan — alohida `apps/pos/` papkasi YO'Q.
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
  ```

  ### Offline Indicator (MAJBURIY)

  ```typescript
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
    // Buffer characters -> emit on Enter or timeout
  }
  ```

  ### Local Print (Receipt)

  ```typescript
  export async function printReceipt(sale: LocalSale) {
    const receiptHtml = generateReceiptHtml(sale);
    await invoke('print_receipt', { html: receiptHtml });
  }
  ```

  ---

  ## DESIGN SYSTEM

  ### Admin Panel

  ```
  1. TailwindCSS utility classes
  2. Consistent spacing: 4, 8, 12, 16, 24, 32, 48
  3. Color palette: semantic tokens (primary, success, error, warning)
  4. Dark/Light theme support
  5. Responsive: mobile-first (base -> sm: -> md: -> lg: -> xl:)
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

  ### Shared Design Rules

  ```
  1. Raw hex ranglar TAQIQLANGAN -> semantic tokens
  2. Custom SVG iconlar (external CDN emas)
  3. Accessibility: aria-label, role, keyboard nav
  4. I18n: barcha UI text tarjima kaliti orqali (uz, ru, en)
  5. Responsive images: lazy loading + proper sizing
  6. Form validation: zod schemas + inline errors
  ```

  ---

  ## ROLE-BASED UI

  ### ROLE HIERARCHY (yangilangan)

  ```
  OWNER:     5  — to'liq kirish
  ADMIN:     4  — settings, catalog, full
  MANAGER:   3  — sales, inventory, reports
  WAREHOUSE: 2.5 — faqat inventory + catalog (read)
  CASHIER:   2  — faqat POS
  VIEWER:    1  — faqat read
  ```

  ### Panel route groups

  ```
  Panel route groups:
    (auth)       → /login
    (admin)      → OWNER, ADMIN, MANAGER, VIEWER
    (pos)        → CASHIER (/pos)
    (warehouse)  → WAREHOUSE (/warehouse)
    (founder)    → SUPER_ADMIN (/founder)
  ```

  ```typescript
  const ROUTE_PERMISSIONS: Record<string, Role[]> = {
    '/dashboard': ['ADMIN', 'MANAGER', 'VIEWER'],
    '/sales': ['ADMIN', 'MANAGER', 'CASHIER'],
    '/inventory': ['ADMIN', 'MANAGER'],
    '/finance': ['ADMIN'],
    '/settings': ['ADMIN'],
    '/realestate': ['ADMIN', 'MANAGER'],
    '/ai-insights': ['ADMIN', 'MANAGER'],
    '/warehouse': ['WAREHOUSE'],
  };

  export function ConditionalRender({ roles, children }: {
    roles: Role[];
    children: React.ReactNode;
  }) {
    const { user } = useAuth();
    if (!roles.includes(user.role)) return null;
    return <>{children}</>;
  }
  ```

  ### WAREHOUSE Roli — Funksiyalar (Miro board dan)

  **Asosiy qoidalar:**
  ```
  1. Mahsulot yaratilganda miqdori = 0 — qo'lda o'zgartirib bo'lmaydi
  2. Miqdor faqat PRIKHOD (Приход) orqali oshadi
  3. Barcha harakatlar immutable — faqat reversal orqali tuzatish
  4. Накладная saqlanganidan keyin o'zgartirib bo'lmaydi (snapshot)
  ```

  **Funksiyalar ro'yxati (Miro WAREHOUSE — Склад WMS):**
  ```
  ✅ Поставщик/Контрагент boshqaruv:
     - Поставщик qo'shish: nom, telefon, manzil, tavsif
     - Poставщик ro'yxati + search
     - WAREHOUSE roli: faqat o'qish + stock-in da tanlash

  ✅ Mahsulot (Catalog — read-only):
     - Kategoriyalar alohida yaratiladi (katalog roli tomonidan)
     - WAREHOUSE faqat ko'rish + shtrixkod bo'yicha qidirish

  ✅ Приход товара (Stock-in) — Накладная:
     - Forma: filial + поставщик + mahsulotlar jadvali (shtrixkod, miqdor, sotib olish narxi)
     - POST /warehouse/invoices → nakладная yaratiladi (stock-in harakatlar hosil bo'ladi)
     - Накладная = snapshot (saqlangandan keyin o'zgartirilmaydi)
     - Sotib olish narxi → Finance moduli ga domain event (xarajat)

  ✅ Ombor jadvali (Stock table):
     - Ustunlar: nom, kategoriya, miqdor, minimum, holat, joylashuv
     - Holat: 🟢 Normal | 🟡 Low Stock | 🔴 Out of Stock
     - LOW STOCK: minimum ostida → "Buyurtma berish kerak" ro'yxati
     - OUT OF STOCK: alohida holat, LOW STOCK dan kritikroq

  ✅ Списание (Write-off) — Qaytarilmas chiqim:
     - Sabablar: DAMAGED (shikastlangan) / EXPIRED (muddati o'tgan) / LOST (yo'qolgan) / OTHER
     - POST /inventory/write-off { productId, qty, reason, note, warehouseId }
     - Stock movement OUT + reference_type = WRITE_OFF yaratadi

  ✅ Перемещение (Transfer):
     - Hujjat: qayerdan → qayerga + mahsulotlar ro'yxati
     - POST /inventory/transfer { fromWarehouseId, toWarehouseId, items[] }

  ✅ История (Stock history):
     - Har harakat: kim, qachon, nima (+50 приход, -2 sotuv, -3 списание)
     - Filtr: mahsulot / tur / sana / foydalanuvchi
     - Eksport: CSV

  ✅ Muddati yaqinlashayotganlar (Expiry):
     - 🟡 Ogohlantirish: muddat tugashiga ≤ 30 kun
     - 🔴 EXPIRED: muddati o'tgan
     - Ro'yxat + filtr

  ✅ Sotuv orqali avtomatik kamaytirish:
     - POS da sotuv → ombor xodimi ishtirokisiz qolgan miqdor kamayadi
     - WAREHOUSE faqat harakatlarni ko'radi (sales operatsiyalari taqiqlangan)
  ```

  **API ruxsatlari:**
  ```
  Kirish mumkin:
    GET  /inventory/*                (barcha stock ma'lumotlar)
    POST /inventory/stock-in
    POST /inventory/stock-out
    POST /inventory/transfer
    POST /inventory/write-off        (списание with reason)
    GET  /inventory/out-of-stock
    GET  /inventory/stock-value
    GET  /catalog/products           (read-only)
    GET  /catalog/suppliers          (read-only — поставщик tanlash uchun)
    GET  /warehouse/dashboard
    GET  /warehouse/invoices
    POST /warehouse/invoices         (накладная yaratish)
    GET  /warehouse/invoices/:id
    GET  /warehouse/history          (stock movement history)
    GET  /warehouse/alerts           (kritik ogohlantirishlar)
    GET  /warehouse/movements/today

  TAQIQLANGAN:
    /sales/*     — savdo operatsiyalari
    /finance/*   — moliyaviy hisobotlar
    /ledger/*    — buxgalteriya
    /settings/*  — tizim sozlamalari
    /users/*     — foydalanuvchi boshqaruvi
    /payments/*  — to'lovlar
    /catalog/products POST/PATCH/DELETE — faqat o'qish
    /catalog/suppliers POST/PATCH/DELETE — faqat o'qish
  ```

  **Frontend routes (warehouse panel):**
  ```
  /warehouse                → Dashboard (stock stats, low-stock, expiry, today movements)
  /warehouse/stock-in       → Приход + Накладная forma
  /warehouse/invoices       → Накладные ro'yxati
  /warehouse/invoices/:id   → Накладная detail (snapshot view)
  /warehouse/write-off      → Списание forma (причина tanlash)
  /warehouse/stock-out      → Tezkor chiqarish
  /warehouse/transfer       → Ombor transferi
  /warehouse/expiry         → Muddati o'tayotganlar
  /warehouse/low-stock      → Kam qolganlar + "Buyurtma berish kerak"
  /warehouse/history        → Stock harakatlar tarixi
  /warehouse/suppliers      → Поставщики ro'yxati (read-only)
  ```

  Frontend panel: `apps/web/src/app/(warehouse)/`
  Login redirect: `WAREHOUSE → /warehouse`

  ### Panel Arxitekturasi — Hybrid Guard + Redirect

  ```
  Har rol uchun alohida panel YO'Q — Hybrid yondashuv:
    1. Login → rol-based redirect (middleware + useLogin hook)
    2. Layout da useRequireRole guard (unauthorized → redirect home)
    3. Backend da @Roles() decorator — ikkilamchi himoya

  CASHIER   → (pos) panel — alohida layout
  WAREHOUSE → (warehouse) panel — alohida layout
  Qolganlar → (admin) panel — rol filtrlangan sidebar
  ```

  ---

  ## ADMIN PANEL PAGES (implemented routes)

  ```
  /                   -> redirect by role (ADMIN -> /dashboard, CASHIER -> /pos)
  /dashboard          -> Overview stats, P&L breakdown, top products
  /catalog
    /products         -> Product list + CRUD + variants + label print
    /categories       -> Category management
    /suppliers        -> Supplier management
  /inventory
    /                 -> Current stock levels
    /stock-in         -> Stock received (purchase)
    /stock-out        -> Manual stock deduction
    /expiry           -> Expiry date tracking
    /low-stock        -> Low stock alerts
  /sales
    /orders           -> Sales history + details
    /returns          -> Return management
    /shifts           -> Shift history
  /payments
    /history          -> Payment history
  /finance
    /expenses         -> Expense tracking
  /reports
    /                 -> Reports overview
    /daily-revenue    -> Daily revenue chart
    /top-products     -> Best selling products
    /branches         -> Branch comparison
    /shifts           -> Shift reports
  /customers
    /                 -> Customer list
    /[id]             -> Customer detail + debt history + loyalty
  /nasiya
    /                 -> Active debts (nasiya)
    /aging            -> Debt aging report
  /analytics          -> AI analytics page
  /settings
    /users            -> User management + roles
    /billing          -> Subscription management
    /printer          -> Receipt printer settings
    /audit-log        -> Audit trail

  /pos                -> POS screen (route group (pos))
    /shift            -> Shift open/close modals

  /warehouse          -> Warehouse panel (route group (warehouse)) — WAREHOUSE roli
    /                 -> Dashboard (stock stats, low-stock, expiry, bugungi harakatlar)
    /stock-in         -> Приход + Накладная forma
    /invoices         -> Накладные ro'yxati (snapshot dokumentlar)
    /invoices/:id     -> Накладная detail (read-only snapshot)
    /write-off        -> Списание (причина: DAMAGED/EXPIRED/LOST/OTHER)
    /stock-out        -> Tezkor chiqarish
    /transfer         -> Ombor transferi (hujjat: qayerdan → qayerga)
    /expiry           -> Muddati o'tayotganlar (🟡 ≤30 kun, 🔴 o'tgan)
    /low-stock        -> Kam qolganlar + "Buyurtma berish kerak" ro'yxati
    /history          -> Stock harakatlar tarixi (filtr + CSV eksport)
    /suppliers        -> Поставщики ro'yxati (read-only)

  /founder            -> Owner monitoring panel (CLAUDE_FRONTEND_OWNER.md)
    /overview         -> Revenue cards + branch comparison
    /analytics        -> Revenue/Orders analytics + period filter
    /tenants          -> Tenant list + [id] detail + new
    /errors           -> System error logs
  ```

  ---

  ## STATE MANAGEMENT

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

  // Server data FAQAT React Query orqali — zustand da cache qilma!
  ```

  ---

  ## I18N

  ```typescript
  // Supported languages: uz, ru, en
  // Translation files: i18n/uz.json, i18n/ru.json, i18n/en.json

  const { t } = useTranslation();
  <h1>{t('dashboard.title')}</h1>
  <button>{t('common.save')}</button>

  // Hardcoded text TAQIQLANGAN — HAMMA text tarjima orqali!
  ```

  ---

  ## DEVOPS

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
  Claude va dev lar FAQAT dev/staging muhitida ishlaydi.
  Production ga faqat CI/CD orqali deploy.
  ```

  ---

  ## LOGGING

  ### Backend (Winston-backed NestJS Logger)

  ```
  Request -> RequestIdMiddleware (UUID + AsyncLocalStorage)
          -> JwtAuthGuard (tenantId, userId -> context)
          -> RequestLoggerInterceptor (request/response logging)
          -> Controller -> Service
          -> GlobalExceptionFilter (error logging)
  ```

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

  // console.log TAQIQLANGAN -> faqat NestJS Logger
  // Sensitive data avtomatik [REDACTED]: password, token, secret, authorization
  // Rotation: kunlik, max 20MB, 14 kun saqlash
  ```

  ### Worker (Structured JSON)

  ```typescript
  // Har job uchun 3 ta log:
  logJobStart(queue, jobId, jobName, data);
  logJobDone(queue, jobId, jobName, durationMs);
  logJobError(queue, jobId, jobName, err);
  ```

  ### Frontend (Client Error Reporting)

  ```
  1. Production da console.log TAQIQLANGAN
  2. Development da: if (process.env.NODE_ENV === 'development') console.log(...)
  3. Error Boundary component MAJBURIY — render errorlarni ushlaydi
  4. API interceptor 5xx errorlarni avtomatik POST /api/v1/logs/client-error ga yuboradi
  5. window.onerror va window.onunhandledrejection handle qilinishi SHART
  ```

  ```typescript
  // POST /api/v1/logs/client-error (public, auth kerak emas, 30 req/min)
  interface ClientErrorPayload {
    source: 'web' | 'mobile' | 'pos';
    error: string;
    stack?: string;
    url?: string;
    userAgent?: string;
    tenantId?: string;
    userId?: string;
  }
  ```

  ### Log fayllar

  ```
  logs/
    api-YYYY-MM-DD.log       <- Barcha API requestlar (JSON, daily rotation)
    errors-YYYY-MM-DD.log    <- Faqat 5xx errorlar (JSON)
    client-YYYY-MM-DD.log    <- Frontend/Mobile/POS errorlar (JSON)
  ```

  ---

  ## TEST

  ### Backend Unit/Integration Tests

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
          { account_code: '4000', debit: 0, credit: 30000 },
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
    });
  });
  ```

  ---

  ## QOIDALAR (UMUMIY)

  ```
  TAQIQLANGAN:
    any type — TypeScript strict mode (backend ham, frontend ham)
    console.log — Backend: NestJS Logger, Frontend: faqat DEV mode
    400+ qatorli fayl — bo'lish kerak (SRP)
    Inline styles — Tailwind class ishlatish
    Magic numbers — const bilan nomlash
    Nested try/catch — flat error handling
    Hardcoded secrets — .env ishlatish
    Ledger entry UPDATE/DELETE — faqat REVERSAL
    Fiscal receipt o'zgartirish
    Financial data da last-write-wins
    Boshqa modul jadvaliga direct query
    tenant_id siz query
    prisma migrate reset (production)
    Payment real keys dev muhitida
    Production DB ga direct access
    Fixed width charts — ResponsiveContainer
    localStorage to'g'ridan — useLocalStorage hook
    Hardcoded text — i18n translation keys
    Raw hex colors — semantic tokens
    External CDN imports — local assets
    Server state zustand da — React Query
    Eskiz.uz SMS API — TAQIQLANGAN
      -> O'rniga: Telegram Bot API (birlamchi) + SMTP Email (zaxira)
    apps/mobile/ papkasiga TEGINMA (Abdulaziz zonasi)
  ```

  ---

  *CLAUDE_FULLSTACK.md | RAOS | v1.0*
