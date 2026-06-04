import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { AdminAuthService } from './admin-auth.service';
import { AdminMetricsService } from './admin-metrics.service';
import { QueueService, QUEUE_NAMES, QueueName } from '../common/queue/queue.service';
import { IpBlockService } from '../common/cache/ip-block.service';

@ApiTags('Super Admin — Operations')
@UseGuards(SuperAdminGuard)
@ApiBearerAuth()
@Controller('admin')
export class AdminOpsController {
  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly adminMetricsService: AdminMetricsService,
    private readonly queueService: QueueService,
    private readonly ipBlockService: IpBlockService,
  ) {}

  // ─── METRICS ────────────────────────────────────────────────────

  @Get('metrics')
  @ApiOperation({ summary: 'Global agregat metrikalar' })
  getGlobalMetrics() {
    return this.adminMetricsService.getGlobalMetrics();
  }

  @Get('tenants/:id/sales')
  @ApiOperation({ summary: 'Tenant savdo tarixi' })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTenantSales(
    @Param('id') id: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminMetricsService.getTenantSales(id, {
      from, to,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('tenants/:id/health')
  @ApiOperation({ summary: 'Tenant sog\'liq holati' })
  getTenantHealth(@Param('id') id: string) {
    return this.adminMetricsService.getTenantHealth(id);
  }

  @Get('revenue-series')
  @ApiOperation({ summary: 'Kunlik daromad grafigi' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getRevenueSeries(@Query('days') days?: string) {
    return this.adminMetricsService.getRevenueSeries(days ? parseInt(days) : 14);
  }

  @Get('top-tenants')
  @ApiOperation({ summary: 'Top 5 tenant — daromad bo\'yicha' })
  getTopTenants() {
    return this.adminMetricsService.getTopTenants();
  }

  @Get('errors')
  @ApiOperation({ summary: 'Klient xatolari ro\'yxati' })
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'severity', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getErrors(
    @Query('tenantId') tenantId?: string,
    @Query('type') type?: string,
    @Query('severity') severity?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminMetricsService.getErrors({ tenantId, type, severity, limit: limit ? parseInt(limit) : undefined });
  }

  // ─── IMPERSONATION ──────────────────────────────────────────────

  @Post('impersonate/:tenantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tenant impersonation — vaqtinchalik token (1 soat)' })
  impersonate(
    @Param('tenantId') tenantId: string,
    @CurrentUser('userId') adminId: string,
    @CurrentUser('email') adminEmail: string,
  ) {
    return this.adminAuthService.impersonateTenant(tenantId, adminId, adminEmail ?? 'unknown');
  }

  // ─── PROVISIONING ──────────────────────────────────────────────

  @Post('tenants/provision')
  @ApiOperation({ summary: 'Yangi tenant one-click setup' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['tenantName', 'ownerEmail', 'ownerFirstName', 'ownerLastName'],
      properties: {
        tenantName: { type: 'string' },
        ownerEmail: { type: 'string' },
        ownerFirstName: { type: 'string' },
        ownerLastName: { type: 'string' },
        branchName: { type: 'string' },
      },
    },
  })
  provision(@Body() dto: { tenantName: string; ownerEmail: string; ownerFirstName: string; ownerLastName: string; branchName?: string }) {
    return this.adminAuthService.provisionTenant(dto);
  }

  // ─── IP BLOCK ───────────────────────────────────────────────────

  @Post('ip-block')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Block an IP address' })
  @ApiBody({ schema: { type: 'object', required: ['ip'], properties: { ip: { type: 'string' }, ttlHours: { type: 'number' }, reason: { type: 'string' } } } })
  async blockIp(@Body() dto: { ip: string; ttlHours?: number; reason?: string }) {
    const ttl = (dto.ttlHours ?? 24) * 3600;
    await this.ipBlockService.blockIp(dto.ip, ttl, dto.reason ?? 'manual');
    return { success: true, ip: dto.ip, ttlHours: dto.ttlHours ?? 24 };
  }

  @Delete('ip-unblock/:ip')
  @ApiOperation({ summary: 'Unblock an IP address' })
  async unblockIp(@Param('ip') ip: string) {
    await this.ipBlockService.unblockIp(ip);
    return { success: true, ip };
  }

  @Get('ip-block/:ip/stats')
  @ApiOperation({ summary: 'Get failed login count for an IP' })
  async getIpStats(@Param('ip') ip: string) {
    const [isBlocked, failedCount] = await Promise.all([
      this.ipBlockService.isBlocked(ip),
      this.ipBlockService.getFailedCount(ip),
    ]);
    return { ip, isBlocked, failedCount };
  }

  // ─── DLQ ────────────────────────────────────────────────────────

  @Get('dlq')
  @ApiOperation({ summary: 'Failed jobs (DLQ) royxati' })
  @ApiQuery({ name: 'queue', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getDlq(@Query('queue') queue?: string, @Query('limit') limit?: string) {
    const queueName = queue && Object.values(QUEUE_NAMES).includes(queue as QueueName) ? (queue as QueueName) : undefined;
    return this.queueService.getDlqJobs(queueName, limit ? parseInt(limit) : 50);
  }

  @Get('dlq/count')
  @ApiOperation({ summary: 'DLQ — failed job soni' })
  getDlqCount() {
    return this.queueService.getDlqCount();
  }

  @Post('dlq/:queue/:jobId/retry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Failed jobni qayta urinish' })
  retryDlqJob(@Param('queue') queue: string, @Param('jobId') jobId: string) {
    return this.queueService.retryDlqJob(queue as QueueName, jobId);
  }

  @Delete('dlq/:queue/:jobId')
  @ApiOperation({ summary: 'Failed jobni o\'chirish' })
  dismissDlqJob(@Param('queue') queue: string, @Param('jobId') jobId: string) {
    return this.queueService.dismissDlqJob(queue as QueueName, jobId);
  }
}
