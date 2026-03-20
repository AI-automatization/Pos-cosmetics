import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerModule } from './common/logger/logger.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { HealthModule } from './health/health.module';
import { IdentityModule } from './identity/identity.module';
import { CatalogModule } from './catalog/catalog.module';
import { InventoryModule } from './inventory/inventory.module';
import { SalesModule } from './sales/sales.module';
import { PromotionsModule } from './sales/promotions/promotions.module';
import { PaymentsModule } from './payments/payments.module';
import { LedgerModule } from './ledger/ledger.module';
import { TaxModule } from './tax/tax.module';
import { RealestateModule } from './realestate/realestate.module';
import { AiModule } from './ai/ai.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CustomersModule } from './customers/customers.module';
import { NasiyaModule } from './nasiya/nasiya.module';
import { ReportsModule } from './reports/reports.module';
import { AuditModule } from './audit/audit.module';
import { FinanceModule } from './finance/finance.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { BranchModule } from './branches/branch.module';
import { AdminModule } from './admin/admin.module';
import { BillingModule } from './billing/billing.module';
import { MetricsModule } from './metrics/metrics.module';
import { SyncModule } from './sync/sync.module';
import { RealtimeModule } from './realtime/realtime.module';
import { QueueModule } from './common/queue/queue.module';
import { AppCacheModule } from './common/cache/cache.module';
import { CronModule } from './common/cron/cron.module';
import { ExchangeRateModule } from './common/currency/exchange-rate.module';
import { CircuitBreakerModule } from './common/circuit-breaker/circuit-breaker.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TenantThrottlerGuard } from './common/guards/tenant-throttler.guard';
import { EmployeesModule } from './employees/employees.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    // Core
    ConfigModule.forRoot({ isGlobal: true }),
    MetricsModule,
    // T-077: 100 req/min default (per-tenant via TenantThrottlerGuard below)
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    PrismaModule,
    LoggerModule,
    AppCacheModule,
    ExchangeRateModule,
    CircuitBreakerModule,
    QueueModule,

    // Feature modules
    HealthModule,
    IdentityModule,
    CatalogModule,
    InventoryModule,
    SalesModule,
    PromotionsModule,
    PaymentsModule,
    LedgerModule,
    TaxModule,
    RealestateModule,
    AiModule,
    NotificationsModule,
    CustomersModule,
    NasiyaModule,
    ReportsModule,
    AuditModule,
    FinanceModule,
    LoyaltyModule,
    BranchModule,
    AdminModule,
    BillingModule,
    CronModule,
    SyncModule,
    RealtimeModule,
    EmployeesModule,
    UploadModule,
  ],
  providers: [
    // T-077: Global per-tenant rate limiter (100 req/min per tenant, IP for anon)
    { provide: APP_GUARD, useClass: TenantThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
