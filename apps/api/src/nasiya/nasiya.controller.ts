import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { NasiyaService } from './nasiya.service';
import { CreateDebtDto, RecordDebtPaymentDto } from './dto/nasiya.dto';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DebtStatus } from '@prisma/client';

@ApiTags('Nasiya (Debt)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('nasiya')
export class NasiyaController {
  constructor(private readonly nasiyaService: NasiyaService) {}

  @Post()
  @ApiOperation({ summary: 'Create debt record (nasiya)' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateDebtDto,
  ) {
    return this.nasiyaService.createDebt(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List debt records' })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: DebtStatus })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: DebtStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.nasiyaService.getDebts(tenantId, { customerId, status, page, limit });
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue debts (due date passed)' })
  getOverdue(@CurrentUser('tenantId') tenantId: string) {
    return this.nasiyaService.getOverdueDebts(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get debt record by ID' })
  @ApiParam({ name: 'id', type: String })
  findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.nasiyaService.getDebtById(tenantId, id);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Record debt payment' })
  @ApiParam({ name: 'id', type: String })
  pay(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RecordDebtPaymentDto,
  ) {
    return this.nasiyaService.recordPayment(tenantId, id, dto);
  }

  @Get('customer/:customerId/summary')
  @ApiOperation({ summary: 'Get total debt summary for a customer' })
  @ApiParam({ name: 'customerId', type: String })
  getCustomerSummary(
    @CurrentUser('tenantId') tenantId: string,
    @Param('customerId', ParseUUIDPipe) customerId: string,
  ) {
    return this.nasiyaService.getCustomerDebtSummary(tenantId, customerId);
  }
}
