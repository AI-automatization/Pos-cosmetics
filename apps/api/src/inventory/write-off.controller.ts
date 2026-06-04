import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WarehouseInvoiceService } from './warehouse-invoice.service';
import { WriteOffDto } from './dto/warehouse-invoice.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

// ─── T-328: Write-off ────────────────────────────────────────────────────────

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
export class WriteOffController {
  constructor(private readonly svc: WarehouseInvoiceService) {}

  @Post('write-off')
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'WAREHOUSE')
  @ApiOperation({ summary: 'T-328: Tovar spisanie (DAMAGED/EXPIRED/LOST/OTHER)' })
  writeOff(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: WriteOffDto,
  ) {
    return this.svc.writeOff(tenantId, userId, dto);
  }
}
