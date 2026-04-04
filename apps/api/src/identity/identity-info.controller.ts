import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../common/decorators';
import { IdentityService } from './identity.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Identity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('identity')
export class IdentityInfoController {
  constructor(private readonly identityService: IdentityService) {}

  @Get('branches')
  @ApiOperation({ summary: 'Get branches for current tenant' })
  getBranches(@CurrentTenant() tenantId: string) {
    return this.identityService.getBranches(tenantId);
  }
}
