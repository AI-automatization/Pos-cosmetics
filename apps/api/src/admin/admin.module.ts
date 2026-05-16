import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminAuthService } from './admin-auth.service';
import { AdminTenantHelper } from './admin-tenant.helper';
import { AdminSubscriptionHelper } from './admin-subscription.helper';
import { AdminMetricsService } from './admin-metrics.service';
import { AdminDatabaseService } from './admin-database.service';
import { AdminAuthController } from './admin-auth.controller';
import { AdminTenantController } from './admin-tenant.controller';
import { AdminOpsController } from './admin-ops.controller';
import { AdminDatabaseController } from './admin-database.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_ACCESS_EXPIRES') ?? '15m' },
      }),
    }),
  ],
  controllers: [AdminAuthController, AdminTenantController, AdminOpsController, AdminDatabaseController],
  providers: [AdminAuthService, AdminTenantHelper, AdminSubscriptionHelper, AdminMetricsService, AdminDatabaseService],
  exports: [AdminAuthService, AdminMetricsService, AdminDatabaseService],
})
export class AdminModule {}
