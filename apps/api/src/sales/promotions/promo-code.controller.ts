import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PromoCodeService } from './promo-code.service';
import { CreatePromoCodeDto, UpdatePromoCodeDto, ValidateCodeDto } from './dto/promo-code.dto';

@ApiTags('Promo Codes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('promotions/codes')
export class PromoCodeController {
  constructor(private readonly promoCodeService: PromoCodeService) {}

  @Get()
  @ApiOperation({ summary: 'T-467: Promo kodlar ro\'yxati (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  listCodes(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.promoCodeService.listCodes(tenantId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'T-467: Promo kod detail' })
  @ApiParam({ name: 'id', type: String })
  getCode(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.promoCodeService.getCode(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'T-467: Yangi promo kod yaratish' })
  createCode(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreatePromoCodeDto,
  ) {
    return this.promoCodeService.createCode(tenantId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'T-467: Promo kodni yangilash' })
  @ApiParam({ name: 'id', type: String })
  updateCode(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePromoCodeDto,
  ) {
    return this.promoCodeService.updateCode(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'T-467: Promo kodni o\'chirish (soft delete)' })
  @ApiParam({ name: 'id', type: String })
  deleteCode(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.promoCodeService.deleteCode(tenantId, id);
  }

  @Post('validate')
  @ApiOperation({ summary: 'T-467: Promo kodni tekshirish' })
  validateCode(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: ValidateCodeDto,
  ) {
    return this.promoCodeService.validateCode(tenantId, dto);
  }

  @Post('apply')
  @ApiOperation({ summary: 'T-467: Promo kodni qo\'llash (usageCount++)' })
  applyCode(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: ValidateCodeDto,
  ) {
    return this.promoCodeService.applyCode(tenantId, dto);
  }
}
