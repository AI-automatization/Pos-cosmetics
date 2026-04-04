import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../identity/guards/jwt-auth.guard';
import { RolesGuard } from '../../identity/guards/roles.guard';
import { Roles } from '../decorators';
import { FeatureFlagsService } from './feature-flags.service';
import { CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('Feature Flags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN)
@Controller('admin/feature-flags')
export class FeatureFlagsController {
  constructor(private readonly flagsService: FeatureFlagsService) {}

  @Get()
  @ApiOperation({ summary: 'T-313: List feature flags for current tenant' })
  listFlags(@CurrentUser('tenantId') tenantId: string) {
    return this.flagsService.listFlags(tenantId);
  }

  @Patch(':key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'T-313: Enable/disable a feature flag for current tenant' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['enabled'],
      properties: {
        enabled: { type: 'boolean' },
        description: { type: 'string' },
      },
    },
  })
  setFlag(
    @Param('key') key: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: { enabled: boolean; description?: string },
  ) {
    return this.flagsService.setFlag(key, dto.enabled, tenantId, dto.description);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'T-313: Delete a feature flag for current tenant (reverts to default)' })
  async deleteFlag(
    @Param('key') key: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    await this.flagsService.deleteFlag(key, tenantId);
    return { success: true };
  }
}
