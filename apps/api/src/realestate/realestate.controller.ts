import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RealestateService } from './realestate.service';

@ApiTags('RealEstate')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('real-estate')
export class RealestateController {
  constructor(private readonly service: RealestateService) {}

  @Get('properties')
  @ApiOperation({ summary: 'Mulklar ro\'yxati' })
  @ApiQuery({ name: 'status', required: false, enum: ['RENTED', 'VACANT', 'MAINTENANCE'] })
  getProperties(
    @CurrentUser('tenantId') tenantId: string,
    @Query('status') status?: string,
  ) {
    return this.service.getProperties(tenantId, { status });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Ko\'chmas mulk statistikasi' })
  getStats(@CurrentUser('tenantId') tenantId: string) {
    return this.service.getStats(tenantId);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Ijara to\'lovlari' })
  @ApiQuery({ name: 'status', required: false, enum: ['PAID', 'PENDING', 'OVERDUE'] })
  @ApiQuery({ name: 'propertyId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getPayments(
    @CurrentUser('tenantId') tenantId: string,
    @Query('status') status?: string,
    @Query('propertyId') propertyId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.getPayments(tenantId, { status, propertyId, page, limit });
  }

  @Get('rental-payments')
  @ApiOperation({ summary: 'Ijara to\'lovlari (alias /payments)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'propertyId', required: false })
  getRentalPayments(
    @CurrentUser('tenantId') tenantId: string,
    @Query('status') status?: string,
    @Query('propertyId') propertyId?: string,
  ) {
    return this.service.getPayments(tenantId, { status, propertyId });
  }
}
