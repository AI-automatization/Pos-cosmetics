import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TenantSettingsService, UpdateSettingsDto } from './tenant-settings.service';

/**
 * T-132: Tenant Settings — GET /settings, PATCH /settings
 * Per-tenant configuration: currency, language, timezone, tax rate, receipt text, thresholds.
 */
@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class TenantSettingsController {
  constructor(private readonly settingsService: TenantSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'T-132: Get tenant settings' })
  getSettings(@CurrentUser('tenantId') tenantId: string) {
    return this.settingsService.getSettings(tenantId);
  }

  @Patch()
  @ApiOperation({ summary: 'T-132: Update tenant settings' })
  updateSettings(
    @CurrentUser('tenantId') tenantId: string,
    @Body() body: UpdateSettingsDto,
  ) {
    return this.settingsService.updateSettings(tenantId, body);
  }
}
