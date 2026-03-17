import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto, UpdatePromotionDto, ApplyPromotionDto } from './dto/promotion.dto';

@ApiTags('Promotions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  @ApiOperation({ summary: 'T-099: Barcha aksiyalar ro\'yxati' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  getAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.promotionsService.getPromotions(tenantId, activeOnly === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'T-099: Aksiya detail' })
  @ApiParam({ name: 'id', type: String })
  getOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.promotionsService.getPromotion(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'T-099: Yangi aksiya yaratish' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreatePromotionDto,
  ) {
    return this.promotionsService.createPromotion(tenantId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'T-099: Aksiya tahrirlash' })
  @ApiParam({ name: 'id', type: String })
  update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePromotionDto,
  ) {
    return this.promotionsService.updatePromotion(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'T-099: Aksiyani o\'chirish' })
  @ApiParam({ name: 'id', type: String })
  remove(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.promotionsService.deletePromotion(tenantId, id);
  }

  @Post('apply')
  @ApiOperation({
    summary: 'T-099: Cart ga mos aksiyalarni topib discount hisoblash',
    description: 'POS da order yaratishdan oldin chaqiriladi',
  })
  apply(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: ApplyPromotionDto,
  ) {
    return this.promotionsService.applyPromotions(tenantId, dto);
  }
}
