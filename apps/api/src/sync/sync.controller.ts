import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { InboundSyncDto, OutboundSyncQueryDto } from './dto/sync.dto';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Sync')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('inbound')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'POS → Server: Batch events yuborish',
    description:
      'POS qurilmasidan offline paytda yig\'ilgan eventlarni serverga yuboradi. ' +
      'Idempotency key orqali takroriy yuborishdan himoyalangan.',
  })
  async inbound(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: InboundSyncDto,
  ) {
    return this.syncService.processInbound(tenantId, dto);
  }

  @Get('outbound')
  @ApiOperation({
    summary: 'Server → POS: O\'zgarishlarni olish',
    description:
      'Berilgan vaqtdan keyin o\'zgargan mahsulotlar, kategoriyalar va narxlarni qaytaradi. ' +
      'POS qurilmasi ma\'lumotlar bazasini yangilash uchun ishlatadi.',
  })
  @ApiQuery({ name: 'since', required: true, description: 'ISO timestamp (e.g. 2026-03-01T00:00:00Z)' })
  @ApiQuery({ name: 'branchId', required: false })
  async outbound(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: OutboundSyncQueryDto,
  ) {
    return this.syncService.getOutbound(tenantId, query.since, query.branchId);
  }

  @Get('status')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Sync holati — pending va failed eventlar',
  })
  async status(@CurrentUser('tenantId') tenantId: string) {
    return this.syncService.getPendingEvents(tenantId);
  }
}
