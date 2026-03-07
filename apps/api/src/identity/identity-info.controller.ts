import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../common/decorators';
import { IdentityService } from './identity.service';

@ApiTags('Identity')
@ApiBearerAuth()
@Controller('identity')
export class IdentityInfoController {
  constructor(private readonly identityService: IdentityService) {}

  @Get('branches')
  @ApiOperation({ summary: 'Get branches for current tenant' })
  getBranches(@CurrentTenant() tenantId: string) {
    return this.identityService.getBranches(tenantId);
  }
}
