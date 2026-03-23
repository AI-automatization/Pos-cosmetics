import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

/**
 * T-140: Real Estate module — routes bo'sh edi, stub endpointlar qo'shildi.
 * Phase 2: real Property/RentalContract schema va service implementatsiyasi.
 * Mobile app safeQueryFn ishlatadi — 200 + bo'sh array qaytaradi.
 */
@ApiTags('RealEstate')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('real-estate')
export class RealestateController {
  @Get('properties')
  @ApiOperation({ summary: 'T-140: Mulklar ro\'yxati (Phase 2 stub)' })
  @ApiQuery({ name: 'branch_id', required: false })
  @ApiQuery({ name: 'status', required: false })
  getProperties(
    @CurrentUser('tenantId') _tenantId: string,
    @Query('branch_id') _branchId?: string,
    @Query('status') _status?: string,
  ) {
    return { items: [], total: 0, page: 1, limit: 20 };
  }

  @Get('stats')
  @ApiOperation({ summary: 'T-140: Ko\'chmas mulk statistikasi (Phase 2 stub)' })
  getStats(@CurrentUser('tenantId') _tenantId: string) {
    return {
      totalProperties: 0,
      activeContracts: 0,
      vacantProperties: 0,
      monthlyRevenue: 0,
      occupancyRate: 0,
      overduePayments: 0,
    };
  }

  @Get('payments')
  @ApiOperation({ summary: 'T-140: Ijara to\'lovlari (Phase 2 stub)' })
  @ApiQuery({ name: 'branch_id', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getRentalPayments(
    @CurrentUser('tenantId') _tenantId: string,
    @Query('branch_id') _branchId?: string,
    @Query('status') _status?: string,
  ) {
    return { items: [], total: 0, page: 1, limit: 20 };
  }

  @Get('all-payments')
  @ApiOperation({ summary: 'T-140: Barcha to\'lovlar (Phase 2 stub)' })
  getAllPayments(@CurrentUser('tenantId') _tenantId: string) {
    return { items: [], total: 0 };
  }
}
