import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Request,
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
import { AdminAuthService } from './admin-auth.service';
import { AdminMetricsService } from './admin-metrics.service';
import { AdminLoginDto, AdminCreateDto } from './dto/admin-login.dto';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { QueueService, QUEUE_NAMES, QueueName } from '../common/queue/queue.service';

@ApiTags('Super Admin')
@Controller('admin')
export class AdminAuthController {
  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly adminMetricsService: AdminMetricsService,
    private readonly queueService: QueueService,
  ) {}

  // ─── PUBLIC: Login ─────────────────────────────────────────────
  @Public()
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Super Admin tizimga kirishi' })
  login(@Body() dto: AdminLoginDto) {
    return this.adminAuthService.login(dto);
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

  // ─── T-058: Tenant Impersonation ───────────────────────────────
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @Post('impersonate/:tenantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'T-058: Tenant impersonation — vaqtinchalik token (1 soat)',
    description: 'Super Admin ixtiyoriy tenant OWNER sifatida kiradi. Barcha harakatlar audit log ga yoziladi.',
  })
  impersonate(@Param('tenantId') tenantId: string, @Request() req: { user: { sub: string; email?: string } }) {
    return this.adminAuthService.impersonateTenant(
      tenantId,
      req.user.sub,
      req.user.email ?? 'unknown',
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
}
