import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../identity/guards/jwt-auth.guard';
import { Roles } from '../decorators';
import { FeatureFlagsService } from './feature-flags.service';
import { CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('Feature Flags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles('OWNER', 'ADMIN')
@Controller('admin/feature-flags')
export class FeatureFlagsController {
  constructor(private readonly flagsService: FeatureFlagsService) {}

  @Get()
  @ApiOperation({ summary: 'T-313: List feature flags for current tenant' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Override tenant (super admin)' })
  listFlags(
    @CurrentUser('tenantId') tenantId: string,
    @Query('tenantId') overrideTenantId?: string,
  ) {
    return this.flagsService.listFlags(overrideTenantId ?? tenantId);
  }

  @Patch(':key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'T-313: Enable/disable a feature flag for a tenant' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['enabled'],
      properties: {
        enabled: { type: 'boolean' },
        global: { type: 'boolean', description: 'If true, applies to all tenants (OWNER only)' },
        description: { type: 'string' },
      },
    },
  })
  setFlag(
    @Param('key') key: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: { enabled: boolean; global?: boolean; description?: string },
  ) {
    const targetTenantId = dto.global ? '' : tenantId;
    return this.flagsService.setFlag(key, dto.enabled, targetTenantId, dto.description);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'T-313: Delete a feature flag (reverts to default)' })
  async deleteFlag(
    @Param('key') key: string,
    @CurrentUser('tenantId') tenantId: string,
    @Query('global') global?: string,
  ) {
    const targetTenantId = global === 'true' ? '' : tenantId;
    await this.flagsService.deleteFlag(key, targetTenantId);
    return { success: true };
  }
}
