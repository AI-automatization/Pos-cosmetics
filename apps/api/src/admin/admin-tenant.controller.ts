import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { AdminAuthService } from './admin-auth.service';

@ApiTags('Super Admin — Tenants')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@ApiBearerAuth()
@Controller('admin')
export class AdminTenantController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

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

  @Get('tenants/:id')
  @ApiOperation({ summary: 'Tenant haqida to\'liq ma\'lumot' })
  getTenantDetails(@Param('id') id: string) {
    return this.adminAuthService.getTenantDetails(id);
  }

  @Patch('tenants/:id/activate')
  @ApiOperation({ summary: 'Tenant ni aktivlashtirish' })
  activateTenant(@Param('id') id: string) {
    return this.adminAuthService.toggleTenantActive(id, true);
  }

  @Patch('tenants/:id/deactivate')
  @ApiOperation({ summary: 'Tenant ni o\'chirish' })
  deactivateTenant(@Param('id') id: string) {
    return this.adminAuthService.toggleTenantActive(id, false);
  }

  @Post('tenants/create')
  @ApiOperation({ summary: 'Полное создание компании + Owner + подписка' })
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
      owner: { firstName: string; lastName: string; email: string; phone?: string; password?: string };
      planId?: string;
      trialDays?: number;
      branchName?: string;
    },
  ) {
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

  @Patch('tenants/:id')
  @ApiOperation({ summary: 'Редактирование тенанта' })
  editTenant(
    @Param('id') id: string,
    @Body() dto: {
      name?: string; slug?: string; phone?: string; city?: string;
      businessType?: string; legalName?: string; inn?: string;
      stir?: string; oked?: string; legalAddress?: string; isActive?: boolean;
    },
  ) {
    return this.adminAuthService.editTenant(id, dto);
  }

  @Delete('tenants/:id')
  @ApiOperation({ summary: 'Мягкое удаление тенанта' })
  deleteTenant(@Param('id') id: string) {
    return this.adminAuthService.deleteTenant(id);
  }

  @Get('tenants/:id/users')
  @ApiOperation({ summary: 'Все пользователи тенанта' })
  getTenantUsers(@Param('id') tenantId: string) {
    return this.adminAuthService.getTenantUsers(tenantId);
  }

  @Patch('tenants/:tenantId/users/:userId/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset user password (Super Admin)' })
  @ApiBody({ schema: { type: 'object', required: ['newPassword'], properties: { newPassword: { type: 'string' } } } })
  resetTenantUserPassword(
    @Param('tenantId') tenantId: string,
    @Param('userId') userId: string,
    @Body() body: { newPassword: string },
  ) {
    return this.adminAuthService.resetTenantUserPassword(tenantId, userId, body.newPassword);
  }

  @Post('tenants/:id/owners')
  @ApiOperation({ summary: 'Добавить Owner к тенанту' })
  addOwner(
    @Param('id') tenantId: string,
    @Body() dto: { firstName: string; lastName: string; email: string; phone?: string; password?: string },
  ) {
    return this.adminAuthService.addOwnerToTenant(tenantId, dto);
  }

  @Get('tenants/:id/usage')
  @ApiOperation({ summary: 'Использование vs лимиты' })
  getTenantUsage(@Param('id') tenantId: string) {
    return this.adminAuthService.getTenantUsage(tenantId);
  }

  @Get('tenants/:id/subscription')
  @ApiOperation({ summary: 'Подписка тенанта + план' })
  getTenantSubscription(@Param('id') tenantId: string) {
    return this.adminAuthService.getTenantSubscription(tenantId);
  }

  @Post('tenants/:id/subscription')
  @ApiOperation({ summary: 'Override подписки тенанта' })
  overrideSubscription(
    @Param('id') tenantId: string,
    @Body() dto: { planSlug?: string; expiresAt?: string; status?: string },
  ) {
    return this.adminAuthService.overrideSubscription(tenantId, dto);
  }

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

  // ─── ZZONE CONFIG ────────────────────────────────────────────────────

  @Get('tenants/:id/zzone-config')
  @ApiOperation({ summary: 'ZZone интеграция конфиги' })
  async getZzoneConfig(@Param('id') tenantId: string) {
    return this.adminAuthService.getZzoneConfig(tenantId);
  }

  @Patch('tenants/:id/zzone-config')
  @ApiOperation({ summary: 'ZZone конфигни янгилаш (token, isActive)' })
  async updateZzoneConfig(
    @Param('id') tenantId: string,
    @Body() body: { token?: string; isActive?: boolean },
  ) {
    return this.adminAuthService.updateZzoneConfig(tenantId, body);
  }

  @Post('tenants/:id/zzone-sync')
  @ApiOperation({ summary: 'Барча товарларни ZZone га синхронлаш' })
  async triggerZzoneSync(@Param('id') tenantId: string) {
    return this.adminAuthService.triggerZzoneSync(tenantId);
  }
}
