import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { Public } from '../common/decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminAuthService } from './admin-auth.service';
import { AdminMetricsService } from './admin-metrics.service';
import { AdminLoginDto, AdminCreateDto } from './dto/admin-login.dto';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { QueueService, QUEUE_NAMES, QueueName } from '../common/queue/queue.service';
import { IpBlockService } from '../common/cache/ip-block.service';

@ApiTags('Super Admin')
@Controller('admin')
export class AdminAuthController {
  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly adminMetricsService: AdminMetricsService,
    private readonly queueService: QueueService,
    private readonly ipBlockService: IpBlockService,
  ) {}

  // ─── PUBLIC: Login ─────────────────────────────────────────────
  @Public()
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Super Admin tizimga kirishi' })
  login(@Body() dto: AdminLoginDto) {
    return this.adminAuthService.login(dto);
  }

  // ─── BOOTSTRAP: Birinchi Super Admin yaratish ──────────────────
  @Public()
  @Post('auth/bootstrap')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Birinchi Super Admin yaratish (ADMIN_BOOTSTRAP_SECRET kerak)' })
  bootstrap(@Body() dto: AdminCreateDto, @Headers('x-bootstrap-secret') secret: string) {
    return this.adminAuthService.bootstrap(dto, secret);
  }

  // ─── BOOTSTRAP: User parolini reset qilish ─────────────────────
  @Public()
  @Post('auth/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User parolini reset qilish (ADMIN_BOOTSTRAP_SECRET kerak)' })
  resetUserPassword(
    @Body() body: { email: string; newPassword: string },
    @Headers('x-bootstrap-secret') secret: string,
  ) {
    return this.adminAuthService.resetUserPassword(body.email, body.newPassword, secret);
  }

  // ─── PROTECTED: Admin only endpoints ───────────────────────────
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Post('auth/create')
  @ApiOperation({ summary: 'Yangi Super Admin yaratish (faqat Super Admin)' })
  createAdmin(@Body() dto: AdminCreateDto) {
    return this.adminAuthService.createAdmin(dto);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Get('tenants')
  @ApiOperation({ summary: 'Barcha tenantlar ro\'yxati' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  getAllTenants(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminAuthService.getAllTenants({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
    });
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Get('tenants/:id')
  @ApiOperation({ summary: 'Tenant haqida to\'liq ma\'lumot' })
  getTenantDetails(@Param('id') id: string) {
    return this.adminAuthService.getTenantDetails(id);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Patch('tenants/:id/activate')
  @ApiOperation({ summary: 'Tenant ni aktivlashtirish' })
  activateTenant(@Param('id') id: string) {
    return this.adminAuthService.toggleTenantActive(id, true);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Patch('tenants/:id/deactivate')
  @ApiOperation({ summary: 'Tenant ni o\'chirish' })
  deactivateTenant(@Param('id') id: string) {
    return this.adminAuthService.toggleTenantActive(id, false);
  }

  // ─── METRICS ───────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Get('metrics')
  @ApiOperation({ summary: 'Global agregat metrikalar (barcha tenantlar)' })
  getGlobalMetrics() {
    return this.adminMetricsService.getGlobalMetrics();
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Get('tenants/:id/sales')
  @ApiOperation({ summary: 'Tenant savdo tarixi' })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'ISO date string' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'ISO date string' })
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
      from,
      to,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Get('tenants/:id/health')
  @ApiOperation({ summary: 'Tenant sog\'liq holati' })
  getTenantHealth(@Param('id') id: string) {
    return this.adminMetricsService.getTenantHealth(id);
  }

  // ─── T-056: Revenue Series ─────────────────────────────────────
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Get('revenue-series')
  @ApiOperation({ summary: 'T-056: Kunlik daromad grafigi (barcha tenantlar)' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Necha kun (default 14)' })
  getRevenueSeries(@Query('days') days?: string) {
    return this.adminMetricsService.getRevenueSeries(days ? parseInt(days) : 14);
  }

  // ─── T-056: Top Tenants ────────────────────────────────────────
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Get('top-tenants')
  @ApiOperation({ summary: 'T-056: Bugungi top 5 tenant — daromad bo\'yicha' })
  getTopTenants() {
    return this.adminMetricsService.getTopTenants();
  }

  // ─── T-056: Client Errors ──────────────────────────────────────
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Get('errors')
  @ApiOperation({ summary: 'T-056: Klient xatolari ro\'yxati' })
  @ApiQuery({ name: 'tenantId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'CLIENT | API | SYNC' })
  @ApiQuery({ name: 'severity', required: false, type: String, description: 'ERROR | WARN | CRITICAL | INFO' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max natijalar soni (default 50)' })
  getErrors(
    @Query('tenantId') tenantId?: string,
    @Query('type') type?: string,
    @Query('severity') severity?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminMetricsService.getErrors({
      tenantId,
      type,
      severity,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  // ─── T-058: Tenant Impersonation ───────────────────────────────
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Post('impersonate/:tenantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'T-058: Tenant impersonation — vaqtinchalik token (1 soat)',
    description: 'Super Admin ixtiyoriy tenant OWNER sifatida kiradi. Barcha harakatlar audit log ga yoziladi.',
  })
  impersonate(
    @Param('tenantId') tenantId: string,
    @CurrentUser('userId') adminId: string,
    @CurrentUser('email') adminEmail: string,
  ) {
    return this.adminAuthService.impersonateTenant(
      tenantId,
      adminId,
      adminEmail ?? 'unknown',
    );
  }

  // ─── T-059: Tenant Provisioning ────────────────────────────────
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Post('tenants/provision')
  @ApiOperation({
    summary: 'T-059: Yangi tenant one-click setup',
    description: 'Tenant, OWNER user, filial, kategoriyalar va birliklarni avtomatik yaratadi.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['tenantName', 'ownerEmail', 'ownerFirstName', 'ownerLastName'],
      properties: {
        tenantName: { type: 'string', example: 'Beauty Shop Tashkent' },
        ownerEmail: { type: 'string', example: 'owner@beautyshop.uz' },
        ownerFirstName: { type: 'string', example: 'Malika' },
        ownerLastName: { type: 'string', example: 'Yusupova' },
        branchName: { type: 'string', example: 'Asosiy filial' },
      },
    },
  })
  provision(
    @Body()
    dto: {
      tenantName: string;
      ownerEmail: string;
      ownerFirstName: string;
      ownerLastName: string;
      branchName?: string;
    },
  ) {
    return this.adminAuthService.provisionTenant(dto);
  }

  // ─── T-312: IP Block Manager ──────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Post('ip-block')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'T-312: Block an IP address (default 24h)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['ip'],
      properties: {
        ip: { type: 'string', example: '192.168.1.100' },
        ttlHours: { type: 'number', example: 24, description: 'Block duration in hours (default 24)' },
        reason: { type: 'string', example: 'DDoS attempt' },
      },
    },
  })
  async blockIp(
    @Body() dto: { ip: string; ttlHours?: number; reason?: string },
  ) {
    const ttl = (dto.ttlHours ?? 24) * 3600;
    await this.ipBlockService.blockIp(dto.ip, ttl, dto.reason ?? 'manual');
    return { success: true, ip: dto.ip, ttlHours: dto.ttlHours ?? 24 };
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Delete('ip-unblock/:ip')
  @ApiOperation({ summary: 'T-312: Unblock an IP address' })
  async unblockIp(@Param('ip') ip: string) {
    await this.ipBlockService.unblockIp(ip);
    return { success: true, ip };
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Get('ip-block/:ip/stats')
  @ApiOperation({ summary: 'T-312: Get failed login count for an IP' })
  async getIpStats(@Param('ip') ip: string) {
    const [isBlocked, failedCount] = await Promise.all([
      this.ipBlockService.isBlocked(ip),
      this.ipBlockService.getFailedCount(ip),
    ]);
    return { ip, isBlocked, failedCount };
  }

  // ─── T-094: Dead Letter Queue ──────────────────────────────────────────────

  @Get('dlq')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Failed jobs (DLQ) royxati' })
  @ApiQuery({ name: 'queue', required: false, description: 'Queue nomi filtri' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  getDlq(
    @Query('queue') queue?: string,
    @Query('limit') limit?: string,
  ) {
    const queueName = queue && Object.values(QUEUE_NAMES).includes(queue as QueueName)
      ? (queue as QueueName)
      : undefined;
    return this.queueService.getDlqJobs(queueName, limit ? parseInt(limit) : 50);
  }

  @Get('dlq/count')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'DLQ — failed job soni (queue bo\'yicha)' })
  getDlqCount() {
    return this.queueService.getDlqCount();
  }

  @Post('dlq/:queue/:jobId/retry')
  @UseGuards(SuperAdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Failed jobni qayta urinish' })
  retryDlqJob(
    @Param('queue') queue: string,
    @Param('jobId') jobId: string,
  ) {
    return this.queueService.retryDlqJob(queue as QueueName, jobId);
  }

  @Delete('dlq/:queue/:jobId')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Failed jobni ochirish (dismiss)' })
  dismissDlqJob(
    @Param('queue') queue: string,
    @Param('jobId') jobId: string,
  ) {
    return this.queueService.dismissDlqJob(queue as QueueName, jobId);
  }

  // ─── TENANT FULL CREATE (Фаза 2) ──────────────────────────────────────────

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Post('tenants/create')
  @ApiOperation({
    summary: 'Полное создание компании + Owner + подписка',
    description: 'Создаёт: Tenant, Owner User, Branch, Categories, Units, Subscription, Settings',
  })
  createTenant(
    @Body() body: {
      name: string;
      slug: string;
      phone?: string;
      city?: string;
      businessType?: string;
      legalName?: string;
      inn?: string;
      stir?: string;
      oked?: string;
      legalAddress?: string;
      owner: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        password?: string;
      };
      planId?: string;
      trialDays?: number;
      branchName?: string;
    },
  ) {
    // Маппим frontend формат → service формат
    return this.adminAuthService.createTenantFull({
      tenantName: body.name,
      slug: body.slug,
      phone: body.phone,
      city: body.city,
      businessType: body.businessType,
      legalName: body.legalName,
      inn: body.inn,
      stir: body.stir,
      oked: body.oked,
      legalAddress: body.legalAddress,
      ownerFirstName: body.owner.firstName,
      ownerLastName: body.owner.lastName,
      ownerEmail: body.owner.email,
      ownerPhone: body.owner.phone,
      ownerPassword: body.owner.password,
      planSlug: body.planId === 'FREE' ? 'free' : body.planId?.toLowerCase(),
      trialDays: body.trialDays,
      branchName: body.branchName,
    });
  }

  // ─── TENANT EDIT ───────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Patch('tenants/:id')
  @ApiOperation({ summary: 'Редактирование тенанта (все поля)' })
  editTenant(
    @Param('id') id: string,
    @Body() dto: {
      name?: string;
      slug?: string;
      phone?: string;
      city?: string;
      businessType?: string;
      legalName?: string;
      inn?: string;
      stir?: string;
      oked?: string;
      legalAddress?: string;
      isActive?: boolean;
    },
  ) {
    return this.adminAuthService.editTenant(id, dto);
  }

  // ─── TENANT DELETE (soft) ──────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Delete('tenants/:id')
  @ApiOperation({ summary: 'Мягкое удаление тенанта (деактивация)' })
  deleteTenant(@Param('id') id: string) {
    return this.adminAuthService.deleteTenant(id);
  }

  // ─── TENANT USERS ──────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Get('tenants/:id/users')
  @ApiOperation({ summary: 'Все пользователи тенанта' })
  getTenantUsers(@Param('id') tenantId: string) {
    return this.adminAuthService.getTenantUsers(tenantId);
  }

  // ─── ADD OWNER TO TENANT ───────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Post('tenants/:id/owners')
  @ApiOperation({ summary: 'Добавить нового Owner к тенанту' })
  addOwner(
    @Param('id') tenantId: string,
    @Body() dto: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      password?: string;
    },
  ) {
    return this.adminAuthService.addOwnerToTenant(tenantId, dto);
  }

  // ─── TENANT USAGE ──────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Get('tenants/:id/usage')
  @ApiOperation({ summary: 'Использование vs лимиты тенанта' })
  getTenantUsage(@Param('id') tenantId: string) {
    return this.adminAuthService.getTenantUsage(tenantId);
  }

  // ─── TENANT SUBSCRIPTION ──────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Get('tenants/:id/subscription')
  @ApiOperation({ summary: 'Подписка тенанта + план' })
  getTenantSubscription(@Param('id') tenantId: string) {
    return this.adminAuthService.getTenantSubscription(tenantId);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Post('tenants/:id/subscription')
  @ApiOperation({ summary: 'Override подписки тенанта (сменить план / продлить)' })
  overrideSubscription(
    @Param('id') tenantId: string,
    @Body() dto: { planSlug?: string; expiresAt?: string; status?: string },
  ) {
    return this.adminAuthService.overrideSubscription(tenantId, dto);
  }

  // ─── TENANT AUDIT LOG ─────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Get('tenants/:id/audit-log')
  @ApiOperation({ summary: 'Аудит-лог тенанта' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTenantAuditLog(
    @Param('id') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminAuthService.getTenantAuditLog(tenantId, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }
}
